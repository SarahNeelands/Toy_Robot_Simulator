
import {Block, Table} from "../../types/table";
import {  GetTableInfoById, 
          CreateTable, 
          CreateBlock, 
          GetBlocksByTableIdAndCoordinates, 
          UpdateBlockInformation,
          GetBlocksByTableId,
          GetRobotIdsByTableId,
          UpdateTableRobotIds,
          RemoveTableRobotId
        } from "../repo/tables.repo";
import { GetRobotById, CreateRobot, DeleteRobotById, GetMovementHistoryByRobotId } from "../repo/robot.repo";


export const CreateNewTable = (xWidth: number, yHeight:number, maxRobots: number): Table =>
{
  const tableId = CreateTable(xWidth, yHeight, maxRobots);
  CreateBlocks(xWidth, yHeight, tableId);
  const newTable = GetTableById(tableId);
  return newTable;
}

export const CreateBlocks = (xWidth: number, yHeight: number, tableId: string): void => 
{
  for (let y =yHeight-1; y>=0; y--) 
  {
    for (let x =xWidth-1; x>=0; x--) 
    {
      CreateBlock(tableId, x, y)
    }
  }
}

export const GetTableById = (tableId: string): Table => 
{
  const table = GetTableInfoById(tableId);
  const blocks: Block[] = GetBlocksByTableId(tableId).map((block) => 
  ({
    tableId: tableId,
    xCord: block.xCord,
    yCord: block.yCord,
    robotId: block.robotId,
  }));


  const newTable: Table =
  {
    id: tableId,
    xWidth: table.xWidth,
    yHeight: table.yHeight,
    grid: blocks,
    maxOccupants: table.maxOccupants,
    robotIds: GetRobotIdsByTableId(tableId)
  }
  return newTable;
}





export const RobotsPositionOnTable = (tableId: string, robotId: string ): void => 
{
  const robot = GetRobotById(robotId);
  const movementHistory = GetMovementHistoryByRobotId(robotId);
  const table = GetTableById(tableId);
  const updatedBlock = GetBlocksByTableIdAndCoordinates(tableId, movementHistory[0].xCord, movementHistory[0].yCord);


  if (table.maxOccupants === table.robotIds.length && !table.robotIds.includes(robotId)) 
  {
    const oldestRobotId = table.robotIds.shift();
    if (!oldestRobotId) {throw new Error("at Max occupants but no robotIds were found to remove.");}
    DeleteRobotById(oldestRobotId);
    RemoveTableRobotId(tableId, oldestRobotId);

    table.robotIds.push(robotId);
  }
  else if (!table.robotIds.includes(robotId)) {
    table.robotIds.push(robotId);
    UpdateTableRobotIds(tableId, robotId);
  }
  else 
  {
    const oldBlock = GetBlocksByTableIdAndCoordinates(tableId, movementHistory[1].xCord, movementHistory[1].yCord);
    oldBlock.robotId = null;
    UpdateBlockInformation(oldBlock.tableId, oldBlock.xCord, oldBlock.yCord, oldBlock.robotId);
  }
  updatedBlock.robotId = robotId;
  UpdateBlockInformation(updatedBlock.tableId, updatedBlock.xCord, updatedBlock.yCord, updatedBlock.robotId);
}
