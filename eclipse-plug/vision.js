import { GoogleGenerativeAI } from '@google/generative-ai';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import settings from '../settings.js';

const emojisPath = path.join(process.cwd(), 'data', 'emojis.json');
const emojis = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));

export default {
  name: 'vision',
  aliases: ['describe', 'analyze'],
  description: 'Analyze and describe an image using Gemini AI vision',
  category: 'AI Image Generator',

  async execute(msg, { sock, args }) {
    const from = msg.key.remoteJid;
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!msg.message?.imageMessage && !quotedMsg?.imageMessage) {
      return await sock.sendMessage(from, {
        text: `${emojis.ai} *GEMINI AI Vision*\n\n🖼️ *Reply to an image to analyze it.*\n\n*Usage:*\n• Reply to image + ?vision\n• Reply to image + ?vision <custom prompt>\n\n*Examples:*\n• ?vision - Default description\n• ?vision what is in this image?\n• ?vision describe in detail\n• ?analyze translate any text in this image`
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(from, {
        react: { text: emojis.processing, key: msg.key }
      });

      await sock.sendMessage(from, {
        text: `${emojis.ai} *Analyzing image with Gemini AI...*\n\n⏳ Processing your request...`
      }, { quoted: msg });

      const imageMessage = msg.message?.imageMessage || quotedMsg?.imageMessage;
      
      // Download image using Baileys method
      const stream = await downloadContentFromMessage(imageMessage, 'image');
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const imageBuffer = Buffer.concat(chunks);

      const apiKey = settings.geminiApiKey;
      if (!apiKey) {
        return await sock.sendMessage(from, {
          text: `${emojis.error} *Gemini API key not found!*\n\n⚙️ Please set geminiApiKey in settings.js.\n\n📝 Get your free API key at:\nhttps://makersuite.google.com/app/apikey`
        }, { quoted: msg });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = args.length ? args.join(' ') : 'Describe this image in detail.';

      const imageParts = [{
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: imageMessage.mimetype || 'image/jpeg'
        }
      }];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const description = response.text();

      if (!description) {
        return await sock.sendMessage(from, {
          text: `${emojis.warning} *No response received from Gemini AI.*`
        }, { quoted: msg });
      }

      await sock.sendMessage(from, {
        text: `${emojis.success} *Image Analysis Result:*\n\n${description}\n\n> Powered by Gemini AI`
      }, { quoted: msg });

      await sock.sendMessage(from, {
        react: { text: emojis.success, key: msg.key }
      });

    } catch (err) {
      console.error('Vision command error:', err);
      
      let errorMessage = `${emojis.error} *Failed to analyze image*\n\n`;
      
      if (err.message?.includes('API key')) {
        errorMessage += '🔑 Invalid or missing API key. Please check your GEMINI_API_KEY.';
      } else if (err.message?.includes('quota')) {
        errorMessage += '📊 API quota exceeded. Please try again later.';
      } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        errorMessage += '⏰ Request timed out. Please try again.';
      } else {
        errorMessage += `🛠️ Error: ${err.message}`;
      }
      
      await sock.sendMessage(from, {
        text: errorMessage
      }, { quoted: msg });

      await sock.sendMessage(from, {
        react: { text: emojis.error, key: msg.key }
      });
    }
  }
};
