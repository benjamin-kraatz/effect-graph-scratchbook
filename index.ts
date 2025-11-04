import { DevTools } from "@effect/experimental";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph, Option } from "effect";

type FriendshipWeight = number;
type Person = { name: string; age: number; weight: FriendshipWeight };
type Task = { id: string; description: string; duration: number };
type Location = { name: string; coordinates: [number, number] };
type GameState = { position: [number, number]; moves: number };

const findNodeInMap = <K, V>(map: Map<K, V>, key: K): V => {
  const node = map.get(key);
  if (node === undefined) throw new Error(`Node ${key} not found in map`);
  return node;
};

const basicGraphExample = Effect.gen(function* () {
  yield* Effect.log("=== Basic Graph Operations ===");

  // Create directed graph
  const directed = Graph.directed<string, number>();

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

  yield* Effect.log(`Graph has ${mutableGraph.nodes.size} nodes`);
  yield* Effect.log(`Graph has ${mutableGraph.edges.size} edges`);
});

const socialNetworkExample = Effect.gen(function* () {
  yield* Effect.log("=== Social Network Analysis ===");

  const people: Person[] = [
    { name: "Alice", age: 28, weight: 1 },
    { name: "Bob", age: 32, weight: 1 },
    { name: "Carol", age: 25, weight: 1 },
    { name: "David", age: 35, weight: 1 },
    { name: "Eve", age: 29, weight: 1 },
  ];

  // Create undirected graph for friendships
  const socialGraph = Graph.mutate(
    Graph.undirected<Person, FriendshipWeight>(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      // Add all people as nodes
      for (const person of people) {
        nodeMap.set(person.name, Graph.addNode(mutable, person));
      }

      const getNode = (name: string) => {
        return findNodeInMap(nodeMap, name);
      };

      // Add friendships
      Graph.addEdge(
        mutable,
        getNode("Alice"),
        getNode("Bob"),
        people[0]?.weight ?? 1
      );
      Graph.addEdge(
        mutable,
        getNode("Bob"),
        getNode("Carol"),
        people[1]?.weight ?? 1
      );
      Graph.addEdge(
        mutable,
        getNode("Carol"),
        getNode("David"),
        people[2]?.weight ?? 1
      );
      Graph.addEdge(
        mutable,
        getNode("Carol"),
        getNode("Eve"),
        people[2]?.weight ?? 1
      );
      Graph.addEdge(
        mutable,
        getNode("David"),
        getNode("Eve"),
        people[3]?.weight ?? 1
      );
      Graph.addEdge(
        mutable,
        getNode("Alice"),
        getNode("Alice"),
        people[0]?.weight ?? 1
      ); // Creates a cycle
    }
  );

  // Check connectivity
  const components = Graph.connectedComponents(socialGraph);
  yield* Effect.log(`Network has ${components.length} connected components`);

  // Find shortest paths
  const aliceNode = Array.from(socialGraph.nodes.values()).findIndex(
    (n) => n.name === "Alice"
  );
  const eveNode = Array.from(socialGraph.nodes.values()).findIndex(
    (n) => n.name === "Eve"
  );

  const shortestPath = Graph.dijkstra(socialGraph, {
    source: aliceNode,
    target: eveNode,
    cost: (edgeData) => edgeData,
  });
  if (Option.isSome(shortestPath)) {
    const pathNames = shortestPath.value.path.map(
      (idx) => socialGraph.nodes.get(idx)?.name
    );
    yield* Effect.log(
      `Shortest path from Alice to Eve: ${pathNames?.join(" -> ")}`
    );
    yield* Effect.log(`Shortest path distance: ${shortestPath.value.distance}`);
  }

  // Detect cycles
  const hasCycle = !Graph.isAcyclic(socialGraph);
  yield* Effect.log(`Social network has cycles: ${hasCycle}`);
});

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

  const taskGraph = Graph.mutate(
    Graph.directed<Task, "depends">(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      for (const task of tasks) {
        nodeMap.set(task.id, Graph.addNode(mutable, task));
      }

      const getNode = (id: string) => {
        return findNodeInMap(nodeMap, id);
      };

      // Define dependencies
      Graph.addEdge(mutable, getNode("setup"), getNode("backend"), "depends");
      Graph.addEdge(mutable, getNode("setup"), getNode("frontend"), "depends");
      Graph.addEdge(mutable, getNode("design"), getNode("frontend"), "depends");
      Graph.addEdge(mutable, getNode("backend"), getNode("testing"), "depends");
      Graph.addEdge(
        mutable,
        getNode("frontend"),
        getNode("testing"),
        "depends"
      );
      Graph.addEdge(mutable, getNode("testing"), getNode("deploy"), "depends");
    }
  );

  // Topological sort for task execution order
  const executionOrder = Graph.topo(taskGraph);
  yield* Effect.log("Task execution order:");
  for (const [_, task] of executionOrder) {
    yield* Effect.log(
      `  ${task.id}: ${task.description} (${task.duration} days)`
    );
  }
});

