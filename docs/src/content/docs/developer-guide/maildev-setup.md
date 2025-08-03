---
title: "Email Testing with MailDev"
description: "How to set up and use MailDev for email testing in Hatchgrid."
---
# Email Testing with MailDev

## Overview

Hatchgrid supports [MailDev](https://github.com/maildev/maildev) as an alternative email testing server for development and testing environments. MailDev is a simple SMTP server with a web interface that makes it easy to test and view emails during development.

## Configuration

### Docker Compose Setup

MailDev is configured as a Docker service in the project's infrastructure:

```yaml
# infra/maildev/maildev-compose.yml
services:
  maildev:
    image: djfarrelly/maildev:latest
    container_name: maildev
    ports:
      - "1025:25"   # SMTP
      - "1080:80"   # Web interface
    networks:
      - backend
      - frontend
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "25"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    labels:
      org.springframework.boot.ignore: true

networks:
  frontend:
    external: true
  backend:
    external: true
```

## Available Protocols and Ports

MailDev provides the following services:

| Protocol | Port | Description |
|----------|------|-------------|
| SMTP     | 1025 | Simple Mail Transfer Protocol (sending emails) |
| Web UI   | 1080 | Web interface for email management |

## Usage

### Starting MailDev

You can start MailDev using Docker Compose:

```bash
docker compose -f infra/maildev/maildev-compose.yml up -d
```

### Web Interface

Access the MailDev web interface at: http://localhost:1080

The web interface allows you to:
- View all received emails
- Inspect email headers and content
- Test responsive design with different screen sizes
- Forward emails to real email addresses

### Spring Boot Configuration

Configure your Spring Boot application to use MailDev for email testing:

```yaml
# application-dev.yml
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

## Switching Between Email Servers

Hatchgrid supports both GreenMail and MailDev for email testing. You can switch between them using the provided script:

```bash
./scripts/switch-mail-server.sh [greenmail|maildev]
```

## Best Practices

### Development Environment

1. **Use MailDev for all email testing** - Never use real email services in development
2. **Check the web interface regularly** - Monitor emails during development
3. **Test responsive design** - MailDev allows testing emails in different screen sizes

### Security Considerations

1. **Never use MailDev in production** - It's designed for testing only
2. **Disable authentication in test environments** - Simplifies testing setup

## Troubleshooting

### Common Issues

#### Port Conflicts

If ports 1025 or 1080 are already in use:

```bash
# Check what's using port 1025
lsof -i :1025

# Check what's using port 1080
lsof -i :1080

# Stop conflicting services or change MailDev port mapping
```

#### Connection Refused

Ensure MailDev is running and healthy:

```bash
# Check container status
docker compose -f infra/maildev/maildev-compose.yml ps

# Check container logs
docker compose -f infra/maildev/maildev-compose.yml logs

# Test SMTP connection
echo quit | telnet localhost 1025
```

## Related Documentation

- [Email Testing with GreenMail](../conventions/email-testing.md)
- [Docker Compose Services](../workflows/docker-composition-actions.md)
