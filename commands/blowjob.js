import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load emojis
const emojisPath = path.join(process.cwd(), 'data', 'emojis.json');
const emojis = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));

export default {
  name: "blowjob",
  description: "Sends random NSFW blowjob images (group only).",
  category: "NSFW",

  async execute(msg, { sock }) {
    const dest = msg.key.remoteJid;
    const isGroup = dest.endsWith('@g.us');

    if (!isGroup) {
      await sock.sendMessage(dest, {
        text: `${emojis.error} This command can only be used in group chats.`,
      }, { quoted: msg });
      return;
    }

    const url = 'https://api.waifu.pics/nsfw/blowjob';

    try {
      await sock.sendMessage(dest, {
        react: { text: emojis.processing, key: msg.key }
      });

      // Send images asynchronously without waiting
      const sendImage = async (index) => {
        try {
          const response = await axios.get(url);
          const imageUrl = response.data.url;
          await sock.sendMessage(dest, {
            image: { url: imageUrl }
          }, { quoted: msg });
        } catch (err) {
          console.error(`[BLOWJOB] Error sending image ${index}:`, err.message);
        }
      };

      // Send all 5 images asynchronously
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(sendImage(i + 1));
      }

      // Wait for all images to be sent
      await Promise.all(promises);

      await sock.sendMessage(dest, {
        react: { text: emojis.success, key: msg.key }
      });

    } catch (error) {
      await sock.sendMessage(dest, {
        text: `${emojis.error} Failed to fetch blowjob images.\n\nError: ${error.message}`,
      }, { quoted: msg });
    }
  }
};