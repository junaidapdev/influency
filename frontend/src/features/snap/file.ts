import { SNAP_ALLOWED_IMAGE_MIME, SNAP_FILE, type SnapImageMime } from "@/constants/snap";

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

async function headerBytes(file: Blob, length: number): Promise<Uint8Array> {
  return new Uint8Array(await file.slice(0, length).arrayBuffer());
}

/** Detect a PDF by declared type or `%PDF` magic bytes. */
export async function isPdf(file: Blob): Promise<boolean> {
  if (file.type === SNAP_FILE.PDF_MIME) {
    return true;
  }
  const bytes = await headerBytes(file, 5);
  return startsWith(bytes, [0x25, 0x50, 0x44, 0x46]); // %PDF
}

function sniffImageMime(bytes: Uint8Array): SnapImageMime | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    return "image/png";
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp"; // RIFF....WEBP
  }
  return null;
}

export type ImageValidation =
  | { ok: true; mime: SnapImageMime }
  | { ok: false; reason: "size" | "type" };

/**
 * Validate an image by SIZE, MIME, and MAGIC BYTES (never the extension). Magic bytes are the
 * authoritative content check; a declared type, when present, must also be an allowed image type.
 */
export async function validateSnapImage(file: Blob): Promise<ImageValidation> {
  if (file.size > SNAP_FILE.MAX_SIZE_BYTES) {
    return { ok: false, reason: "size" };
  }
  const sniffed = sniffImageMime(await headerBytes(file, 12));
  if (!sniffed) {
    return { ok: false, reason: "type" };
  }
  if (file.type && !(SNAP_ALLOWED_IMAGE_MIME as readonly string[]).includes(file.type)) {
    return { ok: false, reason: "type" };
  }
  return { ok: true, mime: sniffed };
}
