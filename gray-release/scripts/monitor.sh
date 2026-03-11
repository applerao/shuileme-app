#!/bin/bash
#
# 睡了么 App - 灰度发布监控脚本
# 用途：监控灰度发布期间的关键指标
#

set -euo pipefail

# ============= 配置 =============
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="${SCRIPT_DIR}/../state/current-release.json"
METRICS_FILE="${SCRIPT_DIR}/../state/metrics-$(date +%Y%m%d).json"
LOG_FILE="${SCRIPT_DIR}/../logs/monitor-$(date +%Y%m%d-%H%M%S).log"

# 监控配置
MONITOR_INTERVAL=300  # 5 分钟
ALERT_COOLDOWN=600    # 10 分钟告警冷却

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
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info()    { log "${BLUE}INFO${NC}" "$@"; }
log_success() { log "${GREEN}SUCCESS${NC}" "$@"; }
log_warn()    { log "${YELLOW}WARN${NC}" "$@"; }
log_error()   { log "${RED}ERROR${NC}" "$@"; }

# ============= 指标采集 =============
collect_metrics() {
    log_info "采集监控指标..."
    
    local timestamp=$(date -Iseconds)
    local version="unknown"
    local phase="unknown"
    
    if [[ -f "${STATE_FILE}" ]]; then
        version=$(jq -r '.version' "${STATE_FILE}")
        phase=$(jq -r '.current_phase' "${STATE_FILE}")
    fi
    
    # 采集各项指标
    local crash_rate=$(get_crash_rate)
    local anr_rate=$(get_anr_rate)
    local launch_failure_rate=$(get_launch_failure_rate)
    local api_error_rate=$(get_api_error_rate)
    local active_users=$(get_active_users)
    local complaint_rate=$(get_complaint_rate)
    
    # 构建指标 JSON
    local metrics=$(cat << EOF
{
    "timestamp": "${timestamp}",
    "version": "${version}",
    "phase": "${phase}",
    "metrics": {
        "crash_rate": ${crash_rate},
        "anr_rate": ${anr_rate},
        "launch_failure_rate": ${launch_failure_rate},
        "api_error_rate": ${api_error_rate},
        "active_users": ${active_users},
        "complaint_rate": ${complaint_rate}
    }
}
EOF
)
    
    # 追加到指标文件
    mkdir -p "$(dirname "${METRICS_FILE}")"
    echo "${metrics}" >> "${METRICS_FILE}"
    
    log_success "指标采集完成"
    echo "${metrics}" | jq '.'
}

get_crash_rate() {
    # 从监控系统获取崩溃率
    # 实际实现：调用监控 API
    # 返回小数，如 0.005 表示 0.5%
    echo "0.003"
}

get_anr_rate() {
    # Application Not Responding 率
    echo "0.002"
}

get_launch_failure_rate() {
    # 启动失败率
    echo "0.004"
}

get_api_error_rate() {
    # API 错误率
    echo "0.015"
}

get_active_users() {
    # 活跃用户数
    echo "150000"
}

get_complaint_rate() {
    # 用户投诉率
    echo "0.001"
}

