// robot type, id, xCord, yCord, direction

export type Robot = {
  id: string;
  currentDirection: string;
}

export type MovementHistory = {
  robotId: string;
  xCord: number;
  yCord: number;
  direction: string;
}
