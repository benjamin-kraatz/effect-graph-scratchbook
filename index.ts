import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph, Option } from "effect";

// ============================================================================
// EXAMPLE 1: Basic Directed Graph - Simple Node & Edge Operations
// ============================================================================
function* example1_BasicDirectedGraph() {
  yield* Effect.log("\n=== Example 1: Basic Directed Graph ===");

  const graph = Graph.directed<string, number>((mutable) => {
    const nodeA = Graph.addNode(mutable, "A");
    const nodeB = Graph.addNode(mutable, "B");
    const nodeC = Graph.addNode(mutable, "C");

    // Add edges with weights
    Graph.addEdge(mutable, nodeA, nodeB, 5);
    Graph.addEdge(mutable, nodeB, nodeC, 3);
    Graph.addEdge(mutable, nodeA, nodeC, 10);
  });

  yield* Effect.log(`Nodes: ${Graph.nodeCount(graph)}`);
  yield* Effect.log(`Edges: ${Graph.edgeCount(graph)}`);

  // Find neighbors of node A
  const neighborsA = Graph.neighbors(graph, 0);
  yield* Effect.log(`Neighbors of A: ${neighborsA.join(", ")}`);

  // Get node data
  const nodeData = Graph.getNode(graph, 0);
  if (Option.isSome(nodeData)) {
    yield* Effect.log(`Node 0 data: ${nodeData.value}`);
  }
}

// ============================================================================
// EXAMPLE 2: Undirected Graph - Social Network
// ============================================================================
function* example2_SocialNetwork() {
  yield* Effect.log("\n=== Example 2: Social Network (Undirected) ===");

  type Person = { name: string; age: number };
  type Friendship = { since: string; strength: number };

  const socialGraph = Graph.undirected<Person, Friendship>((mutable) => {
    const alice = Graph.addNode(mutable, { name: "Alice", age: 28 });
    const bob = Graph.addNode(mutable, { name: "Bob", age: 32 });
    const carol = Graph.addNode(mutable, { name: "Carol", age: 25 });
    const dave = Graph.addNode(mutable, { name: "Dave", age: 30 });

    // Friendships are bidirectional in undirected graphs
    Graph.addEdge(mutable, alice, bob, { since: "2020-01-15", strength: 9 });
    Graph.addEdge(mutable, bob, carol, { since: "2019-06-20", strength: 7 });
    Graph.addEdge(mutable, carol, dave, { since: "2021-03-10", strength: 8 });
    Graph.addEdge(mutable, alice, carol, { since: "2022-11-05", strength: 6 });
  });

  yield* Effect.log(`Social network has ${Graph.nodeCount(socialGraph)} people`);
  yield* Effect.log(`Social network has ${Graph.edgeCount(socialGraph)} friendships`);

  // In undirected graphs, neighbors work both ways
  const aliceNeighbors = Graph.neighbors(socialGraph, 0);
  yield* Effect.log(`Alice's friends (node indices): ${aliceNeighbors.join(", ")}`);

  // Check if graph is bipartite (can we split people into two groups with no edges within groups?)
  const bipartite = Graph.isBipartite(socialGraph);
  yield* Effect.log(`Is this social network bipartite? ${bipartite}`);

  // Find connected components (groups of people who can reach each other)
  const components = Graph.connectedComponents(socialGraph);
  yield* Effect.log(`Connected components: ${components.length}`);
}

