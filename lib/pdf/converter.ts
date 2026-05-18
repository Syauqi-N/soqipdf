import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type ImageFormat = 'jpg' | 'png';

export async function pdfToImages(
  pdfPath: string,
  outputDir: string,
  format: ImageFormat = 'png',
  quality: number = 90
): Promise<string[]> {
  const popplerPath = process.env.POPPLER_PATH || 'pdftoppm';
  const outputPrefix = path.join(outputDir, 'page');
  
  const formatFlag = format === 'jpg' ? '-jpeg' : '-png';
  const qualityFlag = format === 'jpg' ? `-jpeg -jpegopt quality=${quality}` : '';
  
  const command = `${popplerPath} ${formatFlag} ${qualityFlag} -r 300 "${pdfPath}" "${outputPrefix}"`;

  try {
    await execAsync(command);
    
    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith('page-') && (f.endsWith('.jpg') || f.endsWith('.png')))
      .sort()
      .map(f => path.join(outputDir, f));

    const optimizedFiles: string[] = [];
    for (const file of files) {
      const optimizedPath = file.replace(/\.(jpg|png)$/, `_optimized.${format}`);
      await sharp(file)
        .resize(2480, 3508, { fit: 'inside', withoutEnlargement: true })
        [format === 'jpg' ? 'jpeg' : 'png']({ quality })
        .toFile(optimizedPath);
      
      fs.unlinkSync(file);
      optimizedFiles.push(optimizedPath);
    }

    return optimizedFiles;
  } catch (error) {
    throw new Error(`Failed to convert PDF to images: ${error}`);
  }
}

export async function pdfToWord(
  pdfPath: string,
  outputPath: string
): Promise<string> {
  const libreOfficePath = process.env.LIBREOFFICE_PATH || 'soffice';
  const outputDir = path.dirname(outputPath);
  
  const command = `${libreOfficePath} --headless --infilter="writer_pdf_import" --convert-to docx --outdir "${outputDir}" "${pdfPath}"`;

  try {
    const { stdout, stderr } = await execAsync(command);
    
    const pdfBasename = path.basename(pdfPath, '.pdf');
    const generatedPath = path.join(outputDir, `${pdfBasename}.docx`);
    
    if (!fs.existsSync(generatedPath)) {
      throw new Error(`LibreOffice did not produce output file. stdout: ${stdout} stderr: ${stderr}`);
    }
    
    if (generatedPath !== outputPath) {
      fs.renameSync(generatedPath, outputPath);
    }
    
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to convert PDF to Word: ${error}`);
  }
}

export async function imageToPdf(
  imagePaths: string[],
  outputPath: string,
  pageSize: 'A4' | 'Letter' | 'Legal' = 'A4'
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  
  const pageSizes = {
    A4: { width: 595, height: 842 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 }
  };
  
  const { width: pageWidth, height: pageHeight } = pageSizes[pageSize];

  for (const imagePath of imagePaths) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const ext = path.extname(imagePath).toLowerCase();
      
      let image;
      if (ext === '.jpg' || ext === '.jpeg') {
        image = await pdfDoc.embedJpg(imageBuffer);
      } else if (ext === '.png') {
        image = await pdfDoc.embedPng(imageBuffer);
      } else {
        throw new Error(`Unsupported image format: ${ext}`);
      }

      const imgWidth = image.width;
      const imgHeight = image.height;
      
      const scale = Math.min(
        (pageWidth - 40) / imgWidth,
        (pageHeight - 40) / imgHeight
      );
      
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;
      
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    } catch (error) {
      throw new Error(`Failed to process image ${imagePath}: ${error}`);
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  
  return outputPath;
}

export async function wordToPdf(
  wordPath: string,
  outputPath: string
): Promise<string> {
  const libreOfficePath = process.env.LIBREOFFICE_PATH || 'soffice';
  const outputDir = path.dirname(outputPath);
  
  const command = `${libreOfficePath} --headless --convert-to pdf --outdir "${outputDir}" "${wordPath}"`;

  try {
    await execAsync(command);
    
    const wordBasename = path.basename(wordPath, path.extname(wordPath));
    const generatedPath = path.join(outputDir, `${wordBasename}.pdf`);
    
    if (generatedPath !== outputPath) {
      fs.renameSync(generatedPath, outputPath);
    }
    
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to convert Word to PDF: ${error}`);
  }
}

export async function checkPopplerInstalled(): Promise<boolean> {
  const popplerPath = process.env.POPPLER_PATH || 'pdftoppm';
  
  try {
    await execAsync(`${popplerPath} -v`);
    return true;
  } catch (error) {
    return false;
  }
}

export async function checkLibreOfficeInstalled(): Promise<boolean> {
  const libreOfficePath = process.env.LIBREOFFICE_PATH || 'soffice';
  
  try {
    await execAsync(`${libreOfficePath} --version`);
    return true;
  } catch (error) {
    return false;
  }
}
