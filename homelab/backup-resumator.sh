#!/bin/bash

# Advanced Backup Script for Resumator
# Provides automated backup with compression, encryption, and retention policies
set -euo pipefail

# Configuration
APP_NAME="resumator"
APP_DIR="/srv/apps/${APP_NAME}"
BACKUP_DIR="/srv/backups/${APP_NAME}"
REMOTE_BACKUP_DIR="/mnt/backup/resumator"  # Optional remote backup location
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_PREFIX="${APP_NAME}-${DATE}"

# Environment
ENV_FILE="${APP_DIR}/.env.resumator"
DOCKER_COMPOSE_FILE="${APP_DIR}/docker-compose.resumator.yml"

# Retention settings (days)
LOCAL_RETENTION_DAYS=7
REMOTE_RETENTION_DAYS=30

# Encryption settings (optional)
ENCRYPT_BACKUPS=${ENCRYPT_BACKUPS:-false}
GPG_RECIPIENT=${GPG_RECIPIENT:-""}

# Logging
LOG_FILE="${BACKUP_DIR}/backup.log"

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

error() {
    log "ERROR: $1" >&2
    exit 1
}

check_dependencies() {
    local deps=("docker" "docker-compose" "pg_dump" "tar" "gzip")
    
    if [[ "${ENCRYPT_BACKUPS}" == "true" ]]; then
        deps+=("gpg")
    fi
    
    for dep in "${deps[@]}"; do
        if ! command -v "${dep}" >/dev/null 2>&1; then
            error "Required dependency '${dep}' is not installed"
        fi
    done
}

create_directories() {
    mkdir -p "${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}/logs"
    
    if [[ -n "${REMOTE_BACKUP_DIR}" && -d "$(dirname "${REMOTE_BACKUP_DIR}")" ]]; then
        mkdir -p "${REMOTE_BACKUP_DIR}"
    fi
}

get_db_credentials() {
    if [[ ! -f "${ENV_FILE}" ]]; then
        error "Environment file not found: ${ENV_FILE}"
    fi
    
    # Source environment variables
    set -a
    source "${ENV_FILE}"
    set +a
    
    # Validate required variables
    local required_vars=("POSTGRES_USER" "RESUMATOR_DB_NAME" "POSTGRES_PASSWORD")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable ${var} is not set"
        fi
    done
}

wait_for_database() {
    log "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0
    
    while ! docker-compose -f "${DOCKER_COMPOSE_FILE}" exec -T postgres pg_isready -U "${POSTGRES_USER}" >/dev/null 2>&1; do
        ((attempt++))
        if [[ ${attempt} -ge ${max_attempts} ]]; then
            error "Database is not ready after ${max_attempts} attempts"
        fi
        sleep 2
    done
    
    log "Database is ready"
}

backup_database() {
    log "Starting database backup..."
    
    local db_backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}-database.sql"
    local compressed_file="${db_backup_file}.gz"
    
    # Create database dump with proper error handling
    if ! docker-compose -f "${DOCKER_COMPOSE_FILE}" exec -T postgres \
        pg_dump -U "${POSTGRES_USER}" \
                --verbose \
                --clean \
                --if-exists \
                --create \
                --format=plain \
                "${RESUMATOR_DB_NAME}" > "${db_backup_file}" 2>/dev/null; then
        error "Database backup failed"
    fi
    
    # Compress the backup
    if ! gzip "${db_backup_file}"; then
        error "Database backup compression failed"
    fi
    
    # Encrypt if requested
    if [[ "${ENCRYPT_BACKUPS}" == "true" && -n "${GPG_RECIPIENT}" ]]; then
        if ! gpg --trust-model always --encrypt -r "${GPG_RECIPIENT}" "${compressed_file}"; then
            error "Database backup encryption failed"
        fi
        rm "${compressed_file}"
        compressed_file="${compressed_file}.gpg"
    fi
    
    log "Database backup completed: $(basename "${compressed_file}")"
    echo "${compressed_file}"
}

