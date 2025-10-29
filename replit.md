# HORLA POOKIE WhatsApp Bot

## Overview

HORLA POOKIE is a feature-rich WhatsApp bot built using the Baileys library. It provides 300+ commands spanning AI interactions, media manipulation, group management, entertainment, and utility functions. The bot is designed to enhance WhatsApp group and personal chat experiences with automated responses, content generation, moderation tools, and integration with external services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technology Stack

**Primary Framework:**
- **Baileys (@whiskeysockets/baileys)** - WhatsApp Web API client library handling all WhatsApp protocol interactions
- **Node.js with ES Modules** - Modern JavaScript runtime using ES6+ import/export syntax

**Key Libraries:**
- **Pino** - Logging infrastructure for connection monitoring and debugging
- **Axios** - HTTP client for external API requests
- **Jimp** - Image manipulation and processing
- **Fluent-FFmpeg** - Audio/video processing and effects
- **OpenAI SDK** - AI-powered chat completions and responses
- **Google Generative AI** - Alternative AI service integration

### Authentication & Session Management

**Session Storage:**
- Multi-file authentication state using `useMultiFileAuthState`
- Session files stored locally in authentication directory
- Automatic session persistence and recovery on reconnection
- QR code generation for initial pairing

**Rationale:** Multi-file auth provides better reliability than single-file sessions, allowing partial recovery if specific auth files become corrupted.

### Command Architecture

**Command Structure:**
- Modular command system with individual files in `/commands` directory
- Each command exports a default object with `name`, `description`, `execute()` function
- Support for command aliases for user convenience
- Category-based organization (AI, Group, Media, Utility, etc.)

**Command Dispatcher:**
- Prefix-based command detection (configurable, default: '.')
- Message parser extracts command name and arguments
- Dynamic command loading from filesystem
- Context object passed to commands includes: `sock`, `args`, `msg`, `settings`, `isOwner`, `isAdmin`

**Design Pattern:** Plugin architecture allows adding new commands without modifying core bot logic. Commands are self-contained and can be enabled/disabled individually.

### Message Processing Pipeline

**Message Handler Flow:**
1. Receive message event from Baileys
2. Extract message content and metadata (sender, chat type, quoted messages)
3. Check for bot mentions or prefix-based commands
4. Parse command and arguments
5. Validate permissions (owner-only, admin-only, group-only)
6. Execute command with proper error handling
7. Send response with optional reactions and media

**Anti-Link System:**
- Real-time link detection in group messages
- Configurable actions: warn, kick, delete message
- Admin bypass functionality
- Persistent settings per group stored in JSON

**Antibug/Anti-Spam System:**
- Owner-only command to enable/disable spam protection
- Tracks message frequency per user (2 messages per second limit)
- Automatically blocks users sending excessive messages
- Prevents spam/bug attacks that could crash the bot
- Settings persisted in `data/antibug_settings.json`
- Command: `.antibug on/off` (owner only)

### Media Handling

**Download Pipeline:**
- `downloadMediaMessage()` from Baileys for quoted media
- Buffer-based processing for images, audio, video
- Temporary file storage during processing
- Automatic cleanup after media operations

**Image Processing:**
- Jimp-based transformations (brightness, contrast, flip, colorize)
- Sticker creation with wa-sticker-formatter
- AI-powered enhancements (dehaze, colorize) via external APIs

**Audio Effects:**
- FFmpeg for voice modulation (bass boost, deep voice, etc.)
- Support for audio extraction and format conversion
- Voice note and audio file handling

### Group Management

**Admin Operations:**
- Promote/demote participants
- Add/remove members  
- Update group metadata (name, description, picture)
- Configure group settings (disappearing messages, announcements)
- Anti-link and moderation features

**Permission System:**
- Metadata-based admin detection via `sock.groupMetadata()`
- Bot admin status validation before privileged operations
- Owner whitelist from config for super-admin commands

### Data Persistence

**Storage Approach:**
- JSON files in `/data` directory for configuration
- Files include: `banned.json`, `moderators.json`, `userGroupData.json`, `trivia.json`, `scores.json`, `quiz_scores.json`, `antibug_settings.json`
- Synchronous read/write operations with error handling
- In-memory caching for frequently accessed data (chat memory, antilink settings, antibug status)

**Persistent Settings:**
- `lib/persistentData.js` provides save/load functions
- Settings include bot preferences, API keys, group configurations
- Settings persisted across bot restarts

**Trade-offs:** JSON files chosen for simplicity and human readability. For high-traffic deployments, migration to a proper database (MongoDB/PostgreSQL) would improve performance.

### External Service Integrations

**AI Services:**
- **OpenAI GPT-4** - Advanced conversational AI via official SDK
- **Google Gemini** - Alternative AI provider for chat completions
- **Copilot API** - Additional AI response option

**Media APIs:**
- **Giphy** - GIF search and retrieval
- **Imgur** - Image hosting and sharing
- **Mumaker** - Logo and text effect generation
- **Carbon API** - Code screenshot generation

**Content Services:**
- **YouTube (ytdl-core)** - Video/audio download and metadata
- **Football Data API** - Live scores, standings, match schedules
- **News API** - Sports and general news feeds
- **Bible/Quran APIs** - Religious text retrieval

**API Key Management:**
- Centralized in `settings.js` and `config.js`
- Environment variable support for sensitive credentials
- Graceful degradation when API keys missing

### Error Handling & Resilience

**Connection Management:**
- Automatic reconnection on disconnect with exponential backoff
- QR code regeneration on session expiry
- Heartbeat monitoring for connection health

**Error Recovery:**
- Try-catch blocks around all external API calls
- Fallback responses when services unavailable
- User-friendly error messages (avoid exposing stack traces)
- Detailed console logging for debugging

