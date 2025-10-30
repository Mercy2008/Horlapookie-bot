# HORLA POOKIE WhatsApp Bot

## Overview
HORLA POOKIE is a feature-rich WhatsApp bot built with the Baileys library, offering over 300 commands. It aims to enhance WhatsApp group and personal chat experiences through AI interactions, media manipulation, group management, entertainment, and various utility functions. The bot automates responses, generates content, provides moderation tools, and integrates with external services.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technology Stack
- **Primary Framework:** Baileys (@whiskeysockets/baileys) for WhatsApp Web API interaction, Node.js with ES Modules.
- **Key Libraries:** Pino for logging, Axios for HTTP requests, Jimp for image processing, Fluent-FFmpeg for audio/video, OpenAI SDK and Google Generative AI for AI functionalities.

### Authentication & Session Management
- **Session Storage:** Multi-file authentication using `useMultiFileAuthState` for persistence and recovery, stored locally. QR code generation for initial pairing.

### Command Architecture
- **Command Structure:** Modular system with individual files in `/commands`, supporting aliases and categorized organization (AI, Group, Media, Utility). Each command exports `name`, `description`, and an `execute()` function.
- **Command Dispatcher:** Prefix-based detection, message parsing, dynamic loading, and context passing to commands. Utilizes a plugin architecture for extensibility.

### Message Processing Pipeline
- **Message Handler Flow:** Receives message events, extracts content, checks for bot mentions/prefixes, parses commands, validates permissions, executes commands with error handling, and sends responses.
- **Anti-Link System:** Real-time link detection in groups with configurable actions (warn, kick, delete message) and admin bypass.
- **Antibug/Anti-Spam System:** Owner-only protection against excessive messages (2 msg/sec limit) to prevent spam/bug attacks, with settings persisted in `data/antibug_settings.json`.

### Media Handling
- **Download Pipeline:** `downloadMediaMessage()` for quoted media, buffer-based processing, temporary file storage, and automatic cleanup.
- **Image Processing:** Jimp-based transformations, sticker creation with `wa-sticker-formatter`, and AI-powered enhancements via external APIs.
- **Audio Effects:** FFmpeg for voice modulation, extraction, and format conversion.

### Group Management
- **Admin Operations:** Promote/demote, add/remove members, update group metadata, configure settings, and integrate anti-link/moderation.
- **Permission System:** Metadata-based admin detection and bot admin status validation. Owner whitelist for super-admin commands.

### Data Persistence
- **Storage Approach:** JSON files in `/data` for configuration (`banned.json`, `moderators.json`, etc.). Synchronous read/write with error handling and in-memory caching. `lib/persistentData.js` for saving/loading settings.
- **Trade-offs:** JSON chosen for simplicity; a database (MongoDB/PostgreSQL) recommended for high-traffic.

### Error Handling & Resilience
- **Connection Management:** Automatic reconnection with exponential backoff, QR code regeneration, and heartbeat monitoring.
- **Error Recovery:** Try-catch blocks for API calls, fallback responses, user-friendly error messages, and detailed logging.
- **Rate Limiting:** Message sending delays to avoid WhatsApp spam detection and API request throttling.

### Testing & Development Mode
- **Test Mode Guard:** `TEST_MODE_ONLY` environment variable prevents WhatsApp connection, allowing command loading and validation without a live connection.

### Configuration Management
- **Global Config:** `config.js` for bot settings (prefix, owner number, name) and `settings.js` for API keys, globally accessible via `global.config`.
- **Environment Variables:** Support for `BOT_PREFIX`, `BOT_NAME`, `BOT_OWNER` overrides for deployment-specific customization.

### Bot Branding & User Experience
- **Visual Identity:** ASCII art logo, styled terminal output, emoji reactions, and branded message footers.
- **User Interaction:** Interactive button menus, contextual help, reaction-based status indicators, and typing indicators.

### Security Considerations
- **Authentication:** Owner verification, admin-only command restrictions, and moderator system.
- **Input Validation:** Argument length checks, URL validation, binary/base64 encoding validation, and media type verification.
- **Privacy:** No permanent storage of message content, limited chat memory.
- **Recommendation:** Migrate sensitive credentials to environment variables for production.

## External Dependencies

### AI Services
- **OpenAI GPT-4:** Advanced conversational AI.
- **Google Gemini:** Alternative AI provider for chat completions and vision analysis (`gemini-1.5-flash`).
- **Copilot API:** Additional AI response option.

### Media APIs
- **Giphy:** GIF search and retrieval.
- **Imgur:** Image hosting and sharing.
- **Mumaker:** Logo and text effect generation.
- **Carbon API:** Code screenshot generation.

### Content Services
- **YouTube (ytdl-core):** Video/audio download and metadata.
- **Football Data API:** Live scores, standings, match schedules.
- **News API:** Sports and general news feeds.
- **Bible/Quran APIs:** Religious text retrieval.
- **Free Dictionary API:** Real-time word validation for games.

### Deployment Specifics
- **Render.com:** Deployment platform using `render.yaml` and `Dockerfile`.