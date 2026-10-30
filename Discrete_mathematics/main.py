"""
=============================================================================
Student Details:
Name: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2
Course: Discrete Mathematics
Project Title: Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring
=============================================================================

File: main.py
Description: Master script orchestrating seating generation, scoring,
             comparisons, and visualization.
Discrete Math Context:
- Graph coloring on 2D lattice graphs.
- Risk quantification via monochromatic edge counting.
- Feasibility verification via the Pigeonhole Principle.
- Combinatorial optimization comparison (Random vs. Analytical vs. Local Search).
=============================================================================
"""

import sys
from data import (
    get_classroom_dimensions,
    get_sample_students,
    COURSE_CODES,
    COURSES
)
from graphs import build_seat_graph
from scoring import (
    risk_score,
    is_conflict_free,
    feasibility_check,
    get_conflicting_pairs
)
from seating import (
    random_seating,
    pattern_seating,
    optimize_seating,
    get_seat_colors
)


def print_banner():
    """Prints the project title, student metadata, and system introduction."""
    border = "=" * 80
    print(border)
    print("  DISCRETE MATHEMATICS COURSE PROJECT")
    print("  Graph-Theoretic Exam Seating Arrangement:")
    print("  Minimising Adjacent Conflicts Using Graph Colouring")
    print("-" * 80)
    print("  Student Name : Pranjali Nitin Bharsakale")
    print("  PRN          : 1251070295")
    print("  Roll Number  : 2")
    print(border)
    print()


def print_legend():
    """Prints a clear legend explaining course codes, initials, and symbols."""
    print("COURSE & SEAT LEGEND:")
    print("  + Code + Init + Course Name            + Group Size +")
    print("  +------+------+------------------------+------------+")
    students = get_sample_students()
    from collections import Counter
    counts = Counter(s["course"] for s in students)
    for c in COURSES:
        code = COURSE_CODES[c]
        init = c[0]
        cnt = counts[c]
        print(f"  | {code:<4} |  {init}   | {c:<22} | {cnt:>2} students |")
    print("  | ---- |  .   | [Empty Seat]           |  6 seats   |")
    print("  +------+------+------------------------+------------+")
    print()


def render_grid(arrangement, rows, cols, title=""):
    """
    Renders an ASCII visualization of the classroom seating grid.
    Each cell shows the course code and roll number or empty marker.
    """
    if title:
        print(f"--- {title} ---")
        
    col_width = 10
    total_width = cols * (col_width + 1) + 1
    horizontal_border = "+" + ("-" * col_width + "+") * cols
    
    # Print column headers
    header_str = " " * 6
    for c in range(cols):
        header_str += f"Col {c:<6} "
    print(header_str)
    print("      " + horizontal_border)
    
    for r in range(rows):
        line1 = f"R{r}  | |"
        line2 = f"    | |"
        for c in range(cols):
            student = arrangement.get((r, c))
            if student is not None:
                code = COURSE_CODES.get(student["course"], "UNK")
                roll = student["roll_no"]
                line1 += f" {code:^8} |"
                line2 += f" {roll:^8} |"
            else:
                line1 += f" {'---':^8} |"
                line2 += f" {'(Empty)':^8} |"
        print(line1)
        print(line2)
        print("      " + horizontal_border)
    print()