backup_storage() {
    log "Starting storage backup..."
    
    local storage_dir="${APP_DIR}/storage"
    if [[ ! -d "${storage_dir}" ]]; then
        log "Warning: Storage directory not found: ${storage_dir}"
        return 0
    fi
    
    local storage_backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}-storage.tar.gz"
    
    # Create compressed archive
    if ! tar -czf "${storage_backup_file}" -C "${APP_DIR}" storage/ 2>/dev/null; then
        error "Storage backup failed"
    fi
    
    # Encrypt if requested
    if [[ "${ENCRYPT_BACKUPS}" == "true" && -n "${GPG_RECIPIENT}" ]]; then
        if ! gpg --trust-model always --encrypt -r "${GPG_RECIPIENT}" "${storage_backup_file}"; then
            error "Storage backup encryption failed"
        fi
        rm "${storage_backup_file}"
        storage_backup_file="${storage_backup_file}.gpg"
    fi
    
    log "Storage backup completed: $(basename "${storage_backup_file}")"
    echo "${storage_backup_file}"
}

backup_configuration() {
    log "Starting configuration backup..."
    
    local config_backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}-config.tar.gz"
    local temp_config_dir="${BACKUP_DIR}/temp-config"
    
    # Create temporary directory for configuration files
    mkdir -p "${temp_config_dir}"
    
    # Copy configuration files (excluding sensitive data)
    cp "${DOCKER_COMPOSE_FILE}" "${temp_config_dir}/" 2>/dev/null || true
    
    # Copy environment file with sensitive data masked
    if [[ -f "${ENV_FILE}" ]]; then
        sed 's/\(PASSWORD\|SECRET\|KEY\)=.*/\1=***MASKED***/' "${ENV_FILE}" > "${temp_config_dir}/.env.resumator" 2>/dev/null || true
    fi
    
    # Copy any additional configuration files
    for config_file in "Caddyfile" "docker-compose.yml" ".gitignore"; do
        if [[ -f "${APP_DIR}/${config_file}" ]]; then
            cp "${APP_DIR}/${config_file}" "${temp_config_dir}/" 2>/dev/null || true
        fi
    done
    
    # Create archive
    if ! tar -czf "${config_backup_file}" -C "${BACKUP_DIR}" "$(basename "${temp_config_dir}")" 2>/dev/null; then
        error "Configuration backup failed"
    fi
    
    # Clean up temporary directory
    rm -rf "${temp_config_dir}"
    
    # Encrypt if requested
    if [[ "${ENCRYPT_BACKUPS}" == "true" && -n "${GPG_RECIPIENT}" ]]; then
        if ! gpg --trust-model always --encrypt -r "${GPG_RECIPIENT}" "${config_backup_file}"; then
            error "Configuration backup encryption failed"
        fi
        rm "${config_backup_file}"
        config_backup_file="${config_backup_file}.gpg"
    fi
    
    log "Configuration backup completed: $(basename "${config_backup_file}")"
    echo "${config_backup_file}"
}

create_backup_manifest() {
    local db_file=$1
    local storage_file=$2
    local config_file=$3
    
    local manifest_file="${BACKUP_DIR}/${BACKUP_PREFIX}-manifest.txt"
    
    {
        echo "Resumator Backup Manifest"
        echo "=========================="
        echo "Backup Date: $(date)"
        echo "Backup ID: ${BACKUP_PREFIX}"
        echo "Hostname: $(hostname)"
        echo ""
        echo "Files:"
        echo "- Database: $(basename "${db_file}") ($(stat -c%s "${db_file}" | numfmt --to=iec))"
        echo "- Storage: $(basename "${storage_file}") ($(stat -c%s "${storage_file}" | numfmt --to=iec))"
        echo "- Configuration: $(basename "${config_file}") ($(stat -c%s "${config_file}" | numfmt --to=iec))"
        echo ""
        echo "Checksums:"
        echo "- Database: $(sha256sum "${db_file}" | cut -d' ' -f1)"
        echo "- Storage: $(sha256sum "${storage_file}" | cut -d' ' -f1)"
        echo "- Configuration: $(sha256sum "${config_file}" | cut -d' ' -f1)"
    } > "${manifest_file}"
    
    log "Backup manifest created: $(basename "${manifest_file}")"
    echo "${manifest_file}"
}

sync_to_remote() {
    if [[ -z "${REMOTE_BACKUP_DIR}" || ! -d "$(dirname "${REMOTE_BACKUP_DIR}")" ]]; then
        log "Remote backup directory not available, skipping remote sync"
        return 0
    fi
    
    log "Syncing backups to remote location..."
    
    # Sync backup files to remote location
    if rsync -av --progress "${BACKUP_DIR}/${BACKUP_PREFIX}-"* "${REMOTE_BACKUP_DIR}/" >/dev/null 2>&1; then
        log "Remote sync completed successfully"
    else
        log "Warning: Remote sync failed, continuing with local backup"
    fi
}

cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Clean local backups
    find "${BACKUP_DIR}" -name "${APP_NAME}-*" -type f -mtime +${LOCAL_RETENTION_DAYS} -delete 2>/dev/null || true
    
    # Clean remote backups if available
    if [[ -n "${REMOTE_BACKUP_DIR}" && -d "${REMOTE_BACKUP_DIR}" ]]; then
        find "${REMOTE_BACKUP_DIR}" -name "${APP_NAME}-*" -type f -mtime +${REMOTE_RETENTION_DAYS} -delete 2>/dev/null || true
    fi
    
    # Clean old logs
    find "${BACKUP_DIR}/logs" -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true
    
    log "Old backup cleanup completed"
}

verify_backup() {
    local manifest_file=$1
    
    log "Verifying backup integrity..."
    
    # Check if all files exist and match checksums
    while IFS= read -r line; do
        if [[ $line =~ ^-\ ([^:]+):\ ([a-f0-9]{64})$ ]]; then
            local file_type="${BASH_REMATCH[1]}"
            local expected_checksum="${BASH_REMATCH[2]}"
            
            # Find the actual file
            local actual_file
            case "${file_type}" in
                "Database") actual_file=$(find "${BACKUP_DIR}" -name "${BACKUP_PREFIX}-database.*" -type f | head -1) ;;
                "Storage") actual_file=$(find "${BACKUP_DIR}" -name "${BACKUP_PREFIX}-storage.*" -type f | head -1) ;;
                "Configuration") actual_file=$(find "${BACKUP_DIR}" -name "${BACKUP_PREFIX}-config.*" -type f | head -1) ;;
            esac
            
            if [[ -n "${actual_file}" && -f "${actual_file}" ]]; then
                local actual_checksum=$(sha256sum "${actual_file}" | cut -d' ' -f1)
                if [[ "${actual_checksum}" != "${expected_checksum}" ]]; then
                    error "Backup verification failed for ${file_type}: checksum mismatch"
                fi
            else
                error "Backup verification failed: ${file_type} file not found"
            fi
        fi
    done < <(grep -E '^-\ [^:]+:\ [a-f0-9]{64}$' "${manifest_file}")
    
    log "Backup verification passed"
}

send_notification() {
    local status=$1
    local message=$2
    
    # Add notification logic here (email, webhook, etc.)
    # For now, just log the notification
    log "NOTIFICATION [${status}]: ${message}"
    
    # Example webhook notification (uncomment and configure as needed)
    # if [[ -n "${WEBHOOK_URL:-}" ]]; then
    #     curl -X POST "${WEBHOOK_URL}" \
    #          -H "Content-Type: application/json" \
    #          -d "{\"status\":\"${status}\",\"message\":\"${message}\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
    #          >/dev/null 2>&1 || true
    # fi
}

# Main execution
main() {
    log "Starting Resumator backup process..."
    
    # Pre-flight checks
    check_dependencies
    create_directories
    get_db_credentials
    
    # Change to app directory
    cd "${APP_DIR}"
    
    # Wait for services to be ready
    wait_for_database
    
    # Perform backups
    local db_backup_file
    local storage_backup_file
    local config_backup_file
    local manifest_file
    
    db_backup_file=$(backup_database)
    storage_backup_file=$(backup_storage)
    config_backup_file=$(backup_configuration)
    manifest_file=$(create_backup_manifest "${db_backup_file}" "${storage_backup_file}" "${config_backup_file}")
    
    # Verify backup integrity
    verify_backup "${manifest_file}"
    
    # Sync to remote location
    sync_to_remote
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Calculate backup size
    local total_size=$(find "${BACKUP_DIR}" -name "${BACKUP_PREFIX}-*" -type f -exec stat -c%s {} \; | awk '{sum+=$1} END {print sum}')
    local human_size=$(echo "${total_size}" | numfmt --to=iec)
    
    log "Backup completed successfully!"
    log "Total backup size: ${human_size}"
    log "Backup files:"
    find "${BACKUP_DIR}" -name "${BACKUP_PREFIX}-*" -type f -exec basename {} \;
    
    # Send success notification
    send_notification "SUCCESS" "Resumator backup completed successfully. Size: ${human_size}"
}

# Error handling
trap 'error "Backup failed due to unexpected error on line $LINENO"' ERR
trap 'send_notification "ERROR" "Resumator backup failed"' EXIT

# Execute main function
main "$@"

# Remove error trap on successful completion
trap - EXIT
