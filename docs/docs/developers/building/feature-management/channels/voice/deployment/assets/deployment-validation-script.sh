#!/bin/bash

# Direct+ Deployment Validation Script
# Comprehensive testing script for Direct+ workflow deployment

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration variables (set these before running)
ACCOUNT_SID=""
PHONE_NUMBER=""
ADMIN_EMAIL=""
MAILGUN_DOMAIN=""
MAILGUN_API_KEY=""
DEPLOYMENT_DOMAIN=""
WORKSPACE_SID=""
WORKFLOW_SID=""

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
CRITICAL_FAILURES=()

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}         Direct+ Deployment Validation Script              ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Helper functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

log_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
    if [ "$2" = "critical" ]; then
        CRITICAL_FAILURES+=("$1")
    fi
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if all required variables are set
check_configuration() {
    echo -e "${PURPLE}1. Configuration Variables Check${NC}"
    echo "================================================"
    
    local config_valid=true
    
    if [ -z "$ACCOUNT_SID" ]; then
        log_failure "ACCOUNT_SID is not set" "critical"
        config_valid=false
    else
        log_success "ACCOUNT_SID configured: ${ACCOUNT_SID:0:10}..."
    fi
    
    if [ -z "$PHONE_NUMBER" ]; then
        log_failure "PHONE_NUMBER is not set" "critical"
        config_valid=false
    else
        log_success "Phone Number configured: $PHONE_NUMBER"
    fi
    
    if [ -z "$ADMIN_EMAIL" ]; then
        log_failure "ADMIN_EMAIL is not set" "critical"
        config_valid=false
    else
        log_success "Admin Email configured: $ADMIN_EMAIL"
    fi
    
    if [ -z "$MAILGUN_DOMAIN" ]; then
        log_failure "MAILGUN_DOMAIN is not set" "critical"
        config_valid=false
    else
        log_success "Mailgun Domain configured: $MAILGUN_DOMAIN"
    fi
    
    if [ -z "$MAILGUN_API_KEY" ]; then
        log_failure "MAILGUN_API_KEY is not set" "critical"
        config_valid=false
    else
        log_success "Mailgun API Key configured: ${MAILGUN_API_KEY:0:20}..."
    fi
    
    if [ -z "$DEPLOYMENT_DOMAIN" ]; then
        log_failure "DEPLOYMENT_DOMAIN is not set" "critical"
        config_valid=false
    else
        log_success "Deployment Domain configured: $DEPLOYMENT_DOMAIN"
    fi
    
    if [ -z "$WORKSPACE_SID" ]; then
        log_failure "WORKSPACE_SID is not set" "critical"
        config_valid=false
    else
        log_success "Workspace SID configured: ${WORKSPACE_SID:0:10}..."
    fi
    
    if [ -z "$WORKFLOW_SID" ]; then
        log_failure "WORKFLOW_SID is not set" "critical"
        config_valid=false
    else
        log_success "Workflow SID configured: ${WORKFLOW_SID:0:10}..."
    fi
    
    if [ "$config_valid" = false ]; then
        echo ""
        echo -e "${RED}Critical configuration missing. Please set all required variables.${NC}"
        exit 1
    fi
    
    echo ""
}

# Test Twilio CLI configuration
test_twilio_cli() {
    echo -e "${PURPLE}2. Twilio CLI Configuration Check${NC}"
    echo "================================================"
    
    # Check if Twilio CLI is installed
    if ! command -v twilio &> /dev/null; then
        log_failure "Twilio CLI is not installed" "critical"
        return
    fi
    log_success "Twilio CLI is installed"
    
    # Test CLI authentication
    if twilio api:core:accounts:fetch &> /dev/null; then
        log_success "Twilio CLI authentication successful"
    else
        log_failure "Twilio CLI authentication failed" "critical"
        return
    fi
    
    # Verify account SID matches
    cli_account_sid=$(twilio api:core:accounts:fetch --no-header --properties sid 2>/dev/null | tr -d ' ')
    if [ "$cli_account_sid" = "$ACCOUNT_SID" ]; then
        log_success "Account SID matches CLI configuration"
    else
        log_failure "Account SID mismatch: CLI=$cli_account_sid, Config=$ACCOUNT_SID"
    fi
    
    echo ""
}

