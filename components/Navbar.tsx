"use client";
// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/home", "Home"],
  ["/animals", "Residents"],
  ["/about", "Our mission"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="site-navbar">
      <nav aria-label="Main navigation" className="site-navbar-inner">
        <Link href="/home" className="site-brand">
          <span className="brand-mark" aria-hidden="true">
            W/Y
          </span>
          <span>
            WEYLAND-YUTANI<small>ANIMAL WELFARE DIVISION</small>
          </span>
        </Link>
        <div className="site-nav-links">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href || pathname.startsWith(href + "/")
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
