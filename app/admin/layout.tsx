import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import User from "../../models/User";
import { connectDB } from "../../lib/mongodb";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
