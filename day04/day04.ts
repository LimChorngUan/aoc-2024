// roll eyes
// The perfect example of over engineering
import { map, reverse, transpose, compose, splitAt } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();

const matrix: string[][] = text.split("\n").map((line) => line.split(""));

const flipHorizontal = map(reverse);
const diagonalLeft = (matrix: string[][]): string[][] =>
	matrix.map((row, i) => row.map((_, j) => matrix[(i + j) % row.length][j]));
const diagonalRight = (matrix: string[][]): string[][] =>
	matrix.map((row, i) =>
		row.map(
			(_, j) => matrix[(i + j + row.length) % row.length][row.length - 1 - j],
		),
	);
const splitDiagonal = (matrix: string[][]): string[][] =>
	matrix.flatMap((row, i) => splitAt(row.length - i, row));

const transforms = [
	(matrix: string[][]) => matrix,
	flipHorizontal,
	transpose,
	compose(flipHorizontal, transpose),
	compose(splitDiagonal, diagonalLeft),
	compose(flipHorizontal, splitDiagonal, diagonalLeft),
	compose(splitDiagonal, diagonalRight),
	compose(flipHorizontal, splitDiagonal, diagonalRight),
];

const p1 = transforms
	.flatMap((transform) => transform(matrix).map((line) => line.join("")))
	.map((str) => str.match(/(XMAS)/g))
	.filter(Boolean)
	.flat().length;

console.log("p1", p1);

// ---------------------------------------------------

// Part 2
// Solution from Part 1 is not useful for part 2, but I still wanna
// keep my over-engineering part 1 solution

const hasMas = (input: string[][], y: number, x: number, dir: "lr" | "rl") => {
	let str = "";
	if (dir === "lr") {
		str = input[y][x].concat(input[y + 1][x + 1], input[y + 2][x + 2]);
	} else {
		str = input[y][x].concat(input[y + 1][x - 1], input[y + 2][x - 2]);
	}

	return str === "MAS" || str === "SAM";
};

let xMasCount = 0;

for (let y = 0; y < matrix.length - 2; y++) {
	for (let x = 0; x < matrix.length - 2; x++) {
		if (hasMas(matrix, y, x, "lr") && hasMas(matrix, y, x + 2, "rl")) {
			xMasCount++;
		}
	}
}

console.log("p2", xMasCount);
