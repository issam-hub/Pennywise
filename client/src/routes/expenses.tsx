import ExpensesPage from "@/pages/ExpensesPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/expenses")({
  component: ExpensesPage,
  context: () => ({
    title: "Expenses - Pennywise",
  }),
});
