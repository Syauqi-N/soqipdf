import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

export async function mergePdfs(pdfPaths: string[]): Promise<Buffer> {
  if (pdfPaths.length === 0) {
    throw new Error('No PDF files provided');
  }

  if (pdfPaths.length === 1) {
    return fs.readFileSync(pdfPaths[0]);
  }

  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    try {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    } catch (error) {
      throw new Error(`Failed to merge PDF: ${pdfPath}. ${error}`);
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes);
}

export async function getPdfInfo(pdfPath: string): Promise<{
  pageCount: number;
  title?: string;
  author?: string;
}> {
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    
    return {
      pageCount: pdf.getPageCount(),
      title: pdf.getTitle(),
      author: pdf.getAuthor(),
    };
  } catch (error) {
    throw new Error(`Failed to read PDF info: ${error}`);
  }
}

export async function validatePdfFile(pdfPath: string): Promise<boolean> {
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    await PDFDocument.load(pdfBytes);
    return true;
  } catch (error) {
    return false;
  }
}
