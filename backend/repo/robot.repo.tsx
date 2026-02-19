import {db} from "../database/db";
import {MovementHistory, Robot} from "../../types/robot";
import { randomUUID } from "crypto";

export const CreateRobot = (currentDirection: string): string => 
{
    const robotId = randomUUID();
    const stmt = db.prepare(`
        INSERT INTO robots (id, currentDirection)
        VALUES (?, ?)`);

    try 
    {
        stmt.run(robotId, currentDirection);
        return robotId;
    } 
    catch (error) {throw new Error(`Repo CreateRobot failed: ${(error as Error).message}`);}
}
//====================================================================================================================
export const CreateMovementHistory = (robotId: string, xCord: number, yCord: number, direction: string): void => 
{
    const stmt = db.prepare(`
        INSERT INTO movementHistory (robotId, xCord, yCord, direction)
        VALUES (?, ?, ?, ?)`);
    
    try 
    {
        stmt.run(robotId, xCord, yCord, direction);
    } 
    catch (error) { throw new Error(`Repo CreateMovementHistory failed: ${(error as Error).message}`);}
}
//====================================================================================================================
export const GetMovementHistoryByRobotId = (id: string): MovementHistory[] => 
{
  const stmt = db.prepare(`
    SELECT xCord, yCord, direction
    FROM movementHistory
    WHERE robotId = ?
    ORDER BY addedAt DESC`);

  try 
  {
    return stmt.all(id) as MovementHistory[];
  } 
  catch (error) {throw new Error(`Repo GetMovementHistoryByRobotId failed: ${(error as Error).message}`);}
};
//====================================================================================================================
export const GetRobotById = (id: string): Robot => 
{
    const stmt = db.prepare(`
        SELECT * FROM robots WHERE id = ? `);
    try 
    {
        const robotData = stmt.get(id) as {id: string, currentDirection: string};
        if (!robotData) { throw new Error(`Repo GetRobotById failed, Robot with id ${id} not found.`);}   
        
        const robot: Robot = 
        {
            id: robotData.id,
            currentDirection: robotData.currentDirection,
        }
        return robot;
    } 
    catch (error) {throw new Error(`Repo GetRobotById failed: ${(error as Error).message}`);}   
}
//====================================================================================================================
export const DeleteRobotById = (robotId: string): void => 
{
    const stmt = db.prepare(`
        DELETE FROM robots WHERE id = ?`);
    try 
    {
        stmt.run(robotId);
    } 
    catch (error) { throw new Error(`Repo DeleteRobotById failed: ${(error as Error).message}`);}
}
//====================================================================================================================
export const UpdateRobotDirection = (robotId: string, newDirection: string): void => 
{
    console.log(`Updating robot ${robotId} direction to ${newDirection}`);
    const stmt = db.prepare(`
        UPDATE robots SET currentDirection = ? WHERE id = ? `);
    try 
    {
        stmt.run(newDirection, robotId);
    } 
    catch (error) {throw new Error(`Repo UpdateRobotDirection failed: ${(error as Error).message}`); }   
}
//====================================================================================================================
export const GetAllRobots = (): Robot[] => 
{
  const stmt = db.prepare(`
    SELECT * FROM robots
    ORDER BY id ASC`);

  try 
  {
    const robots = stmt.all() as { id: string; currentDirection: string }[];
    if (!robots || robots.length === 0) return [];

    return robots.map((robot) => 
    ({
      id: robot.id,
      currentDirection: robot.currentDirection,
    }));

  } 
  catch (error) {throw new Error(`Repo GetAllRobots failed: ${(error as Error).message}`);}
};
