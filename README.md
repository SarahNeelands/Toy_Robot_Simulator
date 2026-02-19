# Toy Robot Simulator

A web app that simulates a toy robot moving on a 5x5 tabletop.

## Features
- Click a grid cell to PLACE the robot at that (x, y) position, facing north.
- MOVE advances 1 cell forward (ignored if it would fall off).
- LEFT and RIGHT rotate 90 degrees.
- REPORT outputs current X, Y, and facing direction.
- Robot state is saved to SQLite and restored on refresh.
- When the application is restarted, the robot and table are reset to their initial state.
- Movement history is stored.

## Rules
- Table is 5x5 with origin (0,0) at the south west corner (bottom left).
- Robot ignores commands until it has been placed.
- Any action that would make the robot fall off the table is ignored.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Node.js
- SQLite
- Vitest (unit testing)

## Getting Started

Install dependencies:

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Testing Instructions
1. Start the app with `npm run dev` and open http://localhost:3000
2. Click any grid cell to place the robot.
3. Press REPORT and confirm it shows the same (x, y) you clicked and facing north.
4. Press MOVE a few times and confirm the robot moves one cell forward each time.
5. Press LEFT, then MOVE and confirm the robot moves in the new direction.
6. Press RIGHT, then MOVE and confirm the robot moves in the new direction.
7. Move the robot to an edge and press MOVE toward the outside. Confirm it does not move off the table.
8. Refresh the page. Confirm the robot and table are the same as before.
9. Stop and restart the dev server. Confirm the robot and table reset.



## Testing Notes
Testing is done with Vitest.

```bash
npm run test
```

### Unit tests I would add with more time
I ran out of time to add the remaining unit tests I wanted. The next set I would write focuses on edge cases and error paths, especially around forced movement.


#### ForceMoveInDirection
- Moves the robot correctly for each direction (N, E, S, W) from a middle cell.
- Does nothing if the next movement is not on the table.
- When a move works: old cell gets cleared, new cell gets the robot.
- Only adds to the movement history when the move actually happens.
- Gives an error if the robotId or tableId does not exist.

#### Other tests I would add
- API input checks: missing fields, wrong types, unknown actions.
- Movement history ordering and if it stays saved upon refresh.

### Manual UI testing I did
- Ran through a scenarios in the browser to make sure the UI matched the expected behavior:
- Placed the robot by clicking different cells and confirmed the robot shows up in the right spot.
- Tried MOVE at the edges to confirm it does not fall off the table.
- Turned LEFT and RIGHT a bunch of times to confirm direction changes looked right.
- Tested place, turn, move, report and checked the report output matched what I saw on the grid.
- Refreshed the page to confirm state comes back from SQLite.
- Restarted the app to confirm the table and robot reset to the initial state.

## Assumptions I made
I made some assumptions about the behavior of the robot and table:

#### Directions
- north: facing the top of the table
- east: facing the right side of the table
- south: facing the bottom of the table
- west: facing the left side of the table

#### Movement
- When pressing the arrow keys, the robot moves one cell in the direction of the arrow key.
- All movement increments the robot's placement by one cell.

#### Report and History
- Report only shows the robot's current position and facing direction, not the entire history.
- Movement history is saved when the robot moves forward. Direction-only changes (LEFT/RIGHT) are not stored as history entries.

## Design Changes
I made some design changes to the app:
- I created a display to show the robot's current position and facing direction when report is pressed.
- The display design was kept consistent with the grid design.
- The display is removed when any other action is taken.