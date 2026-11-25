import type { Metadata } from "next";
import type { ReactNode } from "react";

// The admin area is never listed by search engines.
export const metadata: Metadata = {
  title: { default: "Admin | Buggle Learn", template: "%s | Buggle Learn Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
