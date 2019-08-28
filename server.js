'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment')
const validator = require('validator');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

process.env.MONGOLAB_URI = 'mongodb+srv://h15200:Fcc-atlas2@cluster0-iur4j.mongodb.net/test?retryWrites=true&w=majority'



/** this project needs a db !! **/ 
 mongoose.connect(process.env.MONGOLAB_URI, {
   useNewUrlParser: true}).then(()=>{
   console.log('db connected')
 }).catch(error=>{
   console.log('Cant Connect to DB', error)
 })

//intitialize auto increment library
autoIncrement.initialize(mongoose.connection);

app.use(cors());


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(express.urlencoded({ extended: true }))

app.use('/public', express.static(process.cwd() + '/public'));


app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});



const websiteSchema = new mongoose.Schema({
url: {
    type: String,
    required: true
  }
})

websiteSchema.plugin(autoIncrement.plugin, 'Website')
const Website = mongoose.connection.model('Website', websiteSchema)


// const sample = new Website({
//   url: 'nba.com'
// })

// sample.save().then(result => {
//   console.log(result)
// }).catch(error => {
//   console.log(error)
// })




// Website.findOne({
//   _id: 5
// }).then(data => {
//     if (!data){
//       console.log('data is falsey')
//     }
// }).catch(error=>
//         console.log(error))
  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  const url = req.body.url

  if (!validator.isURL(url)){
    return res.json({error: 'invalid'})
  }
  // if db is valid
  console.log('Step 1 - url is VALID')
  Website.findOne({
    url
  }).then(data => {
    console.log('Step 2 - findOne was successful')
    if (data === null){ // if entry doens't exist, save and return short
      console.log('Step 3 - findOne yielded Null, meaning new entry')
      const item = new Website ({url})
      item.save().then(data => {
        console.log('Step 4 - successful save to database')
        return res.json({original_url: url,
           short_url: data._id})
      })
    }
    else if (data){
    console.log('Step 3 - entry exists')
    return res.json({original_url: url,
           short_url: data._id})
    }
  }).catch(error => {
    console.log('Error somewhere in chain', error)
  })
});

// make another route dynamically based on db
app.get("/api/shorturl/:_id", (req, res) => {
  const _id = req.params._id
  Website.findOne({_id}).then(data => {
    console.log(data.url)
     return res.redirect(data.url)
  }).catch(error => {
    console.log('problem finding id entry', error)
    
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});