// ============================================================================
// EXAMPLE 3: Task Dependency Graph (DAG) - Project Management
// ============================================================================
function* example3_TaskDependencies() {
  yield* Effect.log("\n=== Example 3: Task Dependencies (DAG) ===");

  type Task = { id: string; name: string; duration: number };
  type Dependency = { type: "blocks" | "requires" };

  const taskGraph = Graph.directed<Task, Dependency>((mutable) => {
    const design = Graph.addNode(mutable, { id: "T1", name: "Design", duration: 5 });
    const frontend = Graph.addNode(mutable, { id: "T2", name: "Frontend", duration: 10 });
    const backend = Graph.addNode(mutable, { id: "T3", name: "Backend", duration: 12 });
    const database = Graph.addNode(mutable, { id: "T4", name: "Database", duration: 8 });
    const testing = Graph.addNode(mutable, { id: "T5", name: "Testing", duration: 6 });
    const deploy = Graph.addNode(mutable, { id: "T6", name: "Deploy", duration: 2 });

    // Design must be done before frontend and backend
    Graph.addEdge(mutable, design, frontend, { type: "blocks" });
    Graph.addEdge(mutable, design, backend, { type: "blocks" });

    // Database must be done before backend
    Graph.addEdge(mutable, database, backend, { type: "blocks" });

    // Frontend and backend must be done before testing
    Graph.addEdge(mutable, frontend, testing, { type: "blocks" });
    Graph.addEdge(mutable, backend, testing, { type: "blocks" });

    // Testing must be done before deploy
    Graph.addEdge(mutable, testing, deploy, { type: "blocks" });
  });

  // Check if this is acyclic (DAG) - should be true for valid task dependencies
  const acyclic = Graph.isAcyclic(taskGraph);
  yield* Effect.log(`Is task graph acyclic (valid DAG)? ${Option.isSome(acyclic) ? acyclic.value : "unknown"}`);

  if (Option.isSome(acyclic)) {
    if (acyclic.value) {
      yield* Effect.log("✓ Valid project dependency graph - no circular dependencies!");
    } else {
      yield* Effect.log("✗ Invalid graph - contains cycles!");
    }
  }

  // Find strongly connected components (would be individual nodes for a DAG)
  const sccs = Graph.stronglyConnectedComponents(taskGraph);
  yield* Effect.log(`Strongly connected components: ${sccs.length} (should equal node count for DAG)`);
}

// ============================================================================
// EXAMPLE 4: Road Network - Shortest Path (Dijkstra)
// ============================================================================
function* example4_RoadNetwork() {
  yield* Effect.log("\n=== Example 4: Road Network - Shortest Path ===");

  type City = { name: string; population: number };
  type Road = { distance: number; speedLimit: number };

  const roadNetwork = Graph.directed<City, Road>((mutable) => {
    const nyc = Graph.addNode(mutable, { name: "New York", population: 8_000_000 });
    const philly = Graph.addNode(mutable, { name: "Philadelphia", population: 1_600_000 });
    const baltimore = Graph.addNode(mutable, { name: "Baltimore", population: 600_000 });
    const dc = Graph.addNode(mutable, { name: "Washington DC", population: 700_000 });
    const boston = Graph.addNode(mutable, { name: "Boston", population: 700_000 });

    // Roads with distances (in miles) and speed limits
    Graph.addEdge(mutable, nyc, philly, { distance: 95, speedLimit: 65 });
    Graph.addEdge(mutable, philly, baltimore, { distance: 100, speedLimit: 70 });
    Graph.addEdge(mutable, baltimore, dc, { distance: 40, speedLimit: 65 });
    Graph.addEdge(mutable, nyc, boston, { distance: 215, speedLimit: 70 });
    Graph.addEdge(mutable, boston, dc, { distance: 450, speedLimit: 70 });
    Graph.addEdge(mutable, nyc, dc, { distance: 230, speedLimit: 70 }); // Direct route
  });

  yield* Effect.log(`Road network: ${Graph.nodeCount(roadNetwork)} cities, ${Graph.edgeCount(roadNetwork)} roads`);

  // Find shortest path from NYC to DC using Dijkstra
  // Note: Dijkstra needs edge weights to be numeric, so we'll use distance
  const nycNode = Graph.findNode(roadNetwork, (city) => city.name === "New York");
  const dcNode = Graph.findNode(roadNetwork, (city) => city.name === "Washington DC");

  if (Option.isSome(nycNode) && Option.isSome(dcNode)) {
    const shortestPath = Graph.dijkstra(roadNetwork, {
      source: nycNode.value,
      target: dcNode.value,
      cost: (road) => road.distance, // Extract distance as edge weight
    });

    if (Option.isSome(shortestPath)) {
      const result = shortestPath.value;
      yield* Effect.log(`Shortest path from NYC to DC: ${result.path.map((idx) => {
        const city = Graph.getNode(roadNetwork, idx);
        return Option.isSome(city) ? city.value.name : `Node ${idx}`;
      }).join(" → ")}`);
      yield* Effect.log(`Total distance: ${result.distance} miles`);
    } else {
      yield* Effect.log("No path found from NYC to DC");
    }
  } else {
    yield* Effect.log("Error: Could not find NYC or DC nodes");
  }
}

