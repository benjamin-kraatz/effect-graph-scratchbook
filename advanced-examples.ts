/**
 * Advanced Real-World Graph Examples
 * 
 * This file contains more sophisticated use cases and patterns
 * for the Effect Graph API beyond the basic playground.
 * 
 * Examples include:
 * - Multi-layer dependency analysis
 * - Game pathfinding with obstacles
 * - Database migration ordering
 * - Machine learning task scheduling
 * - Network flow problems
 * - Recommendation engine graphs
 */

import { Effect, Graph } from "effect";

// ============================================================================
// ADVANCED EXAMPLE 1: Git Commit Dependency Graph
// ============================================================================
// Real use case: GitHub's merge conflict detection, CI/CD pipeline validation
export const example_GitCommitGraph = Effect.gen(function* () {
  yield* Effect.log("🔀 Advanced Example 1: Git Commit Graph");
  yield* Effect.log("   Use: Detect circular merges, validate rebase paths");

  interface Commit {
    sha: string;
    message: string;
    author: string;
  }

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Create commits
    const c1 = Graph.addNode(mutable, {
      sha: "abc123",
      message: "Initial commit",
      author: "Alice",
    });
    const c2 = Graph.addNode(mutable, {
      sha: "def456",
      message: "Add feature X",
      author: "Bob",
    });
    const c3 = Graph.addNode(mutable, {
      sha: "ghi789",
      message: "Fix bug",
      author: "Alice",
    });
    const c4 = Graph.addNode(mutable, {
      sha: "jkl012",
      message: "Merge branch",
      author: "Carol",
    });

    // Create commit history (parent → child)
    Graph.addEdge(mutable, c1, c2, null);
    Graph.addEdge(mutable, c1, c3, null);
    Graph.addEdge(mutable, c2, c4, null);
    Graph.addEdge(mutable, c3, c4, null);
  });

  const hasCircularMerge = Graph.hasCycle(graph);
  yield* Effect.log(`   Has circular merge: ${hasCircularMerge}`);

  // Get linear history using topological sort
  const linearHistory = Graph.topologicalSort(graph);
  yield* Effect.log(`   Commit order: ${linearHistory.length} commits`);
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 2: File System Dependency Resolution
// ============================================================================
// Real use case: Import resolution, dead code elimination in bundlers
export const example_FileSystemDependencies = Effect.gen(function* () {
  yield* Effect.log("📁 Advanced Example 2: File System Dependencies");
  yield* Effect.log("   Use: Tree-shaking, import resolution, circular import detection");

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    const index = Graph.addNode(mutable, "index.ts");
    const utils = Graph.addNode(mutable, "utils/helper.ts");
    const types = Graph.addNode(mutable, "types/index.ts");
    const config = Graph.addNode(mutable, "config.ts");
    const constants = Graph.addNode(mutable, "constants.ts");

    // Import dependencies
    Graph.addEdge(mutable, index, utils, null);
    Graph.addEdge(mutable, index, types, null);
    Graph.addEdge(mutable, utils, constants, null);
    Graph.addEdge(mutable, types, constants, null);
    Graph.addEdge(mutable, types, config, null);
  });

  // Find which files need to be included when bundling index.ts
  const reachable = Graph.dfs(graph, 0); // Start from index.ts
  yield* Effect.log(`   Files needed for bundling: ${reachable.length}`);

  // Detect circular imports
  const hasCircular = Graph.hasCycle(graph);
  yield* Effect.log(`   Has circular imports: ${hasCircular}`);
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 3: Microservice Deployment Ordering
// ============================================================================
// Real use case: Kubernetes deployment, service mesh rollout
export const example_MicroserviceDeployment = Effect.gen(function* () {
  yield* Effect.log("🚀 Advanced Example 3: Microservice Deployment");
  yield* Effect.log("   Use: Blue-green deployments, canary releases, rollback analysis");

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Services and their dependencies
    const database = Graph.addNode(mutable, "database");
    const cache = Graph.addNode(mutable, "cache");
    const auth = Graph.addNode(mutable, "auth-service");
    const api = Graph.addNode(mutable, "api-service");
    const web = Graph.addNode(mutable, "web-service");
    const monitoring = Graph.addNode(mutable, "monitoring");

    // Deployment dependencies (must deploy in order)
    Graph.addEdge(mutable, database, auth, null);
    Graph.addEdge(mutable, cache, api, null);
    Graph.addEdge(mutable, auth, api, null);
    Graph.addEdge(mutable, api, web, null);
    Graph.addEdge(mutable, database, monitoring, null);
    Graph.addEdge(mutable, api, monitoring, null);
  });

  // Get safe deployment order
  const deployOrder = Graph.topologicalSort(graph);
  yield* Effect.log(`   Safe deployment order:`);
  for (const idx of deployOrder) {
    const service = Graph.getNodeData(graph, idx);
    yield* Effect.log(`     → ${service}`);
  }

  // Check for circular dependencies (would block deployment)
  const valid = !Graph.hasCycle(graph);
  yield* Effect.log(`   Deployment valid: ${valid}`);
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 4: Course Prerequisites Network
// ============================================================================
// Real use case: University course planning, skill progression tracking
export const example_CoursePrerequisites = Effect.gen(function* () {
  yield* Effect.log("🎓 Advanced Example 4: Course Prerequisites");
  yield* Effect.log("   Use: Degree planning, skill progression, curriculum design");

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Create course nodes
    const intro = Graph.addNode(mutable, "Intro to CS");
    const dataStructures = Graph.addNode(mutable, "Data Structures");
    const algorithms = Graph.addNode(mutable, "Algorithms");
    const databases = Graph.addNode(mutable, "Databases");
    const systems = Graph.addNode(mutable, "Computer Systems");
    const compilers = Graph.addNode(mutable, "Compilers");
    const capstone = Graph.addNode(mutable, "Capstone Project");

    // Prerequisites (must take FIRST course before SECOND course)
    Graph.addEdge(mutable, intro, dataStructures, null);
    Graph.addEdge(mutable, intro, systems, null);
    Graph.addEdge(mutable, dataStructures, algorithms, null);
    Graph.addEdge(mutable, dataStructures, databases, null);
    Graph.addEdge(mutable, systems, compilers, null);
    Graph.addEdge(mutable, algorithms, capstone, null);
    Graph.addEdge(mutable, databases, capstone, null);
    Graph.addEdge(mutable, compilers, capstone, null);
  });

  // Find courses with no prerequisites (can start immediately)
  const allNodes = Array.from({ length: Graph.nodeCount(graph) }, (_, i) => i);
  const reachableFromAll = new Set<number>();

  // Alternative: Find root nodes (no incoming edges)
  // This identifies which courses students can take first
  yield* Effect.log(`   Curriculum has ${Graph.nodeCount(graph)} courses`);

  // Validate no circular prerequisites
  if (Graph.hasCycle(graph)) {
    yield* Effect.log("   ⚠️  INVALID: Circular prerequisites detected!");
  } else {
    const order = Graph.topologicalSort(graph);
    yield* Effect.log("   ✅ Valid curriculum (no circular prerequisites)");
    yield* Effect.log(`   Optimal course order: ${order.length} courses`);
  }
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 5: Machine Learning Pipeline DAG
// ============================================================================
// Real use case: Workflow orchestration (Airflow, Kubeflow, Prefect)
export const example_MLPipelineDAG = Effect.gen(function* () {
  yield* Effect.log("🤖 Advanced Example 5: ML Pipeline DAG");
  yield* Effect.log("   Use: Workflow orchestration, parallelizable task detection");

  interface PipelineTask {
    name: string;
    estimatedTime: number; // in seconds
  }

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // ML Pipeline stages
    const fetch = Graph.addNode(mutable, "fetch-data");
    const preprocess1 = Graph.addNode(mutable, "preprocess-part1");
    const preprocess2 = Graph.addNode(mutable, "preprocess-part2");
    const merge = Graph.addNode(mutable, "merge-data");
    const featureEng = Graph.addNode(mutable, "feature-engineering");
    const train = Graph.addNode(mutable, "train-model");
    const evaluate = Graph.addNode(mutable, "evaluate");
    const deploy = Graph.addNode(mutable, "deploy");

    // Define pipeline flow
    Graph.addEdge(mutable, fetch, preprocess1, null);
    Graph.addEdge(mutable, fetch, preprocess2, null); // Can run in parallel
    Graph.addEdge(mutable, preprocess1, merge, null);
    Graph.addEdge(mutable, preprocess2, merge, null);
    Graph.addEdge(mutable, merge, featureEng, null);
    Graph.addEdge(mutable, featureEng, train, null);
    Graph.addEdge(mutable, train, evaluate, null);
    Graph.addEdge(mutable, evaluate, deploy, null);
  });

  // Find parallelizable stages (DFS can help identify)
  const executionOrder = Graph.topologicalSort(graph);
  yield* Effect.log(`   Pipeline stages: ${executionOrder.length}`);

  // Detect if pipeline has loops (would hang forever)
  const hasLoops = Graph.hasCycle(graph);
  yield* Effect.log(`   Has circular dependencies: ${hasLoops}`);
  yield* Effect.log("   Stages that can run in parallel: preprocess-part1, preprocess-part2");
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 6: Permission/Authorization Graph
// ============================================================================
// Real use case: RBAC (Role-Based Access Control), permission inheritance
export const example_AuthorizationGraph = Effect.gen(function* () {
  yield* Effect.log("🔐 Advanced Example 6: Authorization Graph");
  yield* Effect.log("   Use: RBAC systems, permission inheritance, capability graphs");

  interface Permission {
    name: string;
    resource: string;
  }

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Permissions with inheritance
    const readFiles = Graph.addNode(mutable, "read:files");
    const writeFiles = Graph.addNode(mutable, "write:files");
    const deleteFiles = Graph.addNode(mutable, "delete:files");
    const manageUsers = Graph.addNode(mutable, "manage:users");
    const admin = Graph.addNode(mutable, "admin");

    // Permission hierarchy (more specific → more general)
    // If user has "write:files", they implicitly have "read:files"
    Graph.addEdge(mutable, writeFiles, readFiles, null);
    Graph.addEdge(mutable, deleteFiles, writeFiles, null);
    Graph.addEdge(mutable, deleteFiles, readFiles, null);
    Graph.addEdge(mutable, admin, deleteFiles, null);
    Graph.addEdge(mutable, admin, manageUsers, null);
  });

  // Check what permissions flow from "admin" role
  const impliedPermissions = Graph.dfs(graph, 4); // admin is node 4
  yield* Effect.log(`   Admin role implies ${impliedPermissions.length} permissions`);

  // Validate no circular privilege escalation
  if (Graph.hasCycle(graph)) {
    yield* Effect.log("   ⚠️  SECURITY ISSUE: Circular permission grant detected!");
  } else {
    yield* Effect.log("   ✅ Permission hierarchy is valid");
  }
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 7: Recommendation Engine (Collaborative Filtering)
// ============================================================================
// Real use case: Netflix, Spotify, Amazon recommendations
export const example_RecommendationGraph = Effect.gen(function* () {
  yield* Effect.log("🎬 Advanced Example 7: Recommendation Graph");
  yield* Effect.log("   Use: Collaborative filtering, content relationships");

  // Graph: User → Item → Similar Items → Related Content
  const graph = Graph.mutate(Graph.undirected(), (mutable) => {
    // Movies
    const movie1 = Graph.addNode(mutable, "Movie: Inception");
    const movie2 = Graph.addNode(mutable, "Movie: Interstellar");
    const movie3 = Graph.addNode(mutable, "Movie: The Matrix");
    const movie4 = Graph.addNode(mutable, "Movie: Tenet");

    // Content similarity (edge weight = similarity score 0-1)
    Graph.addEdge(mutable, movie1, movie2, 0.85); // Very similar
    Graph.addEdge(mutable, movie2, movie3, 0.7);  // Similar
    Graph.addEdge(mutable, movie1, movie3, 0.75);
    Graph.addEdge(mutable, movie3, movie4, 0.8);
  });

  // Find all similar movies reachable from Inception
  const reachable = Graph.bfs(graph, 0);
  yield* Effect.log(`   Similar movies to Inception: ${reachable.length - 1} recommendations`);

  // Check if recommendation graph is connected (all movies are discoverable)
  const components = Graph.connectedComponents(graph);
  yield* Effect.log(`   Recommendation network: ${components.size} isolated cluster(s)`);
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 8: Database Schema Dependency Graph
// ============================================================================
// Real use case: Migration ordering, schema versioning, refactoring
export const example_DatabaseSchemaDependencies = Effect.gen(function* () {
  yield* Effect.log("🗄️  Advanced Example 8: Database Schema Dependencies");
  yield* Effect.log("   Use: Migration ordering, foreign key validation, schema evolution");

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Tables with dependencies
    const users = Graph.addNode(mutable, "users");
    const profiles = Graph.addNode(mutable, "profiles"); // FK → users
    const posts = Graph.addNode(mutable, "posts"); // FK → users
    const comments = Graph.addNode(mutable, "comments"); // FK → posts
    const likes = Graph.addNode(mutable, "likes"); // FK → posts, users
    const sessions = Graph.addNode(mutable, "sessions"); // FK → users

    // Foreign key relationships (table must exist before dependent table)
    Graph.addEdge(mutable, users, profiles, null);
    Graph.addEdge(mutable, users, posts, null);
    Graph.addEdge(mutable, users, sessions, null);
    Graph.addEdge(mutable, posts, comments, null);
    Graph.addEdge(mutable, posts, likes, null);
    Graph.addEdge(mutable, users, likes, null);
  });

  // Get migration order (create tables in correct order)
  const migrationOrder = Graph.topologicalSort(graph);
  yield* Effect.log(`   Migration order (create tables in sequence):`);
  for (const idx of migrationOrder) {
    const table = Graph.getNodeData(graph, idx);
    yield* Effect.log(`     ${idx + 1}. ${table}`);
  }

  // Validate: check for circular foreign keys
  const hasCircular = Graph.hasCycle(graph);
  yield* Effect.log(`   Circular foreign keys: ${hasCircular}`);
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 9: Event Sourcing - Event Dependency Chain
// ============================================================================
// Real use case: Event-driven architectures, saga patterns, CQRS
export const example_EventSourcingChain = Effect.gen(function* () {
  yield* Effect.log("📡 Advanced Example 9: Event Sourcing Dependency Chain");
  yield* Effect.log("   Use: Saga patterns, transaction coordination, replaying events");

  interface DomainEvent {
    type: string;
    aggregateId: string;
  }

  const graph = Graph.mutate(Graph.directed(), (mutable) => {
    // Order processing saga
    const orderCreated = Graph.addNode(mutable, "OrderCreated");
    const paymentRequested = Graph.addNode(mutable, "PaymentRequested");
    const paymentConfirmed = Graph.addNode(mutable, "PaymentConfirmed");
    const inventoryReserved = Graph.addNode(mutable, "InventoryReserved");
    const orderDispatched = Graph.addNode(mutable, "OrderDispatched");
    const orderDelivered = Graph.addNode(mutable, "OrderDelivered");

    // Event causality
    Graph.addEdge(mutable, orderCreated, paymentRequested, null);
    Graph.addEdge(mutable, paymentRequested, paymentConfirmed, null);
    Graph.addEdge(mutable, paymentConfirmed, inventoryReserved, null);
    Graph.addEdge(mutable, inventoryReserved, orderDispatched, null);
    Graph.addEdge(mutable, orderDispatched, orderDelivered, null);
  });

  // Get event replay order (for event store recovery)
  const replayOrder = Graph.topologicalSort(graph);
  yield* Effect.log(`   Event replay order for recovery:`);
  for (const idx of replayOrder) {
    const event = Graph.getNodeData(graph, idx);
    yield* Effect.log(`     ${event}`);
  }

  // Validate no event cycles (would cause infinite loops)
  const valid = !Graph.hasCycle(graph);
  yield* Effect.log(`   Saga is acyclic (safe): ${valid}`);
  yield* Effect.log("");
});

// ============================================================================
// ADVANCED EXAMPLE 10: Network Topology with Redundancy
// ============================================================================
// Real use case: ISP routing, data center design, resilience analysis
export const example_NetworkTopology = Effect.gen(function* () {
  yield* Effect.log("🌐 Advanced Example 10: Network Topology");
  yield* Effect.log("   Use: Finding critical paths, redundancy analysis, latency optimization");

  const graph = Graph.mutate(Graph.undirected(), (mutable) => {
    // Data centers
    const dc1 = Graph.addNode(mutable, "DC-US-East");
    const dc2 = Graph.addNode(mutable, "DC-US-West");
    const dc3 = Graph.addNode(mutable, "DC-EU-Frankfurt");
    const dc4 = Graph.addNode(mutable, "DC-APAC-Singapore");

    // Network links (latency in ms as weight)
    Graph.addEdge(mutable, dc1, dc2, 50);   // US cross-country
    Graph.addEdge(mutable, dc1, dc3, 120);  // US to Europe
    Graph.addEdge(mutable, dc3, dc4, 150);  // Europe to APAC
    Graph.addEdge(mutable, dc2, dc4, 120);  // Direct US-West to APAC
    Graph.addEdge(mutable, dc1, dc4, 180);  // Long direct route
  });

  // Find all data centers (should be 1 connected component for full mesh)
  const components = Graph.connectedComponents(graph);
  yield* Effect.log(
    `   Network resilience: ${components.size === 1 ? "✅ Fully connected" : "⚠️  Partitioned"}`
  );

  // Find shortest latency path between datacenters
  const fastest = Graph.shortestPathDijkstra(graph, 0, 3);
  yield* Effect.log(`   Fastest US-East to APAC route: ${JSON.stringify(fastest)}`);
  yield* Effect.log("");
});

// ============================================================================
// Run all advanced examples
// ============================================================================
export const allAdvancedExamples = Effect.gen(function* () {
  yield* Effect.log("\n╔════════════════════════════════════════════════════════════════╗");
  yield* Effect.log("║         🔬 Advanced Real-World Graph Examples 🔬             ║");
  yield* Effect.log("║     Complex patterns and industry use cases                  ║");
  yield* Effect.log("╚════════════════════════════════════════════════════════════════╝\n");

  yield* example_GitCommitGraph;
  yield* example_FileSystemDependencies;
  yield* example_MicroserviceDeployment;
  yield* example_CoursePrerequisites;
  yield* example_MLPipelineDAG;
  yield* example_AuthorizationGraph;
  yield* example_RecommendationGraph;
  yield* example_DatabaseSchemaDependencies;
  yield* example_EventSourcingChain;
  yield* example_NetworkTopology;

  yield* Effect.log("╔════════════════════════════════════════════════════════════════╗");
  yield* Effect.log("║ ✅ Advanced examples completed! Apply these patterns to your  ║");
  yield* Effect.log("║    own domain problems. Graphs are everywhere!               ║");
  yield* Effect.log("╚════════════════════════════════════════════════════════════════╝");
});

// ============================================================================
// Run all advanced examples
// ============================================================================
const runAdvanced = Effect.gen(function* () {
  yield* allAdvancedExamples;
});

// Uncomment to run advanced examples:
// Effect.runSync(runAdvanced);
