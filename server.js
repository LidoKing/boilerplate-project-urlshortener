require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

// Basic Configuration
const port = process.env.PORT || 3000;

// Connect database and set up
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
autoIncrement.initialize(mongoose.connection);

const urlSchema = new mongoose.Schema({
  shorten_id: {type:Number, required: true},
  original_url: {type:String, required:true}
});

urlSchema.plugin(autoIncrement.plugin, { model: "url", field: "shorten_id", startAt: 1, incrementBy: 1 });

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
  let input_url = new URL(req.body.url); // Returns object with properties - hostname, path, etc ...

  // Check if url is valid
  dns.lookup(input_url.hostname, (err) => {
    if (err) {
      console.log(err);
      res.json({ error: 'invalid url' });
    }
    else{
      console.log('Valid url');

      res.json({ original_url: input_url, short_url: num });
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  let result = url.findOne({ shorten_id: req.params.id }, (err, data) => {
    if (err) return console.log(err);

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
