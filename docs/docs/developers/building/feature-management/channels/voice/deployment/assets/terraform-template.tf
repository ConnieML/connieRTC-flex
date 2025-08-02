# Direct+ (Callback and Voicemail with Email) Terraform Configuration Template
# This template provides the infrastructure configuration for Direct+ workflow

# Variables for customization
variable "callback_and_voicemail_with_email_enabled" {
  description = "Enable the callback and voicemail with email feature"
  type        = bool
  default     = false
}

variable "twilio_account_sid" {
  description = "Twilio Account SID"
  type        = string
}

variable "twilio_auth_token" {
  description = "Twilio Auth Token"
  type        = string
  sensitive   = true
}

variable "workspace_sid" {
  description = "TaskRouter Workspace SID"
  type        = string
}

variable "workflow_sid" {
  description = "TaskRouter Workflow SID for 'Assign to Anyone'"
  type        = string
}

variable "admin_email" {
  description = "Administrator email for voicemail notifications"
  type        = string
}

variable "mailgun_domain" {
  description = "Mailgun domain for email sending"
  type        = string
}

variable "mailgun_api_key" {
  description = "Mailgun API key for email sending"
  type        = string
  sensitive   = true
}

variable "phone_number" {
  description = "Phone number to configure with Direct+ workflow"
  type        = string
}

variable "organization_name" {
  description = "Organization name for email templates"
  type        = string
  default     = "Organization"
}

# Locals for computed values
locals {
  # Deployment domain (computed from serverless service)
  deployment_domain = "${var.twilio_account_sid}-${terraform.workspace}.twil.io"
  
  # Studio Flow configuration
  studio_flow_definition = templatefile("${path.module}/studio-flow-template.json", {
    deployment_domain = local.deployment_domain
    workflow_sid     = var.workflow_sid
  })
  
  # Environment variables for serverless functions
  serverless_environment_vars = {
    ACCOUNT_SID      = var.twilio_account_sid
    AUTH_TOKEN       = var.twilio_auth_token
    WORKSPACE_SID    = var.workspace_sid
    WORKFLOW_SID     = var.workflow_sid
    ADMIN_EMAIL      = var.admin_email
    MAILGUN_DOMAIN   = var.mailgun_domain
    MAILGUN_API_KEY  = var.mailgun_api_key
    DOMAIN_NAME      = local.deployment_domain
    ORGANIZATION_NAME = var.organization_name
  }
}

# TaskRouter Queue for Direct+ workflow
resource "twilio_taskrouter_queue" "direct_plus_queue" {
  count = var.callback_and_voicemail_with_email_enabled ? 1 : 0
  
  workspace_sid   = var.workspace_sid
  friendly_name   = "Direct+ Support Queue"
  target_workers  = "routing.skills HAS 'support'"
  max_reserved_workers = 3
  task_order      = "FIFO"
  
  assignment_activity_sid = data.twilio_taskrouter_activity.available.sid
  reservation_activity_sid = data.twilio_taskrouter_activity.reserved.sid
}

# TaskRouter Workflow for Direct+ (if custom workflow needed)
resource "twilio_taskrouter_workflow" "direct_plus_workflow" {
  count = var.callback_and_voicemail_with_email_enabled ? 1 : 0
  
  workspace_sid   = var.workspace_sid
  friendly_name   = "Direct+ Callback and Voicemail Workflow"
  
  configuration = jsonencode({
    task_routing = {
      filters = [
        {
          expression = "type == 'callback' OR type == 'voicemail'"
          targets = [
            {
              queue = twilio_taskrouter_queue.direct_plus_queue[0].sid
              timeout = 300
              priority = 5
            }
          ]
        }
      ]
      default_filter = {
        queue = twilio_taskrouter_queue.direct_plus_queue[0].sid
      }
    }
  })
  
  fallback_assignment_callback_url = "https://${local.deployment_domain}/features/callback-and-voicemail-with-email/taskrouter/fallback"
  task_reservation_timeout = 300
}

# Studio Flow for Direct+ workflow
resource "twilio_studio_flow" "direct_plus_flow" {
  count = var.callback_and_voicemail_with_email_enabled ? 1 : 0
  
  friendly_name = "Direct+ Callback and Voicemail with Email Flow"
  status        = "published"
  definition    = local.studio_flow_definition
  
  # Ensure the flow is valid before creating
  validate = true
}