# ============= 指标检查 =============
check_thresholds() {
    local phase="$1"
    
    if [[ -z "${phase}" || "${phase}" == "unknown" || "${phase}" == "none" ]]; then
        log_info "没有进行中的灰度发布，使用默认阈值"
        phase="phase4"
    fi
    
    log_info "检查 ${phase} 阈值..."
    
    # 获取当前指标
    local crash_rate=$(get_crash_rate)
    local anr_rate=$(get_anr_rate)
    local launch_failure_rate=$(get_launch_failure_rate)
    local api_error_rate=$(get_api_error_rate)
    
    # 定义阈值 (按阶段)
    local crash_threshold=$(get_crash_threshold "${phase}")
    local anr_threshold=$(get_anr_threshold "${phase}")
    local launch_threshold=$(get_launch_threshold "${phase}")
    local api_threshold=$(get_api_threshold "${phase}")
    
    local has_alert=false
    
    # 检查崩溃率
    if (( $(echo "${crash_rate} > ${crash_threshold}" | bc -l) )); then
        log_error "❌ 崩溃率超标：$(echo "${crash_rate}*100" | bc)% > $(echo "${crash_threshold}*100" | bc)%"
        has_alert=true
    else
        log_success "✅ 崩溃率正常：$(echo "${crash_rate}*100" | bc)%"
    fi
    
    # 检查 ANR 率
    if (( $(echo "${anr_rate} > ${anr_threshold}" | bc -l) )); then
        log_error "❌ ANR 率超标：$(echo "${anr_rate}*100" | bc)% > $(echo "${anr_threshold}*100" | bc)%"
        has_alert=true
    else
        log_success "✅ ANR 率正常：$(echo "${anr_rate}*100" | bc)%"
    fi
    
    # 检查启动失败率
    if (( $(echo "${launch_failure_rate} > ${launch_threshold}" | bc -l) )); then
        log_error "❌ 启动失败率超标：$(echo "${launch_failure_rate}*100" | bc)% > $(echo "${launch_threshold}*100" | bc)%"
        has_alert=true
    else
        log_success "✅ 启动失败率正常：$(echo "${launch_failure_rate}*100" | bc)%"
    fi
    
    # 检查 API 错误率
    if (( $(echo "${api_error_rate} > ${api_threshold}" | bc -l) )); then
        log_error "❌ API 错误率超标：$(echo "${api_error_rate}*100" | bc)% > $(echo "${api_threshold}*100" | bc)%"
        has_alert=true
    else
        log_success "✅ API 错误率正常：$(echo "${api_error_rate}*100" | bc)%"
    fi
    
    if [[ "${has_alert}" == true ]]; then
        return 1
    fi
    
    return 0
}

get_crash_threshold() {
    local phase="$1"
    case "${phase}" in
        phase1) echo "0.005" ;;  # 0.5%
        phase2) echo "0.008" ;;  # 0.8%
        phase3) echo "0.010" ;;  # 1.0%
        phase4) echo "0.010" ;;  # 1.0%
        *) echo "0.010" ;;
    esac
}

get_anr_threshold() {
    local phase="$1"
    case "${phase}" in
        phase1) echo "0.003" ;;  # 0.3%
        phase2) echo "0.005" ;;  # 0.5%
        phase3) echo "0.008" ;;  # 0.8%
        phase4) echo "0.008" ;;  # 0.8%
        *) echo "0.008" ;;
    esac
}

get_launch_threshold() {
    local phase="$1"
    case "${phase}" in
        phase1) echo "0.005" ;;  # 0.5%
        phase2) echo "0.008" ;;  # 0.8%
        phase3) echo "0.010" ;;  # 1.0%
        phase4) echo "0.010" ;;  # 1.0%
        *) echo "0.010" ;;
    esac
}

get_api_threshold() {
    local phase="$1"
    case "${phase}" in
        phase1) echo "0.010" ;;  # 1.0%
        phase2) echo "0.020" ;;  # 2.0%
        phase3) echo "0.030" ;;  # 3.0%
        phase4) echo "0.030" ;;  # 3.0%
        *) echo "0.030" ;;
    esac
}

# ============= 告警 =============
send_alert() {
    local alert_type="$1"
    local message="$2"
    local severity="${3:-P1}"
    
    log_error "发送告警：[${severity}] ${alert_type}"
    
    # 构建告警内容
    local alert_payload=$(cat << EOF
{
    "type": "${alert_type}",
    "severity": "${severity}",
    "message": "${message}",
    "timestamp": "$(date -Iseconds)",
    "version": "$(jq -r '.version // "unknown"' "${STATE_FILE}" 2>/dev/null || echo "unknown")",
    "phase": "$(jq -r '.current_phase // "unknown"' "${STATE_FILE}" 2>/dev/null || echo "unknown")"
}
EOF
)
    
    # 发送到告警系统
    # 实际实现：调用告警 API
    log_info "告警内容：${alert_payload}"
    
    # 发送到钉钉/Slack
    # 实际实现调用消息 API
}

