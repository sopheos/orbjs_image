
  /**
   * Detect if canvas is supported
   * @returns boolean
   */
export const isCanvasSupported = (): Boolean => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const imageData = ctx.createImageData(1, 1);
      const originalImageData = imageData.data;

      originalImageData[0] = 128;
      originalImageData[1] = 128;
      originalImageData[2] = 128;
      originalImageData[3] = 255;

      ctx.putImageData(imageData, 1, 1);

      const checkData = ctx.getImageData(1, 1, 1, 1).data;

      return (
        originalImageData[0] === checkData[0] &&
        originalImageData[1] === checkData[1]
      );
    }
  } catch {
    return false;
  }
  return true;
}