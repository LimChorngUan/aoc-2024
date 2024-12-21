import { sum } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();
const map = text.split("\n").map((line) => line.split("").map(Number));

type Coord = [number, number];

const findTrailheads = (map: number[][]): Coord[] => {
	const trailheads: Coord[] = [];

	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map.length; j++) {
			if (map[i][j] === 0) trailheads.push([i, j]);
		}
	}

	return trailheads;
};

const findHikingTrails = (map: number[][], trails: Coord[][]): Coord[][] => {
	const updatedTrails: Coord[][] = [];

	// biome-ignore lint/complexity/noForEach: <explanation>
	trails.forEach((trail) => {
		const [y, x] = trail[trail.length - 1];
		const connections = [
			[y - 1, x] as Coord,
			[y + 1, x] as Coord,
			[y, x - 1] as Coord,
			[y, x + 1] as Coord,
		]
			.filter(
				([yNext, xNext]) =>
					!(
						yNext < 0 ||
						xNext < 0 ||
						yNext >= map.length ||
						xNext >= map[0].length
					),
			)
			.filter(([yNext, xNext]) => map[yNext][xNext] - map[y][x] === 1);

		// biome-ignore lint/complexity/noForEach: <explanation>
		connections.forEach((connection) =>
			updatedTrails.push([...trail, connection]),
		);
	});

	if (updatedTrails.length === 0) return [];
	if (
		updatedTrails.every((trail) => {
			const [yLast, xLast] = trail[trail.length - 1];

			return map[yLast][xLast] === 9;
		})
	) {
		return updatedTrails;
	}

	return findHikingTrails(map, updatedTrails);
};

const countScore = (allPossibleTrails: Coord[][]): number =>
	new Set(allPossibleTrails.map((trail) => trail[trail.length - 1].join(",")))
		.size;

const trailheads = findTrailheads(map);

const p1 = sum(
	trailheads.map((head) => countScore(findHikingTrails(map, [[head]]))),
);
const p2 = sum(
	trailheads.map((head) => findHikingTrails(map, [[head]]).length),
);

console.log("p1", p1);
console.log("p2", p2);
