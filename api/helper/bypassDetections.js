module.exports = async function bypassDetections(page){

    await page.evaluateOnNewDocument(() => {

        // Object.defineProperty(navigator, "languages", { get: () => ['en-US', 'en', 'ku'] });
        // Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        // Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        // Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
        // //Object.defineProperty(navigator, 'plugins', {get: function() {return [1, 2, 3, 4, 5];}}); detection expose
        // // Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {get: function() {return window}});   HM not work

        
        // window.chrome = {
        //   runtime: true
        // };
        // window.navigator.chrome = {
        //   runtime: true,
        // };
  
  
  
        // const getParameter = WebGLRenderingContext.getParameter;
        // WebGLRenderingContext.prototype.getParameter = function (parameter) {
        //   // UNMASKED_VENDOR_WEBGL
        //   if (parameter === 37445) {
        //     return 'Google Inc. (Intel)';
        //   }
        //   // UNMASKED_RENDERER_WEBGL
        //   if (parameter === 37446) {
        //     return 'ANGLE (Intel, Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0, D3D11)';
        //   }
  
        //   return getParameter(parameter);
        // };
  
        // store the existing descriptor
        const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        // redefine the property with a patched descriptor
        Object.defineProperty(HTMLDivElement.prototype, 'offsetHeight', {
          ...elementDescriptor,
          get: function () {
            if (this.id === 'modernizr') {
              return 1;
            }
            return elementDescriptor.get.apply(this);
          },
        });
  
        (function () {        
          function hookPrototypeMethods(prefix, object) {
            // TODO: also hook getters
            if (!object) return;
            const originals = {};
            const prototype = Object.getPrototypeOf(object);
            Object
              .getOwnPropertyNames(prototype)
              .filter((n) => {
                try {
                  return typeof prototype[n] === 'function';
                } catch (error) {
                  return false;
                }
              })
              .forEach((n) => {
                originals[n] = prototype[n];
                // eslint-disable-next-line func-names
                prototype[n] = function fn(...args) {
                  if (prefix === '2d' && (n === 'strokeText' || n === 'fillText')) {
                    const temp = Array.from(args);
                    temp[0] = fingerprint.BUID;
                    temp[1] = Math.max(0, temp[1] - 2);
                    temp[2] = Math.max(0, temp[2] - 2);
                    originals[n].call(this, ...temp);
                  }
    
                  const result = originals[n].call(this, ...args);
                  if (LO) {
                    let jsonResult;
                    try {
                      jsonResult = JSON.stringify(result);
                      // eslint-disable-next-line no-empty
                    } catch (e) {}
                    // eslint-disable-next-line no-console
                    console.log('function called', prefix, n, JSON.stringify(args), 'result:', result, jsonResult, `${result}`);
                  }
                  return result;
                };
              });
          }
    
          const gls = [];
          try {
            gls.push(document.createElement('canvas').getContext('webgl'));
            gls.push(document.createElement('canvas').getContext('experimental-webgl'));
            // eslint-disable-next-line no-empty
          } catch (e) {}
    
          gls.forEach((gl) => {
            const glProto = Object.getPrototypeOf(gl);
            const origGetParameter = glProto.getParameter;
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (gl) {
              glProto.getParameter = function getParameter(...args) {
                if (args[0] === debugInfo.UNMASKED_VENDOR_WEBGL) return logOverride('gl.getParameter.UNMASKED_VENDOR_WEBGL', fingerprint.GL_PARAMETER.VENDOR); // REPLACE WITH RANDOM VENDOR
                if (args[0] === debugInfo.UNMASKED_RENDERER_WEBGL) return logOverride('gl.getParameter.UNMASKED_RENDERER_WEBGL', fingerprint.GL_PARAMETER.RENDERER); // REPLACE WITH RANDOM RENDERER
                if (args[0] === 33901) return new Float32Array([1, 8191]);
                if (args[0] === 3386) return new Int32Array([16384, 16384]);
                if (args[0] === 35661) return 80;
                if (args[0] === 34076) return 16384;
                if (args[0] === 36349) return 1024;
                if (args[0] === 34024) return 16384;
                if (args[0] === 3379) return 16384;
                if (args[0] === 34921) return 16;
                if (args[0] === 36347) return 1024;
    
                return origGetParameter.call(this, ...args);
              };
            }
          });
    
         
              hookPrototypeMethods('webgl', document.createElement('canvas').getContext('webgl'));
              hookPrototypeMethods('experimental-webgl', document.createElement('canvas').getContext('experimental-webgl'));
              hookPrototypeMethods('2d', document.createElement('canvas').getContext('2d'));
              hookPrototypeMethods('canvas', canvas);
          
            hookPrototypeMethods('screen', window.screen);
            hookPrototypeMethods('navigator', window.navigator);
            hookPrototypeMethods('history', window.history);
        })();
      });
  
//       await page.evaluateOnNewDocument(() => {
//         //Pass notifications check
//         const originalQuery = window.navigator.permissions.query;
//         return window.navigator.permissions.query = (parameters) => (
//           parameters.name === 'notifications' ?
//             Promise.resolve({ state: Notification.permission }) :
//             originalQuery(parameters)
//         );
//       });
  
//       await page.evaluateOnNewDocument(() => {
//         // Overwrite the `plugins` property to use a custom getter.
//         Object.defineProperty(navigator, 'plugins', {
//           // This just needs to have `length > 0` for the current test,
//           // but we could mock the plugins too if necessary.
//           get: () => [1, 2, 3, 4, 5],
//         });
//       });
}
