import fs from "fs";
const FILE_PATH = "./data/picks.json";
export function getPicks() {
  return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
}
export function savePicks(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}
