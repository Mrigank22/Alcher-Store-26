import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        <p className="text-gray-600">
          Logged in as{" "}
          <span className="font-semibold">{session.user?.name}</span>
        </p>
      </div>
    </div>
  );
}
