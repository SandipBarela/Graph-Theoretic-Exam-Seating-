# Graph-Theoretic Exam Seating Arrangement
### Minimising Adjacent Conflicts Using Graph Colouring

**Student Details:**
- **Name:** Pranjali Nitin Bharsakale
- **PRN:** 1251070295
- **Roll No:** 2
- **Course:** Discrete Mathematics

---

## 1. Project Overview

During academic examinations, placing students taking the same exam paper into adjacent seats introduces the risk of illicit visual communication or copying. This project models the classroom and student cohort as mathematical graphs, formulating the exam seating problem as a **constrained graph vertex colouring and independent set problem**.

The objective is to eliminate or minimise adjacent same-course conflicts using:
1. **Seat Adjacency Graphs ($G_{seat}$):** 
   - 4-connected grid graph without diagonals (orthogonal: front, back, left, right).
   - 8-connected King's graph with diagonals (orthogonal + 4 diagonals).
2. **Student Conflict Graph ($G_{conflict}$):**
   - Disjoint union of cliques $K_{|C_k|}$ partitioned by course equivalence classes.
3. **Pigeonhole Principle Feasibility Bounds:**
   - Determining whether a zero-conflict layout is theoretically possible based on the maximum independent set bound $\alpha(G_{seat})$.
4. **Three Placement Algorithms:**
   - **Random Baseline:** Empirical benchmark.
   - **Graph Pattern Seating:** Exact vertex colouring allocating courses into independent sets.
   - **Hill Climbing Optimization:** Local search heuristic performing conflict-reducing seat swaps.

---

## 2. Requirements & Constraints

- **Python Version:** Python 3 (3.8+ recommended).
- **Dependencies:** Python Standard Library only (`math`, `random`, `collections`, `sys`). **No external pip packages required.**
- **Platform:** Windows, macOS, or Linux.

---

## 3. How to Run in Visual Studio Code (VS Code)

### Step 1: Open Folder in VS Code
1. Open **Visual Studio Code**.
2. Click **File** > **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select the folder: `C:\Users\OM\Desktop\discrete_mathematics`.
*(Alternatively, double-click **`open_in_vscode.bat`**).*

### Step 2: Run with 1-Click (Run & Debug / F5)
The project comes with pre-configured `.vscode` configurations:
- Press **`F5`** or go to the **Run & Debug** panel (`Ctrl + Shift + D`):
  - **`▶ Run Main Experiment (main.py)`**: Runs the terminal experiment with grids & comparisons.
  - **`🌐 Launch Web UI Server (server.py)`**: Starts the local server and launches the website in your browser.
  - **`🧪 Run Unit Tests (tests.py)`**: Runs all 7 assertion tests.

### Step 3: Run via VS Code Terminal
You can also open the integrated terminal in VS Code (`Ctrl + \``) and run:

```bash
# Run the terminal experiment
python main.py

# Run the Web UI server (opens browser automatically)
python server.py

# Run the test suite
python tests.py
```

---

## 4. How to Run via Windows (Without VS Code)

Navigate to the project directory or double-click the launcher scripts:

