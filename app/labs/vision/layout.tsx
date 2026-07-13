import type { Metadata } from "next";
import { labPageMetadata } from "@/components/labs/labs-meta";

export const metadata: Metadata = labPageMetadata("vision");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
