"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isWebpSupported = exports.isWebpConversionSupported = void 0;
/**
 * Determines if webp is supported by the browser
 * @returns a promise resolving to a boolean to know if webp is supported
 */
var isWebpSupported = exports.isWebpSupported = function isWebpSupported() {
  return new Promise(function (resolve) {
    var img = new Image();
    img.onload = function () {
      return resolve(img.width === 2 && img.height === 1);
    };
    img.onerror = function () {
      return resolve(false);
    };
    img.src = "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==";
  });
};

/**
 * Determines if webp conversion with canvas is supported by the browser
 * @returns a boolean to know if webp conversion is supported
 */
var isWebpConversionSupported = exports.isWebpConversionSupported = function isWebpConversionSupported() {
  var canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').match('image/webp') !== null;
};
//# sourceMappingURL=webpSupport.js.map