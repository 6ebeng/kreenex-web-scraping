"use strict";

/*
 * Purpose : For All Website API's Routing 
 * Package : Router
 * Developed By  : Tishko Rasoul (tishko.rasoul@gmail.com)
*/

const express   = require('express'),
      router    = express.Router(),
      storeController = require('../controllers/storesController');

      /*Website Routings */
      router.post('/search',storeController.validate('search'),storeController.search); 

module.exports = router;      