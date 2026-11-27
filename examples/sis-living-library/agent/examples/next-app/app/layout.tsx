import type { ReactNode } from "react";
import "@starlight/living-design/styles.css";
import "@starlight/living-agent-ui/styles.css";
import "@starlight/living-agent-ui/demo.css";
import "@fontsource/instrument-sans/latin-400.css";
import "@fontsource/instrument-sans/latin-500.css";
import "@fontsource/instrument-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
export const metadata = {
  title: "Starlight Living Agent UI / Next.js consumer",
  description:
    "An independently installed Next.js App Router consumer of the packaged Starlight UI.",
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
