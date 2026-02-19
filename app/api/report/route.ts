import { NextResponse } from "next/server";
import { GetRobotMovementHistory } from "../../../backend/services/robot_services";

export async function POST(request: Request) 
{
  try 
  {
    const body = (await request.json()) as {robotId: string};

    // type check
    if (typeof body.robotId !== "string") 
    {
      throw new Error("Invalid request body.");
    }
    const robotHistory = await GetRobotMovementHistory(body.robotId);
    return NextResponse.json(robotHistory);
  } 
  catch (e) 
  {
    return NextResponse.json(
      { error: (e as Error).message ?? "Unknown error in ReportRobot endpoint" },
      { status: 500}
    );
  }
}