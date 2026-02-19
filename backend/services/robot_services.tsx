import { Robot, MovementHistory } from "../../types/robot";
import { RobotsPositionOnTable } from "./table_services";
import { GetRobotById, CreateRobot, CreateMovementHistory, UpdateRobotDirection, GetMovementHistoryByRobotId } from "../repo/robot.repo";
import { GetTableInfoById } from "../repo/tables.repo";

/* List of services related to robot operations: 
= CreateNewRobot(xCord: number, yCord: number, tableId: string): string
= TurnRobotLeft(robotId: string): void
= TurnRobotRight(robotId: string): void
= MoveRobot(robotId: string, tableId: string): void
= GetRobotsById(robotIds: string[]): Robot[]
= GetRobotMovementHistory(robotId: string): MovementHistory[]
= ForceMovementHistory(xCord: number, yCord: number, tableId: string, robotId: string): String
= ForceMoveInDirection(robotId: string, tableId: string, moveDir: MoveDir): void  
*/
export const CreateNewRobot = (xCord: number, yCord: number, tableId: string, ): string => 
{
  const robotId = CreateRobot("north");
  CreateMovementHistory(robotId, xCord, yCord, "north");
  RobotsPositionOnTable(tableId, robotId);
  return robotId;
}

export const TurnRobotLeft = (robotId: string): void => 
{
  const robot = GetRobotById(robotId);
  switch (robot.currentDirection) {
    case "north":
      UpdateRobotDirection(robotId, "west");
      break;
    case "west":
      UpdateRobotDirection(robotId, "south");
      break;
    case "south":
      UpdateRobotDirection(robotId, "east");
      break;
    case "east":
      UpdateRobotDirection(robotId, "north");
      break;
  }
}

export const TurnRobotRight = (robotId: string): void => 
{
  const robot = GetRobotById(robotId);
  switch (robot.currentDirection) 
  {
    case "north":
      UpdateRobotDirection(robotId, "east");
      break;
    case "east":
      UpdateRobotDirection(robotId, "south");
      break;
    case "south":
      UpdateRobotDirection(robotId, "west");
      break;
    case "west":
      UpdateRobotDirection(robotId, "north");
      break;
  }
}

export const MoveRobot = (robotId: string, tableId: string): void => 
{
  const robot = GetRobotById(robotId);
  const movementHistory = GetMovementHistoryByRobotId(robotId);
  const lastmovement = movementHistory[0];
  let xCord = lastmovement.xCord;
  let yCord = lastmovement.yCord;
  switch (robot.currentDirection) 
  {
    case "north":
      yCord += 1;
      break;
    case "south":
      yCord -= 1;
      break;
    case "east":
      xCord += 1;
      break;
    case "west":
      xCord -= 1;
      break;
  }
  const table = GetTableInfoById(tableId);
  if (xCord < 0 || xCord >= table.xWidth || yCord < 0 || yCord >= table.yHeight) {return ;}
  CreateMovementHistory(robotId, xCord, yCord, robot.currentDirection);
  RobotsPositionOnTable(tableId, robotId);
}

export const GetRobotsById = (robotIds: string[]): Robot[] => 
{
  if (robotIds.length === 0) {throw new Error("No robotIds are given.");}
  const robots: Robot[] = [];
  for (const robotId of robotIds) {
    robots.push(GetRobotById(robotId));
  }
  return robots;
}


export const GetRobotMovementHistory = (robotId: string): MovementHistory[] => 
{
  return GetMovementHistoryByRobotId(robotId);
}

export const ForceMovementHistory = (xCord: number, yCord: number, tableId: string, robotId: string): String => 
{
  const robot = GetRobotById(robotId);
  CreateMovementHistory(robotId, xCord, yCord, robot.currentDirection);
  RobotsPositionOnTable(tableId, robotId);
  return robotId;
}

type MoveDir = "north" | "south" | "east" | "west";

export const ForceMoveInDirection = (robotId: string, tableId: string, moveDir: MoveDir): void => 
{
  const movementHistory = GetMovementHistoryByRobotId(robotId);
  if (!movementHistory || movementHistory.length === 0) return;

  const last = movementHistory[0];
  let xCord = last.xCord;
  let yCord = last.yCord;

  switch (moveDir) 
  {
    case "north":
      yCord += 1;
      break;
    case "south":
      yCord -= 1;
      break;
    case "east":
      xCord += 1;
      break;
    case "west":
      xCord -= 1;
      break;
  }

  const table = GetTableInfoById(tableId);
  if (xCord < 0 || xCord >= table.xWidth || yCord < 0 || yCord >= table.yHeight) return;

  UpdateRobotDirection(robotId, moveDir);
  CreateMovementHistory(robotId, xCord, yCord, moveDir);
  RobotsPositionOnTable(tableId, robotId);
};
