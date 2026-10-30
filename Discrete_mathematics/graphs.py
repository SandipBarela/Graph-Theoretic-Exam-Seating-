"""
=============================================================================
Student Details:
Name: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2
Course: Discrete Mathematics
Project Title: Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring
=============================================================================

File: graphs.py
Description: Constructs the seat adjacency graph and student conflict graph.
Discrete Math Context:
1. Seat Graph G_seat = (V_seat, E_seat):
   - Vertices: V_seat = {(r, c) | 0 <= r < rows, 0 <= c < cols}.
   - Edges without diagonals (4-connectivity):
     Two seats (r1, c1) and (r2, c2) are adjacent iff |r1 - r2| + |c1 - c2| = 1.
     This is a grid graph (Cartesian product P_rows x P_cols), planar, bipartite,
     with maximum degree Delta <= 4.
   - Edges with diagonals (8-connectivity / King's Graph):
     Two seats are adjacent iff max(|r1 - r2|, |c1 - c2|) = 1.
     Each 2x2 subgrid forms a complete subgraph K_4, with Delta <= 8.

2. Student Conflict Graph G_conflict = (V_students, E_conflict):
   - Vertices: Students s in S.
   - Edges: (s_i, s_j) in E_conflict iff course(s_i) == course(s_j) for i != j.
   - Graph structure: A disjoint union of complete graphs (cliques) K_|C_k|
     for each course k.
=============================================================================
"""


def get_seat_neighbors(r, c, rows, cols, include_diagonals=False):
    """
    Finds all valid adjacent seats for a given position (r, c).
    
    Args:
        r (int): Row index (0-indexed).
        c (int): Column index (0-indexed).
        rows (int): Total number of rows in the classroom.
        cols (int): Total number of columns in the classroom.
        include_diagonals (bool): If True, includes 8-way adjacent seats.
                                  If False, includes 4-way orthogonal seats (front, back, left, right).
                                  
    Returns:
        list of tuple: List of (neighbor_row, neighbor_col) coordinates.
    """
    # 4 orthogonal directions (von Neumann neighborhood)
    orthogonal_offsets = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    # 4 diagonal directions
    diagonal_offsets = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
    
    offsets = orthogonal_offsets.copy()
    if include_diagonals:
        offsets.extend(diagonal_offsets)
        
    neighbors = []
    for dr, dc in offsets:
        nr = r + dr
        nc = c + dc
        # Verify boundary constraints: 0 <= nr < rows and 0 <= nc < cols
        if 0 <= nr < rows and 0 <= nc < cols:
            neighbors.append((nr, nc))
            
    return neighbors


def build_seat_graph(rows, cols, include_diagonals=False):
    """
    Constructs the seat adjacency graph as an adjacency list dictionary.
    
    Representation:
        A dictionary mapping each seat coordinate (r, c) to a list of its neighbors.
        Graph G = (V, E) where |V| = rows * cols.
        
    Args:
        rows (int): Number of rows.
        cols (int): Number of columns.
        include_diagonals (bool): Whether diagonal proximity counts as adjacent.
        
    Returns:
        dict: {(r, c): [(r_adj, c_adj), ...]}
    """
    seat_graph = {}
    for r in range(rows):
        for c in range(cols):
            seat = (r, c)
            seat_graph[seat] = get_seat_neighbors(r, c, rows, cols, include_diagonals)
    return seat_graph


def build_student_conflict_graph(students):
    """
    Constructs the student conflict graph G_conflict = (V_students, E_conflict).
    Two students have an edge if and only if they are taking the same course exam.
    
    Discrete Mathematics Note:
        Since equality of course is an equivalence relation (reflexive, symmetric,
        transitive), the relation partitions students into equivalence classes.
        In graph theory, this results in a disjoint union of complete graphs (cliques):
            G_conflict = K_n1 U K_n2 U ... U K_nk
        where n_i is the number of students taking course i.
        
    Args:
        students (list of dict): List of student records.
        
    Returns:
        dict: Maps student id to a list of conflicting student ids.
    """
    conflict_graph = {s["id"]: [] for s in students}
    n = len(students)
    
    for i in range(n):
        for j in range(i + 1, n):
            s1 = students[i]
            s2 = students[j]
            # Edge exists if they share the same exam course
            if s1["course"] == s2["course"]:
                conflict_graph[s1["id"]].append(s2["id"])
                conflict_graph[s2["id"]].append(s1["id"])
                
    return conflict_graph
