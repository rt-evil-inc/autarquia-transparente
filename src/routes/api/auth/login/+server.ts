import type { RequestHandler } from "@sveltejs/kit";
import { authenticateUser, generateToken } from "$lib/auth.js";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return json({ error: "Email and password are required" }, { status: 400 });
    }
    
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    const token = generateToken(user);
    
    // Set HTTP-only cookie
    cookies.set("auth-token", token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });
    
    return json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        parish_id: user.parish_id
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
