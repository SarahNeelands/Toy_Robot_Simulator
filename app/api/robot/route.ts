import { NextResponse } from "next/server";
import { CreateNewRobot, TurnRobotLeft, TurnRobotRight, MoveRobot, GetRobotsById, ForceMovementHistory, ForceMoveInDirection } from "../../../backend/services/robot_services";
import { CreateMovementHistory } from "@/backend/repo/robot.repo";
type MoveDir = "north" | "south" | "east" | "west";
type DirectionAction = "left" | "right" | "move" | "keys";
export async function POST(request: Request) 
{
  try 
  {
    const body = (await request.json()) as {xCord: number, yCord: number, tableId: string, robotId?: string};

    // type check
    if (typeof body.xCord !== "number" || typeof body.yCord !== "number" || typeof body.tableId !== "string" || (body.robotId !== undefined && typeof body.robotId !== "string")) 
    {
      throw new Error("Invalid request body.");
    }

    // value check
    if ( body.xCord < 0 || body.yCord < 0 || body.tableId === "") 
    {
      throw new Error("Invalid request body. xCord, yCord must be greater than or equal to 0 and tableId must be a non-empty string.");
    }

    if (body.robotId === null || body.robotId === undefined) 
    {
      const robot = await CreateNewRobot(body.xCord, body.yCord, body.tableId);
      return NextResponse.json(robot);
    } 
    else 
    {
       const history = await ForceMovementHistory(body.xCord, body.yCord, body.tableId, body.robotId);
       return NextResponse.json(history);
    }
  } catch (e) 
  {
    return NextResponse.json(
      { error: (e as Error).message ?? "Unknown error in CreateRobot endpoint" },
      { status: 500}
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { direction, robotId, tableId, moveDir } = body as {
      direction?: string;
      robotId?: string;
      tableId?: string;
      moveDir?: string;
    };

    if (typeof direction !== "string" || typeof robotId !== "string") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const allowed: DirectionAction[] = ["left", "right", "move", "keys"];
    if (!allowed.includes(direction as DirectionAction)) {
      return NextResponse.json(
        { error: "Invalid request body. direction must be left, right, move, or keys." },
        { status: 400 }
      );
    }

    switch (direction as DirectionAction) {
      case "left":
        TurnRobotLeft(robotId);
        break;

      case "right":
        TurnRobotRight(robotId);
        break;

      case "move":
        if (typeof tableId !== "string") {
          return NextResponse.json({ error: "tableId is required for move." }, { status: 400 });
        }
        MoveRobot(robotId, tableId);
        break;

      case "keys":
        if (typeof tableId !== "string") {
          return NextResponse.json({ error: "tableId is required for keys." }, { status: 400 });
        }
        if (typeof moveDir !== "string") {
          return NextResponse.json({ error: "moveDir is required for keys." }, { status: 400 });
        }
        if (!["north", "south", "east", "west"].includes(moveDir)) {
          return NextResponse.json(
            { error: "moveDir must be north, south, east, or west." },
            { status: 400 }
          );
        }

        ForceMoveInDirection(robotId, tableId, moveDir as MoveDir);
        break;
    }

    return NextResponse.json({ robotId });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Unknown error in robot PATCH endpoint" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) 
{
  try 
  {
    const url = new URL(request.url);
    const robotIds = url.searchParams.getAll("robotId"); // string[]

    if (robotIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. No robotId provided." },
        { status: 400 }
      );
    }

    const robots = await GetRobotsById(robotIds);
    return NextResponse.json({ robots }, { status: 200 });
  } 
  catch (e: unknown) 
  {
    const message = e instanceof Error ? e.message : "Unknown error in GetRobotsById endpoint";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}