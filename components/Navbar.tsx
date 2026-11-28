"use client";
// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../app/actions/account";
const links = [
  ["/home", "Home"],
  ["/animals", "Residents"],
  ["/volunteer", "Volunteer"],
  ["/about", "About"],
  ["/contact", "Contact"],
];
export default function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const allLinks = [
    ...links,
    ...(signedIn ? [["/account", "Account"]] : [["/login", "Sign in"]]),
  ];
  return (
    <header className="site-navbar">
      <nav aria-label="Main navigation" className="site-navbar-inner">
        <Link href="/home" className="site-brand">
          <span>
            WEYLAND-YUTANI<small>ANIMAL SHELTER</small>
          </span>
        </Link>
        <div className="site-nav-links">
          {allLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href ||
                pathname.startsWith(href + "/") ||
                (href === "/account" &&
                  ["/favorites", "/applications"].includes(pathname))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
          {signedIn && (
            <form action={logoutAction}>
              <button type="submit" className="nav-signout">
                Sign out
              </button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