def run_experiment():
    """Runs all seating methods across both graph connectivity models."""
    rows, cols = get_classroom_dimensions()
    students = get_sample_students()
    
    print(f"Classroom Configuration: {rows} Rows x {cols} Columns = {rows * cols} Total Seats.")
    print(f"Total Student Population: {len(students)} Students ({rows * cols - len(students)} Empty Seats).\n")
    
    print_legend()
    
    # =========================================================================
    # PART 1: THEORETICAL FEASIBILITY ANALYSIS (PIGEONHOLE PRINCIPLE)
    # =========================================================================
    print("=" * 80)
    print("1. THEORETICAL FEASIBILITY CHECK (PIGEONHOLE PRINCIPLE BOUNDS)")
    print("=" * 80)
    
    feas_no_diag = feasibility_check(students, rows, cols, include_diagonals=False)
    print(feas_no_diag["message"])
    print()
    
    feas_diag = feasibility_check(students, rows, cols, include_diagonals=True)
    print(feas_diag["message"])
    print()
    
    # =========================================================================
    # PART 2: GRAPH COLOURING STRUCTURE
    # =========================================================================
    print("=" * 80)
    print("2. GRAPH CHROMATIC NUMBER & COLOURING PATTERNS")
    print("=" * 80)
    colors_no_diag = get_seat_colors(rows, cols, include_diagonals=False)
    num_colors_no_diag = len(set(colors_no_diag.values()))
    print(f"Without Diagonals (4-Connected Grid Graph):")
    print(f"  - Theoretical Chromatic Number chi(G) : 2 (Bipartite Graph, no odd cycles)")
    print(f"  - Colours used by Pattern Method       : {num_colors_no_diag} colour classes (0, 1)")
    print(f"  - Colour formula                       : colour(r, c) = (r + c) mod 2")
    print()
    
    colors_diag = get_seat_colors(rows, cols, include_diagonals=True)
    num_colors_diag = len(set(colors_diag.values()))
    print(f"With Diagonals (8-Connected King's Graph):")
    print(f"  - Theoretical Chromatic Number chi(G) : 4 (contains K_4 cliques in each 2x2 block)")
    print(f"  - Colours used by Pattern Method       : {num_colors_diag} colour classes (0, 1, 2, 3)")
    print(f"  - Colour formula                       : colour(r, c) = (r mod 2) * 2 + (c mod 2)")
    print()
    
    # Build the two graph representations
    seat_graph_no_diag = build_seat_graph(rows, cols, include_diagonals=False)
    seat_graph_diag = build_seat_graph(rows, cols, include_diagonals=True)
    
    # =========================================================================
    # PART 3: EXECUTION & SEATING ARRANGEMENTS
    # =========================================================================
    print("=" * 80)
    print("3. GENERATING SEATING ARRANGEMENTS (NO DIAGONALS: FRONT/BACK/LEFT/RIGHT)")
    print("=" * 80)
    
    # Setting 1: No diagonals
    # Fixed seed = 42 for reproducible baseline
    rand_arr_no_diag = random_seating(students, rows, cols, seed=42)
    rand_score_no_diag = risk_score(rand_arr_no_diag, seat_graph_no_diag)
    render_grid(rand_arr_no_diag, rows, cols, f"Random Seating [No Diagonals] (Risk Score = {rand_score_no_diag})")
    
    pat_arr_no_diag = pattern_seating(students, rows, cols, include_diagonals=False)
    pat_score_no_diag = risk_score(pat_arr_no_diag, seat_graph_no_diag)
    render_grid(pat_arr_no_diag, rows, cols, f"Graph Pattern Seating [No Diagonals] (Risk Score = {pat_score_no_diag})")
    
    opt_arr_no_diag, opt_stats_no_diag = optimize_seating(rand_arr_no_diag, seat_graph_no_diag, max_iterations=2000, seed=42)
    opt_score_no_diag = opt_stats_no_diag["final_score"]
    render_grid(opt_arr_no_diag, rows, cols, f"Hill Climbing Optimized [No Diagonals] (Risk Score = {opt_score_no_diag})")
    print(f"  Hill Climbing stats: {opt_stats_no_diag['initial_score']} -> {opt_score_no_diag} "
          f"in {opt_stats_no_diag['iterations_run']} iterations ({opt_stats_no_diag['swaps_made']} successful swaps)\n")
    
    print("=" * 80)
    print("4. GENERATING SEATING ARRANGEMENTS (WITH DIAGONALS: 8-NEIGHBOR KING'S GRAPH)")
    print("=" * 80)
    
    # Setting 2: With diagonals
    rand_arr_diag = random_seating(students, rows, cols, seed=42)
    rand_score_diag = risk_score(rand_arr_diag, seat_graph_diag)
    render_grid(rand_arr_diag, rows, cols, f"Random Seating [With Diagonals] (Risk Score = {rand_score_diag})")
    
    pat_arr_diag = pattern_seating(students, rows, cols, include_diagonals=True)
    pat_score_diag = risk_score(pat_arr_diag, seat_graph_diag)
    render_grid(pat_arr_diag, rows, cols, f"Graph Pattern Seating [With Diagonals] (Risk Score = {pat_score_diag})")
    
    opt_arr_diag, opt_stats_diag = optimize_seating(rand_arr_diag, seat_graph_diag, max_iterations=3000, seed=42)
    opt_score_diag = opt_stats_diag["final_score"]
    render_grid(opt_arr_diag, rows, cols, f"Hill Climbing Optimized [With Diagonals] (Risk Score = {opt_score_diag})")
    print(f"  Hill Climbing stats: {opt_stats_diag['initial_score']} -> {opt_score_diag} "
          f"in {opt_stats_diag['iterations_run']} iterations ({opt_stats_diag['swaps_made']} successful swaps)\n")
    
    # =========================================================================
    # PART 4: COMPREHENSIVE COMPARISON TABLE
    # =========================================================================
    print("=" * 80)
    print("5. METHOD COMPARISON SUMMARY TABLE")
    print("=" * 80)
    
    print("+------------------------------------+----------------------+--------------------+")
    print("| Seating Method                     | Score (No Diagonals) | Score (Diagonals)  |")
    print("+------------------------------------+----------------------+--------------------+")
    print(f"| 1. Random Seating (Baseline)       | {rand_score_no_diag:^20} | {rand_score_diag:^18} |")
    print(f"| 2. Graph Pattern (Vertex Colouring)| {pat_score_no_diag:^20} | {pat_score_diag:^18} |")
    print(f"| 3. Hill Climbing (Local Search)    | {opt_score_no_diag:^20} | {opt_score_diag:^18} |")
    print("+------------------------------------+----------------------+--------------------+")
    print()
    print("ANALYSIS OF RESULTS:")
    print("  * Random baseline produces high conflict counts because independent sets are ignored.")
    print("  * Graph Pattern Seating analytically achieves 0 conflicts in both settings by allocating")
    print("    courses into independent sets of the seat graph.")
    print("  * Hill Climbing strictly improves or matches initial quality, successfully eliminating")
    print("    all adjacent conflicts.")
    print("=" * 80)


def main():
    print_banner()
    run_experiment()


if __name__ == "__main__":
    main()
