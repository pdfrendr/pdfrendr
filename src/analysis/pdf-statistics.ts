/**
 * PDF Statistics and Structure Analysis
 * Based on Didier Stevens' PDFiD methodology
 * 
 * Reference: https://blog.didierstevens.com/programs/pdf-tools/
 * - PDFiD tool for PDF triage and risk assessment
 * - Statistical analysis for malware detection
 * - False positive prevention techniques
 */

export interface PDFStatistics {
  // Basic structure elements
  obj: number;
  endobj: number;
  stream: number;
  endstream: number;
  xref: number;
  trailer: number;
  startxref: number;
  
  // Document structure
  pages: number;
  encrypt: number;
  objStm: number;
  
  // Suspicious elements (Stevens' key indicators)
  javascript: number;
  js: number;
  aa: number;
  openAction: number;
  launch: number;
  uri: number;
  submitForm: number;
  goTo: number;
  goToR: number;
  named: number;
  
  // Advanced threats
  jbig2Decode: number;
  richMedia: number;
  xfa: number;
  embeddedFile: number;
  filespec: number;
  
  // Encryption and compression
  acroForm: number;
  colors: number;
  
  // Structure analysis
  suspiciousScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analysis: string[];
}

export interface PDFStructureInfo {
  version: string;
  headerPosition: number;
  isLinearized: boolean;
  hasIncrementalUpdates: boolean;
  corruptedStructure: boolean;
  totalObjects: number;
  streamObjects: number;
  encryptedObjects: number;
  objectStreams: number;
}

/**
 * Analyze PDF statistics using Stevens' methodology
 */
export function analyzePDFStatistics(content: string): PDFStatistics {
  const stats: PDFStatistics = {
    obj: 0,
    endobj: 0,
    stream: 0,
    endstream: 0,
    xref: 0,
    trailer: 0,
    startxref: 0,
    pages: 0,
    encrypt: 0,
    objStm: 0,
    javascript: 0,
    js: 0,
    aa: 0,
    openAction: 0,
    launch: 0,
    uri: 0,
    submitForm: 0,
    goTo: 0,
    goToR: 0,
    named: 0,
    jbig2Decode: 0,
    richMedia: 0,
    xfa: 0,
    embeddedFile: 0,
    filespec: 0,
    acroForm: 0,
    colors: 0,
    suspiciousScore: 0,
    riskLevel: 'low',
    analysis: []
  };

  // Count basic PDF structure elements
  stats.obj = countOccurrences(content, /\b\d+\s+\d+\s+obj\b/g);
  stats.endobj = countOccurrences(content, /\bendobj\b/g);
  stats.stream = countOccurrences(content, /\bstream\b/g);
  stats.endstream = countOccurrences(content, /\bendstream\b/g);
  stats.xref = countOccurrences(content, /\bxref\b/g);
  stats.trailer = countOccurrences(content, /\btrailer\b/g);
  stats.startxref = countOccurrences(content, /\bstartxref\b/g);

  // Count document structure elements
  stats.pages = countOccurrences(content, /\/Page[\s>]/g);
  stats.encrypt = countOccurrences(content, /\/Encrypt[\s>]/g);
  stats.objStm = countOccurrences(content, /\/ObjStm[\s>]/g);

  // Count suspicious elements (Stevens' key indicators)
  stats.javascript = countOccurrences(content, /\/JavaScript[\s>]/g);
  stats.js = countOccurrences(content, /\/JS[\s>]/g);
  stats.aa = countOccurrences(content, /\/AA[\s>]/g);
  stats.openAction = countOccurrences(content, /\/OpenAction[\s>]/g);
  stats.launch = countOccurrences(content, /\/Launch[\s>]/g);
  stats.uri = countOccurrences(content, /\/URI[\s>]/g);
  stats.submitForm = countOccurrences(content, /\/SubmitForm[\s>]/g);
  stats.goTo = countOccurrences(content, /\/GoTo[\s>]/g);
  stats.goToR = countOccurrences(content, /\/GoToR[\s>]/g);
  stats.named = countOccurrences(content, /\/Named[\s>]/g);

  // Count advanced threat indicators
  stats.jbig2Decode = countOccurrences(content, /\/JBIG2Decode[\s>]/g);
  stats.richMedia = countOccurrences(content, /\/RichMedia[\s>]/g);
  stats.xfa = countOccurrences(content, /\/XFA[\s>]/g);
  stats.embeddedFile = countOccurrences(content, /\/EmbeddedFile[\s>]/g);
  stats.filespec = countOccurrences(content, /\/Filespec[\s>]/g);
  stats.acroForm = countOccurrences(content, /\/AcroForm[\s>]/g);

  // Calculate suspicious score and risk assessment
  const riskAnalysis = calculateRiskScore(stats);
  stats.suspiciousScore = riskAnalysis.score;
  stats.riskLevel = riskAnalysis.level;
  stats.analysis = riskAnalysis.analysis;

  return stats;
}

/**
 * Analyze PDF structure following Stevens' methodology
 */
