module.exports = async function bypassDetections(page){


    await page.evaluateOnNewDocument(() => {

        // Object.defineProperty(navigator, "languages", { get: () => ['en-US', 'en', 'ku'] });
        // Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        // Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
        //Object.defineProperty(navigator, 'plugins', {get: function() {return [1, 2, 3, 4, 5];}}); //detection expose
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
        //     return 'Intel Inc.';
        //   }
        //   // UNMASKED_RENDERER_WEBGL
        //   if (parameter === 37446) {
        //     return 'Intel Iris OpenGL Engine';
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
  
        // (function () {        var overwrite = function (name) {
        //     const OLD = HTMLCanvasElement.prototype[name];
        //     Object.defineProperty(HTMLCanvasElement.prototype, name, {
        //       "value": function () {
        //         var shift = {
        //           'r': Math.floor(Math.random() * 10) - 5,
        //           'g': Math.floor(Math.random() * 10) - 5,
        //           'b': Math.floor(Math.random() * 10) - 5,
        //           'a': Math.floor(Math.random() * 10) - 5
        //         };
        //         var width = this.width, height = this.height, context = this.getContext("2d");
        //         var imageData = context.getImageData(0, 0, width, height);
        //         for (var i = 0; i < height; i++) {
        //           for (var j = 0; j < width; j++) {
        //             var n = ((i * (width * 4)) + (j * 4));
        //             imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
        //             imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
        //             imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
        //             imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
        //           }
        //         }
        //         context.putImageData(imageData, 0, 0);
        //         return OLD.apply(this, arguments);
        //       }
        //     });
        //   };
        //   overwrite('toBlob');
        //   overwrite('toDataURL');
        // })();
      });
  
      // await page.evaluateOnNewDocument(() => {
      //   //Pass notifications check
      //   const originalQuery = window.navigator.permissions.query;
      //   return window.navigator.permissions.query = (parameters) => (
      //     parameters.name === 'notifications' ?
      //       Promise.resolve({ state: Notification.permission }) :
      //       originalQuery(parameters)
      //   );
      // });
  
      // await page.evaluateOnNewDocument(() => {
      //   // Overwrite the `plugins` property to use a custom getter.
      //   Object.defineProperty(navigator, 'plugins', {
      //     // This just needs to have `length > 0` for the current test,
      //     // but we could mock the plugins too if necessary.
      //     get: () => [1, 2, 3, 4, 5],
      //   });
      // });
}
