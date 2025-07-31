---
title: Email Testing
description: Guidelines for testing email functionality in Hatchgrid using GreenMail and MailDev.
---
# Email Testing

## Overview

Hatchgrid supports multiple email testing solutions for development and testing environments:

1. [GreenMail](https://greenmail-mail-test.github.io/greenmail/) - A lightweight, in-memory email server that supports all major email protocols
2. [MailDev](https://github.com/maildev/maildev) - A simple SMTP server with a web interface for easy email testing

You can choose the email testing solution that best fits your needs and switch between them using the provided script.

Both the Spring Boot application and Keycloak are configured to use GreenMail for sending emails during development and testing.

## Configuration

### Docker Compose Setup

GreenMail is configured as a Docker service in the project's infrastructure:

```yaml
# infra/greenmail/greenmail-compose.yml
services:
  greenmail:
    image: greenmail/standalone:${GREENMAIL_VERSION}
    container_name: greenmail
    environment:
      - GREENMAIL_OPTS=-Dgreenmail.setup.test.all -Dgreenmail.hostname=0.0.0.0 -Dgreenmail.auth.disabled -Dgreenmail.verbose
    ports:
      - "3025:3025"   # SMTP
      - "3110:3110"   # POP3
      - "3143:3143"   # IMAP
      - "3465:3465"   # SMTPS
      - "3993:3993"   # IMAPS
      - "3995:3995"   # POP3S
      - "8080:8080"   # Web interface
```

### Environment Variables

The GreenMail version is configured in `.env`:

```bash
GREENMAIL_VERSION=2.0.0
```

## Available Protocols and Ports

GreenMail supports multiple email protocols for comprehensive testing:

| Protocol | Port | Description |
|----------|------|-------------|
| SMTP     | 3025 | Simple Mail Transfer Protocol (sending emails) |
| POP3     | 3110 | Post Office Protocol v3 (retrieving emails) |
| IMAP     | 3143 | Internet Message Access Protocol (managing emails) |
| SMTPS    | 3465 | SMTP over SSL/TLS |
| IMAPS    | 3993 | IMAP over SSL/TLS |
| POP3S    | 3995 | POP3 over SSL/TLS |
| Web UI   | 8080 | Web interface for email management |

## Usage

### Starting GreenMail

GreenMail starts automatically when you run the main Docker Compose setup:

```bash
docker compose up -d
```

Or start only GreenMail:

```bash
docker compose up -d greenmail
```

### Web Interface

Access the GreenMail web interface at: http://localhost:8080

The web interface allows you to:
- View all received emails
- Inspect email headers and content
- Manage mailboxes and users
- Monitor email traffic

### Spring Boot Configuration

Configure your Spring Boot application to use GreenMail for email testing:

```yaml
# application-test.yml
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
```

### Testing Email Functionality

#### Integration Tests

Use GreenMail in your integration tests to verify email sending:

```kotlin
@SpringBootTest
@Testcontainers
class EmailServiceIntegrationTest {

    @Container
    companion object {
        val greenMail = GenericContainer("greenmail/standalone:2.0.0")
            .withExposedPorts(3025, 8080)
            .withEnv("GREENMAIL_OPTS", "-Dgreenmail.setup.test.all -Dgreenmail.hostname=0.0.0.0 -Dgreenmail.auth.disabled")
    }

    @Test
    fun `should send email successfully`() {
        // Test email sending functionality
        // Verify emails are received in GreenMail
    }
}
```

#### Manual Testing

1. Start the application with GreenMail running
2. Trigger email functionality in your application
3. Check the GreenMail web interface at http://localhost:8080
4. Verify emails are received and formatted correctly

## Configuration Options

### GreenMail Options

The `GREENMAIL_OPTS` environment variable configures GreenMail behavior:

- `-Dgreenmail.setup.test.all`: Sets up all email protocols
- `-Dgreenmail.hostname=0.0.0.0`: Binds to all network interfaces
- `-Dgreenmail.auth.disabled`: Disables authentication for testing
- `-Dgreenmail.verbose`: Enables verbose logging

### Health Checks

GreenMail includes a health check that verifies the SMTP port is accessible:

```yaml
healthcheck:
  test: ["CMD", "echo", "quit", "|", "telnet", "localhost", "3025"]
  interval: 10s
  timeout: 5s
  retries: 10
  start_period: 30s
```

This health check uses `telnet` to connect to the SMTP port and sends the SMTP "quit" command, providing a more reliable check than simply testing if the port is open.

## Best Practices

### Development Environment

1. **Use GreenMail for all email testing** - Never use real email services in development
2. **Check the web interface regularly** - Monitor emails during development
3. **Clear emails between tests** - Reset GreenMail state for clean test runs

### Testing Strategy

1. **Integration tests should use GreenMail** - Verify complete email workflows
2. **Unit tests should mock email services** - Focus on business logic
3. **Test email content and formatting** - Verify HTML and text versions
4. **Test email delivery failures** - Ensure proper error handling

### Security Considerations

1. **Never use GreenMail in production** - It's designed for testing only
2. **Disable authentication in test environments** - Simplifies testing setup
3. **Use network isolation** - Keep GreenMail in backend network only

## Troubleshooting

### Common Issues

#### Port Conflicts

If port 8080 is already in use:

```bash
# Check what's using port 8080
lsof -i :8080

# Stop conflicting services or change GreenMail port mapping
```

#### Connection Refused

Ensure GreenMail is running and healthy:

```bash
# Check container status
docker compose ps greenmail

# Check container logs
docker compose logs greenmail

# Test SMTP connection
echo quit | telnet localhost 3025
```

#### Emails Not Appearing

1. Check application email configuration points to localhost:3025
2. Verify GreenMail logs for incoming connections
3. Ensure authentication is disabled in test configuration

### Debugging

Enable verbose logging in GreenMail:

```yaml
environment:
  - GREENMAIL_OPTS=-Dgreenmail.setup.test.all -Dgreenmail.hostname=0.0.0.0 -Dgreenmail.auth.disabled -Dgreenmail.verbose -Dgreenmail.debug
```

## Keycloak Email Configuration

Keycloak is configured to use GreenMail for sending emails such as account verification, password reset, and other notifications. The configuration is defined in the Keycloak realm configuration file:

```json
// infra/keycloak/realm-config/hatchgrid-realm.json
"smtpServer": {
  "replyToDisplayName": "Hatchgrid",
  "starttls": "false",
  "auth": "false",
  "envelopeFrom": "",
  "ssl": "false",
  "password": "secret",
  "port": "3025",
  "replyTo": "noreply@hatchgrid.local",
  "host": "greenmail",
  "from": "noreply@hatchgrid.local",
  "fromDisplayName": "Hatchgrid Development",
  "user": "developer"
}
```

### Key Settings

- **Host**: `greenmail` (Docker service name)
- **Port**: `3025` (SMTP port)
- **Authentication**: Disabled for development (`"auth": "false"`)
- **TLS/SSL**: Disabled for development (`"starttls": "false"`, `"ssl": "false"`)
- **From Address**: `noreply@hatchgrid.local`
- **From Display Name**: `Hatchgrid Development`

### Testing Keycloak Emails

To test Keycloak email functionality:

1. Ensure both GreenMail and Keycloak are running:
   ```bash
   docker compose up -d greenmail keycloak
   ```

2. Trigger an email-sending action in Keycloak:
   - Password reset
   - New user registration
   - Email verification

3. Check the GreenMail web interface at http://localhost:8080 to view the sent emails

## Switching Between Email Servers

Hatchgrid provides a script to easily switch between GreenMail and MailDev:

```bash
./scripts/switch-mail-server.sh [greenmail|maildev]
```

This script will:
1. Stop any running email servers
2. Start the requested email server
3. Display configuration information

## Related Documentation

- [Spring Boot Email Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email)
- [GreenMail Documentation](https://greenmail-mail-test.github.io/greenmail/)
- [MailDev Documentation](https://github.com/maildev/maildev)
- [MailDev Setup Guide](../development/maildev-setup.md)
- [Keycloak Server Administration Guide - Email](https://www.keycloak.org/docs/latest/server_admin/#_email)
- [Docker Compose Services](../workflows/docker-composition-actions.md)
