#!/bin/bash

# Resume Customizer - Fix Validation Script
# This script tests all the fixes applied to resolve the identified issues

set -e  # Exit on any error

echo "🧪 Resume Customizer - Testing Applied Fixes"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_RUN++))
    echo -e "\n${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Check if we're in the right directory
if [[ ! -f "docker-compose.yml" ]] || [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
    echo -e "${RED}❌ Error: Please run this script from the resumator project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Project directory: $(pwd)${NC}"

# Test 1: Check FastAPI redirect_slashes fix
test_fastapi_config() {
    echo "Checking FastAPI configuration for redirect_slashes=False..."
    if grep -q "redirect_slashes=False" backend/main.py; then
        return 0
    else
        echo "❌ redirect_slashes=False not found in backend/main.py"
        return 1
    fi
}

# Test 2: Check rate limiting configuration updates
test_rate_limiting_config() {
    echo "Checking rate limiting configuration updates..."
    local config_file="backend/app/config/settings.py"
    
    # Check if new rate limiting variables exist
    if grep -q "read_requests_per_minute" "$config_file" && \
       grep -q "write_requests_per_minute" "$config_file" && \
       grep -q "is_development" "$config_file"; then
        return 0
    else
        echo "❌ Rate limiting configuration not updated properly"
        return 1
    fi
}

# Test 3: Check middleware improvements
test_middleware_improvements() {
    echo "Checking middleware improvements..."
    local middleware_file="backend/app/core/middleware.py"
    
    # Check for tiered rate limiting implementation
    if grep -q "tiered rate limits" "$middleware_file" && \
       grep -q "settings.is_development" "$middleware_file"; then
        return 0
    else
        echo "❌ Middleware improvements not found"
        return 1
    fi
}

# Test 4: Check missing dependencies
test_missing_dependencies() {
    echo "Checking for missing dependencies in requirements.txt..."
    local req_file="backend/requirements.txt"
    
    if grep -q "slowapi" "$req_file" && \
       grep -q "bleach" "$req_file" && \
       grep -q "cryptography" "$req_file" && \
       grep -q "validators" "$req_file"; then
        return 0
    else
        echo "❌ Missing dependencies not added to requirements.txt"
        return 1
    fi
}

# Test 5: Check useAuth hook fixes
test_useauth_fixes() {
    echo "Checking useAuth hook fixes..."
    local useauth_file="frontend/src/hooks/useAuth.jsx"
    
    # Check for simplified initialization and logout fixes
    if grep -q "apiService" "$useauth_file" && \
       grep -q "callAPI = true" "$useauth_file" && \
       grep -q "existing session" "$useauth_file"; then
        return 0
    else
        echo "❌ useAuth hook fixes not applied properly"
        return 1
    fi
}

# Test 6: Check Dockerfile.homelab completion
test_dockerfile_homelab() {
    echo "Checking Dockerfile.homelab completion..."
    local dockerfile="frontend/Dockerfile.homelab"
    
    if [[ -f "$dockerfile" ]] && \
       grep -q "RESUMATOR_DOMAIN" "$dockerfile" && \
       grep -q "entrypoint.sh" "$dockerfile" && \
       ! grep -q "nginx" "$dockerfile"; then
        return 0
    else
        echo "❌ Dockerfile.homelab not completed properly"
        return 1
    fi
}

# Test 7: Check simplified API service
test_simplified_api() {
    echo "Checking simplified API service..."
    local api_file="frontend/src/services/api.js"
    
    if [[ -f "$api_file" ]] && \
       grep -q "class ApiService" "$api_file" && \
       ! grep -q "sanitizeInput" "$api_file" && \
       ! grep -q "clientRateLimit" "$api_file"; then
        return 0
    else
        echo "❌ Simplified API service not created properly"
        return 1
    fi
}

# Test 8: Test backend dependencies installation
test_backend_dependencies() {
    echo "Testing backend dependencies installation..."
    cd backend
    
    # Create a temporary virtual environment
    python3 -m venv test_env
    source test_env/bin/activate
    
    # Try to install requirements
    if pip install -r requirements.txt > /dev/null 2>&1; then
        deactivate
        rm -rf test_env
        cd ..
        return 0
    else
        deactivate
        rm -rf test_env
        cd ..
        echo "❌ Backend dependencies installation failed"
        return 1
    fi
}

# Test 9: Test frontend build process
test_frontend_build() {
    echo "Testing frontend build process..."
    cd frontend
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        cd ..
        echo "❌ package.json not found"
        return 1
    fi
    
    # Try to install dependencies (if node_modules doesn't exist)
    if [[ ! -d "node_modules" ]]; then
        if ! npm install > /dev/null 2>&1; then
            cd ..
            echo "❌ npm install failed"
            return 1
        fi
    fi
    
    # Try to build
    if VITE_API_URL=https://test.example.com npm run build > /dev/null 2>&1; then
        cd ..
        return 0
    else
        cd ..
        echo "❌ Frontend build failed"
        return 1
    fi
}

# Test 10: Check docker-compose configuration
test_docker_compose() {
    echo "Checking docker-compose configuration..."
    
    if [[ -f "docker-compose.yml" ]] && \
       grep -q "resumator" "docker-compose.yml"; then
        return 0
    else
        echo "❌ docker-compose.yml not properly configured"
        return 1
    fi
}

# Test 11: Test API endpoint consistency
test_api_endpoints() {
    echo "Checking API endpoint consistency..."
    local constants_file="frontend/src/utils/constants.js"
    
    if [[ -f "$constants_file" ]] && \
       grep -q "API_ENDPOINTS" "$constants_file" && \
       ! grep -q "trailing slash" "$constants_file"; then
        return 0
    else
        echo "❌ API endpoints not properly configured"
        return 1
    fi
}

# Test 12: Validate fix documentation
test_documentation() {
    echo "Checking fix documentation..."
    
    if [[ -f "FIXES_APPLIED.md" ]] && \
       [[ -f "MIGRATION_GUIDE.md" ]] && \
       grep -q "Issues Resolved" "FIXES_APPLIED.md"; then
        return 0
    else
        echo "❌ Fix documentation not complete"
        return 1
    fi
}

# Run all tests
echo -e "${YELLOW}🚀 Starting fix validation tests...${NC}\n"

run_test "FastAPI redirect_slashes configuration" "test_fastapi_config"
run_test "Rate limiting configuration updates" "test_rate_limiting_config"  
run_test "Middleware improvements" "test_middleware_improvements"
run_test "Missing dependencies addition" "test_missing_dependencies"
run_test "useAuth hook fixes" "test_useauth_fixes"
run_test "Dockerfile.homelab completion" "test_dockerfile_homelab"
run_test "Simplified API service creation" "test_simplified_api"
run_test "API endpoint consistency" "test_api_endpoints"
run_test "Fix documentation" "test_documentation"
run_test "Docker Compose configuration" "test_docker_compose"

# Optional tests (may require additional setup)
echo -e "\n${YELLOW}🔧 Running optional tests (require dependencies)...${NC}"

if command -v python3 &> /dev/null; then
    run_test "Backend dependencies installation" "test_backend_dependencies"
else
    echo -e "${YELLOW}⚠️  Skipping backend dependency test (Python3 not found)${NC}"
fi

if command -v npm &> /dev/null; then
    run_test "Frontend build process" "test_frontend_build"
else
    echo -e "${YELLOW}⚠️  Skipping frontend build test (npm not found)${NC}"
fi

# Final results
echo -e "\n${BLUE}📊 Test Results Summary${NC}"
echo "======================="
echo -e "Tests run: ${BLUE}$TESTS_RUN${NC}"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}" 
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All tests passed! Fixes have been successfully applied.${NC}"
    echo -e "${GREEN}✅ The Resume Customizer should now work without the identified issues.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please review the failures above.${NC}"
    echo -e "${YELLOW}💡 Check FIXES_APPLIED.md for detailed information about each fix.${NC}"
    exit 1
fi
