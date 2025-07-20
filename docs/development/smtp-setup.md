# SMTP Server Setup for Development

## Overview

Hatchgrid supports multiple SMTP server options for development and testing. This document provides guidance on setting up and configuring SMTP servers for your development environment.

## Available SMTP Servers

### 1. GreenMail (Default)

GreenMail is a test suite for email servers that provides a comprehensive set of email protocols and a web interface.

- **SMTP Port**: 3025
- **Web Interface**: http://localhost:8080
- **Configuration**: See [Email Testing with GreenMail](../conventions/email-testing.md)

### 2. MailDev

MailDev is a simple SMTP server with a clean web interface for viewing and testing emails.

- **SMTP Port**: 1025
- **Web Interface**: http://localhost:1080
- **Configuration**: See [MailDev Setup](maildev-setup.md)

## Switching Between SMTP Servers

Use the provided script to switch between SMTP servers:

```bash
./scripts/switch-mail-server.sh [greenmail|maildev]
```

## Spring Boot Configuration

Update your Spring Boot application configuration to use the appropriate SMTP server:

```yaml
# For GreenMail
spring:
  mail:
    host: localhost
    port: 3025
    protocol: smtp
    properties:
      mail:
        smtp:
          auth: false
          starttls:
            enable: false

# For MailDev
spring:
  mail:
    host: localhost
    port: 1025
    protocol: smtp
    properties:
      mail:
        smtp:
          auth: false
          starttls:
            enable: false
```

## Keycloak Configuration

To configure Keycloak to use your SMTP server:

1. Log in to the Keycloak Admin Console
2. Select your realm
3. Go to Realm Settings > Email
4. Update the SMTP settings:
   - **Host**: localhost
   - **Port**: 3025 (GreenMail) or 1025 (MailDev)
   - **From**: noreply@hatchgrid.local
   - **Enable Authentication**: No
   - **Enable SSL**: No
   - **Enable StartTLS**: No

## Testing Email Functionality

To test email functionality:

1. Start your chosen SMTP server
2. Configure your application to use the correct SMTP port
3. Trigger an email-sending action (e.g., user registration)
4. Check the web interface of your SMTP server to view the sent email

## Related Documentation

- [Email Testing](../conventions/email-testing.md)
- [MailDev Setup](maildev-setup.md)
- [Spring Boot Email Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email)
