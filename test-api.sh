#!/bin/bash

# Adora-AI API Endpoint Test Script
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Adora-AI API Endpoint Tests${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Base URL
BASE_URL="http://localhost:3000"

# Test counter
PASSED=0
FAILED=0

# Test 1: Health Check
echo -n "1. Health Check (GET /api/health)... "
response=$(curl -s ${BASE_URL}/api/health)
if [[ $response == *"ok"* ]]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "   Response: $response"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "   Response: $response"
    ((FAILED++))
fi
echo ""

# Test 2: Published Projects
echo -n "2. Get Published Projects (GET /api/project/published-projects)... "
response=$(curl -s ${BASE_URL}/api/project/published-projects)
if [[ $response == *"projects"* ]]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "   Response: $response"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "   Response: $response"
    ((FAILED++))
fi
echo ""

# Test 3: Unauthorized Access - User Credits (should fail with 401)
echo -n "3. Unauthorized Access - Get Credits (GET /api/user/credit)... "
status=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/user/credit)
if [[ $status == "401" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (correctly blocked)"
    echo "   Status: 401 Unauthorized"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (should return 401)"
    echo "   Status: $status"
    ((FAILED++))
fi
echo ""

# Test 4: Unauthorized Access - User Projects (should fail with 401)
echo -n "4. Unauthorized Access - Get Projects (GET /api/user/projects)... "
status=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/user/projects)
if [[ $status == "401" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (correctly blocked)"
    echo "   Status: 401 Unauthorized"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (should return 401)"
    echo "   Status: $status"
    ((FAILED++))
fi
echo ""

# Test 5: Unauthorized Access - Get Specific Project (should fail with 401)
echo -n "5. Unauthorized Access - Get Project (GET /api/user/project/:id)... "
status=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/user/project/test-id)
if [[ $status == "401" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (correctly blocked)"
    echo "   Status: 401 Unauthorized"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (should return 401)"
    echo "   Status: $status"
    ((FAILED++))
fi
echo ""

# Test 6: Unauthorized Access - Toggle Publish (should fail with 401)
echo -n "6. Unauthorized Access - Toggle Publish (GET /api/user/publish/:id)... "
status=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/user/publish/test-id)
if [[ $status == "401" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (correctly blocked)"
    echo "   Status: 401 Unauthorized"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (should return 401)"
    echo "   Status: $status"
    ((FAILED++))
fi
echo ""

# Test 7: Unauthorized Access - Delete Project (should fail with 401)
echo -n "7. Unauthorized Access - Delete Project (DELETE /api/project/:id)... "
status=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE ${BASE_URL}/api/project/test-id)
if [[ $status == "401" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (correctly blocked)"
    echo "   Status: 401 Unauthorized"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (should return 401)"
    echo "   Status: $status"
    ((FAILED++))
fi
echo ""

# Test 8: Unauthorized Access - Create Project (should fail with 401)
echo -n "8. Unauthorized Access - Create Project (POST /api/project/create)... "
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${BASE_URL}/api/project/create)
if [[ $status == "401" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (correctly blocked)"
    echo "   Status: 401 Unauthorized"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (should return 401)"
    echo "   Status: $status"
    ((FAILED++))
fi
echo ""

# Test 9: Unauthorized Access - Generate Video (should fail with 401)
echo -n "9. Unauthorized Access - Generate Video (POST /api/project/video)... "
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test-id"}' \
  ${BASE_URL}/api/project/video)
if [[ $status == "401" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (correctly blocked)"
    echo "   Status: 401 Unauthorized"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (should return 401)"
    echo "   Status: $status"
    ((FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    echo ""
    echo -e "${YELLOW}Note: Protected endpoints require authentication.${NC}"
    echo -e "${YELLOW}To test with auth, sign in at http://localhost:5174${NC}"
    echo -e "${YELLOW}and get your token from the browser console.${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi
