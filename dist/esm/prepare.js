import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _regeneratorRuntime from "@babel/runtime/regenerator";
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
import { ExifParserFactory } from "ts-exif-parser";
/**
 * Check if allowed type
 * @param image
 * @param options
 * @returns boolean
 */
var isFileTypeValid = function isFileTypeValid(file, allowedTypes) {
  return !allowedTypes || allowedTypes.some(function (allowedType) {
    return allowedType === file.type;
  });
};

/**
 * Check if file is too heavy
 * @param image
 * @param options
 * @returns boolean
 */
var isFileSizeValid = function isFileSizeValid(file, maxSize) {
  return !maxSize || file.size < maxSize;
};

/**
 * Check if image is big enough
 * @param image
 * @param options
 * @returns boolean
 */
var isImageMinSizeValid = function isImageMinSizeValid(image, options) {
  return !(options.minWidth && options.minHeight) || image.width >= options.minWidth && image.height >= options.minHeight;
};

/**
 * Check if image is small enough
 * @param image
 * @param options
 * @returns boolean
 */
var isImageMaxSizeValid = function isImageMaxSizeValid(image, options) {
  return !(options.maxWidth && options.maxHeight) || image.width <= options.maxWidth && image.height <= options.maxHeight;
};

/**
 * If orientationAllowed, handle big side/small side instead of width/height
 * @param image
 * @param options
 */
var handleOrientationAllowed = function handleOrientationAllowed(image, options) {
  if (!options.orientationAllowed) return;

  // handle max size. If image is wider than higher we make sur that maxWidth is bigger than maxHeight
  // if not we swap max size
  if (options.maxHeight && options.maxWidth) {
    if (image.width > image.height) {
      if (options.maxHeight > options.maxWidth) {
        var _ref = [options.maxWidth, options.maxHeight];
        options.maxHeight = _ref[0];
        options.maxWidth = _ref[1];
      }
    } else if (options.maxHeight < options.maxWidth) {
      var _ref2 = [options.maxWidth, options.maxHeight];
      options.maxHeight = _ref2[0];
      options.maxWidth = _ref2[1];
    }
  }

  // handle min size. If image is wider than higher we make sur that minWidth is bigger than minHeight
  // if not we swap min size
  if (options.minHeight && options.minWidth) {
    if (image.width > image.height) {
      if (options.minHeight > options.minWidth) {
        var _ref3 = [options.minWidth, options.minHeight];
        options.minHeight = _ref3[0];
        options.minWidth = _ref3[1];
      }
    } else if (options.minHeight < options.minWidth) {
      var _ref4 = [options.minWidth, options.minHeight];
      options.minHeight = _ref4[0];
      options.minWidth = _ref4[1];
    }
  }
};

/**
 * Optimize a file
 * Handle validation error
 * @param file
 * @param options
 * @returns a promise resolving to a new file and is metadata (otherwise a validation error)
 */