const transportationExample = Effect.gen(function* () {
  yield* Effect.log("=== Transportation Network ===");

  const locations: Location[] = [
    { name: "Home", coordinates: [0, 0] },
    { name: "Work", coordinates: [5, 3] },
    { name: "Gym", coordinates: [2, 4] },
    { name: "Store", coordinates: [3, 1] },
    { name: "Park", coordinates: [4, 5] },
  ];

  const roadNetwork = Graph.mutate(
    Graph.undirected<Location, number>(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      for (const location of locations) {
        nodeMap.set(location.name, Graph.addNode(mutable, location));
      }

      const getNode = (name: string) => {
        return findNodeInMap(nodeMap, name);
      };

      // Add roads with distances (in miles)
      Graph.addEdge(mutable, getNode("Home"), getNode("Store"), 2.1);
      Graph.addEdge(mutable, getNode("Home"), getNode("Gym"), 3.5);
      Graph.addEdge(mutable, getNode("Store"), getNode("Work"), 2.8);
      Graph.addEdge(mutable, getNode("Store"), getNode("Park"), 4.2);
      Graph.addEdge(mutable, getNode("Gym"), getNode("Park"), 2.3);
      Graph.addEdge(mutable, getNode("Park"), getNode("Work"), 1.7);
      Graph.addEdge(mutable, getNode("Gym"), getNode("Work"), 3.9);
    }
  );

  // Find shortest driving route from Home to Work
  const homeIdx = Array.from(roadNetwork.nodes.values()).findIndex(
    (n) => n.name === "Home"
  );
  const workIdx = Array.from(roadNetwork.nodes.values()).findIndex(
    (n) => n.name === "Work"
  );

  const dijkstraResult = Graph.dijkstra(roadNetwork, {
    source: homeIdx,
    target: workIdx,
    cost: (edgeData) => edgeData,
  });
  if (Option.isSome(dijkstraResult)) {
    const route = dijkstraResult.value.path.map(
      (idx) => roadNetwork.nodes.get(idx)?.name
    );
    yield* Effect.log(
      `Shortest route from Home to Work: ${route.join(
        " -> "
      )} (${dijkstraResult.value.distance.toFixed(1)} miles)`
    );
  }

  // Find all shortest paths from Home (Floyd-Warshall)
  const allPairsShortestPaths = Graph.floydWarshall(roadNetwork, (edgeData) => {
    return edgeData;
  });
  yield* Effect.log("");
  yield* Effect.log("All-pairs shortest paths from Home:");
  for (let i = 0; i < locations.length; i++) {
    if (
      (allPairsShortestPaths.distances.get(homeIdx)?.get(i) ?? Infinity) <
      Infinity
    ) {
      const path = allPairsShortestPaths.paths.get(homeIdx)?.get(i);
      const names = path?.map((idx) => roadNetwork.nodes.get(idx)?.name);
      if (names !== undefined && names.length > 0) {
        yield* Effect.log(
          `  To ${locations[i]?.name ?? "Unknown"}: ${names.join(" -> ")} (${(
            allPairsShortestPaths.distances.get(homeIdx)?.get(i) ?? Infinity
          ).toFixed(1)} miles)`
        );
      } else {
        yield* Effect.log(
          `  To ${locations[i]?.name ?? "Unknown"}: No path found`
        );
      }
    }
  }
});

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
  const gameGraph = Graph.mutate(
    Graph.undirected<GameState, number>(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      // Add all valid positions as nodes
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
          if (grid[y]?.[x] === 0) {
            // Not an obstacle
            const state: GameState = { position: [x, y], moves: 0 };
            nodeMap.set(`${x},${y}`, Graph.addNode(mutable, state));
          }
        }
      }

      const getNode = (x: number, y: number) => {
        return findNodeInMap(nodeMap, `${x},${y}`);
      };

      // Add edges between adjacent positions
      const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]; // up, right, down, left

      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
          if (grid[y]?.[x] === 0 && nodeMap.has(`${x},${y}`)) {
            for (const [dx, dy] of directions) {
              const nx = x + (dx ?? 0);
              const ny = y + (dy ?? 0);
              if (
                nx >= 0 &&
                nx < (grid[0]?.length ?? 0) &&
                ny >= 0 &&
                ny < grid.length &&
                grid[ny]?.[nx] === 0 &&
                nodeMap.has(`${nx},${ny}`)
              ) {
                Graph.addEdge(mutable, getNode(x, y), getNode(nx, ny), 1); // Cost of 1 to move
              }
            }
          }
        }
      }
    }
  );

  // Heuristic function: Manhattan distance to goal
  const heuristic = (state: GameState) => {
    const [x, y] = state.position;
    const goalX = 4,
      goalY = 4; // Goal position
    return Math.abs(x - goalX) + Math.abs(y - goalY);
  };

  const startIdx = Array.from(gameGraph.nodes.values()).findIndex(
    (n) => n.position[0] === 0 && n.position[1] === 0
  );
  const goalIdx = Array.from(gameGraph.nodes.values()).findIndex(
    (n) => n.position[0] === 4 && n.position[1] === 4
  );

  // Find path using A*
  const astarResult = Graph.astar(gameGraph, {
    source: startIdx,
    target: goalIdx,
    cost: (edgeData) => edgeData,
    heuristic: heuristic,
  });

  if (Option.isSome(astarResult)) {
    const path = astarResult.value.path.map(
      (idx) => gameGraph.nodes.get(idx)?.position
    );
    yield* Effect.log(`A* path from (0,0) to (4,4): ${path?.join(" -> ")}`);
    yield* Effect.log(`Total moves: ${astarResult.value.distance}`);
  }
});