// ============================================================================
// EXAMPLE 5: Package Dependency Graph - NPM/Node Modules
// ============================================================================
function* example5_PackageDependencies() {
  yield* Effect.log("\n=== Example 5: Package Dependencies ===");

  type Package = { name: string; version: string };
  type Dependency = { version: string; optional: boolean };

  const packageGraph = Graph.directed<Package, Dependency>((mutable) => {
    const react = Graph.addNode(mutable, { name: "react", version: "18.2.0" });
    const reactDom = Graph.addNode(mutable, { name: "react-dom", version: "18.2.0" });
    const effect = Graph.addNode(mutable, { name: "effect", version: "3.19.0" });
    const platform = Graph.addNode(mutable, { name: "@effect/platform", version: "0.93.0" });
    const platformBun = Graph.addNode(mutable, { name: "@effect/platform-bun", version: "0.82.0" });

    // react-dom depends on react
    Graph.addEdge(mutable, react, reactDom, { version: "^18.0.0", optional: false });

    // @effect/platform-bun depends on @effect/platform
    Graph.addEdge(mutable, platform, platformBun, { version: "^0.90.0", optional: false });

    // @effect/platform depends on effect
    Graph.addEdge(mutable, effect, platform, { version: "^3.0.0", optional: false });
  });

  yield* Effect.log(`Package graph: ${Graph.nodeCount(packageGraph)} packages`);

  // Check for cycles (circular dependencies)
  const hasCycle = Graph.isAcyclic(packageGraph);
  if (Option.isSome(hasCycle)) {
    if (hasCycle.value) {
      yield* Effect.log("✓ No circular dependencies detected");
    } else {
      yield* Effect.log("✗ Circular dependencies detected!");
    }
  }

  // Find all packages that depend on 'effect'
  const effectNode = Graph.findNode(packageGraph, (pkg) => pkg.name === "effect");
  if (Option.isSome(effectNode)) {
    const effectIdx = effectNode.value;
    const dependents = Graph.neighborsDirected(packageGraph, effectIdx, "incoming");
    yield* Effect.log(`Packages depending on 'effect': ${dependents.length}`);
  }
}

