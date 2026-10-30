# Mathematical Foundations & Proofs
## Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring

**Student Details:**
- **Name:** Pranjali Nitin Bharsakale
- **PRN:** 1251070295
- **Roll No:** 2
- **Course:** Discrete Mathematics

---

### Theorem 1: Bipartiteness and 2-Colourability of the Orthogonal Seat Grid Graph

**Statement:**  
A $R \times C$ seat grid graph $G_{grid} = (V, E)$ with only orthogonal adjacencies (front, back, left, right) is bipartite and therefore has chromatic number $\chi(G_{grid}) \le 2$.

**Proof:**  
1. **Vertex Coordinate Definition:**  
   Let each seat be indexed by coordinates $(r, c)$ where $0 \le r < R$ and $0 \le c < C$.
   
2. **Adjacency Condition:**  
   Two seats $u = (r_1, c_1)$ and $v = (r_2, c_2)$ are adjacent in $G_{grid}$ if and only if their Manhattan distance is 1:
   $$|r_1 - r_2| + |c_1 - c_2| = 1$$
   This implies that exactly one coordinate changes by $\pm 1$ while the other remains identical.

3. **Parity Alternation:**  
   Define the coordinate sum function $f(r, c) = r + c$.  
   For any edge $(u, v) \in E$:
   $$f(r_2, c_2) = (r_1 \pm 1) + c_1 = f(r_1, c_1) \pm 1 \quad \text{or} \quad f(r_2, c_2) = r_1 + (c_1 \pm 1) = f(r_1, c_1) \pm 1$$
   In both cases, $f(r_2, c_2) \equiv f(r_1, c_1) + 1 \pmod 2$.  
   Hence, the parity of $(r + c)$ strictly alternates along any path in $G_{grid}$.

4. **No Odd Cycles:**  
   Consider any closed cycle $C = (v_0, v_1, v_2, \dots, v_k = v_0)$.  
   Starting at $v_0$, the parity changes at each step. To return to $v_0$ (which has the original parity), the number of parity transitions $k$ must be an even integer.  
   Therefore, every cycle in $G_{grid}$ has even length; $G_{grid}$ contains no odd cycles.

5. **Equivalence with Bipartite / 2-Colourable:**  
   By **König's Theorem (1936)**, a graph is bipartite if and only if it contains no odd cycles.  
   Every bipartite graph can be properly 2-coloured by setting:
   $$\text{colour}(r, c) = (r + c) \pmod 2$$
   Adjacent vertices have different parity, so no two adjacent vertices share a colour.  
   Thus, $\chi(G_{grid}) = 2$. $\blacksquare$

---

### Theorem 2: Necessity and Sufficiency of 4 Colours Under Diagonal Adjacency

