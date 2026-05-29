import { todoToJSON, loadTodo, collectionManager, createProjectManager } from "./todos.js";

const STORAGE_KEY = "projectManager";

function saveToStorage(projectManager) {
    const data = {
        projects: projectManager.getProjects().map(project => ({
            id: project.id,
            name: project.getName(),
            isDefault: project.isDefaultProject(),
            todos: project.getTodoCollection().map(todo => todoToJSON(todo))
        })),
        activeProjectId: projectManager.getActiveProject().id
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data) return null;

    const newProjectManager = createProjectManager(true);
    for (const projectData of data.projects) {
        newProjectManager.loadProject(projectData.name, projectData.isDefault, projectData.id);

        const project = newProjectManager.getProjects().find(p => p.id === projectData.id);
        projectData.todos.forEach(todoData => {
            project.addTodo(loadTodo(todoData));
        });
    }

    newProjectManager.setActiveProject(data.activeProjectId);

    return newProjectManager;
}

export { saveToStorage, loadFromStorage };