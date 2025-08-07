/**
 * PDF Name Obfuscation Detection
 * Based on Didier Stevens' research on PDF obfuscation techniques
 */

export interface ObfuscationResult {
  found: boolean;
  originalName: string;
  decodedName: string;
  obfuscationType: 'hex' | 'mixed' | 'none';
  confidence: number;
}

/**
 * Detect and decode obfuscated PDF names (Stevens' methodology)
 * Handles hex-encoded names like /J#61vaScript -> /JavaScript
 */
export function detectNameObfuscation(content: string): ObfuscationResult[] {
  const results: ObfuscationResult[] = [];
  
  // Find all potential obfuscated names with hex encoding
  const hexNameRegex = /\/[A-Za-z0-9#]+/g;
  const matches = content.match(hexNameRegex) || [];
  
  for (const match of matches) {
    if (match.includes('#')) {
      const decodedResult = decodeHexName(match);
      if (decodedResult.found) {
        results.push(decodedResult);
      }
    }
  }
  
  return results;
}

/**
 * Decode hex-encoded PDF names
 */
function decodeHexName(name: string): ObfuscationResult {
  try {
    // Remove leading slash
    const nameWithoutSlash = name.substring(1);
    let decoded = '';
    let hasHex = false;
    
    for (let i = 0; i < nameWithoutSlash.length; i++) {
      if (nameWithoutSlash[i] === '#' && i + 2 < nameWithoutSlash.length) {
        // Extract hex code
        const hexCode = nameWithoutSlash.substring(i + 1, i + 3);
        if (/^[0-9A-Fa-f]{2}$/.test(hexCode)) {
          const charCode = parseInt(hexCode, 16);
          decoded += String.fromCharCode(charCode);
          hasHex = true;
          i += 2; // Skip the hex digits
        } else {
          decoded += nameWithoutSlash[i];
        }
      } else {
        decoded += nameWithoutSlash[i];
      }
    }
    
    if (hasHex) {
      const decodedName = '/' + decoded;
      const confidence = calculateObfuscationConfidence(name, decodedName);
      
      return {
        found: true,
        originalName: name,
        decodedName,
        obfuscationType: 'hex',
        confidence
      };
    }
  } catch (error) {
    // Decoding failed
  }
  
  return {
    found: false,
    originalName: name,
    decodedName: name,
    obfuscationType: 'none',
    confidence: 0
  };
}

/**
 * Calculate confidence that this is intentional obfuscation
 */
function calculateObfuscationConfidence(original: string, decoded: string): number {
  // List of suspicious decoded names that suggest obfuscation
  const suspiciousNames = [
    '/JavaScript', '/JS', '/AA', '/OpenAction', '/Launch', '/URI',
    '/SubmitForm', '/GoTo', '/GoToR', '/Named', '/JBIG2Decode',
    '/RichMedia', '/XFA', '/EmbeddedFile', '/Filespec'
  ];
  
  // High confidence if decoded name is in suspicious list
  if (suspiciousNames.includes(decoded)) {
    return 0.95;
  }
  
  // Medium confidence if it contains suspicious keywords
  const suspiciousKeywords = ['java', 'script', 'action', 'launch', 'form', 'embed'];
  const decodedLower = decoded.toLowerCase();
  for (const keyword of suspiciousKeywords) {
    if (decodedLower.includes(keyword)) {
      return 0.75;
    }
  }
  
  // Lower confidence for general hex usage
  return 0.4;
}

/**
 * Enhanced pattern matching that handles obfuscation
 */
export function createObfuscationAwarePattern(baseName: string): RegExp {
  // Create a regex that matches both normal and hex-obfuscated versions
  let pattern = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
  
  // Replace each character with optional hex encoding
  pattern = pattern.split('').map(char => {
    if (char === '/') return '\\/';
    if (char === '\\') return char; // Already escaped
    
    const hexCode = char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
    return `(?:${char}|#${hexCode})`;
  }).join('');
  
  // Add word boundary for proper matching
  pattern += '(?:[\\s>]|$)';
  
  return new RegExp(pattern, 'gi');
}

/**
 * Comprehensive obfuscation analysis
 */
export function analyzeObfuscation(content: string): {
  hasObfuscation: boolean;
  obfuscatedNames: ObfuscationResult[];
  deobfuscatedContent: string;
  obfuscationLevel: 'none' | 'light' | 'moderate' | 'heavy';
  analysis: string[];
} {
  const obfuscatedNames = detectNameObfuscation(content);
  const analysis: string[] = [];
  
  // Calculate obfuscation level
  const totalNames = (content.match(/\/[A-Za-z][A-Za-z0-9]*/g) || []).length;
  const obfuscatedCount = obfuscatedNames.length;
  const obfuscationRatio = totalNames > 0 ? obfuscatedCount / totalNames : 0;
  
  let obfuscationLevel: 'none' | 'light' | 'moderate' | 'heavy';
  if (obfuscationRatio === 0) {
    obfuscationLevel = 'none';
  } else if (obfuscationRatio < 0.1) {
    obfuscationLevel = 'light';
    analysis.push(`Light obfuscation detected: ${obfuscatedCount} of ${totalNames} names encoded`);
  } else if (obfuscationRatio < 0.3) {
    obfuscationLevel = 'moderate';
    analysis.push(`Moderate obfuscation detected: ${obfuscatedCount} of ${totalNames} names encoded`);
  } else {
    obfuscationLevel = 'heavy';
    analysis.push(`Heavy obfuscation detected: ${obfuscatedCount} of ${totalNames} names encoded`);
  }
  
  // Check for suspicious obfuscated patterns
  const suspiciousObfuscated = obfuscatedNames.filter(name => name.confidence > 0.7);
  if (suspiciousObfuscated.length > 0) {
    analysis.push(`Suspicious obfuscated names detected: ${suspiciousObfuscated.map(n => `${n.originalName} -> ${n.decodedName}`).join(', ')}`);
  }
  
  // Create deobfuscated content
  let deobfuscatedContent = content;
  for (const result of obfuscatedNames) {
    deobfuscatedContent = deobfuscatedContent.replace(
      new RegExp(result.originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      result.decodedName
    );
  }
  
  return {
    hasObfuscation: obfuscatedNames.length > 0,
    obfuscatedNames,
    deobfuscatedContent,
    obfuscationLevel,
    analysis
  };
}
