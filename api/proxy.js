const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Keep CORS for cross-origin playback

const app = express();
app.use(cors());

// --- Configuration (No Proxy Details Needed) ---
const TARGET_URL = 'https://lor.us-east-1.amazonaws.com/v1/manifest/85b2e189604a6043ef957e7a3e6ed3bf9b11c843/USCA_DAI_STRM6/117c2abf-8f3d-498e-9531-dbd5aaa0a519/1.m3u8';
// ------------------------------------------------

// The Vercel function will be accessed at the URL /api/proxy
app.get('/api/proxy', async (req, res) => {
  try {
    console.log("Fetching stream directly via Vercel's US IP...");
    
    // We only need axios, NOT the proxy agent, as Vercel is acting as the proxy.
    const response = await axios.get(TARGET_URL, {
      responseType: 'stream', 
      headers: {
        // Essential headers to avoid bot detection
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.google.com/' // Masking the source
      }
    });

    // Forward the original headers (Content-Type, etc.)
    res.set(response.headers);
    // Pipe the stream data back to the user
    response.data.pipe(res);

  } catch (error) {
    console.error("Vercel Direct Fetch Error:", error.message);
    res.status(500).send(`Error fetching stream: ${error.message}. Check if the stream is blocking cloud IPs.`);
  }
});

// Vercel expects the Express app to be exported.
module.exports = app;
