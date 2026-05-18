import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface SplitConfig {
  method: 'range' | 'pages' | 'every';
  ranges?: string[];
  pages?: number[];
  everyN?: number;
}

export async function splitPdf(
  inputPath: string,
  outputDir: string,
  config: SplitConfig
): Promise<string[]> {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();
  
  const outputFiles: string[] = [];

  switch (config.method) {
    case 'range':
      if (!config.ranges || config.ranges.length === 0) {
        throw new Error('Ranges are required for range split method');
      }
      outputFiles.push(...await splitByRanges(pdfDoc, outputDir, config.ranges, totalPages));
      break;

    case 'pages':
      if (!config.pages || config.pages.length === 0) {
        throw new Error('Pages are required for pages split method');
      }
      outputFiles.push(...await splitByPages(pdfDoc, outputDir, config.pages));
      break;

    case 'every':
      if (!config.everyN || config.everyN < 1) {
        throw new Error('everyN must be a positive number');
      }
      outputFiles.push(...await splitEveryN(pdfDoc, outputDir, config.everyN));
      break;

    default:
      throw new Error('Invalid split method');
  }

  return outputFiles;
}

async function splitByRanges(
  pdfDoc: PDFDocument,
  outputDir: string,
  ranges: string[],
  totalPages: number
): Promise<string[]> {
  const outputFiles: string[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const [startStr, endStr] = range.split('-').map(s => s.trim());
    const start = parseInt(startStr);
    const end = endStr ? parseInt(endStr) : start;

    if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
      throw new Error(`Invalid range: ${range}. Must be between 1 and ${totalPages}`);
    }

    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i));
    pages.forEach(page => newPdf.addPage(page));

    const outputPath = path.join(outputDir, `split_${i + 1}_pages_${start}-${end}.pdf`);
    const pdfBytes = await newPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);
    outputFiles.push(outputPath);
  }

  return outputFiles;
}

async function splitByPages(
  pdfDoc: PDFDocument,
  outputDir: string,
  pageNumbers: number[]
): Promise<string[]> {
  const outputFiles: string[] = [];
  const totalPages = pdfDoc.getPageCount();

  for (const pageNum of pageNumbers) {
    if (pageNum < 1 || pageNum > totalPages) {
      throw new Error(`Invalid page number: ${pageNum}. Must be between 1 and ${totalPages}`);
    }

    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
    newPdf.addPage(page);

    const outputPath = path.join(outputDir, `page_${pageNum}.pdf`);
    const pdfBytes = await newPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);
    outputFiles.push(outputPath);
  }

  return outputFiles;
}

async function splitEveryN(
  pdfDoc: PDFDocument,
  outputDir: string,
  n: number
): Promise<string[]> {
  const outputFiles: string[] = [];
  const totalPages = pdfDoc.getPageCount();
  let partNumber = 1;

  for (let i = 0; i < totalPages; i += n) {
    const endPage = Math.min(i + n, totalPages);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: endPage - i }, (_, j) => i + j));
    pages.forEach(page => newPdf.addPage(page));

    const outputPath = path.join(outputDir, `part_${partNumber}_pages_${i + 1}-${endPage}.pdf`);
    const pdfBytes = await newPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);
    outputFiles.push(outputPath);
    partNumber++;
  }

  return outputFiles;
}
