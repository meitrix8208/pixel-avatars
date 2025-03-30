# Pixel Avatars

[![npm version](https://img.shields.io/npm/v/pixel-avatars.svg)](https://www.npmjs.com/package/pixel-avatars)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A simple, customizable pixel avatar generator for Node.js applications.

## Features

- Generate symmetrical pixel avatars with customizable parameters
- Deterministic generation with seed support
- Flexible sizing and resolution options
- Works both as a CLI tool and a programmatic API
- Built with TypeScript for type safety

## Installation

```bash
# Using npm
npm install pixel-avatars

# Using yarn
yarn add pixel-avatars

# Using pnpm
pnpm add pixel-avatars
```

## Usage

### CLI

```bash
# Generate a basic avatar
npx pixel-avatars --filename=avatar.png

# Customize your avatar
npx pixel-avatars --colors=5 --width=512 --height=512 --pwidth=12 --pheight=12 --seed="your-custom-seed" --filename=custom-avatar.png
```

### API

```typescript
import { generateImage } from 'pixel-avatars';

// Generate a basic avatar
const image = await generateImage({
  filename: 'avatar.png'
});

// Generate a customized avatar
const customImage = await generateImage({
  colors: 5,         // Number of colors to use
  width: 512,        // Output image width in pixels
  height: 512,       // Output image height in pixels
  pwidth: 12,        // Pattern width (higher = more complex)
  pheight: 12,       // Pattern height (higher = more complex)
  seed: 'username',  // Deterministic seed value
  filename: 'custom-avatar.png' // Optional output filename
});

// Use with Sharp for further processing
await customImage.blur(5).toFile('blurred-avatar.png');
```

## API Reference

### `generateImage(params)`

Generates a pixel avatar and returns a Sharp instance.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `colors` | `number` | `2` | Number of colors to use in the avatar |
| `width` | `number` | `256` | Width of the output image in pixels |
| `height` | `number` | `256` | Height of the output image in pixels |
| `pwidth` | `number` | `16` | Pattern width in cells |
| `pheight` | `number` | `16` | Pattern height in cells |
| `seed` | `string` | Random | Seed for deterministic generation |
| `filename` | `string` | `null` | Output filename (if provided) |

#### Returns

`Promise<sharp.Sharp>` - A Sharp instance containing the generated image

## Development

```bash
# Clone the repository
git clone https://github.com/meitrix8208/pixel-avatars.git
cd pixel-avatars

# Install dependencies
pnpm install

# Run tests
pnpm dev

# Build the package
pnpm build
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Inspired by various pixel art generators and avatar creation tools.
