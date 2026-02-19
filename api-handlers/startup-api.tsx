import { Table } from "../types/table";
import { Robot } from "../types/robot";
type StartupResponse = {
  table: Table | null;
  robot: Robot | null;
};

export async function apiGetExistingTableAndRobot(): Promise<StartupResponse> {
  const res = await fetch("/api/startup", { method: "GET", cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Get existing table failed");
  return data as StartupResponse;
}