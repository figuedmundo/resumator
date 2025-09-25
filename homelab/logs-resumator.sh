#!/bin/bash

# Resumator Log Viewer and Dashboard
# Provides easy access to application logs with filtering and search capabilities

set -euo pipefail

# Configuration
LOG_DIR="/srv/apps/resumator/logs"
CONTAINER_PREFIX="resumator"
COLORS_ENABLED=true

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Functions
print_header() {
    if [[ "${COLORS_ENABLED}" == "true" ]]; then
        echo -e "${BLUE}===============================================${NC}"
        echo -e "${WHITE}$1${NC}"
        echo -e "${BLUE}===============================================${NC}"
    else
        echo "==============================================="
        echo "$1"
        echo "==============================================="
    fi
}

print_section() {
    if [[ "${COLORS_ENABLED}" == "true" ]]; then
        echo -e "${CYAN}$1${NC}"
    else
        echo "$1"
    fi
}

print_error() {
    if [[ "${COLORS_ENABLED}" == "true" ]]; then
        echo -e "${RED}ERROR: $1${NC}" >&2
    else
        echo "ERROR: $1" >&2
    fi
}

print_warning() {
    if [[ "${COLORS_ENABLED}" == "true" ]]; then
        echo -e "${YELLOW}WARNING: $1${NC}"
    else
        echo "WARNING: $1"
    fi
}

print_success() {
    if [[ "${COLORS_ENABLED}" == "true" ]]; then
        echo -e "${GREEN}$1${NC}"
    else
        echo "$1"
    fi
}

# Check if running inside Docker Compose project directory
check_environment() {
    if [[ ! -f "docker-compose.yml" && ! -f "docker-compose.resumator.yml" ]]; then
        print_error "No Docker Compose files found. Please run from the project directory."
        exit 1
    fi
}

# Get list of running containers
get_containers() {
    docker-compose -f docker-compose.resumator.yml ps --services 2>/dev/null || \
    docker-compose ps --services 2>/dev/null || \
    docker ps --format "table {{.Names}}" | grep "${CONTAINER_PREFIX}" | head -20
}

# Show container logs
show_container_logs() {
    local container=$1
    local lines=${2:-50}
    local follow=${3:-false}
    
    print_section "📋 Logs for: $container (last $lines lines)"
    
    if [[ "$follow" == "true" ]]; then
        echo "Press Ctrl+C to stop following logs..."
        docker-compose -f docker-compose.resumator.yml logs -f --tail="$lines" "$container" 2>/dev/null || \
        docker-compose logs -f --tail="$lines" "$container" 2>/dev/null || \
        docker logs -f --tail="$lines" "$container" 2>/dev/null
    else
        docker-compose -f docker-compose.resumator.yml logs --tail="$lines" "$container" 2>/dev/null || \
        docker-compose logs --tail="$lines" "$container" 2>/dev/null || \
        docker logs --tail="$lines" "$container" 2>/dev/null
    fi
}

# Show security-related logs
show_security_logs() {
    local lines=${1:-50}
    
    print_section "🔒 Security Events (last $lines lines)"
    
    # Security patterns to search for
    local security_patterns=(
        "SECURITY"
        "AUTH"
        "RATE_LIMIT"
        "LOGIN"
        "FAILED"
        "BLOCKED"
        "VIOLATION"
        "XSS"
        "INJECTION"
        "SUSPICIOUS"
        "401"
        "403"
        "429"
    )
    
    # Build grep pattern
    local pattern=""
    for p in "${security_patterns[@]}"; do
        if [[ -n "$pattern" ]]; then
            pattern="$pattern\\|$p"
        else
            pattern="$p"
        fi
    done
    
    # Search in backend logs
    show_container_logs "backend" "$lines" false | \
        grep -i --color=always -E "$pattern" | \
        tail -n "$lines" || \
        print_warning "No security events found in recent logs"
}

# Show error logs
show_error_logs() {
    local lines=${1:-50}
    
    print_section "❌ Error Logs (last $lines lines)"
    
    local error_patterns=(
        "ERROR"
        "CRITICAL"
        "FATAL"
        "EXCEPTION"
        "TRACEBACK"
        "500"
        "502"
        "503"
        "504"
    )
    
    local pattern=""
    for p in "${error_patterns[@]}"; do
        if [[ -n "$pattern" ]]; then
            pattern="$pattern\\|$p"
        else
            pattern="$p"
        fi
    done
    
    show_container_logs "backend" "$lines" false | \
        grep -i --color=always -E "$pattern" | \
        tail -n "$lines" || \
        print_warning "No errors found in recent logs"
}

