import type { Metadata } from "next";
import { labPageMetadata } from "@/components/labs/labs-meta";

export const metadata: Metadata = labPageMetadata("sleep");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
