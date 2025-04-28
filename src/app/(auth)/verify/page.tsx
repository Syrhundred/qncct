import Verify from "@/modules/templates/auth/verify";
import React, { Suspense } from "react";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify />
    </Suspense>
  );
}
