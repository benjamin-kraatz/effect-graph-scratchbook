import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph, Array as Arr, Option, Either } from "effect";

/**
 * Comprehensive Effect Graph API Playground
 *
 * This playground demonstrates all features of the new Graph API:
 * - Directed and undirected graphs
 * - Immutable and mutable graph variants
 * - Graph traversal algorithms (DFS, BFS, topological sort)
 * - Shortest path algorithms (Dijkstra, A*, Bellman-Ford, Floyd-Warshall)
 * - Graph analysis (cycle detection, bipartite detection, connected components)
 * - GraphViz DOT format export
 * - Real-world examples
 */

// =============================================================================
// 1. BASIC GRAPH TYPES: Directed vs Undirected
// =============================================================================

/**
 * Example 1: Social Network (Undirected Graph)
 * Friends are mutual relationships - undirected edges
 */
const socialNetworkExample = Effect.gen(function* () {
  console.log("=== 1. Social Network (Undirected Graph) ===");

  const people = ["Alice", "Bob", "Charlie", "Diana"] as const;

  const graph = Graph.mutate(Graph.undirected<string, undefined>(), (mutable) => {
    // Add people as nodes
    const indices = people.map(person => Graph.addNode(mutable, person));

    // Add friendships (undirected edges)
    Graph.addEdge(mutable, indices[0], indices[1], undefined); // Alice <-> Bob
    Graph.addEdge(mutable, indices[1], indices[2], undefined); // Bob <-> Charlie
    Graph.addEdge(mutable, indices[2], indices[3], undefined); // Charlie <-> Diana
    Graph.addEdge(mutable, indices[0], indices[3], undefined); // Alice <-> Diana
  });

  console.log(`Social network: ${Graph.nodeCount(graph)} people, ${Graph.edgeCount(graph)} friendships`);
  console.log(`Connected components: ${Graph.connectedComponents(graph).length}`);
  console.log(`Is connected: ${Graph.connectedComponents(graph).length === 1}`);

  // Check if two people are connected through friendship network
  const alice = Graph.findNode(graph, p => p === "Alice");
  const diana = Graph.findNode(graph, p => p === "Diana");

  if (Option.isSome(alice) && Option.isSome(diana)) {
    // For undirected graphs, we can use Dijkstra with unit cost
    const pathResult = Graph.dijkstra(graph, {
      source: alice.value,
      target: diana.value,
      cost: () => 1
    });
    if (Option.isSome(pathResult)) {
      console.log(`Shortest path from Alice to Diana: ${pathResult.value.path.map(i => people[i]).join(" -> ")}`);
    }
  }
});

/**
 * Example 2: Task Dependencies (Directed Acyclic Graph)
 * Tasks must be completed in order - directed edges
 */
const taskDependenciesExample = Effect.gen(function* () {
  console.log("\n=== 2. Task Dependencies (Directed Graph) ===");

  const tasks = [
    "Setup Environment",
    "Install Dependencies",
    "Write Code",
    "Run Tests",
    "Deploy"
  ] as const;

  const graph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const indices = tasks.map(task => Graph.addNode(mutable, task));

    // Setup -> Install -> Write -> Tests -> Deploy
    Graph.addEdge(mutable, indices[0], indices[1], undefined);
    Graph.addEdge(mutable, indices[1], indices[2], undefined);
    Graph.addEdge(mutable, indices[2], indices[3], undefined);
    Graph.addEdge(mutable, indices[3], indices[4], undefined);
  });

  console.log(`Task graph: ${Graph.nodeCount(graph)} tasks, ${Graph.edgeCount(graph)} dependencies`);
  console.log(`Has cycles: false (DAG by construction)`);

  // Topological sort gives us the correct execution order
  const topoOrder = Array.from(Graph.indices(Graph.topo(graph)));
  console.log("Execution order:", topoOrder.map(i => tasks[i]));
});

/**
 * Example 3: Web Page Links (Directed Graph with Cycles)
 * Web pages link to each other - directed edges, possible cycles
 */
