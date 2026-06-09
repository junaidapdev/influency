const RENDER_SCALE = 2; // upscale so small Snap text stays legible to the vision model.

/**
 * Render a PDF's FIRST PAGE to a PNG Blob in the browser. The Deno edge runtime can't rasterize
 * PDFs, so the edge function must only ever receive an image — this runs before upload.
 *
 * pdf.js is heavy and only needed when a PDF is uploaded, so it's loaded dynamically (its own
 * lazy chunk) rather than bundled into the main entry.
 */
export async function pdfFirstPageToPng(file: Blob): Promise<Blob> {
  const { GlobalWorkerOptions, getDocument } = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const loadingTask = getDocument({ data });

  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("CANVAS_CONTEXT_UNAVAILABLE");
    }

    await page.render({ canvasContext: context, canvas, viewport }).promise;

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("PDF_TO_PNG_FAILED"))),
        "image/png",
      );
    });
  } finally {
    void loadingTask.destroy();
  }
}
