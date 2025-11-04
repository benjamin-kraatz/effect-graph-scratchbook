import { Effect } from "effect";

/**
 * Effect Graph API Playground Suite
 *
 * This comprehensive playground demonstrates the new Graph API in Effect.
 * The Graph API was backported from Effect 4 to Effect 3, but may not be available
 * in all versions yet.
 *
 * To use this playground:
 * 1. Ensure you have Effect 3 with the Graph API available
 * 2. Uncomment the import: import { Graph } from "effect";
 * 3. Run individual examples by uncommenting the desired program below
 *
 * Key Features of the Graph API:
 * - 🔄 Support for both directed and undirected graphs
 * - 📦 Immutable and mutable graph variants
 * - 🎯 Type-safe node and edge operations
 * - 🚀 Advanced graph algorithms:
 *   - Traversal: DFS, BFS, topological sort
 *   - Shortest path: Dijkstra, A*, Bellman-Ford, Floyd-Warshall
 *   - Analysis: cycle detection, bipartite detection, connected components
 *   - Export: GraphViz DOT format support
 */

// Uncomment this line when Graph API becomes available:
// import { Graph } from "effect";

// =============================================================================
// CONCEPTUAL EXAMPLES (Documentation & Code Structure)
// =============================================================================

/**
 * This section shows what the Graph API examples would look like.
 * Once the Graph API is available in your Effect version, you can
 * uncomment the examples below and run them.
 *
 * The Graph API provides:
 *
 * Graph.directed<NodeType, EdgeType>() - Create directed graph
 * Graph.undirected<NodeType, EdgeType>() - Create undirected graph
 * Graph.mutate(graph, mutator) - Mutable operations
 * Graph.addNode(graph, value) - Immutable node addition
 * Graph.addEdge(graph, from, to, value) - Immutable edge addition
 *
 * Algorithms:
 * - Graph.depthFirstTraversal(graph, start)
 * - Graph.breadthFirstTraversal(graph, start)
 * - Graph.topologicalSort(graph)
 * - Graph.shortestPathDijkstra(graph, start, end)
 * - Graph.shortestPathAStar(graph, start, end, heuristic, costFn)
 * - Graph.floydWarshall(graph) - All pairs shortest paths
 * - Graph.hasCycle(graph)
 * - Graph.isBipartite(graph)
 * - Graph.connectedComponents(graph)
 * - Graph.toGraphViz(graph, options) - Export to DOT format
 */

const conceptualOverview = Effect.gen(function* () {
  yield* Effect.log("=== Effect Graph API Conceptual Overview ===");
  yield* Effect.log("");
  yield* Effect.log("🎯 GRAPH CREATION:");
  yield* Effect.log("  const directed = Graph.directed<string, number>();");
  yield* Effect.log("  const undirected = Graph.undirected<Person, 'friend'>();");
  yield* Effect.log("");
  yield* Effect.log("🔧 NODE & EDGE OPERATIONS:");
  yield* Effect.log("  // Mutable (efficient for batch operations)");
  yield* Effect.log("  const graph = Graph.mutate(emptyGraph, (mutable) => {");
  yield* Effect.log("    const nodeA = Graph.addNode(mutable, 'Node A');");
  yield* Effect.log("    const nodeB = Graph.addNode(mutable, 'Node B');");
  yield* Effect.log("    Graph.addEdge(mutable, nodeA, nodeB, 5);");
  yield* Effect.log("  });");
  yield* Effect.log("");
  yield* Effect.log("  // Immutable (functional style)");
  yield* Effect.log("  const withNode = Graph.addNode(graph, 'New Node');");
  yield* Effect.log("  const withEdge = Graph.addEdge(withNode, 0, 1, 'connected');");
  yield* Effect.log("");
  yield* Effect.log("🚀 ALGORITHMS:");
  yield* Effect.log("  const path = Graph.shortestPathDijkstra(graph, start, end);");
  yield* Effect.log("  const sorted = Graph.topologicalSort(graph);");
  yield* Effect.log("  const hasCycle = Graph.hasCycle(graph);");
  yield* Effect.log("  const components = Graph.connectedComponents(graph);");
  yield* Effect.log("");
  yield* Effect.log("📊 VISUALIZATION:");
  yield* Effect.log("  const dot = Graph.toGraphViz(graph, {");
  yield* Effect.log("    nodeLabel: (node) => node,");
  yield* Effect.log("    edgeLabel: (edge) => edge");
  yield* Effect.log("  });");
});

