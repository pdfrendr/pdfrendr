/**
 * Simplified PDF Object Detection Module
 */

interface DetectionResult {
  found: boolean;
  hexSnippet?: string;
  matchPosition?: number;
  matchLength?: number;
  matchedText?: string;
}

const DETECTION_PATTERNS = {
  'JavaScript actions (/JavaScript)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    // Look for /JavaScript as a proper PDF dictionary key
    const jsRegex = /\/JavaScript[\s>]/g;
    const match = jsRegex.exec(content);
    
    if (match) {
      const jsActionIndex = match.index;
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, jsActionIndex, '/JavaScript'.length, '/JavaScript'),
        matchPosition: jsActionIndex,
        matchLength: '/JavaScript'.length,
        matchedText: '/JavaScript'
      };
    }
    return { found: false };
  },

  'JavaScript objects (/JS)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    // Look for /JS as a proper PDF dictionary key, not just any occurrence
    // Use regex to find /JS followed by space, > or newline (proper PDF syntax)
    const jsRegex = /\/JS[\s>]/g;
    const match = jsRegex.exec(content);
    
    if (match) {
      const jsIndex = match.index;
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, jsIndex, '/JS'.length, '/JS'),
        matchPosition: jsIndex,
        matchLength: '/JS'.length,
        matchedText: '/JS'
      };
    }
    return { found: false };
  },
    
  'Form submission actions (/SubmitForm)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const submitIndex = content.indexOf('/SubmitForm');
    
    if (submitIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, submitIndex, '/SubmitForm'.length, '/SubmitForm'),
        matchPosition: submitIndex,
        matchLength: '/SubmitForm'.length,
        matchedText: '/SubmitForm'
      };
    }
    return { found: false };
  },

  'External links (/URI)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    // Look for /URI as a proper PDF dictionary key
    const uriRegex = /\/URI[\s>]/g;
    const match = uriRegex.exec(content);
    
    if (match) {
      const uriIndex = match.index;
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, uriIndex, '/URI'.length, '/URI'),
        matchPosition: uriIndex,
        matchLength: '/URI'.length,
        matchedText: '/URI'
      };
    }
    return { found: false };
  },
    
  'Embedded files (/EmbeddedFile)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const embeddedIndex = content.indexOf('/EmbeddedFile');
    
    if (embeddedIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, embeddedIndex, '/EmbeddedFile'.length, '/EmbeddedFile'),
        matchPosition: embeddedIndex,
        matchLength: '/EmbeddedFile'.length,
        matchedText: '/EmbeddedFile'
      };
    }
    return { found: false };
  },

  'File specifications (/Filespec)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const filespecIndex = content.indexOf('/Filespec');
    
    if (filespecIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, filespecIndex, '/Filespec'.length, '/Filespec'),
        matchPosition: filespecIndex,
        matchLength: '/Filespec'.length,
        matchedText: '/Filespec'
      };
    }
    return { found: false };
  },
    
  'Additional actions (/AA)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const aaIndex = content.indexOf('/AA');
    
    if (aaIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, aaIndex, '/AA'.length, '/AA'),
        matchPosition: aaIndex,
        matchLength: '/AA'.length,
        matchedText: '/AA'
      };
    }
    return { found: false };
  },

  'Action objects (/A)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const aIndex = content.indexOf('/A ');
    
    if (aIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, aIndex, '/A '.length, '/A '),
        matchPosition: aIndex,
        matchLength: '/A '.length,
        matchedText: '/A '
      };
    }
    return { found: false };
  },
    
  'Digital signatures (/Sig)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const sigIndex = content.indexOf('/Sig');
    
    if (sigIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, sigIndex, '/Sig'.length, '/Sig'),
        matchPosition: sigIndex,
        matchLength: '/Sig'.length,
        matchedText: '/Sig'
      };
    }
    return { found: false };
  },

  'Signature fields (/ByteRange)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const byteRangeIndex = content.indexOf('/ByteRange');
    
    if (byteRangeIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, byteRangeIndex, '/ByteRange'.length, '/ByteRange'),
        matchPosition: byteRangeIndex,
        matchLength: '/ByteRange'.length,
        matchedText: '/ByteRange'
      };
    }
    return { found: false };
  },
    
  'XFA forms (/XFA)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const xfaIndex = content.indexOf('/XFA');
    
    if (xfaIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, xfaIndex, '/XFA'.length, '/XFA'),
        matchPosition: xfaIndex,
        matchLength: '/XFA'.length,
        matchedText: '/XFA'
      };
    }
    return { found: false };
  },

  'Type1 fonts (/Type1)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const type1Index = content.indexOf('/Type1');
    
    if (type1Index !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, type1Index, '/Type1'.length, '/Type1'),
        matchPosition: type1Index,
        matchLength: '/Type1'.length,
        matchedText: '/Type1'
      };
    }
    return { found: false };
  },

  'CFF fonts (/CFF)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const cffIndex = content.indexOf('/CFF');
    
    if (cffIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, cffIndex, '/CFF'.length, '/CFF'),
        matchPosition: cffIndex,
        matchLength: '/CFF'.length,
        matchedText: '/CFF'
      };
    }
    return { found: false };
  },

  'TrueType fonts (/TrueType)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const trueTypeIndex = content.indexOf('/TrueType');
    
    if (trueTypeIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, trueTypeIndex, '/TrueType'.length, '/TrueType'),
        matchPosition: trueTypeIndex,
        matchLength: '/TrueType'.length,
        matchedText: '/TrueType'
      };
    }
    return { found: false };
  },

  // Additional important patterns
  'GoTo actions (/GoTo)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const gotoIndex = content.indexOf('/GoTo');
    
    if (gotoIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, gotoIndex, '/GoTo'.length, '/GoTo'),
        matchPosition: gotoIndex,
        matchLength: '/GoTo'.length,
        matchedText: '/GoTo'
      };
    }
    return { found: false };
  },

  'Launch actions (/Launch)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const launchIndex = content.indexOf('/Launch');
    
    if (launchIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, launchIndex, '/Launch'.length, '/Launch'),
        matchPosition: launchIndex,
        matchLength: '/Launch'.length,
        matchedText: '/Launch'
      };
    }
    return { found: false };
  },

  'Named actions (/Named)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const namedIndex = content.indexOf('/Named');
    
    if (namedIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, namedIndex, '/Named'.length, '/Named'),
        matchPosition: namedIndex,
        matchLength: '/Named'.length,
        matchedText: '/Named'
      };
    }
    return { found: false };
  },

  'Rich media (/RichMedia)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const richMediaIndex = content.indexOf('/RichMedia');
    
    if (richMediaIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, richMediaIndex, '/RichMedia'.length, '/RichMedia'),
        matchPosition: richMediaIndex,
        matchLength: '/RichMedia'.length,
        matchedText: '/RichMedia'
      };
    }
    return { found: false };
  },

  'Sound objects (/Sound)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const soundIndex = content.indexOf('/Sound');
    
    if (soundIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, soundIndex, '/Sound'.length, '/Sound'),
        matchPosition: soundIndex,
        matchLength: '/Sound'.length,
        matchedText: '/Sound'
      };
    }
    return { found: false };
  },

  'Movie objects (/Movie)': (content: string, buffer: ArrayBuffer): DetectionResult => {
    const movieIndex = content.indexOf('/Movie');
    
    if (movieIndex !== -1) {
      return {
        found: true,
        hexSnippet: generateHexSnippet(buffer, movieIndex, '/Movie'.length, '/Movie'),
        matchPosition: movieIndex,
        matchLength: '/Movie'.length,
        matchedText: '/Movie'
      };
    }
    return { found: false };
  }
};

