require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  let input_url = new URL(req.body.url); // Returns object with properties - hostname, path, etc ...
  dns.lookup(input_url.hostname, (err) => {
    if (err) {
      console.log(err);
      res.json({ error: 'invalid url' });
    }
    else{
      console.log('Valid url');

      let num = Math.floor(Math.random() * 1000); // Get random number from 0 - 999
      res.json({ original_url: input_url, short_url: num });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
