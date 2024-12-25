import { partition, transpose } from "ramda";

const file = Bun.file("input.txt");
const text = await file.text();

const getPin = (input: string[]) => input
  .map(line => line.split("\n")
  .map(line => line.split("")))
  .map(block => transpose(block))
  .map(block => block.map(pins => pins.filter(pin => pin === "#").length - 1))

const checkFit = (lock: number[], key: number[]) =>
  lock.every((pin, i) => pin + key[i] <= 5)

const [locksInput, keysInput] = partition((el) => el.startsWith("#"), text.split("\n\n"))
const locks = getPin(locksInput)
const keys = getPin(keysInput)

const p1 = locks.reduce((acc, lock) =>
  acc + keys.filter(key => checkFit(lock, key)).length
, 0)

console.log("p1", p1)