import { transpose } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();
const input = text.split("\n").map((line) => line.split("-"));

const CONNECTION_MAP: Map<string, string[]> = new Map();
const setNewV = (k: string, newV: string) => {
	const v = CONNECTION_MAP.get(k);
	if (v) {
		CONNECTION_MAP.set(k, [...v, newV]);
	} else {
		CONNECTION_MAP.set(k, [newV]);
	}
};
for (let i = 0; i < input.length; i++) {
	const [k1, k2] = input[i];

	setNewV(k1, k2);
	setNewV(k2, k1);
}

const areAllConnected = (
	connectionMap: Map<string, string[]>,
	group: string[],
): boolean => {
	for (let i = 0; i < group.length; i++) {
		const curr = group[i];
		const rest = Array.from(new Set(group.filter((_, j) => j !== i)));

		if (rest.some((k) => !connectionMap.get(k)?.includes(curr))) return false;
	}

	return true;
};

const findConnectedGroups = (
	connectionMap: Map<string, string[]>,
	n: number,
): string[][] => {
	let all: string[][] = transpose([Array.from(connectionMap.keys())]);

	for (let i = 1; i < n; i++) {
		const newGroups: string[][] = [];

		for (let j = 0; j < all.length; j++) {
			const updated: string[][] = [];
			const curr = all[j];
			const k = curr[curr.length - 1];
			const vs = connectionMap.get(k);

			if (vs) {
				// biome-ignore lint/complexity/noForEach: <explanation>
				vs.forEach((v) => {
					const newGroup = [...curr, v];
					if (areAllConnected(connectionMap, newGroup)) {
						updated.push(newGroup);
					}
				});
			}

			newGroups.push(...updated);
		}

		const dedup = Array.from(
			new Set(newGroups.map((c) => c.toSorted().join(","))),
		).map((c) => c.split(","));

		all = dedup;
	}

	return all;
};

const findLargestGroup = (
	connectionMap: Map<string, string[]>,
	initN: number,
): string => {
	let n = initN;
	let stop = false;
	let groups: string[][] = [];

	while (!stop) {
		const newGroups = findConnectedGroups(connectionMap, n);
		if (newGroups.length === 0) {
			stop = true;
		} else {
			groups = newGroups;
			n++;
		}
	}

	return groups.flat().join(",");
};

const p1 = findConnectedGroups(CONNECTION_MAP, 3).filter((group) =>
	group.some((c) => c.startsWith("t")),
).length;
const p2 = findLargestGroup(CONNECTION_MAP, 10);

console.log("p1", p1);
console.log("p2", p2);