# Test Twilio resources
test_twilio_resources() {
    echo -e "${PURPLE}3. Twilio Resources Validation${NC}"
    echo "================================================"
    
    # Check workspace exists
    if twilio api:taskrouter:v1:workspaces:fetch --sid "$WORKSPACE_SID" &> /dev/null; then
        log_success "Workspace exists and accessible"
    else
        log_failure "Cannot access workspace $WORKSPACE_SID" "critical"
    fi
    
    # Check workflow exists
    if twilio api:taskrouter:v1:workspaces:workflows:fetch \
        --workspace-sid "$WORKSPACE_SID" --sid "$WORKFLOW_SID" &> /dev/null; then
        log_success "Workflow exists and accessible"
    else
        log_failure "Cannot access workflow $WORKFLOW_SID" "critical"
    fi
    
    # Check phone number exists and configuration
    phone_config=$(twilio api:core:incoming-phone-numbers:list \
        --phone-number "$PHONE_NUMBER" --no-header --properties voice-url 2>/dev/null | head -1)
    
    if [ -n "$phone_config" ]; then
        log_success "Phone number exists in account"
        if echo "$phone_config" | grep -q "studio"; then
            log_success "Phone number is configured with Studio Flow"
        else
            log_warning "Phone number may not be configured with Studio Flow"
        fi
    else
        log_failure "Phone number $PHONE_NUMBER not found in account" "critical"
    fi
    
    echo ""
}

# Test serverless functions deployment
test_serverless_functions() {
    echo -e "${PURPLE}4. Serverless Functions Check${NC}"
    echo "================================================"
    
    # Test wait-experience function
    wait_experience_url="https://$DEPLOYMENT_DOMAIN/features/callback-and-voicemail-with-email/studio/wait-experience"
    if curl -s -o /dev/null -w "%{http_code}" "$wait_experience_url" | grep -q "200\|302\|401"; then
        log_success "Wait experience function is accessible"
    else
        log_failure "Wait experience function not accessible at $wait_experience_url" "critical"
    fi
    
    # Test email function
    email_function_url="https://$DEPLOYMENT_DOMAIN/features/callback-and-voicemail-with-email/studio/send-voicemail-email"
    if curl -s -o /dev/null -w "%{http_code}" "$email_function_url" | grep -q "200\|302\|401"; then
        log_success "Email function is accessible"
    else
        log_failure "Email function not accessible at $email_function_url" "critical"
    fi
    
    echo ""
}

# Test environment variables
test_environment_variables() {
    echo -e "${PURPLE}5. Environment Variables Check${NC}"
    echo "================================================"
    
    # This test would require Twilio Functions API access to check environment variables
    # For now, we'll indicate what should be checked
    log_info "Environment variables to verify in Twilio Console:"
    echo "   - ADMIN_EMAIL: $ADMIN_EMAIL"
    echo "   - MAILGUN_DOMAIN: $MAILGUN_DOMAIN"
    echo "   - MAILGUN_API_KEY: ${MAILGUN_API_KEY:0:20}..."
    
    log_warning "Manual verification required: Check Functions environment variables"
    
    echo ""
}

