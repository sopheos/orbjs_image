/**
 * Detect if canvas is supported
 * @returns boolean
 */
export var isCanvasSupported = function isCanvasSupported() {
  try {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (ctx) {
      var imageData = ctx.createImageData(1, 1);
      var originalImageData = imageData.data;
      originalImageData[0] = 128;
      originalImageData[1] = 128;
      originalImageData[2] = 128;
      originalImageData[3] = 255;
      ctx.putImageData(imageData, 1, 1);
      var checkData = ctx.getImageData(1, 1, 1, 1).data;
      return originalImageData[0] === checkData[0] && originalImageData[1] === checkData[1];
    }
  } catch (_unused) {
    return false;
  }
  return true;
};
//# sourceMappingURL=canvasSupport.js.map