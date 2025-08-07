/**
 * Express server example for PDF processing
 * Simple HTTP server that accepts PDF uploads and returns processed PDFs
 */

const express = require('express');
const multer = require('multer');
const { processPDF } = require('../dist/node/index.cjs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files
app.use(express.static('public'));

// Enable JSON parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pdfrendr-api' });
});

// PDF processing endpoint
app.post('/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    console.log(`Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse options from request
    const options = {
      renderQuality: parseFloat(req.body.renderQuality) || 2.0,
      compressionLevel: parseInt(req.body.compressionLevel) || 2
    };

    // Validate options
    if (options.renderQuality < 1.0 || options.renderQuality > 4.0) {
      return res.status(400).json({ error: 'renderQuality must be between 1.0 and 4.0' });
    }

    if (options.compressionLevel < 0 || options.compressionLevel > 3) {
      return res.status(400).json({ error: 'compressionLevel must be between 0 and 3' });
    }

    console.log(`Options: quality=${options.renderQuality}x, compression=${options.compressionLevel}`);

    // Process the PDF
    const startTime = Date.now();
    const result = await processPDF(req.file.buffer, options);
    const processingTime = Date.now() - startTime;

    if (result.processedPdf) {
      console.log(`✅ Processing complete in ${processingTime}ms`);
      console.log(`📊 Size: ${req.file.size} → ${result.processedSize} bytes`);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname.replace('.pdf', '_processed.pdf')}"`);
      res.setHeader('X-Processing-Time', processingTime);
      res.setHeader('X-Original-Size', result.originalSize);
      res.setHeader('X-Processed-Size', result.processedSize);
      res.setHeader('X-Removed-Objects', (result.removedObjects || []).length);

      // Send the processed PDF
      res.send(Buffer.from(result.processedPdf));

          } else {
      console.error('❌ Processing failed');
      res.status(500).json({ error: 'PDF processing failed' });
          }
          
        } catch (error) {
    console.error('❌ Server error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get processing status/info endpoint
app.get('/info', (req, res) => {
  res.json({
    service: 'PDFRendr API',
    mode: 'visual-only',
    description: 'Converts PDFs to images and rebuilds them to remove dynamic objects',
    endpoints: {
      'POST /process-pdf': 'Process a PDF file (multipart/form-data)',
      'GET /health': 'Health check',
      'GET /info': 'Service information'
    },
    options: {
      renderQuality: {
        type: 'number',
        range: '1.0-4.0',
        default: 2.0,
        description: 'Rendering quality multiplier'
      },
      compressionLevel: {
        type: 'integer',
        range: '0-3',
        default: 2,
        description: 'PDF compression level (higher = smaller file)'
      }
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PDFRendr server running on port ${PORT}`);
  console.log(`📱 Upload endpoint: http://localhost:${PORT}/process-pdf`);
  console.log(`ℹ️  Service info: http://localhost:${PORT}/info`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

module.exports = app;