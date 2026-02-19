// backend/services/tests/table_service.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock FIRST
vi.mock("../../repo/tables.repo", () => ({
  GetTableInfoById: vi.fn(),
  CreateTable: vi.fn(),
  CreateBlock: vi.fn(),
  GetBlocksByTableIdAndCoordinates: vi.fn(),
  UpdateBlockInformation: vi.fn(),
  GetBlocksByTableId: vi.fn(),
  GetRobotIdsByTableId: vi.fn(),
  UpdateTableRobotIds: vi.fn(),
  RemoveTableRobotId: vi.fn(),
}));

vi.mock("../../repo/robot.repo", () => ({
  GetRobotById: vi.fn(),
  CreateRobot: vi.fn(),
  DeleteRobotById: vi.fn(),
  GetMovementHistoryByRobotId: vi.fn(),
}));

import * as tablesRepo from "../../repo/tables.repo";
import * as robotRepo from "../../repo/robot.repo";

import {
  CreateNewTable,
  CreateBlocks,
  GetTableById,
  RobotsPositionOnTable,
} from "../table_services";

const mockedTablesRepo = vi.mocked(tablesRepo);
const mockedRobotRepo = vi.mocked(robotRepo);

describe("tables.service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("CreateNewTable", () => {
    it("creates table, creates blocks, returns fetched table", () => {
      mockedTablesRepo.CreateTable.mockReturnValue("t1");

      mockedTablesRepo.GetTableInfoById.mockReturnValue({
        xWidth: 2,
        yHeight: 2,
        maxOccupants: 1,
      } as any);

      mockedTablesRepo.GetBlocksByTableId.mockReturnValue([]);
      mockedTablesRepo.GetRobotIdsByTableId.mockReturnValue([]);

      const result = CreateNewTable(2, 2, 1);

      expect(mockedTablesRepo.CreateTable).toHaveBeenCalledWith(2, 2, 1);
      expect(mockedTablesRepo.CreateBlock).toHaveBeenCalledTimes(4);

      expect(result).toEqual({
        id: "t1",
        xWidth: 2,
        yHeight: 2,
        grid: [],
        maxOccupants: 1,
        robotIds: [],
      });
    });

    it("propagates errors from CreateTable", () => {
      mockedTablesRepo.CreateTable.mockImplementation(() => {
        throw new Error("boom");
      });

      expect(() => CreateNewTable(2, 2, 1)).toThrow("boom");
    });
  });

  describe("CreateBlocks", () => {
    it("creates xWidth*yHeight blocks", () => {
      CreateBlocks(3, 2, "t1");
      expect(mockedTablesRepo.CreateBlock).toHaveBeenCalledTimes(6);
    });

    it("creates blocks in expected order", () => {
      CreateBlocks(2, 2, "t1");

      expect(mockedTablesRepo.CreateBlock.mock.calls[0]).toEqual(["t1", 1, 1]);
      expect(mockedTablesRepo.CreateBlock.mock.calls[1]).toEqual(["t1", 0, 1]);
      expect(mockedTablesRepo.CreateBlock.mock.calls[2]).toEqual(["t1", 1, 0]);
      expect(mockedTablesRepo.CreateBlock.mock.calls[3]).toEqual(["t1", 0, 0]);
    });

    it("does nothing if dimensions are zero", () => {
      CreateBlocks(0, 5, "t1");
      CreateBlocks(5, 0, "t1");
      expect(mockedTablesRepo.CreateBlock).not.toHaveBeenCalled();
    });
  });

  describe("GetTableById", () => {
    it("builds a Table from repo data", () => {
      mockedTablesRepo.GetTableInfoById.mockReturnValue({
        xWidth: 2,
        yHeight: 1,
        maxOccupants: 1,
      } as any);

      mockedTablesRepo.GetBlocksByTableId.mockReturnValue([
        { xCord: 0, yCord: 0, robotId: null },
        { xCord: 1, yCord: 0, robotId: "r1" },
      ] as any);

      mockedTablesRepo.GetRobotIdsByTableId.mockReturnValue(["r1"]);

      const result = GetTableById("t1");

      expect(mockedTablesRepo.GetTableInfoById).toHaveBeenCalledWith("t1");
      expect(mockedTablesRepo.GetBlocksByTableId).toHaveBeenCalledWith("t1");
      expect(mockedTablesRepo.GetRobotIdsByTableId).toHaveBeenCalledWith("t1");

      expect(result).toEqual({
        id: "t1",
        xWidth: 2,
        yHeight: 1,
        maxOccupants: 1,
        robotIds: ["r1"],
        grid: [
          { tableId: "t1", xCord: 0, yCord: 0, robotId: null },
          { tableId: "t1", xCord: 1, yCord: 0, robotId: "r1" },
        ],
      });
    });
  });

  describe("RobotsPositionOnTable", () => {
    it("adds new robot when space available and updates block", () => {
      mockedRobotRepo.GetRobotById.mockReturnValue({ id: "r2" } as any);

      mockedRobotRepo.GetMovementHistoryByRobotId.mockReturnValue([
        { xCord: 1, yCord: 1 },
      ] as any);

      mockedTablesRepo.GetTableInfoById.mockReturnValue({
        xWidth: 2,
        yHeight: 2,
        maxOccupants: 2,
      } as any);

      mockedTablesRepo.GetBlocksByTableId.mockReturnValue([] as any);
      mockedTablesRepo.GetRobotIdsByTableId.mockReturnValue(["r1"]);

      mockedTablesRepo.GetBlocksByTableIdAndCoordinates.mockReturnValue({
        tableId: "t1",
        xCord: 1,
        yCord: 1,
        robotId: null,
      } as any);

      RobotsPositionOnTable("t1", "r2");

      expect(mockedTablesRepo.UpdateTableRobotIds).toHaveBeenCalledWith("t1", "r2");
      expect(mockedTablesRepo.UpdateBlockInformation).toHaveBeenCalledWith(
        "t1",
        1,
        1,
        "r2"
      );
    });

    it("removes oldest robot when max reached and robot is new", () => {
      mockedRobotRepo.GetRobotById.mockReturnValue({ id: "r3" } as any);
      mockedRobotRepo.GetMovementHistoryByRobotId.mockReturnValue([
        { xCord: 0, yCord: 0 },
      ] as any);

      mockedTablesRepo.GetTableInfoById.mockReturnValue({
        xWidth: 1,
        yHeight: 1,
        maxOccupants: 1,
      } as any);

      mockedTablesRepo.GetBlocksByTableId.mockReturnValue([] as any);
      mockedTablesRepo.GetRobotIdsByTableId.mockReturnValue(["oldest"]);

      mockedTablesRepo.GetBlocksByTableIdAndCoordinates.mockReturnValue({
        tableId: "t1",
        xCord: 0,
        yCord: 0,
        robotId: null,
      } as any);

      RobotsPositionOnTable("t1", "r3");

      expect(mockedRobotRepo.DeleteRobotById).toHaveBeenCalledWith("oldest");
      expect(mockedTablesRepo.RemoveTableRobotId).toHaveBeenCalledWith("t1", "oldest");
      expect(mockedTablesRepo.UpdateTableRobotIds).not.toHaveBeenCalled();

      expect(mockedTablesRepo.UpdateBlockInformation).toHaveBeenCalledWith(
        "t1",
        0,
        0,
        "r3"
      );
    });

    it("clears old block when robot already exists, then updates new block", () => {
      mockedRobotRepo.GetRobotById.mockReturnValue({ id: "r1" } as any);

      mockedRobotRepo.GetMovementHistoryByRobotId.mockReturnValue([
        { xCord: 1, yCord: 1 },
        { xCord: 0, yCord: 0 },
      ] as any);

      mockedTablesRepo.GetTableInfoById.mockReturnValue({
        xWidth: 2,
        yHeight: 2,
        maxOccupants: 2,
      } as any);

      mockedTablesRepo.GetBlocksByTableId.mockReturnValue([] as any);
      mockedTablesRepo.GetRobotIdsByTableId.mockReturnValue(["r1"]);

      mockedTablesRepo.GetBlocksByTableIdAndCoordinates
        .mockReturnValueOnce({
          tableId: "t1",
          xCord: 1,
          yCord: 1,
          robotId: null,
        } as any)
        .mockReturnValueOnce({
          tableId: "t1",
          xCord: 0,
          yCord: 0,
          robotId: "r1",
        } as any);

      RobotsPositionOnTable("t1", "r1");

      expect(mockedTablesRepo.UpdateBlockInformation).toHaveBeenCalledWith(
        "t1",
        0,
        0,
        null
      );
      expect(mockedTablesRepo.UpdateBlockInformation).toHaveBeenCalledWith(
        "t1",
        1,
        1,
        "r1"
      );
    });

    it("throws if max reached but no robotIds found to remove", () => {
      mockedRobotRepo.GetRobotById.mockReturnValue({ id: "rX" } as any);

      mockedRobotRepo.GetMovementHistoryByRobotId.mockReturnValue([
        { xCord: 0, yCord: 0 },
      ] as any);

      mockedTablesRepo.GetTableInfoById.mockReturnValue({
        xWidth: 1,
        yHeight: 1,
        maxOccupants: 0,
      } as any);

      mockedTablesRepo.GetBlocksByTableId.mockReturnValue([] as any);
      mockedTablesRepo.GetRobotIdsByTableId.mockReturnValue([]); 

      mockedTablesRepo.GetBlocksByTableIdAndCoordinates.mockReturnValue({
        tableId: "t1",
        xCord: 0,
        yCord: 0,
        robotId: null,
      } as any);

      expect(() => RobotsPositionOnTable("t1", "rX")).toThrow(/no robotIds/i);

    });

    it("throws when movement history is empty", () => {
      mockedRobotRepo.GetRobotById.mockReturnValue({ id: "r1" } as any);
      mockedRobotRepo.GetMovementHistoryByRobotId.mockReturnValue([] as any);

      mockedTablesRepo.GetTableInfoById.mockReturnValue({
        xWidth: 1,
        yHeight: 1,
        maxOccupants: 0,
      } as any);

      mockedTablesRepo.GetBlocksByTableId.mockReturnValue([] as any);
      mockedTablesRepo.GetRobotIdsByTableId.mockReturnValue([]);

      expect(() => RobotsPositionOnTable("t1", "r1")).toThrow();
    });
  });
});