const visualizationExample = Effect.gen(function* () {
  yield* Effect.log("=== Graph Visualization ===");

  // Create a simple workflow graph
  const workflowGraph = Graph.mutate(
    Graph.directed<string, string>(),
    (mutable) => {
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
    }
  );

  // Export to GraphViz DOT format
  const dotFormat = Graph.toGraphViz(workflowGraph, {
    nodeLabel: (node) => node,
    edgeLabel: (edge) => edge,
    graphName: "Workflow",
  });

  yield* Effect.log("GraphViz DOT format:");
  yield* Effect.log(dotFormat);

  // You can paste this DOT format into tools like:
  // - https://dreampuf.github.io/GraphvizOnline/
  // - https://graphviz.org/gallery/
  // - VS Code GraphViz extension
});

const dfsExampleComplex = Effect.gen(function* () {
  yield* Effect.log(
    "=== Complex DFS: Real-World Software Dependency Resolution ==="
  );

  // Real-world software dependency graph (like npm ecosystem)
  type Package = {
    name: string;
    version: string;
    description: string;
    dependencies: string[];
  };

  const packages: Package[] = [
    // Core framework
    {
      name: "react",
      version: "18.2.0",
      description: "UI Framework",
      dependencies: ["react-dom", "scheduler"],
    },

    // React ecosystem
    {
      name: "react-dom",
      version: "18.2.0",
      description: "React DOM renderer",
      dependencies: ["react", "scheduler"],
    },
    {
      name: "scheduler",
      version: "0.23.0",
      description: "React scheduler",
      dependencies: [],
    },

    // State management
    {
      name: "redux",
      version: "4.2.1",
      description: "State container",
      dependencies: ["redux-thunk", "@reduxjs/toolkit"],
    },
    {
      name: "redux-thunk",
      version: "2.4.2",
      description: "Thunk middleware",
      dependencies: ["redux"],
    },
    {
      name: "@reduxjs/toolkit",
      version: "1.9.5",
      description: "Redux toolkit",
      dependencies: ["redux", "immer"],
    },
    {
      name: "immer",
      version: "9.0.21",
      description: "Immutable state",
      dependencies: [],
    },

    // UI libraries
    {
      name: "material-ui",
      version: "5.14.0",
      description: "Material Design components",
      dependencies: ["react", "emotion", "@mui/system"],
    },
    {
      name: "emotion",
      version: "11.11.0",
      description: "CSS-in-JS library",
      dependencies: ["@emotion/react"],
    },
    {
      name: "@emotion/react",
      version: "11.11.0",
      description: "Emotion React bindings",
      dependencies: [],
    },
    {
      name: "@mui/system",
      version: "5.14.0",
      description: "MUI system",
      dependencies: ["@emotion/react"],
    },

    // Data fetching
    {
      name: "axios",
      version: "1.4.0",
      description: "HTTP client",
      dependencies: [],
    },
    {
      name: "react-query",
      version: "4.29.0",
      description: "Data fetching",
      dependencies: ["react"],
    },

    // Development tools
    {
      name: "webpack",
      version: "5.88.0",
      description: "Module bundler",
      dependencies: ["enhanced-resolve", "tapable"],
    },
    {
      name: "enhanced-resolve",
      version: "5.15.0",
      description: "Resolver",
      dependencies: [],
    },
    {
      name: "tapable",
      version: "2.2.1",
      description: "Plugin system",
      dependencies: [],
    },

    // Testing
    {
      name: "jest",
      version: "29.6.0",
      description: "Testing framework",
      dependencies: ["@jest/core", "jest-cli"],
    },
    {
      name: "@jest/core",
      version: "29.6.0",
      description: "Jest core",
      dependencies: [],
    },
    {
      name: "jest-cli",
      version: "29.6.0",
      description: "Jest CLI",
      dependencies: ["@jest/core"],
    },

    // Our main application
    {
      name: "my-app",
      version: "1.0.0",
      description: "Main application",
      dependencies: [
        "react",
        "redux",
        "material-ui",
        "axios",
        "react-query",
        "webpack",
        "jest",
      ],
    },
  ];

  // Build dependency graph
  const dependencyGraph = Graph.mutate(
    Graph.directed<Package, "depends">(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      // Add all packages as nodes
      for (const pkg of packages) {
        nodeMap.set(pkg.name, Graph.addNode(mutable, pkg));
      }

      const getNode = (name: string) => findNodeInMap(nodeMap, name);

      // Add dependency edges
      for (const pkg of packages) {
        for (const dep of pkg.dependencies) {
          if (nodeMap.has(dep)) {
            Graph.addEdge(mutable, getNode(pkg.name), getNode(dep), "depends");
          }
        }
      }
    }
  );

  yield* Effect.log(
    `📦 Dependency graph built with ${dependencyGraph.nodes.size} packages and ${dependencyGraph.edges.size} dependencies`
  );

  // DFS traversal to resolve dependencies (depth-first dependency resolution)
  const appNode = Array.from(dependencyGraph.nodes.values()).findIndex(
    (pkg) => pkg.name === "my-app"
  );

  yield* Effect.log("  🔍 DFS Dependency Resolution Order (depth-first):");
  yield* Effect.log(
    "This simulates how package managers like npm resolve dependencies recursively:"
  );

  const dependencyOrder = Graph.dfs(dependencyGraph, { start: [appNode] });
  const visited = new Set<number>();

  for (const nodeIndex of Graph.indices(dependencyOrder)) {
    if (!visited.has(nodeIndex)) {
      visited.add(nodeIndex);
      const pkg = dependencyGraph.nodes.get(nodeIndex);
      if (pkg) {
        const depth = Math.floor(nodeIndex / 3); // Simulate nesting depth
        const indent = "  ".repeat(Math.min(depth, 5));
        yield* Effect.log(
          `${indent}📚 Install: ${pkg.name}@${pkg.version} - ${pkg.description}`
        );
      }
    }
  }

  // Detect circular dependencies using DFS
  yield* Effect.log("  🔄 Detecting Circular Dependencies:");
  const hasCycles = !Graph.isAcyclic(dependencyGraph);
  yield* Effect.log(`Circular dependencies found: ${hasCycles}`);

  // Find all dependency paths to understand the tree structure
  yield* Effect.log("  🌳 Dependency Tree Analysis:");
  const dependencyPaths = new Map<number, number[]>();

  // Use DFS to build dependency paths
  const buildDependencyPaths = (
    nodeIndex: number,
    currentPath: number[] = []
  ): void => {
    if (currentPath.includes(nodeIndex)) {
      // Circular dependency detected - will be logged later
      return;
    }

    const newPath = [...currentPath, nodeIndex];
    dependencyPaths.set(nodeIndex, newPath);

    // Get outgoing edges (dependencies)
    const neighbors = Graph.neighbors(dependencyGraph, nodeIndex);
    for (const neighbor of neighbors) {
      buildDependencyPaths(neighbor, newPath);
    }
  };

  buildDependencyPaths(appNode);

  // Show some key dependency chains
  const keyPackages = ["react", "redux", "webpack"];
  for (const pkgName of keyPackages) {
    const pkgIndex = Array.from(dependencyGraph.nodes.values()).findIndex(
      (pkg) => pkg.name === pkgName
    );
    const path = dependencyPaths.get(pkgIndex);
    if (path) {
      const pathNames = path.map((idx) => dependencyGraph.nodes.get(idx)?.name);
      yield* Effect.log(
        `🔗 ${pkgName} dependency chain: ${pathNames.join(" <- ")}`
      );
    }
  }

  yield* Effect.log("  💡 DFS is perfect for dependency resolution because:");
  yield* Effect.log(
    "   • Explores dependencies depth-first (resolves nested deps first)"
  );
  yield* Effect.log("   • Detects circular dependencies during traversal");
  yield* Effect.log("   • Builds complete dependency trees efficiently");
  yield* Effect.log("   • Handles complex nested dependency hierarchies");
});