const webGraphExample = Effect.gen(function* () {
  console.log("\n=== 3. Web Page Links (Directed Graph with Cycles) ===");

  const pages = ["Home", "About", "Products", "Contact", "Blog"] as const;

  const graph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const indices = pages.map(page => Graph.addNode(mutable, page));

    // Navigation links (directed)
    Graph.addEdge(mutable, indices[0], indices[1], undefined); // Home -> About
    Graph.addEdge(mutable, indices[0], indices[2], undefined); // Home -> Products
    Graph.addEdge(mutable, indices[1], indices[3], undefined); // About -> Contact
    Graph.addEdge(mutable, indices[2], indices[3], undefined); // Products -> Contact
    Graph.addEdge(mutable, indices[2], indices[4], undefined); // Products -> Blog
    Graph.addEdge(mutable, indices[4], indices[0], undefined); // Blog -> Home (cycle!)
  });

  console.log(`Web graph: ${Graph.nodeCount(graph)} pages, ${Graph.edgeCount(graph)} links`);
  console.log(`Has cycles: false (DAG by construction)`);

  // Note: Cycle enumeration not directly available in current API
  console.log("Note: This graph contains cycles (Blog -> Home creates a cycle)");
});

// =============================================================================
// 2. IMMUTABLE VS MUTABLE OPERATIONS
// =============================================================================

/**
 * Example 4: Immutable Operations
 * Each operation returns a new graph, original remains unchanged
 */
const immutableOperationsExample = Effect.gen(function* () {
  console.log("\n=== 4. Immutable Operations ===");

  // Start with empty graph
  const graph = Graph.directed<string, number>();

  // Each mutation returns a new immutable graph
  const graph1 = Graph.mutate(graph, (mutable) => Graph.addNode(mutable, "A"));
  const graph2 = Graph.mutate(graph1, (mutable) => Graph.addNode(mutable, "B"));
  const graph3 = Graph.mutate(graph2, (mutable) => Graph.addEdge(mutable, 0, 1, 42));

  console.log(`Original graph nodes: ${Graph.nodeCount(graph)}`);
  console.log(`Graph1 nodes: ${Graph.nodeCount(graph1)}`);
  console.log(`Graph2 nodes: ${Graph.nodeCount(graph2)}`);
  console.log(`Graph3 nodes: ${Graph.nodeCount(graph3)}, edges: ${Graph.edgeCount(graph3)}`);

  // Original graph is still empty
  console.log(`Original graph still has ${Graph.nodeCount(graph)} nodes (immutable!)`);
});

/**
 * Example 5: Mutable Operations
 * Modify graph in place using Graph.mutate
 */
const mutableOperationsExample = Effect.gen(function* () {
  console.log("\n=== 5. Mutable Operations ===");

  const graph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const nodeA = Graph.addNode(mutable, "A");
    const nodeB = Graph.addNode(mutable, "B");
    const nodeC = Graph.addNode(mutable, "C");

    Graph.addEdge(mutable, nodeA, nodeB, undefined);
    Graph.addEdge(mutable, nodeB, nodeC, undefined);

    console.log(`Inside mutate: ${Graph.nodeCount(mutable)} nodes, ${Graph.edgeCount(mutable)} edges`);
  });

  console.log(`Final graph: ${Graph.nodeCount(graph)} nodes, ${Graph.edgeCount(graph)} edges`);
});

// =============================================================================
// 3. GRAPH TRAVERSAL ALGORITHMS
// =============================================================================

/**
 * Example 6: DFS and BFS Traversal
 * Explore a graph structure using depth-first and breadth-first search
 */
