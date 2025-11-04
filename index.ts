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
});

BunRuntime.runMain(
  program.pipe(
    Effect.withSpan("mainProgram"),
    Effect.provide(DevTools.layer()),
    Effect.provide(BunContext.layer),
    Effect.scoped
  )
);
