import {Robot, MovementHistory } from "../../types/robot";
import {Table} from "../../types/table";
import { GetAllTables } from "../repo/tables.repo";
import { GetAllRobots, GetRobotById } from "../repo/robot.repo";
import { GetTableById } from "./table_services";

export const GetInitialTableAndRobot = (): { table: Table | null; robot: Robot | null } => {
  const tables = GetAllTables();
  if (tables.length === 0) return { table: null, robot: null };

  const table = GetTableById(tables[0].id);

  const robots = GetAllRobots();
  if (robots.length === 0) return { table, robot: null };

  const robot = GetRobotById(robots[0].id);
  return { table, robot };
};

