#!/bin/bash
#
# 睡了么 App - 灰度发布部署脚本
# 用途：管理灰度发布的各个阶段 (5% → 20% → 50% → 100%)
#

set -euo pipefail

# ============= 配置 =============
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/release-config.yaml"
LOG_FILE="${SCRIPT_DIR}/../logs/deploy-$(date +%Y%m%d-%H%M%S).log"
STATE_FILE="${SCRIPT_DIR}/../state/current-release.json"

# 阶段配置
declare -A PHASE_PERCENTAGES=(
    ["phase1"]=5
    ["phase2"]=20
    ["phase3"]=50
    ["phase4"]=100
)

declare -A PHASE_THRESHOLDS=(
    ["phase1"]=0.005   # 0.5%
    ["phase2"]=0.008   # 0.8%
    ["phase3"]=0.010   # 1.0%
    ["phase4"]=0.010   # 1.0%
)

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============= 日志函数 =============
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info()    { log "${BLUE}INFO${NC}" "$@"; }
log_success() { log "${GREEN}SUCCESS${NC}" "$@"; }
log_warn()    { log "${YELLOW}WARN${NC}" "$@"; }
log_error()   { log "${RED}ERROR${NC}" "$@"; }

# ============= 辅助函数 =============
check_prerequisites() {
    log_info "检查前置条件..."
    
    # 检查配置文件
    if [[ ! -f "${CONFIG_FILE}" ]]; then
        log_error "配置文件不存在：${CONFIG_FILE}"
        exit 1
    fi
    
    # 检查必要命令
    for cmd in curl jq; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "缺少必要命令：$cmd"
            exit 1
        fi
    done
    
    log_success "前置检查通过"
}

get_current_phase() {
    if [[ -f "${STATE_FILE}" ]]; then
        jq -r '.current_phase // "none"' "${STATE_FILE}"
    else
        echo "none"
    fi
}

get_current_version() {
    if [[ -f "${STATE_FILE}" ]]; then
        jq -r '.version // "unknown"' "${STATE_FILE}"
    else
        echo "unknown"
    fi
}

save_state() {
    local version="$1"
    local phase="$2"
    local percentage="$3"
    local timestamp=$(date -Iseconds)
    
    mkdir -p "$(dirname "${STATE_FILE}")"
    
    cat > "${STATE_FILE}" << EOF
{
    "version": "${version}",
    "current_phase": "${phase}",
    "traffic_percentage": ${percentage},
    "started_at": "${timestamp}",
    "last_updated": "${timestamp}"
}
EOF
    
    log_info "状态已保存：版本=${version}, 阶段=${phase}, 流量=${percentage}%"
}

# ============= 核心函数 =============
deploy_phase() {
    local version="$1"
    local phase="$2"
    local percentage="${PHASE_PERCENTAGES[$phase]}"
    
    log_info "开始部署 ${version} - ${phase} (${percentage}%)"
    
    # 1. 更新发布配置
    log_info "更新流量分配配置..."
    update_traffic_config "${version}" "${percentage}"
    
    # 2. 推送配置到 CDN/网关
    log_info "推送配置到边缘节点..."
    push_config_to_edge "${version}" "${phase}"
    
    # 3. 更新监控告警阈值
    log_info "更新监控阈值..."
    update_monitoring_thresholds "${phase}"
    
    # 4. 保存状态
    save_state "${version}" "${phase}" "${percentage}"
    
    # 5. 发送通知
    log_info "发送发布通知..."
    send_release_notification "${version}" "${phase}" "${percentage}"
    
    log_success "阶段部署完成：${phase} (${percentage}%)"
}