# Test Mailgun configuration
test_mailgun_configuration() {
    echo -e "${PURPLE}6. Mailgun Configuration Test${NC}"
    echo "================================================"
    
    # Test API authentication
    mailgun_response=$(curl -s -w "HTTPSTATUS:%{http_code}" --user "api:$MAILGUN_API_KEY" \
        "https://api.mailgun.net/v3/$MAILGUN_DOMAIN" 2>/dev/null)
    
    http_code=$(echo $mailgun_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" -eq 200 ]; then
        log_success "Mailgun API authentication successful"
    else
        log_failure "Mailgun API authentication failed (HTTP $http_code)" "critical"
    fi
    
    # Check domain status
    domain_response=$(curl -s -w "HTTPSTATUS:%{http_code}" --user "api:$MAILGUN_API_KEY" \
        "https://api.mailgun.net/v3/domains/$MAILGUN_DOMAIN" 2>/dev/null)
    
    domain_http_code=$(echo $domain_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    domain_body=$(echo $domain_response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$domain_http_code" -eq 200 ]; then
        if echo "$domain_body" | grep -q '"state":"active"'; then
            log_success "Mailgun domain is verified and active"
        else
            log_warning "Mailgun domain exists but may not be fully verified"
        fi
    else
        log_failure "Cannot verify Mailgun domain status"
    fi
    
    echo ""
}

# Test email delivery
test_email_delivery() {
    echo -e "${PURPLE}7. Email Delivery Test${NC}"
    echo "================================================"
    
    current_time=$(date)
    test_subject="Direct+ Deployment Validation - $current_time"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --user "api:$MAILGUN_API_KEY" \
        "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
        -F from="Deployment Test <test@$MAILGUN_DOMAIN>" \
        -F to="$ADMIN_EMAIL" \
        -F subject="$test_subject" \
        -F text="This is an automated test email from the Direct+ deployment validation script.

Deployment Details:
- Phone Number: $PHONE_NUMBER
- Deployment Domain: $DEPLOYMENT_DOMAIN
- Workspace: $WORKSPACE_SID
- Workflow: $WORKFLOW_SID
- Test Time: $current_time

If you receive this email, the email integration is working correctly.

Next steps:
1. Verify this email arrived
2. Test the complete voice workflow
3. Confirm voicemail emails work end-to-end

This is an automated message from the deployment validation script." 2>/dev/null)
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" -eq 200 ]; then
        message_id=$(echo $response | sed -e 's/HTTPSTATUS:.*//g' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        log_success "Validation email sent successfully"
        log_info "Message ID: $message_id"
        log_info "Check $ADMIN_EMAIL for the test email"
    else
        log_failure "Failed to send validation email (HTTP $http_code)" "critical"
    fi
    
    echo ""
}

# Test Studio Flow configuration
test_studio_flow() {
    echo -e "${PURPLE}8. Studio Flow Configuration${NC}"
    echo "================================================"
    
    # List Studio Flows to find the Direct+ flow
    flows_output=$(twilio api:studio:v2:flows:list --no-header --properties friendly-name,sid 2>/dev/null)
    
    if echo "$flows_output" | grep -q "Callback.*Email\|Direct.*Plus\|Template.*Example.*Callback"; then
        log_success "Direct+ Studio Flow found in account"
        
        # Check if phone number is configured with a Studio Flow
        phone_config=$(twilio api:core:incoming-phone-numbers:list \
            --phone-number "$PHONE_NUMBER" --no-header --properties voice-url 2>/dev/null)
        
        if echo "$phone_config" | grep -q "studio"; then
            log_success "Phone number is configured with Studio Flow"
        else
            log_failure "Phone number is not configured with Studio Flow"
        fi
    else
        log_failure "Direct+ Studio Flow not found" "critical"
        log_info "Available flows:"
        echo "$flows_output" | head -5
    fi
    
    echo ""
}

# Network and connectivity tests
test_connectivity() {
    echo -e "${PURPLE}9. Network Connectivity Test${NC}"
    echo "================================================"
    
    # Test Twilio API connectivity
    if curl -s --connect-timeout 10 https://api.twilio.com > /dev/null; then
        log_success "Twilio API connectivity successful"
    else
        log_failure "Cannot connect to Twilio API"
    fi
    
    # Test Mailgun API connectivity
    if curl -s --connect-timeout 10 https://api.mailgun.net > /dev/null; then
        log_success "Mailgun API connectivity successful"
    else
        log_failure "Cannot connect to Mailgun API"
    fi
    
    # Test deployment domain
    if curl -s --connect-timeout 10 "https://$DEPLOYMENT_DOMAIN" > /dev/null; then
        log_success "Deployment domain is accessible"
    else
        log_failure "Cannot connect to deployment domain"
    fi
    
    echo ""
}

# Generate deployment readiness report
generate_report() {
    echo -e "${PURPLE}10. Deployment Readiness Report${NC}"
    echo "================================================"
    
    total_tests=$((TESTS_PASSED + TESTS_FAILED))
    pass_rate=$((TESTS_PASSED * 100 / total_tests))
    
    echo -e "${BLUE}Test Results Summary:${NC}"
    echo "   Tests Passed: $TESTS_PASSED"
    echo "   Tests Failed: $TESTS_FAILED"
    echo "   Success Rate: $pass_rate%"
    echo ""
    
    if [ ${#CRITICAL_FAILURES[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ DEPLOYMENT READY${NC}"
        echo ""
        echo -e "${GREEN}All critical tests passed. The Direct+ deployment should work correctly.${NC}"
        echo ""
        echo -e "${BLUE}Next Steps:${NC}"
        echo "1. Verify the test email was received at $ADMIN_EMAIL"
        echo "2. Perform end-to-end manual testing:"
        echo "   - Call $PHONE_NUMBER"
        echo "   - Test hold music and options menu"
        echo "   - Test callback option (press *,1)"
        echo "   - Test voicemail option (press *,2)"
        echo "   - Verify voicemail email delivery"
        echo "3. Confirm client acceptance"
        echo "4. Set up monitoring and maintenance schedule"
        
    else
        echo -e "${RED}❌ DEPLOYMENT NOT READY${NC}"
        echo ""
        echo -e "${RED}Critical failures detected:${NC}"
        for failure in "${CRITICAL_FAILURES[@]}"; do
            echo "   • $failure"
        done
        echo ""
        echo -e "${YELLOW}Resolve these issues before proceeding with deployment.${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Configuration Summary:${NC}"
    echo "   Phone Number: $PHONE_NUMBER"
    echo "   Admin Email: $ADMIN_EMAIL"
    echo "   Mailgun Domain: $MAILGUN_DOMAIN"
    echo "   Deployment Domain: $DEPLOYMENT_DOMAIN"
    echo "   Workspace: $WORKSPACE_SID"
    echo "   Workflow: $WORKFLOW_SID"
    echo ""
}

# Usage instructions
show_usage() {
    echo "Direct+ Deployment Validation Script"
    echo ""
    echo "Usage: $0"
    echo ""
    echo "Before running, set these environment variables:"
    echo "  export ACCOUNT_SID='ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'"
    echo "  export PHONE_NUMBER='+18005551234'"
    echo "  export ADMIN_EMAIL='admin@clientdomain.com'"
    echo "  export MAILGUN_DOMAIN='voicemail.clientdomain.com'"
    echo "  export MAILGUN_API_KEY='your-domain-specific-api-key'"
    echo "  export DEPLOYMENT_DOMAIN='custom-flex-extensions-serverless-XXXX-dev.twil.io'"
    echo "  export WORKSPACE_SID='WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'"
    echo "  export WORKFLOW_SID='WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'"
    echo ""
    echo "Example:"
    echo "  export ACCOUNT_SID='ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'"
    echo "  export PHONE_NUMBER='+18005551234'"
    echo "  export ADMIN_EMAIL='admin@helpinghand.org'"
    echo "  export MAILGUN_DOMAIN='voicemail.helpinghand.org'"
    echo "  export MAILGUN_API_KEY='key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'"
    echo "  export DEPLOYMENT_DOMAIN='custom-flex-extensions-serverless-4044-dev.twil.io'"
    echo "  export WORKSPACE_SID='WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'"
    echo "  export WORKFLOW_SID='WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'"
    echo "  ./deployment-validation-script.sh"
}

# Main execution
main() {
    check_configuration
    test_twilio_cli
    test_twilio_resources
    test_serverless_functions
    test_environment_variables
    test_mailgun_configuration
    test_email_delivery
    test_studio_flow
    test_connectivity
    generate_report
}

# Check if all required variables are set
if [ -z "$ACCOUNT_SID" ] || [ -z "$PHONE_NUMBER" ] || [ -z "$ADMIN_EMAIL" ] || \
   [ -z "$MAILGUN_DOMAIN" ] || [ -z "$MAILGUN_API_KEY" ] || [ -z "$DEPLOYMENT_DOMAIN" ] || \
   [ -z "$WORKSPACE_SID" ] || [ -z "$WORKFLOW_SID" ]; then
    show_usage
    exit 1
fi

# Run main validation
main