# Direct+ Deployment Assets

This directory contains ready-to-use templates, scripts, and configuration files for deploying the Direct+ workflow (callback-and-voicemail-with-email) to new Connie accounts.

## Files Overview

### Configuration Templates
- **`environment-variables-template.env`** - Template for Twilio Functions environment variables
- **`terraform-template.tf`** - Infrastructure as Code template for Terraform deployment
- **`studio-flow-template.json`** - Studio Flow JSON template for Direct+ workflow

### Testing Scripts
- **`mailgun-test-script.sh`** - Pre-deployment Mailgun API validation script
- **`deployment-validation-script.sh`** - Comprehensive post-deployment validation

## Usage Instructions

### 1. Pre-Deployment Setup

**Mailgun Testing:**
```bash
# Set configuration variables
export MAILGUN_API_KEY='your-domain-specific-api-key'
export MAILGUN_DOMAIN='voicemail.clientdomain.com'
export ADMIN_EMAIL='admin@clientdomain.com'

# Run Mailgun validation
chmod +x mailgun-test-script.sh
./mailgun-test-script.sh
```

**Environment Variables:**
```bash
# Copy template and customize
cp environment-variables-template.env client-config.env
# Edit client-config.env with actual values
# Add variables to Twilio Functions Console
```

### 2. Infrastructure Deployment

**Terraform Deployment:**
```bash
# Copy and customize terraform template
cp terraform-template.tf main.tf

# Create terraform.tfvars with client configuration
cat << EOF > terraform.tfvars
callback_and_voicemail_with_email_enabled = true
twilio_account_sid = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
twilio_auth_token  = "your-auth-token"
workspace_sid      = "WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
workflow_sid       = "WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
phone_number       = "+18005551234"
admin_email        = "admin@clientdomain.com"
mailgun_domain     = "voicemail.clientdomain.com"
mailgun_api_key    = "your-mailgun-api-key"
organization_name  = "Client Name"
EOF

# Deploy infrastructure
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

**Studio Flow Creation:**
```bash
# If Terraform doesn't create Studio Flow automatically
cp studio-flow-template.json direct-plus-flow.json

# Update placeholders in the JSON file:
# - YOUR-DEPLOYMENT-DOMAIN
# - YOUR-WORKFLOW-SID

# Create flow via CLI
twilio api:studio:v2:flows:create \
  --friendly-name "Direct+ Callback and Voicemail Flow" \
  --status published \
  --definition "$(cat direct-plus-flow.json)"
```

### 3. Post-Deployment Validation

**Comprehensive Testing:**
```bash
# Set all configuration variables
export ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export PHONE_NUMBER="+18005551234"
export ADMIN_EMAIL="admin@clientdomain.com"
export MAILGUN_DOMAIN="voicemail.clientdomain.com"
export MAILGUN_API_KEY="your-api-key"
export DEPLOYMENT_DOMAIN="custom-flex-extensions-serverless-XXXX-dev.twil.io"
export WORKSPACE_SID="WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export WORKFLOW_SID="WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Run validation script
chmod +x deployment-validation-script.sh
./deployment-validation-script.sh
```

## Template Customization

### Environment Variables Template
The `environment-variables-template.env` file includes:
- **Required variables** for Direct+ functionality
- **Optional variables** for advanced customization
- **Security notes** and best practices
- **Testing commands** for validation

### Terraform Template
The `terraform-template.tf` provides:
- **Complete infrastructure** definition
- **Configurable variables** for client customization
- **Resource dependencies** properly defined
- **Output values** for testing and monitoring

### Studio Flow Template
The `studio-flow-template.json` contains:
- **Minimal viable Studio Flow** for Direct+ workflow
- **Placeholder values** for easy customization
- **Correct widget configuration** for callback and voicemail

## Script Features

### Mailgun Test Script
- ✅ **API Authentication** validation
- ✅ **Domain verification** status check
- ✅ **Test email delivery** with basic message
- ✅ **Attachment capability** testing with audio file
- ✅ **Comprehensive error reporting** with solutions

### Deployment Validation Script
- ✅ **Configuration validation** of all required variables
- ✅ **Twilio CLI access** and authentication testing
- ✅ **Resource verification** (workspace, workflow, phone number)
- ✅ **Serverless functions** accessibility testing
- ✅ **Mailgun integration** validation
- ✅ **Email delivery** end-to-end testing
- ✅ **Studio Flow** configuration verification
- ✅ **Network connectivity** testing
- ✅ **Deployment readiness** report generation

## Common Usage Patterns

### Quick Setup Workflow
```bash
# 1. Test Mailgun first
export MAILGUN_API_KEY='...' MAILGUN_DOMAIN='...' ADMIN_EMAIL='...'
./mailgun-test-script.sh

