import type { Student, Subject } from "@/types/seating";

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    code: "MTH",
    name: "Mathematics",
    colorName: "Platinum",
    badgeDark: "bg-[#E1E0CC]/15 text-[#E1E0CC] border-[#E1E0CC]/40",
    badgeLight: "bg-slate-900 text-slate-100 border-slate-700",
    dotColor: "bg-[#E1E0CC]",
  },
  {
    code: "PHY",
    name: "Physics",
    colorName: "Amber",
    badgeDark: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    badgeLight: "bg-amber-100 text-amber-900 border-amber-300",
    dotColor: "bg-amber-400",
  },
  {
    code: "CHM",
    name: "Chemistry",
    colorName: "Emerald",
    badgeDark: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    badgeLight: "bg-emerald-100 text-emerald-900 border-emerald-300",
    dotColor: "bg-emerald-400",
  },
  {
    code: "CSC",
    name: "Computer Science",
    colorName: "Orange",
    badgeDark: "bg-orange-400/15 text-orange-300 border-orange-400/30",
    badgeLight: "bg-orange-100 text-orange-900 border-orange-300",
    dotColor: "bg-orange-400",
  },
  {
    code: "BIO",
    name: "Biology",
    colorName: "Purple",
    badgeDark: "bg-purple-400/15 text-purple-300 border-purple-400/30",
    badgeLight: "bg-purple-100 text-purple-900 border-purple-300",
    dotColor: "bg-purple-400",
  },
  {
    code: "ENG",
    name: "English Literature",
    colorName: "Sky",
    badgeDark: "bg-sky-400/15 text-sky-300 border-sky-400/30",
    badgeLight: "bg-sky-100 text-sky-900 border-sky-300",
    dotColor: "bg-sky-400",
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // Maths (8)
  { id: "1", name: "Aarav Sharma", roll: "MTH101", course: "Mathematics", code: "MTH" },
  { id: "2", name: "Ananya Patel", roll: "MTH102", course: "Mathematics", code: "MTH" },
  { id: "3", name: "Aditya Verma", roll: "MTH103", course: "Mathematics", code: "MTH" },
  { id: "4", name: "Diya Kulkarni", roll: "MTH104", course: "Mathematics", code: "MTH" },
  { id: "5", name: "Ishan Joshi", roll: "MTH105", course: "Mathematics", code: "MTH" },
  { id: "6", name: "Kavya Deshmukh", roll: "MTH106", course: "Mathematics", code: "MTH" },
  { id: "7", name: "Manish Gupta", roll: "MTH107", course: "Mathematics", code: "MTH" },
  { id: "8", name: "Neha Shinde", roll: "MTH108", course: "Mathematics", code: "MTH" },
  // Physics (6)
  { id: "9", name: "Omkar Jadhav", roll: "PHY201", course: "Physics", code: "PHY" },
  { id: "10", name: "Pooja Patil", roll: "PHY202", course: "Physics", code: "PHY" },
  { id: "11", name: "Pranav Kale", roll: "PHY203", course: "Physics", code: "PHY" },
  { id: "12", name: "Riya More", roll: "PHY204", course: "Physics", code: "PHY" },
  { id: "13", name: "Rohan Pawar", roll: "PHY205", course: "Physics", code: "PHY" },
  { id: "14", name: "Sakshi Bhosale", roll: "PHY206", course: "Physics", code: "PHY" },
  // Chemistry (5)
  { id: "15", name: "Tanmay Sawant", roll: "CHM301", course: "Chemistry", code: "CHM" },
  { id: "16", name: "Utkarsh Wagh", roll: "CHM302", course: "Chemistry", code: "CHM" },
  { id: "17", name: "Vaishnavi Kadam", roll: "CHM303", course: "Chemistry", code: "CHM" },
  { id: "18", name: "Yash Gaikwad", roll: "CHM304", course: "Chemistry", code: "CHM" },
  { id: "19", name: "Zoya Khan", roll: "CHM305", course: "Chemistry", code: "CHM" },
  // CS (5)
  { id: "20", name: "Aryan Mehta", roll: "CSC401", course: "Computer Science", code: "CSC" },
  { id: "21", name: "Bhavna Nair", roll: "CSC402", course: "Computer Science", code: "CSC" },
  { id: "22", name: "Chetan Rao", roll: "CSC403", course: "Computer Science", code: "CSC" },
  { id: "23", name: "Deepika Sen", roll: "CSC404", course: "Computer Science", code: "CSC" },
  { id: "24", name: "Eashan Roy", roll: "CSC405", course: "Computer Science", code: "CSC" },
];

