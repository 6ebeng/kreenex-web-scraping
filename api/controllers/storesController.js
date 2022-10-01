"use strict";

/*
 * Purpose : Website Search API
 * Package : Controller
 * Developed By  : Tishko Rasoul (tishko.rasoul@gmail.com)
 */

const async = require("async"),
  puppeteer = require('puppeteer-extra'),
  cheerio = require('cheerio'),
  scrollToBottom = require('scroll-to-bottomjs'), 
  {check, validationResult} = require('express-validator'),
  fs = require('fs')

var browser;
let storesController = {
  validate,
  search
}

/**
    For delay time
**/
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

/** 
   For Validation that url contains search keyword
**/
function validate(method) {
  switch (method) {
    case 'search': {
      return [
        check('Url')
        .notEmpty().withMessage('Url field is required').trim()
      ]
    }
    break;
  }
}

async function mainSelector(page, selector, attribute) {
  if (selector.startsWith('//')) {
    if (attribute) {
      return  await page.evaluate(async ({selector,attribute})=>{
        return Array.from((function () {var arr = []; var results = document.evaluate(selector, document,null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null); while (node = results.iterateNext()){ arr.push(node)} return arr;})()).map(el=> (el.getAttribute(attribute).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
      },{selector,attribute})
    } else {
      return  await page.evaluate(async (selector)=>{
        return Array.from((function () {var arr = []; var results = document.evaluate(selector, document,null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null); while (node = results.iterateNext()){ arr.push(node)} return arr;})()).map(el=> (el.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
       },selector)
    }
  } else {
    if (attribute) {
      return await page.evaluate(({selector,attribute}) => {
        return Array.from(document.querySelectorAll(selector)).map(el => (el.getAttribute(attribute).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
      },{selector,attribute})
    } else {
      return await page.evaluate((selector) => {
        return Array.from(document.querySelectorAll(selector)).map(el => (el.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
      },selector)
    }
  }
}

async function elementSelector(page, selector, attribute, regex, groups, queryAll) {
    if (!queryAll) {
      if (regex) {
        
        if (groups.length > 0) {
          // if we have groups
          var arr = []
          const tmpSelector = await mainSelector(page, selector, attribute)      
          for (let index = 0; index < groups.length; index++) {
            
            arr.push(tmpSelector[0].match(regex)[groups[index]])
          }
          return arr.join("")

        } else {
          //if we have only regex
          const tmpSelector = await mainSelector(page, selector, attribute)
          var regx = tmpSelector[0].match(regex)
          return regx.join("");
        }
      } else {
        const tmpSelector = await mainSelector(page, selector, attribute)
        return tmpSelector[0] //return the first array
      }
    } else {
      return await mainSelector(page, selector, attribute)
    }
}


async function elementClick(page, selector){
  if (selector.startsWith('//')) {
    await page.waitForXPath(selector)
    const elements = await page.$x(selector)
    await elements[0].click() 
  } else {
    await page.waitForSelector(selector);
    await page.evaluate((selector) =>{
      document.querySelector(selector).click();
    },selector)
    //await page.click(selector)
  }
}


async function search(req, res) {

  /* To Check Validation json */
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(500).json({
      ResponseCode: 500,
      Data: [],
      Message: errors.array()[0].msg
    });
  }

/*
******
// Configure the proxy router plugin for more info go to https://github.com/berstend/puppeteer-extra/tree/master/packages/plugin-proxy-router
*******
const ProxyRouter = require('@extra/proxy-router')
const proxyRouter = ProxyRouter({
  // define the available proxies (replace this with your proxies)
  proxies: {
    // the default browser proxy, can be `null` as well for direct connections
    DEFAULT: 'http://user:pass@proxyhost:port',
    // optionally define more proxies you can use in `routeByHost`
    // you can use whatever names you'd like for them
    DATACENTER: 'http://user:pass@proxyhost2:port',
    RESIDENTIAL_US: 'http://user:pass@proxyhost3:port',
  },
  // optional function for flexible proxy routing
  // if this is not specified the `DEFAULT` proxy will be used for all connections
  routeByHost: async ({ host }) => {
    if (['pagead2.googlesyndication.com', 'fonts.gstatic.com'].includes(host)) {
      return 'ABORT' // block connection to certain hosts
    }
    if (host.includes('google')) {
      return 'DIRECT' // use a direct connection for all google domains
    }
    if (host.endsWith('.tile.openstreetmap.org')) {
      return 'DATACENTER' // route heavy images through datacenter proxy
    }
    if (host === 'canhazip.com') {
      return 'RESIDENTIAL_US' // special proxy for this domain
    }
    // everything else will use `DEFAULT` proxy
  },
})

// Add the plugin
puppeteer.use(proxyRouter)
*/

let url = req.body.Url
var match = url.match("^((http[s]?|ftp):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{1,3}(\.[^:\/\s\.]{1,2})?(:\d+)?)($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$")
let store = match[4].replace(/\..+/g,'')
const data = require('../models/data/' + store)

  /* Initialize Browser */
  try {



    /* Launch Browser */
    puppeteer.use(require('puppeteer-extra-plugin-stealth')());

    /*
      Uses for Windows
    */
    // browser = await puppeteer.launch({
    //   headless: data.isHeadless,
    //   executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
	  //   userDataDir: 'C:/Users/Tishko/AppData/Local/Google/Chrome/User Data/Profile 3',
    //   args: ["--no-sandbox", '--window-size=1200,800'],
    //   defaultViewport: null
    // });



    /*
      Uses for Linux
    */
      // Uses for Virtual Display
      // sudo apt-get install -y xvfb
      // sudo apt-get -y install xorg xvfb gtk2-engines-pixbuf
      // sudo apt-get -y install dbus-x11 xfonts-base xfonts-100dpi xfonts-75dpi xfonts-cyrillic xfonts-scalable
      // kill -- "-$xvfb_pid"
      // Xvfb -ac :10 -screen 0 1200x800x24 &
      // export DISPLAY=:10
    if (!data.isHeadless) {
      var Xvfb = require('xvfb');
      var xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '1366x768x24', "-ac"]
    });
      await xvfb.startSync();
      console.log('xvfb started');
    }

    console.log(xvfb._display)

    browser = await puppeteer.launch({
      headless: data.isHeadless,
      executablePath: '/usr/bin/google-chrome',
      args: ["--no-sandbox",
             "--disable-setuid-sandbox",
             "--window-size=1366,768",
             //"--blink-settings=imagesEnabled=true",
             "--disable-translate",
             "--window-position=0,0",
             "--autoplay-policy=no-user-gesture-required",
             "--user-agent=5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
             "--lang=en,en-US", 
             "--display=" + xvfb._display
            ],
      //env: { DISPLAY: ":10"},
      slowMo: 0,
      ignoreHTTPSErrors: true,
      defaultViewport: null,
    });
    
    
    //first tab
    var page = (await browser.pages())[0];

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'bn'
    });

    await page.setRequestInterception(true);

    //Block unnecessary resource types and urls
    page.on('request', request => {
      var resourceType
      var url = true
      for (let index = 0; index < data.blockResourceTypes.length; index++) {
        if (request.resourceType() === data.blockResourceTypes[index]) resourceType = true
      }
      if (!resourceType) {
        for (let index = 0; index < data.whiteListUrls.length; index++) {
          if (request.url().includes(data.whiteListUrls[index])) url = null
        }
      }
      if (!url) {
        for (let index = 0; index < data.blockUrls.length; index++) {
          if (request.url().includes(data.blockUrls[index])) url = true
        }
      }
      if (resourceType || url) {
        if(url){
          //console.log(request.resourceType()); 
          if (data.debug) console.log('\x1b[31m%s\x1b[0m',request.url()); 
        }

        request.abort(); 
      } else{
        //console.log(request.resourceType()); 
        if (data.debug) console.log('\x1b[32m%s\x1b[0m','"' + request.url() + '",'); 
        request.continue();
      }   
      
    });



    // Bypass detections
    
    // if(!data.isHeadless){
    // await page.setViewport({ width: 1366, height: 768});
    //     }




    await page.evaluateOnNewDocument(() => {
       
      Object.defineProperty(navigator, "languages", {get: () => ['en-US', 'en', 'ku'] });
      Object.defineProperty(navigator, 'deviceMemory', {get: () => 8  });
      Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 8});
      Object.defineProperty(navigator, 'platform', {get: () => 'Win32'  });
      Object.defineProperty(screen, 'color', {get: () => '24'  });
      (function () {        var overwrite = function (name) {
          const OLD = HTMLCanvasElement.prototype[name];
          Object.defineProperty(HTMLCanvasElement.prototype, name, {
            "value": function () {
              var shift = {
                'r': Math.floor(Math.random() * 10) - 5,
                'g': Math.floor(Math.random() * 10) - 5,
                'b': Math.floor(Math.random() * 10) - 5,
                'a': Math.floor(Math.random() * 10) - 5
              };
              var width = this.width, height = this.height, context = this.getContext("2d");
              var imageData = context.getImageData(0, 0, width, height);
              for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                  var n = ((i * (width * 4)) + (j * 4));
                  imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
                  imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
                  imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
                  imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
                }
              }
              context.putImageData(imageData, 0, 0);
              return OLD.apply(this, arguments);
            }
          });
        };
        overwrite('toBlob');
        overwrite('toDataURL');
      })();
    });



    await page.goto(req.body.Url, {
      waitUntil: data.waitUntil,
      timeout: 0
    });
    await page.evaluate(scrollToBottom, {frequency: 100,timing: 3});


    // debug
    if (data.debug) {
      fs.writeFileSync('debug/docs/' + store + '.html', await page.evaluate(() => {
        return document.querySelectorAll("html")[0].outerHTML
      }), {
        encoding: 'utf8',
        flag: 'w'
      })

      console.log(await page.evaluate(() => {
        var arr = []
        arr.push(navigator.webdriver)
        arr.push(navigator.language)
        arr.push(navigator.deviceMemory)
        arr.push(navigator.hardwareConcurrency)
        arr.push(navigator.platform)
        arr.push(window.screen.width)
        arr.push(window.screen.height)
        return arr
      }))

      await page.screenshot({
        path: 'debug/screenshoots/' + store + '.png',
        fullPage: true
      });

    }

    await page.waitForSelector(data.container, {
      timeout: 30000
    });

    // /* Load Page Content */
    // var $ = cheerio.load(await page.content());

    /* Check Product Sizes */
    let Size = req.body.Size;

    if (Size) { // Size is optional

      // Not Instock sizes
      let requiredSize = Size.toString();
      var NotInStockSizes = await elementSelector(page, data.notInStockSizes.selector, data.notInStockSizes.attribute || null, data.notInStockSizes.regex || null, data.notInStockSizes.groups || [], true)
      var isOutStock
      //console.log(NotInStockSizes)
      NotInStockSizes.forEach(item => { if (item.trim() === requiredSize.trim()) isOutStock = true })
      if (isOutStock) {
        return res.status(500).json({
          ResponseCode: 500,
          Data: {},
          Message: `Size ${Size} is Out Of Stock!`
        });
      }

      // InStock Sizes
      var InStockSizes = await elementSelector(page, data.inStockSizes.selector, data.inStockSizes.attribute || null, data.inStockSizes.regex || null, data.inStockSizes.groups || [], true)
      var isInstock
      InStockSizes.forEach(item => { if (item.trim() === requiredSize.trim()) isInstock = true })
      if (!isInstock) {
        return res.status(500).json({
          ResponseCode: 500,
          Data: {},
          Message: `Size ${Size} is not available!`
        });
      }

      // Click Size to appear the true price
      if (isInstock) {
        if(data.clickSize){
        await elementClick(page,
                           data.clickSize.replace("{{size}}", Size.trim())
                           );
        await delay(2000);
        }
      }
    }

    // /* Load Page Content */
    // var $ = cheerio.load(await page.content()); //it changes to jquery


    var Response = {};
    Response.Url = req.body.Url;

    Response.Name = await elementSelector(page,data.title.selector || null,data.title.attribute || null, data.title.regex || null, data.title.groups || [], false) || "";
    var strCategory = await elementSelector(page,data.category.selector || null,data.category.attribute || null, data.category.regex || null, data.category.groups || [], true) || "";
    Response.Category = strCategory.join(" ").trim()
    var strPrice = await elementSelector(page,data.price.selector,data.price.attribute || null,data.price.regex || null,data.price.groups || [],false) || ""
    //Extract clean price without decimal
    if(strPrice.includes(",") || strPrice.includes(".")) {
      strPrice = strPrice.match(/[,.\d]+(?=[.,]\d+)/g)[0]
      strPrice = strPrice.replace(/[.,]/g,'')
    } else{
      strPrice = strPrice.match(/\d+/g)[0]
    }

    Response.Price = strPrice
    Response.Color = await elementSelector(page,data.color.selector || null,data.color.attribute || null, data.color.regex || null, data.color.groups || [], false) || "";
    Response.Size = Size;

    //  if(!Response.Price){
    //    Response.Price = $('div#productInfo > div#rightInfoBar > div.info-panel:nth-child(1) > div.main-info-area > div:nth-child(3) > div.price-area > div > div > span.advanced-price').text().replace(/\n/g, "").trim() || "";
    //  }
    //  if(Response.Price){
    //      Response.Price = (Response.Price).replace(/\D/g, ''); // Extract Number's from String
    //  }

     /* See All Images */
     var strImages = await elementSelector(page,data.images.selector,data.images.attribute || null,data.images.regex || null,data.images.groups || [],true)

     for (let index = 0; index < strImages.length; index++) {
      if(strImages[index]){
        if(!strImages[index].startsWith('https://')){
          if(strImages[index].startsWith('//')){
            strImages[index] = "https:" + strImages[index]
          } else {
            strImages[index] = "https://" + strImages[index]
          }
        }
     }
      
     }
 
     Response.Images = strImages
    return res.status(200).json({
      ResponseCode: 200,
      Data: Response,
      Message: "Success."
    });
  } catch (e) {
    console.log('err', e)

    return res.status(500).json({
      ResponseCode: 500,
      Data: {},
      Message: "Some error occured Or data not found, please try again."
    });
  } finally{
    await browser.close();
    if (!data.isHeadless) {
      xvfb.stopSync();
    }
  }
}

module.exports = storesController;
