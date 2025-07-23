#!/bin/bash

# NSS Voicemail-Only Deployment Script
# This script deploys the voicemail-only-with-email feature to NSS production

set -e  # Exit on any error

echo "🚀 NSS Voicemail-Only Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src/functions/features/voicemail-only-with-email" ]; then
    echo "❌ Error: Must run from serverless-functions directory"
    exit 1
fi

# Step 1: Verify Twilio CLI profile
echo ""
echo "Step 1: Verifying Twilio CLI profile..."
echo "Current profiles:"
twilio profiles:list

echo ""
read -p "Is the NSS Production profile active? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please activate NSS profile with: twilio profiles:use NSS-Production"
    exit 1
fi

# Step 2: Verify environment variables
echo ""
echo "Step 2: Checking environment variables..."
required_vars=(
    "ACCOUNT_SID"
    "AUTH_TOKEN"
    "TWILIO_FLEX_WORKSPACE_SID"
    "ADMIN_EMAIL"
    "MAILGUN_DOMAIN"
    "MAILGUN_API_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env; then
        echo "✅ $var is set"
    else
        echo "❌ $var is missing"
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo ""
    echo "❌ Error: Missing required environment variables: ${missing_vars[*]}"
    echo "Please update .env file and try again"
    exit 1
fi

# Step 3: Test Mailgun credentials
echo ""
echo "Step 3: Testing Mailgun API credentials..."
MAILGUN_DOMAIN=$(grep "^MAILGUN_DOMAIN=" .env | cut -d'=' -f2)
MAILGUN_API_KEY=$(grep "^MAILGUN_API_KEY=" .env | cut -d'=' -f2)
ADMIN_EMAIL=$(grep "^ADMIN_EMAIL=" .env | cut -d'=' -f2)

echo "Testing email send to: $ADMIN_EMAIL"
echo "Using domain: $MAILGUN_DOMAIN"

curl -s -w "\nHTTP Status: %{http_code}\n" --user "api:$MAILGUN_API_KEY" \
    https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages \
    -F from="Test <test@$MAILGUN_DOMAIN>" \
    -F to="$ADMIN_EMAIL" \
    -F subject="NSS Voicemail-Only Pre-Deployment Test" \
    -F text="Testing Mailgun API credentials before voicemail-only deployment. If you receive this, the API is working correctly."

echo ""
read -p "Did you receive the test email? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please verify Mailgun credentials and try again"
    exit 1
fi

# Step 4: Deploy serverless functions
echo ""
echo "Step 4: Deploying serverless functions..."
echo "This will deploy ALL functions including the new voicemail-only feature"
read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

npm run deploy

# Capture deployment domain
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Please note your deployment domain (e.g., custom-flex-extensions-serverless-1343-dev.twil.io)"
read -p "Enter your deployment domain (without https://): " DEPLOYMENT_DOMAIN

# Step 5: Update Studio Flow JSON with correct domain
echo ""
echo "Step 5: Creating Studio Flow..."
sed "s/custom-flex-extensions-serverless-1343-dev.twil.io/$DEPLOYMENT_DOMAIN/g" \
    nss-voicemail-only-flow.json > nss-voicemail-only-flow-deployed.json

echo "Studio Flow JSON created with correct domain"

# Step 6: Deploy Studio Flow
echo ""
echo "Step 6: Deploying Studio Flow to Twilio..."
read -p "Deploy Studio Flow now? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping Studio Flow deployment. You can deploy manually with:"
    echo "twilio api:studio:v2:flows:create --friendly-name \"NSS Voicemail Only\" --status published --definition \"\$(cat nss-voicemail-only-flow-deployed.json)\""
else
    twilio api:studio:v2:flows:create \
        --friendly-name "NSS Voicemail Only" \
        --status published \
        --definition "$(cat nss-voicemail-only-flow-deployed.json)"
    
    echo ""
    echo "✅ Studio Flow deployed successfully!"
fi

# Step 7: Final instructions
echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Go to Twilio Console > Phone Numbers"
echo "2. Select the phone number to configure"
echo "3. In Voice Configuration:"
echo "   - Select 'Webhook, TwiML Bin, Function, Studio Flow, Proxy Service'"
echo "   - Choose 'Studio Flow'"
echo "   - Select 'NSS Voicemail Only'"
echo "4. Save the configuration"
echo ""
echo "Test by:"
echo "1. Calling the configured number"
echo "2. Leaving a test voicemail"
echo "3. Verifying email receipt and Flex task creation"
echo ""
echo "Function URLs:"
echo "- Voicemail: https://$DEPLOYMENT_DOMAIN/features/voicemail-only-with-email/voicemail-greeting"
echo "- Email: https://$DEPLOYMENT_DOMAIN/features/voicemail-only-with-email/send-voicemail-email"
echo ""
echo "Monitor logs with:"
echo "twilio serverless:logs --service-name YOUR-SERVICE --tail"