// =============================================================================
// EXAMPLE 1: Basic Graph Creation and Operations
// =============================================================================

const basicGraphExample = Effect.gen(function* () {
  yield* Effect.log("=== Basic Graph Operations ===");

  // Create directed and undirected graphs
  const directed = Graph.directed<string, number>();
  const undirected = Graph.undirected<string, number>();

  // Mutable graph operations
  const mutableGraph = Graph.mutate(directed, (mutable) => {
    // Add nodes
    const nodeA = Graph.addNode(mutable, "Node A");
    const nodeB = Graph.addNode(mutable, "Node B");
    const nodeC = Graph.addNode(mutable, "Node C");

    // Add edges with weights
    Graph.addEdge(mutable, nodeA, nodeB, 5);
    Graph.addEdge(mutable, nodeB, nodeC, 3);
    Graph.addEdge(mutable, nodeA, nodeC, 8);
  });

  yield* Effect.log(`Graph has ${mutableGraph.nodes.length} nodes`);
  yield* Effect.log(`Graph has ${mutableGraph.edges.length} edges`);

  // Immutable operations
  const withExtraNode = Graph.addNode(mutableGraph, "Node D");
  const withExtraEdge = Graph.addEdge(withExtraNode, 3, 0, 10); // Connect D to A

  yield* Effect.log(`After adding node and edge: ${withExtraEdge.nodes.length} nodes, ${withExtraEdge.edges.length} edges`);
});

// =============================================================================
// EXAMPLE 2: Social Network Analysis
// =============================================================================

type Person = { name: string; age: number };

const socialNetworkExample = Effect.gen(function* () {
  yield* Effect.log("=== Social Network Analysis ===");

  const people: Person[] = [
    { name: "Alice", age: 28 },
    { name: "Bob", age: 32 },
    { name: "Carol", age: 25 },
    { name: "David", age: 35 },
    { name: "Eve", age: 29 },
  ];

  // Create undirected graph for friendships
  const socialGraph = Graph.mutate(Graph.undirected<Person, "friend">(), (mutable) => {
    const nodeMap = new Map<string, number>();

    // Add all people as nodes
    for (const person of people) {
      nodeMap.set(person.name, Graph.addNode(mutable, person));
    }

    const getNode = (name: string) => {
      const node = nodeMap.get(name);
      if (!node) throw new Error(`Person ${name} not found`);
      return node;
    };

    // Add friendships
    Graph.addEdge(mutable, getNode("Alice"), getNode("Bob"), "friend");
    Graph.addEdge(mutable, getNode("Bob"), getNode("Carol"), "friend");
    Graph.addEdge(mutable, getNode("Carol"), getNode("David"), "friend");
    Graph.addEdge(mutable, getNode("David"), getNode("Eve"), "friend");
    Graph.addEdge(mutable, getNode("Alice"), getNode("Eve"), "friend"); // Creates a cycle
  });

  // Check connectivity
  const components = Graph.connectedComponents(socialGraph);
  yield* Effect.log(`Network has ${components.length} connected components`);

  // Find shortest paths
  const aliceNode = socialGraph.nodes.findIndex(n => n.value.name === "Alice");
  const eveNode = socialGraph.nodes.findIndex(n => n.value.name === "Eve");

  const shortestPath = Graph.shortestPathDijkstra(socialGraph, aliceNode, eveNode);
  if (shortestPath) {
    const pathNames = shortestPath.path.map(idx => socialGraph.nodes[idx].value.name);
    yield* Effect.log(`Shortest path from Alice to Eve: ${pathNames.join(" -> ")}`);
  }

  // Detect cycles
  const hasCycle = Graph.hasCycle(socialGraph);
  yield* Effect.log(`Social network has cycles: ${hasCycle}`);
});

