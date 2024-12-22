import { sum, transpose } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();

const map: string[][] = text.split("\n").map((line) => line.split(""));

type Coord = [number, number];
type CoordStr = string; // y,x
type RegionKey = string; // A-y-x

const toCoordStr = (y: number, x: number): CoordStr => `${y},${x}`;
const toCoord = (s: CoordStr): Coord => s.split(",").map(Number) as Coord;
const toRegionKey = (r: string, y: number, x: number): RegionKey =>
	`${r}-${y}-${x}`;

const createRegionMap = (map: string[][]): Record<RegionKey, Coord[]> => {
	const coordRegionKeyMap: Record<CoordStr, RegionKey> = {};

	// first group row
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			const coordStr = toCoordStr(y, x);
			if (x === 0) {
				coordRegionKeyMap[coordStr] = toRegionKey(map[y][x], y, x);
				continue;
			}

			const prev = map[y][x - 1];
			const curr = map[y][x];

			if (curr !== prev) {
				coordRegionKeyMap[coordStr] = toRegionKey(map[y][x], y, x);
			} else {
				const prevCoordStr = toCoordStr(y, x - 1);
				coordRegionKeyMap[coordStr] = coordRegionKeyMap[prevCoordStr];
			}
		}
	}

	// then group by colomn
	for (let y = 1; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			const curr = map[y][x];
			const prev = map[y - 1][x];
			const currCoordStr = toCoordStr(y, x);
			const prevCoordStr = toCoordStr(y - 1, x);

			if (curr === prev) {
				const currRegionKey = coordRegionKeyMap[currCoordStr];
				const newRegionKey = coordRegionKeyMap[prevCoordStr];

				const connectedCoords: CoordStr[] = [];
				for (const [k, v] of Object.entries(coordRegionKeyMap)) {
					if (v === currRegionKey) connectedCoords.push(k);
				}

				// biome-ignore lint/complexity/noForEach: <explanation>
				connectedCoords.forEach((coordStr) => {
					coordRegionKeyMap[coordStr] = newRegionKey;
				});
			}
		}
	}

	// Convert coord -> regionKey to regionKey -> coords
	const regionMap: Record<RegionKey, Coord[]> = {};
	for (const [coordStr, key] of Object.entries(coordRegionKeyMap)) {
		const coord = toCoord(coordStr);

		if (!regionMap[key]) {
			regionMap[key] = [coord];
		} else {
			regionMap[key] = [...regionMap[key], coord];
		}
	}

	return regionMap;
};

const isConnect = ([x1, y1]: Coord, [x2, y2]: Coord): boolean => {
	const dx = Math.abs(x1 - x2);
	const dy = Math.abs(y1 - y2);
	return (dx === 1 && dy === 0) || (dy === 1 && dx === 0);
};

const countPerimiter = (region: Coord[]): number =>
	region.reduce((acc, curr) => {
		const rest: Coord[] = region.filter(
			([y, x]) => y !== curr[0] || x !== curr[1],
		);
		const connectPs: number = rest
			.map((coord) => isConnect(coord, curr))
			.filter(Boolean).length;

		return acc + (4 - connectPs);
	}, 0);

const countSides = (region: Coord[]): number => {
	if (region.length === 1) return 4;

	const ys = region.map(([y]) => y);
	const xs = region.map(([_, x]) => x);
	const yMax = Math.max(...ys) + 1;
	const xMax = Math.max(...xs) + 1;

	const map: string[][] = Array(yMax)
		.fill(null)
		.map(() => Array(xMax).fill("."));
	for (let i = 0; i < yMax + 1; i++) {
		for (let j = 0; j < xMax + 1; j++) {
			if (region.findIndex(([y, x]) => y === i && x === j) !== -1) {
				map[i][j] = "X";
			}
		}
	}

	const drawSides = (map: string[][]): number => {
		let sides = 0;

		for (let i = 0; i < map.length; i++) {
			let hasLine = false;

			for (let j = 0; j < map[i].length; j++) {
				const curr = map[i][j];

				if (i === 0) {
					if (curr === "X" && !hasLine) {
						sides++;
						hasLine = true;
					}
					if (curr !== "X") {
						hasLine = false;
					}
				} else {
					const isEdge = curr !== map[i - 1][j];

					if (isEdge && !hasLine) {
						sides++;
						hasLine = true;
					} // if up and down is the same
					else if (i > 0 && curr === map[i - 1][j]) {
						hasLine = false;
					} // AB
					// BA
					else if (
						i > 0 &&
						curr !== map[i - 1][j] &&
						map[i][j + 1] !== map[i - 1][j + 1] &&
						curr !== map[i][j + 1] &&
						map[i - 1][j] !== map[i - 1][j + 1]
					) {
						hasLine = false;
					} else if (i === 0 && curr === "X" && map[i][j + 1] === ".") {
						hasLine = false;
					}
				}
			}
		}

		// Last line
		const lastRow = map[map.length - 1];
		let hasLine = false;

		for (let i = 0; i < lastRow.length; i++) {
			if (lastRow[i] === "X" && !hasLine) {
				sides++;
				hasLine = true;
			}
			if (lastRow[i] !== "X") {
				hasLine = false;
			}
		}

		return sides;
	};

	const rowSides = drawSides(map);
	const colSides = drawSides(transpose(map));

	return rowSides + colSides;
};

const regionMap = createRegionMap(map);

// const p1 = sum(
// 	Object.values(regionMap).map(
// 		(region) => region.length * countPerimiter(region),
// 	),
// );

const p2 = sum(
	Object.values(regionMap).map((region) => {
		const ys = region.map(([y]) => y);
		const xs = region.map(([_, x]) => x);
		const yMin = Math.min(...ys);
		const xMin = Math.min(...xs);

		const offsetRegion = region.map(([y, x]) => [y - yMin, x - xMin] as Coord);

		return region.length * countSides(offsetRegion);
	}),
);

// const p2 = Object.values(regionMap).map((region) => {
// 	const ys = region.map(([y]) => y);
// 	const xs = region.map(([_, x]) => x);
// 	const yMin = Math.min(...ys);
// 	const xMin = Math.min(...xs);

// 	const offsetRegion = region.map(([y, x]) => [y - yMin, x - xMin] as Coord);

// 	return countSides(offsetRegion);
// });

// console.log("p1", p1);
console.log("p2", p2);
