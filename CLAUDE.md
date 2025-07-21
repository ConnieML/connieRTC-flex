# Claude AI Agent Context & Workflows

This file provides context and workflows for AI agents working on the ConnieRTC project.

## Project Mission & Philosophy

**ConnieRTC** is a comprehensive digital communication solution specifically designed for **nonprofit organizations and community-based organizations** that provide mission-critical programs and services to people in need.

### Core Values
- **Accessibility First** - All features must be accessible to users with diverse abilities
- **Nonprofit-Focused** - Solutions designed for resource-constrained organizations
- **Community-Driven** - Open source with strong community support
- **Inclusive Design** - Serving diverse communities with varying technical skills

## Project Structure

```
├── docs/                          # Documentation (Docusaurus)
├── plugin-flex-ts-template-v2/    # Frontend (React/TypeScript)
├── serverless-functions/          # Backend (Node.js/Twilio Serverless)
├── infra-as-code/                 # Infrastructure (Terraform)
├── addons/                        # Additional features
├── examples/                      # Example implementations
└── scripts/                       # Automation scripts
```

## Documentation Architecture

### Multi-Audience Approach
The documentation is strategically organized by user type:

**Connie End Users** (Nonprofit staff):
- `end-users/cbo-admins/` - Organization administrators
- `end-users/supervisors/` - Team managers
- `end-users/staff-agents/` - Call center agents

**Connie Developers** (Contributors):
- `developers/general/` - Cross-cutting development topics
- `developers/frontend/` - React/TypeScript development
- `developers/backend/` - Serverless functions development

### Design Principles
1. **Clear user paths** - Immediate audience selection on landing page
2. **Professional branding** - "Connie" prefix in all navigation
3. **Future-proof structure** - Easy to add new audiences/content
4. **Accessibility compliance** - WCAG 2.1 AA standards

## Key Workflows

### Documentation Updates
```bash
# 1. Test locally FIRST
cd docs
npm install  # (first time only)
npm start    # http://localhost:3010

# 2. Make changes and verify in browser
# 3. Commit and deploy
git add docs/
git commit -m "Update documentation: describe changes"
git push origin main  # Auto-deploys via GitHub Pages
```

### CRITICAL: Docusaurus Linking Rules
**Always use absolute paths for internal links to avoid broken link deployment failures:**

```markdown
# ✅ CORRECT - Use absolute paths
[Setup Guide](/end-users/cbo-admins/getting-started)
[API Docs](/developers/backend/api-reference)

# ❌ WRONG - Relative paths cause deployment failures
[Setup Guide](../getting-started)
[API Docs](./api-reference)
[Setup Guide](getting-started)
```

**Why this matters:**
- Docusaurus resolves relative paths differently during build vs dev
- Broken links cause GitHub Pages deployment to fail completely
- Always test locally with `npm run build` before pushing
- Use absolute paths starting with `/` for all internal documentation links

### Development Workflow
```bash
# Start full development environment
npm start  # Runs serverless + plugin + insights proxy

# Individual components
npm run start:serverless  # Port 3001
npm run start:plugin     # Port 3000
npm run start:insights   # Insights proxy
```

## Important Context for AI Agents

### Audience Sensitivity
- **CBO Admins** often have limited technical background
- **Staff Agents** need quick, actionable information during calls
- **Supervisors** focus on team management and reporting
- **Developers** range from beginners to experts

### Writing Guidelines
- **Plain language** - Avoid technical jargon for end users
- **Action-oriented** - Tell users what to do, not just what things are
- **Accessible** - Consider screen readers, low vision, cognitive differences
- **Inclusive** - Use person-first language, avoid assumptions

### Critical Considerations
- **Never assume database expertise** - Many nonprofits use Google Sheets
- **Resource constraints** - Solutions must work with limited budgets
- **Privacy-first** - Data stays in customer systems
- **Graceful degradation** - Systems must work even with limited setup

## Technology Stack Context

### Frontend (Flex Plugin)
- **React + TypeScript** - Type-safe component development
- **Twilio Paste** - Design system for consistency
- **Flex Hooks** - Integration with Twilio Flex platform

### Backend (Serverless Functions)
- **Node.js** - JavaScript runtime
- **Twilio Serverless** - Managed serverless platform
- **Multi-database support** - Google Sheets, MySQL, PostgreSQL, APIs

