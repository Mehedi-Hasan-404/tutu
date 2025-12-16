// api/proxy.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Enable CORS for all origins so your web player can access the stream
app.use(cors()); 

// --- Configuration ---
// The specific stream URL you want to play
const TARGET_URL = 'https://lor.us-east-1.amazonaws.com/v1/manifest/85b2e189604a6043ef957e7a3e6ed3bf9b11c843/USCA_DAI_STRM6/117c2abf-8f3d-498e-9531-dbd5aaa0a519/1.m3u8';
// ---------------------

// The Vercel function will be accessed at the final URL: /api/proxy
app.get('/api/proxy', async (req, res) => {
  try {
    console.log("Fetching stream directly via Vercel's US IP...");
    
    // 1. Fetch the target stream directly from the Vercel server
    const response = await axios.get(TARGET_URL, {
      responseType: 'stream', 
      // Mimic a browser request to avoid bot detection
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        // Mask the origin source
        'Referer': 'https://www.google.com/' 
      }
    });

    // 2. Set the necessary CORS headers
    // This allows the stream to be played from any web page (any origin)
    res.set('Access-Control-Allow-Origin', '*'); 
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    
    // 3. Forward the original headers (like Content-Type) from the stream provider
    res.set(response.headers);
    
    // 4. Pipe the stream data back to the user
    response.data.pipe(res);
    console.log("...Stream data piped successfully to client.");

  } catch (error) {
    console.error("Vercel Direct Fetch Error:", error.message);
    
    // If the stream provider blocks data center IPs, the function will fail here.
    if (error.response) {
        res.status(error.response.status).send(`External Server Error: Status ${error.response.status}`);
    } else {
        res.status(500).send(`Error fetching stream: ${error.message}.`);
    }
  }
});

// Vercel requires the Express app to be exported to run as a Serverless Function.
module.exports = app;
