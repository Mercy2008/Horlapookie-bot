
import { horla } from '../lib/horla.js';
import fetch from 'node-fetch';

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
    
    // Try primary API (textpro.me via direct fetch)
    try {
      const apiUrl = `https://api.popcat.xyz/pornhub?text=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
      const response = await fetch(apiUrl, { timeout: 15000 });
      
      if (response.ok) {
        const imageBuffer = await response.buffer();
        
        await sock.sendMessage(from, {
          image: imageBuffer,
          caption: "*Logo by ECLIPSE MD*"
        }, { quoted: msg });
        return;
      }
    } catch (apiError) {
      console.log('[PHUB] Primary API failed, trying fallback...');
    }

    // Fallback: Use alternative API
    const fallbackUrl = `https://api.erdwpe.com/api/maker/pornhub?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
    const fallbackResponse = await fetch(fallbackUrl, { timeout: 15000 });
    
    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      if (data.result) {
        await sock.sendMessage(from, {
          image: { url: data.result },
          caption: "*Logo by ECLIPSE MD*"
        }, { quoted: msg });
        return;
      }
    }

    throw new Error('All logo generation services are currently unavailable');

  } catch (e) {
    console.error('[PHUB] Error:', e);
    await sock.sendMessage(from, {
      text: `❌ *Error generating logo*\n\n${e.message}\n\n💡 The logo service is currently unavailable. Please try again later.`
    }, { quoted: msg });
  }
});

export default phub;
