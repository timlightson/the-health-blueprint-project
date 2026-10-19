"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import BlueprintArt from "@/components/home/BlueprintArt";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";
import { LABS, LAB_TAGS, type LabMeta } from "@/components/labs/labs-meta";
import { ARTICLES } from "@/lib/articles";

const QUESTIONS: Record<string, string> = {
  sleep: "What does your week of sleep add up to?",
  energy: "Why do you hit a wall in the afternoon?",
  stress: "When does pressure become too much?",
  hydration: "What changes when you lose water?",
  sound: "How much sound is too much?",
  focus: "Where does your attention go?",
  breath: "What changes when you slow your breathing?",
  caffeine: "What’s still in your system at bedtime?",
  vision: "How do screens change the way you see?",
};

export default function HomePage() {
  const [hours, setHours] = useState(8);
  const [filter, setFilter] = useState("All topics");
  const bedtime = (31 - hours) % 24;
  const bedLabel = `${bedtime > 12 ? bedtime - 12 : bedtime || 12}:00 ${bedtime >= 12 ? "PM" : "AM"}`;
  const visibleLabs = LABS.filter(
    (lab) => filter === "All topics" || LAB_TAGS[lab.id] === filter,
  );
  return (
    <div className="editorial-site">
      <SiteNav active="explore" />
      <main id="main-content" tabIndex={-1}>
        <section className="home-hero page-width">
          <div className="home-title hb-reveal">
            <h1>
              Your body.
              <br />
              Explained.
            </h1>
            <p>
              Change a habit. See what happens inside. Explore the science of
              being human, one experiment at a time.
            </p>
            <a href="#blueprints" className="primary-action">
              Find your experiment <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <Link
            href="/labs/sleep"
            className="home-hero-art"
            aria-label="Explore the Sleep Blueprint"
          >
            <BlueprintArt id="sleep" featured />
            <div className="hero-art-caption">
              <span>A closer look at sleep</span>
              <ArrowUpRight size={24} aria-hidden="true" />
            </div>
          </Link>
          <div className="home-schedule" data-ui>
            <div className="home-schedule-heading">
              <h2>Start with tonight.</h2>
              <span>No account. Just curiosity.</span>
            </div>
            <div className="home-schedule-body">
              <div>
                <label htmlFor="preview-sleep">
                  Bedtime <strong>{bedLabel}</strong>
                </label>
                <input
                  id="preview-sleep"
                  type="range"
                  min="5"
                  max="10"
                  step="1"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  aria-valuetext={`${bedLabel}, ${hours} hours in bed`}
                />
              </div>
              <div className="schedule-result" aria-live="polite">
                <strong>
                  {hours}
                  <span> hours</span>
                </strong>
                <span>in bed, waking at 7 AM</span>
              </div>
              <Link
                className="text-action"
                href={`/labs/sleep?bedtime=${String(bedtime).padStart(2, "0")}:00&wake=07:00`}
              >
                See your week <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="catalog-section page-width" id="blueprints">
          <div className="section-intro">
            <h2>Follow your curiosity.</h2>
            <p>
              Nine interactive labs. Familiar questions.
              <br />A chance to see the mechanisms for yourself.
            </p>
          </div>
          <div
            className="topic-filters"
            role="group"
            aria-label="Filter labs by topic"
          >
            {["All topics", "Recovery", "Fuel", "Mind", "Senses", "Reset"].map(
              (value) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value}
                </button>
              ),
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {visibleLabs.length} labs shown
          </p>
          <div
            className={`catalog-grid ${filter !== "All topics" ? "is-filtered" : ""}`}
          >
            {visibleLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        </section>

        <section className="reading-section">
          <div className="page-width reading-layout">
            <div>
              <h2>
                A little reading.
                <br />A clearer picture.
              </h2>
              <p>
                Short explanations of the questions you actually ask, with the
                research behind them.
              </p>
              <Link href="/learn" className="text-action">
                All explainers <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
            <div className="reading-list">
              {ARTICLES.map((a) => (
                <Link href={`/learn/${a.slug}`} key={a.slug}>
                  <span>{a.minutes} min read</span>
                  <h3>{a.question}</h3>
                  <p>{a.title}</p>
                  <ArrowUpRight size={22} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="home-purpose page-width">
          <h2>Curiosity is a good place to start.</h2>
          <div>
            <p>
              These labs make complex ideas easier to explore. Each model
              simplifies part of the science, and each explanation names its
              sources.
            </p>
            <Link href="/about" className="text-action">
              About the project <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function LabCard({ lab }: { lab: LabMeta }) {
  return (
    <Link href={`/labs/${lab.id}`} className="catalog-item">
      <div className="catalog-art">
        <BlueprintArt id={lab.id} />
      </div>
      <div className="catalog-copy">
        <div className="catalog-title">
          <h3>{lab.name}</h3>
          <ArrowUpRight size={24} aria-hidden="true" />
        </div>
        <p>{QUESTIONS[lab.id]}</p>
        <span className="catalog-cta">Explore the lab</span>
      </div>
    </Link>
  );
}
