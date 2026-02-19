// Kanban Board State
let kanbanState = {
    tasks: [],
    draggedTask: null,
};

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDesc');
const todoContainer = document.getElementById('todoContainer');
const inProgressContainer = document.getElementById('inProgressContainer');
const doneContainer = document.getElementById('doneContainer');
const columns = document.querySelectorAll('.column');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');
const confirmModal = document.getElementById('confirmModal');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');

// Initialize Board
function initBoard() {
    loadTasks();
    attachEventListeners();
    renderBoard();
    updateStats();
}

// Attach Event Listeners
function attachEventListeners() {
    // Form submission
    taskForm.addEventListener('submit', handleAddTask);

    // Clear All btn
    clearAllBtn.addEventListener('click', handleClearAll);

    // Export btn
    exportBtn.addEventListener('click', exportData);

    // Modal buttons
    modalConfirm.addEventListener('click', confirmAction);
    modalCancel.addEventListener('click', closeModal);

    // Column drag over and drop
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

// Add Task
function handleAddTask(e) {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();

    if (!title) {
        showError('Please enter a task title');
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        status: 'todo',
        createdAt: new Date().toLocaleDateString(),
    };

    kanbanState.tasks.push(newTask);
    saveTasks();
    renderBoard();
    updateStats();

    // Clear form
    taskForm.reset();
    taskTitleInput.focus();
}

// Delete Task
function deleteTask(taskId) {
    kanbanState.tasks = kanbanState.tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderBoard();
    updateStats();
}

// Render Board
function renderBoard() {
    renderColumn('todo', todoContainer);
    renderColumn('inprogress', inProgressContainer);
    renderColumn('done', doneContainer);
}

// Render Column
function renderColumn(status, container) {
    const columnTasks = kanbanState.tasks.filter(task => task.status === status);

    if (columnTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-${getEmptyIcon(status)}"></i>
                <p>${getEmptyMessage(status)}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = columnTasks.map(task => `
        <div class="task-card" draggable="true" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <button class="task-delete" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <p class="task-date">${task.createdAt}</p>
        </div>
    `).join('');

    // Attach drag listeners to task cards
    container.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
}

// Drag and Drop Functions
function handleDragStart(e) {
    const taskId = parseInt(e.target.closest('.task-card').dataset.taskId);
    kanbanState.draggedTask = kanbanState.tasks.find(task => task.id === taskId);
    e.target.closest('.task-card').classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.closest('.task-card').classList.remove('dragging');
    columns.forEach(col => col.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.target.closest('.column')?.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (e.target === e.target.closest('.column')) {
        e.target.closest('.column').classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();

    const column = e.target.closest('.column');
    if (!column) return;

    const newStatus = column.dataset.status;

    if (kanbanState.draggedTask) {
        kanbanState.draggedTask.status = newStatus;
        saveTasks();
        renderBoard();
        updateStats();
    }

    column.classList.remove('drag-over');
}

// Update Stats
function updateStats() {
    const totalTasks = kanbanState.tasks.length;
    const inProgressTasks = kanbanState.tasks.filter(task => task.status === 'inprogress').length;
    const completedTasks = kanbanState.tasks.filter(task => task.status === 'done').length;
    const todoTasks = kanbanState.tasks.filter(task => task.status === 'todo').length;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('inProgressCount').textContent = inProgressTasks;
    document.getElementById('completedCount').textContent = completedTasks;
    document.getElementById('todoCount').textContent = todoTasks;
    document.getElementById('inProgressCountCol').textContent = inProgressTasks;
    document.getElementById('doneCount').textContent = completedTasks;
}

// Local Storage Functions
function saveTasks() {
    localStorage.setItem('kanbanTasks', JSON.stringify(kanbanState.tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('kanbanTasks');
    if (saved) {
        try {
            kanbanState.tasks = JSON.parse(saved);
        } catch (error) {
            console.error('Error loading tasks:', error);
            kanbanState.tasks = [];
        }
    }
}

// Clear All Tasks
function handleClearAll() {
    if (kanbanState.tasks.length === 0) {
        showError('No tasks to clear');
        return;
    }

    // Show confirmation modal
    document.getElementById('modalMessage').textContent = 
        `Are you sure you want to delete all ${kanbanState.tasks.length} tasks? This action cannot be undone.`;
    openModal('clear');
}

// Handle Modal Confirmation
let modalAction = null;

function openModal(action) {
    modalAction = action;
    confirmModal.classList.add('active');
}

function closeModal() {
    confirmModal.classList.remove('active');
    modalAction = null;
}

function confirmAction() {
    if (modalAction === 'clear') {
        kanbanState.tasks = [];
        saveTasks();
        renderBoard();
        updateStats();
        closeModal();
        showSuccess('All tasks cleared');
    }
}

// Export Data
function exportData() {
    if (kanbanState.tasks.length === 0) {
        showError('No tasks to export');
        return;
    }

    const exportData = {
        exportDate: new Date().toLocaleString(),
        totalTasks: kanbanState.tasks.length,
        tasks: kanbanState.tasks,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showSuccess('Data exported successfully');
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getEmptyIcon(status) {
    const icons = {
        'todo': 'inbox',
        'inprogress': 'spinner',
        'done': 'check',
    };
    return icons[status] || 'tasks';
}

function getEmptyMessage(status) {
    const messages = {
        'todo': 'No tasks yet',
        'inprogress': 'No tasks in progress',
        'done': 'No tasks completed yet',
    };
    return messages[status] || 'No tasks';
}

// Notification Functions
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        z-index: 999;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    notification.textContent = message;

    // Add CSS animation
    if (!document.querySelector('style[data-notification]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification', 'true');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', initBoard);
