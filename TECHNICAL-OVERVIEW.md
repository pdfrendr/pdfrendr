# PDFRendr Technical Overview

## Architecture

PDFRendr converts PDF pages to images and rebuilds clean PDFs:

1. **Parse** original PDF with PDF.js
2. **Render** each page as PNG image  
3. **Rebuild** new PDF with only images (using PDF-lib)
4. **Detect** and report removed dynamic objects

This preserves visual content while eliminating dynamic elements.

## Implementation

### Core Components

```
┌─────────────────┐
│   Entry Points  │  Node.js / Browser APIs
├─────────────────┤
│   PDF Processor │  Core processing logic
├─────────────────┤
│   PDF.js Adapter│  Platform-specific rendering
├─────────────────┤
│   Detection     │  Dynamic object identification
└─────────────────┘
```

### Processing Flow

1. **Parse** PDF with PDF.js adapter
2. **Render** each page to PNG images
3. **Detect** dynamic objects in original PDF
4. **Rebuild** clean PDF with images only
5. **Return** processed PDF + analysis report

## Detection System

PDFRendr identifies 17 types of dynamic objects:

**Code Execution**
- `/JavaScript`, `/JS` - JavaScript code
- `/Launch` - External program execution  
- `/Named` - Predefined actions

**Data & Navigation**  
- `/SubmitForm` - Form data submission
- `/URI` - External links
- `/GoTo` - Navigation actions

**File Embedding**
- `/EmbeddedFile`, `/Filespec` - Hidden files
- `/RichMedia`, `/Sound`, `/Movie` - Media content

**Interactive Elements**
- `/AA`, `/A` - Action triggers  
- `/XFA` - Dynamic forms
- `/Sig`, `/ByteRange` - Digital signatures

**Font Embedding**
- `/Type1`, `/CFF`, `/TrueType` - Custom fonts

All patterns are detected simultaneously for comprehensive analysis.

## Performance

- **Memory**: ~3-5x input file size during processing  
- **Speed**: 1-3 seconds per page typically
- **Output Size**: 2-10x larger (images vs text/vectors)

## Platform Details

### Node.js
- Uses `pdfjs-dist` for parsing
- Requires `node-canvas` for image rendering (optional)
- Returns ArrayBuffer results

### Browser  
- Uses `pdfjs-dist` with `pdf.worker.min.js`
- HTML5 Canvas for rendering
- File API for input/output

## Integration Tips

```javascript
// Error handling
try {
  const result = await processPDF(buffer, { timeoutMs: 10000 });
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout
  }
}

// Batch processing
const results = await Promise.all(
  files.map(file => processPDF(file.buffer))
);
```

## Dependencies

- **PDF.js** - PDF parsing and rendering
- **PDF-lib** - PDF document creation  
- **node-canvas** - Node.js image support (optional)