import fs from 'fs';
import path from 'path';

const emojisPath = path.join(process.cwd(), 'data', 'emojis.json');
const emojis = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));

const wordsPath = path.join(process.cwd(), 'words.txt');
const wordsList = fs.readFileSync(wordsPath, 'utf8').split('\n').filter(w => w.trim());

const wcgGames = new Map();

export default {
  name: "wcg",
  description: "Word Chain Game: Continue the chain with a word starting with the last letter",
  aliases: ["wordchain", "chainword"],
  category: "Word Chain",
  async execute(msg, { sock, args, settings }) {
    const from = msg.key.remoteJid;
    const prefix = settings?.prefix || '.';

    try {
      if (!args.length) {
        const helpText = `🎮 *WORD CHAIN GAME (WCG)* 🎮

📝 *How to Play:*
Continue the word chain by providing a word that starts with the last letter of the previous word.

⚡ *Commands:*
┃ ${prefix}wcg start - Start a new game
┃ ${prefix}wcg end - End the current game
┃ ${prefix}wcg <word> - Play your word

📖 *Example:*
Player 1: ${prefix}wcg computer
Player 2: ${prefix}wcg router
Player 3: ${prefix}wcg random

💡 *Rules:*
• Word must start with last letter of previous word
• Word must be valid (from word list)
• No repeating words in same game

🎯 *Status:* ${wcgGames.has(from) ? '🟢 Game Active' : '🔴 No Active Game'}`;

        return await sock.sendMessage(from, { text: helpText }, { quoted: msg });
      }

      const command = args[0].toLowerCase();

      if (command === 'start') {
        const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        wcgGames.set(from, {
          currentWord: randomWord.toLowerCase(),
          usedWords: [randomWord.toLowerCase()],
          players: new Map(),
          startTime: Date.now()
        });

        await sock.sendMessage(from, {
          text: `🎮 *WORD CHAIN GAME STARTED!* 🎮

🎯 Starting Word: *${randomWord.toUpperCase()}*

📝 Next word must start with: *${randomWord.slice(-1).toUpperCase()}*

💡 Type: ${prefix}wcg <word> to play!`
        }, { quoted: msg });

        await sock.sendMessage(from, {
          react: { text: emojis.success || '✅', key: msg.key }
        });

        return;
      }

      if (command === 'end') {
        if (!wcgGames.has(from)) {
          return await sock.sendMessage(from, {
            text: `❌ No active game to end!`
          }, { quoted: msg });
        }

        const game = wcgGames.get(from);
        const duration = Math.floor((Date.now() - game.startTime) / 1000);
        
        let leaderboard = '';
        const sortedPlayers = Array.from(game.players.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        sortedPlayers.forEach(([player, score], index) => {
          const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
          leaderboard += `${medals[index]} @${player.split('@')[0]}: ${score} words\n`;
        });

        wcgGames.delete(from);

        await sock.sendMessage(from, {
          text: `🏁 *GAME ENDED!* 🏁

⏱️ Duration: ${duration}s
📝 Total Words: ${game.usedWords.length}

🏆 *TOP PLAYERS:*
${leaderboard || 'No players participated'}

Thanks for playing! 🎮`
        }, { quoted: msg });

        await sock.sendMessage(from, {
          react: { text: emojis.success || '🏁', key: msg.key }
        });

        return;
      }

      if (!wcgGames.has(from)) {
        return await sock.sendMessage(from, {
          text: `❌ No active game! Start one with: ${prefix}wcg start`
        }, { quoted: msg });
      }

      const game = wcgGames.get(from);
      const word = args.join(' ').toLowerCase().trim();

      if (!word || word.length < 2) {
        return await sock.sendMessage(from, {
          text: `❌ Please provide a valid word (minimum 2 letters)!`
        }, { quoted: msg });
      }

      const lastLetter = game.currentWord.slice(-1);
      const firstLetter = word[0];

      if (firstLetter !== lastLetter) {
        await sock.sendMessage(from, {
          text: `❌ Word must start with *${lastLetter.toUpperCase()}*!\n\nCurrent word: *${game.currentWord.toUpperCase()}*`
        }, { quoted: msg });

        await sock.sendMessage(from, {
          react: { text: emojis.error || '❌', key: msg.key }
        });

        return;
      }

      if (game.usedWords.includes(word)) {
        return await sock.sendMessage(from, {
          text: `❌ Word *${word.toUpperCase()}* already used in this game!`
        }, { quoted: msg });
      }

      if (!wordsList.some(w => w.toLowerCase() === word)) {
        return await sock.sendMessage(from, {
          text: `❌ *${word.toUpperCase()}* is not in the word list!`
        }, { quoted: msg });
      }

      game.usedWords.push(word);
      game.currentWord = word;

      const playerJid = msg.key.participant || msg.key.remoteJid;
      const currentScore = game.players.get(playerJid) || 0;
      game.players.set(playerJid, currentScore + 1);

      const nextLetter = word.slice(-1).toUpperCase();

      await sock.sendMessage(from, {
        text: `✅ *${word.toUpperCase()}* accepted!

📝 Next word must start with: *${nextLetter}*
🎯 Words played: ${game.usedWords.length}
🏆 Your score: ${currentScore + 1}`
      }, { quoted: msg });

      await sock.sendMessage(from, {
        react: { text: emojis.success || '✅', key: msg.key }
      });

    } catch (error) {
      console.error('WCG command error:', error);
      await sock.sendMessage(from, {
        text: `${emojis.error || '❌'} *Error in Word Chain Game*\n\n🔧 *Error:* ${error.message}`
      }, { quoted: msg });

      await sock.sendMessage(from, {
        react: { text: emojis.error || '❌', key: msg.key }
      });
    }
  }
};