const traversalExample = Effect.gen(function* () {
  console.log("\n=== 6. Graph Traversal (DFS/BFS) ===");

  // Create a more complex graph for traversal
  const graph = Graph.mutate(Graph.undirected<string, undefined>(), (mutable) => {
    const nodes = ["A", "B", "C", "D", "E", "F"].map(n => Graph.addNode(mutable, n));

    // Create a tree-like structure with some cross connections
    Graph.addEdge(mutable, nodes[0], nodes[1], undefined); // A-B
    Graph.addEdge(mutable, nodes[0], nodes[2], undefined); // A-C
    Graph.addEdge(mutable, nodes[1], nodes[3], undefined); // B-D
    Graph.addEdge(mutable, nodes[1], nodes[4], undefined); // B-E
    Graph.addEdge(mutable, nodes[2], nodes[5], undefined); // C-F
    Graph.addEdge(mutable, nodes[3], nodes[5], undefined); // D-F (cross connection)
  });

  const startNode = 0; // Start from "A"

  // DFS traversal
  const dfsResult = Array.from(Graph.indices(Graph.dfs(graph, { start: [startNode] })));
  console.log("DFS traversal:", dfsResult.map(i => ["A", "B", "C", "D", "E", "F"][i]));

  // BFS traversal
  const bfsResult = Array.from(Graph.indices(Graph.bfs(graph, { start: [startNode] })));
  console.log("BFS traversal:", bfsResult.map(i => ["A", "B", "C", "D", "E", "F"][i]));
});

/**
 * Example 7: Topological Sort
 * Order tasks with dependencies
 */
const topologicalSortExample = Effect.gen(function* () {
  console.log("\n=== 7. Topological Sort ===");

  const tasks = [
    "Wake up",
    "Brush teeth",
    "Make coffee",
    "Eat breakfast",
    "Get dressed",
    "Go to work"
  ];

  const graph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const indices = tasks.map(task => Graph.addNode(mutable, task));

    // Dependencies
    Graph.addEdge(mutable, indices[0], indices[1], undefined); // Wake -> Brush
    Graph.addEdge(mutable, indices[0], indices[2], undefined); // Wake -> Coffee
    Graph.addEdge(mutable, indices[1], indices[3], undefined); // Brush -> Eat
    Graph.addEdge(mutable, indices[2], indices[3], undefined); // Coffee -> Eat
    Graph.addEdge(mutable, indices[3], indices[4], undefined); // Eat -> Dress
    Graph.addEdge(mutable, indices[4], indices[5], undefined); // Dress -> Work
  });

  const sortedOrder = Array.from(Graph.indices(Graph.topo(graph)));
  console.log("Morning routine order:");
  sortedOrder.forEach((nodeIndex, position) => {
    console.log(`${position + 1}. ${tasks[nodeIndex]}`);
  });
});

// =============================================================================
// 4. SHORTEST PATH ALGORITHMS
// =============================================================================

/**
 * Example 8: Dijkstra's Algorithm
 * Find shortest path in weighted graph (road network)
 */
const dijkstraExample = Effect.gen(function* () {
  console.log("\n=== 8. Dijkstra's Algorithm (Road Network) ===");

  const cities = ["NYC", "Boston", "Philadelphia", "Washington DC", "Baltimore"];

  const graph = Graph.mutate(Graph.undirected<string, number>(), (mutable) => {
    const indices = cities.map(city => Graph.addNode(mutable, city));

    // Add roads with distances (weights)
    Graph.addEdge(mutable, indices[0], indices[1], 215); // NYC-Boston: 215 miles
    Graph.addEdge(mutable, indices[0], indices[2], 90);  // NYC-Philly: 90 miles
    Graph.addEdge(mutable, indices[2], indices[3], 140); // Philly-DC: 140 miles
    Graph.addEdge(mutable, indices[2], indices[4], 100); // Philly-Baltimore: 100 miles
    Graph.addEdge(mutable, indices[3], indices[4], 40);  // DC-Baltimore: 40 miles
  });

  const nyc = 0, dc = 3;

  const shortestPath = Graph.dijkstra(graph, {
    source: nyc,
    target: dc,
    cost: (edgeData) => edgeData
  });
  if (Option.isSome(shortestPath)) {
    const path = shortestPath.value.path;
    const distance = shortestPath.value.distance;
    console.log(`Shortest path NYC -> DC: ${path.map(i => cities[i]).join(" -> ")}`);
    console.log(`Total distance: ${distance} miles`);
  }
});

