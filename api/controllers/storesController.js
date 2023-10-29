"use strict";

/*
 * Purpose : Website Search API
 * Package : Controller
 * Developed By  : Tishko Rasoul (tishko.rasoul@gmail.com)
 */

const {
  puppeteer,
  scrollToBottom,
  check,
  validationResult,
  fs,
  Xvfb,
  stealth,
  useProxy
} = require("../helper/packages.js")

const bypass = require("../helper/bypassDetections.js");
const bypassWebgl = require("../helper/bypassWebgl.js");

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
      return await page.evaluate(async ({ selector, attribute }) => {
        return Array.from((function () { var arr = []; var results = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null); while (node = results.iterateNext()) { arr.push(node) } return arr; })()).map(el => (el.getAttribute(attribute).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
      }, { selector, attribute })
    } else {
      return await page.evaluate(async (selector) => {
        return Array.from((function () { var arr = []; var results = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null); while (node = results.iterateNext()) { arr.push(node) } return arr; })()).map(el => (el.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
      }, selector)
    }
  } else {
    if (attribute) {
      return await page.evaluate(({ selector, attribute }) => {
        return Array.from(document.querySelectorAll(selector)).map(el => (el.getAttribute(attribute).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
      }, { selector, attribute })
    } else {
      return await page.evaluate((selector) => {
        return Array.from(document.querySelectorAll(selector)).map(el => (el.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&39;/g, "'").replace(/&amp;/g, "&").replace(/\n/g, "").trim()))
      }, selector)
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
    if (regex) {
        // if we have groups
      if (groups.length > 0) return Array.from(await mainSelector(page, selector, attribute)).map(item => Array.from(groups).map(group =>(item.match(new RegExp(regex,'gi'))[group])).join(""));
      //if we have only regex
      else return Array.from(await mainSelector(page, selector, attribute)).map(item =>(item.match(new RegExp(regex,'gi'))).join(""));
    } else {
      return await mainSelector(page, selector, attribute)
    }
  }
}


async function elementClick(page, selector) {
  if (selector.startsWith('//')) {
    await page.waitForXPath(selector)
    const elements = await page.$x(selector)
    await elements[0].click()
  } else {
    await page.waitForSelector(selector);
    await page.evaluate((selector) => {
      document.querySelector(selector).click();
    }, selector)
    //await page.click(selector)
  }
}


async function isValidStore(store) {
  if (Array.from(fs.readdirSync('./api/models/data')).map(e=>(e.replace('.json',''))).includes(store)) return true; else return false;
}

async function blockResources(page,data){
  page.on('request',async request => {
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
      if (url) {
        //console.log(request.resourceType()); 
        if (data.debug) console.log('\x1b[31m%s\x1b[0m', request.url());
      }

      request.abort();
    } else {
      //console.log(request.resourceType()); 
      if (data.debug) console.log('\x1b[32m%s\x1b[0m', '"' + request.url() + '",');
      request.continue();
    }

  });

}