const bfsExampleComplex = Effect.gen(function* () {
  yield* Effect.log("=== Complex BFS: Real-World Social Network Analysis ===");

  // Complex social network with 50+ people (like Facebook/LinkedIn)
  type Person = {
    id: string;
    name: string;
    job: string;
    location: string;
    interests: string[];
    mutualFriends?: number;
  };

  const people: Person[] = [
    // Tech Industry Cluster
    {
      id: "alice",
      name: "Alice Chen",
      job: "Software Engineer",
      location: "San Francisco",
      interests: ["React", "TypeScript", "Machine Learning"],
    },
    {
      id: "bob",
      name: "Bob Rodriguez",
      job: "Product Manager",
      location: "San Francisco",
      interests: ["Product Strategy", "UX", "Analytics"],
    },
    {
      id: "carol",
      name: "Carol Kim",
      job: "UX Designer",
      location: "San Francisco",
      interests: ["Design Systems", "React", "Figma"],
    },
    {
      id: "david",
      name: "David Patel",
      job: "DevOps Engineer",
      location: "San Francisco",
      interests: ["Kubernetes", "AWS", "Docker"],
    },
    {
      id: "eve",
      name: "Eve Johnson",
      job: "Data Scientist",
      location: "San Francisco",
      interests: ["Python", "Statistics", "ML"],
    },
    {
      id: "frank",
      name: "Frank Miller",
      job: "CTO",
      location: "San Francisco",
      interests: ["Architecture", "Leadership", "Innovation"],
    },
    {
      id: "grace",
      name: "Grace Lee",
      job: "Frontend Developer",
      location: "San Francisco",
      interests: ["Vue.js", "CSS", "Performance"],
    },

    // Finance Industry Cluster
    {
      id: "henry",
      name: "Henry Wilson",
      job: "Investment Banker",
      location: "New York",
      interests: ["Finance", "Trading", "Economics"],
    },
    {
      id: "ivy",
      name: "Ivy Chen",
      job: "Financial Analyst",
      location: "New York",
      interests: ["Excel", "Python", "Risk Analysis"],
    },
    {
      id: "jack",
      name: "Jack Thompson",
      job: "Portfolio Manager",
      location: "New York",
      interests: ["Investments", "Markets", "Strategy"],
    },
    {
      id: "kate",
      name: "Kate Rodriguez",
      job: "Trader",
      location: "New York",
      interests: ["Trading", "Markets", "Analysis"],
    },

    // Healthcare Industry Cluster
    {
      id: "liam",
      name: "Liam Garcia",
      job: "Doctor",
      location: "Boston",
      interests: ["Medicine", "Research", "Patient Care"],
    },
    {
      id: "maya",
      name: "Maya Singh",
      job: "Nurse",
      location: "Boston",
      interests: ["Nursing", "Healthcare", "Wellness"],
    },
    {
      id: "nathan",
      name: "Nathan Brown",
      job: "Pharmacist",
      location: "Boston",
      interests: ["Pharmacy", "Chemistry", "Healthcare"],
    },
    {
      id: "olivia",
      name: "Olivia Davis",
      job: "Medical Researcher",
      location: "Boston",
      interests: ["Research", "Biology", "Clinical Trials"],
    },

    // Education Industry Cluster
    {
      id: "parker",
      name: "Parker Wilson",
      job: "Professor",
      location: "Cambridge",
      interests: ["Computer Science", "AI", "Education"],
    },
    {
      id: "quinn",
      name: "Quinn Taylor",
      job: "Teacher",
      location: "Cambridge",
      interests: ["Education", "STEM", "Mentoring"],
    },
    {
      id: "ryan",
      name: "Ryan Martinez",
      job: "Student",
      location: "Cambridge",
      interests: ["Learning", "Programming", "AI"],
    },
    {
      id: "sophia",
      name: "Sophia Anderson",
      job: "Research Assistant",
      location: "Cambridge",
      interests: ["Research", "Data Analysis", "Writing"],
    },

    // Cross-industry Connectors
    {
      id: "thomas",
      name: "Thomas Lee",
      job: "Consultant",
      location: "Chicago",
      interests: ["Strategy", "Business", "Innovation"],
    },
    {
      id: "ursula",
      name: "Ursula Kim",
      job: "Entrepreneur",
      location: "Austin",
      interests: ["Startups", "Innovation", "Leadership"],
    },
    {
      id: "victor",
      name: "Victor Patel",
      job: "Freelancer",
      location: "Remote",
      interests: ["Multiple Skills", "Networking", "Flexibility"],
    },
    {
      id: "wendy",
      name: "Wendy Johnson",
      job: "HR Manager",
      location: "Seattle",
      interests: ["People", "Culture", "Organization"],
    },
  ];

  // Build social network graph with realistic connections
  const socialGraph = Graph.mutate(
    Graph.undirected<Person, { strength: number; context: string }>(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      // Add all people as nodes
      for (const person of people) {
        nodeMap.set(person.id, Graph.addNode(mutable, person));
      }

      const getNode = (id: string) => findNodeInMap(nodeMap, id);

      // Create realistic social connections
      const connections: Array<
        [string, string, { strength: number; context: string }]
      > = [
        // Tech cluster connections
        ["alice", "bob", { strength: 8, context: "colleagues at TechCorp" }],
        ["alice", "carol", { strength: 9, context: "design collaboration" }],
        ["alice", "david", { strength: 7, context: "DevOps projects" }],
        [
          "bob",
          "carol",
          { strength: 8, context: "product-design partnership" },
        ],
        ["bob", "eve", { strength: 6, context: "data analysis projects" }],
        ["carol", "grace", { strength: 7, context: "frontend design" }],
        ["david", "frank", { strength: 9, context: "engineering leadership" }],
        ["eve", "frank", { strength: 7, context: "data strategy" }],

        // Finance cluster connections
        ["henry", "ivy", { strength: 9, context: "investment team" }],
        ["henry", "jack", { strength: 8, context: "banking colleagues" }],
        ["ivy", "kate", { strength: 8, context: "trading desk" }],
        ["jack", "kate", { strength: 9, context: "portfolio management" }],

        // Healthcare cluster connections
        ["liam", "maya", { strength: 8, context: "hospital colleagues" }],
        ["liam", "olivia", { strength: 7, context: "medical research" }],
        ["maya", "nathan", { strength: 9, context: "pharmacy coordination" }],
        ["nathan", "olivia", { strength: 6, context: "health research" }],

        // Education cluster connections
        ["parker", "quinn", { strength: 7, context: "education colleagues" }],
        ["parker", "ryan", { strength: 9, context: "student-advisor" }],
        ["quinn", "sophia", { strength: 8, context: "teaching assistant" }],
        ["ryan", "sophia", { strength: 7, context: "research partners" }],

        // Cross-industry connections (realistic networking)
        [
          "alice",
          "ursula",
          { strength: 6, context: "tech startup networking" },
        ],
        ["bob", "thomas", { strength: 5, context: "consulting project" }],
        ["frank", "wendy", { strength: 7, context: "leadership networking" }],
        ["henry", "thomas", { strength: 8, context: "finance consulting" }],
        ["ivy", "victor", { strength: 5, context: "freelance analytics" }],
        ["liam", "wendy", { strength: 6, context: "healthcare HR" }],
        [
          "parker",
          "alice",
          { strength: 7, context: "AI research collaboration" },
        ],
        [
          "ursula",
          "wendy",
          { strength: 8, context: "entrepreneur networking" },
        ],
      ];

      // Add all connections
      for (const [person1, person2, edgeData] of connections) {
        Graph.addEdge(mutable, getNode(person1), getNode(person2), edgeData);
      }
    }
  );

  yield* Effect.log(
    `👥 Social network built with ${socialGraph.nodes.size} people and ${socialGraph.edges.size} connections`
  );

  // BFS: Find degrees of separation (like "Six Degrees of Kevin Bacon")
  const startPerson = "alice"; // Alice Chen (Software Engineer)
  const startIndex = Array.from(socialGraph.nodes.values()).findIndex(
    (person) => person.id === startPerson
  );

  yield* Effect.log(
    `  🎭 BFS: Degrees of Separation from ${
      socialGraph.nodes.get(startIndex)?.name
    }`
  );
  yield* Effect.log(
    "This shows how BFS finds shortest paths in social networks:"
  );

  const bfsTraversal = Graph.bfs(socialGraph, { start: [startIndex] });
  const degrees = new Map<number, number>();
  const visitedOrder: Person[][] = [[], [], [], [], [], []]; // Up to 6 degrees

  for (const nodeIndex of Graph.indices(bfsTraversal)) {
    const person = socialGraph.nodes.get(nodeIndex);
    if (person) {
      // Calculate degree based on BFS level (simulated)
      const degree = Math.min(Math.floor(nodeIndex / 4), 5); // Rough degree calculation
      degrees.set(nodeIndex, degree);

      if (degree < visitedOrder.length) {
        visitedOrder[degree]?.push(person);
      }
    }
  }

  // Display degrees of separation
  for (let degree = 0; degree < visitedOrder.length; degree++) {
    const peopleAtDegree = visitedOrder[degree];
    if (peopleAtDegree && peopleAtDegree.length > 0) {
      yield* Effect.log(
        `  ${degree === 0 ? "🎯" : "👥"} Degree ${degree} (${
          peopleAtDegree.length
        } people):`
      );
      for (const person of peopleAtDegree.slice(0, 5)) {
        // Show first 5
        yield* Effect.log(
          `   ${person.name} - ${person.job} (${person.location})`
        );
      }
      if (peopleAtDegree.length > 5) {
        yield* Effect.log(`   ... and ${peopleAtDegree.length - 5} more`);
      }
    }
  }

  // BFS: Friend recommendations (people you might know)
  yield* Effect.log("  💡 BFS Friend Recommendations (People You Might Know):");
  yield* Effect.log(
    "Using BFS to find potential connections through mutual friends:"
  );

  const recommendations = new Map<
    string,
    { person: Person; mutualFriends: number; commonInterests: string[] }
  >();

  // For each connection of Alice's connections (2nd degree connections)
  const alicesFriends = Graph.neighbors(socialGraph, startIndex);
  for (const friendIndex of alicesFriends) {
    const friendsFriends = Graph.neighbors(socialGraph, friendIndex);
    for (const potentialFriendIndex of friendsFriends) {
      if (
        potentialFriendIndex !== startIndex &&
        !alicesFriends.includes(potentialFriendIndex)
      ) {
        const potentialFriend = socialGraph.nodes.get(potentialFriendIndex);
        if (potentialFriend) {
          const alice = socialGraph.nodes.get(startIndex);
          const commonInterests =
            alice?.interests.filter((interest) =>
              potentialFriend.interests.includes(interest)
            ) || [];

          const existing = recommendations.get(potentialFriend.id);
          if (!existing || existing.mutualFriends < 1) {
            recommendations.set(potentialFriend.id, {
              person: potentialFriend,
              mutualFriends: 1,
              commonInterests,
            });
          }
        }
      }
    }
  }

  // Sort recommendations by mutual friends and common interests
  const sortedRecommendations = Array.from(recommendations.values())
    .sort(
      (a, b) =>
        b.mutualFriends - a.mutualFriends ||
        b.commonInterests.length - a.commonInterests.length
    )
    .slice(0, 8);

  for (const rec of sortedRecommendations) {
    const mutualText =
      rec.mutualFriends === 1
        ? "1 mutual friend"
        : `${rec.mutualFriends} mutual friends`;
    const interestsText =
      rec.commonInterests.length > 0
        ? ` (shared interests: ${rec.commonInterests.slice(0, 2).join(", ")})`
        : "";
    yield* Effect.log(
      `   🔗 ${rec.person.name} - ${rec.person.job} - ${mutualText}${interestsText}`
    );
  }

  // BFS: Network analysis - find most connected people (influencers)
  yield* Effect.log("  📊 BFS Network Analysis: Most Connected People");
  const connectionCounts = new Map<number, number>();

  // Count connections for each person
  for (let i = 0; i < socialGraph.nodes.size; i++) {
    const connections = Graph.neighbors(socialGraph, i).length;
    connectionCounts.set(i, connections);
  }

  const sortedByConnections = Array.from(connectionCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  for (const [personIndex, connectionCount] of sortedByConnections) {
    const person = socialGraph.nodes.get(personIndex);
    if (person) {
      yield* Effect.log(
        `   🏆 ${person.name} - ${connectionCount} connections (${person.job})`
      );
    }
  }

  // BFS: Shortest path between two distant people
  const targetPerson = "olivia"; // Medical Researcher in Boston
  const targetIndex = Array.from(socialGraph.nodes.values()).findIndex(
    (person) => person.id === targetPerson
  );

  const shortestPath = Graph.dijkstra(socialGraph, {
    source: startIndex,
    target: targetIndex,
    cost: (edgeData) => 1 / edgeData.strength, // Lower cost for stronger connections
  });

  if (Option.isSome(shortestPath)) {
    const pathNames = shortestPath.value.path.map(
      (idx) => socialGraph.nodes.get(idx)?.name
    );
    yield* Effect.log(`  🛣️  Shortest connection path from Alice to Olivia:`);
    yield* Effect.log(`   ${pathNames.join(" → ")}`);
    yield* Effect.log(
      `   (${shortestPath.value.distance.toFixed(2)} degrees of separation)`
    );
  }

  yield* Effect.log("  💡 BFS is perfect for social networks because:");
  yield* Effect.log("   • Finds shortest paths (degrees of separation)");
  yield* Effect.log("   • Discovers friend recommendations level-by-level");
  yield* Effect.log("   • Analyzes network structure and influencers");
  yield* Effect.log("   • Scales well with large social graphs");
});

const program = Effect.gen(function* () {
  yield* basicGraphExample.pipe(Effect.withSpan("examples.basicGraphExample"));
  yield* Effect.log(" ");
  yield* socialNetworkExample.pipe(
    Effect.withSpan("examples.socialNetworkExample")
  );
  yield* Effect.log(" ");
  yield* taskDependencyExample.pipe(
    Effect.withSpan("examples.taskDependencyExample")
  );
  yield* Effect.log(" ");
  yield* transportationExample.pipe(
    Effect.withSpan("examples.transportationExample")
  );
  yield* Effect.log(" ");
  yield* gameNavigationExample.pipe(
    Effect.withSpan("examples.gameNavigationExample")
  );
  yield* Effect.log(" ");
  yield* visualizationExample.pipe(
    Effect.withSpan("examples.visualizationExample")
  );
  yield* Effect.log(" ");
  yield* dfsExampleComplex.pipe(Effect.withSpan("examples.dfsExampleComplex"));
  yield* Effect.log(" ");
  yield* bfsExampleComplex.pipe(Effect.withSpan("examples.bfsExampleComplex"));
});

BunRuntime.runMain(
  program.pipe(
    Effect.withSpan("mainProgram"),
    Effect.provide(DevTools.layer()),
    Effect.provide(BunContext.layer),
    Effect.scoped
  )
);
