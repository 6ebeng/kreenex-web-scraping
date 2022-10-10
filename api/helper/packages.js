"use strict";

/*
 * Purpose : To load all Node.Js Packages
 * Package : NPM Packages
 * Developed By  : Tishko Rasoul (tishko.rasoulgmail.com)
*/

const vanillaPuppeteer = require('puppeteer');
const  addExtra = require('puppeteer-extra');

const 
puppeteer = addExtra(vanillaPuppeteer),
//cheerio = require('cheerio'),
scrollToBottom = require('scroll-to-bottomjs'), 
{check, validationResult} = require('express-validator'),
fs = require('fs'),
Xvfb = require('xvfb'),
stealth = require('puppeteer-extra-plugin-stealth')(),
useProxy = require('puppeteer-page-proxy');

module.exports = {
    puppeteer,
    scrollToBottom,
    check,
    validationResult,
    fs,
    Xvfb,
    stealth,
    useProxy
}