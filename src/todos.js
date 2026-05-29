function createTodo(title, priority, description = null, dueDate = null, dueTime = null, notes = null, id = crypto.randomUUID()) {
    const _id = id;

    let _title = title;
    let _priority = priority;
    let _description = description;
    let _dueDate = dueDate;
    let _dueTime = dueTime;
    let _notes = notes;
    let checklist = [];
    let completionStatus = false;
    
    const getTitle = () => _title;
    const setTitle = (newTitle) => {_title = newTitle};

    const getPriority = () => _priority;
    const setPriority = (newPriority) => {_priority = newPriority};

    const getDescription = () => _description;
    const setDescription = (newDescription) => {_description = newDescription};

    const getDueDate = () => _dueDate;
    const setDueDate = (newDueDate) =>{_dueDate = newDueDate};

    const getDueTime = () => _dueTime;
    const setDueTime = (newDueTime) => {_dueTime = newDueTime};

    const getNotes = () => _notes;
    const setNotes = (newNotes) => {_notes = newNotes};

    const getCheckList = () => checklist;

    const getCompletionStatus = () => completionStatus;
    function complete() {completionStatus = !completionStatus};

    function addCheckListItem(text) {
        const item = createCheckListItem(text);
        checklist.push(item);
    }

    function loadCheckListItem(checklistItem) {
        checklist.push(checklistItem);
    }

    function removeCheckListItem(id) {
        const newArray = checklist.filter((item) => item.id !== id);
        checklist = newArray;
    }

    function toggleCheckListItem(id) {
        const item = checklist.find((item) => item.id === id);
        if (item) {
            item.toggleStatus();
        }
    }

    return { id: _id, getTitle, setTitle, getPriority, setPriority, getDescription, setDescription, 
        getDueDate, setDueDate, getDueTime, setDueTime, getNotes, setNotes, getCheckList, getCompletionStatus, complete,
        addCheckListItem, loadCheckListItem, removeCheckListItem, toggleCheckListItem}

}

function todoToJSON(todo) {
    return {
        id: todo.id,
        title: todo.getTitle(),
        priority: todo.getPriority(),
        description: todo.getDescription(),
        dueDate: todo.getDueDate(),
        dueTime: todo.getDueTime(),
        notes: todo.getNotes(),
        completionStatus: todo.getCompletionStatus(),
        checklist: todo.getCheckList().map(item => ({
            id: item.id,
            text: item.getText(),
            done: item.getDone()
        }))

    }
}

function loadTodo(data) {
    const todo = createTodo(data.title, data.priority, data.description, data.dueDate, data.dueTime, data.notes, data.id);

    if(data.completionStatus) todo.complete();

    data.checklist.forEach(itemData => {
        const item = createCheckListItem(itemData.text, itemData.id, itemData.done);
        todo.loadCheckListItem(item);
    })

    return todo;
}

function createCheckListItem(text, id = crypto.randomUUID(), done = false) {

    let _text = text;
    let _id = id;

    const getText = () => _text;
    const setText = (newText) => {_text = newText};

    let _done = done;
    const getDone = () => _done;
    const toggleStatus = () => {_done = !_done};

    return {
        id: _id,
        getText,
        setText,
        getDone,
        toggleStatus
    }

}

function collectionManager(name, isDefault = false, id = crypto.randomUUID()) {

    let _id = id;
    let _name = name;

    const isDefaultProject = () => isDefault;

    const getName = () => _name;
    const setName = (newName) => {
        if (isDefault) return;
        if (newName.trim().toLowerCase() === "inbox") return;
        _name = newName;
    }

    let todoCollection = [];

    const getTodoCollection = () => todoCollection;
    const getTodoById = (id) => todoCollection.find((todo) => todo.id === id);

    function addTodo(todo) {
        todoCollection.push(todo);
    }

    function removeTodo(id) {
        const newTodoCollection = todoCollection.filter((todo) => todo.id !== id);
        todoCollection = newTodoCollection;
    }

    return { id: _id, getName, setName, getTodoCollection, getTodoById, addTodo, removeTodo, isDefaultProject}

}

function createProjectManager(skipDefault = false) {
    const defaultProject = skipDefault ? null : collectionManager("Inbox", true);
    let projects = skipDefault ? [] : [defaultProject];
    let activeProject = skipDefault ? null : defaultProject;

    const getProjects = () => projects;
    const getActiveProject = () => activeProject;

    const setActiveProject = (id) => {
        const found = projects.find( (project) => project.id === id);
        if (found) activeProject = found;
    }

    const addProject = (name) => {
        if (name.trim().toLowerCase() === "inbox") {
            return { success: false, message: "Project cannot be named Inbox" }
        }
        const project = collectionManager(name);
        projects.push(project);
        return { success: true }
    }

    const loadProject = (name, isDefault, id) => {
        const project = collectionManager(name, isDefault, id);
        projects.push(project);
    }

    const removeProject = (id) => {
        if (id === defaultProject.id) return;
        projects = projects.filter((project) => project.id !== id);
        if (activeProject.id === id) {
            activeProject = defaultProject;
        }

    }

    return { getProjects, getActiveProject, setActiveProject, addProject, loadProject, removeProject}
}

export {createTodo, todoToJSON, loadTodo, createCheckListItem, collectionManager, createProjectManager};





