import DashboardPage from "@/pages/DashboardPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  context: () => ({
    title: "Dashboard - Pennywise",
  }),
});
