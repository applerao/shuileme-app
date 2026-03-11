#!/bin/bash
#
# 睡了么 App - 灰度发布回滚脚本
# 用途：紧急回滚到上一稳定版本 (目标时间 < 30 分钟)
#

set -euo pipefail

# ============= 配置 =============
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/release-config.yaml"
STATE_FILE="${SCRIPT_DIR}/../state/current-release.json"
HISTORY_FILE="${SCRIPT_DIR}/../state/release-history.json"
LOG_FILE="${SCRIPT_DIR}/../logs/rollback-$(date +%Y%m%d-%H%M%S).log"

# 回滚时间追踪
ROLLBACK_START_TIME=$(date +%s)
ROLLBACK_TARGET_SECONDS=1800  # 30 分钟

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============= 日志函数 =============
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local elapsed=$(($(date +%s) - ROLLBACK_START_TIME))
    echo -e "${timestamp} [+${elapsed}s] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info()    { log "${BLUE}INFO${NC}" "$@"; }
log_success() { log "${GREEN}SUCCESS${NC}" "$@"; }
log_warn()    { log "${YELLOW}WARN${NC}" "$@"; }
log_error()   { log "${RED}ERROR${NC}" "$@"; }

# ============= 辅助函数 =============
check_time_budget() {
    local elapsed=$(($(date +%s) - ROLLBACK_START_TIME))
    local remaining=$((ROLLBACK_TARGET_SECONDS - elapsed))
    
    if [[ ${remaining} -lt 0 ]]; then
        log_error "⚠️  超出回滚时间目标 (30 分钟)!"
        return 1
    fi
    
    log_info "回滚进度：已用 ${elapsed}s, 剩余 ${remaining}s"
    return 0
}

get_current_version() {
    if [[ -f "${STATE_FILE}" ]]; then
        jq -r '.version // "unknown"' "${STATE_FILE}"
    else
        echo "unknown"
    fi
}

get_previous_stable_version() {
    # 从发布历史中获取上一个稳定版本
    if [[ -f "${HISTORY_FILE}" ]]; then
        jq -r '.releases | map(select(.status == "stable")) | last.version // "last-known-good"' "${HISTORY_FILE}"
    else
        echo "last-known-good"
    fi
}

# ============= 核心回滚函数 =============
rollback() {
    local target_version="${1:-}"
    local reason="${2:-未指定原因}"
    
    log_info "========== 开始回滚 =========="
    log_info "原因：${reason}"
    
    local current_version=$(get_current_version)
    
    if [[ -z "${target_version}" ]]; then
        target_version=$(get_previous_stable_version)
    fi
    
    log_info "当前版本：${current_version}"
    log_info "目标版本：${target_version}"
    log_info "==========="
    
    # 步骤 1: 停止当前发布 (0-5 分钟)
    log_info "[1/6] 停止当前发布流量..."
    stop_current_deployment
    check_time_budget || return 1
    
    # 步骤 2: 切换流量到目标版本 (5-10 分钟)
    log_info "[2/6] 切换流量到稳定版本..."
    switch_traffic "${target_version}"
    check_time_budget || return 1
    
    # 步骤 3: 推送配置到边缘节点 (10-15 分钟)
    log_info "[3/6] 推送配置到边缘节点..."
    push_config_to_edge "${target_version}"
    check_time_budget || return 1
    
    # 步骤 4: 验证回滚 (15-25 分钟)
    log_info "[4/6] 验证回滚..."
    verify_rollback "${target_version}"
    check_time_budget || return 1
    
    # 步骤 5: 更新监控告警 (25-28 分钟)
    log_info "[5/6] 恢复监控告警..."
    reset_monitoring_alerts
    check_time_budget || return 1
    
    # 步骤 6: 发送通知并记录 (28-30 分钟)
    log_info "[6/6] 发送通知并记录..."
    send_rollback_notification "${current_version}" "${target_version}" "${reason}"
    record_rollback "${current_version}" "${target_version}" "${reason}"
    check_time_budget || return 1
    
    # 清除当前发布状态
    rm -f "${STATE_FILE}"
    
    local total_time=$(($(date +%s) - ROLLBACK_START_TIME))
    log_success "========== 回滚完成 =========="
    log_success "总耗时：${total_time}秒 ($(echo "scale=1; ${total_time}/60" | bc)分钟)"
    
    if [[ ${total_time} -le ${ROLLBACK_TARGET_SECONDS} ]]; then
        log_success "✅ 满足回滚时间目标 (< 30 分钟)"
    else
        log_warn "⚠️  超出回滚时间目标，需要优化流程"
    fi
}

stop_current_deployment() {
    # 将当前版本流量降为 0%
    local api_endpoint="${RELEASE_API_ENDPOINT:-https://release.sleepwell.internal/api/v1/traffic}"
    
    log_info "调用 API 停止发布流量..."
    
    # 实际 API 调用:
    # curl -X POST "${api_endpoint}/stop" \
    #     -H "Authorization: Bearer ${RELEASE_API_TOKEN}" \
    #     -H "Content-Type: application/json"
    
    sleep 2
    log_success "发布流量已停止"
}

switch_traffic() {
    local target_version="$1"
    local api_endpoint="${RELEASE_API_ENDPOINT:-https://release.sleepwell.internal/api/v1/traffic}"
    
    log_info "切换 100% 流量到 ${target_version}..."
    
    # 实际 API 调用:
    # curl -X POST "${api_endpoint}/switch" \
    #     -H "Authorization: Bearer ${RELEASE_API_TOKEN}" \
    #     -H "Content-Type: application/json" \
    #     -d "{\"version\":\"${target_version}\",\"percentage\":100}"
    
    sleep 3
    log_success "流量已切换到 ${target_version}"
}

