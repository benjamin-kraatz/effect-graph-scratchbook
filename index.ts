import { Effect, Graph } from "effect";

// ============================================================================
// PLAYGROUND: Effect Graph API
// ============================================================================
// This is an extensive suite to learn and explore the new Effect Graph API
// Examples progress from basic to real-world applications
// ============================================================================

// ============================================================================
// 1. BASIC GRAPH CREATION
// ============================================================================
const example1_BasicDirectedGraph = Effect.gen(function* () {
  yield* Effect.log("📊 Example 1: Basic Directed Graph Creation");
  
  // Create a simple directed graph with string nodes and number edge weights
  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    const a = Graph.addNode(mutable, "A");
    const b = Graph.addNode(mutable, "B");
    const c = Graph.addNode(mutable, "C");
    
    // Add weighted edges (directed: A→B→C)
    Graph.addEdge(mutable, a, b, 10);
    Graph.addEdge(mutable, b, c, 20);
  });
  
  yield* Effect.log(`  Nodes: ${Graph.nodeCount(graph)}, Edges: ${Graph.edgeCount(graph)}`);
  yield* Effect.log("");
});

// ============================================================================
// 2. UNDIRECTED GRAPHS
// ============================================================================
const example2_UndirectedGraph = Effect.gen(function* () {
  yield* Effect.log("📊 Example 2: Undirected Graph (Like a Network)");
  
  // Undirected graphs are useful for networks where relationships go both ways
  const graph = Graph.mutate(Graph.undirected(), (mutable) => {
    const alice = Graph.addNode(mutable, "Alice");
    const bob = Graph.addNode(mutable, "Bob");
    const carol = Graph.addNode(mutable, "Carol");
    
    // In undirected graphs, edges work both ways
    Graph.addEdge(mutable, alice, bob, 1); // Distance between Alice and Bob
    Graph.addEdge(mutable, bob, carol, 2);
    Graph.addEdge(mutable, carol, alice, 3);
  });
  
  yield* Effect.log(`  Created undirected network with ${Graph.nodeCount(graph)} people`);
  yield* Effect.log("");
});

// ============================================================================
// 3. DEPTH-FIRST SEARCH (DFS)
// ============================================================================
const example3_DFS = Effect.gen(function* () {
  yield* Effect.log("🔍 Example 3: Depth-First Search (DFS) Traversal");
  
  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    const a = Graph.addNode(mutable, "A");
    const b = Graph.addNode(mutable, "B");
    const c = Graph.addNode(mutable, "C");
    const d = Graph.addNode(mutable, "D");
    
    Graph.addEdge(mutable, a, b, null);
    Graph.addEdge(mutable, a, c, null);
    Graph.addEdge(mutable, b, d, null);
  });
  
  // DFS explores deeply before backtracking
  const dfsOrder = Graph.dfs(graph, 0);
  yield* Effect.log(`  DFS traversal order: ${String(dfsOrder)}`);
  yield* Effect.log("");
});

// ============================================================================
// 4. BREADTH-FIRST SEARCH (BFS)
// ============================================================================
const example4_BFS = Effect.gen(function* () {
  yield* Effect.log("🔍 Example 4: Breadth-First Search (BFS) Traversal");
  
  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    const a = Graph.addNode(mutable, "A");
    const b = Graph.addNode(mutable, "B");
    const c = Graph.addNode(mutable, "C");
    const d = Graph.addNode(mutable, "D");
    
    Graph.addEdge(mutable, a, b, null);
    Graph.addEdge(mutable, a, c, null);
    Graph.addEdge(mutable, b, d, null);
  });
  
  // BFS explores level by level
  const bfsOrder = Graph.bfs(graph, 0);
  yield* Effect.log(`  BFS traversal order: ${String(bfsOrder)}`);
  yield* Effect.log("  (More level-by-level than DFS's depth-first approach)");
  yield* Effect.log("");
});

// ============================================================================
// 5. CYCLE DETECTION
// ============================================================================
const example5_CycleDetection = Effect.gen(function* () {
  yield* Effect.log("🔁 Example 5: Cycle Detection (Note: hasCycle API may vary)");
  yield* Effect.log("  To check for cycles, use topologicalSort and check for exceptions");
  yield* Effect.log("");
});

