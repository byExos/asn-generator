# ASN Label Generator

A static web application for generating printable A4 PDF sheets with configurable ASN (Archive Serial Number) sticker labels. Each label contains a QR code and customizable text. All PDF generation happens in your browser - no server required!

## Features

- 🎨 **User-friendly web interface** - Configure everything through a clean UI
- 📄 **Client-side PDF generation** - Works entirely in the browser
- 👀 **Instant PDF preview** - Auto-refreshing preview while you edit settings
- 🔧 **Fully configurable**:
  - Page margins and spacing (mm)
  - Grid layout (rows and columns)
  - QR code size and error correction level
  - Starting ASN number and text template
  - Optional grid lines for alignment testing
- 📱 **Responsive design** - Works on desktop and mobile
- ⚡ **Optimized output** - Compressed PDF with right-sized QR rasters for smaller files

## Quick Start

### Development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open browser at the URL shown (usually `http://localhost:5173`)


## Usage

1. Open the web app in browser
2. Configure labels:
   - Set page margins and grid layout
   - Choose starting ASN number and quantity
   - Customize text template (use `{asn}` placeholder)
   - Adjust QR code size and error correction
   - Optionally enable grid lines for alignment testing
3. Review the instant preview (first page only)
4. Click "Generate PDF" to download the full document

Preview behavior:

- The preview updates automatically after a short debounce while typing
- For speed, preview renders only the first page using lower QR DPI
- Downloaded output renders full quantity with higher quality settings

## Configuration Options

- **Margins**: Left, right, top, bottom spacing in mm
- **Grid**: Rows and columns per page
- **Spacing**: Horizontal and vertical spacing between labels in mm
- **Starting ASN**: First ASN number to use
- **Quantity**: Total number of labels to generate (defaults to `rows × columns`, auto-updates until manually changed)
- **QR Size**: Size of QR code in mm
- **Error Correction**: L (7%), M (15%), Q (25%), or H (30%)
- **Text Template**: Single-line template, use `{asn}` for the ASN number (this full rendered text is encoded into the QR)
- **Font Size**: Text size in points
- **Show Grid**: Display grid lines around each label (helpful for alignment)