import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { defineCommand, runMain } from "citty";
import sharp from "sharp";

// Define interfaces for parameters
interface GenerateImageParams {
  colors?: number;
  width?: number;
  height?: number;
  pwidth?: number;
  pheight?: number;
  seed?: string;
  filename?: string;
}

/**
 * Creates an image from a pixel array.
 * @param pixels - A 3D array containing the colors of each pixel (RGB format).
 * @param imgWidth - The width of the image in pixels.
 * @param imgHeight - The height of the image in pixels.
 * @returns A promise that resolves to a Sharp instance with the created image.
 */
async function createImageFromArray(pixels: number[][][], imgWidth: number, imgHeight: number): Promise<sharp.Sharp> {
  const rawPixelData = new Uint8Array(imgWidth * imgHeight * 4); // 4 channels (RGBA)
  pixels.forEach((row, y) => {
    row.forEach((pixelRGB, x) => {
      const offset = (y * imgWidth + x) * 4;
      rawPixelData[offset] = pixelRGB[0] ?? 0; // Red
      rawPixelData[offset + 1] = pixelRGB[1] ?? 0; // Green
      rawPixelData[offset + 2] = pixelRGB[2] ?? 0; // Blue
      rawPixelData[offset + 3] = 255; // Alpha (fully opaque)
    });
  });

  return sharp(Buffer.from(rawPixelData), {
    raw: { width: imgWidth, height: imgHeight, channels: 4 },
  });
}

/**
 * Writes an image to a file.
 * @param fileName - The path to the file to save the image. If null, it does not save.
 * @param image - Sharp instance containing the image.
 * @returns A promise that resolves to true if the image was saved, false otherwise.
 */
async function writeImage(fileName: string | null, image: sharp.Sharp): Promise<boolean> {
  if (fileName) {
    await image.toFile(fileName);
    return true;
  }
  return false;
}

/**
 * Generates a list of RGB colors.
 * @param hash - An object containing the initial hash value.
 * @param hash.val - The initial hash string value.
 * @param colorsCounter - The number of colors to generate.
 * @returns A list of colors in RGB format.
 */
function generateColors(hash: { val: string }, colorsCounter: number): number[][] {
  const imgColors: number[][] = [];
  hash.val = createHash("md5").update(hash.val).digest("hex");
  for (let i = 0; i < colorsCounter; i++) {
    const sliceInd = i % 5; // 32 chars in hash, 6 chars per color
    const offset = sliceInd * 6;
    imgColors.push([
      Number.parseInt((hash.val?.[offset + 0] ?? "0") + (hash.val?.[offset + 1] ?? "0"), 16), // red
      Number.parseInt((hash.val?.[offset + 2] ?? "0") + (hash.val?.[offset + 3] ?? "0"), 16), // green
      Number.parseInt((hash.val?.[offset + 4] ?? "0") + (hash.val?.[offset + 5] ?? "0"), 16), // blue
    ]);
    if (sliceInd === 0 && i !== 0) {
      hash.val = createHash("md5").update(hash.val).digest("hex");
    }
  }
  return imgColors;
}

/**
 * Generates a pixel matrix based on a pattern.
 * @param hash - An object containing the initial hash value.
 * @param hash.val - The initial hash string value.
 * @param imgColors - A list of colors in RGB format.
 * @param imgHeight - The height of the image in pixels.
 * @param imgWidth - The width of the image in pixels.
 * @param patternHeight - The height of the pattern in cells.
 * @param patternWidth - The width of the pattern in cells.
 * @returns A 3D pixel array (RGB format).
 */
function generatePatternPixels(
  hash: { val: string },
  imgColors: number[][],
  imgHeight: number,
  imgWidth: number,
  patternHeight: number,
  patternWidth: number,
): number[][][] {
  hash.val = createHash("md5").update(hash.val).digest("hex");

  const cellWidth = Math.ceil(imgWidth / (2 * patternWidth));
  const cellHeight = Math.ceil(imgHeight / patternHeight);
  const colorsCounter = imgColors.length;

  const pixels: number[][][] = Array.from({ length: imgHeight }, () =>
    Array.from({ length: imgWidth }, () => imgColors[0] ?? [0, 0, 0]));

  for (let epoch = 0; epoch <= patternHeight; epoch += 4) {
    hash.val = createHash("md5").update(hash.val).digest("hex");
    for (let i = 0; i < hash.val.length; i++) {
      const int = Number.parseInt(hash.val[i] ?? "0", 16);

      const x = i % patternWidth;
      const y = epoch + Math.floor(i / patternWidth);

      if (x >= patternWidth || y >= patternHeight)
        break;

      for (let xImg = x * cellWidth; xImg < x * cellWidth + cellWidth; xImg++) {
        if (xImg >= imgWidth)
          break;
        for (let yImg = y * cellHeight; yImg < y * cellHeight + cellHeight; yImg++) {
          if (yImg >= imgHeight)
            break;
          const cellColor = imgColors[Math.floor((int / 16) * colorsCounter)];
          if (cellColor) {
            // @ts-expect-error El objeto es posiblemente "undefined".
            pixels[yImg][xImg] = cellColor; // El objeto es posiblemente "undefined".
            // @ts-expect-error El objeto es posiblemente "undefined".
            pixels[yImg][imgWidth - 1 - xImg] = cellColor; // El objeto es posiblemente "undefined".
          }
        }
      }
    }
  }
  return pixels;
}

/**
 * Generates an image based on provided parameters.
 * @param params - Parameters for generating the image.
 * @returns A promise that resolves to a Sharp instance with the generated image.
 */
export async function generateImage(params: GenerateImageParams): Promise<sharp.Sharp> {
  const { colors = 2, width = 256, height = 256, pwidth = 16, pheight = 16, seed, filename } = params;
  const hash = { val: createHash("md5").update(seed || Math.random().toString()).digest("hex") };
  const imgColors = generateColors(hash, colors);
  const pixels = generatePatternPixels(hash, imgColors, height, width, pheight, pwidth / 2);
  const image = await createImageFromArray(pixels, width, height);
  if (filename)
    await writeImage(filename, image);
  return image;
}

/** CLI Definition */
const main = defineCommand({
  meta: {
    name: "image-generator",
    version: "1.0.0",
    description: "Generate patterned images based on a seed",
  },
  args: {
    colors: { type: "string", description: "Number of colors", required: false },
    width: { type: "string", description: "Width of the image", required: false },
    height: { type: "string", description: "Height of the image", required: false },
    pwidth: { type: "string", description: "Pattern width", required: false },
    pheight: { type: "string", description: "Pattern height", required: false },
    seed: { type: "string", description: "Seed for the image generator", required: false },
    filename: { type: "string", description: "Output file name", required: false },
  },
  async run({ args }) {
    try {
      await generateImage({
        colors: Number.parseInt(args.colors ?? "2", 10),
        width: Number.parseInt(args.width ?? "256", 10),
        height: Number.parseInt(args.height ?? "256", 10),
        pwidth: Number.parseInt(args.pwidth ?? "16", 10),
        pheight: Number.parseInt(args.pheight ?? "16", 10),
        seed: args.seed,
        filename: args.filename,
      });
      console.info("Image generated successfully!");
    }
    catch (err) {
      console.error("Error generating image:", err);
    }
  },
});

runMain(main);
