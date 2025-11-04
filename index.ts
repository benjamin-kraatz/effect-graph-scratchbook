import { DevTools } from "@effect/experimental";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph, Option } from "effect";

type FriendshipWeight = number;
type Person = { name: string; age: number; weight: FriendshipWeight };
type Task = { id: string; description: string; duration: number };

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
});

BunRuntime.runMain(
  program.pipe(
    Effect.withSpan("mainProgram"),
    Effect.provide(DevTools.layer()),
    Effect.provide(BunContext.layer),
    Effect.scoped
  )
);
