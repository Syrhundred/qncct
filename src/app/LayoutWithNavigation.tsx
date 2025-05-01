"use client";

import Navbar from "@/widgets/navbar/Navbar";
import PageTransition from "@/shared/ui/page-transition/PageTransition";
import Toaster from "@/shared/ui/toaster/Toaster";

export default function LayoutWithNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <Toaster />
      <PageTransition>{children}</PageTransition>
      <Navbar />
    </>
  );
}
