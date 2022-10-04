"use strict";

/* Purpose: Running node.js and initialize. 
 * Author : Tishko Rasoul (tishko.rasoul@gmail.com)
*/

const app   = require('express')(),
      cors    = require('cors'),
	    http   = require('http'),
      compression = require('compression'),
	    bodyParser = require('body-parser');

/* Require Enviornment File  */
require('dotenv').config();

/* Require Preety Error / show errors beautifully  */
require('pretty-error').start();

/* Create Server */
var server = http.createServer(app);

/* To set port */
app.set('port', process.env.PORT || 3000);

/* Compress all HTTP responses */
app.use(compression());

/* To Listen Port */
server.listen(app.get('port'), function () {
  console.log(`Express server listening on port ${app.get('port')}`);
});

/* Cross Origin */
app.use(cors())

/* BodyParser Middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

/* Handle Invalid JSON */
app.use(function(err, req, res, next){
    if(err.status === 400){
      var ErrorObj = {ResponseCode: 400, Message:'Invalid JSON request.'}
      return res.status(400).json(ErrorObj);
    }
    return next(err); // if it's not a 400, let the default error handling do it. 
})


app.use(function (req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

/* API Routings */
app.use('/api', require('./api/routes/storeRoute'));

/* Redirect On Website */
app.get('/', function(req, res) {
  return res.send('Welcome To Web scraping APP');
})

/* Handle Invalid URL */
app.all('*', (req, res, next) => {
  res.status(404).json({ResponseCode: 404, Message: `Can't find ${req.originalUrl} on this server!`});
}); 

module.exports = { app };

/* End of file index.js */
/* Location: ./index.js */
