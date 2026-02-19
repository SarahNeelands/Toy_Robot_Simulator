
import {db} from "../database/db";
import { randomUUID } from "crypto";

export const CreateTable = (xWidth: number, yHeight: number, maxOccupants: number): string => 
{
    const tableId = randomUUID();
    const stmt = db.prepare(`
        INSERT INTO tables (id, xWidth, yHeight, maxOccupants)
        VALUES (?, ?, ?, ?)`);     
    try 
    {
        stmt.run(tableId, xWidth, yHeight, maxOccupants);
        return tableId;
    } 
    catch (error) {throw new Error(`Repo CreateTable failed: ${(error as Error).message}`);}
}
//====================================================================================================================
export const CreateBlock = (tableId: string, xCord: number, yCord: number): void => 
{
    const stmt = db.prepare(`
        INSERT INTO blocks (tableId, xCord, yCord, robotId)
        VALUES (?, ?, ?, ?) `);
    try 
    {
        stmt.run(tableId, xCord, yCord, null);
    } 
    catch (error) {throw new Error(`Repo CreateBlock failed: ${(error as Error).message}`);}
}
//====================================================================================================================
export const GetTableInfoById = (id: string): {xWidth: number, yHeight: number, maxOccupants: number, id: string} => 
{
    const stmt = db.prepare(`
        SELECT * FROM tables WHERE id = ? `);

    try 
    {
        const table = stmt.get(id) as {xWidth: number, yHeight: number, maxOccupants: number, id: string};
        if (!table) {throw new Error(`Table with id ${id} not found.`);} 
        return table;
    }
    catch (error) {throw new Error(`Repo GetTableById failed: ${(error as Error).message}`); }
} 
//====================================================================================================================
export const GetBlocksByTableId = (tableId: string): { xCord: number; yCord: number; robotId: string | null }[] => 
{
  const stmt = db.prepare(`
    SELECT xCord, yCord, robotId
    FROM blocks
    WHERE tableId = ?
    ORDER BY yCord DESC, xCord ASC `);

  try 
  {
    const blocks = stmt.all(tableId) as { xCord: number; yCord: number; robotId: string | null }[];
    if (!blocks || blocks.length === 0) throw new Error(`Blocks for tableId ${tableId} not found.`);
    return blocks;
  } 
  catch (error) {throw new Error(`Repo GetBlocksByTableId failed: ${(error as Error).message}`);}
};
//====================================================================================================================
export const GetRobotIdsByTableId = (tableId: string): string[] => 
{
    const stmt = db.prepare(`
        SELECT DISTINCT robotId FROM tableRobots WHERE tableId = ? AND robotId IS NOT NULL ORDER BY addedAt ASC `);
    try 
    {
        const rows = stmt.all(tableId) as {robotId: string}[];
        return rows.map(row => row.robotId);
    } 
    catch (error) {throw new Error(`Repo GetRobotIdsByTableId failed: ${(error as Error).message}`);}
}

//====================================================================================================================
export const GetBlocksByRobotIdAndTableId = (robotId: string, tableId: string): {tableId: string, xCord: number, yCord: number, robotId: string | null} => 
{
    const stmt = db.prepare(`
        SELECT * FROM blocks WHERE tableId = ? AND robotId = ?`);
    try 
    {
        const blockData = stmt.get(tableId, robotId) as {tableId: string, xCord: number, yCord: number, robotId: string | null};
        if (!blockData) {
            throw new Error(`Block with robotId ${robotId} and tableId ${tableId} not found.`);
        }
        return blockData;
    } catch (error) { throw new Error(`Repo GetBlocksByRobotIdAndTableId failed: ${(error as Error).message}`);}
}   
//====================================================================================================================
export const GetBlocksByTableIdAndCoordinates = (tableId: string, xCord: number, yCord: number): {tableId: string, xCord: number, yCord: number, robotId: string | null} => 
{
    const stmt = db.prepare(`
        SELECT * FROM blocks WHERE tableId = ? AND xCord = ? AND yCord = ?`);
    try 
    {
        const blockData = stmt.get(tableId, xCord, yCord) as {tableId: string, xCord: number, yCord: number, robotId: string | null};
        if (!blockData) {throw new Error(`Repo GetBlocksByTableIdAndCoordinate Failed: Block with coordinates (${xCord}, ${yCord}) not found for tableId ${tableId}.`);}
        return blockData;
    } 
    catch (error) {throw new Error(`Repo GetBlocksByTableIdAndCoordinates failed: ${(error as Error).message}`);}
}
//====================================================================================================================

export const UpdateBlockInformation = (tableId: string, xCord: number, yCord: number, robotId: string | null): void => 
{
    const stmt = db.prepare(`
        UPDATE blocks SET robotId = ? WHERE tableId = ? AND xCord = ? AND yCord = ? `);
    try 
    {
        stmt.run(robotId, tableId, xCord, yCord);
    } 
    catch (error) {throw new Error(`Repo UpdateBlockInformation failed: ${(error as Error).message}`);}
}
export const UpdateTableRobotIds = (tableId: string, robotId: string): void => {
  const stmt = db.prepare(`
    INSERT INTO tableRobots (tableId, robotId)
        VALUES (?, ?)`); 
  stmt.run(tableId, robotId);
};
//====================================================================================================================
export const RemoveTableRobotId =    (tableId: string, robotId: string): void => {
    const stmt = db.prepare(`
        DELETE FROM tableRobots WHERE tableId = ? AND robotId = ?
    `);
    stmt.run(robotId, tableId);
};
//====================================================================================================================
export const GetAllTables = (): { id: string }[] => 
{
  const stmt = db.prepare(`
    SELECT id FROM tables
    ORDER BY id ASC`);

  try 
  {
    return stmt.all() as { id: string }[];
  } 
  catch (error) {throw new Error(`Repo GetAllTables failed: ${(error as Error).message}`); }
};
//====================================================================================================================