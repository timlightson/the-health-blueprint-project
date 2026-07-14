import type { Metadata } from "next";
import { labPageMetadata } from "@/components/labs/labs-meta";

export const metadata: Metadata = labPageMetadata("breath");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
