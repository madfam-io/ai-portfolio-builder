# Security Policy

## Reporting Security Vulnerabilities

MADFAM takes the security of our software seriously. If you believe you have found a security vulnerability in PRISMA, please report it to us as described below.

## Responsible Disclosure

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@madfam.io**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information (as much as you can provide):

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Disclosure Timeline

- **Initial Report**: Send to security@madfam.io
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Depends on severity
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium: 30-60 days
  - Low: 60-90 days

## What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your report
- **Communication**: We'll keep you informed about our progress
- **Credit**: We'll credit you for the discovery (unless you prefer to remain anonymous)
- **Updates**: We'll notify you when the issue is fixed

## Security Update Process

1. We'll confirm the problem and determine affected versions
2. We'll prepare fixes for all supported releases
3. We'll release the fixes as soon as possible

## Out of Scope

The following are considered out of scope:

- Denial of Service (DoS) attacks
- Social engineering attacks
- Attacks requiring physical access to a user's device
- Attacks on third-party services or infrastructure

## Safe Harbor

Any activities conducted in a manner consistent with this policy will be considered authorized conduct and we will not initiate legal action against you. If legal action is initiated by a third party against you in connection with activities conducted under this policy, we will take steps to make it known that your actions were conducted in compliance with this policy.

## Recognition

We maintain a [Security Hall of Fame](./SECURITY-HALL-OF-FAME.md) to recognize security researchers who have responsibly disclosed vulnerabilities.

## Current Security Measures

PRISMA implements the following security measures:

### Authentication & Authorization
- Supabase Auth with secure session management
- Role-based access control (RBAC)
- Multi-factor authentication support

### Data Protection
- Encryption at rest for sensitive data
- Encryption in transit (HTTPS only)
- Input validation and sanitization
- SQL injection prevention

### Infrastructure Security
- Content Security Policy (CSP) headers
- CORS properly configured
- Rate limiting on API endpoints
- Secure cookie settings

### Code Security
- Regular dependency updates
- Automated security scanning in CI/CD
- Code review requirements
- No secrets in code (environment variables only)

## Security Best Practices for Contributors

When contributing to PRISMA:

1. **Never commit secrets**: Use environment variables
2. **Validate input**: Always validate and sanitize user input
3. **Use parameterized queries**: Prevent SQL injection
4. **Implement proper authentication**: Check user permissions
5. **Keep dependencies updated**: Regularly update packages
6. **Follow OWASP guidelines**: Implement security best practices

## Contact

**Security Issues**: security@madfam.io  
**General Support**: support@madfam.io  
**Response Time**: 48 hours

Thank you for helping keep PRISMA and our users safe!

---

*Last updated: March 1, 2025*