# Show performance metrics
show_performance_metrics() {
    print_section "📊 Performance Metrics"
    
    # Container resource usage
    echo "Container Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.NetIO}}\\t{{.BlockIO}}" | \
        grep -E "(CONTAINER|${CONTAINER_PREFIX})" || \
        print_warning "No containers found"
    
    echo
    
    # Log file sizes
    if [[ -d "$LOG_DIR" ]]; then
        echo "Log File Sizes:"
        du -h "$LOG_DIR"/* 2>/dev/null | sort -hr | head -10 || \
            print_warning "No log files found in $LOG_DIR"
    else
        print_warning "Log directory not found: $LOG_DIR"
    fi
}

# Interactive log viewer
interactive_viewer() {
    while true; do
        clear
        print_header "🔍 Resumator Log Dashboard"
        
        echo "Available containers:"
        local containers=($(get_containers))
        local i=1
        for container in "${containers[@]}"; do
            echo "$i) $container"
            ((i++))
        done
        
        echo
        echo "Quick Actions:"
        echo "s) Security logs"
        echo "e) Error logs" 
        echo "p) Performance metrics"
        echo "a) All container logs"
        echo "f) Follow logs (real-time)"
        echo "q) Quit"
        echo
        
        read -p "Select option: " choice
        
        case $choice in
            [1-9]*)
                if [[ $choice -le ${#containers[@]} ]]; then
                    local selected_container=${containers[$((choice-1))]}
                    read -p "Number of lines to show (default: 50): " lines
                    lines=${lines:-50}
                    show_container_logs "$selected_container" "$lines"
                    read -p "Press Enter to continue..."
                else
                    print_error "Invalid selection"
                    read -p "Press Enter to continue..."
                fi
                ;;
            s|S)
                read -p "Number of lines to show (default: 50): " lines
                lines=${lines:-50}
                show_security_logs "$lines"
                read -p "Press Enter to continue..."
                ;;
            e|E)
                read -p "Number of lines to show (default: 50): " lines
                lines=${lines:-50}
                show_error_logs "$lines"
                read -p "Press Enter to continue..."
                ;;
            p|P)
                show_performance_metrics
                read -p "Press Enter to continue..."
                ;;
            a|A)
                read -p "Number of lines to show (default: 50): " lines
                lines=${lines:-50}
                for container in "${containers[@]}"; do
                    show_container_logs "$container" "$lines"
                    echo
                done
                read -p "Press Enter to continue..."
                ;;
            f|F)
                echo "Available containers:"
                local i=1
                for container in "${containers[@]}"; do
                    echo "$i) $container"
                    ((i++))
                done
                read -p "Select container to follow: " follow_choice
                if [[ $follow_choice -le ${#containers[@]} ]]; then
                    local selected_container=${containers[$((follow_choice-1))]}
                    show_container_logs "$selected_container" 100 true
                fi
                ;;
            q|Q)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Log analysis and search
search_logs() {
    local search_term=$1
    local container=${2:-"backend"}
    local lines=${3:-100}
    
    print_section "🔍 Searching logs for: '$search_term' in $container"
    
    show_container_logs "$container" "$lines" false | \
        grep -i --color=always "$search_term" || \
        print_warning "No matches found for '$search_term'"
}

# Export logs
export_logs() {
    local export_dir="./resumator_logs_$(date +%Y%m%d_%H%M%S)"
    local lines=${1:-1000}
    
    print_section "📦 Exporting logs to: $export_dir"
    
    mkdir -p "$export_dir"
    
    local containers=($(get_containers))
    for container in "${containers[@]}"; do
        echo "Exporting $container logs..."
        show_container_logs "$container" "$lines" false > "$export_dir/${container}.log" 2>&1
    done
    
    # Create summary
    cat > "$export_dir/README.txt" << EOF
Resumator Log Export
===================
Export Date: $(date)
Lines per container: $lines

Files:
$(ls -la "$export_dir"/*.log | awk '{print "- " $9 " (" $5 " bytes)"}')

To view logs:
- cat $export_dir/backend.log
- grep -i "error" $export_dir/backend.log
- tail -f $export_dir/backend.log

For security events:
- grep -i -E "(auth|security|rate|login|failed)" $export_dir/backend.log
EOF
    
    print_success "Logs exported to: $export_dir"
    print_success "Total files: $(ls -1 "$export_dir"/*.log | wc -l)"
    print_success "Total size: $(du -sh "$export_dir" | cut -f1)"
}

# Real-time log monitoring with filtering
monitor_logs() {
    local filter=${1:-""}
    local container=${2:-"backend"}
    
    print_section "👀 Real-time monitoring: $container"
    if [[ -n "$filter" ]]; then
        echo "Filter: $filter"
    fi
    echo "Press Ctrl+C to stop"
    echo
    
    if [[ -n "$filter" ]]; then
        show_container_logs "$container" 0 true | \
            grep -i --color=always "$filter"
    else
        show_container_logs "$container" 0 true
    fi
}

# Main function
main() {
    check_environment
    
    case ${1:-""} in
        "logs")
            container=${2:-"backend"}
            lines=${3:-50}
            show_container_logs "$container" "$lines"
            ;;
        "security")
            lines=${2:-50}
            show_security_logs "$lines"
            ;;
        "errors")
            lines=${2:-50}
            show_error_logs "$lines"
            ;;
        "search")
            if [[ -z ${2:-""} ]]; then
                print_error "Search term required. Usage: $0 search <term> [container] [lines]"
                exit 1
            fi
            search_logs "$2" "${3:-backend}" "${4:-100}"
            ;;
        "export")
            lines=${2:-1000}
            export_logs "$lines"
            ;;
        "monitor"|"follow")
            filter=${2:-""}
            container=${3:-"backend"}
            monitor_logs "$filter" "$container"
            ;;
        "metrics"|"performance")
            show_performance_metrics
            ;;
        "dashboard"|"interactive"|"")
            interactive_viewer
            ;;
        "help"|"--help"|"-h")
            cat << EOF
Resumator Log Viewer

Usage: $0 [command] [options]

Commands:
  dashboard          Interactive log dashboard (default)
  logs <container>   Show logs for specific container
  security [lines]   Show security-related logs
  errors [lines]     Show error logs
  search <term>      Search logs for specific term
  export [lines]     Export logs to directory
  monitor [filter]   Real-time log monitoring
  metrics            Show performance metrics
  help               Show this help

Examples:
  $0                                    # Interactive dashboard
  $0 logs backend 100                   # Show last 100 lines from backend
  $0 security 50                        # Show last 50 security events
  $0 search "rate limit" backend 200    # Search for rate limit events
  $0 monitor "ERROR"                    # Monitor for errors in real-time
  $0 export 500                         # Export last 500 lines from all containers

EOF
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
