require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const autoIncrementFactory = require('mongoose-sequence');

// Basic Configuration
const port = process.env.PORT || 3000;

// Connect database and set up
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const autoIncrement = autoIncrementFactory(mongoose.connection);

const urlSchema = new mongoose.Schema({
  shortenId: Number,
  original_url: String
});

urlSchema.plugin(autoIncrement, { inc_field: "shortenId" });

const url = mongoose.model("url", urlSchema);

// Express middlewares
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

// Let num = 0, for every NEW url, add 1 and save the url and num as key-value pair in database (use existing num if url is registered before)
// app.get param (num), check database for the num and corresponding url, redirect if exists, log error if not

app.post('/api/shorturl', (req, res) => {
  let original = req.body.url;
  let extractProtocol = original.split(":");
  let url_object;

  if (extractProtocol[0] == "https" || extractProtocol[0] == "http") {
    try {
      // Returns object with properties - hostname, path, etc ...
      url_object = new URL(original);

      // Check if url is valid
      dns.lookup(url_object.hostname, (err) => {
        if (err) {
          console.log(err);
          res.json({ error: 'invalid url' });
        }
        else{
          console.log('Valid url');

          // Check if url is registered already
          url.findOne({ original_url: original }, (err, data) => {
            if (err) return console.log(err);

            // Check if document exists
            if (!data) {
              // Add url to database
              url.create({ original_url: original }, (err, data) => {
                if (err) return console.log(err);
                console.log(data);
                res.json({ original_url: original, short_url: data.shortenId });
              });
            }
            else {
              res.json({ original_url: original, short_url: data.shortenId });
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
      res.json({ error: 'invalid url' });
    }
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get('/api/shorturl/:id', (req, res) => {
  url.findOne({ shortenId: req.params.id }, (err, data) => {
    if (err) return console.log(err);
    console.log(data);

    // Check if document exists
    if (data) {
      res.redirect(data.original_url);
    }
    else {
      res.json({ error: "No short URL found for the given input" });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
