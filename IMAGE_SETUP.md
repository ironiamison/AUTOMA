# Logo Image Setup

## Current Setup

The site is configured to use `logo.png` in the root directory.

## To Use Your Logo Image

1. Place your PNG image file in the root directory as `logo.png`
   - Path: `/Users/jamison/new new/logo.png`
   - Format: PNG (with transparent background)
   - Recommended size: At least 256x256px for best quality

2. The image will automatically appear:
   - In the navbar on all pages (28x28px)
   - On the homepage hero section (80x80px)

## Image Requirements

- **Format**: PNG (supports transparency)
- **Background**: Transparent (will work on any background)
- **Size**: Any size (will be scaled by CSS)
- **Name**: `logo.png` (must be in root directory)

## Alternative Locations

If you want to use a different path, update these files:
- All HTML files: Change `src="./logo.png"` to your path
- Or place the image in `public/` folder and use `src="./public/logo.png"`

## CSS Styling

The logo is styled with:
- `object-fit: contain` - Maintains aspect ratio
- `background: transparent` - Preserves transparency
- Responsive sizing for navbar and hero

