# 🚀 Effect Graph API - Comprehensive Playground

An extensive suite of 18 progressive examples learning and exploring the **new Effect Graph API** from Effect 3.18+. This playground provides everything from basic graph creation to real-world applications.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Concepts Overview](#concepts-overview)
3. [Examples Breakdown](#examples-breakdown)
4. [Real-World Use Cases](#real-world-use-cases)
5. [API Reference](#api-reference)

---

## Quick Start

```bash
# Run all 18 examples
bun run index.ts
```

---

## Concepts Overview

### What is a Graph?

A graph is a data structure consisting of:
- **Nodes (Vertices)**: Entities or points
- **Edges (Links)**: Connections between nodes, optionally with weights

### Directed vs Undirected

- **Directed**: Edges have direction (A → B is different from B → A). Think: dependencies, follow relationships
- **Undirected**: Edges have no direction (A-B same as B-A). Think: friendships, networks

### Key Properties

- **Weighted**: Edges have values (distances, costs, strengths)
- **Cyclic**: Has cycles (loops). Acyclic graphs (DAGs) have no cycles

---

## Examples Breakdown

### 1️⃣ Basic Directed Graph Creation

**What**: Create a simple directed graph with nodes and weighted edges

**Why**: Foundation for all graph operations

**Use Case**: Understanding basic node/edge creation

```typescript
const graph = Graph.mutate(Graph.directed(), (mutable) => {
  const a = Graph.addNode(mutable, "A");
  const b = Graph.addNode(mutable, "B");
  Graph.addEdge(mutable, a, b, 10); // weight = 10
});
```

---

### 2️⃣ Undirected Graphs

**What**: Create a graph where edges work both ways

**Why**: Model symmetric relationships

**Use Cases**:
- Social networks (friendships)
- Road networks (travel between cities)
- Communication networks

```typescript
const graph = Graph.mutate(Graph.undirected(), (mutable) => {
  const alice = Graph.addNode(mutable, "Alice");
  const bob = Graph.addNode(mutable, "Bob");
  Graph.addEdge(mutable, alice, bob, 1); // distance
});
```

---

### 3️⃣ Depth-First Search (DFS)

**What**: Traverse graph by exploring deeply before backtracking

**Characteristics**:
- Uses stack (recursive)
- Explores to leaf nodes
- Good for: finding cycles, topological sort, connected components

**Time**: O(V + E) where V = vertices, E = edges

```typescript
const dfsOrder = Graph.dfs(graph, 0); // [0, 1, 3, 2]
```

---

### 4️⃣ Breadth-First Search (BFS)

**What**: Traverse graph level-by-level

**Characteristics**:
- Uses queue
- Explores neighbors first
- Good for: shortest paths (unweighted), connected components

**Time**: O(V + E)

```typescript
const bfsOrder = Graph.bfs(graph, 0); // [0, 1, 2, 3]
```

---

### 5️⃣ Cycle Detection

**What**: Determine if graph contains cycles

**Returns**: `true` if cycle exists, `false` for DAG (Directed Acyclic Graph)

**Why It Matters**:
- Prevent infinite loops in task execution
- Validate dependency graphs
- Check for circular dependencies

```typescript
const hasCycle = Graph.hasCycle(graph);
```

---

### 6️⃣ Topological Sort

**What**: Order nodes such that for every edge A→B, A comes before B

**Only Works On**: DAGs (no cycles)

**Use Cases**:
- ✅ Task scheduling
- ✅ Build system execution order
- ✅ Package dependency resolution
- ✅ Course prerequisites

```typescript
// Input: Foundation → Walls → Roof → Interior → Painting
// Output: [Foundation, Walls, Roof, Interior, Painting]
const sorted = Graph.topologicalSort(graph);
```

---

### 7️⃣ Dijkstra's Shortest Path

**What**: Find shortest path between two nodes (weighted)

**Constraints**: All weights must be ≥ 0

**Time**: O((V + E) log V) with binary heap

**Use Cases**:
- GPS navigation
- Network routing
- Game pathfinding

```typescript
const result = Graph.shortestPathDijkstra(graph, start, end);
// Returns: { distance, path }
```

---

### 8️⃣ Connected Components

**What**: Find all groups of connected nodes

**Use Cases**:
- Social network: friend groups
- Networks: isolated subnets
- Clustering: data grouping

```typescript
const components = Graph.connectedComponents(graph);
// Returns: Set of sets, each set is one component
```

---

### 9️⃣ Real-World: Dependency Resolution (npm-like)

**Problem**: Install packages in correct order respecting dependencies

**Solution**: Topological sort on dependency graph

**Real Use**:
```
app depends on: react, typescript
react depends on: lodash

Install order: lodash → react → typescript → app
```

**Why Graph API**:
- Detects circular dependencies (prevents infinite loops)
- Validates entire dependency tree
- Optimizes install order

---

### 🔟 Real-World: Social Network Analysis

**Problem**: Analyze friendship networks

**Features**:
- Node count: total people
- Edge count: total friendships
- Connected components: separate friend groups

**Real Use**: Discord finding friend groups, Facebook's social graph

---

### 1️⃣1️⃣ Real-World: Compiler AST Analysis

**Problem**: Analyze function calls in compiler

**Features**:
- DFS to find reachable functions
- Cycle detection for recursion
- Call graph analysis

**Real Use**: Dead code elimination, unused function detection

---

### 1️⃣2️⃣ Real-World: Build System

**Problem**: Execute build tasks respecting dependencies

**Example**:
```
clean → lint → compile → test ↘
                          ↗ bundle → upload
```

**Why Graph API**:
- Validates build graph (no circular dependencies)
- Determines execution order
- Can compute parallelizable tasks

**Real Systems**: Make, Gradle, Bazel use similar concepts

---

### 1️⃣3️⃣ Real-World: Flight Route Network

**Problem**: Find cheapest/shortest flight route

**Solution**: Dijkstra's algorithm on weighted graph

**Real Use**: Google Flights, Kayak route planning

---

### 1️⃣4️⃣ Real-World: Team Assignment (Bipartite)

**Problem**: Assign team members to tasks they can handle

**Structure**: Two sets (members, tasks) with edges for capabilities

**Use Cases**:
- HR: job assignments
- Project management: skill matching
- Scheduling: resource allocation

---

### 1️⃣5️⃣ Bellman-Ford (Negative Weights)

**What**: Shortest path algorithm that handles negative weights

**Difference from Dijkstra**:
- ✅ Handles negative weights
- ❌ Slower: O(V × E)
- ✅ Detects negative cycles

**Use Cases**:
- Forex arbitrage detection
- Currency exchange optimization
- Network routing with costs/subsidies

---

### 1️⃣6️⃣ Bipartite Graph Detection

**What**: Check if graph can be 2-colored (no adjacent nodes same color)

**Use Cases**:
- Matching problems
- Scheduling conflicts
- Two-party relationships

**Property**: Bipartite graphs have NO odd cycles

---

### 1️⃣7️⃣ GraphViz DOT Export

**What**: Export graph to visualization format

**Use**: Paste into [GraphvizOnline](https://dreampuf.github.io/GraphvizOnline/) for visual rendering

**Real Use**: Documentation, architecture diagrams

---

### 1️⃣8️⃣ Floyd-Warshall (All-Pairs Shortest)

**What**: Compute shortest paths between ALL node pairs

**Output**: Distance matrix

**Time**: O(V³)

**Use Cases**:
- Finding diameter of graph
- Travel time matrix for logistics
- Network topology analysis

---

## Real-World Use Cases

### ✅ Use Graph API When You Have:

1. **Dependencies**: Task scheduling, build systems, package management
2. **Networks**: Social, transportation, communication, computer networks
3. **Hierarchies**: Organization charts, file systems, decision trees
4. **Flows**: Networking routing, supply chains, workflow systems
5. **Relationships**: Knowledge graphs, recommendation systems, genealogy

### 📊 Example Applications:

| Problem | Graph Type | Algorithm |
|---------|-----------|-----------|
| npm install order | DAG | Topological Sort |
| Google Maps | Weighted undirected | Dijkstra |
| Function calls | Directed | DFS + Cycle detection |
| Social network | Undirected | Connected components |
| Build system | DAG | Topological sort |
| Crypto arbitrage | Directed weighted | Bellman-Ford |
| Meeting scheduling | Undirected | Bipartite + Matching |
| Network topology | Mixed | BFS/DFS + components |

---

## API Reference

### Basic Operations

```typescript
// Create graphs
const directedGraph = Graph.directed();
const undirectedGraph = Graph.undirected();

// Mutate (add nodes/edges)
const graph = Graph.mutate(Graph.directed(), (mutable) => {
  const nodeIdx = Graph.addNode(mutable, data);
  Graph.addEdge(mutable, fromIdx, toIdx, weight);
});

// Query
Graph.nodeCount(graph);           // number of nodes
Graph.edgeCount(graph);           // number of edges
Graph.getNodeData(graph, index);  // get node data
Graph.getEdgeData(graph, from, to); // get edge data
```

### Traversal

```typescript
Graph.dfs(graph, startNode);      // depth-first order
Graph.bfs(graph, startNode);      // breadth-first order
Graph.topologicalSort(graph);     // valid only for DAGs
```

### Analysis

```typescript
Graph.hasCycle(graph);            // boolean
Graph.isBipartite(graph);         // boolean
Graph.connectedComponents(graph); // Set<number[]>
```

### Shortest Paths

```typescript
// For non-negative weights
Graph.shortestPathDijkstra(graph, from, to);

// For any weights (slower)
Graph.shortestPathBellmanFord(graph, from);

// All pairs (slowest but complete)
Graph.shortestPathFloydWarshall(graph); // returns distance matrix
Graph.shortestPathAStar(graph, from, to, heuristic);

// A* (with heuristic for faster pathfinding)
// Example: Manhattan distance heuristic for grid
```

### Export

```typescript
// Visualize
Graph.toDot(graph); // GraphViz DOT format
```

---

## Tips & Tricks

### 🎯 Choosing Algorithms

| Need | Algorithm | Complexity |
|------|-----------|-----------|
| Any reachable node? | BFS/DFS | O(V+E) |
| All reachable in order? | DFS | O(V+E) |
| Shortest path (non-negative)? | Dijkstra | O((V+E)logV) |
| Shortest path (any weight)? | Bellman-Ford | O(VE) |
| All shortest paths? | Floyd-Warshall | O(V³) |
| Check validity (DAG)? | Cycle detection | O(V+E) |
| Groups/clusters? | Connected components | O(V+E) |

### 💡 Performance Tips

1. **DAGs are fast**: Topological sort is O(V+E)
2. **Sparse > Dense**: Adjacency list (used here) better for sparse graphs
3. **Choose algorithm for your data**: Dijkstra fine for 1 query; Floyd-Warshall for many queries
4. **Lazy evaluation**: Don't compute all algorithms; only what you need

### 🛠️ Common Patterns

**Find all reachable nodes from start:**
```typescript
const reachable = Graph.dfs(graph, start);
```

**Validate dependency graph:**
```typescript
if (Graph.hasCycle(graph)) throw new Error("Circular dependency!");
```

**Execute in dependency order:**
```typescript
const order = Graph.topologicalSort(graph);
for (const idx of order) {
  execute(Graph.getNodeData(graph, idx));
}
```

---

## Learning Path

1. **Start**: Examples 1-4 (graph basics, traversal)
2. **Intermediate**: Examples 5-8 (cycles, sorting, pathfinding)
3. **Advanced**: Examples 9-18 (real-world applications)

Pick an example that resonates, modify it, experiment!

---

## Key Takeaways

✅ **Graphs model relationships** between entities  
✅ **Traversal algorithms** (DFS/BFS) explore connections  
✅ **Shortest path algorithms** find optimal routes  
✅ **Topological sort** validates and orders DAGs  
✅ **Connected components** find clusters  
✅ **Real-world uses** everywhere: maps, social networks, compilers, build systems  

---

## Further Reading

- [Effect Docs](https://effect.website/)
- [Graph Theory Basics](https://en.wikipedia.org/wiki/Graph_theory)
- [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra's_algorithm)
- [Topological Sorting](https://en.wikipedia.org/wiki/Topological_sorting)
- [Connected Components](https://en.wikipedia.org/wiki/Connected_component_(graph_theory))

---

**Happy graph building! 🎉**