**Statement:**  
A seat graph with both orthogonal and diagonal adjacencies (King's graph) requires at least 4 colours ($\chi(G) \ge 4$) for any grid with $R \ge 2, C \ge 2$, and can be properly coloured using exactly 4 colours.

**Proof:**  
1. **Clique Lower Bound:**  
   For any simple graph $G$, the chromatic number is bounded below by its clique number $\omega(G)$ (the size of its largest complete subgraph):
   $$\chi(G) \ge \omega(G)$$

2. **Existence of $K_4$ Subgraphs:**  
   Consider any $2 \times 2$ block of adjacent seats:
   $$B = \{(r, c), (r, c+1), (r+1, c), (r+1, c+1)\}$$
   Let us check all $\binom{4}{2} = 6$ pairwise connections:
   - $(r, c)$ is connected to $(r, c+1)$ [horizontal orthogonal edge]
   - $(r+1, c)$ is connected to $(r+1, c+1)$ [horizontal orthogonal edge]
   - $(r, c)$ is connected to $(r+1, c)$ [vertical orthogonal edge]
   - $(r, c+1)$ is connected to $(r+1, c+1)$ [vertical orthogonal edge]
   - $(r, c)$ is connected to $(r+1, c+1)$ [main diagonal edge]
   - $(r, c+1)$ is connected to $(r+1, c)$ [anti-diagonal edge]
   
   Every pair of vertices in $B$ is connected by an edge. Therefore, the induced subgraph on $B$ is isomorphic to the complete graph on 4 vertices, $K_4$.
   Since $K_4$ requires 4 distinct colours, $\omega(G) \ge 4 \implies \chi(G) \ge 4$.

3. **Sufficiency of 4 Colours (Proper 4-Colouring Construction):**  
   Assign each seat $(r, c)$ a colour in $\{0, 1, 2, 3\}$ using the 2D parity formula:
   $$\text{colour}(r, c) = (r \bmod 2) \times 2 + (c \bmod 2)$$
   
   Suppose two distinct seats $u = (r_1, c_1)$ and $v = (r_2, c_2)$ receive the same colour.  
   Then:
   $$(r_1 \bmod 2) = (r_2 \bmod 2) \implies |r_1 - r_2| \in \{0, 2, 4, \dots\}$$
   $$(c_1 \bmod 2) = (c_2 \bmod 2) \implies |c_1 - c_2| \in \{0, 2, 4, \dots\}$$
   Since $u \ne v$, either $|r_1 - r_2| \ge 2$ or $|c_1 - c_2| \ge 2$.  
   However, two seats are adjacent in King's graph if and only if:
   $$\max(|r_1 - r_2|, |c_1 - c_2|) = 1$$
   Since at least one coordinate difference is $\ge 2$, $u$ and $v$ can never be adjacent!  
   Therefore, no two adjacent vertices share a colour, making this a proper 4-colouring.  
   Thus, $\chi(G) = 4$. $\blacksquare$

---

### Theorem 3: Feasibility Bound via the Pigeonhole Principle and Maximum Independent Sets

**Statement:**  
Let $S_{max} \subseteq S$ be the subset of students enrolled in the most populous course, with size $k = |S_{max}|$.  
If $k > \alpha(G_{seat})$, where $\alpha(G_{seat})$ is the independence number of the seat graph, then **zero adjacent conflicts is mathematically impossible**.

**Proof:**  
1. **Condition for Zero Conflicts:**  
   A seating arrangement has zero adjacent conflicts for course $C$ if and only if no two students taking course $C$ sit in adjacent seats.  
   In graph theory, a set of vertices $I \subseteq V$ in which no two vertices are adjacent is called an **independent set**.  
   Thus, the subset of seats occupied by course $C$ must form an independent set in $G_{seat}$.

2. **Independence Number Definition:**  
   The independence number $\alpha(G_{seat})$ is the maximum cardinality of an independent set in $G_{seat}$:
   $$\alpha(G_{seat}) = \max \{ |I| : I \subseteq V, I \text{ is an independent set} \}$$

3. **Application of the Pigeonhole Principle:**  
   - Let the "pigeonholes" be the maximum number of pairwise non-adjacent seats that can possibly be chosen, which is $\alpha(G_{seat})$.
   - Let the "pigeons" be the $k$ students enrolled in the course.
   
   If $k > \alpha(G_{seat})$, any placement of the $k$ students into the classroom must select a subset of seats of size $k$.  
   Since $k > \alpha(G_{seat})$, this subset cannot be an independent set.  
   By the Pigeonhole Principle, at least two students must be placed into vertices that share an edge in $G_{seat}$, creating at least one adjacent conflict edge.

4. **Classroom Independent Set Bounds:**  
   - **Without Diagonals (Bipartite Grid):**  
     $$\alpha(G_{seat}) = \left\lceil \frac{R \times C}{2} \right\rceil$$
     For a $5 \times 6$ room: $\lceil 30 / 2 \rceil = 15$.
   - **With Diagonals (King's Graph):**  
     Since every disjoint $2 \times 2$ block forms a $K_4$ clique, and a clique can contain at most 1 vertex from any independent set:
     $$\alpha(G_{seat}) \le \left\lceil \frac{R}{2} \right\rceil \times \left\lceil \frac{C}{2} \right\rceil$$
     For a $5 \times 6$ room: $\lceil 5 / 2 \rceil \times \lceil 6 / 2 \rceil = 3 \times 3 = 9$.

   Hence, if any course has more than 15 students (without diagonals) or more than 9 students (with diagonals), zero conflicts is provably impossible. $\blacksquare$

---

### Theorem 4: Upper Bound on Greedy Graph Colouring ($\Delta(G) + 1$)

**Statement:**  
For any finite graph $G = (V, E)$ with maximum vertex degree $\Delta(G) = \max_{v \in V} \text{deg}(v)$, a standard greedy vertex colouring algorithm uses at most $\Delta(G) + 1$ colours.

**Proof:**  
1. **Greedy Colouring Mechanism:**  
   Order the vertices $v_1, v_2, \dots, v_n$.  
   At step $i$, assign vertex $v_i$ the smallest available non-negative integer colour $c \in \{0, 1, 2, \dots\}$ that is not currently assigned to any already-coloured neighbor of $v_i$.

2. **Degree Constraint:**  
   Vertex $v_i$ has at most $\text{deg}(v_i) \le \Delta(G)$ total neighbors in $G$.  
   Therefore, at the moment $v_i$ is coloured, at most $\Delta(G)$ distinct colours can already be taken by its adjacent neighbors.

3. **Pigeonhole Guarantee:**  
   In the set of first $\Delta(G) + 1$ colours $\{0, 1, \dots, \Delta(G)\}$, at most $\Delta(G)$ colours are forbidden by neighbors.  
   By the Pigeonhole Principle, at least one colour in this set is guaranteed to be free and available for $v_i$.  
   Therefore, the algorithm never needs to assign a colour index greater than $\Delta(G)$, establishing:
   $$\chi(G) \le \chi_{greedy}(G) \le \Delta(G) + 1 \quad \blacksquare$$

*(Note: In Brooks' Theorem (1941), this bound is refined to $\chi(G) \le \Delta(G)$ for any connected graph that is neither an odd cycle nor a complete graph).*

---

### Note 5: Nature of the Risk Score as an Abstract Graph-Theoretic Model

**Important Modeling Clarification:**  
The risk score defined in this project:
$$\text{RiskScore}(c) = \sum_{(u, v) \in E_{seat}, u < v} \mathbb{I}[c(u) == c(v) \ne \text{None}]$$
counts the exact number of monochromatic adjacent edges in the seat graph.

This metric serves as a **formal discrete mathematical proxy** for spatial proximity risk:
1. **Abstract Representation:** It models the geometric opportunity for unsanctioned peer communication during an examination.
2. **Not a Cheating Detector:** A non-zero risk score indicates structural proximity between students taking the same exam paper; it does **not** assert or measure actual academic misconduct, dishonest intent, or behavior.
3. **Preventive Facility Design:** Minimising or eliminating adjacent conflicts via graph colouring provides an administrative, preventative physical layout that structurally ensures exam integrity without making behavioral assumptions.
