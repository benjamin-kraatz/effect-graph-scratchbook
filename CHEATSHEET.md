# Effect Graph API - Quick Reference Cheatsheet

## Graph Creation

### Directed Graph
```typescript
const graph = Graph.mutate(Graph.directed(), (mutable) => {
  const a = Graph.addNode(mutable, "A");
  const b = Graph.addNode(mutable, "B");
  Graph.addEdge(mutable, a, b, 10); // weight = 10
});
```

### Undirected Graph
```typescript
const graph = Graph.mutate(Graph.undirected(), (mutable) => {
  const a = Graph.addNode(mutable, "A");
  const b = Graph.addNode(mutable, "B");
  Graph.addEdge(mutable, a, b, 5); // bidirectional
});
```

---

## Basic Query Operations

| Operation | Code | Returns |
|-----------|------|---------|
| Node count | `Graph.nodeCount(graph)` | `number` |
| Edge count | `Graph.edgeCount(graph)` | `number` |
| Get node data | `Graph.getNodeData(graph, idx)` | `T` (your data) |
| Get edge weight | `Graph.getEdgeData(graph, from, to)` | `W` (weight) |
| Has edge? | `Graph.hasEdge(graph, from, to)` | `boolean` |
| Get neighbors | `Graph.getNeighbors(graph, idx)` | `number[]` |
| Get predecessors | `Graph.getPredecessors(graph, idx)` | `number[]` |

---

## Traversal Algorithms

### Depth-First Search (DFS)
**Use when**: Need to explore deeply, find cycles, topological sort

```typescript
const order = Graph.dfs(graph, startNodeIdx);
// Order: depth-first (goes to leaf nodes first)
```

**Time**: O(V + E)  
**Space**: O(V) for recursion stack

---

### Breadth-First Search (BFS)
**Use when**: Need shortest path (unweighted), explore all neighbors first

```typescript
const order = Graph.bfs(graph, startNodeIdx);
// Order: level-by-level
```

**Time**: O(V + E)  
**Space**: O(V) for queue

---

## Analysis & Properties

### Cycle Detection
```typescript
const hasCycle = Graph.hasCycle(graph);
// true = cyclic graph, false = DAG (Directed Acyclic Graph)
```

**Time**: O(V + E)

---

### Topological Sort (DAGs only)
```typescript
const sorted = Graph.topologicalSort(graph);
// Returns nodes ordered such that for edge A→B, A comes before B
// Throws if graph has cycles
```

**Use cases**:
- Task scheduling
- Build system ordering
- Package dependency resolution
- Course prerequisites

**Time**: O(V + E)

---

### Connected Components
```typescript
const components = Graph.connectedComponents(graph);
// Returns: Set<number[]> - each array is one connected component
```

**Use cases**:
- Social network friend groups
- Network partitions
- Clustering

**Time**: O(V + E)

---

### Bipartite Check
```typescript
const isBipartite = Graph.isBipartite(graph);
// true = can 2-color graph (no odd cycles)
// false = has odd cycles
```

**Use cases**:
- Matching problems
- Conflict scheduling
- Two-party relationships

**Time**: O(V + E)

---

## Shortest Path Algorithms

### Dijkstra (Non-negative weights only)
```typescript
const result = Graph.shortestPathDijkstra(graph, startIdx, endIdx);
// Returns: { distance?: number, path?: number[] }
// distance = total weight, path = node indices
```

**Time**: O((V + E) log V) with binary heap  
**Space**: O(V)

**Use for**:
- GPS navigation
- Network routing
- Game pathfinding

---

### Bellman-Ford (Any weights)
```typescript
const result = Graph.shortestPathBellmanFord(graph, startIdx);
// Returns: Distances from start to all nodes
// Returns Effect.none if negative cycle detected
```

**Time**: O(V × E)  
**Space**: O(V)

**Advantages**:
- ✅ Handles negative weights
- ✅ Detects negative cycles
- ❌ Slower than Dijkstra

**Use for**:
- Forex/crypto arbitrage
- Currency exchange optimization