async function search(req, res) {

  var browser
  /* To Check Validation json */
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(500).json({
      ResponseCode: 500,
      Data: [],
      Message: errors.array()[0].msg
    });
  }


  let url = req.body.Url
  console.log('\x1b[34m%s\x1b[0m', url)

  var match = await url.match("^((http[s]?|ftp):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{1,3}(\.[^:\/\s\.]{1,2})?(:\d+)?)($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$")
  let store = await match[4].replace(/\..+/g, '')

  

  if (!await isValidStore(store)) {
    console.log('\x1b[33m%s\x1b[0m', url)
    return res.status(500).json({
      ResponseCode: 500,
      Data: {},
      Message: `${store} is not supported!`
    });
  }
  const data = await require('../models/data/' + store)

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0"
  ]
  //const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)]
   const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
  //const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"

  const xvfb = new Xvfb({
    silent: true,
    xvfb_args: ["-screen", "0", '1366x768x24', "-ac"]
  });

  var args = []

  args.push(`--no-sandbox`)
  args.push(`--disable-setuid-sandbox`)
  args.push(`--window-size=1366x768`)
  args.push(`--blink-settings=imagesEnabled=true`)
  args.push(`--disable-translate`)
  args.push(`--window-position=0,0`)
  args.push('--hide-scrollbars')
  args.push('--mute-audio')
  args.push(`--disable-speech-api`)
  args.push(`--user-agent=${userAgent}`)
  args.push(`--disable-web-security`)

  if (!data.isHeadless) {
    await xvfb.startSync();
    args.push("--use-fake-device-for-media-stream")
    args.push("--display=" + xvfb._display)
  }

  

  /* Initialize Browser */
  try {


    /* Launch Browser */

    if(!data.isHeadless){
    puppeteer.use(stealth({
      enabledEvasions: new Set([
      /* evasions for headless only
      'chrome.app',
      'chrome.csi',
      'chrome.loadTimes',
      'chrome.runtime',
      'navigator.permissions',
      'navigator.plugins',
      'window.outerdimensions'
      */
      //launch args (the webdriver fix is very much needed depending on how you launch chrome, just the method changed in v89) and sourceurl 
      'defaultArgs',
      // appears to be necessary to prevent iframe issues? https://github.com/puppeteer/puppeteer/issues/1106
      'iframe.contentWindow',
      // necessary if running chromium instad of chrome
      'media.codecs',
      // Doesn't appear to be necessary with chrome version > 89?
      'navigator.webdriver',
      // Strips puppeteer/CDP artifacts from stacktrace
      'sourceurl',
      /* thou shall not lie about thou hardware stack
      'user-agent-override', // better off using this plugin manually than the default MSFT UA imo
      'webgl.vendor', // Try and use common hardware instead
      */
      ])
    }))
  } else {
    stealth().enabledEvasions.delete("user-agent-override")
    stealth().enabledEvasions.delete("webgl.vendor")
    puppeteer.use(stealth())

  }

    var proxy
    if (data.proxies.length > 0){
       proxy = data.proxies[Math.floor(Math.random() * data.proxies.length)]
       //args.push(`--proxy-server=${proxy}`)
       if (data.debug) console.log(proxy)
    }

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


    browser = await puppeteer.launch({
      headless: data.isHeadless,
      executablePath: '/usr/bin/google-chrome',
      args: args,
      slowMo: 0
    });

    //first tab
    
    const page = (await browser.pages())[0]; 
    

    await require("puppeteer-extra-plugin-stealth/evasions/user-agent-override")({      userAgent: userAgent,      locale: 'en-US,en',      maskLinux: true    }).onPageCreated(page)
    //await require(`puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency`)(8).onPageCreated(page)
    //await require(`puppeteer-extra-plugin-stealth/evasions/navigator.vendor`)({ vendor: 'Google Inc.' }).onPageCreated(page)
    await require(`puppeteer-extra-plugin-stealth/evasions/webgl.vendor`)({vendor: "Google Inc. (Intel)", renderer: "Intel, Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0, D3D11"}).onPageCreated(page)
    //await require(`puppeteer-extra-plugin-stealth/evasions/navigator.languages`)(['en-US', 'en']).onPageCreated(page)


    await useProxy(page, proxy);

    //Randomize viewport size
    await page.setViewport({
      width: 1366 + Math.floor(Math.random() * 100),
      height: 768 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });

    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0);

    //await page.setUserAgent(userAgent);

    // Saved cookies reading
    const cookies = fs.readFileSync('cookies.json', 'utf8');

    const deserializedCookies = JSON.parse(cookies);
    await page.setCookie(...deserializedCookies);

    //await page.emulateTimezone('Asia/Baghdad');


    await page.setRequestInterception(true);
    //Block unnecessary resource types and urls
    await blockResources(page,data)

    console.log(await page.browser().userAgent())
    // await bypassWebgl(page,userAgent,"Intel Inc.")
    // Bypass detections
    // await bypass(page)
    const response = await page.goto(req.body.Url, {
      waitUntil: data.waitUntil,
      timeout: 0
    });
    //if (data.debug) console.log(await response.headers())
    await page.mouse.move(100, Math.floor(Math.random() * 100));
    await page.mouse.move(200, Math.floor(Math.random() * 100));

    const saveCookies = await page.cookies();
    await fs.promises.writeFile('./cookies.json', JSON.stringify(saveCookies, null, 2));

    if(data.scrollToBottom) await page.evaluate(scrollToBottom, { frequency: 200, timing: 0 });

    if(data.debug) await delay(8000)

    // debug
    if (data.debug) {
      fs.writeFileSync('debug/docs/' + store + '.html', await page.evaluate(() => {
        return document.querySelectorAll("html")[0].outerHTML
      }), {
        encoding: 'utf8',
        flag: 'w'
      })

      // console.log(await page.evaluate(() => {
      //   var arr = []
      //   arr.push(navigator.webdriver)
      //   arr.push(navigator.language)
      //   arr.push(navigator.deviceMemory)
      //   arr.push(navigator.hardwareConcurrency)
      //   arr.push(navigator.platform)
      //   arr.push(window.screen.width)
      //   arr.push(window.screen.height)
      //   return arr
      // }))

      await page.screenshot({
        path: 'debug/screenshoots/' + store + '.png',
        fullPage: true
      });

    }

    await page.waitForSelector(data.container, {
      timeout: 15000
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
      if (data.debug) console.log(NotInStockSizes)
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
      if (data.debug) console.log(InStockSizes)
      if (!isInstock) {
        return res.status(500).json({
          ResponseCode: 500,
          Data: {},
          Message: `Size ${Size} is not available!`
        });
      }

      // Click Size to appear the true price
      if (isInstock) {
        if (data.clickSize) {
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

    Response.Name = await elementSelector(page, data.title.selector || null, data.title.attribute || null, data.title.regex || null, data.title.groups || [], false) || "";
    var strCategory = await elementSelector(page, data.category.selector || null, data.category.attribute || null, data.category.regex || null, data.category.groups || [], true) || "";
    Response.Category = strCategory.join(" ").trim()
    var strPrice = await elementSelector(page, data.price.selector, data.price.attribute || null, data.price.regex || null, data.price.groups || [], false) || ""
    //Extract clean price without decimal
    if (strPrice.includes(",") || strPrice.includes(".")) {
      strPrice = strPrice.match(/[,.\d]+(?=[.,]\d+)/g)[0]
      strPrice = strPrice.replace(/[.,]/g, '')
    } else {
      console.log("price is >" + strPrice)
      strPrice = strPrice.match(/\d+/g)
      strPrice = strPrice[0]
    }

    Response.Price = strPrice
    Response.Color = await elementSelector(page, data.color.selector || null, data.color.attribute || null, data.color.regex || null, data.color.groups || [], false) || "";
    Response.Size = Size;

    //  if(!Response.Price){
    //    Response.Price = $('div#productInfo > div#rightInfoBar > div.info-panel:nth-child(1) > div.main-info-area > div:nth-child(3) > div.price-area > div > div > span.advanced-price').text().replace(/\n/g, "").trim() || "";
    //  }
    //  if(Response.Price){
    //      Response.Price = (Response.Price).replace(/\D/g, ''); // Extract Number's from String
    //  }

    /* See All Images */
    var strImages = await elementSelector(page, data.images.selector, data.images.attribute || null, data.images.regex || null, data.images.groups || [], true)

    for (let index = 0; index < strImages.length; index++) {
      if (strImages[index]) {
        if (!strImages[index].startsWith('https://')) {
          if (strImages[index].startsWith('//')) {
            strImages[index] = "https:" + strImages[index]
          } else {
            strImages[index] = "https://" + strImages[index]
          }
        }
      }

    }

    Response.Images = await strImages

    console.log('\x1b[32m%s\x1b[0m', url)
    return res.status(200).json({
      ResponseCode: 200,
      Data: Response,
      Message: "Success."
    });
  } catch (e) {
    console.log('err', e)
    console.log(userAgent)
    console.log('\x1b[31m%s\x1b[0m', url)
    return res.status(500).json({
      ResponseCode: 500,
      Data: {},
      Message: "Some error occured Or data not found, please try again."
    });
  } finally {
    browser.close();
    if (!data.isHeadless) {
      xvfb.stopSync();
    }
  }
}

module.exports = storesController;
