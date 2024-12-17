import { uniqWith, equals } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();
const maze = text.split("\n").map((line) => line.split(""));

type Coord = [number, number];
type Dir = "hor" | "ver";

let START: Coord = [0, 0];
let END: Coord = [0, 0];

for (let y = 0; y < maze.length; y++) {
	for (let x = 0; x < maze[0].length; x++) {
		const curr = maze[y][x];

		if (curr === "S") {
			START = [y, x];
			break;
		}
		if (curr === "E") {
			END = [y, x];
			break;
		}
	}
}

const findPossiblePaths = (
	paths: Coord[][],
	targetScore?: number | undefined,
): Coord[][] => {
	const newPaths: Coord[][] = [];

	for (let i = 0; i < paths.length; i++) {
		const currPath = paths[i];
		const [y, x]: Coord = currPath[currPath.length - 1];
		if (y === END[0] && x === END[1]) {
			newPaths.push(currPath);
			continue;
		}

		const connections = [
			[y - 1, x] as Coord,
			[y + 1, x] as Coord,
			[y, x - 1] as Coord,
			[y, x + 1] as Coord,
		].filter(([yNext, xNext]) => {
			const notBlocker = maze[yNext][xNext] !== "#";
			const hasSeen = currPath.some(
				(coord) => coord[0] === yNext && coord[1] === xNext,
			);

			return notBlocker && !hasSeen;
		});

		// biome-ignore lint/complexity/noForEach: <explanation>
		connections.forEach((connection) =>
			newPaths.push([...currPath, connection]),
		);
	}

	if (
		newPaths.every((path) => {
			const [endY, endX] = path[path.length - 1];
			return endY === END[0] && endX === END[1];
		})
	) {
		return newPaths;
	}
  // TODO: Refactor
	if (!targetScore) return findPossiblePaths(newPaths);

	const filteredPaths = newPaths.filter(
		(path) => countScore(path) <= targetScore,
	);

	return findPossiblePaths(filteredPaths, targetScore);
};

const countScore = (path: Coord[]): number => {
	let dir: Dir = "hor";
	let sum = 0;

	for (let i = 0; i < path.length - 1; i++) {
		const [y1, x1] = path[i];
		const [y2, x2] = path[i + 1];
		const dy = Math.abs(y1 - y2);
		const dx = Math.abs(x1 - x2);

		if (dir === "hor") {
			if (dy === 0 && dx === 1) sum += 1;
			else {
				sum += 1001;
				dir = "ver";
			}
		} else if (dir === "ver") {
			if (dy === 1 && dx === 0) sum += 1;
			else {
				sum += 1001;
				dir = "hor";
			}
		}
	}

	return sum;
};

const p1 = Math.min(
	...findPossiblePaths([[START]]).map((path) => countScore(path)),
);
const p2 = uniqWith(equals, findPossiblePaths([[START]], p1).flat()).length;

console.log("p1", p1);
console.log("p2", p2);
