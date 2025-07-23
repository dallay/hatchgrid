# Email Testing in Development

This document explains how to test emails in your local development environment using either GreenMail or MailDev.

## Available Email Testing Tools

The Hatchgrid project supports two email testing tools:

1. **GreenMail** (default) - A test suite for email servers that provides a web interface to view sent emails.
2. **MailDev** - A simple way to test emails with an easy-to-use web interface.

## Using GreenMail (Default)

GreenMail is configured by default in the project. When you run the application with Docker Compose, GreenMail will be started automatically.

- **SMTP Server**: localhost:3025
- **Web Interface**: http://localhost:8081
- **Default User**: developer:secret@hatchgrid.local

## Using MailDev

To switch to MailDev for email testing:

```bash
# Run the switch script
./scripts/switch-mail-server.sh maildev
```

This will:

1. Stop any running email servers
2. Start MailDev with the correct configuration
3. Display configuration information

- **SMTP Server**: localhost:1025
- **Web Interface**: http://localhost:1080

MailDev provides a clean, modern web interface for viewing emails and includes features like:
- HTML/Text email viewing
- Responsive design testing
- Email forwarding to real addresses
- API access for automated testing

## Switching Back to GreenMail

To switch back to GreenMail:

```bash
# Run the switch script
./scripts/switch-mail-server.sh greenmail
```

## Manual Configuration

If you prefer to manually configure the email testing tool:

### For MailDev

1. Edit `compose.yaml` to comment out GreenMail and uncomment MailDev
2. Update `application.yml` to use port 1025 for SMTP
3. Restart your Docker containers

### For GreenMail

1. Edit `compose.yaml` to comment out MailDev and uncomment GreenMail
2. Update `application.yml` to use port 3025 for SMTP
3. Restart your Docker containers

## Testing Email Functionality

To test email functionality:

1. Start your application and the Docker services
2. Register a new user or trigger any action that sends an email
3. Open the web interface of your chosen email testing tool
4. View the sent emails in the interface

## Configuration in Spring Boot

The email configuration is defined in `application.yml`:

```yaml
spring:
  mail:
    host: ${SMTP_HOST:localhost}
    port: ${SMTP_PORT:3025}  # Change to 1025 for MailDev
    username: ${SMTP_USERNAME:developer}
    password: ${SMTP_PASSWORD:secret}
    properties:
      mail:
        smtp:
          auth: false
          starttls:
            enable: false
          ssl:
            enable: false
```

## Troubleshooting

If you encounter issues with email testing:

1. Ensure the SMTP port matches your email testing tool (3025 for GreenMail, 1025 for MailDev)
2. Check that the Docker containers are running (`docker compose ps`)
3. Verify network connectivity between your application and the email server
4. Check the logs of the email server container for any errors