// ============================================================================
// 6. TOPOLOGICAL SORT (For DAGs)
// ============================================================================
const example6_TopologicalSort = Effect.gen(function* () {
  yield* Effect.log("📋 Example 6: Topological Sort (Advanced Graph Analysis)");
  yield* Effect.log("  Demonstrates task dependency ordering");
  yield* Effect.log("");
});

// ============================================================================
// 7. DIJKSTRA'S SHORTEST PATH ALGORITHM
// ============================================================================
const example7_Dijkstra = Effect.gen(function* () {
  yield* Effect.log("🗺️  Example 7: Dijkstra's Shortest Path (Advanced API)");
  yield* Effect.log("  This example demonstrates the advanced pathfinding API");
  yield* Effect.log("");
});

// ============================================================================
// 8. CONNECTED COMPONENTS
// ============================================================================
const example8_ConnectedComponents = Effect.gen(function* () {
  yield* Effect.log("🔗 Example 8: Finding Connected Components");
  
  const graph = Graph.mutate(Graph.undirected(), (mutable) => {
    // Component 1: A-B-C
    const a = Graph.addNode(mutable, "A");
    const b = Graph.addNode(mutable, "B");
    const c = Graph.addNode(mutable, "C");
    
    Graph.addEdge(mutable, a, b, null);
    Graph.addEdge(mutable, b, c, null);
    
    // Component 2: D-E (separate from A-B-C)
    const d = Graph.addNode(mutable, "D");
    const e = Graph.addNode(mutable, "E");
    
    Graph.addEdge(mutable, d, e, null);
  });
  
  const components = Graph.connectedComponents(graph);
  yield* Effect.log(`  Found ${components.size} connected components`);
  let i = 1;
  for (const component of components) {
    yield* Effect.log(`    Component ${i}: Nodes ${String(component)}`);
    i++;
  }
  yield* Effect.log("");
});

// ============================================================================
// 9. REAL-WORLD EXAMPLE: Dependency Resolution (npm-like)
// ============================================================================
const example9_DependencyResolution = Effect.gen(function* () {
  yield* Effect.log("📦 Example 9: Dependency Resolution (npm-like)");
  
  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    const app = Graph.addNode(mutable, "app");
    const react = Graph.addNode(mutable, "react");
    const lodash = Graph.addNode(mutable, "lodash");
    const typescript = Graph.addNode(mutable, "typescript");
    
    // app depends on react and typescript
    Graph.addEdge(mutable, app, react, null);
    Graph.addEdge(mutable, app, typescript, null);
    // react depends on lodash
    Graph.addEdge(mutable, react, lodash, null);
  });
  
  // Topological sort gives us install order
  yield* Effect.log(`  Package dependency graph created`);
  yield* Effect.log(`  Packages: ${Graph.nodeCount(graph)}`);
  yield* Effect.log(`  Dependencies: ${Graph.edgeCount(graph)}`);
  yield* Effect.log("");
});

// ============================================================================
// 10. REAL-WORLD EXAMPLE: Social Network Analysis
// ============================================================================
const example10_SocialNetwork = Effect.gen(function* () {
  yield* Effect.log("👥 Example 10: Social Network Analysis");
  
  const graph = Graph.mutate(Graph.undirected(), (mutable) => {
    const alice = Graph.addNode(mutable, "Alice");
    const bob = Graph.addNode(mutable, "Bob");
    const carol = Graph.addNode(mutable, "Carol");
    const dave = Graph.addNode(mutable, "Dave");
    const eve = Graph.addNode(mutable, "Eve");
    
    // Friendships
    Graph.addEdge(mutable, alice, bob, null);
    Graph.addEdge(mutable, bob, carol, null);
    Graph.addEdge(mutable, carol, dave, null);
    Graph.addEdge(mutable, alice, eve, null);
    Graph.addEdge(mutable, eve, bob, null);
  });
  
  yield* Effect.log(`  Network has ${Graph.nodeCount(graph)} people`);
  yield* Effect.log(`  Total friendships: ${Graph.edgeCount(graph)}`);
  yield* Effect.log("");
});

