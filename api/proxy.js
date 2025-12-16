const express = require('express');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const cors = require('cors');

// --- YOUR PROXY CONFIG (use Vercel Environment Variables later!) ---
const PROXY_IP = '142.111.48.253';
const PROXY_PORT = '7030';
const PROXY_USER = 'iuookxfv';
const PROXY_PASS = '34bkqfesh5hp';
const TARGET_URL = 'https://lor.us-east-1.amazonaws.com/v1/manifest/85b2e189604a6043ef957e7a3e6ed3bf9b11c843/USCA_DAI_STRM6/117c2abf-8f3d-498e-9531-dbd5aaa0a519/1.m3u8';
// -------------------------------------------------------------------

const proxyUrl = `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_IP}:${PROXY_PORT}`;
const agent = new HttpsProxyAgent(proxyUrl);

const app = express();
app.use(cors()); // Enable CORS

// The Vercel function will be accessed at the URL /api/proxy
app.get('/api/proxy', async (req, res) => {
  try {
    const response = await axios.get(TARGET_URL, {
      httpsAgent: agent, // This line uses your authenticated proxy
      responseType: 'stream',
      headers: {
        'User-Agent': 'Vercel-Proxy-Worker/1.0',
      }
    });

    // Forward the headers and stream the data back
    res.set(response.headers);
    response.data.pipe(res);

  } catch (error) {
    console.error("Vercel Proxy Error:", error.message);
    // Vercel Serverless functions have a 60-second execution limit!
    res.status(500).send("Error fetching stream. Check logs for proxy failure or Vercel timeout.");
  }
});

module.exports = app;
