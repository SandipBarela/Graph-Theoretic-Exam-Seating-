"""
=============================================================================
Student Details:
Name: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2
Course: Discrete Mathematics
Project Title: Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring
=============================================================================

File: scoring.py
Description: Evaluates risk score, verifies conflict freedom, and applies the
             Pigeonhole Principle to determine problem feasibility.
Discrete Math Context:
1. Risk Score:
   Counts the number of monochromatic edges in the seat graph under the course assignment.
   Let c: V_seat -> Courses U {None} be the seating assignment.
   Risk Score = |{ (u, v) in E_seat : c(u) == c(v) != None and u < v }|.

2. Independent Set & Independence Number alpha(G):
   An independent set of a graph G is a subset of vertices S subset of V such that
   no two vertices in S are adjacent.
   For zero conflicts, every course group C_k must be mapped to an independent set.
   Thus, |C_k| <= alpha(G_seat) for all k.

3. Pigeonhole Principle (PHP):
   If n pigeons are put into m pigeonholes and n > m, at least one pigeonhole
   contains more than one pigeon.
   Here:
   - Pigeonholes = available pairwise non-adjacent seats (size of maximum independent set).
   - Pigeons = students belonging to the largest course group.
   If |C_max| > alpha(G_seat), placing all students guarantees at least one adjacent pair!
=============================================================================
"""

import math
from collections import Counter


def risk_score(arrangement, seat_graph):
    """
    Computes the total number of adjacent same-course student pairs.
    Each undirected edge (u, v) where both seats are occupied by students
    taking the same course is counted exactly once.
    
    Args:
        arrangement (dict): Mapping (r, c) -> student dict or None.
        seat_graph (dict): Adjacency list mapping (r, c) -> [(r_adj, c_adj), ...].
        
    Returns:
        int: Number of conflict edges.
    """
    conflicts = 0
    for u, neighbors in seat_graph.items():
        student_u = arrangement.get(u)
        if student_u is None:
            continue
            
        for v in neighbors:
            # u < v ensures each undirected edge {u, v} is counted once
            if u < v:
                student_v = arrangement.get(v)
                if student_v is not None and student_u["course"] == student_v["course"]:
                    conflicts += 1
                    
    return conflicts


def get_conflicting_pairs(arrangement, seat_graph):
    """
    Returns the list of specific conflicting adjacent pairs for detailed reporting.
    
    Returns:
        list of tuple: [(seat_u, seat_v, student_u, student_v), ...]
    """
    conflict_list = []
    for u, neighbors in seat_graph.items():
        student_u = arrangement.get(u)
        if student_u is None:
            continue
            
        for v in neighbors:
            if u < v:
                student_v = arrangement.get(v)
                if student_v is not None and student_u["course"] == student_v["course"]:
                    conflict_list.append((u, v, student_u, student_v))
                    
    return conflict_list


def is_conflict_free(arrangement, seat_graph):
    """
    Determines if the seating arrangement has zero adjacent conflicts.
    
    Args:
        arrangement (dict): Mapping (r, c) -> student dict or None.
        seat_graph (dict): Adjacency list of the seat graph.
        
    Returns:
        bool: True if risk_score == 0, False otherwise.
    """
    return risk_score(arrangement, seat_graph) == 0


def calculate_max_independent_set_bound(rows, cols, include_diagonals=False):
    """
    Calculates the maximum independent set bound alpha(G_seat) for the classroom.
    
    Discrete Math Logic:
    1. Without diagonals (4-connected grid graph):
       The grid is bipartite. The vertices partition into two independent sets
       V0 and V1 according to (r + c) mod 2.
       alpha(G) = ceil((rows * cols) / 2).
       For 5x6: ceil(30 / 2) = 15.
       
    2. With diagonals (8-connected King's graph):
       Every 2x2 subgrid induces a complete subgraph K_4.
       In a clique of size 4, at most 1 vertex can belong to an independent set.
       Therefore, alpha(G) <= ceil(rows / 2) * ceil(cols / 2).
       For 5x6: ceil(5/2) * ceil(6/2) = 3 * 3 = 9.
       
    Args:
        rows (int): Number of rows.
        cols (int): Number of columns.
        include_diagonals (bool): Whether diagonal adjacency is active.
        
    Returns:
        int: Upper bound on the maximum independent set size.
    """
    if not include_diagonals:
        return math.ceil((rows * cols) / 2)
    else:
        return math.ceil(rows / 2) * math.ceil(cols / 2)


def feasibility_check(students, rows, cols, include_diagonals=False):
    """
    Evaluates whether a zero-conflict seating arrangement is theoretically possible
    using the Pigeonhole Principle and Maximum Independent Set bounds.
    
    Args:
        students (list of dict): Student dataset.
        rows (int): Classroom rows.
        cols (int): Classroom columns.
        include_diagonals (bool): Whether diagonal adjacency is enabled.
        
    Returns:
        dict: {
            "feasible": bool,
            "max_course": str,
            "max_course_count": int,
            "max_independent_set": int,
            "message": str
        }
    """
    # Count students per course
    course_counts = Counter(s["course"] for s in students)
    if not course_counts:
        return {
            "feasible": True,
            "max_course": "None",
            "max_course_count": 0,
            "max_independent_set": 0,
            "message": "No students provided."
        }
        
    max_course, max_course_count = course_counts.most_common(1)[0]
    alpha_bound = calculate_max_independent_set_bound(rows, cols, include_diagonals)
    
    diag_label = "with diagonals" if include_diagonals else "without diagonals"
    
    if max_course_count > alpha_bound:
        message = (
            f"FEASIBILITY CHECK [{diag_label}]:\n"
            f"  Zero conflicts is MATHEMATICALLY IMPOSSIBLE by the Pigeonhole Principle!\n"
            f"  - Largest course: '{max_course}' has {max_course_count} students.\n"
            f"  - Maximum Independent Set bound alpha(G_seat): {alpha_bound} seats.\n"
            f"  - Explanation: In any valid zero-conflict arrangement, all {max_course_count} students\n"
            f"    of '{max_course}' must occupy pairwise non-adjacent seats (an independent set).\n"
            f"    Since {max_course_count} > {alpha_bound}, by the Pigeonhole Principle at least two students\n"
            f"    must occupy adjacent seats, creating at least one unavoidable conflict."
        )
        feasible = False
    else:
        message = (
            f"FEASIBILITY CHECK [{diag_label}]:\n"
            f"  Zero conflicts is THEORETICALLY FEASIBLE!\n"
            f"  - Largest course: '{max_course}' has {max_course_count} students.\n"
            f"  - Maximum Independent Set bound alpha(G_seat): {alpha_bound} seats.\n"
            f"  - Explanation: Since {max_course_count} <= {alpha_bound}, the classroom contains\n"
            f"    sufficient pairwise non-adjacent seats to house the largest group without mutual adjacency."
        )
        feasible = True
        
    return {
        "feasible": feasible,
        "max_course": max_course,
        "max_course_count": max_course_count,
        "max_independent_set": alpha_bound,
        "message": message
    }