---

### A* (With Heuristic)
```typescript
const heuristic = (from: number, to: number) => {
  // Your heuristic function (e.g., Manhattan distance)
  return Math.abs(from - to);
};

const result = Graph.shortestPathAStar(graph, startIdx, endIdx, heuristic);
// Much faster than Dijkstra with good heuristic
```

**Time**: Depends on heuristic (O(b^d) where b is branching factor)  
**Use for**: Grid-based pathfinding, game maps

---

### Floyd-Warshall (All Pairs)
```typescript
const distanceMatrix = Graph.shortestPathFloydWarshall(graph);
// Returns: 2D array where distanceMatrix[i][j] = shortest distance i→j
```

**Time**: O(V³)  
**Space**: O(V²)

**Use when**: Need distances between ALL pairs repeatedly

---

## Export & Visualization

### GraphViz DOT Format
```typescript
const dot = Graph.toDot(graph);
// Returns DOT format string
// Paste into: https://dreampuf.github.io/GraphvizOnline/
```

**Use for**: Creating visual diagrams for documentation

---

## Common Patterns

### Find All Reachable Nodes
```typescript
const reachable = Graph.dfs(graph, startNode);
// Array of all nodes reachable from startNode
```

### Validate Dependency Graph
```typescript
if (Graph.hasCycle(graph)) {
  throw new Error("Circular dependency detected!");
}
```

### Execute Tasks in Order
```typescript
const order = Graph.topologicalSort(graph);
for (const taskIdx of order) {
  const task = Graph.getNodeData(graph, taskIdx);
  execute(task);
}
```

### Find Path Between Two Nodes
```typescript
// Unweighted
const path = Graph.bfs(graph, start); // all reachable
// Check if endNode is in path

// Weighted
const result = Graph.shortestPathDijkstra(graph, start, end);
if (result.path) {
  console.log("Shortest path:", result.path);
}
```

### Get All Nodes Similar to One
```typescript
const similar = Graph.bfs(undirectedGraph, nodeIdx);
// Returns all connected nodes (similarity network)
```

### Check Connected Network
```typescript
const components = Graph.connectedComponents(graph);
const isFullyConnected = components.size === 1;
```

---

## Algorithm Complexity Comparison

| Algorithm | Time | Space | Use Case |
|-----------|------|-------|----------|
| DFS | O(V+E) | O(V) | Explore all, detect cycles |
| BFS | O(V+E) | O(V) | Level-by-level exploration |
| Topological Sort | O(V+E) | O(V) | DAG ordering |
| Dijkstra | O((V+E)logV) | O(V) | Shortest path (non-negative) |
| Bellman-Ford | O(VE) | O(V) | Shortest path (any weights) |
| Floyd-Warshall | O(V³) | O(V²) | All-pairs shortest |
| A* | O(b^d) | O(b^d) | Pathfinding (with heuristic) |
| Connected Components | O(V+E) | O(V) | Find clusters |
| Bipartite Check | O(V+E) | O(V) | 2-coloring |
| Cycle Detection | O(V+E) | O(V) | Check acyclicity |

---

## Decision Matrix

**What do you need?** → **Which algorithm?**

| Goal | Algorithm |
|------|-----------|
| Check if acyclic (DAG) | `hasCycle()` |
| Order nodes (dependencies) | `topologicalSort()` |
| Find all reachable from node | `dfs()` or `bfs()` |
| Shortest path (unweighted) | `bfs()` |
| Shortest path (weighted, non-neg) | `shortestPathDijkstra()` |
| Shortest path (any weights) | `shortestPathBellmanFord()` |
| Shortest path (grid/heuristic) | `shortestPathAStar()` |
| All shortest paths | `shortestPathFloydWarshall()` |
| Find clusters/groups | `connectedComponents()` |
| Check 2-colorable | `isBipartite()` |
| Visualize | `toDot()` |

---

## Real-World Quick Lookup

### My Problem Is...

**"Ordering tasks with dependencies"**
→ Use: `topologicalSort()` on DAG

