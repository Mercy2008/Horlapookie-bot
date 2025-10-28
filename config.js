import settings from './settings.js';

export default {
  // Bot configuration
  prefix: process.env.BOT_PREFIX || '.', // input your prefix here 
  ownerNumber: process.env.BOT_OWNER || '2348028336218', // input your number here 
  botName: process.env.BOT_NAME || '✦✦✦ 𝐇 𝐎 𝐑 𝐋 𝐀 𝐏 𝐎 𝐎 𝐊 𝐈 𝐄 ✦✦✦',
  ownerName: process.env.BOT_OWNER_NAME || '𝓗𝓞𝓡𝓛𝓐𝓟𝓞𝓞𝓚𝓘𝓔', // optional 
  sessionId: 'HORLA-POOKIE-SESSION-ID', // sensitive name 
  BOOM_MESSAGE_LIMIT: 50,  

  // API configurations from settings
  openaiApiKey: settings.openaiApiKey,
  giphyApiKey: settings.giphyApiKey,
  geminiApiKey: settings.geminiApiKey,
  imgurClientId: settings.imgurClientId,
  copilotApiKey: settings.copilotApiKey,
  FOOTBALL_API_KEY: settings.FOOTBALL_API_KEY,
};
