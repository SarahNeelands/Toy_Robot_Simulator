
export type Table = {
  id: string;
  xWidth: number;
  yHeight: number;
  grid: Block[];
  maxOccupants:number;
  robotIds: string[];
}
export type Block = {
  xCord: number;
  yCord: number;
  tableId: string;
  robotId: string | null;
}