# Phone Number configuration
resource "twilio_phone_number" "direct_plus_number" {
  count = var.callback_and_voicemail_with_email_enabled ? 1 : 0
  
  phone_number = var.phone_number
  
  voice {
    application_sid = twilio_studio_flow.direct_plus_flow[0].sid
  }
  
  # Optional: SMS configuration
  # sms {
  #   application_sid = twilio_studio_flow.direct_plus_flow[0].sid
  # }
}

# Serverless Service for functions
resource "twilio_serverless_service" "direct_plus_service" {
  count = var.callback_and_voicemail_with_email_enabled ? 1 : 0
  
  unique_name   = "direct-plus-service"
  friendly_name = "Direct+ Callback and Voicemail Service"
  
  include_credentials = true
  ui_editable        = false
}

# Serverless Environment
resource "twilio_serverless_environment" "direct_plus_environment" {
  count = var.callback_and_voicemail_with_email_enabled ? 1 : 0
  
  service_sid   = twilio_serverless_service.direct_plus_service[0].sid
  unique_name   = "direct-plus-${terraform.workspace}"
  domain_suffix = terraform.workspace
}

# Environment Variables
resource "twilio_serverless_variable" "direct_plus_vars" {
  for_each = var.callback_and_voicemail_with_email_enabled ? local.serverless_environment_vars : {}
  
  service_sid     = twilio_serverless_service.direct_plus_service[0].sid
  environment_sid = twilio_serverless_environment.direct_plus_environment[0].sid
  key            = each.key
  value          = each.value
}

# Data sources for existing resources
data "twilio_taskrouter_activity" "available" {
  workspace_sid = var.workspace_sid
  friendly_name = "Available"
}

data "twilio_taskrouter_activity" "reserved" {
  workspace_sid = var.workspace_sid
  friendly_name = "Reserved"
}

data "twilio_taskrouter_activity" "busy" {
  workspace_sid = var.workspace_sid
  friendly_name = "Busy"
}

data "twilio_taskrouter_activity" "unavailable" {
  workspace_sid = var.workspace_sid
  friendly_name = "Unavailable"
}

# Outputs
output "direct_plus_deployment_info" {
  value = var.callback_and_voicemail_with_email_enabled ? {
    studio_flow_sid    = twilio_studio_flow.direct_plus_flow[0].sid
    queue_sid         = twilio_taskrouter_queue.direct_plus_queue[0].sid
    workflow_sid      = var.workflow_sid
    deployment_domain = local.deployment_domain
    phone_number      = var.phone_number
    admin_email       = var.admin_email
    mailgun_domain    = var.mailgun_domain
  } : null
  
  description = "Direct+ deployment configuration details"
}

output "serverless_service_info" {
  value = var.callback_and_voicemail_with_email_enabled ? {
    service_sid     = twilio_serverless_service.direct_plus_service[0].sid
    environment_sid = twilio_serverless_environment.direct_plus_environment[0].sid
    domain_name     = twilio_serverless_environment.direct_plus_environment[0].domain_name
  } : null
  
  description = "Serverless service configuration"
  sensitive   = false
}

output "testing_information" {
  value = var.callback_and_voicemail_with_email_enabled ? {
    test_phone_number = var.phone_number
    admin_email       = var.admin_email
    studio_flow_url   = "https://console.twilio.com/us1/develop/studio/flows/${twilio_studio_flow.direct_plus_flow[0].sid}"
    queue_stats_url   = "https://console.twilio.com/us1/develop/taskrouter/workspaces/${var.workspace_sid}/queues/${twilio_taskrouter_queue.direct_plus_queue[0].sid}"
    
    test_scenarios = [
      "1. Call ${var.phone_number} and test direct connection",
      "2. Press * during hold music to access options",
      "3. Press 1 for callback request",
      "4. Press 2 for voicemail recording",
      "5. Verify email delivery to ${var.admin_email}"
    ]
  } : null
  
  description = "Testing information and scenarios"
}

# Example tfvars file content (commented)
/*
# Example terraform.tfvars or local.tfvars configuration:

callback_and_voicemail_with_email_enabled = true

twilio_account_sid = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
twilio_auth_token  = "your-twilio-auth-token"
workspace_sid      = "WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
workflow_sid       = "WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

phone_number = "+18005551234"

admin_email     = "admin@clientdomain.com"
mailgun_domain  = "voicemail.clientdomain.com"
mailgun_api_key = "your-mailgun-domain-specific-api-key"

organization_name = "Client Organization Name"
*/

# Terraform configuration
terraform {
  required_version = ">= 0.14"
  
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "~> 0.4"
    }
  }
}

# Provider configuration
provider "twilio" {
  account_sid   = var.twilio_account_sid
  auth_token    = var.twilio_auth_token
}