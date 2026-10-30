"""
=============================================================================
Student Details:
Name: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2
Course: Discrete Mathematics
Project Title: Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring
=============================================================================

File: seating.py
Description: Implements three seating arrangement algorithms:
             1. Random Seating (baseline)
             2. Pattern Seating (exact graph vertex colouring)
             3. Hill Climbing Optimization (local search heuristic)
Discrete Math Context:
1. Vertex Colouring & Independent Sets:
   A proper k-colouring of a graph G = (V, E) is an assignment of k colours
   c: V -> {0, 1, ..., k-1} such that c(u) != c(v) for all (u, v) in E.
   Each colour class V_i = {v in V : c(v) = i} is an independent set
   (contains zero internal edges).
   
2. Bipartite Grid Graph (Without Diagonals):
   G is bipartite because every cycle has even length (no odd cycles).
   By König's theorem, G is 2-colourable:
       colour(r, c) = (r + c) mod 2.

3. King's Graph 4-Colouring (With Diagonals):
   Every 2x2 subgrid contains 4 mutually adjacent vertices (a K_4 clique),
   requiring at least 4 colours by the clique lower bound chi(G) >= omega(G) = 4.
   A 4-colouring is given by:
       colour(r, c) = (r mod 2) * 2 + (c mod 2).

4. Hill Climbing (Local Search):
   Explores the configuration state space through 2-opt swaps.
   Monotonically decreases the risk score, guaranteeing that the output
   is never worse than the initial arrangement.
=============================================================================
"""

import random
from collections import defaultdict
from scoring import risk_score


def get_seat_colors(rows, cols, include_diagonals=False):
    """
    Computes the theoretical graph colouring for all seats in the classroom grid.
    
    Discrete Math Logic:
    - Without diagonals: Grid is bipartite, 2-colourable:
        color = (r + c) % 2  (Classes 0 and 1)
    - With diagonals: Grid has K_4 cliques in each 2x2 block, 4-colourable:
        color = (r % 2) * 2 + (c % 2)  (Classes 0, 1, 2, and 3)
        
    Args:
        rows (int): Number of rows.
        cols (int): Number of columns.
        include_diagonals (bool): Whether diagonal adjacency is enabled.
        
    Returns:
        dict: {(r, c): color_id}
    """
    seat_colors = {}
    for r in range(rows):
        for c in range(cols):
            if not include_diagonals:
                color = (r + c) % 2
            else:
                color = (r % 2) * 2 + (c % 2)
            seat_colors[(r, c)] = color
    return seat_colors


def random_seating(students, rows, cols, seed=None):
    """
    Places students uniformly at random across the available classroom seats.
    Serves as an empirical baseline against which structured methods are compared.
    
    Args:
        students (list of dict): Student records to seat.
        rows (int): Grid row count.
        cols (int): Grid column count.
        seed (int, optional): Random seed for reproducibility.
        
    Returns:
        dict: Mapping (r, c) -> student dict or None.
    """
    rng = random.Random(seed)
    total_seats = rows * cols
    if len(students) > total_seats:
        raise ValueError(f"Student count ({len(students)}) exceeds total seats ({total_seats}).")
        
    all_seats = [(r, c) for r in range(rows) for c in range(cols)]
    rng.shuffle(all_seats)
    
    arrangement = {seat: None for seat in all_seats}
    for i, student in enumerate(students):
        arrangement[all_seats[i]] = student
        
    return arrangement


