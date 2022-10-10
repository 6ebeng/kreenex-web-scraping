module.exports = async function bypassWebgl(page,userAgent,vendor){

// YOU NEED TO SET this._settings.device.userAgent AND vendor
const WEBGL_RENDERERS_DESKTOP = ['ANGLE (NVIDIA Quadro 2000M Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (NVIDIA Quadro K420 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA Quadro 2000M Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA Quadro K2000M Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics Family Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon HD 3800 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (AMD Radeon R9 200 Series Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics Family Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics Family Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics 4000 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics 3000 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Mobile Intel(R) 4 Series Express Chipset Family Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) G33/G31 Express Chipset Family Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (Intel(R) Graphics Media Accelerator 3150 Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (Intel(R) G41 Express Chipset Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 6150SE nForce 430 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics 4000)', 'ANGLE (Mobile Intel(R) 965 Express Chipset Family Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics Family)', 'ANGLE (NVIDIA GeForce GTX 760 Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (NVIDIA GeForce GTX 760 Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (NVIDIA GeForce GTX 760 Direct3D11 vs_5_0 ps_5_0)', 'ANGLE (AMD Radeon HD 6310 Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Graphics Media Accelerator 3600 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) G33/G31 Express Chipset Family Direct3D9 vs_0_0 ps_2_0)', 'ANGLE (AMD Radeon HD 6320 Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) G33/G31 Express Chipset Family (Microsoft Corporation - WDDM 1.0) Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (Intel(R) G41 Express Chipset)', 'ANGLE (ATI Mobility Radeon HD 5470 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Q45/Q43 Express Chipset Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 310M Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) G41 Express Chipset Direct3D9 vs_3_0 ps_3_0)', 'ANGLE (Mobile Intel(R) 45 Express Chipset Family (Microsoft Corporation - WDDM 1.1) Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GT 440 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon HD 4300/4500 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 7310 Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics)', 'ANGLE (Intel(R) 4 Series Internal Chipset Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon(TM) HD 6480G Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon HD 3200 Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 7800 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) G41 Express Chipset (Microsoft Corporation - WDDM 1.1) Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 210 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GT 630 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 7340 Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) 82945G Express Chipset Family Direct3D9 vs_0_0 ps_2_0)', 'ANGLE (NVIDIA GeForce GT 430 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 7025 / NVIDIA nForce 630a Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Q35 Express Chipset Family Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (Intel(R) HD Graphics 4600 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 7520G Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD 760G (Microsoft Corporation WDDM 1.1) Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GT 220 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 9500 GT Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics Family Direct3D9 vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Graphics Media Accelerator HD Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 9800 GT Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Q965/Q963 Express Chipset Family (Microsoft Corporation - WDDM 1.0) Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (NVIDIA GeForce GTX 550 Ti Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Q965/Q963 Express Chipset Family Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (AMD M880G with ATI Mobility Radeon HD 4250 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GTX 650 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Mobility Radeon HD 5650 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon HD 4200 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 7700 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) G33/G31 Express Chipset Family)', 'ANGLE (Intel(R) 82945G Express Chipset Family Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (SiS Mirage 3 Graphics Direct3D9Ex vs_2_0 ps_2_0)', 'ANGLE (NVIDIA GeForce GT 430)', 'ANGLE (AMD RADEON HD 6450 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon 3000 Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) 4 Series Internal Chipset Direct3D9 vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Q35 Express Chipset Family (Microsoft Corporation - WDDM 1.0) Direct3D9Ex vs_0_0 ps_2_0)', 'ANGLE (NVIDIA GeForce GT 220 Direct3D9 vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 7640G Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD 760G Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 6450 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GT 640 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 9200 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GT 610 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 6290 Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Mobility Radeon HD 4250 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 8600 GT Direct3D9 vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon HD 5570 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 6800 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) G45/G43 Express Chipset Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon HD 4600 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA Quadro NVS 160M Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics 3000)', 'ANGLE (NVIDIA GeForce G100)', 'ANGLE (AMD Radeon HD 8610G + 8500M Dual Graphics Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Mobile Intel(R) 4 Series Express Chipset Family Direct3D9 vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 7025 / NVIDIA nForce 630a (Microsoft Corporation - WDDM) Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) Q965/Q963 Express Chipset Family Direct3D9 vs_0_0 ps_2_0)', 'ANGLE (AMD RADEON HD 6350 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (ATI Radeon HD 5450 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce 9500 GT)', 'ANGLE (AMD Radeon HD 6500M/5600/5700 Series Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Mobile Intel(R) 965 Express Chipset Family)', 'ANGLE (NVIDIA GeForce 8400 GS Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (Intel(R) HD Graphics Direct3D9 vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GTX 560 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GT 620 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GTX 660 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon(TM) HD 6520G Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA GeForce GT 240 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (AMD Radeon HD 8240 Direct3D9Ex vs_3_0 ps_3_0)', 'ANGLE (NVIDIA Quadro NVS 140M)', 'ANGLE (Intel(R) Q35 Express Chipset Family Direct3D9 vs_0_0 ps_2_0)'];
const WEBGL_VENDORS_ANDROID = ['Qualcomm', 'ARM'];
const WEBGL_RENDERERS_ANDROID = ['Adreno (TM) 630', 'Mali-T830'];
if (!this._WebGL) {
    this._WebGL = {};
    const parser = require('ua-parser-js');
    const machine = parser(userAgent);
    const rand = function (min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };
    const randArr = function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };
    this._WebGL['s7936'] = 'WebKit';
    this._WebGL['s7937'] = 'WebKit WebGL';
    this._WebGL['s7938'] = 'WebGL 2.0 (OpenGL ES 3.0 Chromium)';
    this._WebGL['s35724'] = 'WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)';
    this._WebGL['s36347'] = 4096;
    this._WebGL['s36348'] = 30;
    this._WebGL['s33902'] = [1, 1];
    this._WebGL['s33901'] = [1, 1024];
    this._WebGL['s6408'] = rand(6400, 6420);
    this._WebGL['s35661'] = randArr([128, 192, 256]);
    this._WebGL['s36349'] = Math.pow(2, rand(9, 12));
    this._WebGL['s34852'] = 8;
    this._WebGL['s3386'] = [32767, 32767];
    this._WebGL['webgl2'] = true;
    if (machine.os.name.toLowerCase().includes('windows')) {
        this._WebGL['s7936'] = 'Mozilla';
        this._WebGL['s7937'] = 'Mozilla';
        this._WebGL['s37445'] = vendor;
        this._WebGL['s37446'] = WEBGL_RENDERERS_DESKTOP[Math.floor(Math.random() * WEBGL_RENDERERS_DESKTOP.length)];
    }
    else if (machine.os.name.toLowerCase().includes('android')) {
        this._WebGL['s37445'] = WEBGL_VENDORS_ANDROID[Math.floor(Math.random() * WEBGL_VENDORS_ANDROID.length)];
        this._WebGL['s37446'] = WEBGL_RENDERERS_ANDROID[Math.floor(Math.random() * WEBGL_RENDERERS_ANDROID.length)];
    }
    else if (machine.os.name.toLowerCase().includes('linux')) {
        this._WebGL['s37445'] = vendor;
        this._WebGL['s37446'] = WEBGL_RENDERERS_DESKTOP[Math.floor(Math.random() * WEBGL_RENDERERS_DESKTOP.length)];
    }
    else if (machine.os.name.toLowerCase().includes('apple') || machine.os.name.toLowerCase().includes('ios') || (machine.os.name.toLowerCase().includes('mac') && machine.browser.name.includes('Safari'))) {
        this._WebGL['s7938'] = 'WebGL 1.0';
        this._WebGL['s35724'] = 'WebGL GLSL ES 1.0 (1.0)';
        this._WebGL['s37445'] = 'Apple Inc.';
        this._WebGL['s37446'] = 'Apple GPU';
        this._WebGL['s36347'] = 512;
        this._WebGL['s36348'] = 15;
        this._WebGL['s34852'] = 1;
        this._WebGL['s33902'] = [1, 16];
        this._WebGL['s33901'] = [1, 511];
        this._WebGL['s3386'] = [16384, 16384];
        this._WebGL['s36349'] = 224;
        this._WebGL['s35661'] = 32;
        this._WebGL['webgl2'] = false;
    }
    else if (machine.os.name.toLowerCase().includes('mac')) {
        this._WebGL['s37445'] = 'Intel Inc.';
        this._WebGL['s37446'] = 'Intel HD Graphics 4000 OpenGL Engine';
    }
    else {
        this._WebGL['s37445'] = vendor;
        this._WebGL['s37446'] = 'Google SwiftShader';
    }
    this._WebGL['offset'] = Math.random();
}
await page.evaluateOnNewDocument((session) => {
    (function (session) {
        function safeOverwrite(obj, prop, newVal) {
            let props = Object.getOwnPropertyDescriptor(obj, prop);
            props["value"] = newVal;
            return props;
        }
        let changeMap = {};
        let paramChanges = {
            3379: 16384,
            3386: session['s3386'],
            3410: 8,
            3411: 8,
            3412: 8,
            3413: 8,
            3414: 24,
            3415: 8,
            6408: session['s6408'],
            34024: 16384,
            30476: 16384,
            34921: 16,
            34930: 16,
            35660: 16,
            35661: session['s35661'],
            36347: session['s36347'],
            36349: session['s36349'],
            7936: session['s7936'],
            7937: session['s7937'],
            37445: session['s37445'],
            37446: session['s37446'],
            7938: session['s7938'],
            35724: session['s35724'],
            36348: session['s36348'],
            33902: session['s33902'],
            33901: session['s33901'],
            34852: session['s34852']
        };
        changeMap = Object.assign(changeMap, paramChanges);
        ["WebGLRenderingContext", "WebGL2RenderingContext"].forEach(function (ctx) {
            if (!window[ctx]) return;
 
            // Modify getParameter
            let oldParam = window[ctx].prototype.getParameter;
            Object.defineProperty(window[ctx].prototype, "getParameter",
                safeOverwrite(window[ctx].prototype, "getParameter", function (param) {
                    if (changeMap[param]) return changeMap[param];
                    return oldParam.apply(this, arguments);
                })
            );
 
            // Modify bufferData (this updates the image hash)
            let oldBuffer = window[ctx].prototype.bufferData;
            Object.defineProperty(window[ctx].prototype, "bufferData",
                safeOverwrite(window[ctx].prototype, "bufferData", function () {
                    for (let i = 0; i < arguments[1].length; i++) {
                        arguments[1][i] += session['offset'] * 1e-3;
                    }
                    return oldBuffer.apply(this, arguments);
                })
            );
        });
        if (!session['webgl2']) {
            paramChanges = {};
            Object.getOwnPropertyNames(WebGL2RenderingContext).forEach(property => {
                if (Number.isInteger(WebGL2RenderingContext[property]) && WebGL2RenderingContext[property] > 0) {
                    paramChanges[property] = undefined;
                }
            });
            let oldParam = WebGL2RenderingContext.prototype.getParameter;
            Object.defineProperty(WebGL2RenderingContext.prototype, "getParameter",
                safeOverwrite(WebGL2RenderingContext.prototype, "getParameter", function (param) {
                    if (paramChanges[param]) return paramChanges[param];
                    return oldParam.apply(this, arguments);
                })
            );
            WebGL2RenderingContext = undefined;
            HTMLCanvasElement.prototype.getContext = function (orig) {
                return function (type) {
                    return !type.includes("webgl2") ? orig.apply(this, arguments) : null
                }
            }(HTMLCanvasElement.prototype.getContext)
            HTMLCanvasElement.prototype.getContext.toString = () => 'function getContext() { [native code] }';
        }
    })(session)
}, this._WebGL);
}
