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
 * Optimize a file
 * Handle validation error
 * @param blob
 * @param options
 * @returns a promise resolving to a new file and is metadata (otherwise a validation error)
 */
export declare const imagePrepare: (blob: Blob, options: ImagePrepareOptions) => Promise<any>;
