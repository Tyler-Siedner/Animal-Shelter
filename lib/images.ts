// Authors: Tyler Siedner and Tyler Harris
import "server-only";
import { readdirSync } from "node:fs";
import path from "node:path";
export function residentImages(): string[] {
  const directory = path.join(process.cwd(), "public", "images", "creatures");
  return readdirSync(directory, { withFileTypes: true })
    .filter(
      (file) => file.isFile() && /\.(png|jpe?g|webp|gif)$/i.test(file.name),
    )
    .map((file) => `/images/creatures/${file.name}`)
    .sort();
}