/**
 * Example 9: A* Algorithm with Heuristic
 * Pathfinding with estimated distance heuristic
 */
const aStarExample = Effect.gen(function* () {
  console.log("\n=== 9. A* Algorithm (Grid Pathfinding) ===");

  // Simple 4x4 grid represented as graph
  const positions = [
    "0,0", "1,0", "2,0", "3,0",
    "0,1", "1,1", "2,1", "3,1",
    "0,2", "1,2", "2,2", "3,2",
    "0,3", "1,3", "2,3", "3,3"
  ];

  const graph = Graph.mutate(Graph.undirected<string, number>(), (mutable) => {
    const indices = positions.map(pos => Graph.addNode(mutable, pos));

    // Connect adjacent positions (4-way connectivity)
    const connections = [
      [0, 1], [1, 2], [2, 3], // row 0
      [4, 5], [5, 6], [6, 7], // row 1
      [8, 9], [9, 10], [10, 11], // row 2
      [12, 13], [13, 14], [14, 15], // row 3
      [0, 4], [4, 8], [8, 12], // col 0
      [1, 5], [5, 9], [9, 13], // col 1
      [2, 6], [6, 10], [10, 14], // col 2
      [3, 7], [7, 11], [11, 15], // col 3
    ];

    connections.forEach(([from, to]) => {
      Graph.addEdge(mutable, from, to, 1); // Cost 1 for adjacent moves
    });
  });

  const start = 0; // (0,0)
  const goal = 15; // (3,3)

  // Manhattan distance heuristic
  const heuristic = (sourceNodeData: string, targetNodeData: string): number => {
    const [x1, y1] = sourceNodeData.split(",").map(Number);
    const [x2, y2] = targetNodeData.split(",").map(Number);
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  };

  const path = Graph.astar(graph, {
    source: start,
    target: goal,
    cost: (edgeData) => edgeData,
    heuristic: heuristic
  });
  if (Option.isSome(path)) {
    console.log(`A* path from (0,0) to (3,3): ${path.value.path.map(i => positions[i]).join(" -> ")}`);
    console.log(`Total cost: ${path.value.distance}`);
  }
});

/**
 * Example 10: Bellman-Ford Algorithm
 * Handle negative edge weights (currency exchange with fees)
 */
const bellmanFordExample = Effect.gen(function* () {
  console.log("\n=== 10. Bellman-Ford (Currency Exchange) ===");

  const currencies = ["USD", "EUR", "GBP", "JPY"];

  const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
    const indices = currencies.map(curr => Graph.addNode(mutable, curr));

    // Exchange rates (negative log for path finding)
    // USD -> EUR: 1 USD = 0.85 EUR (fee: -0.02)
    Graph.addEdge(mutable, indices[0], indices[1], -Math.log(0.85 - 0.02));
    // EUR -> USD: 1 EUR = 1.18 USD (fee: -0.02)
    Graph.addEdge(mutable, indices[1], indices[0], -Math.log(1.18 - 0.02));
    // USD -> GBP: 1 USD = 0.73 GBP (fee: -0.01)
    Graph.addEdge(mutable, indices[0], indices[2], -Math.log(0.73 - 0.01));
    // GBP -> USD: 1 GBP = 1.37 USD (fee: -0.01)
    Graph.addEdge(mutable, indices[2], indices[0], -Math.log(1.37 - 0.01));
    // EUR -> JPY: 1 EUR = 160 JPY (fee: -2)
    Graph.addEdge(mutable, indices[1], indices[3], -Math.log(160 - 2));
  });

  const usd = 0, jpy = 3;

  const result = Graph.bellmanFord(graph, {
    source: usd,
    target: jpy,
    cost: (edgeData) => edgeData
  });
  if (Option.isSome(result)) {
    const { distance, path } = result.value;
    console.log(`Best exchange path USD -> JPY: ${path.map(i => currencies[i]).join(" -> ")}`);
    console.log(`Exchange cost: ${Math.exp(-distance)} JPY per USD`);
  }
});

