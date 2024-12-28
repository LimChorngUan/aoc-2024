import { findIndex, sum } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();

type Coord = [number, number]; // y, x

const findCoord = (s: string, map: string[][]): Coord => {
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[0].length; x++) {
			if (map[y][x] === s) return [y, x];
		}
	}
	return [-1, -1];
};

const MAZE: string[][] = text.split("\n").map((line) => line.split(""));

// Path includes start and end coords
const getPath = (maze: string[][]) => {
	const start = findCoord("S", maze);
	const end = findCoord("E", maze);
	const path: Coord[] = [start];
	let [currY, currX] = path[path.length - 1];
	let stop = false;

	while (!stop) {
		const next: Coord = [
			[currY + 1, currX] as Coord,
			[currY - 1, currX] as Coord,
			[currY, currX - 1] as Coord,
			[currY, currX + 1] as Coord,
		].filter(
			([nextY, nextX]) =>
				maze[nextY][nextX] === "." &&
				!path.map((p) => p.join(",")).includes([nextY, nextX].join(",")),
		)[0]; // only have one path
		if (next) {
			path.push(next);
			currY = next[0];
			currX = next[1];
		} else {
			stop = true;
		}
	}

	path.push(end);

	return path;
};

const coordToStr = (coord: Coord): string => coord.join(",");

const findCheatCoords = (path: Coord[], d: number): [Coord, Coord][] => {
	const cheats: [Coord, Coord][] = [];

	for (let i = 0; i < path.length; i++) {
		for (let j = i + d; j < path.length; j++) {
			const curr = path[i];
			const target = path[j];

			const dy = Math.abs(curr[0] - target[0]);
			const dx = Math.abs(curr[1] - target[1]);

			if (dy + dx === d) {
				cheats.push([curr, target]);
			}
		}
	}

	return cheats;
};

const findSavedTime = (
	path: Coord[],
	[c1, c2]: [Coord, Coord],
	d: number,
): number => {
	const strPath = path.map(coordToStr);
	const [strC1, strC2] = [coordToStr(c1), coordToStr(c2)];

	const [i1, i2] = [
		findIndex((p) => p === strC1, strPath),
		findIndex((p) => p === strC2, strPath),
	];

	return i2 - i1 - d;
};

const getCheatMap = (
	path: Coord[],
	maxCheatAllowed: number,
	minSavedT: number,
): Map<number, number> => {
	const map: Map<number, number> = new Map();

	for (let i = 16; i <= maxCheatAllowed; i++) {
		const cheatCoords = findCheatCoords(path, i);
		// biome-ignore lint/complexity/noForEach: <explanation>
		cheatCoords.forEach(([c1, c2]) => {
			const k = findSavedTime(path, [c1, c2], i);
			const v = map.get(k);
			if (k >= minSavedT) {
				map.set(k, v ? v + 1 : 1);
			}
		});
	}

	return map;
};

const path = getPath(MAZE);

const p1 = sum(Array.from(getCheatMap(path, 2, 100).values()));
const p2 = sum(Array.from(getCheatMap(path, 20, 100).values()));

console.log("p1", p1);
console.log("p2", p2); // Slow :) 
