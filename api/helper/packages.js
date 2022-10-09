"use strict";

/*
 * Purpose : To load all Node.Js Packages
 * Package : NPM Packages
 * Developed By  : Tishko Rasoul (tishko.rasoulgmail.com)
*/

const puppeteer = require('puppeteer-extra'),
//cheerio = require('cheerio'),
scrollToBottom = require('scroll-to-bottomjs'), 
{check, validationResult} = require('express-validator'),
fs = require('fs'),
Xvfb = require('xvfb'),
stealth = require('puppeteer-extra-plugin-stealth')(),
useProxy = require('puppeteer-page-proxy');


module.exports = {
    async,
    puppeteer,
    scrollToBottom,
    check,
    validationResult,
    fs,
    Xvfb,
    stealth,
    useProxy
}