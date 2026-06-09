// Edge function: mark-payment-received (Deno runtime).
//
// Validates input with zod, authenticates the caller, then delegates to the single-transaction
// RPC `mark_payment_received` (defined in 20260609150000_create-payments.sql). The RPC sets the
// payment received AND flips the deal to 'paid' when every payment is received — atomically.
//
// NOTE: InsForge deploys an edge function as ONE self-contained file, so the response envelope
// and HTTP codes are inlined here rather than imported from backend/shared (which the deploy
// would not bundle). They mirror backend/shared/api.ts and backend/shared/http.ts.
import { createClient } from "npm:@insforge/sdk@1.3.1";
import { z } from "npm:zod@4.4.3";

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string } };

function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

function fail(code: string, message: string): ApiFailure {
  return { ok: false, error: { code, message } };
}

const HTTP = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  SERVER_ERROR: 500,
} as const;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const inputSchema = z.object({
  paymentId: z.string().uuid(),
  receivedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function json(body: ApiSuccess<unknown> | ApiFailure, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json(fail("METHOD_NOT_ALLOWED", "Use POST."), HTTP.METHOD_NOT_ALLOWED);
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) {
    return json(fail("UNAUTHENTICATED", "Sign in required."), HTTP.UNAUTHENTICATED);
  }

  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
    edgeFunctionToken: token,
  });

  const { data: userData } = await client.auth.getCurrentUser();
  if (!userData?.user?.id) {
    return json(fail("UNAUTHENTICATED", "Invalid session."), HTTP.UNAUTHENTICATED);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return json(fail("VALIDATION_FAILED", "Body must be JSON."), HTTP.BAD_REQUEST);
  }

  const parsed = inputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return json(fail("VALIDATION_FAILED", "paymentId (uuid) and receivedDate (YYYY-MM-DD) are required."), HTTP.BAD_REQUEST);
  }

  const { data, error } = await client.database.rpc("mark_payment_received", {
    p_payment_id: parsed.data.paymentId,
    p_received_date: parsed.data.receivedDate,
  });

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("PAYMENT_NOT_FOUND")) {
      return json(fail("NOT_FOUND", "Payment not found."), HTTP.NOT_FOUND);
    }
    return json(fail("SERVER_ERROR", "Could not mark the payment received."), HTTP.SERVER_ERROR);
  }

  return json(ok(data), HTTP.OK);
}