// =============================================================================
// EXAMPLE 3: Task Dependency Graph (Topological Sort)
// =============================================================================

type Task = { id: string; description: string; duration: number };

const taskDependencyExample = Effect.gen(function* () {
  yield* Effect.log("=== Task Dependency Graph ===");

  const tasks: Task[] = [
    { id: "design", description: "Create UI designs", duration: 2 },
    { id: "setup", description: "Project setup", duration: 1 },
    { id: "backend", description: "Implement backend API", duration: 5 },
    { id: "frontend", description: "Implement frontend", duration: 4 },
    { id: "testing", description: "Write tests", duration: 2 },
    { id: "deploy", description: "Deploy to production", duration: 1 },
  ];

  const taskGraph = Graph.mutate(Graph.directed<Task, "depends">(), (mutable) => {
    const nodeMap = new Map<string, number>();

    for (const task of tasks) {
      nodeMap.set(task.id, Graph.addNode(mutable, task));
    }

    const getNode = (id: string) => {
      const node = nodeMap.get(id);
      if (!node) throw new Error(`Task ${id} not found`);
      return node;
    };

    // Define dependencies
    Graph.addEdge(mutable, getNode("setup"), getNode("backend"), "depends");
    Graph.addEdge(mutable, getNode("setup"), getNode("frontend"), "depends");
    Graph.addEdge(mutable, getNode("design"), getNode("frontend"), "depends");
    Graph.addEdge(mutable, getNode("backend"), getNode("testing"), "depends");
    Graph.addEdge(mutable, getNode("frontend"), getNode("testing"), "depends");
    Graph.addEdge(mutable, getNode("testing"), getNode("deploy"), "depends");
  });

  // Topological sort for task execution order
  const executionOrder = Graph.topologicalSort(taskGraph);
  if (executionOrder) {
    yield* Effect.log("Task execution order:");
    for (const nodeIdx of executionOrder) {
      const task = taskGraph.nodes[nodeIdx].value;
      yield* Effect.log(`  ${task.id}: ${task.description} (${task.duration} days)`);
    }
  } else {
    yield* Effect.log("Graph has cycles - cannot determine execution order!");
  }
});

// =============================================================================
// EXAMPLE 4: Transportation Network (Shortest Paths)
// =============================================================================

type Location = { name: string; coordinates: [number, number] };

