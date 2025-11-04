# 📚 Effect Graph API - Complete Learning Guide

Welcome! This guide walks you through the entire Effect Graph API playground, from absolute beginner to advanced real-world usage.

---

## 🎯 What You'll Learn

By the end of this guide, you'll understand:

- ✅ What graphs are and why they matter
- ✅ How to create and manipulate graphs in Effect
- ✅ Key algorithms: DFS, BFS, Dijkstra, topological sort
- ✅ Real-world applications in your domain
- ✅ Performance considerations and best practices

**Time to complete**: ~2-3 hours (or learn at your own pace)

---

## 📂 Resource Map

| Resource | Purpose | Time |
|----------|---------|------|
| `index.ts` | 18 progressive examples (basic to real-world) | 30 mins reading |
| `README.md` | Detailed explanation of all 18 examples | 45 mins reading |
| `CHEATSHEET.md` | Quick reference for all operations | 15 mins reference |
| `advanced-examples.ts` | 10 complex real-world patterns | 30 mins reading |
| This file | Step-by-step learning path | 20 mins guide |

---

## 🚀 Quick Start (5 Minutes)

### 1. Understand What a Graph Is
A graph has:
- **Nodes** (or vertices): Things (people, tasks, cities)
- **Edges** (or links): Connections between things with optional weights

```typescript
// People (nodes)    Friendships (edges)
Alice ←→ Bob
  ↓      ↓
Carol   Dave
```

### 2. Create Your First Graph
```typescript
import { Graph } from "effect";

const graph = Graph.mutate(Graph.directed(), (mutable) => {
  const a = Graph.addNode(mutable, "A");
  const b = Graph.addNode(mutable, "B");
  Graph.addEdge(mutable, a, b, 10); // A→B with weight 10
});

console.log(Graph.nodeCount(graph)); // 2
console.log(Graph.edgeCount(graph)); // 1
```

### 3. Run an Algorithm
```typescript
const order = Graph.dfs(graph, 0); // [0, 1]
```

✅ **You're done!** You've created and queried a graph.

---

## 📖 Learning Path (3 Hours)

### Phase 1: Foundations (30 mins)
**Goal**: Understand graph basics and how to create graphs

**Read**: Examples 1-2 in `index.ts`
**Then do**: `README.md` sections on "Graph Creation" and "Concepts"

**Key concepts**:
- Directed vs undirected graphs
- Nodes and edges
- Graph mutation API
- Node and edge data

**Try this**: Create a small graph modeling something you know (your friend group, your project dependencies)

---

### Phase 2: Traversal (45 mins)
**Goal**: Learn how to explore graphs

**Read**: Examples 3-4 in `index.ts`
**Then do**: `README.md` sections on "DFS" and "BFS"
**Reference**: `CHEATSHEET.md` "Traversal Algorithms"

**Key concepts**:
- Depth-first search (exploring deeply)
- Breadth-first search (exploring widely)
- Traversal orders
- Time/space complexity

**Try this**: 
```typescript
// Create a graph and try both DFS and BFS
const dfsOrder = Graph.dfs(graph, 0);
const bfsOrder = Graph.bfs(graph, 0);
// Do they give different orders?
```

---

### Phase 3: Analysis (45 mins)
**Goal**: Detect properties of graphs

**Read**: Examples 5-8 in `index.ts`
**Then do**: `README.md` sections on analysis (cycles, sorting, components)
**Reference**: `CHEATSHEET.md` "Analysis & Properties"

**Key concepts**:
- Cycles (loops in graphs)
- Topological sort (ordering DAGs)
- Connected components (clusters)
- Bipartite graphs

**Try this**:
```typescript
// Create graphs with and without cycles
const acyclic = /* ... create DAG ... */;
const cyclic = /* ... add one edge to create cycle ... */;

console.log(Graph.hasCycle(acyclic));  // false
console.log(Graph.hasCycle(cyclic));   // true

// Topological sort only works on acyclic!
const order = Graph.topologicalSort(acyclic);
```

---

### Phase 4: Pathfinding (45 mins)
**Goal**: Find shortest/optimal paths

**Read**: Examples 7, 13, 15, 18 in `index.ts`
**Then do**: `README.md` sections on shortest paths
**Reference**: `CHEATSHEET.md` "Shortest Path Algorithms"

**Key concepts**:
- Dijkstra (non-negative weights)
- Bellman-Ford (any weights)
- A* (with heuristics)
- Floyd-Warshall (all pairs)

