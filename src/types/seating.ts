export interface Subject {
  code: string;
  name: string;
  colorName: string;
  badgeDark: string;
  badgeLight: string;
  dotColor: string;
}

export interface Student {
  id: string;
  name: string;
  roll: string;
  course: string;
  code: string;
}

export interface HallConfig {
  rows: number;
  cols: number;
  roomName: string;
}

export interface CellCoord {
  r: number;
  c: number;
}

