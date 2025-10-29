# 🎮 𝔼𝕔𝕝𝕚𝕡𝕤𝕖 𝕄𝔻 Bot Eclipse-Plug Directory

<div align="center">

<!-- Animated Typing Effect -->
![Typing SVG](https://readme-typing-svg.demolab.com/?lines=300%2B+POWERFUL+COMMANDS+AVAILABLE;AI+MEDIA+GAMES+AND+MORE;𝔼𝕔𝕝𝕚𝕡𝕤𝕖+𝕄𝔻+v1&font=Fira+Code&color=00C853&size=24&center=true&vCenter=true&width=900&height=50&duration=4000&pause=1000)

</div>

## 📂 Command Structure

This directory contains **300+ modular commands** for the 𝔼𝕔𝕝𝕚𝕡𝕤𝕖 𝕄𝔻 WhatsApp Bot. Each command is a self-contained JavaScript module with its own functionality.

```
┌─────────────────────────────────────────┐
│  🎯 COMMAND ARCHITECTURE                │
├─────────────────────────────────────────┤
│  • Modular Design                       │
│  • Hot-Reload Support                   │
│  • Category-Based Organization          │
│  • Permission System                    │
│  • Error Handling Built-in              │
└─────────────────────────────────────────┘
```

---

<div align="center">

## 🚀 Command Categories

![Typing SVG](https://readme-typing-svg.demolab.com/?lines=EXPLORE+ALL+COMMAND+CATEGORIES+BELOW&font=Fira+Code&color=FF5722&size=20&center=true&vCenter=true&width=700&height=40&duration=3000&pause=1000)

</div>

### 🤖 AI & Automation Commands
```bash
ai2.js           # Advanced AI chat assistant
ask.js           # Ask AI questions
chatbot.js       # Smart chatbot responses
copilot.js       # GitHub Copilot AI integration
answer.js        # Quick answer generator
```

### 🎨 Media & Image Processing
```bash
sticker.js       # Create WhatsApp stickers
attp.js          # Animated text to picture
audio.js         # Audio processing tools
avatar.js        # Profile picture tools
brightness.js    # Image brightness adjustment
contrast.js      # Image contrast control
colorize.js      # Colorize black/white images
dehaze.js        # Remove haze from images
deep.js          # Deep fried image effects
```

### 🎮 Games & Entertainment
```bash
hangman.js       # Word guessing game
trivia.js        # Trivia quiz game
quiz.js          # Knowledge quiz
werewolf.js      # Werewolf social game
ship.js          # Relationship compatibility
dice.js          # Roll the dice
truth.js         # Truth or dare
dare.js          # Dare challenges
```

### 👥 Group Management
```bash
add.js           # Add members to group
kick.js          # Remove group members
promote.js       # Promote to admin
demote.js        # Demote from admin
tagall.js        # Tag all members
welcome.js       # Welcome message system
antilink.js      # Anti-link protection
mute.js          # Mute group
unmute.js        # Unmute group
groupinfo.js     # Group information
```

### 🎭 Text Effects & Logos
```bash
carbon.js        # Code to image converter
castle.js        # Castle text effect
brutal.js        # Brutal text effect
boom.js          # Boom text effect
neon.js          # Neon text effect
glitch.js        # Glitch text effect
3d.js            # 3D text effect
thunder.js       # Thunder text effect
fire.js          # Fire text effect
```

### 🛠️ Utility Commands
```bash
translate.js     # Language translation
qr.js            # QR code generator
shorten.js       # URL shortener
weather.js       # Weather forecast
time.js          # World time zones
calculator.js    # Math calculator
base64.js        # Base64 encode/decode
binary.js        # Binary converter
encrypt.js       # Text encryption
decrypt.js       # Text decryption
```

### 📥 Download Commands
```bash
ytmp3.js         # YouTube audio download
ytmp4.js         # YouTube video download
spotify.js       # Spotify music download
instagram.js     # Instagram downloader
facebook.js      # Facebook downloader
tiktok.js        # TikTok downloader
twitter.js       # Twitter downloader
pinterest.js     # Pinterest downloader
```

### 📡 Information & Search
```bash
wikipedia.js     # Wikipedia search
dictionary.js    # Word definitions
github.js        # GitHub repository info
npm.js           # NPM package search
google.js        # Google search
news.js          # Latest news
quotes.js        # Inspirational quotes
joke.js          # Random jokes
fact.js          # Random facts
```

### ⚽ Sports Commands
```bash
cl_matchday.js   # Champions League matches
cl_table.js      # Champions League standings
cl_news.js       # Champions League news
cl_top_scorer.js # Top scorers
football.js      # Football scores
cricket.js       # Cricket scores
```

### 📖 Religious Commands
```bash
Quran.js         # Quran verses
bible.js         # Bible verses
biblelist.js     # Bible book list
prayer.js        # Prayer times
hadith.js        # Islamic hadith
```

### 🎵 Music & Audio Effects
```bash
play.js          # Play music
bass.js          # Bass boost effect
deep.js          # Deep voice effect
earrape.js       # Earrape effect
reverse.js       # Reverse audio
nightcore.js     # Nightcore effect
slow.js          # Slow audio
fast.js          # Fast audio
```

### 🔐 Owner & Admin Commands
```bash
ban.js           # Ban users
unban.js         # Unban users
broadcast.js     # Broadcast message
join.js          # Join group via link
leave.js         # Leave group
block.js         # Block user
unblock.js       # Unblock user
restart.js       # Restart bot
update.js        # Update bot
eval.js          # Execute code
```

---

<div align="center">

## 💡 How Commands Work

![Typing SVG](https://readme-typing-svg.demolab.com/?lines=MODULAR+PLUGIN+ARCHITECTURE;EASY+TO+ADD+NEW+COMMANDS;HOT+RELOAD+SUPPORTED&font=Fira+Code&color=2196F3&size=18&center=true&vCenter=true&width=700&height=40&duration=3500&pause=1000)

</div>

### Command Structure
Each command file exports a default object with:

```javascript
export default {
  name: "commandname",           // Command identifier
  description: "What it does",   // Command description
  aliases: ["alt1", "alt2"],     // Alternative names
  category: "Category Name",     // Command category
  usage: "prefix + command args", // How to use
  
  async execute(msg, { sock, args, settings, isOwner, isAdmin }) {
    // Command logic here
  }
};
```

### Permission Levels
- 🌍 **Public**: Anyone can use
- 👤 **User**: Registered users only
- 👮 **Admin**: Group admins only
- 👑 **Owner**: Bot owner only

### Adding New Commands
1. Create new `.js` file in this directory
2. Follow the command structure template
3. Export the command object
4. Bot auto-loads new commands on restart

---

<div align="center">

## 🎯 Special Features

</div>

### 🔥 Advanced Features
- **Hot Reload**: Add commands without restarting
- **Error Handling**: Built-in try-catch blocks
- **Rate Limiting**: Anti-spam protection
- **Permission System**: Role-based access
- **Aliases Support**: Multiple command names
- **Category System**: Organized command groups

### 📊 Command Statistics
- **Total Commands**: 300+
- **Categories**: 15+
- **Public Commands**: 250+
- **Admin Commands**: 30+
- **Owner Commands**: 20+

---

<div align="center">

## 🔧 For Developers

![Typing SVG](https://readme-typing-svg.demolab.com/?lines=CONTRIBUTE+NEW+COMMANDS;IMPROVE+EXISTING+FEATURES;REPORT+BUGS+AND+ISSUES&font=Fira+Code&color=FF9800&size=18&center=true&vCenter=true&width=700&height=40&duration=3500&pause=1000)

</div>

### Development Guidelines
- Follow existing command structure
- Add proper error handling
- Include usage examples
- Document required permissions
- Test thoroughly before committing

### Best Practices
- ✅ Use descriptive command names
- ✅ Provide helpful error messages
- ✅ Validate user input
- ✅ Handle edge cases
- ✅ Add command aliases
- ✅ Include usage examples

---

<div align="center">

**Made with ❤️ by Horlapookie**

![Typing SVG](https://readme-typing-svg.demolab.com/?lines=THANK+YOU+FOR+USING+HORLA+POOKIE+BOT&font=Fira+Code&color=E91E63&size=20&center=true&vCenter=true&width=700&height=50&duration=3000&pause=1000)

</div>