# 2. Deploy with Terraform
cp terraform-template.tf main.tf
# Edit terraform.tfvars
terraform apply -var-file="terraform.tfvars"

# 3. Validate deployment
export ACCOUNT_SID='...' PHONE_NUMBER='...' # ... other vars
./deployment-validation-script.sh
```

### Manual Configuration Workflow
```bash
# 1. Setup environment variables
cp environment-variables-template.env client.env
# Edit client.env and add to Twilio Functions Console

# 2. Create Studio Flow
cp studio-flow-template.json flow.json
# Edit placeholders
twilio api:studio:v2:flows:create --definition "$(cat flow.json)"

# 3. Configure phone number
twilio api:core:incoming-phone-numbers:update \
  --sid PNxxxxxxx --voice-application-sid FWxxxxxxx

# 4. Test deployment
./deployment-validation-script.sh
```

## Error Handling

### Common Issues and Solutions

**Mailgun API Errors:**
- 401 Unauthorized → Check API key type (use domain sending key)
- 404 Domain not found → Verify domain configuration
- DNS issues → Wait 24 hours for propagation

**Terraform Errors:**
- Resource conflicts → Check existing resources
- Permission errors → Verify Twilio account permissions
- Variable validation → Check terraform.tfvars format

**Studio Flow Issues:**
- Invalid JSON → Validate JSON format
- Missing placeholders → Ensure all placeholders replaced
- Flow not appearing → Check Studio Flow creation status

**Validation Script Failures:**
- Missing variables → Set all required environment variables
- Network errors → Check connectivity to Twilio/Mailgun
- Resource not found → Verify SIDs and configurations

## Security Notes

### API Key Management
- Use **domain-specific sending keys** for Mailgun (not private keys)
- Store sensitive values in **environment variables only**
- **Never commit** real credentials to version control
- **Rotate keys quarterly** for security

### Network Security
- All scripts use **HTTPS only** for API calls
- **Connection timeouts** prevent hanging connections
- **Error messages** don't expose sensitive information

### Data Privacy
- Scripts **don't log sensitive data**
- **Test emails** contain only necessary information
- **Validation results** can be shared safely

## Troubleshooting

### Script Debugging
```bash
# Enable verbose output
set -x
./mailgun-test-script.sh

# Check specific components
curl -s --user "api:$MAILGUN_API_KEY" https://api.mailgun.net/v3/$MAILGUN_DOMAIN
twilio api:core:accounts:fetch
```

### Resource Verification
```bash
# Verify Twilio resources
twilio api:taskrouter:v1:workspaces:list
twilio api:studio:v2:flows:list
twilio api:core:incoming-phone-numbers:list

# Check serverless deployment
twilio serverless:list
```

### Email Testing
```bash
# Manual email test
curl -s --user "api:$MAILGUN_API_KEY" \
    https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages \
    -F from="Test <test@$MAILGUN_DOMAIN>" \
    -F to="$ADMIN_EMAIL" \
    -F subject="Manual Test" \
    -F text="Testing email delivery"
```

## Support

For issues with these deployment assets:

1. **Check error messages** - scripts provide detailed error information
2. **Verify configuration** - ensure all placeholders are replaced
3. **Test components individually** - isolate issues to specific components
4. **Review logs** - check Twilio Console and Mailgun dashboard logs
5. **Escalate if needed** - provide complete error output and configuration details

These assets are designed to make Direct+ deployment reliable, repeatable, and thoroughly tested.