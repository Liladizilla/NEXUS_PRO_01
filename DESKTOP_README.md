# Odyseus Nexus Pro Desktop

Odyseus Nexus Pro is an Electron desktop wrapper around the React/Vite workspace and Express API. The application is under active development; a visible UI control does not mean its remote provider or backend integration is configured.

## Download

As of 2026-10-20, the GitHub Releases API reports no published releases for this repository. Check [GitHub Releases](https://github.com/Liladizilla/NEXUS_PRO_01/releases) for future published installers. Successful GitHub Actions runs may expose build artifacts on the [Actions page](https://github.com/Liladizilla/NEXUS_PRO_01/actions). Workflow artifacts are temporary CI outputs, not published releases.

## Current capabilities and boundaries

- React/Vite workspace with project prompts, generated-file views, logs, and preview status.
- Express API for generation and project tasks.
- Electron packaging configuration for Windows (NSIS), macOS (DMG), and Linux (AppImage), built on native GitHub Actions runners.
- Local workspace preferences and session-based asset handling in the UI.
- Optional Firebase/Firestore-backed task persistence when correctly configured.

Important limitations:
- AI generation requires a valid server-side `GEMINI_API_KEY`; the key must have suitable access and quota.
- Persistent task storage requires valid Firebase configuration and Firestore permissions. Without a configured database, task state is ephemeral.
- A returned preview route is not proof that generated code compiled, ran, or was deployed to production.
- Billing, purchase verification, and deployment-provider integrations should not be treated as production-ready solely because their UI is present. Check the main [README](README.md) for current integration boundaries.

## Build from source

Requirements: Node.js 20 or newer, npm, and Git.

```bash
git clone https://github.com/Liladizilla/NEXUS_PRO_01.git
cd NEXUS_PRO_01
npm ci
npm run build
npm run build:server
```

Build a desktop package for the current operating system:

```bash
npm run electron:build
```

Platform-specific commands:

```bash
npm run electron:build:win
npm run electron:build:mac
npm run electron:build:linux
```

Packaging is most reliable on the target platform. CI builds Windows, macOS, and Linux on separate native runners. Output is written to `release/`.

## Development

The scripts in `package.json` are the source of truth for available commands. The desktop development command is currently:

```bash
npm run electron:dev
```

This script uses shell syntax and may behave differently across operating systems. If it fails on your platform, start the API and frontend using the repository's supported development setup rather than assuming the desktop shell is broken.

Useful checks:

```bash
npm run build
npm run lint
npm run build:server
```

- `npm run build` builds the Vite frontend.
- `npm run lint` runs TypeScript checking via `tsc --noEmit`.
- `npm run build:server` compiles the server TypeScript project.

## Configuration

Configure secrets in the server/deployment environment, not in committed source files.

- `GEMINI_API_KEY`: required for Gemini-backed generation.
- Firebase configuration: required for persistent Firestore-backed tasks.
- `PORT`: optional server port where supported by the running environment.
- `NODE_ENV`: controls environment-specific server behavior.

Do not commit API keys, service-account credentials, or production secrets.

## Troubleshooting

**AI generation fails**
- Confirm `GEMINI_API_KEY` is set in the environment used by the server.
- Verify the key is valid for the configured model/API and has quota.
- Check server logs for the actual provider error.

**Tasks disappear or cannot be retrieved**
- Check whether Firebase is configured and Firestore permissions allow the required reads and writes.
- Without a database, task state is process-local and is not durable across serverless invocations or restarts.
- Inspect API responses and server logs rather than assuming a returned task ID proves durable persistence.

**Preview is blank or assets fail**
- Check the task status and whether generated files include the requested entry point and assets.
- A preview URL alone does not prove the generated project successfully runs. Inspect the logs and generated files.

**Window or layout content is clipped**
- Test onboarding and modal flows at the actual window size. Responsive changes are merged in PR #86, but manual cross-size browser verification remains a separate task.

## Security

Keep API keys server-side. Review the Electron main/preload implementation and server security configuration before distributing production builds. A passing packaging workflow is not a full security audit.

## Project links

- [Source repository](https://github.com/Liladizilla/NEXUS_PRO_01)
- [Releases](https://github.com/Liladizilla/NEXUS_PRO_01/releases)
- [Actions and build artifacts](https://github.com/Liladizilla/NEXUS_PRO_01/actions)
- [Issues](https://github.com/Liladizilla/NEXUS_PRO_01/issues)
- [Main README](README.md)

## License

`package.json` declares `Apache-2.0`, but the repository currently has no checked-in `LICENSE` file. Add the complete license text and verify the intended licensing before redistributing the project.
