import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Root page — redirect based on role */
export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const role = session.user.role;
  if (role === "SUPER_ADMIN") redirect("/admin");
  if (role === "MANAGER") redirect("/manager");
  redirect("/dashboard");
}
