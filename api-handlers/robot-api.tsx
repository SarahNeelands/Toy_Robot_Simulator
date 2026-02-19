import { Robot } from "@/types/robot";

type RobotAction = "left" | "right" | "move" | "keys";
type MoveDir = "north" | "south" | "east" | "west";
export async function apiCreateRobot(xCord: number, yCord: number, tableId: string) {
  let res: Response;
  try {
    res = await fetch("/api/robot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xCord, yCord, tableId }),
    });
  } catch (e) {
    console.log("2: fetch threw (network error):", e);
    throw e;
  }
  const raw = await res.text();

  if (!res.ok) throw new Error(raw || "Create robot failed");
  return raw ? JSON.parse(raw) : null;
}

export async function apiForceMoveRobot(
  xCord: number,
  yCord: number,
  tableId: string,
  robotId: string
) {
  const res = await fetch("/api/robot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xCord, yCord, tableId, robotId, force: true }),
    cache: "no-store",
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(raw || "force move robot failed");
  return raw ? JSON.parse(raw) : null;
}


async function apiRobotAction(
  direction: RobotAction,
  robotId: string,
  tableId?: string,
  moveDir?: MoveDir
) {
  const payload =
    direction === "move"
      ? { direction, robotId, tableId }
      : direction === "keys"
        ? { direction, robotId, tableId, moveDir }
        : { direction, robotId };

  const res = await fetch("/api/robot", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Robot action failed");
  return data;
}

export async function apiGetRobotsById(robotIds: string[]): Promise<Robot[]> {
  if (robotIds.length === 0) return [];

  const params = new URLSearchParams();
  robotIds.forEach((id) => params.append("robotId", id));

  const res = await fetch(`/api/robot?${params.toString()}`, { method: "GET" });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Get robots by id failed");

  return data.robots ?? data;
}

export function apiTurnRobotLeft(robotId: string) {
  return apiRobotAction("left", robotId);
}

export function apiTurnRobotRight(robotId: string) {
  return apiRobotAction("right", robotId);
}

export function apiMoveRobot(robotId: string, tableId: string) {
  return apiRobotAction("move", robotId, tableId);
}
export function apiKeysMoveRobot(robotId: string, tableId: string, moveDir: MoveDir) {
  return apiRobotAction("keys", robotId, tableId, moveDir);
}