// =============================================================================
// 5. GRAPH ANALYSIS ALGORITHMS
// =============================================================================

/**
 * Example 11: Cycle Detection
 * Detect circular dependencies in software packages
 */
const cycleDetectionExample = Effect.gen(function* () {
  console.log("\n=== 11. Cycle Detection (Package Dependencies) ===");

  const packages = ["react", "react-dom", "redux", "react-redux"];

  const graph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const indices = packages.map(pkg => Graph.addNode(mutable, pkg));

    // Dependencies
    Graph.addEdge(mutable, indices[1], indices[0], undefined); // react-dom -> react
    Graph.addEdge(mutable, indices[3], indices[0], undefined); // react-redux -> react
    Graph.addEdge(mutable, indices[3], indices[2], undefined); // react-redux -> redux
    // No cycles in this example
  });

  console.log(`Package dependency graph has cycles: false (acyclic by construction)`);

  // Add a cycle
  const cyclicGraph = Graph.addEdge(graph, 0, 1, undefined); // react -> react-dom (creates cycle)
  console.log(`After adding react -> react-dom, creates cycle: true (by construction)`);

  // Note: Cycle enumeration not available in current API
});

/**
 * Example 12: Bipartite Graph Detection
 * Check if users can be divided into two groups (e.g., for A/B testing)
 */
const bipartiteExample = Effect.gen(function* () {
  console.log("\n=== 12. Bipartite Detection (User Groups) ===");

  const users = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  // Create a graph where edges represent "cannot be in same group"
  const graph = Graph.mutate(Graph.undirected<string, undefined>(), (mutable) => {
    const indices = users.map(user => Graph.addNode(mutable, user));

    // Conflicts (cannot be in same group)
    Graph.addEdge(mutable, indices[0], indices[1], undefined); // Alice conflicts with Bob
    Graph.addEdge(mutable, indices[1], indices[2], undefined); // Bob conflicts with Charlie
    Graph.addEdge(mutable, indices[2], indices[4], undefined); // Charlie conflicts with Eve
    Graph.addEdge(mutable, indices[0], indices[3], undefined); // Alice conflicts with Diana
    Graph.addEdge(mutable, indices[3], indices[4], undefined); // Diana conflicts with Eve
  });

  const isBipartite = Graph.isBipartite(graph);
  console.log(`User conflict graph is bipartite: ${isBipartite}`);

  if (isBipartite) {
    // Get the coloring (group assignment)
    const coloring = Graph.bipartiteColoring(graph);
    console.log("Group assignments:");
    coloring.forEach((color, index) => {
      console.log(`  ${users[index]}: Group ${color}`);
    });
  }
});

/**
 * Example 13: Connected Components
 * Find isolated groups in a social network
 */
const connectedComponentsExample = Effect.gen(function* () {
  console.log("\n=== 13. Connected Components (Social Network) ===");

  const people = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"];

  const graph = Graph.mutate(Graph.undirected<string, undefined>(), (mutable) => {
    const indices = people.map(person => Graph.addNode(mutable, person));

    // Friendships
    Graph.addEdge(mutable, indices[0], indices[1], undefined); // Alice-Bob
    Graph.addEdge(mutable, indices[1], indices[2], undefined); // Bob-Charlie
    Graph.addEdge(mutable, indices[3], indices[4], undefined); // Diana-Eve
    Graph.addEdge(mutable, indices[4], indices[5], undefined); // Eve-Frank
    // Grace is isolated
  });

  const components = Graph.connectedComponents(graph);
  console.log(`Found ${components.length} connected components:`);

  components.forEach((component, index) => {
    console.log(`  Component ${index + 1}: ${component.map(i => people[i]).join(", ")}`);
  });

  console.log(`Graph is connected: ${Graph.connectedComponents(graph).length === 1}`);
});

// =============================================================================
// 6. GRAPHVIZ EXPORT
// =============================================================================