update_traffic_config() {
    local version="$1"
    local percentage="$2"
    
    # 调用发布管理 API
    local api_endpoint="${RELEASE_API_ENDPOINT:-https://release.sleepwell.internal/api/v1/traffic}"
    
    # 模拟 API 调用 (实际使用时替换为真实 API)
    log_info "调用 API: ${api_endpoint}"
    log_info "配置：version=${version}, percentage=${percentage}"
    
    # 实际 API 调用示例:
    # curl -X POST "${api_endpoint}" \
    #     -H "Authorization: Bearer ${RELEASE_API_TOKEN}" \
    #     -H "Content-Type: application/json" \
    #     -d "{\"version\":\"${version}\",\"percentage\":${percentage}}"
    
    sleep 2  # 模拟 API 延迟
}

push_config_to_edge() {
    local version="$1"
    local phase="$2"
    
    # 推送配置到 CDN 边缘节点
    log_info "推送到边缘节点..."
    
    # 实际实现可能包括:
    # - 刷新 CDN 缓存
    # - 更新负载均衡配置
    # - 同步到多个区域
    
    sleep 3  # 模拟推送延迟
}

update_monitoring_thresholds() {
    local phase="$1"
    local threshold="${PHASE_THRESHOLDS[$phase]}"
    
    log_info "设置崩溃率阈值：${threshold} ($(echo "${threshold}*100" | bc)%)"
    
    # 更新监控系统的告警阈值
    # 实际实现可能调用 Grafana/Prometheus API
}

send_release_notification() {
    local version="$1"
    local phase="$2"
    local percentage="$3"
    
    local message="🚀 发布了么 App ${version} 已进入 ${phase} (${percentage}% 流量)"
    
    log_info "发送通知：${message}"
    
    # 发送到钉钉/Slack 等
    # 实际实现调用消息 API
}

# ============= 检查函数 =============
check_metrics() {
    local phase="$1"
    local threshold="${PHASE_THRESHOLDS[$phase]}"
    
    log_info "检查当前指标..."
    
    # 获取当前崩溃率 (模拟)
    local current_crash_rate=$(get_crash_rate)
    
    log_info "当前崩溃率：$(echo "${current_crash_rate}*100" | bc)%"
    log_info "阈值：$(echo "${threshold}*100" | bc)%"
    
    if (( $(echo "${current_crash_rate} > ${threshold}" | bc -l) )); then
        log_error "崩溃率超标！当前=${current_crash_rate}, 阈值=${threshold}"
        return 1
    fi
    
    log_success "指标检查通过"
    return 0
}

get_crash_rate() {
    # 从监控系统获取崩溃率
    # 实际实现调用监控 API
    # 这里返回模拟值
    echo "0.003"
}

# ============= 主命令 =============
cmd_start() {
    local version="$1"
    
    if [[ -z "${version}" ]]; then
        log_error "请指定版本号，例如：$0 start 2.1.0"
        exit 1
    fi
    
    check_prerequisites
    
    local current_phase=$(get_current_phase)
    if [[ "${current_phase}" != "none" ]]; then
        log_warn "已有进行中的发布：版本=$(get_current_version), 阶段=${current_phase}"
        read -p "是否继续？(y/N) " confirm
        if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
            log_info "取消操作"
            exit 0
        fi
    fi
    
    log_info "========== 开始灰度发布 =========="
    log_info "版本：${version}"
    log_info "==========="
    
    deploy_phase "${version}" "phase1"
    
    log_success "========== Phase 1 部署完成 =========="
    log_info "观察期：2-3 天"
    log_info "使用 '$0 check' 查看状态"
    log_info "使用 '$0 promote' 推进到下一阶段"
}