// ============================================================================
// EXAMPLE 6: Web Page Link Graph - Crawling
// ============================================================================
function* example6_WebPageLinks() {
  yield* Effect.log("\n=== Example 6: Web Page Link Graph ===");

  type Page = { url: string; title: string };
  type Link = { anchorText: string; rel: string };

  const webGraph = Graph.directed<Page, Link>((mutable) => {
    const home = Graph.addNode(mutable, { url: "/", title: "Home" });
    const about = Graph.addNode(mutable, { url: "/about", title: "About" });
    const products = Graph.addNode(mutable, { url: "/products", title: "Products" });
    const contact = Graph.addNode(mutable, { url: "/contact", title: "Contact" });
    const blog = Graph.addNode(mutable, { url: "/blog", title: "Blog" });

    // Homepage links
    Graph.addEdge(mutable, home, about, { anchorText: "About Us", rel: "" });
    Graph.addEdge(mutable, home, products, { anchorText: "Products", rel: "" });
    Graph.addEdge(mutable, home, contact, { anchorText: "Contact", rel: "" });

    // About page links
    Graph.addEdge(mutable, about, contact, { anchorText: "Get in Touch", rel: "" });

    // Products page links
    Graph.addEdge(mutable, products, home, { anchorText: "Back to Home", rel: "" });

    // Blog links
    Graph.addEdge(mutable, blog, home, { anchorText: "Home", rel: "" });
    Graph.addEdge(mutable, home, blog, { anchorText: "Blog", rel: "" });
  });

  yield* Effect.log(`Web graph: ${Graph.nodeCount(webGraph)} pages, ${Graph.edgeCount(webGraph)} links`);

  // Find pages that link to homepage (incoming links)
  const homeNode = Graph.findNode(webGraph, (page) => page.url === "/");
  if (Option.isSome(homeNode)) {
    const homeIdx = homeNode.value;
    const incomingLinks = Graph.neighborsDirected(webGraph, homeIdx, "incoming");
    yield* Effect.log(`Pages linking to homepage: ${incomingLinks.length}`);
  }

  // Export to GraphViz DOT format for visualization
  const dotFormat = Graph.toGraphViz(webGraph, {
    nodeLabel: (page) => page.title,
    edgeLabel: (link) => link.anchorText,
  });
  yield* Effect.log("\nGraphViz DOT format:");
  yield* Effect.log(dotFormat);
}

// ============================================================================
// EXAMPLE 7: Knowledge Graph - Concept Relationships
// ============================================================================
function* example7_KnowledgeGraph() {
  yield* Effect.log("\n=== Example 7: Knowledge Graph ===");

  type Concept = { name: string; category: string };
  type Relationship = { type: "related-to" | "part-of" | "instance-of"; strength: number };

  const knowledgeGraph = Graph.directed<Concept, Relationship>((mutable) => {
    const ai = Graph.addNode(mutable, { name: "Artificial Intelligence", category: "field" });
    const ml = Graph.addNode(mutable, { name: "Machine Learning", category: "field" });
    const dl = Graph.addNode(mutable, { name: "Deep Learning", category: "technique" });
    const nn = Graph.addNode(mutable, { name: "Neural Networks", category: "technique" });
    const cnn = Graph.addNode(mutable, { name: "CNN", category: "architecture" });
    const rnn = Graph.addNode(mutable, { name: "RNN", category: "architecture" });

    // ML is part of AI
    Graph.addEdge(mutable, ml, ai, { type: "part-of", strength: 0.9 });
    // DL is part of ML
    Graph.addEdge(mutable, dl, ml, { type: "part-of", strength: 0.95 });
    // NN is part of DL
    Graph.addEdge(mutable, nn, dl, { type: "part-of", strength: 0.9 });
    // CNN is instance of NN
    Graph.addEdge(mutable, cnn, nn, { type: "instance-of", strength: 0.85 });
    // RNN is instance of NN
    Graph.addEdge(mutable, rnn, nn, { type: "instance-of", strength: 0.85 });
    // CNN and RNN are related
    Graph.addEdge(mutable, cnn, rnn, { type: "related-to", strength: 0.7 });
  });

  yield* Effect.log(`Knowledge graph: ${Graph.nodeCount(knowledgeGraph)} concepts`);

  // Find all concepts related to "Neural Networks"
  const nnNode = Graph.findNode(knowledgeGraph, (concept) => concept.name === "Neural Networks");
  if (Option.isSome(nnNode)) {
    const nnIdx = nnNode.value;
    const related = Graph.neighbors(knowledgeGraph, nnIdx);
    yield* Effect.log(`Concepts related to Neural Networks: ${related.length}`);
  }
}

