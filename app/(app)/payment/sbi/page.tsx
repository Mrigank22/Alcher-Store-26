import { Suspense } from "react";
import SBIPaymentClient from "./SBIPaymentClient";

export default function Page() {
  return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading payment…</div>}>
        <SBIPaymentClient />
      </Suspense>
  );
}
