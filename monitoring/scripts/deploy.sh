#!/bin/bash
#
# 睡了么 App 性能监控系统 - 部署脚本
# 用法：./deploy.sh [dev|prod]
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
ENV=${1:-dev}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="${PROJECT_DIR}/deploy.log"

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# 检查前置条件
check_prerequisites() {
    log "检查前置条件..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose 未安装"
    fi
    
    # 检查内存 (至少 4GB)
    TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MIN_MEM=4194304  # 4GB in KB
    if [ "$TOTAL_MEM" -lt "$MIN_MEM" ]; then
        warning "系统内存小于 4GB，可能影响性能"
    fi
    
    # 检查磁盘空间 (至少 20GB)
    AVAILABLE_DISK=$(df -P "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    MIN_DISK=20971520  # 20GB in KB
    if [ "$AVAILABLE_DISK" -lt "$MIN_DISK" ]; then
        warning "可用磁盘空间小于 20GB"
    fi
    
    success "前置条件检查通过"
}

# 创建必要目录
create_directories() {
    log "创建必要目录..."
    
    mkdir -p "${PROJECT_DIR}"/{prometheus/rules,prometheus/targets,grafana/dashboards,alertmanager/templates}
    mkdir -p "${PROJECT_DIR}"/{elasticsearch,logstash/pipeline,filebeat,blackbox}
    mkdir -p "${PROJECT_DIR}/data"/{prometheus,grafana,alertmanager,elasticsearch}
    
    success "目录创建完成"
}

# 生成配置文件
generate_configs() {
    log "生成配置文件..."
    
    # 生成环境配置文件
    cat > "${PROJECT_DIR}/.env" << EOF
# 睡了么监控系统环境变量
# 自动生成 - 请根据实际情况修改

# 钉钉配置
DINGTALK_ACCESS_TOKEN=${DINGTALK_ACCESS_TOKEN:-your_dingtalk_token}
DINGTALK_API_ACCESS_TOKEN=${DINGTALK_API_ACCESS_TOKEN:-your_api_token}
DINGTALK_DBA_TOKEN=${DINGTALK_DBA_TOKEN:-your_dba_token}
DINGTALK_MOBILE_TOKEN=${DINGTALK_MOBILE_TOKEN:-your_mobile_token}

# SMTP 配置
SMTP_PASSWORD=${SMTP_PASSWORD:-your_smtp_password}

# 环境标识
MONITOR_ENV=${ENV}
EOF
    
    chmod 600 "${PROJECT_DIR}/.env"
    success "配置文件生成完成"
}

# 配置 Blackbox Exporter
setup_blackbox() {
    log "配置 Blackbox Exporter..."
    
    cat > "${PROJECT_DIR}/blackbox/blackbox.yml" << EOF
modules:
  http_2xx:
    prober: http
    timeout: 10s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200, 201, 202, 204, 301, 302, 303, 307, 308]
      method: GET
      follow_redirects: true
      preferred_ip_protocol: "ip4"
      ip_protocol_fallback: false
  
  http_post_2xx:
    prober: http
    timeout: 10s
    http:
      method: POST
      valid_status_codes: [200, 201, 202, 204]
  
  tcp_connect:
    prober: tcp
    timeout: 10s
  
  icmp:
    prober: icmp
    timeout: 10s
    icmp:
      preferred_ip_protocol: "ip4"
EOF
    
    success "Blackbox 配置完成"
}

# 配置 Grafana Dashboard
setup_grafana() {
    log "配置 Grafana Dashboard..."
    
    # 数据源配置
    cat > "${PROJECT_DIR}/grafana/provisioning/datasources.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: "slept-logs-*"
    basicAuth: false
    jsonData:
      timeField: "@timestamp"
      esVersion: "8.11.0"
      logMessageField: message
      logLevelField: log_level
    editable: false

  - name: Alertmanager
    type: alertmanager
    access: proxy
    url: http://alertmanager:9093
    jsonData:
      implementation: prometheus
    editable: false
EOF
    
    # Dashboard 配置
    cat > "${PROJECT_DIR}/grafana/provisioning/dashboards.yml" << EOF
apiVersion: 1

providers:
  - name: 'SleptApp Dashboards'
    orgId: 1
    folder: 'SleptApp'
    folderUid: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF
    
    success "Grafana 配置完成"
}

# 启动服务
start_services() {
    log "启动监控服务..."
    
    cd "$PROJECT_DIR"
    
    # 停止旧服务
    docker-compose down 2>/dev/null || true
    
    # 启动服务
    docker-compose up -d
    
    # 等待服务就绪
    log "等待服务启动..."
    sleep 30
    
    success "服务启动完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    local services=("prometheus:9090" "grafana:3000" "alertmanager:9093" "elasticsearch:9200")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        local name="${service%%:*}"
        local port="${service##*:}"
        
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}" | grep -q "200\|302"; then
            success "$name 运行正常"
        else
            error "$name 启动失败"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        success "所有服务健康检查通过"
    else
        warning "部分服务启动失败，请检查日志"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "========================================"
    echo "  睡了么 App 性能监控系统部署完成!"
    echo "========================================"
    echo ""
    echo "访问地址:"
    echo "  📊 Grafana:      http://localhost:3000 (admin/admin123)"
    echo "  📈 Prometheus:   http://localhost:9090"
    echo "  🔔 Alertmanager: http://localhost:9093"
    echo "  🔍 Kibana:       http://localhost:5601"
    echo ""
    echo "下一步:"
    echo "  1. 修改 .env 文件中的钉钉和 SMTP 配置"
    echo "  2. 在 Grafana 中导入 Dashboard"
    echo "  3. 配置应用服务的监控指标暴露"
    echo "  4. 配置 Filebeat 采集日志路径"
    echo ""
    echo "常用命令:"
    echo "  docker-compose ps          # 查看服务状态"
    echo "  docker-compose logs -f     # 查看日志"
    echo "  docker-compose restart     # 重启服务"
    echo "  docker-compose down        # 停止服务"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "  睡了么 App 性能监控系统 - 部署脚本"
    echo "  环境：${ENV}"
    echo "========================================"
    echo ""
    
    check_prerequisites
    create_directories
    generate_configs
    setup_blackbox
    setup_grafana
    start_services
    health_check
    show_access_info
    
    success "部署完成!"
}

# 执行
main "$@"
