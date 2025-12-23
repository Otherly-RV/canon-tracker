
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { ExtractedContent } from '../types.ts';

// Dynamically set the worker source based on the loaded library's version
// to prevent version mismatches. This is the robust way to handle it.
// @ts-ignore
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
}


async function extractFromPdf(file: File): Promise<ExtractedContent> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n\n';
    }

    return { content: fullText, format: 'text' };
}

async function extractFromDocx(file: File): Promise<ExtractedContent> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return { content: result.value, format: 'html' };
}

export async function extractTextFromFile(file: File): Promise<ExtractedContent> {
    if (file.type === 'application/pdf') {
        return extractFromPdf(file);
    } 
    
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (isDocx) {
        return extractFromDocx(file);
    }
    
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}
