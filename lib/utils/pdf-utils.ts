'use client'
import '@ungap/with-resolvers';
import { PDFDocumentProxy } from 'pdfjs-dist'
import { RAILWAY_ENDPOINT_URL } from '@/lib/constants'  

export async function createPreview(
  pdfDocument: PDFDocumentProxy,
  pathname: string
): Promise<{ previewFile: File; previewPathname: string }> {
  const page = await pdfDocument.getPage(1)
  const viewport = page.getViewport({ scale: 1.0 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width

  if (!context) {
    throw new Error('Failed to get canvas context')
  }

  await page.render({ canvasContext: context, viewport: viewport }).promise

  const previewBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
      'image/webp',
      0.8
    )
  })

  const previewFile = new File([previewBlob], 'preview.webp', { type: 'image/webp' })
  const previewPathname = `${pathname}/preview.webp`

  return { previewFile, previewPathname }
}

interface EditorFiles {
  [key: string]: any;
}

export async function fetchPdf(files: EditorFiles[]) {
    if (!files.some((file) => file.name === 'main.tex')) {
        const errorData = {
            error: 'Missing File',
            message: 'No main.tex file found',
            details: 'The main.tex file is required for LaTeX compilation.'
        };
        console.error('Error fetching PDF:', errorData);
        throw new Error(`${errorData.error}: ${errorData.message}\n\nDetails: ${errorData.details}`);
    }

    const formData = new FormData();
    
    // Use a sequential loop to avoid race conditions
    for (const file of files) {
        if (file.type === 'file') {
            const extension = file.name.split('.').pop()?.toLowerCase();
            let mimeType: string;
            
            switch (extension) {
                case 'tex':
                    mimeType = 'text/plain';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'jpg':
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case 'svg':
                    mimeType = 'image/svg+xml';
                    break;
                default:
                    // Skip unsupported files
                    continue;
            }

            const pathname = file.pathname;

            let blob: Blob;
            if (extension !== 'tex' && typeof file.content === 'string') {
                const response = await fetch(file.content);
                blob = await response.blob();
            } else {
                blob = new Blob([file.content], { type: mimeType });
            }
            formData.append(pathname, blob, pathname);
        }
    }

    let response;
    try {
        response = await fetch(RAILWAY_ENDPOINT_URL, {
            method: 'POST',
            body: formData,
        });
    } catch (networkError) {
        console.error("Network error during fetch to Railway:", networkError);
        throw networkError;
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error("--- RAW ERROR FROM SERVER ---");
        console.error(`Status: ${response.status} ${response.statusText}`);
        console.error("Response Body:", errorText);
        console.error("-----------------------------");
        // Throw a new, informative error
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }
    
    return response.blob();
}


export function containsMainTex(files: File[]): boolean {
  return files.some(file => file.name === 'main.tex');
}