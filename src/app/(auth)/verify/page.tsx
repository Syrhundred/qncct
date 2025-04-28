import dynamic from "next/dynamic";
import React, { Suspense } from "react";

// Dynamically import the Verify component
const Verify = dynamic(() => import("@/modules/templates/auth/verify"), {
  suspense: true, // enable Suspense with dynamic import
});

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify />
    </Suspense>
  );
}
