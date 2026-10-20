# Current Architecture

## Overview

Odyseus Nexus Pro is an actively developed software-building workspace. The checked-in implementation currently uses a React/TypeScript/Vite frontend, a TypeScript/Express API, and Electron packaging. The architecture below describes present components and separates them from future infrastructure ideas.

## Implemented repository layers

### Frontend
- React and TypeScript application built with Vite.
- Zustand for shared application state.
- UI components for project prompts, workspace views, task status, generated files, logs, settings, and preview display.
- Browser-local storage for selected preferences; this is not account sync.
- Motion-based interface animation.

### API and task services
- Express routes for generation, task lookup, AI debugging, AI lint suggestions, formatting, health status, billing readiness, and staging-file delivery.
- An AI service that calls configured providers. A valid server-side provider key and working provider access are required.
- A queue service that uses process memory when no database is configured and Firestore when configured.
- Task generation currently emits progress stages for processing, synthesis, build, test, and deploy. Progress-stage labels alone do not prove a real compiler, test runner, or deployment provider executed.

### Desktop packaging
- Electron main/preload entry points and electron-builder configuration.
- GitHub Actions builds packages on native Windows, macOS, and Linux runners.
- A successful packaging workflow verifies that the configured build steps completed; it is not a full runtime, integration, or security test.

## Persistence and external services

### Firestore
Firestore can store task records when valid Firebase configuration and permissions are available. In-memory fallback is ephemeral and should not be relied on for durable tasks in a multi-instance/serverless environment.

### AI providers
The frontend/API supports provider configuration paths, but environment-variable presence is only a configuration signal. Provider access, quotas, model identifiers, and request compatibility must be tested separately.

### Authentication, billing, and deployment
- GitHub OAuth is considered configured only when the expected client credentials are present; this does not itself prove a complete authentication flow.
- The billing status endpoint currently reports checkout and purchase verification as disabled/unconfigured.
- Deployment readiness checks do not deploy applications. Provider-specific deployment adapters and credentials are required.

## Security boundaries and open work

- Staging serves generated file content. Exact path resolution, correct asset handling, and a separate-origin or equivalent isolation boundary are required before treating arbitrary generated code as safely sandboxed.
- Keep privileged API keys server-side.
- Test task persistence against a real Firebase project.
- Verify responsive layouts at narrow widths and short heights.
- Run TypeScript checks and browser-level end-to-end tests; a package build is not a replacement for those checks.

## Planned, not implemented

The following are ideas or future infrastructure work unless backed by code and deployment evidence: a Rust/WASM compute engine, a Go gateway, Redis caching, Terraform-managed production infrastructure, Kubernetes orchestration, and native mobile apps. They should not be described as running services.

## Related documentation

- [Main README](../README.md)
- [API specification](API_SPEC.md)
- [Desktop build guide](../DESKTOP_README.md)
- [Engineering TODO](../TODO.md)
- [Mobile roadmap](../MOBILE_ROADMAP.md)
