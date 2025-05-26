import { Suspense } from "react";
import GooglePageBallout from "./ballout";

export default function GooglePage() {
  return (
    <Suspense fallback={<div>Завантаження...</div>}>
      <GooglePageBallout />
    </Suspense>
  );
}
