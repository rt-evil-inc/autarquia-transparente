import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { queries, type FullInitiative } from "$lib/server/database";

export type InitiativeDetailResponse = FullInitiative;

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id || isNaN(Number(id))) {
      return json({ error: "Invalid initiative ID" }, { status: 400 });
    }
    
    const fullInitiative = queries.getFullInitiativeById(Number(id));

    
    if (!fullInitiative || fullInitiative.status === "draft") {
      return json({ error: "Initiative not found" }, { status: 404 });
    }
    
    return json(fullInitiative);
  } catch (error) {
    console.error("Error fetching initiative:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