**Rate Limiting:**
- Message sending delays to avoid WhatsApp spam detection
- API request throttling for external services
- Configurable limits (e.g., BOOM_MESSAGE_LIMIT for flood protection)

### Testing & Development Mode

**Test Mode Guard:**
- `TEST_MODE_ONLY` environment variable prevents WhatsApp connection
- Allows command loading and validation without live connection
- Useful for development, testing, and command verification

**Rationale:** Prevents accidental live connections during development and allows safe testing of command logic.

### Configuration Management

**Global Config:**
- `config.js` exports bot settings (prefix, owner number, bot name)
- `settings.js` stores API keys and service credentials
- Config made globally accessible via `global.config`

**Environment Variables:**
- Support for `BOT_PREFIX`, `BOT_NAME`, `BOT_OWNER` overrides
- Allows deployment-specific customization without code changes

### Bot Branding & User Experience

**Visual Identity:**
- ASCII art logo displayed on startup
- Styled terminal output with box-drawing characters
- Emoji reactions for command feedback (processing, success, error)
- Branded message footers and captions

**User Interaction:**
- Interactive button menus for navigation
- Contextual help messages with usage examples
- Reaction-based command status indicators
- Typing indicators for natural conversation flow

### Security Considerations

**Authentication:**
- Owner verification via phone number matching
- Admin-only commands restricted to group admins
- Moderator system for delegated permissions

**Input Validation:**
- Argument length checks to prevent overflow
- URL validation for link-based commands
- Binary/base64 encoding validation
- Media type verification before processing

**Privacy:**
- No permanent storage of message content
- Chat memory limited to recent messages
- API keys stored in configuration files (should use environment variables in production)

**Recommendation:** Migrate sensitive credentials to environment variables and implement proper secrets management for production deployments.

## Recent Changes

### October 29, 2025
- **Anticall & Antidelete Integration**: Integrated advanced anticall and antidelete features from Knightbot-MD
  - **Anticall (Self Mode)**: Auto-rejects and blocks incoming calls when enabled
  - **Antidelete (Self Mode)**: Tracks deleted messages and media, includes anti-view-once protection
  - Both features save media temporarily and notify owner with deleted content
  - Added proper ES6 module structure for both commands
  - Integrated call event handler and protocol message handling in index.js
  
- **Auto-Greeting System**: Created automatic time-based greeting system
  - **goodmorning** command: Sends sweet morning messages with motivational quotes
  - **goodnight** command: Sends goodnight messages with peaceful quotes  
  - **autogreet (Self Mode)**: Automatically sends greetings at configured times
  - Configurable morning and night times (default: 7:00 AM and 10:00 PM Lagos time)
  - Prevents duplicate greetings with date tracking
  - Uses API-based messages with fallback to default quotes
  - Scheduler prevents duplicate intervals on reconnects
  
- **Update Command Fix**: Fixed bot update mechanism
  - Added git to Dockerfile system dependencies
  - Resolves "git: not found" error when using `.update` command
  - Bot can now pull latest changes from GitHub repository
  
- **Menu Updates**: 
  - Removed Shazam command aliases (whatsong, findsong, identify) to reduce menu clutter
  - Added anticall and antidelete to ANTI-COMMANDS category
  - Added autogreet to AUTOMATION COMMANDS category
  - Added goodmorning and goodnight to GAMES & FUN category
  - Updated plugin count to 361 commands (338 public + 23 self)

### October 28, 2025
- **WRG Game Enhancement**: Updated Word Random Game (WRG) to use live dictionary API validation instead of static words.txt file
  - Now validates words in real-time using Free Dictionary API (https://dictionaryapi.dev)
  - Supports multiple categories: Animals, Food, Countries, Colors, Sports, Cities, Professions
  - Players can submit any valid English word that exists in the dictionary
  - Improved user experience with real word validation
  
- **Render Deployment Configuration**: 
  - Created `render.yaml` for easy deployment to Render.com
  - Created `Dockerfile` for reliable deployment with all system dependencies
  - Fixed GLib-GObject errors using Docker with libvips, cairo, pango, etc.
  - Added `.dockerignore` for optimized builds
  - Updated `.gitignore` to exclude sensitive files (SESSION-ID, auth_info_baileys, etc.)
  - Switched from nixpacks to Docker for better compatibility

- **Keepalive Command Fix**: Fixed keepalive command authorization
  - Now properly uses owner number from config.js (2348028336218)
  - Fixed authorization check to use config.ownerNumber as fallback
  - Command now works correctly with `.keepon <url>`, `.keepoff`, `.keepalive <url>`
  - Only accessible to bot owner or in self mode

## Deployment

### Render.com Deployment
This project is configured for deployment on Render.com using the `render.yaml` configuration file.

**Steps to Deploy:**
1. Push your code to GitHub
2. Connect your GitHub repository to Render.com
3. Render will automatically detect `render.yaml` and use Docker for deployment
4. Set up environment variables in Render dashboard (API keys from settings.js if needed)
5. Deploy!

**Configuration Files:**
- `render.yaml` - Render service configuration (uses Docker)
- `Dockerfile` - Container image with all system dependencies
- `.dockerignore` - Files to exclude from Docker build

**What the Dockerfile Includes:**
The Docker container installs all required system dependencies:
- `git` - Version control for bot update command
- `libvips-dev` - Image processing library (fixes GLib-GObject error)
- `libcairo2-dev`, `libpango1.0-dev` - Text rendering
- `libjpeg-dev`, `libpng-dev`, `libgif-dev` - Image format support
- `ffmpeg` - Audio/video processing
- Python3 and build tools for native modules

This ensures the bot runs without GLib-GObject-CRITICAL errors and can update itself from GitHub.