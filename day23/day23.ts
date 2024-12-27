import { init, transpose, intersection, last } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();
const input = text.split("\n").map((line) => line.split("-"));

const connectionMap: Map<string, string[]> = new Map();
const setNewV = (k: string, newV: string) => {
	const v = connectionMap.get(k);
	if (v) {
		connectionMap.set(k, [...v, newV]);
	} else {
		connectionMap.set(k, [newV]);
	}
};
for (let i = 0; i < input.length; i++) {
	const [k1, k2] = input[i];

	setNewV(k1, k2);
	setNewV(k2, k1);
}

const findGroups = (connectionMap: Map<string, string[]>): string[] => {
	let all: string[][] = transpose([Array.from(connectionMap.keys())]);

	for (let i = 0; i < 3; i++) {
		const newSets: string[][] = [];

		for (let j = 0; j < all.length; j++) {
			const updated: string[][] = [];
			const curr = all[j];
			const k = curr[curr.length - 1];
			const vs = connectionMap.get(k);

			if (vs) {
				// biome-ignore lint/complexity/noForEach: <explanation>
				vs.forEach((v) => {
					updated.push([...curr, v]);
				});
			}

			newSets.push(...updated);
		}

		all = newSets;
	}

	const foundSets = Array.from(
		new Set(
			all
				.filter((c) => new Set(c).size === c.length - 1)
				.filter((c) => c[0] === c[c.length - 1])
				.map((c) => init(c))
				.map((c) => c.toSorted().join(","))
				.filter((c) => c.split(",").some((s) => s.startsWith("t"))),
		),
	);

	return foundSets;
};

const isInterconnect = (groups: string[][]): boolean => {
	for (let i = 0; i < groups.length; i++) {
		const curr = groups[i];
		const rest = Array.from(new Set(groups.filter((_, j) => j !== i).flat()));

		if (curr.some((c) => !rest.includes(c))) return false;
	}

	return true;
};

const findBiggestGroup = (groups: string[][]): string[][] => {
	let biggestGroup: string[][] = [];

	for (let i = 0; i < groups.length - 1; i++) {
		const curr = groups[i];
		const group = [curr];
		for (let j = i + 1; j < groups.length - 1; j++) {
			const next = groups[j];

			if (intersection(curr, next).length === 2) {
				group.push(next);
			}
		}

		if (isInterconnect(group) && group.length > biggestGroup.length) {
			biggestGroup = group;
		}
	}

	return biggestGroup;
};

// const p1 = findGroups(connectionMap).length;
// const p2 = Array.from(
// 	new Set(
// 		findBiggestGroup(
// 			findGroups(connectionMap).map((group) => group.split(",")),
// 		).flat(),
// 	),
// )
// 	.toSorted()
// 	.join(",");

// console.log("p1", p1);
// console.log("p2", p2);

console.log(connectionMap)