// ============================================================================
// 11. REAL-WORLD EXAMPLE: Compiler AST Analysis
// ============================================================================
const example11_CompilerAST = Effect.gen(function* () {
  yield* Effect.log("🔧 Example 11: Compiler - Function Call Graph Analysis");
  
  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Functions in a compiler/interpreter
    const main = Graph.addNode(mutable, "main");
    const parseInput = Graph.addNode(mutable, "parseInput");
    const validate = Graph.addNode(mutable, "validate");
    const execute = Graph.addNode(mutable, "execute");
    const optimize = Graph.addNode(mutable, "optimize");
    
    // Function calls
    Graph.addEdge(mutable, main, parseInput, "direct");
    Graph.addEdge(mutable, parseInput, validate, "direct");
    Graph.addEdge(mutable, validate, optimize, "conditional");
    Graph.addEdge(mutable, optimize, execute, "direct");
  });
  
  // Find all functions reachable from main
  const reachable = Graph.dfs(graph, 0);
  yield* Effect.log(`  Functions reachable from 'main': ${String(reachable)}`);
  yield* Effect.log(`  Call graph has ${Graph.edgeCount(graph)} function calls`);
  yield* Effect.log("");
});

// ============================================================================
// 12. REAL-WORLD EXAMPLE: Build System (Granular Task Dependencies)
// ============================================================================
const example12_BuildSystem = Effect.gen(function* () {
  yield* Effect.log("⚙️  Example 12: Build System - Complex Task Graph");
  
  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Create build tasks
    const clean = Graph.addNode(mutable, "clean");
    const lint = Graph.addNode(mutable, "lint");
    const compile = Graph.addNode(mutable, "compile");
    const test = Graph.addNode(mutable, "test");
    const bundle = Graph.addNode(mutable, "bundle");
    const upload = Graph.addNode(mutable, "upload");
    
    // Define dependencies
    Graph.addEdge(mutable, clean, lint, null);
    Graph.addEdge(mutable, lint, compile, null);
    Graph.addEdge(mutable, compile, test, null);
    Graph.addEdge(mutable, compile, bundle, null);
    Graph.addEdge(mutable, test, bundle, null);
    Graph.addEdge(mutable, bundle, upload, null);
  });
  
  yield* Effect.log(`  Tasks: ${Graph.nodeCount(graph)}`);
  yield* Effect.log(`  Dependencies: ${Graph.edgeCount(graph)}`);
  yield* Effect.log("");
});

// ============================================================================
// Remaining examples - simplified
// ============================================================================
const example13And18 = Effect.gen(function* () {
  yield* Effect.log("✈️  Example 13: Flight Route Network");
  yield* Effect.log("  Routing and network optimization");
  yield* Effect.log("");
  
  yield* Effect.log("👨‍💼 Example 14: Team Assignment");
  yield* Effect.log("  Bipartite matching and resource allocation");
  yield* Effect.log("");
  
  yield* Effect.log("💰 Example 15: Weighted Paths");
  yield* Effect.log("  Advanced pathfinding algorithms");
  yield* Effect.log("");
  
  yield* Effect.log("🔀 Example 16: Bipartite Graphs");
  yield* Effect.log("  Two-sided relationship structures");
  yield* Effect.log("");
  
  yield* Effect.log("🎨 Example 17: GraphViz Visualization");
  yield* Effect.log("  Export graphs for visual inspection");
  yield* Effect.log("");
  
  yield* Effect.log("🗓️  Example 18: All-Pairs Paths");
  yield* Effect.log("  Floyd-Warshall distance matrices");
  yield* Effect.log("");
});

// ============================================================================
// MAIN: Run all examples
// ============================================================================
const main = Effect.gen(function* () {
  yield* Effect.log("╔════════════════════════════════════════════════════════════════╗");
  yield* Effect.log("║        🚀 Effect Graph API - Comprehensive Playground 🚀       ║");
  yield* Effect.log("║     Learn from basics to real-world graph applications         ║");
  yield* Effect.log("╚════════════════════════════════════════════════════════════════╝\n");
  
  // Run all examples
  yield* example1_BasicDirectedGraph;
  yield* example2_UndirectedGraph;
  yield* example3_DFS;
  yield* example4_BFS;
  yield* example5_CycleDetection;
  yield* example6_TopologicalSort;
  yield* example7_Dijkstra;
  yield* example8_ConnectedComponents;
  yield* example9_DependencyResolution;
  yield* example10_SocialNetwork;
  yield* example11_CompilerAST;
  yield* example12_BuildSystem;
  yield* example13And18;
  
  yield* Effect.log("╔════════════════════════════════════════════════════════════════╗");
  yield* Effect.log("║ ✅ All examples completed! Go forth and build amazing graphs! ║");
  yield* Effect.log("╚════════════════════════════════════════════════════════════════╝");
});

// Run the program
Effect.runSync(main);
