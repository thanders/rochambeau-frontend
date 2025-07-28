import { Game } from "🛠️/types.ts";

export async function fetchGameById(id: string): Promise<Game | null> {
  try {
    const response = await fetch(`/api/game-details?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch game: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching game ${id}:`, error);
    return null;
  }
}
