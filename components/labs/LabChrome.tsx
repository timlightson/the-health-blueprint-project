"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { labMeta, type LabId } from "@/components/labs/labs-meta";
import { DISCLAIMER } from "@/lib/site";

export function LabHeader({ lab, badge }: { lab: LabId; badge?: ReactNode }) {
  return (
    <header className="lab-header">
      <Link
        href="/#blueprints"
        className="lab-back"
        aria-label="Back to all labs"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span>All labs</span>
      </Link>
      <Link href={`/labs/${lab}`} className="lab-header-name">
        {labMeta(lab).name}
        <span> Blueprint</span>
      </Link>
      <div className="lab-header-status">{badge}</div>
    </header>
  );
}
export function HeaderBadge({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <div className="lab-header-badge" style={{ color }}>
      {children}
    </div>
  );
}
export function LabFooter() {
  return (
    <footer className="lab-footer">
      <p>{DISCLAIMER}</p>
      <Link href="/learn">Keep exploring the science</Link>
      <Link href="/#blueprints">All labs</Link>
    </footer>
  );
}
