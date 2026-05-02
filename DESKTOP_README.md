# Odyseus Nexus Pro - Desktop Application

## Overview
Odyseus Nexus Pro is now available as a native desktop application built with Electron! This brings the power of AI-driven software development to your desktop with enhanced performance and native system integration.

## Features

### Desktop-Specific Features
- **Native Window Controls**: Minimize, maximize, and close buttons integrated into the app
- **System Integration**: Access to system information and native APIs
- **Persistent Settings**: Electron Store for local configuration
- **Built-in Server**: Embedded Express server for local development
- **Cross-Platform**: Available for Windows, macOS, and Linux

### Core Features (Same as Web Version)
- AI-powered application generation
- Multi-agent orchestration
- Real-time code editing and debugging
- Project management and deployment
- Firebase integration for authentication and storage

## Installation

### Pre-built Binaries
Download the latest release for your platform from [GitHub Releases](https://github.com/Liladizilla/NEXUS_PRO_01/releases)

- **Windows**: `NexusPro-Setup-1.0.0.exe` (NSIS installer)
- **macOS**: `NexusPro-1.0.0.dmg` (Disk image)
- **Linux**: `NexusPro-1.0.0.AppImage` (AppImage)

### Building from Source

```bash
# Install dependencies
npm install

# Build the web application
npm run build

# Build desktop application for your platform
npm run electron:build

# Build for specific platforms
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

## Development

### Running in Development Mode

```bash
# Start the web dev server and Electron together
npm run electron:dev
```

This will:
1. Start the Express backend server
2. Launch the Electron application
3. Enable hot-reload for development

### Project Structure

```
.
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script for security
├── src/
│   ├── components/
│   │   └── features/
│   │       └── DesktopApp.tsx  # Desktop-specific UI
│   └── ...
├── server/              # Express backend
├── dist/               # Built web application
└── release/            # Desktop build output
```

## Architecture

### Main Process (electron/main.js)
- Manages application lifecycle
- Creates and manages BrowserWindows
- Starts/stops the Express server
- Handles system integration
- Manages IPC communication

### Renderer Process (React App)
- Same as web version
- Enhanced with Electron APIs via preload script
- Access to window controls and system info

### Preload Script (electron/preload.js)
- Safely exposes Electron APIs to renderer
- Implements context isolation for security
- Handles IPC communication

### Security Features
- Context isolation enabled
- Node integration disabled in renderer
- Sandbox enabled
- CSP headers via Helmet
- Rate limiting on API endpoints

## API Integration

The desktop app includes all web APIs plus additional Electron-specific features:

### Electron API (via window.electronAPI)

```javascript
// Get application settings
const settings = await window.electronAPI.getAppSettings();

// Set application settings
await window.electronAPI.setAppSettings(settings);

// Get system information
const sysInfo = await window.electronAPI.getSystemInfo();

// Window controls
await window.electronAPI.minimizeWindow();
await window.electronAPI.maximizeWindow();
await window.electronAPI.closeWindow();
```

## Configuration

### electron-builder.json
The build configuration is defined in `package.json` under the `build` key:

- **appId**: com.odyseus.nexuspro
- **productName**: Odyseus Nexus Pro
- **targets**: NSIS (Windows), DMG (macOS), AppImage (Linux)

### Environment Variables

```bash
# Required for AI features
GEMINI_API_KEY=your_api_key_here

# Optional: Firebase configuration
FIREBASE_API_KEY=your_firebase_key

# Server configuration
PORT=3000
NODE_ENV=production
```

## Platform-Specific Notes

### Windows
- Uses NSIS installer
- Creates desktop and start menu shortcuts
- Supports custom installation directory
- Single EXE installer (~150MB)

### macOS
- DMG disk image distribution
- Code signing required for notarization
- Supports both x64 and ARM64 (Apple Silicon)
- Gatekeeper compatible

### Linux
- AppImage for universal compatibility
- No installation required
- Self-contained executable
- Works across distributions

## Troubleshooting

### Common Issues

**App won't start**
- Check if port 3000 is available
- Verify all dependencies are installed
- Check console logs for errors

**AI features not working**
- Ensure GEMINI_API_KEY is set
- Check internet connection
- Verify API key has sufficient quota

**Server not responding**
- Check if server process is running
- Verify firewall settings
- Check server logs in console

**Window controls not working**
- Ensure Electron API is available
- Check preload script is loaded
- Verify context isolation settings

## Performance

### System Requirements

**Minimum**
- 4GB RAM
- 2GB disk space
- Dual-core processor
- 1280x720 display

**Recommended**
- 8GB RAM
- 4GB disk space
- Quad-core processor
- 1920x1080 display

### Optimizations
- Lazy loading of components
- Code splitting
- Image optimization
- Server-side caching
- WebSocket for real-time updates

## Future Enhancements

### Planned Features
- Auto-update mechanism
- Plugin system
- Multi-window support
- Offline mode
- Cloud sync
- Native notifications
- System tray integration
- Global keyboard shortcuts

### Mobile Roadmap
- React Native for iOS/Android
- Shared business logic
- Native UI components
- Push notifications
- Biometric authentication
- App Store distribution

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to the desktop application.

## License

Apache 2.0 - See [LICENSE](LICENSE) for details

## Support

- [Documentation](https://github.com/Liladizilla/NEXUS_PRO_01/wiki)
- [Issue Tracker](https://github.com/Liladizilla/NEXUS_PRO_01/issues)
- [Discussions](https://github.com/Liladizilla/NEXUS_PRO_01/discussions)
