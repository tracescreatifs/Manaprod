import type { ActionState } from "@/lib/admin/action-state";

// Message global d'un formulaire, annoncé aux lecteurs d'écran (aria-live).
export function FormMessage({ state }: { state: ActionState }) {
  const isError = state.status === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`text-[15px] empty:hidden ${isError ? "text-danger" : "text-teal"}`}
    >
      {state.message ?? ""}
    </p>
  );
}
