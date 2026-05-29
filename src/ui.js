import { createTodo, createProjectManager} from "./todos.js";
import { format, parseISO } from "date-fns";
import { createIcons, Pencil, Trash2, Plus, ChevronDown, X} from "lucide";
import { saveToStorage } from "./storage.js";

const addTodoBtn = document.querySelector(".add-todo-btn");
const todoDialog = document.querySelector("#createTodoDialog");
const cancelBtn = document.querySelector(".cancel-btn");
const todoForm = document.querySelector(".todo-form");
const titleError = document.querySelector(".title-error");
const todoList = document.querySelector(".todo-list");
const projectList = document.querySelector(".project-list");
const addProjectBtn = document.querySelector(".add-project-btn");
const checklistDialog = document.querySelector("#checklistDialog");
const checklistItems = document.querySelector(".checklist-items");
const addChecklistItemBtn = document.querySelector(".add-checklist-item-btn");
const closeChecklistBtn = document.querySelector(".close-checklist-btn");
const filterSort = document.querySelector(".filter-sort");
const filterPriority = document.querySelector(".filter-priority");
const filterStatus = document.querySelector(".filter-status");
const hamburgerBtn = document.querySelector(".hamburger-btn");

let projectManager;
let editingTodo = null;
let currentChecklistTodo = null;

//only for wiring static elements that already exist in the HTML
function initEventListeners() {
    hamburgerBtn.addEventListener("click", () => {
        document.querySelector(".container").classList.toggle("sidebar-collapsed");
    })
    addTodoBtn.addEventListener("click", () => {
        todoDialog.showModal();
    })

    cancelBtn.addEventListener("click", () => {
        todoDialog.close();
    })

 
    filterPriority.addEventListener("change", () => {
            renderTodos(getFilteredTodos(
                projectManager.getActiveProject().getTodoCollection()
            ));
    })

    filterStatus.addEventListener("change", () => {
            renderTodos(getFilteredTodos(
                projectManager.getActiveProject().getTodoCollection()
            ));
    })

    filterSort.addEventListener("change", () => {
            renderTodos(getFilteredTodos(
                projectManager.getActiveProject().getTodoCollection()
            ));
    })


    addProjectBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("project-name-input");
        input.placeholder = "Project name...";

        addProjectBtn.replaceWith(input);
        input.focus();

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const name = input.value.trim();
                if(name) {
                    const result = projectManager.addProject(name);
                    if(result.success) {
                        saveToStorage(projectManager);
                        renderProjects(projectManager.getProjects());
                    } else {
                        showToast(result.message);
                    }
                }
            }

            if (e.key === "Enter" || e.key === "Escape") {
                input.replaceWith(addProjectBtn);
            }
        })
    })

    closeChecklistBtn.addEventListener("click", () => {
            checklistDialog.close();
        })

    addChecklistItemBtn.addEventListener("click", (e) => {
            
            const checklistInput = document.createElement("input");
            checklistInput.classList.add("new-checklist-input");
            checklistInput.type = "text";
            checklistInput.placeholder = "Enter new item...";
            addChecklistItemBtn.replaceWith(checklistInput);
            checklistInput.focus();

            checklistInput.addEventListener("keydown", (e) => {
                if(e.key === "Enter") {
                    const text = checklistInput.value.trim();
                    if (text) {
                        currentChecklistTodo.addCheckListItem(text);
                        saveToStorage(projectManager);
                        renderChecklist(currentChecklistTodo);
                    }
                    checklistInput.replaceWith(addChecklistItemBtn);
                }

                if (e.key === "Escape") {
                    checklistInput.replaceWith(addChecklistItemBtn);
                }
            })
            
        })

    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(todoForm);
        const title = formData.get("title");
        const description = formData.get("description");
        const priority = formData.get("priority");
        const dueDate = formData.get("dueDate");
        const dueTime = formData.get("dueTime");
        const notes = formData.get("notes");

        if(title.trim() === "") {
            titleError.classList.add("visible");
            return;
        }

        const activeProject = projectManager.getActiveProject();
        if (editingTodo) {
            editingTodo.setTitle(title);
            editingTodo.setDescription(description);
            editingTodo.setPriority(priority);
            editingTodo.setDueDate(dueDate);
            editingTodo.setDueTime(dueTime);
            editingTodo.setNotes(notes);
            editingTodo = null;
        } else {
            const newTodo = createTodo(title, priority, description, dueDate, dueTime, notes);
            activeProject.addTodo(newTodo);
        }
        saveToStorage(projectManager);
        
        
        renderTodos(getFilteredTodos(activeProject.getTodoCollection()));

        todoForm.reset();
        titleError.classList.remove("visible");
        todoDialog.close();
    })


}