# ============= 报告生成 =============
generate_report() {
    local date="${1:-$(date +%Y-%m-%d)}"
    local metrics_file="${SCRIPT_DIR}/../state/metrics-${date}.json"
    
    log_info "生成 ${date} 监控报告..."
    
    if [[ ! -f "${metrics_file}" ]]; then
        log_error "指标文件不存在：${metrics_file}"
        exit 1
    fi
    
    echo ""
    echo "========== 灰度发布监控报告 =========="
    echo "日期：${date}"
    echo ""
    
    # 统计摘要
    local data_points=$(wc -l < "${metrics_file}")
    echo "数据点数：${data_points}"
    echo ""
    
    # 计算平均值
    local avg_crash=$(jq -s 'map(.metrics.crash_rate) | add / length' "${metrics_file}")
    local avg_anr=$(jq -s 'map(.metrics.anr_rate) | add / length' "${metrics_file}")
    local avg_launch=$(jq -s 'map(.metrics.launch_failure_rate) | add / length' "${metrics_file}")
    local avg_api=$(jq -s 'map(.metrics.api_error_rate) | add / length' "${metrics_file}")
    
    echo "平均指标:"
    printf "  崩溃率：%.4f (%.2f%%)\n" "${avg_crash}" "$(echo "${avg_crash}*100" | bc)"
    printf "  ANR 率：%.4f (%.2f%%)\n" "${avg_anr}" "$(echo "${avg_anr}*100" | bc)"
    printf "  启动失败率：%.4f (%.2f%%)\n" "${avg_launch}" "$(echo "${avg_launch}*100" | bc)"
    printf "  API 错误率：%.4f (%.2f%%)\n" "${avg_api}" "$(echo "${avg_api}*100" | bc)"
    echo ""
    
    # 最大值
    local max_crash=$(jq -s 'map(.metrics.crash_rate) | max' "${metrics_file}")
    echo "峰值崩溃率：$(echo "${max_crash}*100" | bc)%"
    echo ""
    
    echo "========================================"
}

# ============= 持续监控 =============
start_monitoring() {
    log_info "启动持续监控 (间隔：${MONITOR_INTERVAL}秒)..."
    log_info "按 Ctrl+C 停止"
    
    local last_alert_time=0
    
    while true; do
        local current_time=$(date +%s)
        
        # 采集指标
        collect_metrics > /dev/null
        
        # 检查阈值
        local phase=$(jq -r '.current_phase // "none"' "${STATE_FILE}" 2>/dev/null || echo "none")
        
        if ! check_thresholds "${phase}"; then
            # 检查告警冷却
            if [[ $((current_time - last_alert_time)) -gt ${ALERT_COOLDOWN} ]]; then
                send_alert "threshold_breach" "灰度发布指标超标" "P1"
                last_alert_time=${current_time}
                
                # 检查是否需要自动回滚
                local crash_rate=$(get_crash_rate)
                if (( $(echo "${crash_rate} > 0.01" | bc -l) )); then
                    log_error "崩溃率 > 1%，建议执行回滚"
                    log_info "运行：${SCRIPT_DIR}/rollback.sh --auto"
                fi
            fi
        fi
        
        sleep "${MONITOR_INTERVAL}"
    done
}

# ============= 帮助信息 =============
show_help() {
    cat << EOF
睡了么 App - 灰度发布监控脚本

用法：$(basename "$0") <命令>

命令:
  collect            采集一次指标
  check              检查当前指标是否达标
  report [日期]      生成监控报告 (默认今天)
  watch              持续监控 (后台运行)
  help               显示此帮助信息

示例:
  $(basename "$0") collect           # 采集当前指标
  $(basename "$0") check             # 检查指标是否达标
  $(basename "$0") report            # 生成今天报告
  $(basename "$0") report 2026-03-07 # 生成指定日期报告
  $(basename "$0") watch             # 持续监控

监控指标:
  - 崩溃率 (crash_rate)
  - ANR 率 (anr_rate)
  - 启动失败率 (launch_failure_rate)
  - API 错误率 (api_error_rate)
  - 活跃用户数 (active_users)
  - 用户投诉率 (complaint_rate)

EOF
}

# ============= 主入口 =============
main() {
    local command="${1:-help}"
    shift || true
    
    # 创建日志目录
    mkdir -p "$(dirname "${LOG_FILE}")"
    
    case "${command}" in
        collect)
            collect_metrics
            ;;
        check)
            local phase=$(jq -r '.current_phase // "none"' "${STATE_FILE}" 2>/dev/null || echo "none")
            check_thresholds "${phase}"
            ;;
        report)
            generate_report "$@"
            ;;
        watch)
            start_monitoring
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
