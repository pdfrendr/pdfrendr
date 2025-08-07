# PDFRendr Technical Overview

## Core Approach

PDFRendr processes PDFs using an image-based reconstruction approach:

1. **PDF Parsing** - Uses PDF.js to parse the input PDF structure
2. **Image Conversion** - Renders each page as a high-quality PNG image  
3. **PDF Rebuilding** - Creates a new PDF document containing only the rendered images
4. **Dynamic Object Exclusion** - JavaScript, forms, and embedded content are not transferred to the new document

This approach ensures that the visual content is preserved while dynamic elements are excluded from the output.

## Architecture

### Modular Design

```
┌─────────────────┐
│   Entry Points  │  (index.ts, browser-only.ts)
├─────────────────┤
│   Core Engine   │  (pdf-processor.ts)
├─────────────────┤
│   Adapters      │  (node-adapter.ts, pdfjs-adapter.ts)
├─────────────────┤
│   Detection     │  (pdf-objects.ts)
└─────────────────┘
```

- **Entry Points**: Platform-specific APIs (Node.js vs Browser)
- **Core Engine**: Platform-agnostic processing logic
- **Adapters**: PDF.js integration for different environments
- **Detection**: Dynamic object identification logic

### Processing Pipeline

1. **Input Validation** - Verify PDF format and size limits
2. **Content Extraction** - Parse PDF structure using platform adapter
3. **Page Rendering** - Convert each page to PNG image data
4. **Document Reconstruction** - Build new PDF with image content only
5. **Dynamic Object Analysis** - Report what types of objects were excluded
6. **Output Generation** - Return processed PDF with metadata

## Dynamic Object Detection

PDFRendr employs a comprehensive 17-pattern detection system that identifies distinct threat categories:

### JavaScript Execution Vectors
- **JavaScript actions** (`/JavaScript`) - Full execution contexts with arbitrary code capability
- **JavaScript objects** (`/JS`) - Short-form JavaScript declarations and handlers

### Navigation & Action Mechanisms
- **Form submission actions** (`/SubmitForm`) - Data exfiltration to external endpoints
- **External links** (`/URI`) - Redirect vectors to malicious websites  
- **GoTo actions** (`/GoTo`) - Document navigation manipulation
- **Launch actions** (`/Launch`) - External program execution capability
- **Named actions** (`/Named`) - Predefined operations (print, close, etc.)

### File & Media Containers
- **Embedded files** (`/EmbeddedFile`) - Hidden file attachment mechanisms
- **File specifications** (`/Filespec`) - File reference and access frameworks
- **Rich media** (`/RichMedia`) - Flash content and multimedia exploit vectors
- **Sound objects** (`/Sound`) - Audio file containers with potential exploits
- **Movie objects** (`/Movie`) - Video file containers and playback mechanisms

### Interactive Components
- **Additional actions** (`/AA`) - Automatic trigger mechanisms on events
- **Action objects** (`/A`) - General action frameworks and handlers
- **XFA forms** (`/XFA`) - XML-based dynamic form structures

### Authentication & Typography
- **Digital signatures** (`/Sig`) - Signature object containers
- **Signature fields** (`/ByteRange`) - Signature validation metadata and ranges
- **Type1 fonts** (`/Type1`) - PostScript font embedding with potential exploits
- **CFF fonts** (`/CFF`) - Compact Font Format structures  
- **TrueType fonts** (`/TrueType`) - TrueType font embedding mechanisms

Each pattern is detected independently, ensuring comprehensive coverage where multiple threat types can coexist in a single document.

## Processing Options

### Render Quality
- **Range**: 1.0 - 4.0
- **Default**: 2.0  
- **Effect**: Higher values produce better visual quality but larger files
- **Implementation**: Controls PDF.js viewport scaling during rendering

### Compression Level
- **Range**: 0 - 3
- **Default**: 2
- **Effect**: Higher values reduce file size but may affect quality
- **Implementation**: Controls PDF-lib compression settings

## Platform Implementations

### Node.js Environment
- **PDF.js**: Uses `pdfjs-dist/legacy/build/pdf.js`
- **Canvas**: Requires `node-canvas` for image rendering
- **Worker**: Not required (synchronous processing)
- **File I/O**: Direct filesystem access

### Browser Environment  
- **PDF.js**: Uses standard `pdfjs-dist` build
- **Canvas**: Uses HTML5 Canvas API
- **Worker**: Requires `pdf.worker.min.js` for performance
- **File I/O**: Uses File API and Blob/ArrayBuffer

## Security Considerations

### Limitations

**Critical Limitation**: PDFRendr still uses PDF.js to parse the original PDF, which means:
- The same attack surface exists during the parsing phase
- Zero-day PDF vulnerabilities could still be triggered
- Malicious PDFs are processed before being reconstructed

### Attack Surface Reduction

The image-based reconstruction approach helps with:
- **Static Analysis**: Output PDFs contain only image data
- **Behavioral Analysis**: No executable content in processed files
- **Sandboxing**: Easier to analyze image-only PDFs safely

### Detection Limitations

- **Obfuscated Objects**: Encoded or compressed dynamic content may not be detected
- **Structural Variations**: Non-standard PDF structures might bypass detection
- **Zero-day Objects**: Unknown dynamic object types won't be identified

## Performance Characteristics

### Processing Time
- **Typical**: 100-2000ms for standard documents
- **Factors**: Page count, complexity, render quality
- **Scaling**: Linear with page count

### Memory Usage
- **Peak**: ~3-5x input file size during processing
- **Factors**: Render quality, page dimensions
- **Cleanup**: Automatic garbage collection after processing

### Output Size
- **Typical**: 50-200% of original size (depends on content)
- **Factors**: Render quality, compression level, original content type
- **Trade-off**: Higher quality = larger files

## Error Handling

### Common Failure Modes
- **Corrupted PDFs**: Invalid PDF structure
- **Memory Limits**: Large files exceeding available memory
- **Timeout**: Processing exceeding configured limits
- **Worker Issues**: PDF.js worker loading failures (browser)

### Recovery Strategies
- **Validation**: Early input validation to catch invalid files
- **Limits**: Configurable timeouts and memory limits
- **Fallbacks**: Graceful degradation for processing failures
- **Logging**: Detailed error reporting for debugging

## Dependencies

### Core Libraries
- **PDF.js**: PDF parsing and rendering
- **PDF-lib**: PDF document creation
- **Canvas** (Node.js): Image rendering support

### Optional Dependencies
- **node-canvas**: Required for Node.js image rendering
- **Worker files**: Required for browser performance

## Build Process

### Target Environments
- **Node.js**: CommonJS and ESM builds
- **Browser**: UMD and ESM builds  
- **Demo**: Bundled demo application

### Optimization
- **Tree Shaking**: Unused code elimination
- **Bundling**: Platform-specific builds
- **Compression**: Gzipped distribution files