// ============================================================================
// EXAMPLE 8: Graph Transformations - Map, Filter, Reverse
// ============================================================================
function* example8_GraphTransformations() {
  yield* Effect.log("\n=== Example 8: Graph Transformations ===");

  const originalGraph = Graph.directed<number, string>((mutable) => {
    const n1 = Graph.addNode(mutable, 10);
    const n2 = Graph.addNode(mutable, 20);
    const n3 = Graph.addNode(mutable, 30);
    Graph.addEdge(mutable, n1, n2, "edge1");
    Graph.addEdge(mutable, n2, n3, "edge2");
  });

  yield* Effect.log(`Original: ${Graph.nodeCount(originalGraph)} nodes`);

  // Map nodes: multiply all node values by 2
  // Note: mapNodes mutates in place, so we need to use mutate to create a copy
  const doubledGraph = Graph.mutate(originalGraph, (mutable) => {
    Graph.mapNodes(mutable, (value) => value * 2);
  });
  const doubledNode = Graph.getNode(doubledGraph, 0);
  if (Option.isSome(doubledNode)) {
    yield* Effect.log(`Doubled node 0: ${doubledNode.value} (was 10)`);
  }

  // Map edges: transform edge labels
  // Note: mapEdges also mutates in place
  const uppercasedGraph = Graph.mutate(originalGraph, (mutable) => {
    Graph.mapEdges(mutable, (edge) => edge.toUpperCase());
  });
  const edge = Graph.getEdge(uppercasedGraph, 0);
  if (Option.isSome(edge)) {
    yield* Effect.log(`Uppercased edge: ${edge.value.data} (was "edge1")`);
  }

  // Filter nodes: keep only nodes with value >= 20
  // Note: filterNodes also mutates in place
  const filteredGraph = Graph.mutate(originalGraph, (mutable) => {
    Graph.filterNodes(mutable, (value) => value >= 20);
  });
  yield* Effect.log(`Filtered graph: ${Graph.nodeCount(filteredGraph)} nodes (kept >= 20)`);

  // Reverse graph: flip all edge directions
  // Note: reverse also mutates in place
  const reversedGraph = Graph.mutate(originalGraph, (mutable) => {
    Graph.reverse(mutable);
  });
  yield* Effect.log(`Reversed graph: ${Graph.edgeCount(reversedGraph)} edges (directions flipped)`);
}

// ============================================================================
// EXAMPLE 9: Floyd-Warshall - All Pairs Shortest Path
// ============================================================================
function* example9_FloydWarshall() {
  yield* Effect.log("\n=== Example 9: Floyd-Warshall (All Pairs Shortest Path) ===");

  // Create a graph where edge data is the weight
  const weightedGraph = Graph.directed<string, number>((mutable) => {
    const a = Graph.addNode(mutable, "A");
    const b = Graph.addNode(mutable, "B");
    const c = Graph.addNode(mutable, "C");
    const d = Graph.addNode(mutable, "D");

    Graph.addEdge(mutable, a, b, 1);
    Graph.addEdge(mutable, a, c, 4);
    Graph.addEdge(mutable, b, c, 2);
    Graph.addEdge(mutable, b, d, 5);
    Graph.addEdge(mutable, c, d, 1);
  });

  // Floyd-Warshall computes shortest paths between all pairs of nodes
  const allPairsShortest = Graph.floydWarshall(weightedGraph, (weight) => weight);

  yield* Effect.log("All pairs shortest distances:");
  const nodeIndices = Array.from(weightedGraph.nodes.keys());
  for (const i of nodeIndices) {
    for (const j of nodeIndices) {
      const distMap = allPairsShortest.distances.get(i);
      const dist = distMap?.get(j);
      if (dist !== undefined && dist !== Infinity && i !== j) {
        const fromNode = Graph.getNode(weightedGraph, i);
        const toNode = Graph.getNode(weightedGraph, j);
        if (Option.isSome(fromNode) && Option.isSome(toNode)) {
          yield* Effect.log(`  ${fromNode.value} → ${toNode.value}: ${dist}`);
        }
      }
    }
  }
}