def pattern_seating(students, rows, cols, include_diagonals=False):
    """
    Constructs an exam seating plan using graph vertex colouring.
    
    Algorithm:
    1. Colour the seat graph G_seat using the optimal chromatic pattern:
       - 2 colours for bipartite orthogonal grid
       - 4 colours for 2x2 King's graph grid
    2. Group seats by colour class (each colour class is an independent set).
    3. Group students by course and sort by size descending.
    4. Allocate courses to independent set colour classes:
       - Since each colour class contains NO adjacent seats, any students
         placed within the same colour class will NEVER conflict!
       - For 2-colouring (4 courses): courses are partitioned across the 2 classes
         using bin-packing, keeping same-course cohorts within their class.
       - For 4-colouring (4 courses): each course is assigned to its own distinct
         colour class.
    5. Handle uneven group sizes: If a course exceeds its assigned colour class
       capacity, leftover students are placed greedily into empty seats that
       generate the minimum incremental conflict.
       
    Args:
        students (list of dict): Student records.
        rows (int): Grid row count.
        cols (int): Grid column count.
        include_diagonals (bool): Whether diagonals are considered adjacent.
        
    Returns:
        dict: Mapping (r, c) -> student dict or None.
    """
    # Step 1: Compute seat colouring
    seat_colors = get_seat_colors(rows, cols, include_diagonals)
    
    # Step 2: Organize seats into independent sets by colour class
    color_seats = defaultdict(list)
    for seat, color in seat_colors.items():
        color_seats[color].append(seat)
        
    # Step 3: Group students by course
    course_groups = defaultdict(list)
    for student in students:
        course_groups[student["course"]].append(student)
        
    # Sort courses by size descending (largest cohorts prioritized)
    sorted_courses = sorted(course_groups.keys(), key=lambda c: len(course_groups[c]), reverse=True)
    
    # Initialize empty arrangement
    arrangement = {(r, c): None for r in range(rows) for c in range(cols)}
    
    # Seats remaining in each colour class
    available_color_seats = {color: list(seats) for color, seats in color_seats.items()}
    unplaced_students = []
    
    if include_diagonals:
        # 4 Colour classes available: Match each course to a distinct colour class
        # Sort colour classes by capacity descending
        sorted_color_classes = sorted(available_color_seats.keys(),
                                      key=lambda col: len(available_color_seats[col]),
                                      reverse=True)
        
        course_to_color = {}
        for i, course in enumerate(sorted_courses):
            if i < len(sorted_color_classes):
                course_to_color[course] = sorted_color_classes[i]
            else:
                course_to_color[course] = None
                
        # Fill seats for each course
        for course in sorted_courses:
            color = course_to_color[course]
            student_list = course_groups[course]
            if color is not None:
                color_bucket = available_color_seats[color]
                take_count = min(len(student_list), len(color_bucket))
                for j in range(take_count):
                    seat = color_bucket.pop(0)
                    arrangement[seat] = student_list[j]
                # Any overflow students become unplaced
                unplaced_students.extend(student_list[take_count:])
            else:
                unplaced_students.extend(student_list)
                
    else:
        # Bipartite grid: 2 Colour classes (0 and 1).
        # We partition the courses across the 2 colour classes using Best-Fit / Greedy bin-packing.
        for course in sorted_courses:
            student_list = course_groups[course]
            course_size = len(student_list)
            
            # Find the colour class with sufficient remaining capacity
            best_color = None
            # Check which colour class can hold the entire course group
            candidates = [col for col in available_color_seats if len(available_color_seats[col]) >= course_size]
            if candidates:
                # Pick the class with the smallest sufficient capacity (Best Fit)
                best_color = min(candidates, key=lambda col: len(available_color_seats[col]))
            else:
                # If neither can hold all, pick the class with maximum remaining capacity
                best_color = max(available_color_seats.keys(), key=lambda col: len(available_color_seats[col]))
                
            color_bucket = available_color_seats[best_color]
            take_count = min(course_size, len(color_bucket))
            for j in range(take_count):
                seat = color_bucket.pop(0)
                arrangement[seat] = student_list[j]
            unplaced_students.extend(student_list[take_count:])
            
    # Step 5: Greedily place any leftover/overflow students into lowest-conflict empty seats
    if unplaced_students:
        from graphs import build_seat_graph
        seat_graph = build_seat_graph(rows, cols, include_diagonals)
        
        for student in unplaced_students:
            empty_seats = [seat for seat, occupant in arrangement.items() if occupant is None]
            best_seat = None
            min_conflicts = float("inf")
            min_occupied_neighbors = float("inf")
            
            for seat in empty_seats:
                # Count conflicts if placed here
                conflicts = 0
                occupied_neighbors = 0
                for neighbor in seat_graph[seat]:
                    neighbor_student = arrangement.get(neighbor)
                    if neighbor_student is not None:
                        occupied_neighbors += 1
                        if neighbor_student["course"] == student["course"]:
                            conflicts += 1
                            
                # Tie-breaking: lowest conflict first, then lowest occupied neighbors
                if (conflicts < min_conflicts) or (conflicts == min_conflicts and occupied_neighbors < min_occupied_neighbors):
                    min_conflicts = conflicts
                    min_occupied_neighbors = occupied_neighbors
                    best_seat = seat
                    
            arrangement[best_seat] = student

    return arrangement


def optimize_seating(arrangement, seat_graph, max_iterations=1000, seed=None):
    """
    Applies Hill Climbing (local search) to iteratively reduce the risk score.
    
    Algorithm:
    1. Start from an initial arrangement and compute initial risk score S.
    2. At each iteration, choose two distinct seats (u, v) uniformly at random.
    3. Tentatively swap the occupants of u and v.
    4. Compute new risk score S_new.
    5. If S_new < S, keep the swap (accept move) and update S = S_new.
       Else, revert the swap.
    6. Terminate when S reaches 0 (global optimum) or max_iterations is reached.
    
    Guarantee:
    Because swaps are strictly accepted only when S_new < S, the final score
    is mathematically guaranteed to be <= the initial score.
    
    Args:
        arrangement (dict): Initial seating mapping.
        seat_graph (dict): Seat adjacency graph.
        max_iterations (int): Maximum number of swap proposals.
        seed (int, optional): Random seed.
        
    Returns:
        tuple: (optimized_arrangement, stats_dict)
            stats_dict contains 'initial_score', 'final_score', 'iterations_run', 'swaps_made'.
    """
    rng = random.Random(seed)
    current_arr = dict(arrangement)  # Shallow copy of dictionary
    
    all_seats = list(current_arr.keys())
    current_score = risk_score(current_arr, seat_graph)
    initial_score = current_score
    swaps_made = 0
    
    if current_score == 0:
        return current_arr, {
            "initial_score": initial_score,
            "final_score": 0,
            "iterations_run": 0,
            "swaps_made": 0
        }
        
    for it in range(1, max_iterations + 1):
        u, v = rng.sample(all_seats, 2)
        
        # Skip swapping two seats with identical status
        occ_u = current_arr[u]
        occ_v = current_arr[v]
        if occ_u is None and occ_v is None:
            continue
        if occ_u is not None and occ_v is not None and occ_u["course"] == occ_v["course"]:
            continue
            
        # Tentatively perform swap
        current_arr[u], current_arr[v] = current_arr[v], current_arr[u]
        new_score = risk_score(current_arr, seat_graph)
        
        if new_score < current_score:
            # Improvement accepted!
            current_score = new_score
            swaps_made += 1
            if current_score == 0:
                return current_arr, {
                    "initial_score": initial_score,
                    "final_score": 0,
                    "iterations_run": it,
                    "swaps_made": swaps_made
                }
        else:
            # Revert swap
            current_arr[u], current_arr[v] = current_arr[v], current_arr[u]
            
    return current_arr, {
        "initial_score": initial_score,
        "final_score": current_score,
        "iterations_run": max_iterations,
        "swaps_made": swaps_made
    }