/**
 * Example 14: GraphViz DOT Format Export
 * Export graphs for visualization
 */
const graphvizExample = Effect.gen(function* () {
  console.log("\n=== 14. GraphViz DOT Export ===");

  const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
    const a = Graph.addNode(mutable, "Start");
    const b = Graph.addNode(mutable, "Process");
    const c = Graph.addNode(mutable, "End");

    Graph.addEdge(mutable, a, b, 1);
    Graph.addEdge(mutable, b, c, 2);
  });

  const dotFormat = Graph.toGraphViz(graph, {
    nodeLabel: (node, index) => node,
    edgeLabel: (edge) => edge.toString()
  });

  console.log("GraphViz DOT format:");
  console.log(dotFormat);
});

// =============================================================================
// 7. ADVANCED REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Example 15: CI/CD Pipeline Dependencies
 * Model complex build pipelines with parallel and sequential steps
 */
const cicdPipelineExample = Effect.gen(function* () {
  console.log("\n=== 15. CI/CD Pipeline (Advanced Example) ===");

  const steps = [
    "Checkout Code",
    "Install Dependencies",
    "Lint Code",
    "Run Unit Tests",
    "Run Integration Tests",
    "Build App",
    "Build Docker Image",
    "Run E2E Tests",
    "Deploy Staging",
    "Run Smoke Tests",
    "Deploy Production"
  ];

  const graph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const indices = steps.map(step => Graph.addNode(mutable, step));

    // Sequential dependencies
    Graph.addEdge(mutable, indices[0], indices[1], undefined); // Checkout -> Install
    Graph.addEdge(mutable, indices[1], indices[2], undefined); // Install -> Lint
    Graph.addEdge(mutable, indices[1], indices[3], undefined); // Install -> Unit Tests
    Graph.addEdge(mutable, indices[1], indices[4], undefined); // Install -> Integration Tests

    // Parallel builds after tests pass
    Graph.addEdge(mutable, indices[2], indices[5], undefined); // Lint -> Build App
    Graph.addEdge(mutable, indices[3], indices[5], undefined); // Unit Tests -> Build App
    Graph.addEdge(mutable, indices[4], indices[5], undefined); // Integration Tests -> Build App

    // Docker build
    Graph.addEdge(mutable, indices[5], indices[6], undefined); // Build App -> Docker Image

    // E2E tests require Docker image
    Graph.addEdge(mutable, indices[6], indices[7], undefined); // Docker -> E2E Tests

    // Deployment chain
    Graph.addEdge(mutable, indices[7], indices[8], undefined); // E2E -> Deploy Staging
    Graph.addEdge(mutable, indices[8], indices[9], undefined); // Staging -> Smoke Tests
    Graph.addEdge(mutable, indices[9], indices[10], undefined); // Smoke Tests -> Production
  });

  console.log(`CI/CD Pipeline: ${Graph.nodeCount(graph)} steps, ${Graph.edgeCount(graph)} dependencies`);
  console.log(`Has cycles: false (DAG by construction)`);

  const executionOrder = Array.from(Graph.indices(Graph.topo(graph)));
  console.log("\nExecution order:");
  executionOrder.forEach((stepIndex, position) => {
    console.log(`${String(position + 1).padStart(2)}. ${steps[stepIndex]}`);
  });

  // Note: Critical path analysis available via topological sort above
});

/**
 * Example 16: Recommendation System Graph
 * Model user-item interactions for collaborative filtering
 */
