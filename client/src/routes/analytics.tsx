import AnalyticsPage from "@/pages/AnalyticsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  context: () => ({
    title: "Analytics - Pennywise",
  }),
});
