// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";

export default function EntrancePage() {
  return (
    <main
      className="entrance-page"
      style={{ backgroundImage: "url('/images/backgrounds/landingbg.png')" }}
    >
      <Link href="/splash" className="button entrance-button">
        Enter Website
      </Link>
    </main>
  );
}
