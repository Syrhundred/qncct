"use client";

import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import Script from "next/script";
import { Poppins } from "next/font/google";
import PageTransition from "@/shared/ui/page-transition/PageTransition";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`bg-background ${poppins.className}`}>
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
