import Link from "next/link";

export default function EntrancePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 bg-cover bg-center p-6 text-center text-white"
      style={{ backgroundImage: "url('/images/landingbg.png')" }}
    >
      <Link href="/splash" className="mt-80 translate-x-4">
        Enter Website
      </Link>
    </main>
  );
}
