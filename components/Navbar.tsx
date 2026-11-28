// Authors: Tyler Siedner and Tyler Harris

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="site-navbar">
      <nav aria-label="Main navigation" className="site-navbar-inner">
        <Link href="/home" className="site-brand">
          WEYLAND-YUTANI
          <span>ANIMAL WELFARE DIVISION</span>
        </Link>

        <div className="site-nav-links">
          <Link href="/home">Home</Link>
          <Link href="/animals">Animals</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>
    </header>
  );
}
