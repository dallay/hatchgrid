# 🚀 GitHub Actions Workflows - Hatchgrid

Esta documentación proporciona una visión general completa de todos los workflows y acciones personalizadas del monorepo de Hatchgrid.

---

## 📋 Índice de Workflows

### 🔄 Workflows Principales

- [Monorepo CI](#monorepo-ci) - Pipeline principal de CI/CD
- [Backend CI](#backend-ci) - CI específico para Kotlin/Java
- [Frontend CI](#frontend-ci) - CI específico para Node.js/TypeScript
- [Deploy](#deploy) - Despliegue a múltiples entornos

### 🛠️ Workflows de Soporte

- [Cleanup Cache](#cleanup-cache) - Gestión automática de caché
- [Issue Labeler](#issue-labeler) - Etiquetado automático de issues
- [Semantic Pull Request](#semantic-pull-request) - Validación de PRs
- [Test PNPM](#test-pnpm) - Verificación de configuración

### 🔧 Acciones Personalizadas

- [Setup Java](#setup-java) - Configuración de Java y Gradle
- [Setup Node](#setup-node) - Configuración de Node.js y pnpm
- [Specialized Docker Actions](#specialized-docker-actions) - Acciones especializadas para Docker

---

## 🔄 Monorepo CI

**Archivo**: `.github/workflows/monorepo-ci.yml`

### Descripción

Workflow principal que orquesta todo el proceso de CI/CD, incluyendo análisis de seguridad, linting, testing e integración.

### Triggers

```yaml
on:
  push:
    branches: [ main ]
    paths-ignore: [ '**.md', '.github/workflows/backend-ci.yml', ... ]
  pull_request:
    paths-ignore: [ '**.md', '.github/workflows/backend-ci.yml', ... ]
  workflow_dispatch:
    inputs:
      environment: [ development, staging ]
```

### Jobs Ejecutados

1. **labeler** - Etiquetado automático de PRs
2. **codeql-analysis** - Análisis de seguridad (JavaScript, Kotlin)
3. **super-linter** - Validación de código con múltiples linters
4. **dependency-review** - Revisión de dependencias en PRs
5. **owasp-dependency-check** - Análisis de vulnerabilidades OWASP
6. **backend** - Delegación a workflow de backend
7. **frontend** - Delegación a workflow de frontend
8. **integration** - Tests de integración post-build

### Características Especiales

- **Concurrencia**: Cancela ejecuciones previas en la misma rama
- **Seguridad**: Múltiples capas de análisis de seguridad
- **Artefactos**: Genera reportes de integración y seguridad

---

## 🏗️ Backend CI

**Archivo**: `.github/workflows/backend-ci.yml`

### Descripción

CI específico para el backend desarrollado en Kotlin/Java con Gradle.

### Triggers

```yaml
paths:
  - 'server/**'
  - 'shared/**'
  - 'build.gradle.kts'
  - 'settings.gradle.kts'
  - 'gradle/**'
```

### Jobs

#### Lint Job

- **Herramienta**: Detekt para análisis estático de Kotlin
- **Integración**: Reviewdog para comentarios automáticos en PR
- **Formato**: Reportes SARIF para GitHub Security

#### Build Job

- **Build**: `./gradlew build -x test`
- **Testing**: `./gradlew test`
- **Cobertura**: Kover → Codecov
- **Artefactos**: JARs compilados y reportes de test

### Variables de Entorno

- `NVD_API_KEY`: Para análisis de vulnerabilidades de dependencias

---

## 🎨 Frontend CI

**Archivo**: `.github/workflows/frontend-ci.yml`

### Descripción

CI específico para el frontend desarrollado en Node.js/TypeScript.

### Triggers

```yaml
paths:
  - 'client/**'
  - 'package.json'
  - 'pnpm-lock.yaml'
  - 'pnpm-workspace.yaml'
```

### Jobs

#### Lint Job

- **Herramienta**: Biome para linting y formatting
- **Integración**: Reviewdog para feedback en PR
- **Configuración**: Falla en errores, warnings como sugerencias

#### Build Job

- **Comando**: `pnpm build`
- **Artefactos**: Aplicaciones compiladas y landing page

#### Test Job

- **Comando**: `pnpm test`
- **Cobertura**: LCOV → Codecov

---

## 🚀 Deploy

**Archivo**: `.github/workflows/deploy.yml`

### Descripción

Pipeline de despliegue con soporte para múltiples entornos y estrategias de deployment.

### Triggers y Estrategias

```yaml
# Manual con selección de entorno
workflow_dispatch:
  inputs:
    environment: [development, staging, production]

# Automático basado en branch/tag
push:
  branches: [main]     # → development
  tags: ['v*']         # → production
```

### Jobs Pipeline

#### 1. determine-environment

Lógica de determinación de entorno:

- Manual: Usa input del usuario
- Tag `v*`: production
- Push a main: development

#### 2. build-backend

- Compilación con Gradle
- Build de imagen Docker
- Escaneo de seguridad con Trivy
- Push a GitHub Container Registry

#### 3. build-frontend

- Compilación con pnpm
- Build de imagen Docker
- Escaneo de seguridad con Trivy
- Push a GitHub Container Registry

#### 4. deploy

- Configuración de kubectl
- Actualización de manifiestos K8s
- Despliegue a cluster
- Verificación de rollout

### Seguridad en Deploy

- Escaneo de imágenes con Trivy
- Resultados SARIF a GitHub Security
- Manifiestos versionados por SHA

---

## 🧹 Cleanup Cache

**Archivo**: `.github/workflows/cleanup-cache.yml`

### Propósito

Limpieza automática de cachés cuando se cierra un PR para optimizar el uso de storage.

### Funcionamiento

```yaml
on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    - gh extension install actions/gh-actions-cache
    - gh actions-cache list -R $REPO -B $BRANCH
    - gh actions-cache delete $cacheKey --confirm
```

---

## 🏷️ Issue Labeler

**Archivo**: `.github/workflows/issue-labeler.yml`

### Propósito

Etiquetado automático de issues basado en contenido y patrones.

### Configuración

- **Archivo de config**: `.github/issue-labeler-config.yml`
- **Trigger**: Issues opened/edited
- **Acción**: `github/issue-labeler`

---

## ✅ Semantic Pull Request

**Archivo**: `.github/workflows/semantic-pull-request.yml`

### Propósito

Validación de títulos de PR según Conventional Commits.

### Características

- **Validación**: Conventional Commits spec
- **Feedback**: Comentarios automáticos en PR
- **Auto-cleanup**: Elimina comentarios cuando se corrige

### Ejemplo de Títulos Válidos

```
feat: add user authentication
fix: resolve memory leak in cache
docs: update API documentation
chore: update dependencies
```

---

## 🧪 Test PNPM

**Archivo**: `.github/workflows/test-pnpm.yml`

### Propósito

Workflow de prueba para verificar la configuración de pnpm.

### Uso

- Solo ejecución manual (`workflow_dispatch`)
- Debugging de problemas de configuración
- Verificación de versiones y paths

---

## 🔧 Acciones Personalizadas

### Setup Java

**Ubicación**: `.github/actions/setup/java/`

```yaml
- name: Setup Java
  uses: ./.github/actions/setup/java
```

**Características**:

- Java 21 (Eclipse Temurin)
- Gradle wrapper
- Cache automático de dependencias

### Setup Node

**Ubicación**: `.github/actions/setup/node/`

```yaml
- name: Setup Node.js and pnpm
  uses: ./.github/actions/setup/node
```

**Características**:

- Node.js 22
- pnpm 10.10.0
- Cache inteligente del store
- Instalación con frozen-lockfile

### Specialized Docker Actions

**Ubicación**: `.github/actions/docker/`

> **Nota**: Las acciones Docker especializadas han reemplazado la acción Docker genérica anterior. Para más detalles, consulta la [documentación de acciones Docker](./docker-composition-actions.md).

**Backend Docker Action**:

```yaml
- name: Build and push backend Docker image
  uses: ./.github/actions/docker/backend/action.yml
  with:
    image-name: backend
    github-token: ${{ secrets.GITHUB_TOKEN }}
    gradle-args: "-Pversion=latest -Penv=production"
    module-path: server:thryve
    deliver: 'true'
```

**Frontend Web App Action**:

```yaml
- name: Build and push frontend web app Docker image
  uses: ./.github/actions/docker/frontend-web/action.yml
  with:
    image-name: frontend-web
    github-token: ${{ secrets.GITHUB_TOKEN }}
    build-env: production
    api-url: https://api.example.com
    deliver: 'true'
```

**Frontend Landing Page Action**:

```yaml
- name: Build and push frontend landing page Docker image
  uses: ./.github/actions/docker/frontend-landing/action.yml
  with:
    image-name: frontend-landing
    github-token: ${{ secrets.GITHUB_TOKEN }}
    build-env: production
    base-url: https://example.com
    deliver: 'true'
```

**Security Scanning Action**:

```yaml
- name: Scan Docker image for vulnerabilities
  uses: ./.github/actions/docker/security-scan/action.yml
  with:
    image-ref: ghcr.io/myorg/myapp:latest
    report-name: myapp-security-scan
    category: backend-trivy
```

**Características**:

- Acciones especializadas por tipo de aplicación
- GitHub Container Registry y Docker Hub
- Cache de GitHub Actions
- Escaneo de seguridad con Trivy integrado
- Metadata automático
- Multi-platform support

---

## 📊 Métricas y Monitoreo

### Tiempos Típicos de Ejecución

- **Backend CI**: ~8-12 minutos
- **Frontend CI**: ~5-8 minutos
- **Monorepo CI**: ~15-20 minutos
- **Deploy**: ~10-15 minutos

### Cache Hit Rates

- **Gradle**: ~85-90%
- **pnpm**: ~90-95%
- **Docker**: ~70-80%

### Artefactos Generados

- Reportes de test (JUnit XML)
- Reportes de cobertura (Kover, LCOV)
- Reportes de seguridad (SARIF)
- Imágenes Docker
- Reportes de integración

---

## 🔒 Seguridad y Compliance

### Análisis de Seguridad

- **CodeQL**: Análisis estático de código
- **OWASP**: Vulnerabilidades en dependencias
- **Trivy**: Escaneo de imágenes Docker
- **Dependency Review**: Revisión de nuevas dependencias

### Secretos Requeridos

```yaml
CODECOV_TOKEN      # Subida de cobertura
NVD_API_KEY       # API de vulnerabilidades
KUBECONFIG        # Configuración de Kubernetes
GITHUB_TOKEN      # Automático, para registry
```

### Permisos Mínimos

Cada workflow tiene permisos específicos mínimos siguiendo el principio de menor privilegio.

---

## 🚀 Mejores Prácticas

### Versionado

- Usar versiones específicas con hash SHA
- Actualizar regularmente con Dependabot
- Probar cambios en branches de desarrollo

### Performance

- Paralelización de jobs independientes
- Cache inteligente con keys específicos
- Concurrencia para cancelar ejecuciones obsoletas

### Mantenimiento

- Documentación actualizada
- Monitoreo de métricas de ejecución
- Revisión regular de configuraciones

---

Para documentación detallada de workflows específicos, consulta:

- [Guía de CI/CD](ci-guide.md)
- [Acciones Personalizadas](custom-actions.md)
