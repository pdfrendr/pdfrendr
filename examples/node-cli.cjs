#!/usr/bin/env node

/**
 * Command-line interface for PDF processing
 * Usage: node examples/node-cli.js input.pdf output.pdf
 */

const { promises: fs } = require('fs');
const path = require('path');
const { processPDF } = require('../dist/node/index.cjs');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node examples/node-cli.js <input.pdf> <output.pdf>');
    console.log('');
    console.log('Options:');
    console.log('  --quality=X     Render quality 1.0-4.0 (default: 2.0)');
    console.log('  --compression=X Compression level 0-3 (default: 2)');
    console.log('');
    console.log('Example:');
    console.log('  node examples/node-cli.js document.pdf processed.pdf');
    console.log('  node examples/node-cli.js --quality=3.0 document.pdf processed.pdf');
    process.exit(1);
  }
  
  let inputFile, outputFile;
  const options = {
    renderQuality: 2.0,
    compressionLevel: 2
  };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--quality=')) {
      options.renderQuality = parseFloat(arg.split('=')[1]) || 2.0;
    } else if (arg.startsWith('--compression=')) {
      options.compressionLevel = parseInt(arg.split('=')[1]) || 2;
    } else if (!inputFile) {
      inputFile = arg;
    } else if (!outputFile) {
      outputFile = arg;
    }
  }
  
  if (!inputFile || !outputFile) {
    console.error('❌ Both input and output files are required');
    process.exit(1);
  }
  
  try {
    console.log(`📄 Reading PDF: ${inputFile}`);
    
    // Read input file
    const inputBuffer = await fs.readFile(inputFile);
    console.log(`📊 Input size: ${formatBytes(inputBuffer.length)}`);
    
    console.log('🔄 Processing PDF (visual-only mode)...');
    console.log(`⚙️ Options: quality=${options.renderQuality}x, compression=${options.compressionLevel}`);
    
    // Process the PDF
    const startTime = Date.now();
    const result = await processPDF(inputBuffer.buffer, options);
    const duration = Date.now() - startTime;
    
    if (result.processedPdf) {
      console.log(`✅ Processing complete in ${duration}ms`);
      console.log(`📊 Output size: ${formatBytes(result.processedSize)}`);
      
      const sizeReduction = ((result.originalSize - result.processedSize) / result.originalSize * 100).toFixed(1);
      console.log(`📉 Size change: ${sizeReduction}%`);
      
      if (result.removedObjects && result.removedObjects.length > 0) {
        console.log(`🔍 Dynamic objects processed (${result.removedObjects.length})`);
        result.removedObjects.forEach(object => {
          console.log(`   • ${object.name || object}`);
        });
      } else {
        console.log('✅ No dynamic objects detected');
      }
      
      // Write processed PDF (convert ArrayBuffer to Buffer for Node.js)
      const buffer = Buffer.from(result.processedPdf);
      await fs.writeFile(outputFile, buffer);
      console.log(`💾 Processed PDF saved: ${outputFile}`);
      
    } else {
      console.error(`❌ Processing failed`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.code === 'ENOENT') {
      console.error(`   File not found: ${inputFile}`);
    }
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}