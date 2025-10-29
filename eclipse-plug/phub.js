import { horla } from '../lib/horla.js';
import axios from 'axios';

const phub = horla({
  nomCom: "phub",
  categorie: "Logo",
  reaction: "🌈"
}, async (msg, { sock, args }) => {
  const from = msg.key.remoteJid;
  const userName = msg.pushName || "User";

  if (!args || args.length === 0) {
    await sock.sendMessage(from, {
      text: `*Example, ${userName}: * .phub text1|text2`
    }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, {
      text: "*Processing...*"
    }, { quoted: msg });

    const text = Array.isArray(args) ? args.join(' ') : args.toString();
    const textParts = text.split('|');
    const text1 = textParts[0]?.trim() || 'Porn';
    const text2 = textParts[1]?.trim() || 'Hub';
    
    // Use TextPro API as fallback
    const apiUrl = `https://api.neastooid.xyz/api/maker/pornhub?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
    
    const response = await axios.get(apiUrl, {
      timeout: 15000
    });

    // Check if response has image URL
    if (!response.data || !response.data.result) {
      throw new Error('API returned invalid response. Please try again later.');
    }

    await sock.sendMessage(from, {
      image: { url: response.data.result },
      caption: "*Logo by HORLA POOKIE*"
    }, { quoted: msg });
  } catch (e) {
    console.error('[PHUB] Error:', e);
    await sock.sendMessage(from, {
      text: `❌ *Error:* ${e.message}\n\n💡 Please try again later or contact support if the issue persists.`
    }, { quoted: msg });
  }
});

export default phub;
