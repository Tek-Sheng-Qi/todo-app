import "./styles.css";
import { createProjectManager } from "./todos.js";
import { loadFromStorage, saveToStorage } from "./storage.js";
import { init } from "./ui.js";

const projectManager = loadFromStorage() || createProjectManager();
console.log(projectManager);
init(projectManager);