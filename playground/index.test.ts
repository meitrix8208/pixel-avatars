import { describe, expect, it } from "vitest";
import { generateImage } from "../src/index";

describe("generateImage", () => {
  it("should generate an image", async () => {
    const image = await generateImage({
      colors: 3,
      width: 1024,
      height: 1024,
      pheight: 8,
      pwidth: 8,
    });

    await image.toFile("./playground/output.png");
    const meta = await image.metadata();
    expect(meta.width).toBe(1024);
  });
});
