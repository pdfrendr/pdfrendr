# PDFRendr

**Convert PDFs to images and rebuild them as clean PDFs**

![PDFRendr Logo](assets/logo.png)

PDFRendr processes PDFs by converting each page to an image and rebuilding the document. This approach removes dynamic objects (JavaScript, forms, embedded files) while preserving the visual appearance exactly as you see it.

## ✨ Features

- 🔒 **Privacy First** - All processing happens locally
- 🛡️ **Dynamic Object Removal** - Eliminates JavaScript, forms, embedded files
- 📄 **Visual Preservation** - Maintains exact visual appearance
- ⚡ **Fast Processing** - Efficient browser-based rendering
- 🌐 **Cross-platform** - Works in browser and Node.js

## 🚀 Quick Start

### Installation

```bash
npm install pdfrendr
```

### Node.js Usage

```javascript
import { sanitizePDF } from 'pdfrendr';

const fs = require('fs');
const inputPdf = fs.readFileSync('input.pdf');

const result = await sanitizePDF(inputPdf.buffer, {
  renderQuality: 2.0,  // 1.0-4.0
  compressionLevel: 2  // 0-3
});

if (result.processedPdf) {
  fs.writeFileSync('output.pdf', result.processedPdf);
  console.log(`Processed ${result.removedObjects.length} dynamic objects`);
}
```

### Browser Usage

```javascript
import { PDFRenderer } from 'pdfrendr/browser';

const renderer = new PDFRenderer({
  renderQuality: 2.0
});

const result = await renderer.render(pdfArrayBuffer);

if (result.processedPdf) {
  // Download processed PDF
  const blob = new Blob([result.processedPdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  // ... download logic
}
```

## ⚙️ Configuration

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `renderQuality` | number | 2.0 | Rendering quality (1.0-4.0) |
| `compressionLevel` | number | 2 | PDF compression level (0-3) |

### Result Object

```javascript
{
  processedPdf: ArrayBuffer,     // The processed PDF data
  removedObjects: string[],      // List of detected dynamic objects
  originalSize: number,          // Original file size in bytes  
  processedSize: number,         // Processed file size in bytes
  processingTimeMs: number       // Processing time in milliseconds
}
```

## 🔍 How It Works

1. **Parse PDF** - Uses PDF.js to parse the original document
2. **Convert to Images** - Renders each page as a high-quality image
3. **Rebuild PDF** - Creates a new PDF using only the image content
4. **Remove Dynamic Objects** - JavaScript, forms, and embedded content are excluded

This approach ensures maximum compatibility while removing potentially dangerous dynamic content.

## 🚨 Dynamic Objects Detected

PDFRendr employs comprehensive detection across 17 distinct patterns:

### JavaScript Threats
- **JavaScript actions** (`/JavaScript`) - Full JavaScript execution contexts
- **JavaScript objects** (`/JS`) - Short-form JavaScript object declarations

### Navigation & Actions  
- **Form submission actions** (`/SubmitForm`) - Data exfiltration attempts
- **External links** (`/URI`) - Malicious redirect vectors
- **GoTo actions** (`/GoTo`) - Document navigation manipulation
- **Launch actions** (`/Launch`) - External program execution
- **Named actions** (`/Named`) - Predefined dangerous operations

### File & Media Embedding
- **Embedded files** (`/EmbeddedFile`) - Hidden file attachments
- **File specifications** (`/Filespec`) - File reference frameworks
- **Rich media** (`/RichMedia`) - Flash/multimedia exploit vectors
- **Sound objects** (`/Sound`) - Audio file containers
- **Movie objects** (`/Movie`) - Video file containers

### Interactive Elements
- **Additional actions** (`/AA`) - Automatic trigger mechanisms
- **Action objects** (`/A`) - General action object frameworks
- **XFA forms** (`/XFA`) - XML-based dynamic form structures

### Signatures & Fonts
- **Digital signatures** (`/Sig`) - Signature object containers
- **Signature fields** (`/ByteRange`) - Signature validation metadata
- **Type1 fonts** (`/Type1`) - PostScript font embedding
- **CFF fonts** (`/CFF`) - Compact Font Format structures  
- **TrueType fonts** (`/TrueType`) - TrueType font embedding


## 📚 Examples

See the `examples/` directory for complete implementations:

- **Node.js CLI** - Command-line PDF processing
- **Express Server** - HTTP API for PDF processing  
- **Browser Client** - Client-side PDF processing

## 🔧 Development

```bash
# Install dependencies
npm install

# Build for Node.js
npm run build

# Build for browser
npm run build:browser

# Build demo
npm run build:demo

# Run tests
npm test
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF parsing library
- [PDF-lib](https://pdf-lib.js.org/) - PDF generation library
- [Intezer](https://intezer.com/blog/malware-analysis/malicious-pdf-analysis-ebook/) - PDF malware analysis insights