export function analyzePDFStructure(buffer: ArrayBuffer): PDFStructureInfo {
  const content = new TextDecoder().decode(buffer);
  
  // Find PDF version
  const versionMatch = content.match(/%PDF-(\d+\.\d+)/);
  const version = versionMatch ? versionMatch[1] : 'unknown';
  
  // Find header position
  const headerPosition = content.indexOf('%PDF-');
  
  // Check for linearization
  const isLinearized = /\/Linearized[\s>]/.test(content);
  
  // Check for incremental updates (multiple xref tables)
  const xrefCount = (content.match(/\bxref\b/g) || []).length;
  const hasIncrementalUpdates = xrefCount > 1;
  
  // Check for structural corruption
  const objCount = (content.match(/\b\d+\s+\d+\s+obj\b/g) || []).length;
  const endobjCount = (content.match(/\bendobj\b/g) || []).length;
  const corruptedStructure = Math.abs(objCount - endobjCount) > 0;
  
  // Count object types
  const streamObjects = (content.match(/\bstream\b/g) || []).length;
  const objectStreams = (content.match(/\/ObjStm[\s>]/g) || []).length;
  const encryptedObjects = (content.match(/\/Encrypt[\s>]/g) || []).length;

  return {
    version,
    headerPosition,
    isLinearized,
    hasIncrementalUpdates,
    corruptedStructure,
    totalObjects: objCount,
    streamObjects,
    encryptedObjects,
    objectStreams
  };
}

/**
 * Calculate risk score based on Stevens' analysis criteria
 */
function calculateRiskScore(stats: PDFStatistics): { score: number; level: 'low' | 'medium' | 'high' | 'critical'; analysis: string[] } {
  let score = 0;
  const analysis: string[] = [];

  // High risk indicators (Stevens' key findings)
  if (stats.javascript > 0 || stats.js > 0) {
    score += 50;
    analysis.push(`JavaScript detected (${stats.javascript + stats.js} occurrences) - high risk`);
  }

  if (stats.aa > 0 || stats.openAction > 0) {
    score += 30;
    analysis.push(`Automatic actions detected (${stats.aa + stats.openAction} occurrences) - automatic execution`);
  }

  // Combination that Stevens identifies as "very suspicious"
  if ((stats.javascript > 0 || stats.js > 0) && (stats.aa > 0 || stats.openAction > 0)) {
    score += 40;
    analysis.push('JavaScript + Automatic actions - extremely suspicious combination');
  }

  // Medium risk indicators
  if (stats.launch > 0) {
    score += 25;
    analysis.push(`Launch actions detected (${stats.launch} occurrences) - can execute external programs`);
  }

  if (stats.uri > 0) {
    score += 15;
    analysis.push(`External URIs detected (${stats.uri} occurrences) - potential data exfiltration`);
  }

  if (stats.submitForm > 0) {
    score += 20;
    analysis.push(`Form submission detected (${stats.submitForm} occurrences) - potential data leakage`);
  }

  if (stats.embeddedFile > 0) {
    score += 15;
    analysis.push(`Embedded files detected (${stats.embeddedFile} occurrences) - hidden payloads`);
  }

  // Advanced threats
  if (stats.jbig2Decode > 0) {
    score += 25;
    analysis.push(`JBIG2 compression detected (${stats.jbig2Decode} occurrences) - known exploit vector`);
  }

  if (stats.richMedia > 0) {
    score += 20;
    analysis.push(`Rich media detected (${stats.richMedia} occurrences) - Flash exploit vector`);
  }

  if (stats.xfa > 0) {
    score += 15;
    analysis.push(`XFA forms detected (${stats.xfa} occurrences) - complex dynamic forms`);
  }

  // Structural indicators
  if (stats.objStm > 0) {
    score += 10;
    analysis.push(`Object streams detected (${stats.objStm} occurrences) - potential obfuscation`);
  }

  if (stats.encrypt > 0) {
    score += 5;
    analysis.push(`Encryption detected (${stats.encrypt} occurrences) - requires analysis`);
  }

  // Determine risk level based on Stevens' thresholds
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 80) {
    level = 'critical';
    analysis.unshift('CRITICAL: Multiple high-risk indicators - likely malicious');
  } else if (score >= 50) {
    level = 'high';
    analysis.unshift('HIGH RISK: Suspicious combination of features');
  } else if (score >= 20) {
    level = 'medium';
    analysis.unshift('MEDIUM RISK: Some suspicious features detected');
  } else {
    level = 'low';
    analysis.unshift('LOW RISK: Minimal suspicious indicators');
  }

  return { score, level, analysis };
}

/**
 * Count regex occurrences in content
 */
function countOccurrences(content: string, regex: RegExp): number {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Generate Stevens-style PDF fingerprint for classification
 */
export function generatePDFFingerprint(stats: PDFStatistics, structure: PDFStructureInfo): string {
  // Create a fingerprint similar to Stevens' method for PDF classification
  const fingerprint = [
    `v${structure.version}`,
    `obj:${stats.obj}`,
    `stream:${stats.stream}`,
    `page:${stats.pages}`,
    structure.hasIncrementalUpdates ? 'inc' : 'std',
    structure.isLinearized ? 'lin' : 'reg',
    stats.javascript > 0 ? 'js' : '',
    stats.aa > 0 ? 'aa' : '',
    stats.launch > 0 ? 'launch' : '',
    stats.objStm > 0 ? 'objstm' : '',
    stats.encrypt > 0 ? 'enc' : ''
  ].filter(Boolean).join('-');

  return fingerprint;
}
