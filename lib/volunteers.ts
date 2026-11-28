// Authors: Tyler Siedner and Tyler Harris
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDatabase } from "./database";
import { opportunities } from "./application-repository";
export async function getOpportunities() {
  "use cache";
  cacheLife("minutes");
  cacheTag("volunteers");
  return opportunities(getDatabase());
}