### Documentation (Docusaurus)
- **React-based** - Allows custom interactive components
- **Multiple sidebars** - Different navigation for different audiences
- **MDX support** - Markdown with React components

## Common Patterns & Standards

### File Naming
- Use kebab-case for files: `getting-started.md`
- Descriptive names: `cbo-admin-setup.md` not `setup.md`
- Consistent numbering: `00_introduction.md`, `01_setup.md`

### Content Structure
```markdown
---
sidebar_label: Short Name
sidebar_position: 1
title: "Full Descriptive Title"
---

# Main Heading

Brief intro explaining what this covers.

## Prerequisites
- ✅ Required item 1
- ✅ Required item 2

## Step-by-Step Guide
[Clear, numbered steps]

## Troubleshooting
[Common issues and solutions]

## Next Steps
[What to do after this guide]
```

### Code Examples
- Always include working examples
- Provide context for what each example does
- Include error handling and edge cases
- Test all code examples before documenting

## Accessibility Guidelines

### Required Checks
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for normal text)
- [ ] All images have descriptive alt text
- [ ] Headings follow logical hierarchy (h1→h2→h3)
- [ ] Links have descriptive text (not "click here")
- [ ] Tables have proper headers
- [ ] Forms have clear labels

### Testing Methods
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode testing
- Text scaling up to 200%

## Git Commit Standards

