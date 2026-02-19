import { describe, it, expect, vi, beforeEach } from "vitest";


vi.mock("../../repo/robot.repo", () => ({
  GetRobotById: vi.fn(),
  CreateRobot: vi.fn(),
  CreateMovementHistory: vi.fn(),
  UpdateRobotDirection: vi.fn(),
  GetMovementHistoryByRobotId: vi.fn(),
}));

vi.mock("../../repo/tables.repo", () => ({
  GetTableInfoById: vi.fn(),
}));

vi.mock("../table_services", () => ({
  RobotsPositionOnTable: vi.fn(),
}));

import {
  CreateNewRobot,
  TurnRobotLeft,
  TurnRobotRight,
  MoveRobot,
  GetRobotsById,
  GetRobotMovementHistory,
  ForceMovementHistory,
} from "../robot_services";

import {
  GetRobotById,
  CreateRobot,
  CreateMovementHistory,
  UpdateRobotDirection,
  GetMovementHistoryByRobotId,
} from "../../repo/robot.repo";

import { GetTableInfoById } from "../../repo/tables.repo";
import { RobotsPositionOnTable } from "../table_services";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("robot_services", () => {
  describe("CreateNewRobot", () => {
    it("creates robot facing north, returns id", () => {
      (CreateRobot as any).mockReturnValue("r1");

      const id = CreateNewRobot(2, 3, "t1");

      expect(id).toBe("r1");
      expect(CreateRobot).toHaveBeenCalledWith("north");
      expect(CreateMovementHistory).toHaveBeenCalledWith("r1", 2, 3, "north");
      expect(RobotsPositionOnTable).toHaveBeenCalledWith("t1", "r1");
    });
  });

  describe("TurnRobotLeft", () => {
    it("north -> west", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "north" });
      TurnRobotLeft("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "west");
    });

    it("west -> south", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "west" });
      TurnRobotLeft("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "south");
    });

    it("south -> east", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "south" });
      TurnRobotLeft("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "east");
    });

    it("east -> north", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "east" });
      TurnRobotLeft("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "north");
    });
  });
  describe("TurnRobotRight", () => {
    it("north -> east", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "north" });
      TurnRobotRight("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "east");
    });

    it("east -> south", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "east" });
      TurnRobotRight("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "south");
    });

    it("south -> west", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "south" });
      TurnRobotRight("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "west");
    });

    it("west -> north", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "west" });
      TurnRobotRight("r1");
      expect(UpdateRobotDirection).toHaveBeenCalledWith("r1", "north");
    });
  });

  describe("MoveRobot", () => {
    it("moves robot base on its current direction (north) by increasing/decreasing coordinates", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "north" });
      (GetMovementHistoryByRobotId as any).mockReturnValue([{ xCord: 1, yCord: 1, direction: "north" }]);
      (GetTableInfoById as any).mockReturnValue({ xWidth: 5, yHeight: 5 });

      MoveRobot("r1", "t1");

      expect(CreateMovementHistory).toHaveBeenCalledWith("r1", 1, 2, "north");
      expect(RobotsPositionOnTable).toHaveBeenCalledWith("t1", "r1");
    });

    it("moves robot base on its current direction (east)", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "east" });
      (GetMovementHistoryByRobotId as any).mockReturnValue([{ xCord: 1, yCord: 1, direction: "east" }]);
      (GetTableInfoById as any).mockReturnValue({ xWidth: 5, yHeight: 5 });

      MoveRobot("r1", "t1");

      expect(CreateMovementHistory).toHaveBeenCalledWith("r1", 2, 1, "east");
      expect(RobotsPositionOnTable).toHaveBeenCalledWith("t1", "r1");
    });

    it("does nothing if move would go out of bounds (negative)", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "south" });
      (GetMovementHistoryByRobotId as any).mockReturnValue([{ xCord: 0, yCord: 0, direction: "south" }]);
      (GetTableInfoById as any).mockReturnValue({ xWidth: 5, yHeight: 5 });

      MoveRobot("r1", "t1");

      expect(CreateMovementHistory).not.toHaveBeenCalled();
      expect(RobotsPositionOnTable).not.toHaveBeenCalled();
    });

    it("does nothing if move would go out of bounds (too large)", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "north" });
      (GetMovementHistoryByRobotId as any).mockReturnValue([{ xCord: 2, yCord: 4, direction: "north" }]);
      (GetTableInfoById as any).mockReturnValue({ xWidth: 5, yHeight: 5 });

      MoveRobot("r1", "t1");

      expect(CreateMovementHistory).not.toHaveBeenCalled();
      expect(RobotsPositionOnTable).not.toHaveBeenCalled();
    });

    it("uses most recent movement as starting point (movementHistory[0])", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "west" });
      (GetMovementHistoryByRobotId as any).mockReturnValue([
        { xCord: 3, yCord: 3, direction: "west" }, // latest
        { xCord: 0, yCord: 0, direction: "west" },
      ]);
      (GetTableInfoById as any).mockReturnValue({ xWidth: 5, yHeight: 5 });

      MoveRobot("r1", "t1");

      expect(CreateMovementHistory).toHaveBeenCalledWith("r1", 2, 3, "west");
    });
  });

  describe("GetRobotsById", () => {
    it("throws if empty list", () => {
      expect(() => GetRobotsById([])).toThrow(/No robotIds are given/);
    });

    it("returns robots in same order as ids", () => {
      (GetRobotById as any).mockImplementation((id: string) => ({ id, currentDirection: "north" }));

      const robots = GetRobotsById(["a", "b"]);

      expect(robots).toEqual([
        { id: "a", currentDirection: "north" },
        { id: "b", currentDirection: "north" },
      ]);
      expect(GetRobotById).toHaveBeenCalledTimes(2);
      expect(GetRobotById).toHaveBeenNthCalledWith(1, "a");
      expect(GetRobotById).toHaveBeenNthCalledWith(2, "b");
    });
  });

  describe("GetRobotMovementHistory", () => {
    it("returns repo history", () => {
      (GetMovementHistoryByRobotId as any).mockReturnValue([{ xCord: 1, yCord: 1, direction: "north" }]);

      const hist = GetRobotMovementHistory("r1");

      expect(GetMovementHistoryByRobotId).toHaveBeenCalledWith("r1");
      expect(hist).toEqual([{ xCord: 1, yCord: 1, direction: "north" }]);
    });
  });

  describe("ForceMovementHistory", () => {
    it("directly updates movements history using robot current direction and cordinates), returns robotId", () => {
      (GetRobotById as any).mockReturnValue({ id: "r1", currentDirection: "east" });

      const id = ForceMovementHistory(9, 8, "t1", "r1");

      expect(id).toBe("r1");
      expect(CreateMovementHistory).toHaveBeenCalledWith("r1", 9, 8, "east");
      expect(RobotsPositionOnTable).toHaveBeenCalledWith("t1", "r1");
    });
  });
});