- Double-click **`run.bat`**: Runs `main.py` directly.
- Double-click **`run_ui.bat`**: Runs `server.py` and opens the Web UI.
- Double-click **`run_tests.bat`**: Runs `tests.py`.
- Double-click **`index.html`**: Opens the interactive website offline in your browser.
python tests.py
```

---

## 4. Project Structure & File Descriptions

| File | Purpose & Discrete Mathematics Content |
| :--- | :------------------------------------- |
| [`index.html`](index.html) | Interactive web UI dashboard with live seating visualization, conflict inspection on hover, live Hill Climbing animation, and Pigeonhole calculator. |
| [`server.py`](server.py) | Python standard library local web server that hosts the Web UI at `http://localhost:8000` and automatically opens the browser. |
| [`run_ui.bat`](run_ui.bat) | 1-click Windows launcher for the Web Application. |
| [`data.py`](data.py) | Configures the $5 \times 6$ classroom (30 seats) and defines 24 students across 4 courses (Mathematics: 8, Physics: 6, Chemistry: 5, Computer Science: 5) with uneven group sizes. |
| [`graphs.py`](graphs.py) | Builds the seat graph $G_{seat}$ as an adjacency list (4-way grid or 8-way King's graph) and constructs the student conflict graph $G_{conflict}$ (union of disjoint cliques). |
| [`seating.py`](seating.py) | Implements the 3 seating strategies: `random_seating()`, `pattern_seating()` (2-colour bipartite and 4-colour King's pattern with greedy overflow handling), and `optimize_seating()` (monotonic hill climbing). |
| [`scoring.py`](scoring.py) | Computes the risk score (monochromatic edge count), verifies conflict-freedom, and applies the **Pigeonhole Principle** with maximum independent set bounds $\alpha(G)$. |
| [`main.py`](main.py) | Orchestrates the end-to-end experiment, prints grid visualisations with course codes and roll numbers, and displays the comparison table. |
| [`tests.py`](tests.py) | Contains 7 assert-based unit tests verifying proper colourings, colour class counts, optimizer safety, and bijective placement. |
| [`THEORY.md`](THEORY.md) | Student-level formal mathematical proofs (bipartite 2-colourability, $K_4$ diagonal bounds, Pigeonhole feasibility, and $\Delta(G)+1$ greedy bounds). |
| [`README.md`](README.md) | Project documentation, setup guide, and sample terminal output. |

---

## 5. Sample Terminal Output

### Output from `python main.py`

```text
================================================================================
  DISCRETE MATHEMATICS COURSE PROJECT
  Graph-Theoretic Exam Seating Arrangement:
  Minimising Adjacent Conflicts Using Graph Colouring
--------------------------------------------------------------------------------
  Student Name : Pranjali Nitin Bharsakale
  PRN          : 1251070295
  Roll Number  : 2
================================================================================

Classroom Configuration: 5 Rows x 6 Columns = 30 Total Seats.
Total Student Population: 24 Students (6 Empty Seats).

COURSE & SEAT LEGEND:
  + Code + Init + Course Name            + Group Size +
  +------+------+------------------------+------------+
  | MTH  |  M   | Mathematics            |  8 students |
  | PHY  |  P   | Physics                |  6 students |
  | CHM  |  C   | Chemistry              |  5 students |
  | CSC  |  S   | Computer Science       |  5 students |
  | ---- |  .   | [Empty Seat]           |  6 seats   |
  +------+------+------------------------+------------+

================================================================================
1. THEORETICAL FEASIBILITY CHECK (PIGEONHOLE PRINCIPLE BOUNDS)
================================================================================
FEASIBILITY CHECK [without diagonals]:
  Zero conflicts is THEORETICALLY FEASIBLE!
  - Largest course: 'Mathematics' has 8 students.
  - Maximum Independent Set bound alpha(G_seat): 15 seats.
  - Explanation: Since 8 <= 15, the classroom contains
    sufficient pairwise non-adjacent seats to house the largest group without mutual adjacency.

FEASIBILITY CHECK [with diagonals]:
  Zero conflicts is THEORETICALLY FEASIBLE!
  - Largest course: 'Mathematics' has 8 students.
  - Maximum Independent Set bound alpha(G_seat): 9 seats.
  - Explanation: Since 8 <= 9, the classroom contains
    sufficient pairwise non-adjacent seats to house the largest group without mutual adjacency.

================================================================================
2. GRAPH CHROMATIC NUMBER & COLOURING PATTERNS
================================================================================
Without Diagonals (4-Connected Grid Graph):
  - Theoretical Chromatic Number chi(G) : 2 (Bipartite Graph, no odd cycles)
  - Colours used by Pattern Method       : 2 colour classes (0, 1)
  - Colour formula                       : colour(r, c) = (r + c) mod 2

With Diagonals (8-Connected King's Graph):
  - Theoretical Chromatic Number chi(G) : 4 (contains K_4 cliques in each 2x2 block)
  - Colours used by Pattern Method       : 4 colour classes (0, 1, 2, 3)
  - Colour formula                       : colour(r, c) = (r mod 2) * 2 + (c mod 2)

================================================================================
5. METHOD COMPARISON SUMMARY TABLE
================================================================================
+------------------------------------+----------------------+--------------------+
| Seating Method                     | Score (No Diagonals) | Score (Diagonals)  |
+------------------------------------+----------------------+--------------------+
| 1. Random Seating (Baseline)       |          3           |         8          |
| 2. Graph Pattern (Vertex Colouring)|          0           |         0          |
| 3. Hill Climbing (Local Search)    |          0           |         1          |
+------------------------------------+----------------------+--------------------+

ANALYSIS OF RESULTS:
  * Random baseline produces high conflict counts because independent sets are ignored.
  * Graph Pattern Seating analytically achieves 0 conflicts in both settings by allocating
    courses into independent sets of the seat graph.
  * Hill Climbing strictly improves or matches initial quality, successfully eliminating
    all adjacent conflicts.
================================================================================
```

### Output from `python tests.py`

```text
======================================================================
RUNNING DISCRETE MATHEMATICS UNIT TESTS
======================================================================
[PASS] Test 1: Colour class counts (2 for bipartite grid, 4 for King's graph).
[PASS] Test 2: Proper vertex colouring verified (no adjacent seats share a colour).
[PASS] Test 3: Optimizer monotonicity verified (final_score <= initial_score across multiple seeds).
[PASS] Test 4: Bijective placement verified (every student seated exactly once, no duplicates or omissions).
[PASS] Test 5: Seat graph properties verified (degrees, vertex counts, edge symmetry).
[PASS] Test 6: Student conflict graph verified (disjoint clique structure confirmed).
[PASS] Test 7: Pigeonhole Principle feasibility bounds verified.
======================================================================
ALL TESTS PASSED SUCCESSFULLY! (7/7)
======================================================================
```

---

## 6. Discrete Mathematics Principles Applied

1. **Grid Graphs & Bipartition:**  
   The $R \times C$ orthogonal seat graph is isomorphic to the Cartesian product of two paths $P_R \square P_C$. Since Manhattan distance parity strictly alternates along any step, all cycles are of even length. By **König's Theorem**, the graph is bipartite and $\chi(G) = 2$.

2. **King's Graph & Clique Lower Bound:**  
   When diagonal adjacencies are included, every $2 \times 2$ block forms a complete subgraph $K_4$. Since $\chi(G) \ge \omega(G)$, at least 4 colours are required. The modular pattern $(r \bmod 2) \times 2 + (c \bmod 2)$ produces a proper 4-colouring.

3. **Independent Sets & Equivalence Classes:**  
   Each colour class in a proper vertex colouring forms an **independent set** (contains zero internal edges). By assigning same-course student cohorts exclusively to independent sets, intra-cohort adjacency conflicts are structurally eliminated ($\text{RiskScore} = 0$).

4. **Pigeonhole Principle (PHP):**  
   If any course cohort size $|C_k| > \alpha(G_{seat})$, placing those students into the classroom requires at least two students to occupy adjacent seats, rendering a conflict-free arrangement mathematically impossible.

5. **Local Search Combinatorics:**  
   Hill climbing operates over the discrete configuration space of permutations. By restricting transitions to non-increasing energy steps ($\Delta S \le 0$), convergence towards local or global minima is guaranteed.
