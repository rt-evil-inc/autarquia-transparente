import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }
  
  return json({ 
    user: {
      id: locals.user.id,
      email: locals.user.email,
      role: locals.user.role,
      parish_id: locals.user.parish_id
    }
  });
};
