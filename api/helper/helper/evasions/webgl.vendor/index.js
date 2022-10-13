'use strict';


/**
 * Fix WebGL Vendor/Renderer being set to Google in headless mode
 *
 * Example data (Apple Retina MBP 13): {vendor: "Intel Inc.", renderer: "Intel(R) Iris(TM) Graphics 6100"}
 *
 * @param {Object} [opts] - Options
 * @param {string} [opts.gpu] - The vendor string to use (default: `Intel Inc.`)
 * @param {string} [opts.webgl] - The renderer string (default: `Intel Iris OpenGL Engine`)
 * @param {string} [opts.webgl2] - The renderer string (default: `Intel Iris OpenGL Engine`)
*/
const {PuppeteerExtraPlugin} = require('puppeteer-extra-plugin');

const withUtils = require('../_utils/withUtils');

const withWorkerUtils = require('../_utils/withWorkerUtils');

class Plugin extends PuppeteerExtraPlugin {
    constructor(opts = {}) {
        super(opts);
    }
    
    get name() {
        return 'stealth/evasions/webgl.vendor';
    }
    
    /* global WebGLRenderingContext WebGL2RenderingContext */
    async onPageCreated(page) {
      console.log(this)
        await withUtils(this, page).evaluateOnNewDocument(this.mainFunction, {
            gpu: this.opts.gpu,
            webgl: this.opts.webgl,
            webgl2: this.opts.webgl2,
        });
    }

    onServiceWorkerContent(jsContent) {
        return withWorkerUtils(this, jsContent).evaluate(this.mainFunction, {
            gpu: this.opts.gpu,
            webgl: this.opts.webgl,
            webgl2: this.opts.webgl2,
        });
    }

