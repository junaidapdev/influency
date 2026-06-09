/**
 * The single API response envelope for every edge function we own (R8).
 *
 * NOTE: InsForge's auto-generated REST over tables has its own response shape — we consume
 * that via the SDK and do NOT re-wrap it. This envelope is only for the edge functions we write.
 */
export interface ApiErrorBody {
  code: string;
  message: string;
}

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; error: ApiErrorBody };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

export function fail(code: string, message: string): ApiFailure {
  return { ok: false, error: { code, message } };
}
