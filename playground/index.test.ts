import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generateImage } from "../src/index";

// Create output directory if it doesn't exist
const outputDir = path.resolve("./playground/test-output");
beforeAll(() => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
});

// Clean up test files after all tests
afterAll(() => {
  // Comment this out if you want to keep the generated test images
  // fs.rmSync(outputDir, { recursive: true, force: true });
});

describe("generateImage", () => {
  it("generates an image with default parameters", async () => {
    const outputPath = path.join(outputDir, "default.png");
    const image = await generateImage({
      filename: outputPath,
    });

    const metadata = await image.metadata();
    expect(metadata.width).toBe(256);
    expect(metadata.height).toBe(256);
    expect(metadata.channels).toBe(4); // RGBA
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it("respects custom dimensions", async () => {
    const outputPath = path.join(outputDir, "custom-dimensions.png");
    const image = await generateImage({
      width: 512,
      height: 384,
      filename: outputPath,
    });

    const metadata = await image.metadata();
    expect(metadata.width).toBe(512);
    expect(metadata.height).toBe(384);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it("produces deterministic output with the same seed", async () => {
    const seed = "test-deterministic-seed";
    const outputPath1 = path.join(outputDir, "deterministic-1.png");
    const outputPath2 = path.join(outputDir, "deterministic-2.png");

    await generateImage({
      seed,
      filename: outputPath1,
    });

    await generateImage({
      seed,
      filename: outputPath2,
    });

    const buffer1 = await fs.promises.readFile(outputPath1);
    const buffer2 = await fs.promises.readFile(outputPath2);

    expect(buffer1.equals(buffer2)).toBe(true);
  });

  it("produces different output with different seeds", async () => {
    const outputPath1 = path.join(outputDir, "different-seed-1.png");
    const outputPath2 = path.join(outputDir, "different-seed-2.png");

    await generateImage({
      seed: "seed-one",
      filename: outputPath1,
    });

    await generateImage({
      seed: "seed-two",
      filename: outputPath2,
    });

    const buffer1 = await fs.promises.readFile(outputPath1);
    const buffer2 = await fs.promises.readFile(outputPath2);

    expect(buffer1.equals(buffer2)).toBe(false);
  });

  it("handles high color count", async () => {
    const outputPath = path.join(outputDir, "high-colors.png");
    const image = await generateImage({
      colors: 10,
      filename: outputPath,
    });

    expect(fs.existsSync(outputPath)).toBe(true);
    const metadata = await image.metadata();
    expect(metadata.width).toBe(256);
  });

  it("creates symmetrical patterns", async () => {
    const outputPath = path.join(outputDir, "symmetry-test.png");
    await generateImage({
      width: 100,
      height: 100,
      filename: outputPath,
    });

    const image = sharp(outputPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // Check horizontal symmetry by comparing left and right sides
    let symmetrical = true;
    const channels = info.channels;

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width / 2; x++) {
        const leftPixelOffset = (y * info.width + x) * channels;
        const rightPixelOffset = (y * info.width + (info.width - 1 - x)) * channels;

        // Compare RGB values (ignore alpha if present)
        for (let c = 0; c < Math.min(3, channels); c++) {
          if (data[leftPixelOffset + c] !== data[rightPixelOffset + c]) {
            symmetrical = false;
            break;
          }
        }
        if (!symmetrical)
          break;
      }
      if (!symmetrical)
        break;
    }

    expect(symmetrical).toBe(true);
  });

  it("can generate small patterns", async () => {
    const outputPath = path.join(outputDir, "small-pattern.png");
    const image = await generateImage({
      pwidth: 4,
      pheight: 4,
      filename: outputPath,
    });

    expect(fs.existsSync(outputPath)).toBe(true);
    const metadata = await image.metadata();
    expect(metadata.width).toBe(256);
  });

  it("can generate large patterns", async () => {
    const outputPath = path.join(outputDir, "large-pattern.png");
    const image = await generateImage({
      pwidth: 32,
      pheight: 32,
      filename: outputPath,
    });

    expect(fs.existsSync(outputPath)).toBe(true);
    const metadata = await image.metadata();
    expect(metadata.width).toBe(256);
  });

  it("returns a valid Sharp instance for further processing", async () => {
    const image = await generateImage({});

    // Test that we can chain Sharp operations
    const processedImage = await image
      .resize(128, 128)
      .grayscale()
      .toBuffer();

    expect(processedImage).toBeInstanceOf(Buffer);
    expect(processedImage.length).toBeGreaterThan(0);
  });
});