    mainFunction = (utils, opts) => {
        const _Object = utils.cache.Object;
        const _Reflect = utils.cache.Reflect;

        // shaderPrecisionFormat: shaderPrecisionFormat itself
        // webglPropName
        // shaderType
        // precisionType,
        // rangeMin
        // rangeMax
        // precision
        const shaderPrecisionFormats = [];

        const WebGLShaderPrecisionFormat_prototype_rangeMin_get = utils.cache.Descriptor.WebGLShaderPrecisionFormat.prototype.rangeMin.get;
        const WebGLShaderPrecisionFormat_prototype_rangeMax_get = utils.cache.Descriptor.WebGLShaderPrecisionFormat.prototype.rangeMax.get;
        const WebGLShaderPrecisionFormat_prototype_precision_get = utils.cache.Descriptor.WebGLShaderPrecisionFormat.prototype.precision.get;

        const bindContext = (WebGLRenderingContext, propName) => {
            // getParameter
            utils.replaceWithProxy(WebGLRenderingContext.prototype, 'getParameter', {
                apply(target, thisArg, args) {
                    // We must call this primitive method, and akamai will listen to see if this primitive method is called
                    const orgResult = _Reflect.apply(target, thisArg, args);
                    const type = args[0];
                    let result = undefined;

                    switch (type) {
                        case 37445: /* renderer.UNMASKED_VENDOR_WEBGL */
                            result = opts.gpu.vendor;
                            break;

                        case 37446: /* renderer.UNMASKED_RENDERER_WEBGL */
                            result = opts.gpu.renderer;
                            break;

                        default:
                            const param = opts[propName].params[type];
                            if (param) {
                                const paramValue = param.value;

                                if (paramValue && paramValue.constructor.name === 'Object') {
                                    const classType = param.type;
                                    // Float32Array, Int32Array, ...
                                    result = new utils.cache.global[classType](Object.values(paramValue));
                                } else {
                                    // including: null, number, string, array
                                    result = paramValue;
                                }
                            }

                            break;
                    }

                    if (result === undefined) {
                        result = orgResult;
                    }

                    return result;
                },
            });

            // noinspection JSUnusedLocalSymbols
            utils.replaceWithProxy(WebGLRenderingContext.prototype, 'getSupportedExtensions', {
                apply(target, thisArg, args) {
                    _Reflect.apply(target, thisArg, args);
                    return opts[propName].supportedExtensions;
                },
            });

            // getContextAttributes
            utils.replaceWithProxy(WebGLRenderingContext.prototype, 'getContextAttributes', {
                apply(target, thisArg, args) {
                    const result = _Reflect.apply(target, thisArg, args);

                    result.alpha = opts[propName].contextAttributes.alpha;
                    result.antialias = opts[propName].contextAttributes.antialias;
                    result.depth = opts[propName].contextAttributes.depth;
                    result.desynchronized = opts[propName].contextAttributes.desynchronized;
                    result.failIfMajorPerformanceCaveat = opts[propName].contextAttributes.failIfMajorPerformanceCaveat;
                    result.powerPreference = opts[propName].contextAttributes.powerPreference;
                    result.premultipliedAlpha = opts[propName].contextAttributes.premultipliedAlpha;
                    result.preserveDrawingBuffer = opts[propName].contextAttributes.preserveDrawingBuffer;
                    result.stencil = opts[propName].contextAttributes.stencil;
                    result.xrCompatible = opts[propName].contextAttributes.xrCompatible;

                    return result;
                },
            });

            // getShaderPrecisionFormat
            utils.replaceWithProxy(WebGLRenderingContext.prototype, 'getShaderPrecisionFormat', {
                apply(target, thisArg, args) {
                    const shaderPrecisionFormat = _Reflect.apply(target, thisArg, args);

                    shaderPrecisionFormats.push({
                        shaderPrecisionFormat,
                        webglPropName: propName,
                        shaderType: args[0],
                        precisionType: args[1],
                        rangeMin: WebGLShaderPrecisionFormat_prototype_rangeMin_get.call(shaderPrecisionFormat),
                        rangeMax: WebGLShaderPrecisionFormat_prototype_rangeMax_get.call(shaderPrecisionFormat),
                        precision: WebGLShaderPrecisionFormat_prototype_precision_get.call(shaderPrecisionFormat),
                    });

                    return shaderPrecisionFormat;
                },
            });
        };

        // WebGLRenderingContext.STENCIL_BACK_PASS_DEPTH_FAIL;
        bindContext(WebGLRenderingContext, 'webgl');
        bindContext(WebGL2RenderingContext, 'webgl2');

        // WebGLShaderPrecisionFormat
        // noinspection JSUnusedLocalSymbols
        utils.replaceGetterWithProxy(WebGLShaderPrecisionFormat.prototype, 'precision', {
            apply(target, thisArg, args) {
                _Reflect.apply(target, thisArg, args);

                const r = shaderPrecisionFormats.find(
                    e => e.shaderPrecisionFormat === thisArg,
                );

                // webglPropName
                // shaderType
                // precisionType,
                // rangeMin
                // rangeMax
                // precision
                const {
                    webglPropName,
                    shaderType,
                    precisionType,
                    rangeMin,
                    rangeMax,
                    precision,
                } = r;

                const fake_r = opts[webglPropName].shaderPrecisionFormats.find(
                    e => e.shaderType === shaderType
                        && e.precisionType === precisionType,
                );

                const result = fake_r ? fake_r.r.precision : precisionType;
                return result;
            },
        });

        // noinspection JSUnusedLocalSymbols
        utils.replaceGetterWithProxy(WebGLShaderPrecisionFormat.prototype, 'rangeMin', {
            apply(target, thisArg, args) {
                _Reflect.apply(target, thisArg, args);

                const r = shaderPrecisionFormats.find(
                    e => e.shaderPrecisionFormat === thisArg,
                );

                const {
                    webglPropName,
                    shaderType,
                    precisionType,
                    rangeMin,
                    rangeMax,
                    precision,
                } = r;

                const fake_r = opts[webglPropName].shaderPrecisionFormats.find(
                    e => e.shaderType === shaderType
                        && e.precisionType === precisionType,
                );

                const result = fake_r ? fake_r.r.rangeMin : rangeMin;
                return result;
            },
        });

        // noinspection JSUnusedLocalSymbols
        utils.replaceGetterWithProxy(WebGLShaderPrecisionFormat.prototype, 'rangeMax', {
            apply(target, thisArg, args) {
                _Reflect.apply(target, thisArg, args);

                const r = shaderPrecisionFormats.find(
                    e => e.shaderPrecisionFormat === thisArg,
                );

                const {
                    webglPropName,
                    shaderType,
                    precisionType,
                    rangeMin,
                    rangeMax,
                    precision,
                } = r;

                const fake_r = opts[webglPropName].shaderPrecisionFormats.find(
                    e => e.shaderType === shaderType
                        && e.precisionType === precisionType,
                );

                const result = fake_r ? fake_r.r.rangeMax : rangeMax;
                return result;
            },
        });
    };

}

module.exports = function (pluginConfig) {
    return new Plugin(pluginConfig);
};