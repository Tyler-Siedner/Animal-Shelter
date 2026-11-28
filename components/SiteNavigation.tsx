// Authors: Tyler Siedner and Tyler Harris
import Navbar from "./Navbar";
import { getCurrentUser } from "../lib/auth";
export default async function SiteNavigation() {
  const user = await getCurrentUser();
  return <Navbar signedIn={Boolean(user)} />;
}
