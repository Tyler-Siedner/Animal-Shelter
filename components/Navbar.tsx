import Link from "next/link";

export default function Navbar() {
  return (
    <nav aria-label="Main navigation">
      <Link href="/home">Home</Link> <Link href="/animals">Animals</Link>{" "}
      <Link href="/about">About</Link> <Link href="/contact">Contact</Link>
    </nav>
  );
}