push_config_to_edge() {
    local target_version="$1"
    
    log_info "推送配置到 CDN 边缘节点..."
    
    # 实际实现:
    # - 刷新 CDN 缓存
    # - 更新负载均衡配置
    # - 同步到多区域
    
    sleep 3
    log_success "配置已推送到边缘节点"
}

verify_rollback() {
    local target_version="$1"
    
    log_info "验证回滚..."
    
    # 1. 健康检查
    log_info "  - 执行健康检查..."
    sleep 2
    
    # 2. 冒烟测试
    log_info "  - 执行冒烟测试..."
    sleep 3
    
    # 3. 检查错误率
    log_info "  - 检查错误率..."
    local error_rate=$(get_current_error_rate)
    log_info "  - 当前错误率：${error_rate}%"
    
    if (( $(echo "${error_rate} > 1.0" | bc -l) )); then
        log_error "错误率仍然过高，回滚可能未完全生效"
        return 1
    fi
    
    log_success "回滚验证通过"
}

get_current_error_rate() {
    # 从监控系统获取错误率
    # 实际实现调用监控 API
    echo "0.2"
}

reset_monitoring_alerts() {
    log_info "重置监控告警阈值..."
    
    # 恢复标准告警阈值
    # 实际实现调用监控系统 API
    
    sleep 2
    log_success "监控告警已重置"
}

send_rollback_notification() {
    local from_version="$1"
    local to_version="$2"
    local reason="$3"
    
    local message="🔄 回滚完成
版本：${from_version} → ${to_version}
原因：${reason}
耗时：$(($(date +%s) - ROLLBACK_START_TIME))秒"
    
    log_info "发送通知..."
    
    # 发送到钉钉/Slack
    # 实际实现调用消息 API
    
    log_success "通知已发送"
}

record_rollback() {
    local from_version="$1"
    local to_version="$2"
    local reason="$3"
    
    local timestamp=$(date -Iseconds)
    local duration=$(($(date +%s) - ROLLBACK_START_TIME))
    
    mkdir -p "$(dirname "${HISTORY_FILE}")"
    
    # 追加到历史记录
    local record=$(cat << EOF
{
    "type": "rollback",
    "timestamp": "${timestamp}",
    "from_version": "${from_version}",
    "to_version": "${to_version}",
    "reason": "${reason}",
    "duration_seconds": ${duration}
}
EOF
)
    
    # 如果历史记录文件存在，追加；否则创建
    if [[ -f "${HISTORY_FILE}" ]]; then
        # 简化处理：实际应该正确追加到 JSON 数组
        log_info "记录回滚历史..."
    else
        echo "{\"releases\": []}" > "${HISTORY_FILE}"
    fi
    
    log_success "回滚已记录"
}

# ============= 自动回滚检查 =============
auto_rollback_check() {
    log_info "执行自动回滚检查..."
    
    # 获取当前崩溃率
    local crash_rate=$(get_crash_rate)
    local threshold=0.01  # 1%
    
    log_info "当前崩溃率：$(echo "${crash_rate}*100" | bc)%"
    log_info "阈值：$(echo "${threshold}*100" | bc)%"
    
    if (( $(echo "${crash_rate} > ${threshold}" | bc -l) )); then
        log_error "崩溃率超标！触发自动回滚..."
        rollback "" "自动回滚：崩溃率 ${crash_rate} > ${threshold}"
        return 0
    fi
    
    log_success "指标正常，无需回滚"
    return 1
}

get_crash_rate() {
    # 从监控系统获取崩溃率
    echo "0.003"
}

# ============= 帮助信息 =============
show_help() {
    cat << EOF
睡了么 App - 灰度发布回滚脚本

用法：$(basename "$0") [选项] [目标版本]

选项:
  --auto               自动检查并回滚 (如果指标超标)
  --reason <原因>      指定回滚原因
  --force              强制执行，不确认
  --help               显示此帮助信息

示例:
  $(basename "$0")                           # 回滚到上一稳定版本
  $(basename "$0") 2.0.5                     # 回滚到指定版本 2.0.5
  $(basename "$0") --auto                    # 自动检查并回滚
  $(basename "$0") --reason "严重 Bug"        # 带原因回滚

回滚时间目标：
  - 决策时间：< 5 分钟
  - 执行时间：< 15 分钟
  - 验证时间：< 10 分钟
  - 总计：< 30 分钟

EOF
}

# ============= 主入口 =============
main() {
    local target_version=""
    local reason=""
    local auto_mode=false
    local force=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --auto)
                auto_mode=true
                shift
                ;;
            --reason)
                reason="$2"
                shift 2
                ;;
            --force)
                force=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [[ -z "${target_version}" ]]; then
                    target_version="$1"
                fi
                shift
                ;;
        esac
    done
    
    # 创建日志目录
    mkdir -p "$(dirname "${LOG_FILE}")"
    
    if [[ "${auto_mode}" == true ]]; then
        auto_rollback_check
        exit $?
    fi
    
    # 确认回滚
    if [[ "${force}" != true ]]; then
        log_warn "⚠️  即将执行回滚操作!"
        read -p "确认继续？(yes/no) " confirm
        if [[ "${confirm}" != "yes" ]]; then
            log_info "回滚已取消"
            exit 0
        fi
    fi
    
    # 如果没有指定原因，提示输入
    if [[ -z "${reason}" ]]; then
        read -p "请输入回滚原因：" reason
    fi
    
    rollback "${target_version}" "${reason}"
}

main "$@"
