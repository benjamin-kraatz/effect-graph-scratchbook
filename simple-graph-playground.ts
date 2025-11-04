import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph, Option } from "effect";

/**
 * Simple Effect Graph API Playground
 *
 * A working demonstration of key Graph API features
 */

const program = Effect.gen(function* () {
  console.log("🎯 Effect Graph API Playground");
  console.log("=============================\n");

  // 1. Directed vs Undirected Graphs
  console.log("1. Social Network (Undirected Graph)");
  console.log("-".repeat(40));

  const socialGraph = Graph.mutate(Graph.undirected<string, undefined>(), (mutable) => {
    const alice = Graph.addNode(mutable, "Alice");
    const bob = Graph.addNode(mutable, "Bob");
    const charlie = Graph.addNode(mutable, "Charlie");
    const diana = Graph.addNode(mutable, "Diana");

    // Friendships (undirected edges)
    Graph.addEdge(mutable, alice, bob, undefined);
    Graph.addEdge(mutable, bob, charlie, undefined);
    Graph.addEdge(mutable, charlie, diana, undefined);
    Graph.addEdge(mutable, alice, diana, undefined);
  });

  console.log(`People: ${Graph.nodeCount(socialGraph)}, Friendships: ${Graph.edgeCount(socialGraph)}`);
  console.log(`Connected components: ${Graph.connectedComponents(socialGraph).length}`);
  console.log(`Is fully connected: ${Graph.connectedComponents(socialGraph).length === 1}\n`);

  // 2. Task Dependencies (Directed Acyclic Graph)
  console.log("2. Task Dependencies (Directed Graph)");
  console.log("-".repeat(40));

  const tasks = ["Setup", "Install", "Code", "Test", "Deploy"];
  const taskGraph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const indices = tasks.map(task => Graph.addNode(mutable, task));

    // Dependencies: Setup -> Install -> Code -> Test -> Deploy
    Graph.addEdge(mutable, indices[0], indices[1], undefined);
    Graph.addEdge(mutable, indices[1], indices[2], undefined);
    Graph.addEdge(mutable, indices[2], indices[3], undefined);
    Graph.addEdge(mutable, indices[3], indices[4], undefined);
  });

  console.log(`Tasks: ${Graph.nodeCount(taskGraph)}, Dependencies: ${Graph.edgeCount(taskGraph)}`);
  console.log(`Has cycles: ${!Graph.isAcyclic(taskGraph)}`);

  // Topological sort for execution order
  const executionOrder = Array.from(Graph.indices(Graph.topo(taskGraph)));
  console.log("Execution order:", executionOrder.map(i => tasks[i]).join(" -> "));
  console.log();

  // 3. Shortest Path (Dijkstra)
  console.log("3. Road Network (Shortest Path)");
  console.log("-".repeat(40));

  const cities = ["NYC", "Boston", "Philly", "DC"];
  const roadGraph = Graph.mutate(Graph.undirected<string, number>(), (mutable) => {
    const indices = cities.map(city => Graph.addNode(mutable, city));

    // Distances in miles
    Graph.addEdge(mutable, indices[0], indices[1], 215); // NYC-Boston
    Graph.addEdge(mutable, indices[0], indices[2], 90);  // NYC-Philly
    Graph.addEdge(mutable, indices[2], indices[3], 140); // Philly-DC
    Graph.addEdge(mutable, indices[1], indices[2], 300); // Boston-Philly (longer)
  });

  const shortestPath = Graph.dijkstra(roadGraph, {
    source: 0, // NYC
    target: 3, // DC
    cost: (edgeData) => edgeData
  });

  if (Option.isSome(shortestPath)) {
    const path = shortestPath.value.path;
    const distance = shortestPath.value.distance;
    console.log(`Best route NYC -> DC: ${path.map(i => cities[i]).join(" -> ")}`);
    console.log(`Distance: ${distance} miles\n`);
  }

  // 4. Graph Analysis
  console.log("4. Graph Analysis");
  console.log("-".repeat(20));

  // Bipartite check
  const isBipartite = Graph.isBipartite(socialGraph);
  console.log(`Social network is bipartite: ${isBipartite}`);

  // Connected components
  const components = Graph.connectedComponents(socialGraph);
  console.log(`Network has ${components.length} connected groups`);

  // Cycle detection
  console.log(`Task graph has cycles: ${!Graph.isAcyclic(taskGraph)}\n`);

  // 5. Graph Export
  console.log("5. GraphViz Export");
  console.log("-".repeat(20));

  const dotFormat = Graph.toGraphViz(taskGraph, {
    nodeLabel: (node) => node,
    edgeLabel: () => ""
  });

  console.log("DOT format (first few lines):");
  console.log(dotFormat.split('\n').slice(0, 5).join('\n'));
  console.log("...\n");

  // 6. Real-World Example: CI/CD Pipeline
  console.log("6. CI/CD Pipeline (Advanced Example)");
  console.log("-".repeat(40));

  const pipelineSteps = [
    "Checkout", "Install", "Lint", "Unit Tests", "Integration Tests",
    "Build", "E2E Tests", "Deploy Staging", "Smoke Tests", "Deploy Prod"
  ];

  const pipelineGraph = Graph.mutate(Graph.directed<string, undefined>(), (mutable) => {
    const indices = pipelineSteps.map(step => Graph.addNode(mutable, step));

    // Sequential dependencies
    Graph.addEdge(mutable, indices[0], indices[1], undefined); // Checkout -> Install
    Graph.addEdge(mutable, indices[1], indices[2], undefined); // Install -> Lint
    Graph.addEdge(mutable, indices[1], indices[3], undefined); // Install -> Unit Tests
    Graph.addEdge(mutable, indices[1], indices[4], undefined); // Install -> Integration Tests

    // Parallel builds
    Graph.addEdge(mutable, indices[2], indices[5], undefined); // Lint -> Build
    Graph.addEdge(mutable, indices[3], indices[5], undefined); // Unit -> Build
    Graph.addEdge(mutable, indices[4], indices[5], undefined); // Integration -> Build

    // Testing and deployment
    Graph.addEdge(mutable, indices[5], indices[6], undefined); // Build -> E2E
    Graph.addEdge(mutable, indices[6], indices[7], undefined); // E2E -> Deploy Staging
    Graph.addEdge(mutable, indices[7], indices[8], undefined); // Staging -> Smoke Tests
    Graph.addEdge(mutable, indices[8], indices[9], undefined); // Smoke -> Production
  });

  const pipelineOrder = Array.from(Graph.indices(Graph.topo(pipelineGraph)));
  console.log("Pipeline execution order:");
  pipelineOrder.forEach((stepIndex, position) => {
    console.log(`${String(position + 1).padStart(2)}. ${pipelineSteps[stepIndex]}`);
  });

  console.log(`\n🎉 Graph API playground completed!`);
  console.log(`Total examples: 6`);
  console.log(`Features demonstrated: directed/undirected graphs, traversal, shortest paths, analysis, export, real-world applications`);
});

BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));