function getFilteredTodos(todos) {
    const priorityFilter = filterPriority.value;
    const statusFilter = filterStatus.value;
    const sortFilter = filterSort.value;

    let filtered = [...todos];

    if (priorityFilter !== "all") {
        filtered = filtered.filter(todo => todo.getPriority() === priorityFilter);
    }

    if(statusFilter === "pending") {
        filtered = filtered.filter(todo => !todo.getCompletionStatus())
    } else if (statusFilter === "completed") {
        filtered = filtered.filter(todo => todo.getCompletionStatus())
    }

    filtered.sort((a, b) => {
        const dateA = a.getDueDate();
        const dateB = b.getDueDate();

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        if(sortFilter === "ascending") {
            return dateA > dateB ? 1 : -1;
        } else {
            return dateA < dateB ? 1 : -1;
        }
    })

    return filtered;
}

function renderTodos(todos) {
    todoList.replaceChildren();
    for(const todo of todos) {
        const title = todo.getTitle();
        const priority = todo.getPriority();
        const description = todo.getDescription();
        const dueDate = todo.getDueDate()
        ? format(parseISO(todo.getDueDate()), "MMM d, yyyy") : "";
        const dueTime = todo.getDueTime()
        ? format(parseISO(`2000-01-01T${todo.getDueTime()}`), "h:mm a") : "";
        const notes = todo.getNotes();

        const todoListItem = document.createElement("li");
        todoListItem.classList.add("todo-item");
        todoListItem.classList.add(`priority-${priority}`);
        if (todo.getCompletionStatus()) {
            todoListItem.classList.add("completed");
        }
        const colorTab = document.createElement("div");
        colorTab.classList.add("color-tab");

        const checkboxStatus = document.createElement("input");
        checkboxStatus.type = "checkbox";
        checkboxStatus.checked = todo.getCompletionStatus();
        checkboxStatus.addEventListener("click", (event) => {
            event.stopPropagation();
            todo.complete();
            saveToStorage(projectManager);
            showToast(todo.getCompletionStatus() ? "Task completed!" : "Task reopened!");
            renderTodos(getFilteredTodos(projectManager.getActiveProject().getTodoCollection()));
        })

        const titleSpan = document.createElement("span");
        titleSpan.classList.add("todo-title");
        titleSpan.textContent = title;
        const dueDateSpan = document.createElement("span");
        dueDateSpan.classList.add("todo-due-date");
        dueDateSpan.textContent = dueDate;
        const dueTimeSpan = document.createElement("span");
        dueTimeSpan.classList.add("todo-due-time");
        dueTimeSpan.textContent = dueTime;

        const editButton = document.createElement("button");
        editButton.classList.add("edit-btn");
        editButton.innerHTML = '<i data-lucide="pencil"></i>';
        editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            editingTodo = todo;
            prefillForm(todo);
            todoDialog.showModal();
            
        })

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            projectManager.getActiveProject().removeTodo(todo.id);
            saveToStorage(projectManager);
            renderTodos(getFilteredTodos(projectManager.getActiveProject().getTodoCollection()));
        })

        todoListItem.addEventListener("click", () => {
            const isExpanded = todoListItem.classList.toggle("expanded");
            if(isExpanded) {
                const expandedContent = document.createElement("div");
                expandedContent.classList.add("expanded-content");

                const priorityLabel = document.createElement("span");
                priorityLabel.classList.add("priority-label");
                priorityLabel.textContent = priority.toUpperCase();

                const descriptionContent = document.createElement("p");
                descriptionContent.textContent = description || "";

                const notesContent = document.createElement("p");
                notesContent.textContent = notes || "";
                
                const checkListButton = document.createElement("button");
                checkListButton.innerHTML = '<i data-lucide="plus"></i> Checklist';

                checkListButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    currentChecklistTodo = todo;
                    renderChecklist(todo);
                    checklistDialog.showModal();
                })

                expandedContent.appendChild(priorityLabel);
                expandedContent.appendChild(descriptionContent);
                expandedContent.appendChild(notesContent);
                expandedContent.appendChild(checkListButton);
                todoListItem.appendChild(expandedContent);
            }else {
                todoListItem.querySelector(".expanded-content").remove();
            }
        })

        
        todoListItem.appendChild(colorTab);
        todoListItem.appendChild(checkboxStatus);
        todoListItem.appendChild(titleSpan);
        todoListItem.appendChild(dueDateSpan);
        todoListItem.appendChild(dueTimeSpan);
        todoListItem.appendChild(editButton);
        todoListItem.appendChild(deleteButton);
        todoList.appendChild(todoListItem);

    }
    createIcons({ icons: {Pencil, Trash2, Plus, ChevronDown, X}});
}

