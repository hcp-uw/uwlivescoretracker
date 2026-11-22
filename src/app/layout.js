import { Montserrat } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SportNav from "@/components/SportNav";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "UW Score Tracker",
  description: "Live scores for every University of Washington Division I sport.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`app-shell ${montserrat.className}`}>
        <SiteHeader />
        <SportNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