**Try this**:
```typescript
// Create a weighted graph
const graph = Graph.mutate(Graph.directed(), (mutable) => {
  // City network with distances
});

// Find best route
const result = Graph.shortestPathDijkstra(graph, start, end);
console.log(result.distance);
console.log(result.path);
```

---

### Phase 5: Real-World Apps (30 mins)
**Goal**: See graphs in real applications

**Read**: Examples 9-14, 17 in `index.ts`
**Then do**: `advanced-examples.ts` (pick 3-5 that interest you)
**Reference**: `README.md` "Real-World Use Cases"

**Examples**:
- npm dependency resolution
- Build system ordering
- Flight route planning
- Social network analysis
- Microservice deployment

**Try this**: Pick ONE real-world problem and model it as a graph

---

### Phase 6: Mastery (30 mins)
**Goal**: Know what algorithm to use when

**Reference**: `CHEATSHEET.md` "Decision Matrix"

**Practice**:
1. For each problem, identify which algorithm fits best:
   - "Order these tasks" → Topological sort
   - "Find shortest path" → Dijkstra
   - "Find friend groups" → Connected components
   - "Check for loops" → Cycle detection

2. Implement 2-3 small examples combining algorithms

---

## 🎓 Example Journey: Build System

Let's walk through one complete example to see everything come together.

### Problem
> We have build tasks with dependencies. We need to:
> 1. Ensure no circular dependencies
> 2. Find correct execution order
> 3. Identify which tasks can run in parallel

### Solution with Graphs

```typescript
// 1. Model as DAG
const graph = Graph.mutate(Graph.directed(), (mutable) => {
  const clean = Graph.addNode(mutable, "clean");
  const lint = Graph.addNode(mutable, "lint");
  const compile = Graph.addNode(mutable, "compile");
  const test = Graph.addNode(mutable, "test");
  const bundle = Graph.addNode(mutable, "bundle");
  
  Graph.addEdge(mutable, clean, lint, null);
  Graph.addEdge(mutable, lint, compile, null);
  Graph.addEdge(mutable, compile, test, null);
  Graph.addEdge(mutable, compile, bundle, null);
});

// 2. Validate: no circular dependencies
if (Graph.hasCycle(graph)) {
  throw new Error("Circular build dependency!");
}

// 3. Get execution order
const buildOrder = Graph.topologicalSort(graph);
for (const idx of buildOrder) {
  const task = Graph.getNodeData(graph, idx);
  console.log(`Execute: ${task}`);
}

// 4. Find parallelizable tasks
// Tasks at same "level" with no dependency can run in parallel
```

**Algorithms used**: Cycle detection + Topological sort  
**Problem solved!** ✅

---

## 💡 Key Insights

### When to Use Graphs

Use graphs when modeling:
- ✅ **Dependencies**: tasks, packages, courses
- ✅ **Networks**: social, transportation, communication
- ✅ **Relationships**: any connection between things
- ✅ **Hierarchies**: org charts, file systems
- ✅ **Flows**: routing, supply chains, workflows

### Graph Vocabulary

- **Node**: An entity (person, task, city, function)
- **Edge**: Connection between nodes (friendship, dependency, road)
- **Weight**: Value on edge (distance, time, cost, strength)
- **Directed**: Edge has direction (A→B ≠ B→A)
- **Undirected**: Edge has no direction (A-B = B-A)
- **Cyclic**: Has cycles (loops). Example: A→B→C→A
- **Acyclic**: No cycles. Called DAG (Directed Acyclic Graph)
- **Path**: Sequence of connected nodes
- **Component**: Group of connected nodes

### Algorithm Cheat Sheet

| Need | Algorithm | Complexity |
|------|-----------|-----------|
| Get all reachable | DFS or BFS | O(V+E) |
| Order (DAG) | Topological sort | O(V+E) |
| Shortest path | Dijkstra | O((V+E)logV) |
| Any weight path | Bellman-Ford | O(VE) |
| All pairs | Floyd-Warshall | O(V³) |
| Find groups | Connected components | O(V+E) |
| Check cycle | Cycle detection | O(V+E) |

---

## 🛠️ Practice Exercises

### Exercise 1: Social Network
Create a graph of 5 people with friendships. Find:
- All friends of person A (reachability)
- Friend groups (connected components)

### Exercise 2: Task Scheduler
Create a project with 10 tasks and dependencies. Ensure:
- No circular dependencies
- Get correct execution order
- Identify parallelizable tasks

### Exercise 3: Navigation
Create a city network with distances. Find:
- Shortest route between two cities (Dijkstra)
- All city pairs shortest routes (Floyd-Warshall)