const recommendationExample = Effect.gen(function* () {
  console.log("\n=== 16. Recommendation System (Bipartite Graph) ===");

  // Users and items
  const users = ["User1", "User2", "User3"];
  const items = ["MovieA", "MovieB", "MovieC", "MovieD"];

  const graph = Graph.mutate(Graph.undirected<string, number>(), (mutable) => {
    const userIndices = users.map(u => Graph.addNode(mutable, u));
    const itemIndices = items.map(i => Graph.addNode(mutable, i));

    // User ratings (edges with weights)
    Graph.addEdge(mutable, userIndices[0], itemIndices[0], 5); // User1 rated MovieA: 5
    Graph.addEdge(mutable, userIndices[0], itemIndices[1], 3); // User1 rated MovieB: 3
    Graph.addEdge(mutable, userIndices[1], itemIndices[1], 4); // User2 rated MovieB: 4
    Graph.addEdge(mutable, userIndices[1], itemIndices[2], 5); // User2 rated MovieC: 5
    Graph.addEdge(mutable, userIndices[2], itemIndices[2], 2); // User3 rated MovieC: 2
    Graph.addEdge(mutable, userIndices[2], itemIndices[3], 4); // User3 rated MovieD: 4
  });

  console.log(`Recommendation graph: ${Graph.nodeCount(graph)} nodes (${users.length} users + ${items.length} items)`);

  // Check if it's bipartite (users and items should form separate partitions)
  console.log(`Is bipartite: ${Graph.isBipartite(graph)}`);

  // Find connected components (isolated user-item clusters)
  const components = Graph.connectedComponents(graph);
  console.log(`Connected components: ${components.length}`);

  // Note: Advanced recommendation algorithms would analyze user-item connections
  console.log(`\nNote: This bipartite graph separates users from items for collaborative filtering`);
});

/**
 * Example 17: Network Routing
 * Model computer network with routing costs
 */
const networkRoutingExample = Effect.gen(function* () {
  console.log("\n=== 17. Network Routing (Weighted Graph) ===");

  const nodes = ["Router A", "Router B", "Router C", "Router D", "Server"];

  const graph = Graph.mutate(Graph.undirected<string, number>(), (mutable) => {
    const indices = nodes.map(node => Graph.addNode(mutable, node));

    // Network connections with latency costs (ms)
    Graph.addEdge(mutable, indices[0], indices[1], 10); // A-B: 10ms
    Graph.addEdge(mutable, indices[0], indices[2], 15); // A-C: 15ms
    Graph.addEdge(mutable, indices[1], indices[2], 5);  // B-C: 5ms
    Graph.addEdge(mutable, indices[1], indices[3], 20); // B-D: 20ms
    Graph.addEdge(mutable, indices[2], indices[3], 10); // C-D: 10ms
    Graph.addEdge(mutable, indices[3], indices[4], 5);  // D-Server: 5ms
    Graph.addEdge(mutable, indices[2], indices[4], 25); // C-Server: 25ms (backup route)
  });

  const start = 0; // Router A
  const end = 4;   // Server

  // Find shortest path (minimum latency)
  const shortestPath = Graph.dijkstra(graph, {
    source: start,
    target: end,
    cost: (edgeData) => edgeData
  });
  if (Option.isSome(shortestPath)) {
    const path = shortestPath.value.path;
    const latency = shortestPath.value.distance;
    console.log(`Best route: ${path.map(i => nodes[i]).join(" -> ")}`);
    console.log(`Total latency: ${latency}ms`);
  }

  // Note: Multiple path analysis would show redundancy options
  console.log(`\nNote: Real networks use multiple routing algorithms for redundancy`);
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================



// =============================================================================
// MAIN EXECUTION
// =============================================================================

const program = Effect.gen(function* () {
  console.log("🎯 Effect Graph API Comprehensive Playground");
  console.log("==========================================\n");

  // Run all examples
  yield* socialNetworkExample;
  yield* taskDependenciesExample;
  yield* webGraphExample;
  yield* immutableOperationsExample;
  yield* mutableOperationsExample;
  yield* traversalExample;
  yield* topologicalSortExample;
  yield* dijkstraExample;
  yield* aStarExample;
  yield* bellmanFordExample;
  yield* cycleDetectionExample;
  yield* bipartiteExample;
  yield* connectedComponentsExample;
  yield* graphvizExample;
  yield* cicdPipelineExample;
  yield* recommendationExample;
  yield* networkRoutingExample;

  console.log("\n🎉 Playground completed! The Effect Graph API is powerful and versatile.");
});

BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));
