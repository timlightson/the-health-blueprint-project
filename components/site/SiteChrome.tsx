import Link from "next/link";
import { BrandMark } from "@/components/site/BrandMark";
import {
  DISCLAIMER,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  GITHUB_URL,
} from "@/lib/site";

export function SiteNav({ active }: { active?: "explore" | "learn" }) {
  return (
    <header className="site-header">
      <div className="page-width site-nav">
        <Link
          href="/"
          className="site-wordmark"
          aria-label="The Health Blueprint home"
        >
          <BrandMark size={30} />
          <span>
            The Health
            <br className="wordmark-break" /> Blueprint
          </span>
        </Link>
        <nav aria-label="Primary">
          <Link
            href="/#blueprints"
            aria-current={active === "explore" ? "page" : undefined}
          >
            Explore
          </Link>
          <Link
            href="/learn"
            aria-current={active === "learn" ? "page" : undefined}
          >
            Learn
          </Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width">
        <Link href="/" className="footer-name">
          The Health Blueprint
        </Link>
        <div className="footer-details">
          <p>{DISCLAIMER}</p>
          <nav aria-label="Footer">
            <Link href="/about">About</Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              {INSTAGRAM_HANDLE}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
