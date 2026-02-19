import { NextResponse } from "next/server";
import { CreateNewTable, GetTableById } from "../../../backend/services/table_services";

export async function POST(request: Request) 
{
  try {
    const body = (await request.json()) as {xWidth: number, yHeight: number, maxOccupants: number};
    
    // type check
    if (typeof body.xWidth !== "number" || typeof body.yHeight !== "number" || typeof body.maxOccupants !== "number") 
    {
      throw new Error("Invalid request body.");
    }

    // value check
    if (body.xWidth <= 0 || body.yHeight <= 0 || body.maxOccupants <= 0) 
    {
      throw new Error("Invalid request body. width, height and maxOccupants must be greater than 0.");
    }

    const table = await CreateNewTable(body.xWidth, body.yHeight,body.maxOccupants);
    return NextResponse.json(table);
  }
  catch (e) 
  {
    return NextResponse.json(
      { error: (e as Error).message ?? "Unknown error in CreateTable endpoint" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) 
{
  try 
  {
    const tableId = new URL(request.url).searchParams.get("tableId");
    if (tableId === null) {throw new Error("Invalid request. tableId is required.")}

    // value check
    if (tableId.length !== 36) {throw new Error("Invalid tableId. Must be a 36 character string.");}

    const table = await GetTableById(tableId);
    if (!table) {return NextResponse.json({ error: "Table not found." }, { status: 404 });}
    return NextResponse.json(table);

  } 
  catch (e) 
  {
    return NextResponse.json(
      { error: (e as Error).message ?? "Unknown error in FetchTable endpoint" },
      { status: 400 }
    );
  }
}

