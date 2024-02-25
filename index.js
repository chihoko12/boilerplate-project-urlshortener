require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const res = require('express/lib/response');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {}; // Store original URLs and their corresponding short URLs

// API endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  try {
    const { hostname } = new URL(url);
    dns.lookup(hostname, async (err) => {
      if (err) {
        res.json({ error: 'invalid URL' });
      } else { 
        const shortUrl = generateShortUrl();
        urlDatabase[shortUrl] = url;
        res.json({ original_url: url, short_url: shortUrl }); 
      }
    });
  } catch (error) {
    res.json({ error: 'invalid URL'});
  }
});

// Redirect users to the original URL when they accessthe short URL
app.get('/api/shorturl/:shortUrl', (req,res) => {
  const { shortUrl } = req.params;
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'Short URL not found' });
  }
});

function generateShortUrl() {
  return Math.random().toString(36).substring(2,8); // Generate a random alphanumeric string
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
