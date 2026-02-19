# Kanban Board

A responsive task management application with drag-and-drop functionality and persistent local storage. Organize your workflow with "To Do", "In Progress", and "Done" columns for effective task management.

## Features

- **Create Tasks**: Add tasks with title and optional description
- **Three-Column Workflow**: To Do → In Progress → Done
- **Drag & Drop**: Move tasks between columns using HTML5 Drag and Drop API
- **Persistent Storage**: All tasks saved in browser localStorage
- **Real-time Stats**: View task counts and progress
- **Delete Tasks**: Remove tasks individually from any column
- **Export Data**: Download all tasks as JSON file
- **Clear All**: Clear all tasks with confirmation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Keyboard Friendly**: Full keyboard support
- **Error Prevention**: Validation and error messages

## Project Structure

```
kanban-board/
├── index.html (HTML structure and layout)
├── styles.css (Responsive styling and animations)
├── script.js (Drag-drop logic and state management)
└── README.md (Documentation)
```

## Installation & Usage

### 1. **Basic Setup**
   - Download all files (index.html, styles.css, script.js)
   - Place them in the same directory
   - Open `index.html` in a web browser

### 2. **Create Tasks**
   - Enter task title in the "Create New Task" section
   - Optionally add a description
   - Click "Add Task" button
   - Task appears in "To Do" column

### 3. **Move Tasks**
   - Click and hold any task card
   - Drag to target column (To Do, In Progress, or Done)
   - Release to drop in new column
   - Task status updates automatically

### 4. **Manage Tasks**
   - Click trash icon on task card to delete
   - Use "Clear All Tasks" to remove all tasks (with confirmation)
   - Use "Export Data" to download tasks as JSON


**Created as part of 25 Mini Projects Series**
Master drag-and-drop, state management, and local storage with this practical project!