const transportationExample = Effect.gen(function* () {
  yield* Effect.log("=== Transportation Network ===");

  const locations: Location[] = [
    { name: "Home", coordinates: [0, 0] },
    { name: "Work", coordinates: [5, 3] },
    { name: "Gym", coordinates: [2, 4] },
    { name: "Store", coordinates: [3, 1] },
    { name: "Park", coordinates: [4, 5] },
  ];

  const roadNetwork = Graph.mutate(Graph.undirected<Location, number>(), (mutable) => {
    const nodeMap = new Map<string, number>();

    for (const location of locations) {
      nodeMap.set(location.name, Graph.addNode(mutable, location));
    }

    const getNode = (name: string) => {
      const node = nodeMap.get(name);
      if (!node) throw new Error(`Location ${name} not found`);
      return node;
    };

    // Add roads with distances (in miles)
    Graph.addEdge(mutable, getNode("Home"), getNode("Store"), 2.1);
    Graph.addEdge(mutable, getNode("Home"), getNode("Gym"), 3.5);
    Graph.addEdge(mutable, getNode("Store"), getNode("Work"), 2.8);
    Graph.addEdge(mutable, getNode("Store"), getNode("Park"), 4.2);
    Graph.addEdge(mutable, getNode("Gym"), getNode("Park"), 2.3);
    Graph.addEdge(mutable, getNode("Park"), getNode("Work"), 1.7);
    Graph.addEdge(mutable, getNode("Gym"), getNode("Work"), 3.9);
  });

  // Find shortest driving route from Home to Work
  const homeIdx = roadNetwork.nodes.findIndex(n => n.value.name === "Home");
  const workIdx = roadNetwork.nodes.findIndex(n => n.value.name === "Work");

  const dijkstraResult = Graph.shortestPathDijkstra(roadNetwork, homeIdx, workIdx);
  if (dijkstraResult) {
    const route = dijkstraResult.path.map(idx => roadNetwork.nodes[idx].value.name);
    yield* Effect.log(`Shortest route from Home to Work: ${route.join(" -> ")} (${dijkstraResult.distance.toFixed(1)} miles)`);
  }

  // Find all shortest paths from Home (Floyd-Warshall)
  const allPairsShortestPaths = Graph.floydWarshall(roadNetwork);
  yield* Effect.log("\nAll-pairs shortest paths from Home:");
  for (let i = 0; i < locations.length; i++) {
    if (allPairsShortestPaths.distances[homeIdx][i] < Infinity) {
      const path = allPairsShortestPaths.paths[homeIdx][i];
      const names = path.map(idx => roadNetwork.nodes[idx].value.name);
      yield* Effect.log(`  To ${locations[i].name}: ${names.join(" -> ")} (${allPairsShortestPaths.distances[homeIdx][i].toFixed(1)} miles)`);
    }
  }
});

// =============================================================================
// EXAMPLE 5: Software Dependency Analysis
// =============================================================================

type Package = { name: string; version: string; size: number };

const dependencyExample = Effect.gen(function* () {
  yield* Effect.log("=== Software Dependency Analysis ===");

  const packages: Package[] = [
    { name: "react", version: "18.2.0", size: 100 },
    { name: "react-dom", version: "18.2.0", size: 150 },
    { name: "effect", version: "3.19.0", size: 200 },
    { name: "typescript", version: "5.0.0", size: 50 },
    { name: "webpack", version: "5.80.0", size: 300 },
    { name: "lodash", version: "4.17.0", size: 80 },
  ];

  const depGraph = Graph.mutate(Graph.directed<Package, "depends">(), (mutable) => {
    const nodeMap = new Map<string, number>();

    for (const pkg of packages) {
      nodeMap.set(pkg.name, Graph.addNode(mutable, pkg));
    }

    const getNode = (name: string) => {
      const node = nodeMap.get(name);
      if (!node) throw new Error(`Package ${name} not found`);
      return node;
    };

    // Define dependencies
    Graph.addEdge(mutable, getNode("react"), getNode("react-dom"), "depends");
    Graph.addEdge(mutable, getNode("effect"), getNode("typescript"), "depends");
    Graph.addEdge(mutable, getNode("webpack"), getNode("typescript"), "depends");
    Graph.addEdge(mutable, getNode("webpack"), getNode("lodash"), "depends");
  });

  // Analyze dependencies
  const effectIdx = depGraph.nodes.findIndex(n => n.value.name === "effect");
  const webpackIdx = depGraph.nodes.findIndex(n => n.value.name === "webpack");

  // Check if there are cycles
  const hasCycles = Graph.hasCycle(depGraph);
  yield* Effect.log(`Dependency graph has cycles: ${hasCycles}`);

  // Find all packages that depend on typescript (reverse dependencies)
  const typescriptIdx = depGraph.nodes.findIndex(n => n.value.name === "typescript");
  const dependents = Graph.getPredecessors(depGraph, typescriptIdx);
  const dependentNames = dependents.map(idx => depGraph.nodes[idx].value.name);
  yield* Effect.log(`Packages depending on TypeScript: ${dependentNames.join(", ")}`);

  // Calculate total size of dependencies for webpack
  const webpackDeps = Graph.depthFirstTraversal(depGraph, webpackIdx);
  const totalSize = webpackDeps.reduce((sum, idx) => sum + depGraph.nodes[idx].value.size, 0);
  yield* Effect.log(`Total size of webpack and its dependencies: ${totalSize} KB`);
});

