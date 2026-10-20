# Mobile Application Roadmap

**Status: planning only.** This repository currently contains a React/Vite web interface, an Express API, and Electron desktop packaging. It does not currently contain a native iOS or Android application.

## Decisions before implementation

React Native with Expo is a candidate, not a locked implementation. Before creating a mobile project:

- Confirm the mobile product scope and whether it needs a code editor or mainly project/task monitoring.
- Choose supported framework versions at implementation time rather than copying old version pins into a plan.
- Define authentication, API access, project-file handling, and secure storage for provider credentials.
- Decide which business logic can be shared safely with the web/desktop code and which UI must be native.
- Establish a working backend contract and error handling before designing offline behavior.

## Suggested delivery sequence

### 1. Scope and technical spike
- [ ] Define the first mobile use cases and explicit non-goals.
- [ ] Test authentication and API access from a small prototype.
- [ ] Validate safe storage and session expiry on iOS and Android.
- [ ] Decide the supported minimum OS versions and build/release process.

### 2. Read-only project companion
- [ ] Sign in securely.
- [ ] List projects and recent tasks.
- [ ] Display task progress, status, errors, and generated-file metadata.
- [ ] Handle loading, empty, offline, unauthorized, and server-error states.
- [ ] Add accessible touch targets and screen-reader labels.

### 3. Prompt and review workflow
- [ ] Submit generation prompts through the server API.
- [ ] Poll or subscribe to task status using a documented backend contract.
- [ ] Review generated files and build logs.
- [ ] Support safe export of project archives.
- [ ] Do not expose server secrets or embed privileged provider keys in the mobile binary.

### 4. Device integration and resilience
- [ ] Add OS-appropriate secure credential storage if required.
- [ ] Add share/export flows.
- [ ] Define retry rules and safe handling of interrupted requests.
- [ ] Add offline access only for data that can be cached consistently and securely.
- [ ] Add notifications only after authentication and task ownership are implemented.

### 5. Release readiness
- [ ] Unit and API integration tests.
- [ ] Automated UI tests on supported device sizes.
- [ ] Accessibility and performance review on real devices.
- [ ] Privacy disclosures, store listings, signing, and release automation.
- [ ] Security review of authentication, data storage, and API authorization.

## Candidate technology

React Native with Expo is a reasonable starting point because the current frontend uses React and TypeScript. Select exact versions from the current compatibility matrix when implementation begins. Do not copy historical package pins from older drafts.

Potential pieces to evaluate:
- React Native with Expo for the app shell.
- A navigation library supported by the selected Expo version.
- Secure storage for session credentials.
- A local database only if offline project/task access is a real requirement.
- The existing Express REST API, after its authentication and authorization contract is documented.

## Explicit non-goals for the first release

- A full desktop-grade IDE on a phone.
- Running arbitrary generated code on the device.
- Promising offline AI generation without a local inference implementation.
- Cloud sync or account-based project ownership before the server enforces authorization.

## Current source of truth

See [README.md](README.md), [docs/API_SPEC.md](docs/API_SPEC.md), and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the current product and backend boundaries. This roadmap is a proposal, not evidence that mobile implementation has started.
