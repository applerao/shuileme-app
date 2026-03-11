#!/bin/bash
#
# 睡了么 App 性能监控系统 - 备份脚本
# 用法：./backup.sh [full|incremental]
#

set -e

# 配置
BACKUP_DIR="${BACKUP_DIR:-/data/backups/monitoring}"
RETENTION_DAYS=${RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE=${1:-full}

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
    exit 1
}

# 创建备份目录
mkdir -p "${BACKUP_DIR}"/{prometheus,grafana,alertmanager,elasticsearch,configs}

log "开始备份 - 类型：${BACKUP_TYPE}"

# ==================== Prometheus 数据备份 ====================
backup_prometheus() {
    log "备份 Prometheus 数据..."
    
    # 创建快照 (通过 Admin API)
    curl -XPOST http://localhost:9090/api/v1/admin/tsdb/snapshot
    
    # 找到最新快照
    LATEST_SNAPSHOT=$(ls -t /var/lib/docker/volumes/monitoring_prometheus_data/_data/snapshots/ | head -1)
    
    if [ -n "$LATEST_SNAPSHOT" ]; then
        cp -r "/var/lib/docker/volumes/monitoring_prometheus_data/_data/snapshots/${LATEST_SNAPSHOT}" \
            "${BACKUP_DIR}/prometheus/snapshot_${TIMESTAMP}"
        success "Prometheus 快照备份完成"
    else
        # 直接备份数据目录
        docker cp prometheus:/prometheus "${BACKUP_DIR}/prometheus/data_${TIMESTAMP}"
        success "Prometheus 数据备份完成"
    fi
}

# ==================== Grafana 备份 ====================
backup_grafana() {
    log "备份 Grafana 配置..."
    
    # 备份数据库
    docker cp grafana:/var/lib/grafana/grafana.db "${BACKUP_DIR}/grafana/grafana_${TIMESTAMP}.db"
    
    # 备份 Dashboard
    docker cp grafana:/var/lib/grafana/dashboards "${BACKUP_DIR}/grafana/dashboards_${TIMESTAMP}"
    
    success "Grafana 备份完成"
}

# ==================== Alertmanager 备份 ====================
backup_alertmanager() {
    log "备份 Alertmanager 状态..."
    
    docker cp alertmanager:/alertmanager "${BACKUP_DIR}/alertmanager/data_${TIMESTAMP}"
    
    success "Alertmanager 备份完成"
}

# ==================== Elasticsearch 备份 ====================
backup_elasticsearch() {
    log "备份 Elasticsearch 索引..."
    
    # 创建快照仓库
    curl -X PUT "localhost:9200/_snapshot/backup_repository" -H 'Content-Type: application/json' -d'
    {
        "type": "fs",
        "settings": {
            "location": "/usr/share/elasticsearch/backups"
        }
    }' 2>/dev/null || true
    
    # 创建快照
    curl -X PUT "localhost:9200/_snapshot/backup_repository/snapshot_${TIMESTAMP}?wait_for_completion=true" \
        -H 'Content-Type: application/json' -d'
    {
        "indices": "slept-*",
        "ignore_unavailable": true,
        "include_global_state": false
    }'
    
    success "Elasticsearch 快照创建完成"
}

# ==================== 配置文件备份 ====================
backup_configs() {
    log "备份配置文件..."
    
    CONFIG_BACKUP_DIR="${BACKUP_DIR}/configs/${TIMESTAMP}"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    # 备份所有配置文件
    cp -r "${PROJECT_DIR:-.}"/prometheus "$CONFIG_BACKUP_DIR/"
    cp -r "${PROJECT_DIR:-.}"/grafana "$CONFIG_BACKUP_DIR/"
    cp -r "${PROJECT_DIR:-.}"/alertmanager "$CONFIG_BACKUP_DIR/"
    cp -r "${PROJECT_DIR:-.}"/elasticsearch "$CONFIG_BACKUP_DIR/"
    cp -r "${PROJECT_DIR:-.}"/logstash "$CONFIG_BACKUP_DIR/"
    cp -r "${PROJECT_DIR:-.}"/filebeat "$CONFIG_BACKUP_DIR/"
    cp "${PROJECT_DIR:-.}"/docker-compose.yml "$CONFIG_BACKUP_DIR/"
    cp "${PROJECT_DIR:-.}"/.env "$CONFIG_BACKUP_DIR/" 2>/dev/null || true
    
    success "配置文件备份完成"
}

# ==================== 清理旧备份 ====================
cleanup_old_backups() {
    log "清理 ${RETENTION_DAYS} 天前的旧备份..."
    
    find "${BACKUP_DIR}" -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \; 2>/dev/null || true
    find "${BACKUP_DIR}" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    
    success "旧备份清理完成"
}

# ==================== 主流程 ====================
main() {
    case "$BACKUP_TYPE" in
        full)
            backup_prometheus
            backup_grafana
            backup_alertmanager
            backup_elasticsearch
            backup_configs
            ;;
        incremental)
            backup_prometheus
            backup_grafana
            backup_alertmanager
            ;;
        *)
            error "未知的备份类型：${BACKUP_TYPE}"
            ;;
    esac
    
    cleanup_old_backups
    
    echo ""
    success "备份完成！备份位置：${BACKUP_DIR}"
    echo ""
}

main
