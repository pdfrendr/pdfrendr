# PDFRendr Examples

This directory contains example implementations showing how to use PDFRendr in different environments.

## 📁 Files

- **`client.html`** - Complete browser client with drag & drop interface
- **`node-cli.cjs`** - Command-line interface for Node.js
- **`server.js`** - Express-like server implementation
- **`pdfrendr.umd.cjs`** - Built PDFRendr library (UMD format)

## 🚀 Quick Start

### Browser Example

1. Open `client.html` directly in your browser
2. Drag & drop a PDF file or click to select
3. Adjust processing options as needed
4. Download the processed PDF

The browser example includes:
- ✅ Drag & drop file upload
- ✅ Processing options (quality, compression)
- ✅ Real-time progress indication
- ✅ Dynamic object detection display
- ✅ Download processed PDF
- ✅ Beautiful responsive UI

### Node.js CLI Example

```bash
node node-cli.cjs input.pdf output.pdf
```

### Server Example

```bash
node server.js
# Server runs on http://localhost:3000
```

## 🔧 Building Examples

If you modify the library source code, rebuild the UMD bundle:

```bash
npm run build:library
cp frontend/public/pdfrendr.umd.cjs examples/
```

## 📋 Features Demonstrated

All examples showcase:
- **17-Pattern Detection System** - Comprehensive threat analysis
- **Image-Only Processing** - Visual preservation with dynamic object removal
- **Configurable Options** - Quality and compression settings
- **Error Handling** - Graceful failure management
- **Performance Metrics** - Processing time and size statistics

## 🌐 Online Demo

Visit the live demo at: **https://pdfrendr.github.io**
