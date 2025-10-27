import fs from 'fs';
import path from 'path';

const emojisPath = path.join(process.cwd(), 'data', 'emojis.json');
const emojis = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));

const wordsPath = path.join(process.cwd(), 'words.txt');
const wordsList = fs.readFileSync(wordsPath, 'utf8').split('\n').filter(w => w.trim());

const wrgGames = new Map();

const categories = [
  { name: 'Technology', keywords: ['computer', 'software', 'internet', 'programming', 'network'] },
  { name: 'Animals', keywords: ['cat', 'dog', 'bird', 'fish', 'animal'] },
  { name: 'Food', keywords: ['food', 'fruit', 'vegetable', 'drink', 'meal'] },
  { name: 'Nature', keywords: ['tree', 'flower', 'mountain', 'river', 'ocean'] },
  { name: 'Sports', keywords: ['ball', 'game', 'player', 'team', 'sport'] },
  { name: 'Music', keywords: ['song', 'music', 'instrument', 'sound', 'melody'] },
  { name: 'Any Word', keywords: [] }
];

export default {
  name: "wrg",
  description: "Word Random Game: Submit words based on random prompts",
  aliases: ["randomword", "wordgame"],
  category: "Word Chain",
  async execute(msg, { sock, args, settings }) {
    const from = msg.key.remoteJid;
    const prefix = settings?.prefix || '.';

    try {
      if (!args.length) {
        const helpText = `🎮 *WORD RANDOM GAME (WRG)* 🎮

📝 *How to Play:*
Submit valid words based on the given category prompt within the time limit!

⚡ *Commands:*
┃ ${prefix}wrg start - Start multiplayer game (default)
┃ ${prefix}wrg start solo - Start solo game (personal challenge)
┃ ${prefix}wrg start multi - Start multiplayer game
┃ ${prefix}wrg end - End the current game
┃ ${prefix}wrg <word> - Submit your word

📖 *Example:*
Game Prompt: "Technology words"
Player: ${prefix}wrg computer
Player: ${prefix}wrg internet

🎮 *Game Modes:*
👥 *Multiplayer:* Everyone can participate and compete
👤 *Solo:* Personal challenge, only you can play

💡 *Rules:*
• Word must be valid (from word list)
• Submit as many words as you can
• No repeating words in same game
• Game ends after 5 minutes or when stopped

🎯 *Status:* ${wrgGames.has(from) ? '🟢 Game Active' : '🔴 No Active Game'}`;

        return await sock.sendMessage(from, { text: helpText }, { quoted: msg });
      }

      const command = args[0].toLowerCase();

      if (command === 'start') {
        // Check if mode argument is provided (solo or multi)
        const mode = args[1]?.toLowerCase();
        const isSolo = mode === 'solo' || mode === 'single' || mode === '1';
        const isMulti = mode === 'multi' || mode === 'multiplayer' || !mode; // Default to multi
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const categoryWords = category.keywords.length > 0
          ? wordsList.filter(w => category.keywords.some(k => w.toLowerCase().includes(k)))
          : wordsList;

        const playerJid = msg.key.participant || msg.key.remoteJid;

        wrgGames.set(from, {
          category: category.name,
          validWords: categoryWords,
          usedWords: [],
          players: new Map([[playerJid, 0]]), // Initialize with starter
          startTime: Date.now(),
          timeLimit: 5 * 60 * 1000,
          mode: isSolo ? 'solo' : 'multi'
        });

        const modeText = isSolo 
          ? '👤 *Mode:* Solo (Personal Challenge)\n⏱️ Beat your own high score!'
          : '👥 *Mode:* Multiplayer (Everyone can join)\n🏆 Compete with others!';

        await sock.sendMessage(from, {
          text: `🎮 *WORD RANDOM GAME STARTED!* 🎮

${modeText}
🎯 Category: *${category.name}*
⏱️ Time Limit: 5 minutes

${category.keywords.length > 0 
  ? `💡 Hint: Words related to ${category.keywords.join(', ')}`
  : `💡 Submit any valid word from the word list!`}

📝 Type: ${prefix}wrg <word> to play!`
        }, { quoted: msg });

        await sock.sendMessage(from, {
          react: { text: emojis.success || '✅', key: msg.key }
        });

        setTimeout(() => {
          if (wrgGames.has(from)) {
            const game = wrgGames.get(from);
            wrgGames.delete(from);

            let leaderboard = '';
            const sortedPlayers = Array.from(game.players.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);

            sortedPlayers.forEach(([player, score], index) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              leaderboard += `${medals[index]} @${player.split('@')[0]}: ${score} words\n`;
            });

            sock.sendMessage(from, {
              text: `⏰ *TIME'S UP!* ⏰

🏁 Game automatically ended after 5 minutes!

📝 Total Words: ${game.usedWords.length}

🏆 *TOP PLAYERS:*
${leaderboard || 'No players participated'}

Thanks for playing! 🎮`
            });
          }
        }, 5 * 60 * 1000);

        return;
      }

      if (command === 'end') {
        if (!wrgGames.has(from)) {
          return await sock.sendMessage(from, {
            text: `❌ No active game to end!`
          }, { quoted: msg });
        }

        const game = wrgGames.get(from);
        const duration = Math.floor((Date.now() - game.startTime) / 1000);
        
        let leaderboard = '';
        const sortedPlayers = Array.from(game.players.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        sortedPlayers.forEach(([player, score], index) => {
          const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
          leaderboard += `${medals[index]} @${player.split('@')[0]}: ${score} words\n`;
        });

        wrgGames.delete(from);

        await sock.sendMessage(from, {
          text: `🏁 *GAME ENDED!* 🏁

⏱️ Duration: ${duration}s
📝 Total Words: ${game.usedWords.length}
🎯 Category: ${game.category}

🏆 *TOP PLAYERS:*
${leaderboard || 'No players participated'}

Thanks for playing! 🎮`
        }, { quoted: msg });

        await sock.sendMessage(from, {
          react: { text: emojis.success || '🏁', key: msg.key }
        });

        return;
      }

      if (!wrgGames.has(from)) {
        return await sock.sendMessage(from, {
          text: `❌ No active game! Start one with: ${prefix}wrg start`
        }, { quoted: msg });
      }

      const game = wrgGames.get(from);
      const word = args.join(' ').toLowerCase().trim();
      const playerJid = msg.key.participant || msg.key.remoteJid;

      // Solo mode: Only the game starter can play
      if (game.mode === 'solo') {
        const gameStarter = Array.from(game.players.keys())[0];
        if (playerJid !== gameStarter) {
          return await sock.sendMessage(from, {
            text: `❌ This is a solo game! Only @${gameStarter.split('@')[0]} can play.\n💡 Start your own game: ${prefix}wrg start solo`,
            mentions: [gameStarter]
          }, { quoted: msg });
        }
      }

      if (!word || word.length < 2) {
        return await sock.sendMessage(from, {
          text: `❌ Please provide a valid word (minimum 2 letters)!`
        }, { quoted: msg });
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

      if (game.category !== 'Any Word' && game.validWords.length > 0) {
        if (!game.validWords.some(w => w.toLowerCase() === word)) {
          return await sock.sendMessage(from, {
            text: `❌ *${word.toUpperCase()}* doesn't match the category: *${game.category}*!`
          }, { quoted: msg });
        }
      }

      game.usedWords.push(word);
      const currentScore = game.players.get(playerJid) || 0;
      game.players.set(playerJid, currentScore + 1);

      const timeRemaining = Math.floor((game.timeLimit - (Date.now() - game.startTime)) / 1000);
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;

      await sock.sendMessage(from, {
        text: `✅ *${word.toUpperCase()}* accepted!

🎯 Category: ${game.category}
📝 Total words: ${game.usedWords.length}
🏆 Your score: ${currentScore + 1}
⏰ Time remaining: ${minutes}m ${seconds}s`
      }, { quoted: msg });

      await sock.sendMessage(from, {
        react: { text: emojis.success || '✅', key: msg.key }
      });

    } catch (error) {
      console.error('WRG command error:', error);
      await sock.sendMessage(from, {
        text: `${emojis.error || '❌'} *Error in Word Random Game*\n\n🔧 *Error:* ${error.message}`
      }, { quoted: msg });

      await sock.sendMessage(from, {
        react: { text: emojis.error || '❌', key: msg.key }
      });
    }
  }
};
