

import { Robot, MovementHistory } from "../types/robot";
import {Table, Block} from "../types/table";
import Image from "next/image";
import "./grid.css";
import { get } from "http";
type GridProps = {
  table: Table;
  robots: Robot[];
  onBlockClick: (block: Block) => void;
}

export function Grid({table, onBlockClick, robots}: GridProps) {

  function getRobot(robotId: string | null): Robot | null {
    if (!robotId) return null;

    const robot = robots.find(r => r.id === robotId);
    return robot ?? null;
  }

  return (
    <div 
      className="grid-container" 
      style={{ display: "inline-grid", 
        alignItems: "center",
        gridTemplateColumns: `repeat(${table.yHeight}, 6vw)`,
        gridTemplateRows: `repeat(${table.xWidth}, 6vw)`,
      }}>

      {table.grid.map((block) => (
        <div key = {"("+ block.xCord + ","+ block.yCord+ ")"}  className="block-container">        
          <button 
            className ={block.robotId === null? "empty-block" : "occupied-block"}
            onClick={()=>{onBlockClick(block)}}>
          </button>
          {(() => {
            const robot = getRobot(block.robotId);
            if (!robot) return null;

            return (
              <Image
                className="robot"
                src={`/images/robot-${robot.currentDirection}.png`}
                alt={`robot-${robot.currentDirection}`}
                fill
              />
            );
          })()}
        </div>
      ))}
    </div>
  )
}
export default Grid;