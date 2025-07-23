#!/bin/bash

# ConnieRTC Callback-and-Voicemail-with-Email Complete Workflow Test
# This script validates the complete deployment and functionality

set -e  # Exit on any error

echo "🧪 ConnieRTC Callback-and-Voicemail-with-Email Workflow Test"
echo "============================================================"

# Configuration - Update these values for your deployment
ACCOUNT_SID=${ACCOUNT_SID:-"AC..."}
AUTH_TOKEN=${AUTH_TOKEN:-"your-auth-token"}
PHONE_NUMBER=${PHONE_NUMBER:-"+1..."}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@example.com"}
MAILGUN_DOMAIN=${MAILGUN_DOMAIN:-"voicemail.example.com"}
MAILGUN_API_KEY=${MAILGUN_API_KEY:-"your-mailgun-api-key"}
DEPLOYMENT_DOMAIN=${DEPLOYMENT_DOMAIN:-"custom-flex-extensions-serverless-XXXX-dev.twil.io"}
WORKFLOW_SID=${WORKFLOW_SID:-"WW..."}

echo ""
echo "📋 Pre-Flight Checks"
echo "--------------------"

# 1. Verify Twilio CLI is configured
echo -n "🔍 Checking Twilio CLI configuration... "
if ! command -v twilio &> /dev/null; then
    echo "❌ Twilio CLI not found. Please install and configure it."
    exit 1
fi

CURRENT_PROFILE=$(twilio profiles:list | grep "true" | awk '{print $1}' || echo "none")
if [ "$CURRENT_PROFILE" = "none" ]; then
    echo "❌ No active Twilio profile found. Run 'twilio login' first."
    exit 1
fi
echo "✅ Active profile: $CURRENT_PROFILE"

# 2. Test Mailgun API credentials
echo -n "📧 Testing Mailgun API credentials... "
MAILGUN_TEST=$(curl -s -w "%{http_code}" --user "api:${MAILGUN_API_KEY}" \
    https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages \
    -F from="Test <test@${MAILGUN_DOMAIN}>" \
    -F to="${ADMIN_EMAIL}" \
    -F subject="Pre-Test API Verification" \
    -F text="Testing Mailgun API before workflow test." \
    -o /tmp/mailgun_response.txt)

if [ "$MAILGUN_TEST" = "200" ]; then
    echo "✅ Mailgun API working"
    MESSAGE_ID=$(cat /tmp/mailgun_response.txt | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   📨 Test email sent: $MESSAGE_ID"
else
    echo "❌ Mailgun API failed (HTTP $MAILGUN_TEST)"
    echo "   Response: $(cat /tmp/mailgun_response.txt)"
    if [ "$MAILGUN_TEST" = "401" ]; then
        echo "   💡 Check: Using domain-specific sending key (not private key)?"
    fi
    exit 1
fi

# 3. Verify serverless functions are deployed
echo -n "⚡ Checking serverless function deployment... "
WAIT_EXPERIENCE_TEST=$(curl -s -w "%{http_code}" -o /tmp/wait_test.txt \
    "https://${DEPLOYMENT_DOMAIN}/features/callback-and-voicemail-with-email/studio/wait-experience?mode=test")

if [[ "$WAIT_EXPERIENCE_TEST" == "2"* ]]; then
    echo "✅ Wait experience function accessible"
else
    echo "❌ Wait experience function not accessible (HTTP $WAIT_EXPERIENCE_TEST)"
    echo "   Check deployment domain: https://${DEPLOYMENT_DOMAIN}"
    exit 1
fi

# 4. Check environment variables in deployment
echo "🔧 Verifying environment variables..."
echo "   ADMIN_EMAIL: ${ADMIN_EMAIL:0:10}..."
echo "   MAILGUN_DOMAIN: $MAILGUN_DOMAIN"
echo "   MAILGUN_API_KEY: ${MAILGUN_API_KEY:0:15}..."

echo ""
echo "🎯 Studio Flow Configuration Test"
echo "----------------------------------"

# 5. Verify Studio Flow exists and is configured
echo "📱 Checking Studio Flow configuration..."

# Check if we have existing flows
EXISTING_FLOWS=$(twilio api:studio:v2:flows:list --limit 50 | grep -i "callback.*email" || echo "none")
if [ "$EXISTING_FLOWS" != "none" ]; then
    echo "✅ Found existing callback-with-email flows:"
    echo "$EXISTING_FLOWS"
else
    echo "⚠️  No callback-with-email flows found"
    echo "   Use: twilio api:studio:v2:flows:create --friendly-name 'Test Flow' --status published --definition '\$(cat test-callback-voicemail-email-flow.json)'"
fi

echo ""
echo "🎬 Manual Test Instructions"
echo "----------------------------"
echo "To complete the test, perform these manual steps:"
echo ""
echo "1. 📞 Call the phone number: $PHONE_NUMBER"
echo "2. ⭐ When you hear hold music, press * (star)"
echo "3. 2️⃣  Press 2 to leave a voicemail"
echo "4. 🎤 Record a test message (say your name and timestamp)"
echo "5. 📱 Hang up or press * to finish recording"
echo ""
echo "Expected Results:"
echo "✅ Voicemail task appears in Flex queue"
echo "✅ Email sent to: $ADMIN_EMAIL"
echo "✅ Email contains call details and transcription"
echo "✅ Audio file (.wav) attached to email"

echo ""
echo "🔍 Monitoring URLs"
echo "-------------------"
echo "Email Function Logs:"
echo "https://console.twilio.com → Functions & Assets → Services → Live Logs"
echo ""
echo "Direct Function URLs:"
echo "• Wait Experience: https://${DEPLOYMENT_DOMAIN}/features/callback-and-voicemail-with-email/studio/wait-experience"
echo "• Email Sender: https://${DEPLOYMENT_DOMAIN}/features/callback-and-voicemail-with-email/studio/send-voicemail-email"

echo ""
echo "⚠️  Common Troubleshooting"
echo "--------------------------"
echo "If 'option not available' error:"
echo "  → Check workflow SID in wait-experience.protected.js line 135"
echo "  → Current: $WORKFLOW_SID"
echo ""
echo "If no email received:"
echo "  → Check Mailgun logs at mailgun.com dashboard"
echo "  → Verify DNS records for $MAILGUN_DOMAIN"
echo "  → Check spam folder"
echo ""
echo "If 401/403 email errors:"
echo "  → Verify using domain-specific sending key"
echo "  → Not the private API key from Settings"

echo ""
echo "🚀 Test Setup Complete!"
echo "Ready to test the complete voicemail-to-email workflow."