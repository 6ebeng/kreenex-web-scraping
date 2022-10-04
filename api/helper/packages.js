"use strict";

const async = require("async"),
  puppeteer = require('puppeteer-extra'),
  //cheerio = require('cheerio'),
  scrollToBottom = require('scroll-to-bottomjs'), 
  {check, validationResult} = require('express-validator'),
  fs = require('fs'),
  stealth = require('puppeteer-extra-plugin-stealth'),
  Xvfb = require('xvfb');

  module.exports = {
    async,
    puppeteer,
    scrollToBottom,
    check,
    validationResult,
    fs,
    stealth,
    Xvfb
  }