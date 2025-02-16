import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/updates', async (req, res) => {
  try {
    // Fetch the webpage with exact headers from browser
    const response = await axios.get('https://app.watchduty.org/i/40335', {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'cookie': '_ga_G9B2Q5W828=GS1.1.1739673212.3.1.1739674146.0.0.0',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
      }
    });

    // Parse with cheerio
    const $ = cheerio.load(response.data);
    const updates = [];

    // Extract data from each MUI card
    $('.MuiCardContent-root').each((_, element) => {
      const title = $(element).find('h6').text().trim();
      const content = $(element).find('p').text().trim();
      
      if (title || content) {
        updates.push({ title, content });
      }
    });

    res.json({ success: true, data: updates });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data
    });
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: 'Failed to fetch updates',
      details: error.response?.data || error.message
    });
  }
});

export default router; 