function renderProjects(projects) {
    projectList.replaceChildren();
    const activeProject = projectManager.getActiveProject();
    for(const project of projects) {
        const projectListItem = document.createElement("li");
        projectListItem.textContent = `${project.getName()}`;
        projectListItem.dataset.id = project.id;

        if (project.id === activeProject.id) {
            projectListItem.classList.add("active");
        }

        projectListItem.addEventListener("click", () => {
            projectManager.setActiveProject(project.id);
            renderProjects(projectManager.getProjects());
            renderTodos(getFilteredTodos(projectManager.getActiveProject().getTodoCollection()));
        })

        if (!project.isDefaultProject()) {
            const deleteProjectBtn = document.createElement("button");
            deleteProjectBtn.innerHTML = '<i data-lucide="x"></i>';
            deleteProjectBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                projectManager.removeProject(project.id);
                saveToStorage(projectManager);
                renderProjects(projectManager.getProjects());
                renderTodos(getFilteredTodos(projectManager.getActiveProject().getTodoCollection()));
            })
            projectListItem.appendChild(deleteProjectBtn);
        }
        projectList.appendChild(projectListItem);
        
    }
    createIcons({ icons: {Pencil, Trash2, Plus, ChevronDown, X}});
}

function renderChecklist(todo) {
    checklistItems.replaceChildren();
    const checklist = todo.getCheckList();

    for (const item of checklist) {
        const checkboxDone = document.createElement("input");
        checkboxDone.type ="checkbox";
        checkboxDone.checked = item.getDone();
        checkboxDone.addEventListener("click", () => {
            todo.toggleCheckListItem(item.id);
            saveToStorage(projectManager);
        })

        const deleteItemBtn = document.createElement("button");
        deleteItemBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteItemBtn.addEventListener("click", () => {
            todo.removeCheckListItem(item.id);
            saveToStorage(projectManager);
            renderChecklist(todo);
        })
        const textSpan = document.createElement("span");
        textSpan.textContent = item.getText();
        const checkListItem = document.createElement("li");

        const input = document.createElement("input");
        input.classList.add("checklist-item-input");
        textSpan.addEventListener("click", () => {
            textSpan.replaceWith(input);
            input.focus();

            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const currentItem = todo.getCheckList().find(i => i.id === item.id);
                    currentItem.setText(input.value);
                    textSpan.textContent = input.value;
                    saveToStorage(projectManager);
                    input.replaceWith(textSpan);
                }

                if(e.key === "Escape") {
                    input.replaceWith(textSpan);
                }
            })

        })
        checkListItem.appendChild(checkboxDone);
        checkListItem.appendChild(textSpan);
        checkListItem.appendChild(deleteItemBtn);
        checklistItems.appendChild(checkListItem);
    }
    createIcons({ icons: {Pencil, Trash2, Plus, ChevronDown, X}});
}

function prefillForm(todo) {
    const fields = {
        title: todo.getTitle(),
        description: todo.getDescription() || "",
        priority: todo.getPriority(),
        dueDate: todo.getDueDate() || "",
        dueTime: todo.getDueTime() || "",
        notes: todo.getNotes() || ""
    };

    Object.entries(fields).forEach(([key, value]) => {
        todoForm.elements[key].value = value;
    });
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000)
}

function init(pm) {
    projectManager = pm;
    initEventListeners();
    renderProjects(projectManager.getProjects());
}

export { init };
