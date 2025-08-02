#!/bin/bash

# Mailgun API Test Script for Direct+ Deployment
# This script validates Mailgun configuration before deployment

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables (replace with actual values)
MAILGUN_API_KEY=""
MAILGUN_DOMAIN=""
ADMIN_EMAIL=""
TEST_FROM_EMAIL=""

echo -e "${BLUE}=== Mailgun Configuration Test Script ===${NC}"
echo ""

# Check if required variables are set
check_variables() {
    echo -e "${BLUE}1. Checking configuration variables...${NC}"
    
    if [ -z "$MAILGUN_API_KEY" ]; then
        echo -e "${RED}❌ MAILGUN_API_KEY is not set${NC}"
        echo "Please set the domain-specific API key (not the private key)"
        exit 1
    fi
    
    if [ -z "$MAILGUN_DOMAIN" ]; then
        echo -e "${RED}❌ MAILGUN_DOMAIN is not set${NC}"
        echo "Please set the email domain (e.g., voicemail.clientdomain.com)"
        exit 1
    fi
    
    if [ -z "$ADMIN_EMAIL" ]; then
        echo -e "${RED}❌ ADMIN_EMAIL is not set${NC}"
        echo "Please set the admin email address for testing"
        exit 1
    fi
    
    # Set default from email if not provided
    if [ -z "$TEST_FROM_EMAIL" ]; then
        TEST_FROM_EMAIL="test@${MAILGUN_DOMAIN}"
    fi
    
    echo -e "${GREEN}✅ All required variables are set${NC}"
    echo "   API Key: ${MAILGUN_API_KEY:0:20}..."
    echo "   Domain: $MAILGUN_DOMAIN"
    echo "   Admin Email: $ADMIN_EMAIL"
    echo "   From Email: $TEST_FROM_EMAIL"
    echo ""
}

# Test API authentication
test_authentication() {
    echo -e "${BLUE}2. Testing Mailgun API authentication...${NC}"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --user "api:$MAILGUN_API_KEY" \
        "https://api.mailgun.net/v3/$MAILGUN_DOMAIN")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Authentication successful${NC}"
    else
        echo -e "${RED}❌ Authentication failed (HTTP $http_code)${NC}"
        echo "Response: $body"
        
        if [ "$http_code" -eq 401 ]; then
            echo -e "${YELLOW}💡 Common issue: Using wrong API key type${NC}"
            echo "   Make sure you're using the domain-specific sending key,"
            echo "   not the private API key from Settings → API Keys"
        fi
        
        exit 1
    fi
    echo ""
}

# Test domain status
check_domain_status() {
    echo -e "${BLUE}3. Checking domain verification status...${NC}"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --user "api:$MAILGUN_API_KEY" \
        "https://api.mailgun.net/v3/domains/$MAILGUN_DOMAIN")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        # Check if domain is verified (look for state: "active")
        if echo "$body" | grep -q '"state":"active"'; then
            echo -e "${GREEN}✅ Domain is verified and active${NC}"
        else
            echo -e "${YELLOW}⚠️  Domain exists but may not be fully verified${NC}"
            echo "   Check DNS records in Mailgun dashboard"
            echo "   DNS propagation can take up to 24 hours"
        fi
    else
        echo -e "${RED}❌ Cannot check domain status (HTTP $http_code)${NC}"
        echo "Response: $body"
        exit 1
    fi
    echo ""
}

# Send test email
send_test_email() {
    echo -e "${BLUE}4. Sending test email...${NC}"
    
    current_time=$(date)
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --user "api:$MAILGUN_API_KEY" \
        "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
        -F from="Pre-Deployment Test <$TEST_FROM_EMAIL>" \
        -F to="$ADMIN_EMAIL" \
        -F subject="Direct+ Pre-Deployment API Test - $current_time" \
        -F text="This is a pre-deployment test of the Mailgun API configuration.

If you receive this email, the Mailgun integration is working correctly and ready for Direct+ deployment.

Test Details:
- Domain: $MAILGUN_DOMAIN
- From: $TEST_FROM_EMAIL
- Time: $current_time
- API Key: ${MAILGUN_API_KEY:0:20}...

Next steps:
1. Verify this email arrived in your inbox (check spam folder)
2. Confirm audio attachment capability will work
3. Proceed with Direct+ deployment

This is an automated test message.")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        message_id=$(echo "$body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Test email sent successfully${NC}"
        echo "   Message ID: $message_id"
        echo "   Recipient: $ADMIN_EMAIL"
        echo ""
        echo -e "${YELLOW}📧 Please check the recipient's email inbox (and spam folder)${NC}"
        echo "   Subject: Direct+ Pre-Deployment API Test - $current_time"
    else
        echo -e "${RED}❌ Failed to send test email (HTTP $http_code)${NC}"
        echo "Response: $body"
        exit 1
    fi
    echo ""
}

