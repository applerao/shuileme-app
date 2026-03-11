#!/bin/bash
#
# 睡了么 App 性能监控系统 - 健康检查脚本
# 用法：./health-check.sh
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 服务列表
declare -A SERVICES=(
    ["prometheus"]=9090
    ["grafana"]=3000
    ["alertmanager"]=9093
    ["elasticsearch"]=9200
    ["node-exporter"]=9100
    ["blackbox-exporter"]=9115
)

# 统计
TOTAL=0
HEALTHY=0
UNHEALTHY=0

check_service() {
    local name=$1
    local port=$2
    TOTAL=$((TOTAL + 1))
    
    # HTTP 健康检查
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost:${port}" 2>/dev/null || echo "000")
    
    if [[ "$http_code" == "200" || "$http_code" == "302" || "$http_code" == "304" ]]; then
        echo -e "${GREEN}✓${NC} ${name} (端口 ${port}) - 正常 [HTTP ${http_code}]"
        HEALTHY=$((HEALTHY + 1))
        return 0
    else
        echo -e "${RED}✗${NC} ${name} (端口 ${port}) - 异常 [HTTP ${http_code}]"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
}

check_docker_containers() {
    echo ""
    echo -e "${BLUE}=== Docker 容器状态 ===${NC}"
    
    local containers=("prometheus" "grafana" "alertmanager" "elasticsearch" "logstash" "filebeat" "node-exporter" "blackbox-exporter")
    
    for container in "${containers[@]}"; do
        local status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || echo "not_found")
        
        if [ "$status" == "running" ]; then
            echo -e "${GREEN}✓${NC} ${container} - 运行中"
        elif [ "$status" == "exited" ]; then
            echo -e "${RED}✗${NC} ${container} - 已停止"
        elif [ "$status" == "not_found" ]; then
            echo -e "${YELLOW}⚠${NC} ${container} - 未找到"
        else
            echo -e "${YELLOW}⚠${NC} ${container} - ${status}"
        fi
    done
}

check_disk_space() {
    echo ""
    echo -e "${BLUE}=== 磁盘空间 ===${NC}"
    
    local usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    
    if [ "$usage" -lt 80 ]; then
        echo -e "${GREEN}✓${NC} 磁盘使用率：${usage}%"
    elif [ "$usage" -lt 90 ]; then
        echo -e "${YELLOW}⚠${NC} 磁盘使用率：${usage}% (警告)"
    else
        echo -e "${RED}✗${NC} 磁盘使用率：${usage}% (严重)"
    fi
}

check_memory() {
    echo ""
    echo -e "${BLUE}=== 内存使用 ===${NC}"
    
    local mem_info=$(free -m | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$mem_info" -lt 80 ]; then
        echo -e "${GREEN}✓${NC} 内存使用率：${mem_info}%"
    elif [ "$mem_info" -lt 90 ]; then
        echo -e "${YELLOW}⚠${NC} 内存使用率：${mem_info}% (警告)"
    else
        echo -e "${RED}✗${NC} 内存使用率：${mem_info}% (严重)"
    fi
}

check_prometheus_targets() {
    echo ""
    echo -e "${BLUE}=== Prometheus 抓取目标 ===${NC}"
    
    local targets_status=$(curl -s "http://localhost:9090/api/v1/targets" 2>/dev/null | jq -r '.data.activeTargets[].health' 2>/dev/null || echo "error")
    
    local up_count=$(echo "$targets_status" | grep -c "up" || echo "0")
    local down_count=$(echo "$targets_status" | grep -c "down" || echo "0")
    
    if [ "$down_count" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} 所有抓取目标正常 (${up_count} 个)"
    else
        echo -e "${RED}✗${NC} ${down_count} 个抓取目标异常 (${up_count} 个正常)"
    fi
}

check_elasticsearch_cluster() {
    echo ""
    echo -e "${BLUE}=== Elasticsearch 集群状态 ===${NC}"
    
    local health=$(curl -s "http://localhost:9200/_cluster/health" 2>/dev/null | jq -r '.status' 2>/dev/null || echo "error")
    
    case "$health" in
        "green")
            echo -e "${GREEN}✓${NC} 集群状态：green"
            ;;
        "yellow")
            echo -e "${YELLOW}⚠${NC} 集群状态：yellow (警告)"
            ;;
        "red")
            echo -e "${RED}✗${NC} 集群状态：red (严重)"
            ;;
        *)
            echo -e "${RED}✗${NC} 无法获取集群状态"
            ;;
    esac
}

check_alertmanager() {
    echo ""
    echo -e "${BLUE}=== Alertmanager 告警状态 ===${NC}"
    
    local alerts=$(curl -s "http://localhost:9093/api/v1/alerts" 2>/dev/null | jq -r '.data[].status.state' 2>/dev/null || echo "error")
    
    local firing_count=$(echo "$alerts" | grep -c "firing" || echo "0")
    local pending_count=$(echo "$alerts" | grep -c "pending" || echo "0")
    
    if [ "$firing_count" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} 当前无活跃告警"
    else
        echo -e "${RED}✗${NC} ${firing_count} 个告警正在触发，${pending_count} 个待处理"
    fi
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "  睡了么 App 性能监控系统 - 健康检查"
    echo "  时间：$(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================"
    echo ""
    
    echo -e "${BLUE}=== 服务端口检查 ===${NC}"
    for service in "${!SERVICES[@]}"; do
        check_service "$service" "${SERVICES[$service]}"
    done
    
    check_docker_containers
    check_disk_space
    check_memory
    check_prometheus_targets
    check_elasticsearch_cluster
    check_alertmanager
    
    echo ""
    echo "========================================"
    echo "  健康检查汇总"
    echo "========================================"
    echo "  总服务数：${TOTAL}"
    echo -e "  健康：${GREEN}${HEALTHY}${NC}"
    echo -e "  异常：${RED}${UNHEALTHY}${NC}"
    echo "========================================"
    
    if [ "$UNHEALTHY" -gt 0 ]; then
        echo ""
        echo -e "${RED}⚠ 部分服务异常，请检查日志!${NC}"
        echo "  查看日志：docker-compose logs -f [service_name]"
        exit 1
    else
        echo ""
        echo -e "${GREEN}✓ 所有服务运行正常!${NC}"
        exit 0
    fi
}

main "$@"
