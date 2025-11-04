# Effect Graph API Playground

A comprehensive playground suite to learn and experiment with the new Effect Graph API, which was backported from Effect 4 to Effect 3.

## 🎯 Overview

The Effect Graph API provides powerful graph data structure support with:

- **🔄 Graph Types**: Both directed and undirected graphs
- **📦 Immutability**: Immutable and mutable graph variants
- **🎯 Type Safety**: Full TypeScript support for nodes and edges
- **🚀 Algorithms**: Comprehensive graph algorithms including:
  - Traversal: DFS, BFS, topological sort
  - Shortest paths: Dijkstra, A*, Bellman-Ford, Floyd-Warshall
  - Analysis: Cycle detection, bipartite detection, connected components
  - Export: GraphViz DOT format support

## 🚀 Getting Started

### Prerequisites

- Effect 3.x with Graph API support
- TypeScript 5.x
- Bun or Node.js

### Current Status

The Graph API is a recent addition that was backported from Effect 4. It may not be available in all Effect 3 versions yet.

### Running the Playground

1. **Check API Availability**: Run the playground to see the conceptual overview
2. **Enable Graph API**: Once available in your Effect version, uncomment the Graph import
3. **Explore Examples**: Uncomment and run individual examples

```bash
bun run dev
```

## 📚 Examples

The playground includes 8 comprehensive examples:

### 1. Basic Graph Operations
Learn fundamental graph creation, mutable vs immutable operations, and basic node/edge management.

### 2. Social Network Analysis
Model friendships and analyze network connectivity, shortest paths, and cycle detection.

### 3. Task Dependency Graph
Build dependency graphs for project management with topological sorting for execution order.

### 4. Transportation Network
Calculate optimal routes using Dijkstra and Floyd-Warshall algorithms.

### 5. Software Dependency Analysis
Analyze package dependencies, reverse dependencies, and bundle sizes.

### 6. Game State Navigation
Pathfinding in grid-based games using A* algorithm with custom heuristics.

### 7. Graph Visualization
Export graphs to GraphViz DOT format for visualization.

### 8. Advanced Graph Analysis
Comprehensive analysis including connected components, cycle detection, and bipartiteness.

## 🔧 API Reference

### Graph Creation
```typescript
import { Graph } from "effect";

// Create empty graphs
const directed = Graph.directed<NodeType, EdgeType>();
const undirected = Graph.undirected<NodeType, EdgeType>();
```

### Node & Edge Operations

**Mutable (efficient for batch operations):**
```typescript
const graph = Graph.mutate(emptyGraph, (mutable) => {
  const nodeA = Graph.addNode(mutable, "Node A");
  const nodeB = Graph.addNode(mutable, "Node B");
  Graph.addEdge(mutable, nodeA, nodeB, weight);
});
```

**Immutable (functional style):**
```typescript
const withNode = Graph.addNode(graph, "New Node");
const withEdge = Graph.addEdge(withNode, fromIndex, toIndex, value);
```

### Algorithms

**Traversal:**
```typescript
const dfsPath = Graph.depthFirstTraversal(graph, startNode);
const bfsPath = Graph.breadthFirstTraversal(graph, startNode);
const sorted = Graph.topologicalSort(dag); // For DAGs only
```

**Shortest Paths:**
```typescript
// Single pair
const path = Graph.shortestPathDijkstra(graph, start, end);
const astarPath = Graph.shortestPathAStar(graph, start, end, heuristic, costFn);

// All pairs
const allPaths = Graph.floydWarshall(graph);
```

**Analysis:**
```typescript
const hasCycles = Graph.hasCycle(graph);
const isBipartite = Graph.isBipartite(graph);
const components = Graph.connectedComponents(graph);
```

**Visualization:**
```typescript
const dotFormat = Graph.toGraphViz(graph, {
  nodeLabel: (node) => node.toString(),
  edgeLabel: (edge) => edge.toString(),
  graphAttributes: { rankdir: "LR" },
  nodeAttributes: { shape: "box" },
  edgeAttributes: { color: "blue" }
});
```

## 🎮 Real-World Use Cases

### Social Networks
- Friend recommendations
- Influence analysis
- Community detection

### Project Management
- Task scheduling
- Dependency resolution
- Critical path analysis

### Transportation & Logistics
- Route optimization
- Network flow analysis
- Supply chain modeling

### Software Engineering
- Dependency analysis
- Code flow analysis
- Module relationships

### Game Development
- Pathfinding (A*)
- State space search
- Decision trees

### Data Analysis
- Recommendation systems
- Fraud detection
- Network analysis

## 🛠️ Development

### Adding New Examples

1. Create a new example function using `Effect.gen`
2. Add it to the examples section
3. Update the program selection comments
4. Add documentation in the README

### Graph API Status

To check if the Graph API is available in your Effect version:

```typescript
import { Graph } from "effect";

const testGraph = Graph.directed<string, number>();
console.log("Graph API available:", !!testGraph);
```

## 📖 Resources

- [Effect Documentation](https://effect.website/)
- [Graph API Implementation](https://raw.githubusercontent.com/Effect-TS/effect/55c487b9b3391258d0eec519c3dff898928e142/packages/effect/src/Graph.ts)
- [GraphViz Online](https://dreampuf.github.io/GraphvizOnline/)

## 🤝 Contributing

This playground is designed to help you learn the Effect Graph API. Feel free to:

- Add more examples
- Improve explanations
- Share real-world use cases
- Report issues or suggestions

---

**Note**: The Graph API represents a significant addition to the Effect ecosystem, bringing advanced graph algorithms and data structures to functional programming in TypeScript.