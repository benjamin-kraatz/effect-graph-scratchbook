import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph } from "effect";

type Engineer = { kind: "Engineer"; name: string };
type Project = { kind: "Project"; name: string };

const engineers = [
  { kind: "Engineer", name: "Alice" },
  { kind: "Engineer", name: "Bob" },
  { kind: "Engineer", name: "Carol" },
] as const;

const projects = [
  { kind: "Project", name: "Website" },
  { kind: "Project", name: "Mobile App" },
  { kind: "Project", name: "Infra" },
] as const;

const program = Effect.gen(function* () {
  const g = Graph.mutate(
    Graph.directed<Engineer | Project, undefined>(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      // Add nodes and store their indices
      for (const e of engineers) nodeMap.set(e.name, Graph.addNode(mutable, e));
      for (const p of projects) nodeMap.set(p.name, Graph.addNode(mutable, p));

      // Helper function to get node index safely
      const getNode = (name: string) => {
        const node = nodeMap.get(name);
        if (node === undefined) throw new Error(`Node ${name} not found`);
        return node;
      };

      // Add edges representing who can work on what
      Graph.addEdge(mutable, getNode("Alice"), getNode("Website"), undefined);
      Graph.addEdge(
        mutable,
        getNode("Alice"),
        getNode("Mobile App"),
        undefined
      );
      Graph.addEdge(mutable, getNode("Bob"), getNode("Website"), undefined);
      Graph.addEdge(mutable, getNode("Bob"), getNode("Infra"), undefined);
      Graph.addEdge(mutable, getNode("Carol"), getNode("Infra"), undefined);
    }
  );

  yield* Effect.log(g.toString());
});

BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));
