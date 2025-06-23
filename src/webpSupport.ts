/**
 * Determines if webp is supported by the browser
 * @returns a promise resolving to a boolean to know if webp is supported
 */
export const isWebpSupported = (): Promise<Boolean> => {
  return new Promise<Boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 2 && img.height === 1);
    img.onerror = () => resolve(false);
    img.src = "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==";
  });
}

  /**
   * Determines if webp conversion with canvas is supported by the browser
   * @returns a boolean to know if webp conversion is supported
   */
  export const isWebpConversionSupported = (): Boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').match('image/webp') !== null;
  }