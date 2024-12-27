import { findIndex } from "ramda";

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

const MAZE = text.split("\n").map((line) => line.split(""));

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

const findCheatCoords = (path: Coord[]): [Coord, Coord][] => {
	const cheats: [Coord, Coord][] = [];

	for (let i = 0; i < path.length; i++) {
		const curr = path[i];
		for (let j = i + 1; j < path.length; j++) {
			const target = path[j];
			const between = path[j - 1];
			const dy = Math.abs(curr[0] - target[0]);
			const dx = Math.abs(curr[1] - target[1]);
			const dby = Math.abs(curr[0] - between[0]);
			const dbx = Math.abs(curr[1] - between[1]);
			if (
				(dy === 2 && dx === 0 && dby !== 1) ||
				(dx === 2 && dy === 0 && dbx !== 1)
			) {
				cheats.push([curr, target]);
			}
		}
	}

	return cheats;
};

const findSavedTime = (path: Coord[], [c1, c2]: [Coord, Coord]): number => {
	const strPath = path.map((p) => p.join(","));
	const [strC1, strC2] = [c1.join(","), c2.join(",")];

	const [i1, i2] = [
		findIndex((p) => p === strC1, strPath),
		findIndex((p) => p === strC2, strPath),
	];

	return i2 - i1 - 2;
};

const getCheatMap = (
	path: Coord[],
	cheatCoords: [Coord, Coord][],
): Map<number, number> => {
	const map: Map<number, number> = new Map();

	// biome-ignore lint/complexity/noForEach: <explanation>
	cheatCoords.forEach(([c1, c2]) => {
		const k = findSavedTime(path, [c1, c2]);
		const v = map.get(k);
		map.set(k, v ? v + 1 : 1);
	});

	return map;
};

const countCheats = (cheatMap: Map<number, number>, minT: number): number => {
	let sum = 0;

	for (const [savedTime, count] of cheatMap) {
		if (savedTime >= minT) sum += count;
	}

	return sum;
};

const path = getPath(MAZE);
const p1 = countCheats(getCheatMap(path, findCheatCoords(path)), 100);

console.log("p1", p1);
