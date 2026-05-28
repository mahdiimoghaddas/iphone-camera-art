import fs from "fs";
import path from "path";

const MODEL_URL =
  "https://storage.googleapis.com/tfjs-models/savedmodel/ssd_mobilenet_v2/model.json";

const OUT_DIR = path.join(process.cwd(), "models", "coco-ssd");

async function download(url, outPath) {
  console.log("Downloading:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);

  console.log("Saved:", outPath);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const modelJsonPath = path.join(OUT_DIR, "model.json");

  await download(MODEL_URL, modelJsonPath);

  const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, "utf8"));
  const baseUrl = MODEL_URL.substring(0, MODEL_URL.lastIndexOf("/") + 1);

  const paths = new Set();

  for (const group of modelJson.weightsManifest) {
    for (const filePath of group.paths) {
      paths.add(filePath);
    }
  }

  for (const filePath of paths) {
    const fileUrl = baseUrl + filePath;
    const outPath = path.join(OUT_DIR, filePath);
    await download(fileUrl, outPath);
  }

  console.log("Model downloaded completely.");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});