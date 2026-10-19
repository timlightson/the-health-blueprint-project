import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";
import BlueprintArt from "@/components/home/BlueprintArt";
import { ARTICLES } from "@/lib/articles";
export const metadata: Metadata = {
  title: "Learn · The Health Blueprint",
  description:
    "Short, cited explainers on common health questions, each paired with an interactive Blueprint.",
};
export default function LearnIndex() {
  return (
    <div className="editorial-site">
      <SiteNav active="learn" />
      <main id="main-content" tabIndex={-1} className="page-width learn-main">
        <div className="section-intro">
          <h1>
            Make sense
            <br />
            of yourself.
          </h1>
          <p>
            Start with a question. Follow the explanation. Then try the
            experiment.
          </p>
        </div>
        <div className="learn-list">
          {ARTICLES.map((a) => (
            <Link
              href={`/learn/${a.slug}`}
              key={a.slug}
              className="learn-story"
            >
              <div className="learn-story-art">
                <BlueprintArt id={a.lab} />
              </div>
              <div>
                <span className="story-meta">
                  {a.kind} · {a.minutes} min read
                </span>
                <h2>{a.question}</h2>
                <p>{a.dek}</p>
                <span className="text-action">
                  Read the explanation{" "}
                  <ArrowUpRight size={20} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
