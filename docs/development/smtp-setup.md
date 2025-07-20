# SMTP Setup for Development

## Overview

For development and testing, Hatchgrid uses GreenMail as a local SMTP server. This eliminates the need for external email services and provides a controlled environment for testing email functionality. Both the Spring Boot application and Keycloak are configured to use GreenMail for email delivery.

## Quick Start

1. **Start GreenMail with Docker Compose:**
   ```bash
   docker compose up -d greenmail
   ```

2. **Configure your application to use GreenMail:**
   ```yaml
   # application-dev.yml
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

3. **Access the web interface:**
   Open http://localhost:8080 to view sent emails

4. **Test email functionality:**
   - In your Spring Boot app: Trigger password reset or user registration
   - In Keycloak: Test "Forgot Password" or email verification features

## GreenMail Configuration

GreenMail is configured in `infra/greenmail/greenmail-compose.yml` with the following settings:

- **SMTP Port**: 3025 (non-SSL)
- **SMTPS Port**: 3465 (SSL)
- **Web Interface**: 8080
- **Authentication**: Disabled for testing
- **Hostname**: Bound to all interfaces (0.0.0.0)
- **Test User**: developer:secret@hatchgrid.local

## Spring Boot Integration

### Development Profile

Create or update `application-dev.yml`:

```yaml
spring:
  mail:
    host: localhost
    port: 3025
    protocol: smtp
    test-connection: false
    properties:
      mail:
        smtp:
          auth: false
          starttls:
            enable: false
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```

### Test Profile

For integration tests, use `application-test.yml`:

```yaml
spring:
  mail:
    host: localhost
    port: 3025
    protocol: smtp
    test-connection: false
    properties:
      mail:
        smtp:
          auth: false
          starttls:
            enable: false
```

## Testing Email Functionality

### Manual Testing

1. Start the application with GreenMail running
2. Trigger email functionality (e.g., user registration, password reset)
3. Check the GreenMail web interface at http://localhost:8080
4. Verify email content, formatting, and recipients

### Integration Testing

Use GreenMail in your integration tests:

```kotlin
@SpringBootTest
@TestPropertySource(properties = [
    "spring.mail.host=localhost",
    "spring.mail.port=3025"
])
class EmailIntegrationTest {

    @Autowired
    private lateinit var emailService: EmailService

    @Test
    fun `should send welcome email`() {
        // Arrange
        val userEmail = "test@example.com"

        // Act
        emailService.sendWelcomeEmail(userEmail)

        // Assert
        // Verify email was sent via GreenMail web interface
        // or use GreenMail's Java API for programmatic verification
    }
}
```

## Troubleshooting

### Common Issues

1. **Port 3025 already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3025

   # Kill the process or change GreenMail port mapping
   ```

2. **Connection refused:**
   ```bash
   # Verify GreenMail is running
   docker compose ps greenmail

   # Check logs
   docker compose logs greenmail
   ```

3. **Emails not appearing:**
   - Verify application configuration points to localhost:3025
   - Check GreenMail logs for incoming connections
   - Ensure authentication is disabled in configuration

### Debugging

Enable verbose logging in GreenMail by updating the environment variables:

```yaml
environment:
  - GREENMAIL_OPTS=-Dgreenmail.setup.test.all -Dgreenmail.hostname=0.0.0.0 -Dgreenmail.auth.disabled -Dgreenmail.verbose -Dgreenmail.debug
```

## Production Considerations

⚠️ **Important**: GreenMail is for development and testing only. For production:

1. Use a real SMTP service (SendGrid, AWS SES, etc.)
2. Configure proper authentication and encryption
3. Set up monitoring and error handling
4. Consider email delivery and bounce handling

## Related Documentation

- [Email Testing Conventions](../conventions/email-testing.md)
- [GreenMail Documentation](https://greenmail-mail-test.github.io/greenmail/)
- [Spring Boot Mail Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email)

## Keycloak Email Configuration

Keycloak is pre-configured to use GreenMail for email delivery in the development environment.

### Configuration Details

The SMTP configuration for Keycloak is defined in the realm configuration file:

```json
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

### Testing Keycloak Email Features

1. **Start the environment:**
   ```bash
   docker compose up -d
   ```

2. **Access Keycloak Admin Console:**
   - URL: http://localhost:9080/admin/
   - Username: admin
   - Password: secret

3. **Test Email Features:**
   - Navigate to Realm Settings → Email
   - Click "Test connection" to verify SMTP settings
   - Enable email verification in Authentication → Flows
   - Test password reset functionality

4. **View Sent Emails:**
   - Open GreenMail web interface at http://localhost:8080
   - All emails sent by Keycloak will appear here

### Troubleshooting Keycloak Email

If emails from Keycloak are not being sent:

1. **Check Keycloak logs:**
   ```bash
   docker compose logs keycloak | grep -i mail
   ```

2. **Verify GreenMail is running:**
   ```bash
   docker compose ps greenmail
   ```

3. **Test SMTP connection from Keycloak container:**
   ```bash
   docker compose exec keycloak sh -c "echo quit | telnet greenmail 3025"
   ```

4. **Verify realm configuration:**
   - Check that the SMTP server settings in the realm configuration are correct
   - Ensure the host is set to "greenmail" (container name) not "localhost"
