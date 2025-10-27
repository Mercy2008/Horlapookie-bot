import fs from 'fs';
import path from 'path';

const emojisPath = path.join(process.cwd(), 'data', 'emojis.json');
const emojis = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));

const wordsPath = path.join(process.cwd(), 'words.txt');
const wordsList = fs.readFileSync(wordsPath, 'utf8').split('\n').filter(w => w.trim());

const wcgGames = new Map();
const TURN_TIME = 90000; // 1 minute 30 seconds

export default {
  name: "wcg",
  description: "Word Chain Game: Turn-based multiplayer with elimination",
  aliases: ["wordchain", "chainword"],
  category: "Word Chain",
  async execute(msg, { sock, args, settings }) {
    const from = msg.key.remoteJid;
    const prefix = settings?.prefix || '.';
    const playerJid = msg.key.participant || msg.key.remoteJid;

    try {
      if (!args.length) {
        const helpText = `🎮 *WORD CHAIN GAME (WCG)* 🎮

📝 *How to Play:*
Turn-based multiplayer! Continue the chain with a word starting with the last letter. Players eliminated if they don't respond within 1:30!

⚡ *Commands:*
┃ ${prefix}wcg start - Start a new game
┃ ${prefix}wcg join - Join the game
┃ ${prefix}wcg end - End the current game
┃ ${prefix}wcg <word> - Play your word (only on your turn!)

📖 *Example:*
Player 1's turn: ${prefix}wcg computer
Player 2's turn: ${prefix}wcg router

💡 *Rules:*
• Wait for your turn to play
• You have 1:30 per turn
• Word must start with last letter
• Miss your turn = ELIMINATED ☠️
• Last player standing WINS! 🏆

🎯 *Status:* ${wcgGames.has(from) ? '🟢 Game Active' : '🔴 No Active Game'}`;

        return await sock.sendMessage(from, { text: helpText }, { quoted: msg });
      }

      const command = args[0].toLowerCase();

      if (command === 'start') {
        if (wcgGames.has(from)) {
          return await sock.sendMessage(from, {
            text: `❌ Game already in progress! Join with ${prefix}wcg join`
          }, { quoted: msg });
        }

        const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        wcgGames.set(from, {
          currentWord: randomWord.toLowerCase(),
          usedWords: [randomWord.toLowerCase()],
          players: [playerJid],
          eliminatedPlayers: [],
          currentTurnIndex: 0,
          scores: new Map([[playerJid, 0]]),
          startTime: Date.now(),
          joinPhase: true,
          turnTimer: null
        });

        await sock.sendMessage(from, {
          text: `🎮 *WORD CHAIN GAME STARTED!* 🎮

🎯 Starting Word: *${randomWord.toUpperCase()}*
👤 Started by: @${playerJid.split('@')[0]}

⏰ *JOIN PHASE - 30 seconds!*
Type ${prefix}wcg join to participate!

Game will start automatically after 30s...`,
          mentions: [playerJid]
        }, { quoted: msg });

        await sock.sendMessage(from, {
          react: { text: emojis.success || '✅', key: msg.key }
        });

        // Auto-start after 30 seconds
        setTimeout(() => {
          if (wcgGames.has(from)) {
            const game = wcgGames.get(from);
            if (game.joinPhase) {
              game.joinPhase = false;
              
              if (game.players.length < 2) {
                wcgGames.delete(from);
                sock.sendMessage(from, {
                  text: `❌ Not enough players! Game cancelled. Need at least 2 players.`
                });
                return;
              }

              startTurn(sock, from, game);
            }
          }
        }, 30000);

        return;
      }

      if (command === 'join') {
        if (!wcgGames.has(from)) {
          return await sock.sendMessage(from, {
            text: `❌ No active game! Start one with: ${prefix}wcg start`
          }, { quoted: msg });
        }

        const game = wcgGames.get(from);

        if (!game.joinPhase) {
          return await sock.sendMessage(from, {
            text: `❌ Game already in progress! Wait for next round.`
          }, { quoted: msg });
        }

        if (game.players.includes(playerJid)) {
          return await sock.sendMessage(from, {
            text: `❌ You already joined!`
          }, { quoted: msg });
        }

        game.players.push(playerJid);
        game.scores.set(playerJid, 0);

        await sock.sendMessage(from, {
          text: `✅ @${playerJid.split('@')[0]} joined the game!

👥 Players: ${game.players.length}
⏰ Join phase ends soon...`,
          mentions: [playerJid]
        }, { quoted: msg });

        return;
      }

      if (command === 'end') {
        if (!wcgGames.has(from)) {
          return await sock.sendMessage(from, {
            text: `❌ No active game to end!`
          }, { quoted: msg });
        }

        endGame(sock, from, wcgGames.get(from), 'Game ended by player');
        return;
      }

      // Playing a word
      if (!wcgGames.has(from)) {
        return await sock.sendMessage(from, {
          text: `❌ No active game! Start one with: ${prefix}wcg start`
        }, { quoted: msg });
      }

      const game = wcgGames.get(from);

      if (game.joinPhase) {
        return await sock.sendMessage(from, {
          text: `⏰ Still in join phase! Wait for the game to start.`
        }, { quoted: msg });
      }

      const currentPlayer = game.players[game.currentTurnIndex];

      if (playerJid !== currentPlayer) {
        return await sock.sendMessage(from, {
          text: `❌ Not your turn! Wait for @${currentPlayer.split('@')[0]}`,
          mentions: [currentPlayer]
        }, { quoted: msg });
      }

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

      // Valid word! Update game state
      if (game.turnTimer) {
        clearTimeout(game.turnTimer);
      }

      game.usedWords.push(word);
      game.currentWord = word;
      game.scores.set(playerJid, (game.scores.get(playerJid) || 0) + 1);

      await sock.sendMessage(from, {
        text: `✅ *${word.toUpperCase()}* accepted by @${playerJid.split('@')[0]}!`,
        mentions: [playerJid]
      }, { quoted: msg });

      await sock.sendMessage(from, {
        react: { text: emojis.success || '✅', key: msg.key }
      });

      // Move to next player
      game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
      
      startTurn(sock, from, game);

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

function startTurn(sock, from, game) {
  const currentPlayer = game.players[game.currentTurnIndex];
  const nextPlayerIndex = (game.currentTurnIndex + 1) % game.players.length;
  const nextPlayer = game.players[nextPlayerIndex];
  const nextLetter = game.currentWord.slice(-1).toUpperCase();

  sock.sendMessage(from, {
    text: `⏰ *YOUR TURN @${currentPlayer.split('@')[0]}!*

📝 Current Word: *${game.currentWord.toUpperCase()}*
🎯 Next word starts with: *${nextLetter}*
⏱️ Time: 1 minute 30 seconds

👤 Next up: @${nextPlayer.split('@')[0]} - Get ready!

🏆 Scores:
${Array.from(game.scores.entries())
  .filter(([jid]) => !game.eliminatedPlayers.includes(jid))
  .map(([jid, score]) => `${jid === currentPlayer ? '▶️' : '  '} @${jid.split('@')[0]}: ${score}`)
  .join('\n')}

💀 Eliminated: ${game.eliminatedPlayers.length}`,
    mentions: [currentPlayer, nextPlayer, ...Array.from(game.scores.keys())]
  });

  // Set turn timer
  game.turnTimer = setTimeout(() => {
    eliminatePlayer(sock, from, game, currentPlayer);
  }, TURN_TIME);
}

function eliminatePlayer(sock, from, game, playerJid) {
  game.eliminatedPlayers.push(playerJid);
  game.players = game.players.filter(p => p !== playerJid);

  sock.sendMessage(from, {
    text: `💀 *@${playerJid.split('@')[0]} ELIMINATED!*

⏰ Failed to respond in time!

👥 Players remaining: ${game.players.length}`,
    mentions: [playerJid]
  });

  if (game.players.length === 1) {
    // Winner!
    const winner = game.players[0];
    endGame(sock, from, game, `🏆 @${winner.split('@')[0]} WINS!`, [winner]);
    return;
  }

  if (game.players.length === 0) {
    endGame(sock, from, game, 'All players eliminated!');
    return;
  }

  // Adjust turn index if needed
  if (game.currentTurnIndex >= game.players.length) {
    game.currentTurnIndex = 0;
  }

  startTurn(sock, from, game);
}

function endGame(sock, from, game, message, mentions = []) {
  if (game.turnTimer) {
    clearTimeout(game.turnTimer);
  }

  const duration = Math.floor((Date.now() - game.startTime) / 1000);
  
  let leaderboard = '';
  const sortedPlayers = Array.from(game.scores.entries())
    .sort((a, b) => b[1] - a[1]);

  sortedPlayers.forEach(([player, score], index) => {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[index] || `${index + 1}️⃣`;
    const status = game.eliminatedPlayers.includes(player) ? '💀' : '✅';
    leaderboard += `${medal} ${status} @${player.split('@')[0]}: ${score} words\n`;
  });

  wcgGames.delete(from);

  sock.sendMessage(from, {
    text: `🏁 *${message}* 🏁

⏱️ Duration: ${duration}s
📝 Total Words: ${game.usedWords.length}
👥 Players: ${game.scores.size}
💀 Eliminated: ${game.eliminatedPlayers.length}

🏆 *FINAL LEADERBOARD:*
${leaderboard}

Thanks for playing! 🎮`,
    mentions: [...Array.from(game.scores.keys()), ...mentions]
  });
}
