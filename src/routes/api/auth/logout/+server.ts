import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
  // Clear the auth token cookie
  cookies.delete("auth-token", { path: "/" });
  
  return json({ success: true });
};
