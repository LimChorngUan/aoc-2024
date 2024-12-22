import { sum, aperture } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();
const input: number[] = text.split("\n").map(Number);

const mix = (n1: number, n2: number): number => Number(BigInt(n1) ^ BigInt(n2));
const prune = (n: number): number => n % 16777216;

const calNextSecret = (s0: number): number => {
	const s1 = prune(mix(s0 * 64, s0));
	const s2 = prune(mix(Math.floor(s1 / 32), s1));
	const s3 = prune(mix(s2 * 2048, s2));

	return s3;
};

const calNthSecrect = (s: number, n: number): number => {
	let secret = s;
	for (let i = 0; i < n; i++) {
		secret = calNextSecret(secret);
	}
	return secret;
};

const secretToPrice = (s: number): number =>
	Number(s.toString()[s.toString().length - 1]);

type SequencePriceMap = Record<string, number>;
const createSequencePriceMap = (s: number, n: number): SequencePriceMap => {
	const prices: number[] = [secretToPrice(s)];
	const map: SequencePriceMap = {};

	let secret = s;
	for (let i = 0; i < n; i++) {
		const newSecret = calNextSecret(secret);

		prices.push(secretToPrice(newSecret));
		secret = newSecret;
	}

	const SEQ_WINDOW = 4;

	const diffs = aperture(2, prices).map(([a, b]) => b - a);
	const seqs = aperture(SEQ_WINDOW, diffs);

	seqs.forEach((seq, i) => {
		const key = seq.join(",");
		if (!map[key]) {
			map[key] = prices[i + SEQ_WINDOW];
		}
	});

	return map;
};

const findLargest = (spMaps: SequencePriceMap[]): number => {
	const allPossibleSequences: string[] = Array.from(
		new Set(spMaps.flatMap((spMap) => Object.keys(spMap))),
	);

	let largest = 0;

	// biome-ignore lint/complexity/noForEach: <explanation>
	allPossibleSequences.forEach((sequence) => {
		const curr = sum(spMaps.map((spMap) => spMap[sequence] ?? 0));

		if (curr > largest) largest = curr;
	});

	return largest;
};

const p1 = sum(input.map((s) => calNthSecrect(s, 2000)));
const p2 = findLargest(input.map((s) => createSequencePriceMap(s, 2000)));

console.log("p1", p1);
console.log("p2", p2);
