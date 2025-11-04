# Effect Graph API Playground

A comprehensive playground for exploring the new Effect Graph API, demonstrating all major features with real-world examples.

## 🚀 Quick Start

```bash
# Run the working playground
bun run simple

# Run the comprehensive (but experimental) playground
bun run playground
```

## 📚 What You'll Learn

This playground demonstrates all the key features of the Effect Graph API:

### 🔄 Graph Types
- **Directed Graphs**: One-way relationships (task dependencies, web links)
- **Undirected Graphs**: Mutual relationships (social networks, road networks)

### 🛠️ Operations
- **Immutable Operations**: Each change returns a new graph (functional style)
- **Mutable Operations**: Modify graphs in place using `Graph.mutate()`

### 🔍 Graph Algorithms

#### Traversal
- **DFS (Depth-First Search)**: Explore graphs deeply
- **BFS (Breadth-First Search)**: Explore graphs broadly
- **Topological Sort**: Order tasks with dependencies

#### Shortest Paths
- **Dijkstra's Algorithm**: Non-negative weights, single source to single target
- **A* Algorithm**: Dijkstra with heuristics for better performance
- **Bellman-Ford**: Handles negative weights, detects negative cycles
- **Floyd-Warshall**: All-pairs shortest paths

#### Analysis
- **Cycle Detection**: Find circular dependencies
- **Bipartite Detection**: Check if graph can be divided into two groups
- **Connected Components**: Find isolated groups in networks

### 📤 Export & Visualization
- **GraphViz DOT Format**: Generate visual representations
- **Mermaid Diagrams**: Alternative visualization format

## 🎯 Real-World Examples

### 1. Social Networks
```typescript
// Undirected graph - friendships are mutual
const socialGraph = Graph.undirected<string, undefined>();
// Alice, Bob, Charlie, Diana are all connected
```

### 2. Task Dependencies
```typescript
// Directed acyclic graph - tasks must be done in order
const taskGraph = Graph.directed<string, undefined>();
// Setup -> Install -> Code -> Test -> Deploy
```

### 3. Road Networks
```typescript
// Weighted undirected graph - distances between cities
const roadGraph = Graph.undirected<string, number>();
// Find shortest driving routes
```

### 4. CI/CD Pipelines
```typescript
// Complex directed graph with parallel execution
const pipelineGraph = Graph.directed<string, undefined>();
// Checkout -> Install -> [Lint, Unit Tests, Integration Tests] -> Build -> Deploy
```

### 5. Recommendation Systems
```typescript
// Bipartite graphs - users and items
const recommendationGraph = Graph.undirected<string, number>();
// Collaborative filtering for personalized recommendations
```

## 🏗️ API Overview

### Creating Graphs
```typescript
// Empty directed graph
const directedGraph = Graph.directed<NodeType, EdgeType>();

// Empty undirected graph
const undirectedGraph = Graph.undirected<NodeType, EdgeType>();

// Graph with initial mutations
const graph = Graph.directed<string, number>((mutable) => {
  const nodeA = Graph.addNode(mutable, "A");
  const nodeB = Graph.addNode(mutable, "B");
  Graph.addEdge(mutable, nodeA, nodeB, 42);
});
```

### Immutable Operations
```typescript
// Each operation returns a new graph
const graph1 = Graph.mutate(graph, (mutable) => Graph.addNode(mutable, "New Node"));
const graph2 = Graph.mutate(graph1, (mutable) => Graph.addEdge(mutable, 0, 1, data));
```

### Graph Queries
```typescript
// Count elements
const nodeCount = Graph.nodeCount(graph);
const edgeCount = Graph.edgeCount(graph);

// Find elements
const nodeIndex = Graph.findNode(graph, (data) => data === "target");
const edgeIndex = Graph.findEdge(graph, (data) => data > 10);

// Check connectivity
const isConnected = Graph.connectedComponents(graph).length === 1;
const hasCycles = !Graph.isAcyclic(graph);
const isBipartite = Graph.isBipartite(graph);
```

### Algorithms
```typescript
// Traversal
const dfsOrder = Array.from(Graph.indices(Graph.dfs(graph, { start: [0] })));
const bfsOrder = Array.from(Graph.indices(Graph.bfs(graph, { start: [0] })));
const topoOrder = Array.from(Graph.indices(Graph.topo(graph)));

// Shortest paths
const dijkstraResult = Graph.dijkstra(graph, {
  source: 0,
  target: 5,
  cost: (edgeData) => edgeData
});

const aStarResult = Graph.astar(graph, {
  source: 0,
  target: 5,
  cost: (edgeData) => edgeData,
  heuristic: (nodeData) => estimateCost(nodeData)
});
```

### Export
```typescript
// GraphViz DOT format
const dotFormat = Graph.toGraphViz(graph, {
  nodeLabel: (data) => data,
  edgeLabel: (data) => data.toString()
});

// Mermaid diagram format
const mermaidFormat = Graph.toMermaid(graph, {
  diagramType: "flowchart",
  direction: "TB"
});
```

## 🔧 Available Scripts

- `bun run simple` - Run the working playground with 6 key examples
- `bun run playground` - Run the comprehensive playground (may have some issues)
- `bun run dev` - Run the original basic example

## 🎓 Learning Path

1. **Start with `bun run simple`** - See the core concepts in action
2. **Explore the source code** - Understand how each algorithm works
3. **Modify examples** - Experiment with different graph structures
4. **Build your own graphs** - Apply to your specific use cases

## 📖 Key Concepts

- **Nodes**: The entities in your graph (users, tasks, cities, etc.)
- **Edges**: The relationships between nodes (friendships, dependencies, roads)
- **Directed vs Undirected**: One-way vs mutual relationships
- **Weighted vs Unweighted**: Edges with or without costs/values
- **Mutable vs Immutable**: In-place modification vs functional updates

## 🚀 Next Steps

The Effect Graph API provides a solid foundation for:
- Pathfinding and routing algorithms
- Dependency resolution and scheduling
- Social network analysis
- Recommendation systems
- Workflow and pipeline management
- Network topology analysis

Experiment with the playground and discover what you can build!
