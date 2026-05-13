import { promises as fs } from "fs";
import path from "path";
import type { Credentials } from "google-auth-library";

const TOKEN_PATH = path.join(process.cwd(), "data", "google-token.json");

export async function saveGoogleToken(tokens: Credentials): Promise<void> {
  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf-8");
}

export async function loadGoogleToken(): Promise<Credentials | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}
