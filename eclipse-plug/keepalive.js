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

  async execute(msg, { sock, args, isOwner, settings }) {
    // Validate message structure
    if (!msg || !msg.key || !msg.key.remoteJid) {
      console.error('[KEEPALIVE] Invalid message structure');
      return;
    }
    
    const from = msg.key.remoteJid;

    // Owner check
    if (!msg.key.fromMe && !isOwner) {
      return await sock.sendMessage(from, {
        text: '❌ This command is only available to the bot owner.'
      }, { quoted: msg });
    }

    // Parse command name from message body or args
    let commandName = '';
    if (msg.body) {
      commandName = msg.body.split(' ')[0].replace(settings.prefix, '').toLowerCase();
    } else if (args && args.length > 0) {
      commandName = 'keepalive'; // Default if called from args
    }

    if (commandName === 'keepon' || commandName === 'keepalive') {
      // Extract URL from args
      const urlArg = args[0];

      if (!urlArg && !currentPingUrl) {
        return await sock.sendMessage(from, { 
          text: '❌ Please provide a URL to ping!\n\n📋 **Usage:**\n• `.keepon <url>` - Start keepalive with URL\n• `.keepalive <url>` - Start keepalive with URL\n• `.keepoff` - Stop keepalive\n\n**Example:** `.keepon https://myapp.onrender.com`' 
        }, { quoted: msg });
      }

      if (keepAliveInterval) {
        return await sock.sendMessage(from, { 
          text: `✅ Keepalive system is already running!\n🌐 Currently pinging: ${currentPingUrl}\n\nUse \`.keepoff\` to stop, then start with new URL.` 
        }, { quoted: msg });
      }

      // Set the URL to ping
      if (urlArg) {
        currentPingUrl = urlArg;
      }

      // Validate URL format
      if (!currentPingUrl.startsWith('http://') && !currentPingUrl.startsWith('https://')) {
        return await sock.sendMessage(from, { 
          text: '❌ Invalid URL format! URL must start with http:// or https://' 
        }, { quoted: msg });
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
        return await sock.sendMessage(from, { 
          text: `✅ Keepalive system started!\n🌐 Pinging: ${currentPingUrl}\n⏰ Interval: Every 7 minutes\n📡 Status: Active\n🎯 Initial ping: Success (${response.status})` 
        }, { quoted: msg });
      } catch (error) {
        console.log(`[KEEPALIVE] Initial ping failed: ${error.message}`);
        return await sock.sendMessage(from, { 
          text: `⚠️ Keepalive system started!\n🌐 Pinging: ${currentPingUrl}\n⏰ Interval: Every 7 minutes\n📡 Status: Active\n❌ Initial ping failed: ${error.message}\n\n💡 The system will keep trying every 7 minutes.` 
        }, { quoted: msg });
      }
    }

    if (commandName === 'keepoff') {
      if (!keepAliveInterval) {
        return await sock.sendMessage(from, { 
          text: '❌ Keepalive system is not running!' 
        }, { quoted: msg });
      }

      const stoppedUrl = currentPingUrl;
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
      currentPingUrl = null;

      return await sock.sendMessage(from, { 
        text: `🛑 Keepalive system stopped!\n🌐 Was pinging: ${stoppedUrl}\n📡 Status: Inactive` 
      }, { quoted: msg });
    }
  }
};