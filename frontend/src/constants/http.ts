// Re-export the single source of HTTP status codes from backend/shared so the frontend and
// edge functions never drift. Do not redefine status codes here.
export { HTTP_STATUS, type HttpStatus } from "@shared/http";
