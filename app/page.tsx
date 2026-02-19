"use client";

import { useState, useEffect } from "react";
import {Robot, MovementHistory} from "../types/robot";
import {Table, Block} from "../types/table";
import Grid from "../components/grid";
import ReportDisplay from "../components/report_Display";
import { LeftControlButton, MoveButton, RightControlButton, ReportButton } from "../components/control_buttons";
import "./mainpage.css";
import { apiCreateTable, apiGetTable } from "../api-handlers/table-api";
import { apiCreateRobot, apiTurnRobotLeft, apiTurnRobotRight, apiMoveRobot, apiGetRobotsById, apiForceMoveRobot } from "../api-handlers/robot-api";
import { apiReportRobot } from "../api-handlers/report-api";
import { apiGetExistingTableAndRobot } from "../api-handlers/startup-api";
import { useArrowKeyControls } from "@/components/keys_controls";

type MoveDir = "north" | "south" | "east" | "west";


export default function Home() 
{

  const xWidth = 5
  const yHeight = 5
  const maxRobots = 1
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block|null>(null);
  const [selectedRobot, setSelectedRobot] = useState<Robot|null>(null);
  const [currentRobotList, setCurrentRobotList] = useState<Robot[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [history, setHistory] = useState<MovementHistory[]>([]);

  async function onBlockClick(block: Block) 
  {
    setShowReport(false);
    setSelectedBlock(block);
    const table = currentTable ?? (await apiGetTable(block.tableId));
    const robotIds = table.robotIds ?? [];
    const hasRobotOnTable = robotIds.length > 0;
    let robotToUse = selectedRobot;

    if (hasRobotOnTable && !robotToUse) 
    {
      const existingId = robotIds[0]; 
      robotToUse = currentRobotList.find(r => r.id === existingId) ?? null;
      if (!robotToUse) 
      {
        const list = await apiGetRobotsById(robotIds); setCurrentRobotList(list);
        robotToUse = list.find(r => r.id === existingId) ?? null;
      }
      setSelectedRobot(robotToUse);
    }

    if (!hasRobotOnTable) 
    {
      if (block.robotId !== null) return; 
      const newRobotId = await apiCreateRobot(block.xCord, block.yCord, block.tableId);

      const updatedTable = await apiGetTable(block.tableId); setCurrentTable(updatedTable);
      const updatedRobotList = await apiGetRobotsById(updatedTable.robotIds); setCurrentRobotList(updatedRobotList);
      const createdRobot = updatedRobotList.find(r => r.id === newRobotId) ?? null; setSelectedRobot(createdRobot);
      const history = await apiReportRobot(newRobotId); setHistory(history);

      return;
    }

    if (!robotToUse?.id) 
    {
      console.warn("Robot exists on table, but no robot is currently selected. Force move not executed.");
      return;
    }
    await apiForceMoveRobot(block.xCord, block.yCord, block.tableId, robotToUse.id);

    const updatedTable = await apiGetTable(block.tableId); setCurrentTable(updatedTable);
    const updatedRobotList = await apiGetRobotsById(updatedTable.robotIds); setCurrentRobotList(updatedRobotList);
    const history = await apiReportRobot(robotToUse.id); setHistory(history);
    
  }

  async function updateRobotDirection(robotId: string) 
  {
    const currentRobotList = await apiGetRobotsById(currentTable!.robotIds); setCurrentRobotList(currentRobotList);
    const updatedRobot = currentRobotList.find((r: Robot) => r.id === robotId);

    if (updatedRobot) 
    {
      setSelectedRobot(updatedRobot);
    } 
    else 
    {
      console.error(`Robot with the id ${robotId} is not found in currentRobotList.`);
    }
  }

  async function updateRobotPosition(tableId: string) 
  {
    const updatedTable = await apiGetTable(tableId); setCurrentTable(updatedTable);
    const currentRobotList = await apiGetRobotsById(updatedTable.robotIds); setCurrentRobotList(currentRobotList);
    
    if (!selectedRobot) return;

    const history = await apiReportRobot(selectedRobot.id); setHistory(history);
  }


  const refreshAfterKey = async () => {
    if (!currentTable || !selectedRobot) return;

    // refresh table + robot list
    const updatedTable = await apiGetTable(currentTable.id);
    setCurrentTable(updatedTable);

    const robots = await apiGetRobotsById(updatedTable.robotIds ?? []);
    setCurrentRobotList(robots);

    const updatedSelected = robots.find(r => r.id === selectedRobot.id) ?? null;
    setSelectedRobot(updatedSelected);

    if (updatedSelected) {
      const h = await apiReportRobot(updatedSelected.id);
      setHistory(h);
    }

    setShowReport(false);
  };

  useArrowKeyControls(
  {
    robotId: selectedRobot?.id ?? null,
    tableId: currentTable?.id ?? null,
    onAfterAction: refreshAfterKey,
  });

  
  useEffect(() => 
  {
    (async () => 
    {
      try 
      {
        const startup = await apiGetExistingTableAndRobot();
        let table = startup.table;

        if (!table) 
        {
          console.log("No existing table found. Creating new table...");
          table = await apiCreateTable(xWidth, yHeight, maxRobots);
        }

        if (!table) throw new Error("Failed to load or create table");

        setCurrentTable(table);
        const robotIds = table.robotIds ?? [];
        
        if (robotIds.length > 0) 
        {
          const robots = await apiGetRobotsById(robotIds); setCurrentRobotList(robots);
          const firstRobot = robots[0] ?? null; setSelectedRobot(firstRobot);
          if (firstRobot) {const h = await apiReportRobot(firstRobot.id); setHistory(h);} 
          else {setHistory([]);}
        } 
        else 
        {
            setCurrentRobotList([]);
            setSelectedRobot(null);
            setHistory([]);
          }
        } catch (e) {console.error(e);}

      })();
    }, []);

  return (
    <div className="page-container">
      {currentTable ? (
        <>
          {showReport && selectedRobot && history.length > 0 &&(
          <>
            <ReportDisplay
              xCord={history[0].xCord}
              yCord={history[0].yCord}
              direction={selectedRobot.currentDirection}
            />
          </>
          )}
          <div className="table-container">
            <Grid
              table={currentTable}
              robots={currentRobotList}
              onBlockClick={onBlockClick}
            />
          </div>

          <div className="control-buttons-container">
            <LeftControlButton
              onClick={async () => {
                if (!selectedRobot) return;
                await apiTurnRobotLeft(selectedRobot.id);
                await updateRobotDirection(selectedRobot.id);
                setShowReport(false);
              }}
            />
            <MoveButton
              onClick={async () => {
                if (!selectedRobot) return;
                await apiMoveRobot(selectedRobot.id, currentTable.id);
                await updateRobotPosition(currentTable.id);
                setShowReport(false);
              }}
            />
            <RightControlButton
              onClick={async () => {
                if (!selectedRobot) return;
                await apiTurnRobotRight(selectedRobot.id);
                await updateRobotDirection(selectedRobot.id);
                setShowReport(false);
              }}
            />
          </div>

          <ReportButton
            onClick={async () => {
              if (!selectedRobot) return;
              setShowReport(true);
              await apiReportRobot(selectedRobot.id);
          }}/>
        </>
      ) : (
        <p>Loading table...</p>
      )}
    </div>
  );
}