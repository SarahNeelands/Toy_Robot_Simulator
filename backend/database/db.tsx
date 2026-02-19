import Database from "better-sqlite3";

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

export const db =
  global.__db ??
  new Database(":memory:"); // empty on server start, persists across page refresh

global.__db = db;

// create tables once
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS robots (
      id TEXT PRIMARY KEY,
      currentDirection TEXT NOT NULL CHECK(currentDirection IN ('north', 'east', 'south', 'west'))
  );

  CREATE TABLE IF NOT EXISTS movementHistory (
      addedAt TEXT NOT NULL DEFAULT (datetime('now')),
      robotId TEXT NOT NULL,
      xCord INTEGER NOT NULL,
      yCord INTEGER NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('north', 'east', 'south', 'west')),
      FOREIGN KEY (robotId) REFERENCES robots(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      xWidth INTEGER NOT NULL,
      yHeight INTEGER NOT NULL,
      maxOccupants INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blocks (
      tableId TEXT NOT NULL,
      xCord INTEGER NOT NULL,
      yCord INTEGER NOT NULL,
      robotId TEXT NULL DEFAULT NULL,
      PRIMARY KEY (tableId, xCord, yCord),
      FOREIGN KEY (robotId) REFERENCES robots(id) ON DELETE SET NULL,
      FOREIGN KEY (tableId) REFERENCES tables(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tableRobots (
      tableId TEXT NOT NULL,
      robotId TEXT NOT NULL,
      addedAt TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (tableId, robotId),
      FOREIGN KEY (tableId) REFERENCES tables(id) ON DELETE CASCADE,
      FOREIGN KEY (robotId) REFERENCES robots(id) ON DELETE CASCADE
  );
`);