### Exercise 4: Import Analyzer
Model your code file imports as a graph. Check:
- Any circular imports? (cycle detection)
- All files needed for bundle? (DFS)

### Exercise 5: Permission System
Create users, roles, and permissions. Find:
- What permissions does admin role have? (DFS)
- Any circular permission grants? (cycle detection)

---

## 📊 Visual Learning

### GraphViz Visualization

All examples can be visualized! Try:

```typescript
const dot = Graph.toDot(graph);
console.log(dot);
// Copy output and paste into: https://dreampuf.github.io/GraphvizOnline/
```

This generates visual diagrams you can see immediately!

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Using topologicalSort on cyclic graph
```typescript
// WRONG
const order = Graph.topologicalSort(cyclicGraph); // Throws!

// RIGHT
if (!Graph.hasCycle(cyclicGraph)) {
  const order = Graph.topologicalSort(cyclicGraph);
}
```

### ❌ Mistake 2: Using Dijkstra with negative weights
```typescript
// WRONG (will give wrong answer)
const path = Graph.shortestPathDijkstra(graphWithNegatives, s, e);

// RIGHT
const path = Graph.shortestPathBellmanFord(graphWithNegatives, s);
```

### ❌ Mistake 3: Forgetting graphs are 0-indexed
```typescript
// When you add nodes, they get indices starting from 0
const a = Graph.addNode(mutable, "A"); // index 0
const b = Graph.addNode(mutable, "B"); // index 1
// Use indices 0, 1 for operations
```

### ❌ Mistake 4: Confusing directed vs undirected
```typescript
// DIRECTED: A→B doesn't mean B→A
Graph.addEdge(mutable, a, b, weight); // Only A to B

// UNDIRECTED: A-B same as B-A
// When you add A-B, both directions are implied
```

---

## 🎯 Next Steps

### After Learning
1. **Apply to your codebase**: Find ONE problem that uses graphs
2. **Build a small tool**: Graph analyzer, dependency checker, route planner
3. **Optimize existing code**: Replace inefficient algorithms with graph algorithms
4. **Share knowledge**: Teach someone else about graphs!

### Deep Dives
1. Graph visualization (GraphViz, D3.js, Three.js)
2. Advanced algorithms: Min-cut/max-flow, matching problems
3. Distributed graph processing: Apache Spark, Neo4j
4. Graph databases: Neo4j, ArangoDB, TigerGraph

---

## 📚 Further Learning

### Official Resources
- [Effect.TS Docs](https://effect.website/) - Official documentation
- [Graph Theory on Wikipedia](https://en.wikipedia.org/wiki/Graph_theory) - Fundamentals

### Visualization & Practice
- [GraphViz Online](https://dreampuf.github.io/GraphvizOnline/) - Visualize graphs
- [Visualgo](https://visualgo.net/) - Algorithm visualizations

### Books
- "Introduction to Algorithms" (Cormen et al.) - Classic textbook
- "Grokking Algorithms" (Abhijoy) - Visual learning
- "Graph Algorithms" (Shimon Even) - Deep dive

### Related Technologies
- Workflow orchestration: Airflow, Kubeflow, Prefect
- Graph databases: Neo4j, ArangoDB
- Graph query languages: Gremlin, Cypher

---

## ✨ Summary

You now have:

✅ **18 examples** showing basic to real-world usage  
✅ **Complete documentation** of all APIs and algorithms  
✅ **Quick reference** cheatsheet for fast lookup  
✅ **10 advanced patterns** for complex applications  
✅ **Learning path** to master graphs systematically  

### The Most Important Concepts

1. **Graphs model relationships** between entities
2. **Pick the right algorithm** for your problem
3. **Validate first** (check for cycles, connectivity)
4. **Start simple**: Build small graphs, test locally
5. **Visualize**: Use GraphViz to understand structure

### Your Graph Superpowers

Now you can solve problems like:
- ✨ Detect circular dependencies in build systems
- ✨ Find optimal routes in networks
- ✨ Order tasks respecting dependencies
- ✨ Analyze social networks and relationships
- ✨ Build recommendation engines
- ✨ Design workflow orchestration systems

---

## 🎉 Ready to Graph?

1. Start with `index.ts` - run the examples
2. Pick a problem from `advanced-examples.ts` that interests you
3. Build your own graph-based solution
4. Share what you learned!

**Happy graphing, and welcome to a powerful new way of thinking about problems! 🚀**

---

*Made with ❤️ for the Effect ecosystem*
