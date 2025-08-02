---
sidebar_label: Deployment Kit
sidebar_position: 1
title: "Direct+ Deployment Kit"
---

# Direct+ Deployment Kit

Complete deployment solution for implementing the Direct+ workflow (callback-and-voicemail-with-email) on new Connie accounts. This kit provides everything needed for reliable, repeatable deployments.

:::tip For Claude Agents
This deployment kit is specifically designed to be followed by Claude agents. Each guide includes step-by-step instructions, validation commands, and troubleshooting procedures.
:::

## What is Direct+?

**Direct+** is the professional-grade voice workflow that provides:
- 📞 **Direct agent connection** with professional hold music
- ⭐ **In-queue options** - Press * for callback or voicemail
- 📧 **Email notifications** with voicemail recordings as attachments
- 🎯 **Complete Flex integration** for seamless task management

**Caller Experience:**
1. Professional greeting → Queue with hold music
2. Press * anytime for options menu
3. Option 1: Request callback (maintain queue position)
4. Option 2: Leave voicemail message
5. Seamless agent connection when available

**Administrator Experience:**
1. Instant email alerts for new voicemails
2. Audio recordings attached as .wav files  
3. Transcriptions included when available
4. Complete call metadata and context

---

## Deployment Kit Components

### 📋 Planning & Preparation
- **[Configuration Template](/developers/building/feature-management/channels/voice/deployment/configuration-template)** - Gather all client requirements systematically
- **[Pre-Deployment Checklist](/developers/building/feature-management/channels/voice/deployment/pre-deployment-checklist)** - Validate prerequisites and access

### 🚀 Implementation Guide  
- **[Direct+ Deployment Guide](/developers/building/feature-management/channels/voice/deployment/direct-plus-deployment-guide)** - Complete step-by-step deployment process
- **[Deployment Assets](/developers/building/feature-management/channels/voice/deployment/assets/)** - Ready-to-use templates, scripts, and configuration files

### 🧪 Testing & Validation
- **Automated testing scripts** for pre and post-deployment validation
- **Email delivery testing** with Mailgun integration
- **End-to-end workflow verification** procedures

---

## Deployment Process Overview

| Phase | Duration | Key Activities | Deliverables |
|-------|----------|---------------|--------------|
| **Planning** | 30 mins | Client info gathering, access validation | Completed configuration template |
| **Email Setup** | 2-24 hours | Mailgun account, DNS configuration | Working email integration |
| **Implementation** | 45 mins | Twilio setup, code deployment | Deployed Direct+ workflow |
| **Testing** | 30 mins | End-to-end validation, client training | Verified working system |
| **Handoff** | 15 mins | Documentation, monitoring setup | Client acceptance |

**Total Time:** 2-26 hours (depending on DNS propagation)

---

## Quick Start Guide

### For Experienced Deployers

```bash
# 1. Gather client configuration
# Use: Configuration Template

# 2. Validate prerequisites  
# Use: Pre-Deployment Checklist

# 3. Test email provider
export MAILGUN_API_KEY='...' MAILGUN_DOMAIN='...' ADMIN_EMAIL='...'
./assets/mailgun-test-script.sh

# 4. Deploy infrastructure
# Follow: Direct+ Deployment Guide

# 5. Validate deployment
export ACCOUNT_SID='...' PHONE_NUMBER='...' # ... set all vars
./assets/deployment-validation-script.sh

# 6. Perform manual testing
# Call phone number, test complete workflow
```

### For New Deployers

1. **Start with [Configuration Template](/developers/building/feature-management/channels/voice/deployment/configuration-template)**
   - Systematically gather all client information
   - Validate domain access and email requirements

2. **Complete [Pre-Deployment Checklist](/developers/building/feature-management/channels/voice/deployment/pre-deployment-checklist)**  
   - Verify all access permissions
   - Confirm Twilio resources availability

3. **Follow [Direct+ Deployment Guide](/developers/building/feature-management/channels/voice/deployment/direct-plus-deployment-guide)**
   - Step-by-step implementation process
   - Built-in validation and troubleshooting

4. **Use [Deployment Assets](/developers/building/feature-management/channels/voice/deployment/assets/)**
   - Ready-to-use scripts and templates
   - Automated testing and validation tools

---

## Success Criteria

