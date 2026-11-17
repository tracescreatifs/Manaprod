import { redirect } from "next/navigation";

// /admin ouvre le premier onglet du dashboard.
export default function AdminIndex() {
  redirect("/admin/showreel");
}
