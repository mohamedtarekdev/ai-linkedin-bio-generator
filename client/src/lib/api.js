const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export async function generateLinkedIn(payload) {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}
