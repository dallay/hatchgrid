# Keycloak Setup and Configuration

## Overview

Hatchgrid uses [Keycloak](https://www.keycloak.org/) as its identity and access management solution. Keycloak provides OAuth2/OpenID Connect capabilities, user management, and authentication flows for the application.

This document outlines:

- Local development setup
- Realm configuration
- Email configuration
- Integration with the application

## Local Development Setup

Keycloak is configured to run as a Docker container using Docker Compose. The configuration is split between the compose file and an environment file for better portability:

```yaml
# infra/keycloak/keycloak-compose.yml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}
    container_name: keycloak
    command: [ "start-dev", "--import-realm" ]
    volumes:
      # Absolute paths ensure correct mounting regardless of working directory
      - ${PWD}/infra/keycloak/realm-config:/opt/keycloak/data/import
      - ${PWD}/infra/keycloak/realm-config/keycloak-health-check.sh:/opt/keycloak/health-check.sh
      - ${PWD}/infra/keycloak/themes:/opt/keycloak/themes
    environment:
      - KC_HOSTNAME_STRICT=false
      - KC_HOSTNAME=${KC_HOSTNAME}
      - KC_HTTP_ENABLED=true
      - KC_DB=postgres
      - KC_DB_USERNAME=${POSTGRESQL_USER}
      - KC_DB_PASSWORD=${POSTGRES_PASSWORD}
      - KC_DB_URL=jdbc:postgresql://postgresql:5432/keycloak
      - KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN}
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
      # Additional configuration...
    ports:
      - ${KC_HTTP_PORT}:9080
      - ${KC_HTTPS_PORT}:9443
```

Environment variables are defined in a dedicated `.env` file:

```properties
# infra/keycloak/.env
KEYCLOAK_VERSION=24.0
KC_HTTP_PORT=9080
KC_HTTPS_PORT=9443
KC_HOSTNAME=localhost
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=secret
POSTGRESQL_USER=postgres
POSTGRES_PASSWORD=postgres
```

### Starting Keycloak

To start Keycloak for local development:

```bash
# From the project root directory
docker compose up -d keycloak
```

This will start Keycloak with the pre-configured realm imported from `infra/keycloak/realm-config/hatchgrid-realm.json`.

> **Important**: Always run Docker Compose commands from the project root directory to ensure proper path resolution and environment variable loading.

### Environment Variables

Keycloak configuration uses environment variables defined in the following locations:

1. Project-level `.env` file at the root directory
2. Keycloak-specific `.env` file in `infra/keycloak/.env`

The Keycloak-specific variables include:

- `KEYCLOAK_VERSION`: The version of Keycloak to use
- `KC_HTTP_PORT`: The HTTP port for Keycloak (default: 9080)
- `KC_HTTPS_PORT`: The HTTPS port for Keycloak (default: 9443)
- `KC_HOSTNAME`: The hostname for Keycloak (default: localhost)
- `KEYCLOAK_ADMIN`: Admin username
- `KEYCLOAK_ADMIN_PASSWORD`: Admin password
- `POSTGRESQL_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password

### Accessing Keycloak Admin Console

The Keycloak admin console is available at:

```bash
http://localhost:9080/admin/
```

Default admin credentials are defined in the `.env` file:

- Username: `admin` (or the value of `KEYCLOAK_ADMIN`)
- Password: `secret` (or the value of `KEYCLOAK_ADMIN_PASSWORD`)

## Realm Configuration

Hatchgrid uses a pre-configured realm defined in `infra/keycloak/realm-config/hatchgrid-realm.json`. This realm includes:

- Client configurations
- User roles and groups
- Authentication flows
- Email templates
- Password policies

The realm is automatically imported when Keycloak starts.

## Email Configuration

Keycloak is configured to use GreenMail for sending emails during development. The SMTP configuration is defined in the realm configuration:

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

For more details on email testing, see [Email Testing with GreenMail](../conventions/email-testing.md).

## Integration with the Application

Hatchgrid's backend is configured as an OAuth2 resource server that validates JWT tokens issued by Keycloak. The integration is configured in the application properties:

```yaml
# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://keycloak:9080/realms/hatchgrid
          jwk-set-uri: http://keycloak:9080/realms/hatchgrid/protocol/openid-connect/certs
```

For more details on the authentication flow, see [Authentication Architecture](./authentication.md).

## Customizing Keycloak

### Themes

Custom themes can be placed in the `infra/keycloak/themes` directory. These are mounted into the Keycloak container and can be selected in the admin console.

### Realm Changes

If you need to make changes to the realm configuration:

1. Make changes through the Keycloak admin console
2. Export the realm configuration:

   ```bash
   docker exec -it keycloak /opt/keycloak/bin/kc.sh export --realm hatchgrid --file /tmp/hatchgrid-realm.json
   docker cp keycloak:/tmp/hatchgrid-realm.json infra/keycloak/realm-config/hatchgrid-realm.json
   ```

3. Commit the updated realm configuration file

## Troubleshooting

### Common Issues

#### Keycloak Not Starting

Check the logs:

```bash
docker compose logs keycloak
```

#### Port Binding Issues

If you see errors about ports already being in use, you can modify the port mappings in the `.env` file:

```properties
KC_HTTP_PORT=9080  # Change this to an available port
KC_HTTPS_PORT=9443 # Change this to an available port
```

#### Container Communication Issues

If services can't communicate with each other, ensure that:

1. The ports are not bound to 127.0.0.1 in the compose file
2. The services are on the same Docker network
3. The KC_HOSTNAME is set correctly in the environment variables

#### Email Not Being Sent

1. Ensure GreenMail is running:

   ```bash
   docker compose ps greenmail
   ```

2. Check GreenMail logs:

   ```bash
   docker compose logs greenmail
   ```

3. Verify the SMTP configuration in the Keycloak admin console:
   - Go to Realm Settings > Email

## Related Documentation

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Spring Security OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html)
- [Email Testing with GreenMail](../conventions/email-testing.md)
- [Authentication Architecture](./authentication.md)
