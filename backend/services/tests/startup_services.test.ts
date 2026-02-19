import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../repo/tables.repo", () => ({
  GetAllTables: vi.fn(),
}));

vi.mock("../../repo/robot.repo", () => ({
  GetAllRobots: vi.fn(),
  GetRobotById: vi.fn(),
}));

vi.mock("../table_services", () => ({
  GetTableById: vi.fn(),
}));


import { GetInitialTableAndRobot } from "../startup_services";
import { GetAllTables } from "../../repo/tables.repo";
import { GetAllRobots, GetRobotById } from "../../repo/robot.repo";
import { GetTableById } from "../table_services";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GetInitialTableAndRobot", () => {
  it("returns nulls when no tables exist", () => {
    (GetAllTables as any).mockReturnValue([]);

    const result = GetInitialTableAndRobot();

    expect(result).toEqual({ table: null, robot: null });
    expect(GetTableById).not.toHaveBeenCalled();
    expect(GetAllRobots).not.toHaveBeenCalled();
    expect(GetRobotById).not.toHaveBeenCalled();
  });

  it("returns table and null robot when no robots exist", () => {
    (GetAllTables as any).mockReturnValue([{ id: "t1" }]);
    (GetTableById as any).mockReturnValue({ id: "t1", robotIds: [], grid: [] });
    (GetAllRobots as any).mockReturnValue([]);

    const result = GetInitialTableAndRobot();

    expect(GetTableById).toHaveBeenCalledWith("t1");
    expect(result).toEqual({
      table: { id: "t1", robotIds: [], grid: [] },
      robot: null,
    });
    expect(GetRobotById).not.toHaveBeenCalled();
  });

  it("returns first table and first robot when both exist", () => {
    (GetAllTables as any).mockReturnValue([{ id: "t1" }, { id: "t2" }]);
    (GetTableById as any).mockReturnValue({ id: "t1", robotIds: ["r1"], grid: [] });

    (GetAllRobots as any).mockReturnValue([{ id: "r1" }, { id: "r2" }]);
    (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "north" });

    const result = GetInitialTableAndRobot();

    expect(GetTableById).toHaveBeenCalledWith("t1");
    expect(GetRobotById).toHaveBeenCalledWith("r1");
    expect(result).toEqual({
      table: { id: "t1", robotIds: ["r1"], grid: [] },
      robot: { id: "r1", currentDirection: "north" },
    });
  });

  it("throws if GetTableById throws", () => {
    (GetAllTables as any).mockReturnValue([{ id: "t1" }]);
    (GetTableById as any).mockImplementation(() => {
      throw new Error("table not found");
    });

    expect(() => GetInitialTableAndRobot()).toThrow("table not found");
  });

  it("throws if GetRobotById throws", () => {
    (GetAllTables as any).mockReturnValue([{ id: "t1" }]);
    (GetTableById as any).mockReturnValue({ id: "t1", robotIds: ["r1"], grid: [] });

    (GetAllRobots as any).mockReturnValue([{ id: "r1" }]);
    (GetRobotById as any).mockImplementation(() => {
      throw new Error("robot not found");
    });

    expect(() => GetInitialTableAndRobot()).toThrow("robot not found");
  });
});