// =============================================================================
// EXAMPLE 6: Game State Navigation (A* Algorithm)
// =============================================================================

type GameState = { position: [number, number]; moves: number };

const gameNavigationExample = Effect.gen(function* () {
  yield* Effect.log("=== Game State Navigation with A* ===");

  // Simple grid world with obstacles
  const grid = [
    [0, 0, 0, 1, 0], // 1 = obstacle
    [0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0],
  ];

  // Create graph where each position is a node
  const gameGraph = Graph.mutate(Graph.undirected<GameState, number>(), (mutable) => {
    const nodeMap = new Map<string, number>();

    // Add all valid positions as nodes
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 0) { // Not an obstacle
          const state: GameState = { position: [x, y], moves: 0 };
          nodeMap.set(`${x},${y}`, Graph.addNode(mutable, state));
        }
      }
    }

    const getNode = (x: number, y: number) => {
      const node = nodeMap.get(`${x},${y}`);
      if (!node) throw new Error(`Position ${x},${y} not found`);
      return node;
    };

    // Add edges between adjacent positions
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // up, right, down, left

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 0 && nodeMap.has(`${x},${y}`)) {
          for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length &&
                grid[ny][nx] === 0 && nodeMap.has(`${nx},${ny}`)) {
              Graph.addEdge(mutable, getNode(x, y), getNode(nx, ny), 1); // Cost of 1 to move
            }
          }
        }
      }
    }
  });

  // Heuristic function: Manhattan distance to goal
  const heuristic = (state: GameState) => {
    const [x, y] = state.position;
    const goalX = 4, goalY = 4; // Goal position
    return Math.abs(x - goalX) + Math.abs(y - goalY);
  };

  const startIdx = gameGraph.nodes.findIndex(n =>
    n.value.position[0] === 0 && n.value.position[1] === 0
  );
  const goalIdx = gameGraph.nodes.findIndex(n =>
    n.value.position[0] === 4 && n.value.position[1] === 4
  );

  // Find path using A*
  const astarResult = Graph.shortestPathAStar(
    gameGraph,
    startIdx,
    goalIdx,
    heuristic,
    (node) => node.value.moves // Current cost
  );

  if (astarResult) {
    const path = astarResult.path.map(idx => gameGraph.nodes[idx].value.position);
    yield* Effect.log(`A* path from (0,0) to (4,4): ${path.map(([x, y]) => `(${x},${y})`).join(" -> ")}`);
    yield* Effect.log(`Total moves: ${astarResult.distance}`);
  }
});

// =============================================================================
// EXAMPLE 7: Graph Visualization (GraphViz DOT format)
// =============================================================================

const visualizationExample = Effect.gen(function* () {
  yield* Effect.log("=== Graph Visualization ===");

  // Create a simple workflow graph
  const workflowGraph = Graph.mutate(Graph.directed<string, string>(), (mutable) => {
    const start = Graph.addNode(mutable, "Start");
    const review = Graph.addNode(mutable, "Code Review");
    const test = Graph.addNode(mutable, "Testing");
    const deploy = Graph.addNode(mutable, "Deploy");
    const end = Graph.addNode(mutable, "End");

    Graph.addEdge(mutable, start, review, "submit");
    Graph.addEdge(mutable, review, test, "approve");
    Graph.addEdge(mutable, review, start, "reject");
    Graph.addEdge(mutable, test, deploy, "pass");
    Graph.addEdge(mutable, test, review, "fail");
    Graph.addEdge(mutable, deploy, end, "success");
  });

  // Export to GraphViz DOT format
  const dotFormat = Graph.toGraphViz(workflowGraph, {
    nodeLabel: (node) => node,
    edgeLabel: (edge) => edge,
    graphAttributes: { rankdir: "LR" },
    nodeAttributes: { shape: "box" },
    edgeAttributes: { color: "blue" }
  });

  yield* Effect.log("GraphViz DOT format:");
  yield* Effect.log(dotFormat);

  // You can paste this DOT format into tools like:
  // - https://dreampuf.github.io/GraphvizOnline/
  // - https://graphviz.org/gallery/
  // - VS Code GraphViz extension
});