### Documentation Commits
```bash
git commit -m "Update CBO admin setup guide with accessibility improvements

- Add alt text to all screenshots
- Improve heading structure for screen readers  
- Clarify language for non-technical users
- Add troubleshooting section for common issues

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Development Commits
Follow conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Important URLs & Resources

- **Live Documentation**: https://connieml.github.io/connieRTC-flex/
- **GitHub Repository**: https://github.com/ConnieML/connieRTC-flex
- **Community Forum**: [Community discussions]
- **Professional Services**: [Enterprise support]

## Decision History

### Multi-Audience Documentation (2024)
**Decision**: Split documentation by user type instead of technical area
**Rationale**: 
- CBO admins have different needs than developers
- Reduces cognitive load by showing relevant content only
- Scales better as platform grows
- Improves user experience significantly

**Implementation**: 
- Landing page with audience selection
- Separate directory structure for each audience  
- Multiple sidebar configurations
- Consistent "Connie" branding throughout

### Channel-Based Documentation Structure (2024)
**Decision**: Organize docs by CPaaS communication channels (Voice, Messaging, Socials, Fax, Email)
**Rationale**:
- Startup needs practical organization that can grow organically
- Channel-based structure matches how CPaaS services are naturally categorized
- Allows for both end-user and developer perspectives within each channel
- Provides clear path for adding new docs as services expand

**Implementation**:
- Created `voice/` category under `end-users/cbo-admins/`
- Used Docusaurus `autogenerated` sidebar with `_category_.json` files
- Structured subcategories (e.g., `call-forwarding/`) for specific features
- Started with Cox Communications forwarding doc as first example
- Future channels: messaging, socials, fax, email to be added as needed

### Professional Provider Selection Interface (2024)
**Decision**: Create visual provider logo selection with working navigation
**Rationale**:
- Visual recognition faster than text-based provider lists
- Professional appearance builds trust with CBO administrators
- Scalable pattern for adding new providers
- Clear indication of available vs. coming soon providers

**Implementation**:
- Added provider logos to `/static/img/providers/` (Cox, Xfinity, Spectrum, Verizon)
- Created responsive flex layout with consistent logo sizing
- Used Docusaurus Link component for proper internal navigation
- Implemented visual feedback for available vs. unavailable providers
- Added comprehensive call forwarding overview page with Mermaid flow diagram

### Navigation and Linking Standards (2024)
**Decision**: Establish proper internal linking patterns for Docusaurus
**Critical Learning**: Regular `<a>` tags don't work for internal navigation in Docusaurus
**Solution**: Always use Docusaurus Link component for clickable elements

**Implementation**:
```jsx
import Link from '@docusaurus/Link';
<Link to="/full/path/to/page">Content</Link>
```
- Fixed all sidebar capitalization with `_category_.json` files
- Established consistent navigation patterns
- Created comprehensive README.md with developer guidelines

### Accessibility-First Approach
**Decision**: Make accessibility a top priority, not an afterthought
**Rationale**:
- ConnieRTC serves diverse communities with varying abilities
- Nonprofits often serve vulnerable populations
- Legal compliance (Section 508, ADA)
- Moral imperative for inclusive design

### Professional Services Template Feature Duplication Pattern (2024)
**Decision**: Establish standardized process for creating enhanced versions of existing template features
**Use Case**: When existing features need significant enhancements that could break existing implementations
**Solution**: Complete feature duplication with enhancements rather than modifying originals

**Rationale**:
- Maintains backward compatibility with existing deployments
- Allows independent feature lifecycle management
- Enables A/B testing between original and enhanced versions
- Provides clear upgrade path for organizations

**Implementation Pattern**:
1. **Complete Architecture Duplication** (33+ files minimum)
   - Frontend: `/plugin-flex-ts-template-v2/src/feature-library/[feature-name-with-enhancement]/`
   - Backend: `/serverless-functions/src/functions/features/[feature-name-with-enhancement]/`
   - Infrastructure: `/infra-as-code/terraform/modules/[feature-name-with-enhancement]/`
   - Documentation: `/docs/docs/feature-library/[feature-name-with-enhancement].md`

2. **Independent Configuration System**
   - Separate feature flags in configuration
   - Independent environment variables
   - Distinct Terraform state management
   - Separate import/export functionality in `import_internal_state.sh`

3. **Template Standards Compliance**
   - Follow exact directory structure patterns
   - Use consistent naming conventions (kebab-case)
   - Implement proper TypeScript interfaces
   - Include comprehensive error handling and logging
   - Add Terraform resource management

4. **Enhancement Integration Best Practices**
   - **Mission-Critical Mindset**: All components must work together or fail together
   - **Production-Grade Validation**: Implement comprehensive environment variable validation
   - **Twilio Support Standards**: Follow all recommended patterns for error handling, timeouts, and observability
   - **Non-Breaking Design**: Enhanced features should not interfere with original functionality

**Example Implementation**: `callback-and-voicemail-with-email`
- **Original**: `callback-and-voicemail` (basic functionality)
- **Enhanced**: `callback-and-voicemail-with-email` (adds Mailgun email notifications)
- **Result**: Two independent features that can be deployed separately

**Critical Success Factors**:
- **Complete Independence**: Enhanced feature must be 100% independent of original
- **Template Integration**: Must integrate seamlessly with existing CI/CD and deployment processes
- **Documentation**: Comprehensive setup and troubleshooting documentation required
- **Testing**: Multi-test validation before considering complete
- **Environment Validation**: Robust validation prevents deployment-time failures

## Current State (July 2024)

### Documentation Status
- **Live Site**: https://docs.connie.one/ (GitHub Pages auto-deployment)
- **Structure**: Multi-audience with channel-based organization
- **Content**: Voice channel complete with Cox & Xfinity provider guides
- **Navigation**: Professional logo-based provider selection with working links
- **Developer Resources**: Comprehensive README.md with all patterns and workflows

### Key Files & Patterns
- **Provider Logos**: `/static/img/providers/` (optimized for 180px width, 60px height max)
- **Category Structure**: Use `_category_.json` files for proper navigation labels
- **Internal Links**: Always use `import Link from '@docusaurus/Link'` for clickable elements
- **Content Organization**: `end-users/[type]/[channel]/[feature]/` hierarchy

### Ready for Expansion
- **Messaging Channel**: Directory structure ready, needs content
- **Socials Channel**: Directory structure ready, needs content  
- **Fax Channel**: Directory structure ready, needs content
- **Email Channel**: Directory structure ready, needs content
- **Additional Providers**: Logo + .md file pattern established

### Development Workflow
1. Create content locally following patterns in README.md
2. Test locally with `npm start` at http://localhost:3010
3. Commit with descriptive messages (no AI attribution per user preference)
4. Push to `main` branch for automatic GitHub Pages deployment
5. Deployment typically completes in 2-3 minutes

---

*This file should be updated whenever major architectural decisions are made or workflows change. Future AI agents: please read this entire file before starting work on ConnieRTC.*