export function getSeatLabel(r: number, c: number): string {
  const rowLetter = String.fromCharCode(65 + r);
  return `${rowLetter}${c + 1}`;
}

export function getNeighbors(
  r: number,
  c: number,
  rows: number,
  cols: number,
  withDiag: boolean
): [number, number][] {
  const deltas: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  if (withDiag) {
    deltas.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }
  const res: [number, number][] = [];
  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      res.push([nr, nc]);
    }
  }
  return res;
}

export function calculateScore(
  grid: (Student | null)[][],
  rows: number,
  cols: number,
  withDiag: boolean
): number {
  let conflicts = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const s1 = grid[r]?.[c];
      if (!s1) continue;
      const nbrs = getNeighbors(r, c, rows, cols, withDiag);
      for (const [nr, nc] of nbrs) {
        if (r < nr || (r === nr && c < nc)) {
          const s2 = grid[nr]?.[c2Col(nc)];
          if (s2 && s1.code === s2.code) {
            conflicts++;
          }
        }
      }
    }
  }
  return conflicts;
}

function c2Col(nc: number): number {
  return nc;
}

export function generateRandomLayout(
  students: Student[],
  rows: number,
  cols: number
): (Student | null)[][] {
  const grid: (Student | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );
  const seats: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) seats.push([r, c]);
  }
  seats.sort(() => Math.random() - 0.5);

  students.slice(0, rows * cols).forEach((st, idx) => {
    const [r, c] = seats[idx];
    grid[r][c] = st;
  });
  return grid;
}

export function generatePatternLayout(
  students: Student[],
  rows: number,
  cols: number,
  withDiag: boolean
): (Student | null)[][] {
  const grid: (Student | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  // Group students by subject code
  const groups: Record<string, Student[]> = {};
  for (const s of students) {
    if (!groups[s.code]) groups[s.code] = [];
    groups[s.code].push(s);
  }

  // Sort groups by size descending
  const sortedCodes = Object.keys(groups).sort(
    (a, b) => groups[b].length - groups[a].length
  );

  if (!withDiag) {
    // 2-Color Bipartite: Parity (r + c) % 2
    const c0: [number, number][] = [];
    const c1: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) c0.push([r, c]);
        else c1.push([r, c]);
      }
    }

    // Distribute student groups across the two partitions
    const p0Students: Student[] = [];
    const p1Students: Student[] = [];

    sortedCodes.forEach((code, idx) => {
      const arr = groups[code];
      if (idx % 2 === 0) {
        if (p0Students.length + arr.length <= c0.length || p0Students.length <= p1Students.length) {
          p0Students.push(...arr);
        } else {
          p1Students.push(...arr);
        }
      } else {
        if (p1Students.length + arr.length <= c1.length || p1Students.length <= p0Students.length) {
          p1Students.push(...arr);
        } else {
          p0Students.push(...arr);
        }
      }
    });

    p0Students.forEach((st, i) => {
      if (i < c0.length) grid[c0[i][0]][c0[i][1]] = st;
    });
    p1Students.forEach((st, i) => {
      if (i < c1.length) grid[c1[i][0]][c1[i][1]] = st;
    });
  } else {
    // 4-Color King's graph partition: (r % 2) * 2 + (c % 2)
    const buckets: Record<number, [number, number][]> = { 0: [], 1: [], 2: [], 3: [] };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const clr = (r % 2) * 2 + (c % 2);
        buckets[clr].push([r, c]);
      }
    }

    const bucketAssignments: Record<number, Student[]> = { 0: [], 1: [], 2: [], 3: [] };
    sortedCodes.forEach((code, idx) => {
      const bIdx = idx % 4;
      bucketAssignments[bIdx].push(...groups[code]);
    });

    for (let b = 0; b < 4; b++) {
      bucketAssignments[b].forEach((st, i) => {
        if (i < buckets[b].length) {
          grid[buckets[b][i][0]][buckets[b][i][1]] = st;
        }
      });
    }
  }

  return grid;
}

