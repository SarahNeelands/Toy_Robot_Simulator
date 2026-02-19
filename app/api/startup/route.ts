import { NextResponse } from "next/server";
import { GetInitialTableAndRobot }  from "../../../backend/services/startup_services";


export async function GET() 
{
  try 
  {
    const { table, robot } = await GetInitialTableAndRobot();
    const robots = robot ? [robot] : [];
    return NextResponse.json({ table, robots }, { status: 200 });
  } 
  catch (e) 
  {
    const message = e instanceof Error ? e.message : "Unknown error in startup endpoint";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
