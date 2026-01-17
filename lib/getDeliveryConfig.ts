// Utility to fetch DeliveryConfig from API
export async function getDeliveryConfig(host: string) {
  const res = await fetch(`http://${host}/api/admin/delivery-config`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch delivery config");
  return res.json();
}
