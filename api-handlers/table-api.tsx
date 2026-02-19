import { Table } from "../types/table";

export async function apiCreateTable(xWidth: number, yHeight: number, maxOccupants: number) {
  const res = await fetch("/api/table", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xWidth, yHeight, maxOccupants }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Create table failed");
  return data;
}

export async function apiGetTable(tableId: string) {
  const res = await fetch(`/api/table?tableId=${encodeURIComponent(tableId)}`, {
    method: "GET",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Get table failed");
  return data as Table;
}