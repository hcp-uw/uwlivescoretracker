import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SportNav from "@/components/SportNav";

export const metadata = {
  title: "UW Score Tracker",
  description: "Live scores for every University of Washington Division I sport.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <SportNav />
        {children}
      </body>
    </html>
  );
}