var resizeAndConvert = function resizeAndConvert(file, options) {
  return new Promise(function (resolve, reject) {
    var exif;
    var image = document.createElement("img");
    image.onload = function () {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      var width = image.width,
        height = image.height;
      handleOrientationAllowed(image, options);
      if (!isImageMinSizeValid(image, options)) {
        reject("minsize");
      }
      if (!options.autoCrop && !isImageMaxSizeValid(image, options)) {
        reject("maxsize");
      }

      // if no max/min size, set max/min size to width/height
      var _options$maxWidth = options.maxWidth,
        maxWidth = _options$maxWidth === void 0 ? width : _options$maxWidth,
        _options$maxHeight = options.maxHeight,
        maxHeight = _options$maxHeight === void 0 ? height : _options$maxHeight,
        _options$minWidth = options.minWidth,
        minWidth = _options$minWidth === void 0 ? width : _options$minWidth,
        _options$minHeight = options.minHeight,
        minHeight = _options$minHeight === void 0 ? height : _options$minHeight,
        lessCrop = options.lessCrop;

      // Define ratio to have the biggest image allowed
      var maxWRatio = maxWidth / width;
      var maxHRatio = maxHeight / height;
      var ratios = [maxWRatio, maxHRatio].filter(function (ratio) {
        return ratio < 1;
      });
      var ratio = 1;
      if (ratios.length > 0) {
        ratio = lessCrop ? Math.min.apply(Math, _toConsumableArray(ratios)) : Math.max.apply(Math, _toConsumableArray(ratios));
      }
      var newWidth = width * ratio;
      var newHeight = height * ratio;

      // Make sure the ratio respect min size if we need to resize down the image
      if (newWidth < minWidth || newHeight < minHeight) {
        var minWRatio = minWidth / width;
        var minHRatio = minHeight / height;
        var _ratios = [minWRatio, minHRatio].filter(function (ratio) {
          return ratio < 1;
        });
        ratio = _ratios.length > 0 ? Math.max.apply(Math, _toConsumableArray(_ratios)) : 1;
        newWidth = width * ratio;
        newHeight = height * ratio;
      }
      var sourceWidth = newWidth > maxWidth ? maxWidth / ratio : width;
      var sourceHeight = newHeight > maxHeight ? maxHeight / ratio : height;
      var x = 0;
      var y = 0;

      // if needed, offset the exceeding part on the x axis
      if (newWidth > maxWidth) {
        x = (width - sourceWidth) / 2;
        newWidth = maxWidth;
      }

      // if needed, offset the exceeding part on the y axis
      if (newHeight > maxHeight) {
        y = (height - sourceHeight) / 2;
        newHeight = maxHeight;
      }
      canvas.width = newWidth;
      canvas.height = newHeight;
      context.drawImage(image, x, y, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      var metadata = [{
        name: "metadata[quality]",
        value: String(options.quality)
      }];
      if (exif && exif.lat && exif.lon) {
        metadata.push({
          name: "metadata[lat]",
          value: exif.lat
        }, {
          name: "metadata[lon]",
          value: exif.lon
        });
      }
      canvas.toBlob(function (blob) {
        if (!blob) {
          reject("default");
        } else {
          // Rename file with correct extension
          var nameSplit = file.name.split(".");
          nameSplit.pop();
          var nameParts = [].concat(_toConsumableArray(nameSplit), [blob.type.replace("image/", "")]);
          var newFile = new File([blob], nameParts.join("."), {
            type: blob.type
          });
          resolve({
            file: newFile,
            metadata: metadata
          });
        }
      }, options.outputType, options.quality);
    };
    var reader = new FileReader();
    reader.onload = function (event) {
      var result = event.target.result;
      var urlCreator = window.URL || window.webkitURL;
      if (result && typeof result !== "string") {
        var Data = ExifParserFactory.create(result).parse();
        if (Data && Data.tags.GPSLatitude && Data.tags.GPSLongitude) {
          var lat = String(Data.tags.GPSLatitude);
          var lon = String(Data.tags.GPSLongitude);
          exif = {
            lat: lat,
            lon: lon
          };
        }
      }
      image.src = urlCreator.createObjectURL(file);
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Optimize a file
 * Handle validation error
 * @param blob
 * @param options
 * @returns a promise resolving to a new file and is metadata (otherwise a validation error)
 */
export var imagePrepare = function imagePrepare(blob, options) {
  return new Promise(/*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee(resolve, reject) {
      var imageOptions, file;
      return _regeneratorRuntime.wrap(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            imageOptions = _objectSpread({
              name: "file",
              maxSize: 20971520,
              allowedTypes: ["image/jpeg", "image/png"],
              outputType: "image/jpeg",
              quality: 0.75,
              orientationAllowed: true,
              autoCrop: false,
              lessCrop: true
            }, options);
            file = new File([blob], imageOptions.name, {
              type: blob.type
            });
            if (!isFileTypeValid(file, imageOptions.allowedTypes)) {
              reject("invalid_filetype");
            }
            if (!isFileSizeValid(file, imageOptions.maxSize)) {
              reject("invalid_filesize");
            }
            resizeAndConvert(file, imageOptions).then(function (res) {
              resolve(res);
            }).catch(function (e) {
              reject(e);
            });
          case 1:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x, _x2) {
      return _ref5.apply(this, arguments);
    };
  }());
};
//# sourceMappingURL=prepare.js.map