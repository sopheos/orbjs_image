import { ExifParserFactory } from "ts-exif-parser";

interface metadata {
  name: string;
  value: string | Blob;
  fileName?: string;
}

export interface ImagePrepareOptions {
  /**
   * File name
   * @default 'file'
   */
  name?: string;

  /**
   * Max File Size
   * @default 20971520
   */
  maxSize?: number;

  /**
   * Image AllowedTypes Format types MIME
   * @default ['image/jpeg', 'image/png']
   */
  allowedTypes?: Array<string>;

  /**
   * Image AllowedTypes Format types MIME
   * @default 'image/jpeg'
   */
  outputType?: string;

  /**
   * Compression quality of the jpeg conversion
   * @default 0.75
   */
  quality?: number;

  /** Max width of the image. If to big, image is resized */
  maxWidth?: number;

  /** Max height of the image. If to big, image is resized */
  maxHeight?: number;

  /** Min width of the image. If to small, throw an error */
  minWidth?: number;

  /** Min height of the image. If to small, throw an error */
  minHeight?: number;

  /**
   * If true, the max/min Width & Height are interchangeables for validation & resize.
   * @default true
   */
  orientationAllowed?: boolean;

  /**
   * If true, the exceeding part will be crop.
   * @default false
   */
  autoCrop?: boolean;

  /**
   * Resize strategy when the picture is too big (keep the ratio)
   * False => Biggest pictures possible, max resolution but can crop a huge part of the picture
   * True => Keep the most of the picture, min crop but can drop the quality of the picture
   * @default true
   */
  lessCrop?: boolean;
}

/**
 * Check if allowed type
 * @param image
 * @param options
 * @returns boolean
 */
const isFileTypeValid = (file: File, allowedTypes: Array<string>) => {
  return (
    !allowedTypes ||
    allowedTypes.some((allowedType) => allowedType === file.type)
  );
};

/**
 * Check if file is too heavy
 * @param image
 * @param options
 * @returns boolean
 */
const isFileSizeValid = (file: File, maxSize: number) => {
  return !maxSize || file.size < maxSize;
};

/**
 * Check if image is big enough
 * @param image
 * @param options
 * @returns boolean
 */
const isImageMinSizeValid = (
  image: HTMLImageElement,
  options: ImagePrepareOptions
) => {
  return (
    !(options.minWidth && options.minHeight) ||
    (image.width >= options.minWidth && image.height >= options.minHeight)
  );
};

/**
 * Check if image is small enough
 * @param image
 * @param options
 * @returns boolean
 */
const isImageMaxSizeValid = (
  image: HTMLImageElement,
  options: ImagePrepareOptions
) => {
  return (
    !(options.maxWidth && options.maxHeight) ||
    (image.width <= options.maxWidth && image.height <= options.maxHeight)
  );
};

/**
 * If orientationAllowed, handle big side/small side instead of width/height
 * @param image
 * @param options
 */
