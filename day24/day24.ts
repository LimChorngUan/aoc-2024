import { fromPairs, reverse } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();
const input = text.split("\n\n");

type Binary = 1 | 0;
type Gate = "AND" | "XOR" | "OR";
type WireVal = Record<string, Binary>;
type GateConnection = {
	in1: string;
	in2: string;
	out: string;
	gate: Gate;
};

const INIT_VALUES: WireVal = fromPairs(
	input[0]
		.split("\n")
		.map((line) => line.split(": "))
		.map((line) => [line[0], Number(line[1]) as Binary]),
);
const GATE_CONNECTIONS: GateConnection[] = input[1].split("\n").map((line) => {
	const c = line.split(" ");

	return {
		in1: c[0],
		in2: c[2],
		out: c[4],
		gate: c[1] as Gate,
	};
});

const gateOutput = (b1: Binary, b2: Binary, gate: Gate): Binary => {
	switch (gate) {
		case "AND":
			return (b1 & b2) as Binary;
		case "OR":
			return (b1 | b2) as Binary;
		case "XOR":
			return (b1 ^ b2) as Binary;
	}
};

const sortWires = (wires: string[]): string[] => {
	const compareFn = (w1: string, w2: string) => {
		const [a, b] = [Number(w1.slice(1)), Number(w2.slice(1))];
    if (a > b) return 1
    else if (a < b) return -1
    return 0
	};

	return reverse(wires.toSorted(compareFn));
};

const calc = (gateConnections: GateConnection[], wireVal: WireVal): number => {
	const wires = Object.keys(wireVal);

  if (gateConnections.length === 0) {
    let binaryStr = "";
    const zWires = wires.filter(wire => wire.startsWith("z"))
		sortWires(zWires).forEach((key) => {
			binaryStr = binaryStr.concat(wireVal[key].toString());
		});

		return Number.parseInt(binaryStr, 2);
  }

  const newWireVal: WireVal = {}
  const newGateConnections: GateConnection[] = []

  gateConnections.forEach((connection) => {
    const { in1, in2, gate, out } = connection
    if (wires.includes(in1) && wires.includes(in2)) {
      newWireVal[out] = gateOutput(wireVal[in1], wireVal[in2], gate)
    } else {
      newGateConnections.push(connection)
    }
  })

  // reduce the gate connections each time they have been evaluated
	return calc(newGateConnections, {...wireVal, ...newWireVal});
};

const p1 = calc(GATE_CONNECTIONS, INIT_VALUES)

console.log("p1", p1);
