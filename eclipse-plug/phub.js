
import { horla } from '../lib/horla.js';
import mumaker from 'mumaker';

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
    
    // Use the same mumaker library as other logo commands
    let anu = await mumaker.textpro(
      "https://textpro.me/pornhub-style-logo-online-generator-free-977.html", 
      [text1, text2]
    );

    await sock.sendMessage(from, {
      image: { url: anu.image },
      caption: "*Logo by HORLA POOKIE*"
    }, { quoted: msg });
  } catch (e) {
    console.error('[PHUB] Error:', e);
    await sock.sendMessage(from, {
      text: `🥵🥵 ${e.message}`
    }, { quoted: msg });
  }
});

export default phub;
