

import { horla } from '../lib/horla.js';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

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

  let browser = null;
  try {
    await sock.sendMessage(from, {
      text: "*Generating logo...*"
    }, { quoted: msg });

    const text = Array.isArray(args) ? args.join(' ') : args.toString();
    const textParts = text.split('|');
    const text1 = encodeURIComponent(textParts[0]?.trim() || 'Porn');
    const text2 = encodeURIComponent(textParts[1]?.trim() || 'Hub');
    
    // Launch puppeteer browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Navigate to textpro.me pornhub generator
    const url = `https://textpro.me/pornhub-style-logo-online-generator-free-977.html`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Fill in the form
    await page.type('#text-0', textParts[0]?.trim() || 'Porn');
    await page.type('#text-1', textParts[1]?.trim() || 'Hub');
    
    // Click generate button
    await page.click('#submit');
    
    // Wait for result image
    await page.waitForSelector('#result-container img', { timeout: 30000 });
    
    // Get image source
    const imgSrc = await page.evaluate(() => {
      const img = document.querySelector('#result-container img');
      return img ? img.src : null;
    });
    
    if (!imgSrc) {
      throw new Error('Could not generate logo image');
    }
    
    // Download the image
    const viewSource = await page.goto(imgSrc);
    const imageBuffer = await viewSource.buffer();
    
    await sock.sendMessage(from, {
      image: imageBuffer,
      caption: "*Logo by ECLIPSE MD*"
    }, { quoted: msg });

  } catch (e) {
    console.error('[PHUB] Error:', e);
    
    // Fallback to API approach
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = `https://textpro.me/api/pornhub?text1=${text1}&text2=${text2}`;
      const response = await fetch(apiUrl, { timeout: 15000 });
      
      if (response.ok) {
        const imageBuffer = await response.buffer();
        await sock.sendMessage(from, {
          image: imageBuffer,
          caption: "*Logo by ECLIPSE MD*"
        }, { quoted: msg });
        return;
      }
    } catch (fallbackError) {
      console.log('[PHUB] Fallback also failed:', fallbackError.message);
    }
    
    await sock.sendMessage(from, {
      text: `❌ *Error generating logo*\n\n${e.message}\n\n💡 The logo service is currently unavailable. Please try again later.`
    }, { quoted: msg });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export default phub;