// ============================================================================
// EXAMPLE 10: Complex Real-World - E-commerce Recommendation System
// ============================================================================
function* example10_EcommerceRecommendations() {
  yield* Effect.log("\n=== Example 10: E-commerce Recommendation System ===");

  type Product = { id: string; name: string; category: string; price: number };
  type Relationship = {
    type: "bought-together" | "viewed-together" | "similar";
    score: number;
  };

  const productGraph = Graph.undirected<Product, Relationship>((mutable) => {
    // Electronics
    const laptop = Graph.addNode(mutable, {
      id: "P1",
      name: "Laptop",
      category: "Electronics",
      price: 999,
    });
    const mouse = Graph.addNode(mutable, {
      id: "P2",
      name: "Wireless Mouse",
      category: "Accessories",
      price: 25,
    });
    const keyboard = Graph.addNode(mutable, {
      id: "P3",
      name: "Mechanical Keyboard",
      category: "Accessories",
      price: 150,
    });

    // Books
    const book1 = Graph.addNode(mutable, {
      id: "P4",
      name: "Programming Book",
      category: "Books",
      price: 50,
    });
    const book2 = Graph.addNode(mutable, {
      id: "P5",
      name: "Data Structures Book",
      category: "Books",
      price: 45,
    });

    // Relationships
    Graph.addEdge(mutable, laptop, mouse, {
      type: "bought-together",
      score: 0.95,
    });
    Graph.addEdge(mutable, laptop, keyboard, {
      type: "bought-together",
      score: 0.85,
    });
    Graph.addEdge(mutable, mouse, keyboard, {
      type: "viewed-together",
      score: 0.75,
    });
    Graph.addEdge(mutable, book1, book2, {
      type: "similar",
      score: 0.80,
    });
  });

  yield* Effect.log(`Product graph: ${Graph.nodeCount(productGraph)} products`);

  // Find products frequently bought together with laptop
  const laptopNode = Graph.findNode(productGraph, (p) => p.id === "P1");
  if (Option.isSome(laptopNode)) {
    const laptopIdx = laptopNode.value;
    const recommendations = Graph.neighbors(productGraph, laptopIdx);

    yield* Effect.log("Products frequently bought/viewed with Laptop:");
    for (const neighborIdx of recommendations) {
      const product = Graph.getNode(productGraph, neighborIdx);
      // Find edges between laptop and this neighbor
      const edges = Graph.findEdges(productGraph, (_, source, target) => 
        (source === laptopIdx && target === neighborIdx) || 
        (source === neighborIdx && target === laptopIdx) // Undirected graph
      );
      if (Option.isSome(product) && edges.length > 0) {
        const edge = Graph.getEdge(productGraph, edges[0]);
        if (Option.isSome(edge)) {
          yield* Effect.log(
            `  - ${product.value.name} (${edge.value.data.type}, score: ${edge.value.data.score})`
          );
        }
      }
    }
  }

  // Find connected components (product clusters)
  const clusters = Graph.connectedComponents(productGraph);
  yield* Effect.log(`\nProduct clusters: ${clusters.length}`);
  for (let idx = 0; idx < clusters.length; idx++) {
    const cluster = clusters[idx];
    yield* Effect.log(`  Cluster ${idx + 1}: ${cluster.length} products`);
  }
}

// ============================================================================
// MAIN PROGRAM
// ============================================================================
const program = Effect.gen(function* () {
  yield* Effect.log("🚀 Effect Graph API Playground");
  yield* Effect.log("=" .repeat(60));

  yield* example1_BasicDirectedGraph();
  yield* example2_SocialNetwork();
  yield* example3_TaskDependencies();
  yield* example4_RoadNetwork();
  yield* example5_PackageDependencies();
  yield* example6_WebPageLinks();
  yield* example7_KnowledgeGraph();
  yield* example8_GraphTransformations();
  yield* example9_FloydWarshall();
  yield* example10_EcommerceRecommendations();

  yield* Effect.log("\n" + "=".repeat(60));
  yield* Effect.log("✨ Playground complete!");
});

BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));
