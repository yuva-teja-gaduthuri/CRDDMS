// services/ocr.service.js — Runs Tesseract OCR on uploaded files
// Supports PDF (first page via image) and image files directly.

import Tesseract from 'tesseract.js';
import path from 'path';
import fs from 'fs';

/**
 * Run OCR on a file and return { text, confidence }
 * @param {string} filePath  — absolute path to the file
 * @param {string} fileType  — 'pdf'|'jpg'|'png'
 */
export async function extractText(filePath, fileType) {
  // Tesseract works directly on images; for PDF we'd need pdf2pic
  // For now: process image files directly, return a message for non-images
  const imageTypes = ['jpg', 'jpeg', 'png'];
  const ext = path.extname(filePath).replace('.', '').toLowerCase();

  if (!imageTypes.includes(ext)) {
    return {
      text: `[OCR not available for ${ext.toUpperCase()} files. Convert to image to enable OCR.]`,
      confidence: 0,
    };
  }

  if (!fs.existsSync(filePath)) {
    return { text: '[File not found on disk]', confidence: 0 };
  }

  const result = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {},   // suppress progress logs
  });

  return {
    text:       result.data.text.trim(),
    confidence: parseFloat(result.data.confidence.toFixed(2)),
  };
}
