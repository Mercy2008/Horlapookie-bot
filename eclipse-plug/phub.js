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
      text: "*Generating logo...*"
    }, { quoted: msg });

    const text = Array.isArray(args) ? args.join(' ') : args.toString();
    const textParts = text.split('|');
    const text1 = encodeURIComponent(textParts[0]?.trim() || 'Porn');
    const text2 = encodeURIComponent(textParts[1]?.trim() || 'Hub');

    // Try multiple API endpoints
    const apiEndpoints = [
      `https://api.popcat.xyz/pornhub?text1=${text1}&text2=${text2}`,
      `https://some-random-api.com/canvas/misc/phub?text1=${text1}&text2=${text2}`,
      `https://api.caliph.biz.id/api/textpro/pornhub?text1=${text1}&text2=${text2}`
    ];

    let success = false;

    for (const apiUrl of apiEndpoints) {
      try {
        const response = await fetch(apiUrl, { 
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');

          // Check if response is an image
          if (contentType && contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            await sock.sendMessage(from, {
              image: imageBuffer,
              caption: "*Logo by ECLIPSE MD*"
            }, { quoted: msg });
            success = true;
            break;
          } else {
            // Try to parse as JSON (some APIs return JSON with image URL)
            const data = await response.json();
            if (data.url || data.image || data.result) {
              const imageUrl = data.url || data.image || data.result;
              const imgResponse = await fetch(imageUrl, { timeout: 10000 });
              const imageBuffer = await imgResponse.buffer();

              await sock.sendMessage(from, {
                image: imageBuffer,
                caption: "*Logo by ECLIPSE MD*"
              }, { quoted: msg });
              success = true;
              break;
            }
          }
        }
      } catch (apiError) {
        console.log(`[PHUB] API ${apiUrl} failed:`, apiError.message);
        continue;
      }
    }

    if (!success) {
      throw new Error('All logo generation services are currently unavailable. This could be due to:\n• API rate limits\n• Service downtime\n• Network connectivity issues\n\nPlease try again in a few minutes.');
    }

  } catch (e) {
    console.error('[PHUB] Error:', e);
    await sock.sendMessage(from, {
      text: `❌ *Error generating logo*\n\n${e.message}\n\n💡 The logo service is currently unavailable. Please try again later.`
    }, { quoted: msg });
  }
});

export default phub;