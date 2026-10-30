"""
=============================================================================
Student Details:
Name: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2
Course: Discrete Mathematics
Project Title: Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring
=============================================================================

File: tests.py
Description: Comprehensive assertion-based test suite verifying graph theory
             properties, colouring bounds, optimizer guarantees, and seating integrity.
=============================================================================
"""

import sys
from data import get_classroom_dimensions, get_sample_students
from graphs import build_seat_graph, build_student_conflict_graph
from scoring import (
    risk_score,
    is_conflict_free,
    feasibility_check,
    calculate_max_independent_set_bound
)
from seating import (
    get_seat_colors,
    random_seating,
    pattern_seating,
    optimize_seating
)


def test_color_class_counts():
    """
    TEST 1: Assert that no-diagonal pattern uses 2 colour classes and
            diagonal pattern uses 4.
    """
    rows, cols = get_classroom_dimensions()
    
    # Without diagonals: bipartite grid -> exactly 2 colour classes
    colors_no_diag = get_seat_colors(rows, cols, include_diagonals=False)
    distinct_no_diag = set(colors_no_diag.values())
    assert len(distinct_no_diag) == 2, (
        f"Expected 2 colour classes without diagonals, but got {len(distinct_no_diag)}: {distinct_no_diag}"
    )
    assert distinct_no_diag == {0, 1}, f"Colour classes should be {{0, 1}}, got {distinct_no_diag}"
    
    # With diagonals: 2x2 blocks contain K_4 -> exactly 4 colour classes
    colors_diag = get_seat_colors(rows, cols, include_diagonals=True)
    distinct_diag = set(colors_diag.values())
    assert len(distinct_diag) == 4, (
        f"Expected 4 colour classes with diagonals, but got {len(distinct_diag)}: {distinct_diag}"
    )
    assert distinct_diag == {0, 1, 2, 3}, f"Colour classes should be {{0, 1, 2, 3}}, got {distinct_diag}"
    
    print("[PASS] Test 1: Colour class counts (2 for bipartite grid, 4 for King's graph).")


def test_proper_colouring():
    """
    TEST 2: Assert that no two adjacent seats share a colour in the pattern colouring.
    In graph theory, this confirms that the colouring is 'proper':
    forall (u, v) in E_seat, color(u) != color(v).
    """
    rows, cols = get_classroom_dimensions()
    
    # Check 1: Without diagonals
    seat_graph_no_diag = build_seat_graph(rows, cols, include_diagonals=False)
    colors_no_diag = get_seat_colors(rows, cols, include_diagonals=False)
    for u, neighbors in seat_graph_no_diag.items():
        for v in neighbors:
            assert colors_no_diag[u] != colors_no_diag[v], (
                f"Proper colouring violated without diagonals between {u} (color {colors_no_diag[u]}) "
                f"and {v} (color {colors_no_diag[v]})!"
            )
            
    # Check 2: With diagonals
    seat_graph_diag = build_seat_graph(rows, cols, include_diagonals=True)
    colors_diag = get_seat_colors(rows, cols, include_diagonals=True)
    for u, neighbors in seat_graph_diag.items():
        for v in neighbors:
            assert colors_diag[u] != colors_diag[v], (
                f"Proper colouring violated with diagonals between {u} (color {colors_diag[u]}) "
                f"and {v} (color {colors_diag[v]})!"
            )
            
    print("[PASS] Test 2: Proper vertex colouring verified (no adjacent seats share a colour).")


def test_optimizer_never_worsens():
    """
    TEST 3: Assert that the optimizer never returns a worse score than its input.
    Hill climbing rejects non-improving swaps; hence final_score <= initial_score.
    """
    rows, cols = get_classroom_dimensions()
    students = get_sample_students()
    
    seat_graph_no_diag = build_seat_graph(rows, cols, include_diagonals=False)
    seat_graph_diag = build_seat_graph(rows, cols, include_diagonals=True)
    
    # Test across multiple random seeds
    for test_seed in [10, 42, 99, 123]:
        # Case A: Without diagonals
        initial_arr_nd = random_seating(students, rows, cols, seed=test_seed)
        init_score_nd = risk_score(initial_arr_nd, seat_graph_no_diag)
        opt_arr_nd, stats_nd = optimize_seating(initial_arr_nd, seat_graph_no_diag, max_iterations=500, seed=test_seed)
        final_score_nd = risk_score(opt_arr_nd, seat_graph_no_diag)
        
        assert final_score_nd <= init_score_nd, (
            f"Optimizer worsened score without diagonals (seed {test_seed}): "
            f"Initial {init_score_nd} -> Final {final_score_nd}"
        )
        assert stats_nd["final_score"] == final_score_nd
        
        # Case B: With diagonals
        initial_arr_d = random_seating(students, rows, cols, seed=test_seed)
        init_score_d = risk_score(initial_arr_d, seat_graph_diag)
        opt_arr_d, stats_d = optimize_seating(initial_arr_d, seat_graph_diag, max_iterations=500, seed=test_seed)
        final_score_d = risk_score(opt_arr_d, seat_graph_diag)
        
        assert final_score_d <= init_score_d, (
            f"Optimizer worsened score with diagonals (seed {test_seed}): "
            f"Initial {init_score_d} -> Final {final_score_d}"
        )
        assert stats_d["final_score"] == final_score_d

    print("[PASS] Test 3: Optimizer monotonicity verified (final_score <= initial_score across multiple seeds).")