**"Find shortest route between cities"**
→ Use: `shortestPathDijkstra()` on undirected graph

**"Detect circular imports in code"**
→ Use: `hasCycle()` on import graph

**"Find friend groups in social network"**
→ Use: `connectedComponents()` on undirected graph

**"Detect infinite loops in function calls"**
→ Use: `hasCycle()` on call graph

**"Schedule meetings without conflicts"**
→ Use: `isBipartite()` check + matching algorithm

**"Deploy services in correct order"**
→ Use: `topologicalSort()` on dependency graph

**"Find all files needed for bundling"**
→ Use: `dfs()` from entry point

**"Detect circular permission grants"**
→ Use: `hasCycle()` on permission graph

**"Arbitrage between crypto exchanges"**
→ Use: `shortestPathBellmanFord()` with exchange rates

---

## Node & Edge Data Types

### Simple (String/Number Nodes)
```typescript
const graph = Graph.mutate(Graph.directed(), (mutable) => {
  const a = Graph.addNode(mutable, "node-a");
  const b = Graph.addNode(mutable, "node-b");
  Graph.addEdge(mutable, a, b, 1); // weight
});
```

### Complex Objects (Recommended for real apps)
```typescript
interface Task {
  name: string;
  duration: number;
}

const graph = Graph.mutate(Graph.directed(), (mutable) => {
  const task1 = Graph.addNode(mutable, {
    name: "Build",
    duration: 100,
  });
  const task2 = Graph.addNode(mutable, {
    name: "Test",
    duration: 200,
  });
  Graph.addEdge(mutable, task1, task2, null);
});

// Retrieve
const task = Graph.getNodeData(graph, 0); // { name: "Build", duration: 100 }
```

---

## Performance Tips

### ⚡ Speed Up Your Graphs

1. **Use DAGs**: Topological sort is O(V+E), much faster than general algorithms
2. **Sparse > Dense**: These algorithms work best on sparse graphs (few edges)
3. **Lazy Loading**: Only compute what you need
4. **Cache Results**: Store topological sorts and shortest paths
5. **Choose Right Algorithm**:
   - 1 path query? Dijkstra
   - Many path queries? Floyd-Warshall (precompute)
   - Large graphs? Use BFS/DFS instead of Floyd-Warshall

### 🚫 Avoid

- ❌ Floyd-Warshall on large sparse graphs (O(V³) kills performance)
- ❌ Dijkstra on negative weights (use Bellman-Ford)
- ❌ Topological sort on cyclic graphs (throws error)
- ❌ Creating enormous graphs in memory (use streaming/batching)

---

## Debugging Tips

### Print Graph Structure
```typescript
const dot = Graph.toDot(graph);
console.log(dot);
// Visualize at https://dreampuf.github.io/GraphvizOnline/
```

### Check Graph Validity
```typescript
console.log(`Nodes: ${Graph.nodeCount(graph)}`);
console.log(`Edges: ${Graph.edgeCount(graph)}`);
console.log(`Cyclic: ${Graph.hasCycle(graph)}`);
```

### Trace Path
```typescript
const result = Graph.shortestPathDijkstra(graph, 0, 5);
if (result.path) {
  console.log("Path:", result.path.map(idx => Graph.getNodeData(graph, idx)));
  console.log("Distance:", result.distance);
}
```

---

## Summary

✅ **Master 3 Core Operations**:
1. Create graphs with `Graph.mutate()`
2. Traverse with `dfs()` or `bfs()`
3. Analyze with algorithms like `hasCycle()`, `topologicalSort()`

✅ **Choose Algorithm by Use Case**:
- Ordering? → Topological sort
- Shortest path? → Dijkstra or Bellman-Ford
- Clusters? → Connected components
- Acyclic? → Cycle detection

✅ **Real-World Applications Everywhere**:
- Build systems, task schedulers
- Maps, navigation, routing
- Dependency resolution (npm, etc)
- Social networks
- Recommendation engines
- Workflow orchestration

**Happy graphing! 🎉**