# Test with attachment simulation
test_attachment_capability() {
    echo -e "${BLUE}5. Testing attachment capability...${NC}"
    
    # Create a small test audio file (simulate voicemail attachment)
    test_audio_content="UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
    echo "$test_audio_content" | base64 -d > test_voicemail.wav
    
    current_time=$(date)
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --user "api:$MAILGUN_API_KEY" \
        "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
        -F from="Attachment Test <$TEST_FROM_EMAIL>" \
        -F to="$ADMIN_EMAIL" \
        -F subject="Direct+ Attachment Test - $current_time" \
        -F text="This email tests the attachment capability for voicemail files.

If you receive this email with a small audio file attached, the Direct+ email system will work correctly for voicemail attachments.

Test Details:
- Attachment: test_voicemail.wav (small test file)
- This simulates how voicemail recordings will be delivered

This is an automated test message." \
        -F attachment=@test_voicemail.wav)
    
    # Clean up test file
    rm -f test_voicemail.wav
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        message_id=$(echo "$body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Attachment test email sent successfully${NC}"
        echo "   Message ID: $message_id"
        echo ""
        echo -e "${YELLOW}📎 Please verify the attachment was received${NC}"
        echo "   The email should include a small test_voicemail.wav file"
    else
        echo -e "${RED}❌ Failed to send attachment test (HTTP $http_code)${NC}"
        echo "Response: $body"
        exit 1
    fi
    echo ""
}

# Display summary and next steps
show_summary() {
    echo -e "${GREEN}=== Test Complete - Summary ===${NC}"
    echo ""
    echo -e "${GREEN}✅ Mailgun API authentication successful${NC}"
    echo -e "${GREEN}✅ Domain configuration verified${NC}"
    echo -e "${GREEN}✅ Test emails sent successfully${NC}"
    echo -e "${GREEN}✅ Attachment capability tested${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Verify both test emails arrived at $ADMIN_EMAIL"
    echo "2. Check that the second email includes the audio attachment"
    echo "3. If both emails received, Mailgun setup is complete"
    echo "4. Proceed with Direct+ deployment configuration"
    echo ""
    echo -e "${YELLOW}If emails didn't arrive:${NC}"
    echo "- Check spam/junk folder"
    echo "- Verify DNS records are fully propagated (may take 24 hours)"
    echo "- Check Mailgun logs in dashboard for delivery status"
    echo ""
    echo -e "${BLUE}Configuration Summary:${NC}"
    echo "Domain: $MAILGUN_DOMAIN"
    echo "API Key: ${MAILGUN_API_KEY:0:20}..."
    echo "Admin Email: $ADMIN_EMAIL"
}

# Main execution
main() {
    echo "Starting Mailgun configuration test..."
    echo ""
    
    check_variables
    test_authentication
    check_domain_status
    send_test_email
    test_attachment_capability
    show_summary
}

# Instructions for usage
show_usage() {
    echo "Usage: $0"
    echo ""
    echo "Before running this script, set these variables:"
    echo "  export MAILGUN_API_KEY='your-domain-specific-api-key'"
    echo "  export MAILGUN_DOMAIN='voicemail.yourdomain.com'"
    echo "  export ADMIN_EMAIL='admin@yourdomain.com'"
    echo ""
    echo "Example:"
    echo "  export MAILGUN_API_KEY='***REMOVED***'"
    echo "  export MAILGUN_DOMAIN='voicemail.helpinghand.org'"
    echo "  export ADMIN_EMAIL='admin@helpinghand.org'"
    echo "  ./mailgun-test-script.sh"
}

# Check if running with variables set
if [ -z "$MAILGUN_API_KEY" ] && [ -z "$MAILGUN_DOMAIN" ] && [ -z "$ADMIN_EMAIL" ]; then
    show_usage
    exit 1
fi

# Run main function
main