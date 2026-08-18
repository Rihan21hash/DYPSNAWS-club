import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function getFilePath(type) {
  const files = {
    events: "events.json",
    team: "team.json",
    certifications: "certifications.json",
    quizzes: "quizzes.json",
    admin: "admin.json",
  };
  if (!files[type]) throw new Error(`Unknown data type: ${type}`);
  return path.join(DATA_DIR, files[type]);
}

export function readData(type) {
  try {
    const filePath = getFilePath(type);
    if (!fs.existsSync(filePath)) {
      if (type === "team") return { members: [], contributors: [] };
      return [];
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${type} data:`, err.message);
    return type === "team" ? { members: [], contributors: [] } : [];
  }
}

export function writeData(type, data) {
  try {
    const filePath = getFilePath(type);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${type} data:`, err.message);
    return false;
  }
}

export function getAdmin() {
  return readData("admin");
}

export function setAdmin(data) {
  return writeData("admin", data);
}

export function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}
