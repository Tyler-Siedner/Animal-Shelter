// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import SiteNavigation from "../../components/SiteNavigation";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense
        fallback={
          <header className="site-navbar nav-loading">
            WEYLAND-YUTANI ANIMAL SHELTER
          </header>
        }
      >
        <SiteNavigation />
      </Suspense>
      <div className="site-content" id="main-content" tabIndex={-1}>
        {children}
      </div>
      <footer className="site-footer">
        <span>Weyland-Yutani Animal Shelter</span>
        <span>Fictional fan project · Tyler Siedner &amp; Tyler Harris</span>
      </footer>
    </>
  );
}
