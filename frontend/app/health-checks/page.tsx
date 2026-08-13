import { redirect } from "next/navigation";
export default function HealthChecksPage() {
  redirect("/coming-soon?section=health-checks");
}