const handleOrientationAllowed = (
  image: HTMLImageElement,
  options: ImagePrepareOptions
) => {
  if (!options.orientationAllowed) return;

  // handle max size. If image is wider than higher we make sur that maxWidth is bigger than maxHeight
  // if not we swap max size
  if (options.maxHeight && options.maxWidth) {
    if (image.width > image.height) {
      if (options.maxHeight > options.maxWidth) {
        [options.maxHeight, options.maxWidth] = [
          options.maxWidth,
          options.maxHeight,
        ];
      }
    } else if (options.maxHeight < options.maxWidth) {
      [options.maxHeight, options.maxWidth] = [
        options.maxWidth,
        options.maxHeight,
      ];
    }
  }

  // handle min size. If image is wider than higher we make sur that minWidth is bigger than minHeight
  // if not we swap min size
  if (options.minHeight && options.minWidth) {
    if (image.width > image.height) {
      if (options.minHeight > options.minWidth) {
        [options.minHeight, options.minWidth] = [
          options.minWidth,
          options.minHeight,
        ];
      }
    } else if (options.minHeight < options.minWidth) {
      [options.minHeight, options.minWidth] = [
        options.minWidth,
        options.minHeight,
      ];
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
const resizeAndConvert = (
  file: File,
  options: ImagePrepareOptions
): Promise<any> => {
  return new Promise((resolve, reject) => {
    let exif: any;

    const image = document.createElement("img");
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      let { width, height } = image;

      handleOrientationAllowed(image, options);

      if (!isImageMinSizeValid(image, options)) {
        reject("minsize");
      }

      if (!options.autoCrop && !isImageMaxSizeValid(image, options)) {
        reject("maxsize");
      }

      // if no max/min size, set max/min size to width/height
      const {
        maxWidth = width,
        maxHeight = height,
        minWidth = width,
        minHeight = height,
        lessCrop,
      } = options;

      // Define ratio to have the biggest image allowed
      const maxWRatio = maxWidth / width;
      const maxHRatio = maxHeight / height;
      const ratios = [maxWRatio, maxHRatio].filter((ratio) => ratio < 1);
      let ratio = 1;
      if (ratios.length > 0) {
        ratio = lessCrop ? Math.min(...ratios) : Math.max(...ratios);
      }
      let newWidth = width * ratio;
      let newHeight = height * ratio;

      // Make sure the ratio respect min size if we need to resize down the image
      if (newWidth < minWidth || newHeight < minHeight) {
        const minWRatio = minWidth / width;
        const minHRatio = minHeight / height;
        const ratios = [minWRatio, minHRatio].filter((ratio) => ratio < 1);
        ratio = ratios.length > 0 ? Math.max(...ratios) : 1;
        newWidth = width * ratio;
        newHeight = height * ratio;
      }

      let sourceWidth = newWidth > maxWidth ? maxWidth / ratio : width;
      let sourceHeight = newHeight > maxHeight ? maxHeight / ratio : height;
      let x = 0;
      let y = 0;

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
      context.drawImage(
        image,
        x,
        y,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const metadata: Array<metadata> = [
        {
          name: "metadata[quality]",
          value: String(options.quality),
        },
      ];

      if (exif && exif.lat && exif.lon) {
        metadata.push(
          {
            name: "metadata[lat]",
            value: exif.lat,
          },
          {
            name: "metadata[lon]",
            value: exif.lon,
          }
        );
      }

      canvas.toBlob(
        (blob: Blob | null): void => {
          if (!blob) {
            reject("default");
          } else {
            // Rename file with correct extension
            const nameSplit = file.name.split(".");
            nameSplit.pop();

            const nameParts = [...nameSplit, blob.type.replace("image/", "")];
            const newFile = new File([blob], nameParts.join("."), {
              type: blob.type,
            });

            resolve({
              file: newFile,
              metadata,
            });
          }
        },
        options.outputType,
        options.quality
      );
    };

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target!.result;

      const urlCreator = window.URL || window.webkitURL;

      if (result && typeof result !== "string") {
        const Data = ExifParserFactory.create(result).parse();
        if (Data && Data.tags!.GPSLatitude && Data.tags!.GPSLongitude) {
          const lat = String(Data.tags!.GPSLatitude);
          const lon = String(Data.tags!.GPSLongitude);
          exif = { lat, lon };
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
export const imagePrepare = (
  blob: Blob,
  options: ImagePrepareOptions
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const imageOptions = {
      name: "file",
      maxSize: 20971520,
      allowedTypes: ["image/jpeg", "image/png"],
      outputType: "image/jpeg",
      quality: 0.75,
      orientationAllowed: true,
      autoCrop: false,
      lessCrop: true,
      ...options,
    };

    const file = new File([blob], imageOptions.name, { type: blob.type });

    if (!isFileTypeValid(file, imageOptions.allowedTypes)) {
      reject("invalid_filetype");
    }

    if (!isFileSizeValid(file, imageOptions.maxSize)) {
      reject("invalid_filesize");
    }

    resizeAndConvert(file, imageOptions)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
