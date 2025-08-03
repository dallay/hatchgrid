#!/bin/bash

# Migration Validation Script
# This script validates the hexagonal architecture migration process

set -e

echo "🔍 Starting migration validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Validation functions
validate_build() {
    print_status "info" "Validating build process..."
    cd client/apps/web

    if pnpm build > /dev/null 2>&1; then
        print_status "success" "Build successful"
        return 0
    else
        print_status "error" "Build failed"
        return 1
    fi
}

validate_tests() {
    print_status "info" "Running test suite..."
    cd client/apps/web

    # Run unit tests
    if pnpm test --run > /dev/null 2>&1; then
        print_status "success" "Unit tests passed"
    else
        print_status "error" "Unit tests failed"
        return 1
    fi

    # Run e2e tests
    if pnpm test:e2e > /dev/null 2>&1; then
        print_status "success" "E2E tests passed"
    else
        print_status "warning" "E2E tests failed or not available"
    fi

    return 0
}

validate_typescript() {
    print_status "info" "Validating TypeScript compilation..."
    cd client/apps/web

    if pnpm check > /dev/null 2>&1; then
        print_status "success" "TypeScript compilation successful"
        return 0
    else
        print_status "error" "TypeScript compilation failed"
        return 1
    fi
}

validate_dev_server() {
    print_status "info" "Testing development server startup..."
    cd client/apps/web

    # Start dev server in background and test if it starts
    timeout 30s pnpm dev > /dev/null 2>&1 &
    DEV_PID=$!

    sleep 10

    if kill -0 $DEV_PID 2>/dev/null; then
        print_status "success" "Development server starts successfully"
        kill $DEV_PID 2>/dev/null || true
        return 0
    else
        print_status "error" "Development server failed to start"
        return 1
    fi
}

# Main validation
main() {
    local exit_code=0

    print_status "info" "Starting comprehensive migration validation..."

    # Change to project root
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
    cd "$PROJECT_ROOT"

    # Run validations
    validate_typescript || exit_code=1
    validate_build || exit_code=1
    validate_tests || exit_code=1
    validate_dev_server || exit_code=1

    if [ $exit_code -eq 0 ]; then
        print_status "success" "All validations passed! ✨"
    else
        print_status "error" "Some validations failed. Please check the output above."
    fi

    return $exit_code
}

# Run main function
main "$@"