def test_student_placement_bijection():
    """
    TEST 4: Assert that every student gets exactly one seat (injective mapping S -> V_seat).
    No student is duplicated, and no student is omitted.
    """
    rows, cols = get_classroom_dimensions()
    students = get_sample_students()
    student_ids = {s["id"] for s in students}
    total_students = len(students)
    
    # Test all seating methods
    arr_rand = random_seating(students, rows, cols, seed=77)
    arr_pat_nd = pattern_seating(students, rows, cols, include_diagonals=False)
    arr_pat_d = pattern_seating(students, rows, cols, include_diagonals=True)
    
    seat_graph = build_seat_graph(rows, cols, include_diagonals=False)
    arr_opt, _ = optimize_seating(arr_rand, seat_graph, max_iterations=200, seed=77)
    
    methods = [
        ("Random Seating", arr_rand),
        ("Pattern Seating (No Diag)", arr_pat_nd),
        ("Pattern Seating (Diag)", arr_pat_d),
        ("Optimized Seating", arr_opt),
    ]
    
    for name, arr in methods:
        seated_students = [occupant for occupant in arr.values() if occupant is not None]
        assert len(seated_students) == total_students, (
            f"[{name}] Seated student count {len(seated_students)} != original {total_students}"
        )
        seated_ids = [s["id"] for s in seated_students]
        assert set(seated_ids) == student_ids, (
            f"[{name}] Student IDs set mismatch!"
        )
        assert len(set(seated_ids)) == total_students, (
            f"[{name}] Duplicate student found in seats!"
        )
        
    print("[PASS] Test 4: Bijective placement verified (every student seated exactly once, no duplicates or omissions).")


def test_seat_graph_properties():
    """
    TEST 5: Graph invariants of G_seat (vertex count, edge symmetry, degree limits).
    """
    rows, cols = get_classroom_dimensions()
    total_vertices = rows * cols
    
    # 4-connected grid graph
    sg_nd = build_seat_graph(rows, cols, include_diagonals=False)
    assert len(sg_nd) == total_vertices, f"Expected {total_vertices} vertices, got {len(sg_nd)}"
    for u, neighbors in sg_nd.items():
        assert len(neighbors) <= 4, f"Degree of {u} exceeds Delta=4"
        for v in neighbors:
            assert u in sg_nd[v], f"Asymmetric edge between {u} and {v}"
            
    # 8-connected King's graph
    sg_d = build_seat_graph(rows, cols, include_diagonals=True)
    assert len(sg_d) == total_vertices
    for u, neighbors in sg_d.items():
        assert len(neighbors) <= 8, f"Degree of {u} exceeds Delta=8"
        for v in neighbors:
            assert u in sg_d[v], f"Asymmetric edge between {u} and {v}"
            
    print("[PASS] Test 5: Seat graph properties verified (degrees, vertex counts, edge symmetry).")


def test_student_conflict_clique_structure():
    """
    TEST 6: Student conflict graph clique validation.
    Two students are adjacent iff they take the same course.
    """
    students = get_sample_students()
    cg = build_student_conflict_graph(students)
    
    from collections import Counter
    counts = Counter(s["course"] for s in students)
    
    for s in students:
        s_id = s["id"]
        # Degree in G_conflict must be (course_group_size - 1)
        expected_deg = counts[s["course"]] - 1
        assert len(cg[s_id]) == expected_deg, (
            f"Student {s_id} expected degree {expected_deg}, got {len(cg[s_id])}"
        )
        
    print("[PASS] Test 6: Student conflict graph verified (disjoint clique structure confirmed).")


def test_pigeonhole_feasibility():
    """
    TEST 7: Feasibility check with Pigeonhole Principle bounds.
    """
    rows, cols = 5, 6
    alpha_nd = calculate_max_independent_set_bound(rows, cols, include_diagonals=False)
    alpha_d = calculate_max_independent_set_bound(rows, cols, include_diagonals=True)
    
    assert alpha_nd == 15, f"Expected alpha_nd = 15, got {alpha_nd}"
    assert alpha_d == 9, f"Expected alpha_d = 9, got {alpha_d}"
    
    # 24 standard students (max course has 8 students)
    students = get_sample_students()
    res_nd = feasibility_check(students, rows, cols, include_diagonals=False)
    res_d = feasibility_check(students, rows, cols, include_diagonals=True)
    assert res_nd["feasible"] is True
    assert res_d["feasible"] is True
    
    # Test infeasible condition: create 10 students in same course with diagonals enabled (10 > 9)
    oversized_students = [{"id": i, "name": f"S{i}", "roll_no": f"X{i}", "course": "Biology"} for i in range(10)]
    res_infeasible = feasibility_check(oversized_students, rows, cols, include_diagonals=True)
    assert res_infeasible["feasible"] is False, "Expected infeasible when 10 > 9"
    assert "MATHEMATICALLY IMPOSSIBLE" in res_infeasible["message"]
    
    print("[PASS] Test 7: Pigeonhole Principle feasibility bounds verified.")


def run_all_tests():
    print("=" * 70)
    print("RUNNING DISCRETE MATHEMATICS UNIT TESTS")
    print("=" * 70)
    test_color_class_counts()
    test_proper_colouring()
    test_optimizer_never_worsens()
    test_student_placement_bijection()
    test_seat_graph_properties()
    test_student_conflict_clique_structure()
    test_pigeonhole_feasibility()
    print("=" * 70)
    print("ALL TESTS PASSED SUCCESSFULLY! (7/7)")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()