/**
 * Generate focused hexdump-style snippet from ArrayBuffer at given position
 */
function generateHexSnippet(buffer: ArrayBuffer, position: number, matchLength: number = 1, matchedText: string = ''): string {
  const view = new Uint8Array(buffer);
  const start = Math.max(0, position - 32); // Show 32 bytes before match
  const end = Math.min(view.length, position + 1024); // Show 1024 bytes after match
  const chunk = view.slice(start, end);
  
  let hexLines: string[] = [];
  
  for (let i = 0; i < chunk.length; i += 16) {
    const offset = start + i;
    const hexOffset = offset.toString(16).padStart(8, '0').toUpperCase();
    
    const line = chunk.slice(i, i + 16);
    const hexBytes = Array.from(line)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    
    const ascii = Array.from(line)
      .map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.')
      .join('');
    
    const hexPart = hexBytes.padEnd(47, ' '); // 16 bytes * 2 chars + 15 spaces = 47
    
    // Highlight the match position if it's in this line
    const lineStart = start + i;
    const lineEnd = lineStart + line.length;
    let hexDisplay = hexPart;
    let asciiDisplay = ascii;
    
            // Check if this line contains part of the match
    const matchStart = position;
    const matchEnd = position + matchLength;
    
    if (matchStart < lineEnd && matchEnd > lineStart) {
      // Calculate which bytes in this line should be highlighted
      const highlightStart = Math.max(0, matchStart - lineStart);
      const highlightEnd = Math.min(line.length, matchEnd - lineStart);
      const bytesToHighlight = highlightEnd - highlightStart;
      
      // Store highlight metadata instead of HTML
      const hexLine = `${hexOffset}  ${hexDisplay} |${asciiDisplay}|`;
      const highlightInfo = {
        line: hexLine,
        hexHighlight: {
          start: 10 + (highlightStart * 3), // 10 chars for offset + spaces
          length: Math.max(0, (bytesToHighlight * 3) - 1) // Each byte is 2 hex chars + 1 space, minus trailing space
        },
        asciiHighlight: {
          start: 10 + 47 + 2 + highlightStart, // offset + hex + separator + ascii position
          length: bytesToHighlight
        }
      };
      
      hexLines.push(JSON.stringify(highlightInfo));
    } else {
      hexLines.push(JSON.stringify({ line: `${hexOffset}  ${hexDisplay} |${asciiDisplay}|` }));
    }
    
    // Show much more data - up to 640 lines (~10KB of data)
    if (hexLines.length >= 640) break;
  }
  
  // Add comprehensive summary header with more detail
  const summary = `MATCH_OFFSET: 0x${position.toString(16).toUpperCase().padStart(8, '0')} | CHUNK_SIZE: ${chunk.length} bytes | RANGE: 0x${start.toString(16).toUpperCase()}-0x${(start + chunk.length).toString(16).toUpperCase()}`;
  const context = `CONTEXT: ${Math.min(position - start, 32)}B before + ${Math.min(chunk.length - (position - start), 1024)}B after | RELATIVE_POS: +${position - start}`;
  const analysis = `HEX_LINES: ${hexLines.length} | BYTES_SHOWN: ${hexLines.length * 16} | ANALYSIS: PDF_OBJECT_STRUCTURE`;
  
  return summary + '\n' + context + '\n' + analysis + '\n' + '='.repeat(120) + '\n' + hexLines.join('\n');
}

