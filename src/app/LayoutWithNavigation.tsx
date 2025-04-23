"use client";

import Navbar from "@/widgets/navbar/Navbar";
import PageTransition from "@/shared/ui/page-transition/PageTransition";

export default function LayoutWithNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageTransition>{children}</PageTransition>
      <Navbar />
    </>
  );
}
