'use strict';

/*
 * Purpose : To load all Node.Js Packages
 * Package : NPM Packages
 * Developed By  : Tishko Rasoul (tishko.rasoulgmail.com)
 */

const puppeteer = require('puppeteer-extra'),
	stealth = require('puppeteer-extra-plugin-stealth'),
	scrollToBottom = require('scroll-to-bottomjs'),
	{ check, validationResult } = require('express-validator'),
	fs = require('fs'),
	Xvfb = require('xvfb'),
	useProxy = require('puppeteer-page-proxy'),
	path = require('path');

module.exports = {
	puppeteer,
	scrollToBottom,
	check,
	validationResult,
	fs,
	path,
	Xvfb,
	stealth,
	useProxy,
};