// =============================================================================
// EXAMPLE 8: Advanced Graph Analysis
// =============================================================================

const advancedAnalysisExample = Effect.gen(function* () {
  yield* Effect.log("=== Advanced Graph Analysis ===");

  // Create a more complex graph for analysis
  const analysisGraph = Graph.mutate(Graph.undirected<string, number>(), (mutable) => {
    // Add nodes
    const nodes = ["A", "B", "C", "D", "E", "F", "G"];
    const nodeIndices = nodes.map(name => Graph.addNode(mutable, name));

    // Create a graph with multiple components and cycles
    Graph.addEdge(mutable, 0, 1, 1); // A-B
    Graph.addEdge(mutable, 1, 2, 1); // B-C
    Graph.addEdge(mutable, 2, 0, 1); // C-A (cycle)
    Graph.addEdge(mutable, 3, 4, 1); // D-E
    Graph.addEdge(mutable, 4, 5, 1); // E-F
    Graph.addEdge(mutable, 6, 6, 1); // G self-loop (cycle)
  });

  // Connected components
  const components = Graph.connectedComponents(analysisGraph);
  yield* Effect.log(`Number of connected components: ${components.length}`);

  for (let i = 0; i < components.length; i++) {
    const componentNames = components[i].map(idx => analysisGraph.nodes[idx].value);
    yield* Effect.log(`Component ${i + 1}: ${componentNames.join(", ")}`);
  }

  // Cycle detection
  const hasCycles = Graph.hasCycle(analysisGraph);
  yield* Effect.log(`Graph contains cycles: ${hasCycles}`);

  // Bipartite check
  const isBipartite = Graph.isBipartite(analysisGraph);
  yield* Effect.log(`Graph is bipartite: ${isBipartite}`);

  // Graph traversal
  yield* Effect.log("\nDFS traversal starting from node A:");
  const dfsTraversal = Graph.depthFirstTraversal(analysisGraph, 0);
  const dfsNames = dfsTraversal.map(idx => analysisGraph.nodes[idx].value);
  yield* Effect.log(dfsNames.join(" -> "));

  yield* Effect.log("\nBFS traversal starting from node A:");
  const bfsTraversal = Graph.breadthFirstTraversal(analysisGraph, 0);
  const bfsNames = bfsTraversal.map(idx => analysisGraph.nodes[idx].value);
  yield* Effect.log(bfsNames.join(" -> "));
});

// =============================================================================
// MAIN PROGRAM - Uncomment the example you want to run
// =============================================================================

const program = conceptualOverview;
// const program = basicGraphExample;
// const program = socialNetworkExample;
// const program = taskDependencyExample;
// const program = transportationExample;
// const program = dependencyExample;
// const program = gameNavigationExample;
// const program = visualizationExample;
// const program = advancedAnalysisExample;

// Run the selected example
// Note: This is a conceptual playground. Uncomment the Graph import when available.
// BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));

// For now, just run the conceptual overview
Effect.runPromise(program).then(() => {
  console.log("\n🎯 Ready to explore the Effect Graph API!");
  console.log("💡 Uncomment the Graph import and examples when the API becomes available in your Effect version.");
});