### Technical Validation
- [ ] Phone number connects to Studio Flow
- [ ] Hold music plays during queue wait
- [ ] * key activates options menu correctly
- [ ] Callback option (1) creates tasks in Flex
- [ ] Voicemail option (2) records messages successfully
- [ ] Email notifications arrive within 5 minutes
- [ ] Email includes audio attachment and transcription
- [ ] Flex agents can handle tasks normally

### Client Acceptance
- [ ] Client successfully tests complete workflow
- [ ] Audio quality meets expectations
- [ ] Email formatting and content approved
- [ ] Client understands ongoing maintenance
- [ ] Monitoring and support procedures established

---

## Common Deployment Scenarios

### Standard Business
- **Profile:** 10-50 employees, moderate call volume
- **Configuration:** Single admin email, standard greeting
- **Timeline:** 4-6 hours total (including DNS wait)
- **Complexity:** Low

### Enterprise Deployment  
- **Profile:** 100+ employees, high call volume
- **Configuration:** Multiple admin emails, custom branding
- **Timeline:** 6-8 hours total (including testing)
- **Complexity:** Medium

### Healthcare/Compliance
- **Profile:** HIPAA requirements, secure handling
- **Configuration:** Encrypted email, compliance features
- **Timeline:** 8-12 hours (additional security testing)
- **Complexity:** High

---

## Support & Troubleshooting

### Built-in Validation
- ✅ **Pre-deployment testing** prevents 90% of failures
- ✅ **Automated validation scripts** catch configuration issues
- ✅ **Step-by-step error handling** in all guides
- ✅ **Rollback procedures** for quick recovery

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|---------|
| "Option not available" | Wrong workflow SID | Update wait-experience.js |
| No emails received | Wrong API key type | Use domain sending key |
| Flow not in phone config | Studio Flow creation failed | Use CLI creation method |
| Tasks not created | Function deployment issue | Check logs, redeploy |

### Escalation Path
1. **Self-troubleshooting** - Use error codes reference
2. **Validation scripts** - Run automated diagnostics  
3. **Manual testing** - Isolate specific components
4. **Professional services** - Escalate complex issues

---

## Quality Assurance

### Testing Coverage
- **Email Integration:** API authentication, delivery, attachments
- **Voice Workflow:** Call flow, options menu, recording quality
- **Flex Integration:** Task creation, routing, agent experience
- **Error Handling:** Failure scenarios, rollback procedures

### Performance Standards
- **Call Connection:** 99%+ success rate
- **Email Delivery:** Less than 5 minutes from voicemail
- **Audio Quality:** Clear recording, under 25MB attachment size
- **System Uptime:** 99.9% availability target

### Documentation Standards
- **Step-by-step procedures** with validation commands
- **Copy-paste ready** code and configuration
- **Error prevention** through comprehensive checklists
- **Troubleshooting guides** with specific solutions

---

## Deployment Kit Benefits

### For Deployers
- 🎯 **Reduced deployment time** from days to hours
- 🛡️ **Error prevention** through comprehensive validation
- 📚 **Consistent documentation** for all deployments
- 🔧 **Ready-to-use tools** and automation scripts

### For Clients
- ⚡ **Faster go-live** with reliable deployment process
- 📈 **Higher success rate** due to thorough testing
- 🎓 **Better understanding** through clear documentation
- 🔒 **Confidence** in professional implementation

### For Organizations
- 📊 **Standardized process** across all deployments
- 💰 **Reduced support costs** through prevention
- 🚀 **Scalable deployment** methodology
- 📋 **Audit trail** for compliance requirements

---

## Getting Started

**Ready to deploy Direct+?**

1. **New to Direct+ deployments:** Start with [Configuration Template](/developers/building/feature-management/channels/voice/deployment/configuration-template)
2. **Experienced deployer:** Jump to [Pre-Deployment Checklist](/developers/building/feature-management/channels/voice/deployment/pre-deployment-checklist) 
3. **Need deployment assets:** Browse [Ready-to-Use Assets](/developers/building/feature-management/channels/voice/deployment/assets/)
4. **Technical reference:** See [Deployment Guide](/developers/building/feature-management/channels/voice/deployment/direct-plus-deployment-guide)

**Questions or issues?**
- Check the troubleshooting sections in each guide
- Use validation scripts to diagnose issues
- Escalate to professional services if needed

---

The Direct+ Deployment Kit ensures consistent, reliable deployments of the callback-and-voicemail-with-email workflow. Follow the guides systematically for successful client onboarding every time.