/**
 * Enhanced detection with hex snippets
 */
export interface DetectionResultWithHex {
  name: string;
  hexSnippet?: string;
  position?: number;
}

/**
 * Get detailed detection results with hex snippets
 */
export function getDetectedObjectsWithHex(pdfContent: ArrayBuffer): DetectionResultWithHex[] {
  const pdfString = new TextDecoder('latin1').decode(pdfContent);
  const detected: DetectionResultWithHex[] = [];

  for (const [description, checkFn] of Object.entries(DETECTION_PATTERNS)) {
    const result = checkFn(pdfString, pdfContent);
    if (result.found) {
      detected.push({
        name: description,
        hexSnippet: result.hexSnippet,
        position: result.matchPosition
      });
    }
  }

  return detected;
}

/**
 * Get simple summary of detected objects
 */
export function getDetectedObjectsSummary(pdfContent: ArrayBuffer): string[] {
  const pdfString = new TextDecoder('latin1').decode(pdfContent);
  const detected: string[] = [];

  for (const [description, checkFn] of Object.entries(DETECTION_PATTERNS)) {
    const result = checkFn(pdfString, pdfContent);
    if (result.found) {
      detected.push(description);
    }
  }

  return detected;
}

/**
 * Detailed analysis (for compatibility)
 */
export function analyzePDF(pdfContent: ArrayBuffer) {
  const summary = getDetectedObjectsSummary(pdfContent);
  
  return {
    summary,
    metadata: {
      totalSize: pdfContent.byteLength,
      hasJavaScript: summary.some(s => s.includes('JavaScript')),
      hasEmbeddedFiles: summary.some(s => s.includes('Embedded files')),
      hasInteractiveElements: summary.some(s => s.includes('Interactive annotations')),
      hasDigitalSignatures: summary.some(s => s.includes('Digital signatures')),
      hasXFAForms: summary.some(s => s.includes('XFA')),
      hasEmbeddedFonts: summary.some(s => s.includes('Embedded fonts')),
      pdfSizeKB: Math.round(pdfContent.byteLength / 1024)
    }
  };
}