cmd_promote() {
    check_prerequisites
    
    local current_phase=$(get_current_phase)
    local version=$(get_current_version)
    
    if [[ "${current_phase}" == "none" ]]; then
        log_error "没有进行中的发布"
        exit 1
    fi
    
    if [[ "${current_phase}" == "phase4" ]]; then
        log_info "发布已完成 (100%)"
        exit 0
    fi
    
    # 检查指标
    log_info "检查当前阶段指标..."
    if ! check_metrics "${current_phase}"; then
        log_error "指标不达标，不能推进"
        log_info "建议：检查监控系统或执行回滚"
        exit 1
    fi
    
    # 确定下一阶段
    local next_phase=""
    case "${current_phase}" in
        phase1) next_phase="phase2" ;;
        phase2) next_phase="phase3" ;;
        phase3) next_phase="phase4" ;;
    esac
    
    log_info "========== 推进发布 =========="
    log_info "当前：${current_phase}"
    log_info "下一：${next_phase}"
    log_info "版本：${version}"
    log_info "==========="
    
    deploy_phase "${version}" "${next_phase}"
    
    if [[ "${next_phase}" == "phase4" ]]; then
        log_success "========== 全量发布完成 =========="
    else
        log_success "========== ${next_phase} 部署完成 =========="
        log_info "观察期：2-3 天"
    fi
}

cmd_rollback() {
    log_warn "调用回滚脚本..."
    "${SCRIPT_DIR}/rollback.sh"
}

cmd_status() {
    echo ""
    echo "========== 灰度发布状态 =========="
    
    if [[ -f "${STATE_FILE}" ]]; then
        cat "${STATE_FILE}" | jq '.'
    else
        echo "没有进行中的发布"
    fi
    
    echo ""
    echo "阶段流量配置:"
    for phase in phase1 phase2 phase3 phase4; do
        printf "  %-10s: %3d%%\n" "${phase}" "${PHASE_PERCENTAGES[$phase]}"
    done
    
    echo ""
    echo "崩溃率阈值:"
    for phase in phase1 phase2 phase3 phase4; do
        local threshold="${PHASE_THRESHOLDS[$phase]}"
        printf "  %-10s: %5.2f%%\n" "${phase}" "$(echo "${threshold}*100" | bc)"
    done
    
    echo "================================"
}

cmd_check() {
    local current_phase=$(get_current_phase)
    
    if [[ "${current_phase}" == "none" ]]; then
        log_info "没有进行中的发布"
        exit 0
    fi
    
    log_info "检查 ${current_phase} 指标..."
    check_metrics "${current_phase}"
}

cmd_abort() {
    log_warn "中止当前发布..."
    
    local current_phase=$(get_current_phase)
    if [[ "${current_phase}" == "none" ]]; then
        log_info "没有进行中的发布"
        exit 0
    fi
    
    # 回滚到 0%
    local version=$(get_current_version)
    update_traffic_config "${version}" 0
    
    # 清除状态
    rm -f "${STATE_FILE}"
    
    log_success "发布已中止"
}

# ============= 帮助信息 =============
show_help() {
    cat << EOF
睡了么 App - 灰度发布部署脚本

用法：$(basename "$0") <命令> [参数]

命令:
  start <version>     开始新的灰度发布 (从 phase1/5% 开始)
  promote            推进到下一阶段 (当前阶段指标合格后)
  rollback           执行回滚
  status             查看当前状态
  check              检查当前指标
  abort              中止当前发布
  help               显示此帮助信息

示例:
  $(basename "$0") start 2.1.0      # 开始版本 2.1.0 的灰度发布
  $(basename "$0") status           # 查看发布状态
  $(basename "$0") check            # 检查当前指标
  $(basename "$0") promote          # 推进到下一阶段
  $(basename "$0") rollback         # 紧急回滚

阶段说明:
  phase1: 5%  流量，观察 2-3 天
  phase2: 20% 流量，观察 2-3 天
  phase3: 50% 流量，观察 2-3 天
  phase4: 100% 流量，全量发布

EOF
}

# ============= 主入口 =============
main() {
    local command="${1:-help}"
    shift || true
    
    # 创建日志目录
    mkdir -p "$(dirname "${LOG_FILE}")"
    
    case "${command}" in
        start)
            cmd_start "$@"
            ;;
        promote)
            cmd_promote
            ;;
        rollback)
            cmd_rollback
            ;;
        status)
            cmd_status
            ;;
        check)
            cmd_check
            ;;
        abort)
            cmd_abort
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令：${command}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