/**
 * Advanced Greedy Graph Colouring (DSatur-inspired heuristic)
 * Orders seats and assigns students to minimize immediate and future neighborhood collisions.
 */
export function generateGreedyLayout(
  students: Student[],
  rows: number,
  cols: number,
  withDiag: boolean
): (Student | null)[][] {
  const grid: (Student | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  const remainingStudents = [...students].sort(() => Math.random() - 0.5);
  // Sort remaining students to interleave course codes
  const byCourse: Record<string, Student[]> = {};
  remainingStudents.forEach((s) => {
    if (!byCourse[s.code]) byCourse[s.code] = [];
    byCourse[s.code].push(s);
  });
  const courseKeys = Object.keys(byCourse).sort((a, b) => byCourse[b].length - byCourse[a].length);

  const seats: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) seats.push([r, c]);
  }

  // Traverse seats in a checkerboard / high-degree order
  seats.sort(([r1, c1], [r2, c2]) => {
    const deg1 = getNeighbors(r1, c1, rows, cols, withDiag).length;
    const deg2 = getNeighbors(r2, c2, rows, cols, withDiag).length;
    return deg2 - deg1;
  });

  for (const [r, c] of seats) {
    if (Object.values(byCourse).every((arr) => arr.length === 0)) break;

    const nbrs = getNeighbors(r, c, rows, cols, withDiag);
    const neighborCodes = new Set(
      nbrs.map(([nr, nc]) => grid[nr]?.[nc]?.code).filter(Boolean)
    );

    // Pick candidate course that doesn't exist in neighbors
    let chosenCourse = courseKeys.find(
      (code) => byCourse[code].length > 0 && !neighborCodes.has(code)
    );

    if (!chosenCourse) {
      // Pick course with lowest collision or largest backlog
      chosenCourse = courseKeys
        .filter((code) => byCourse[code].length > 0)
        .sort((a, b) => byCourse[b].length - byCourse[a].length)[0];
    }

    if (chosenCourse && byCourse[chosenCourse].length > 0) {
      const student = byCourse[chosenCourse].shift()!;
      grid[r][c] = student;
    }
  }

  return grid;
}

export function generateOptimizedLayout(
  students: Student[],
  rows: number,
  cols: number,
  withDiag: boolean
): (Student | null)[][] {
  const grid = generateRandomLayout(students, rows, cols);
  let bestScore = calculateScore(grid, rows, cols, withDiag);
  const allSeats: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) allSeats.push([r, c]);
  }

  const maxIterations = Math.min(3000, rows * cols * 100);
  for (let it = 0; it < maxIterations; it++) {
    if (bestScore === 0) break;
    const i1 = Math.floor(Math.random() * allSeats.length);
    const i2 = Math.floor(Math.random() * allSeats.length);
    if (i1 === i2) continue;
    const [r1, c1] = allSeats[i1];
    const [r2, c2] = allSeats[i2];

    const temp = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = temp;

    const newScore = calculateScore(grid, rows, cols, withDiag);
    if (newScore < bestScore) {
      bestScore = newScore;
    } else {
      grid[r2][c2] = grid[r1][c1];
      grid[r1][c1] = temp;
    }
  }
  return grid;
}

export function computeGraphStatistics(rows: number, cols: number, withDiag: boolean) {
  const vertices = rows * cols;
  let edges = 0;
  let maxDegree = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const deg = getNeighbors(r, c, rows, cols, withDiag).length;
      edges += deg;
      if (deg > maxDegree) maxDegree = deg;
    }
  }
  edges = edges / 2; // undirected graph

  // Independent set bound alpha(G)
  // For 4-way bipartite grid, alpha(G) = ceil(rows * cols / 2)
  // For 8-way King's graph, alpha(G) = ceil(rows / 2) * ceil(cols / 2)
  const alphaBound = withDiag
    ? Math.ceil(rows / 2) * Math.ceil(cols / 2)
    : Math.ceil((rows * cols) / 2);

  const chromaticNumber = withDiag ? 4 : 2;

  return {
    vertices,
    edges,
    maxDegree,
    alphaBound,
    chromaticNumber,
  };
}

