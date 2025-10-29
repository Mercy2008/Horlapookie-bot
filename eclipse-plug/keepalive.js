import axios from 'axios';

let keepAliveInterval = null;
let currentPingUrl = null;
const PING_INTERVAL = 7 * 60 * 1000; // 7 minutes in milliseconds

export default {
  name: 'keepon',
  description: 'Start keepalive ping system for Render deployment',
  category: 'system',
  usage: '§keepon <url>',
  aliases: ['keepoff', 'keepalive'],
  
  async execute(sock, chatId, userId, args, commandText) {
    if (!commandText) {
      return sock.sendMessage(chatId, { 
        text: '❌ Invalid command format!\n\n📋 **Usage:**\n• `.keepon <url>` - Start keepalive with URL\n• `.keepalive <url>` - Start keepalive with URL\n• `.keepoff` - Stop keepalive' 
      });
    }
    const command = commandText.toLowerCase();

    if (command.startsWith('keepon') || command.startsWith('keepalive')) {
      // Extract URL from args
      const urlArg = args[0];
      
      if (!urlArg && !currentPingUrl) {
        return sock.sendMessage(chatId, { 
          text: '❌ Please provide a URL to ping!\n\n📋 **Usage:**\n• `.keepon <url>` - Start keepalive with URL\n• `.keepalive <url>` - Start keepalive with URL\n• `.keepoff` - Stop keepalive\n\n**Example:** `.keepon https://myapp.onrender.com`' 
        });
      }
      
      if (keepAliveInterval) {
        return sock.sendMessage(chatId, { 
          text: `✅ Keepalive system is already running!\n🌐 Currently pinging: ${currentPingUrl}\n\nUse \`.keepoff\` to stop, then start with new URL.` 
        });
      }

      // Set the URL to ping
      if (urlArg) {
        currentPingUrl = urlArg;
      }

      // Validate URL format
      if (!currentPingUrl.startsWith('http://') && !currentPingUrl.startsWith('https://')) {
        return sock.sendMessage(chatId, { 
          text: '❌ Invalid URL format! URL must start with http:// or https://' 
        });
      }

      // Start the keepalive ping
      keepAliveInterval = setInterval(async () => {
        try {
          const response = await axios.get(currentPingUrl, { timeout: 30000 });
          console.log(`[KEEPALIVE] Ping successful - Status: ${response.status}`);
        } catch (error) {
          console.log(`[KEEPALIVE] Ping failed: ${error.message}`);
        }
      }, PING_INTERVAL);

      // Send initial ping
      try {
        const response = await axios.get(currentPingUrl, { timeout: 30000 });
        console.log(`[KEEPALIVE] Initial ping successful - Status: ${response.status}`);
        return sock.sendMessage(chatId, { 
          text: `✅ Keepalive system started!\n🌐 Pinging: ${currentPingUrl}\n⏰ Interval: Every 7 minutes\n📡 Status: Active\n🎯 Initial ping: Success (${response.status})` 
        });
      } catch (error) {
        console.log(`[KEEPALIVE] Initial ping failed: ${error.message}`);
        return sock.sendMessage(chatId, { 
          text: `⚠️ Keepalive system started!\n🌐 Pinging: ${currentPingUrl}\n⏰ Interval: Every 7 minutes\n📡 Status: Active\n❌ Initial ping failed: ${error.message}\n\n💡 The system will keep trying every 7 minutes.` 
        });
      }
    }

    if (command.startsWith('keepoff')) {
      if (!keepAliveInterval) {
        return sock.sendMessage(chatId, { text: '❌ Keepalive system is not running!' });
      }

      const stoppedUrl = currentPingUrl;
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
      currentPingUrl = null;

      return sock.sendMessage(chatId, { 
        text: `🛑 Keepalive system stopped!\n🌐 Was pinging: ${stoppedUrl}\n📡 Status: Inactive` 
      });
    }
  }
};
