function deleteEntry(entryId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    // Find entry
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Remove entry
    state.entries = state.entries.filter(e => e.id !== entryId);
    
    // Remove tasks for this entry
    if (entry.date && state.tasks[entry.date]) {
        delete state.tasks[entry.date];
    }
    
    // Save data
    saveData();
    
    // Update UI
    renderEntries();
    updateStatistics();
    updateTodayInfo();
    }
    // Initialize the app
    init();
});


function renderEntries() {
    // Clear existing entries
    elements.sleepData.innerHTML = '';
    
    // Filter entries for current month
    const currentYear = state.currentMonth.getFullYear();
    const currentMonth = state.currentMonth.getMonth();
    
    const filteredEntries = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
    });
    
    // Sort entries by date
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Define the reference date for day calculations
    const referenceDate = new Date(state.settings.referenceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    
    // Render entries
    filteredEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((entryDate - referenceDate) / (1000 * 60 * 60 * 24));
        const daysDiffFromToday = Math.floor((entryDate - today) / (1000 * 60 * 60 * 24));
        
        // Determine day color based on difference from today
        let dayColor = '';
        if (daysDiffFromToday < 0) {
            dayColor = 'red-day'; // Past
        } else if (daysDiffFromToday > 0) {
            dayColor = 'green-day'; // Future
        } else {
            dayColor = 'today-day'; // Today
        }
        
        // Determine week number for shading (Goal #10)
        let weekShade = '';
        if (daysDiffFromToday < 0) {
            const weeksAgo = Math.floor(Math.abs(daysDiffFromToday) / 7) + 1;
            if (weeksAgo <= 4) {
                weekShade = `week-${weeksAgo}-past`;
            }
        } else if (daysDiffFromToday > 0) {
            const weeksAhead = Math.floor(daysDiffFromToday / 7) + 1;
            if (weeksAhead <= 4) {
                weekShade = `week-${weeksAhead}-future`;
            }
        }
        
        // Determine if this is a week separator
        const isWeekSeparator = entryDate.getDay() === 0; // Sunday
        
        // Create row
        const row = document.createElement('tr');
        if (daysDiffFromToday === 0) {
            row.classList.add('today-row');
        }
        
        if (isWeekSeparator) {
            row.classList.add('week-separator');
        }
        
        if (weekShade) {
            row.classList.add(weekShade);
        }
        
        // Cell for day number
        const dayCell = document.createElement('td');
        dayCell.classList.add('day-num', dayColor);
        dayCell.textContent = daysDiff;
        row.appendChild(dayCell);
        
        // Cell for days from today - new column (Goal #10)
        const daysFromTodayCell = document.createElement('td');
        daysFromTodayCell.classList.add('days-from-today');
        
        if (daysDiffFromToday < 0) {
            daysFromTodayCell.textContent = daysDiffFromToday;
            daysFromTodayCell.classList.add('days-past');
        } else if (daysDiffFromToday > 0) {
            daysFromTodayCell.textContent = `+${daysDiffFromToday}`;
            daysFromTodayCell.classList.add('days-future');
        } else {
            daysFromTodayCell.textContent = '0';
            daysFromTodayCell.classList.add('days-today');
        }
        row.appendChild(daysFromTodayCell);
        
        // Cell for date
        const dateCell = document.createElement('td');
        dateCell.classList.add('date-cell');
        const dayOfWeek = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateCell.innerHTML = `<span class="day-of-week">${dayOfWeek}</span> ${formattedDate}`;
        row.appendChild(dateCell);
        
        // Cell for sleep score
        const sleepScoreCell = createCell(entry.sleepScore || '', getScoreColor(entry.sleepScore));
        row.appendChild(sleepScoreCell);
        
        // Cell for night sleep
        const nightSleepCell = createCell(formatTime(entry.nightSleep), getSleepColor(entry.nightSleep));
        row.appendChild(nightSleepCell);
        
        // Cell for day nap
        const dayNapCell = createCell(formatTime(entry.dayNap));
        row.appendChild(dayNapCell);
        
        // Cell for deep sleep
        const deepSleepCell = createCell(formatTime(entry.deepSleep), getDeepSleepColor(entry.deepSleep, entry.nightSleep));
        row.appendChild(deepSleepCell);
        
        // Cell for light sleep
        const lightSleepCell = createCell(formatTime(entry.lightSleep), getLightSleepColor(entry.lightSleep, entry.nightSleep));
        row.appendChild(lightSleepCell);
        
        // Cell for REM sleep
        const remSleepCell = createCell(formatTime(entry.remSleep), getRemSleepColor(entry.remSleep));
        row.appendChild(remSleepCell);
        
        // Cell for wake ups
        const wakeUpsCell = createCell(entry.wakeUps || '');
        row.appendChild(wakeUpsCell);
        
        // Cell for cut sleep
        const cutSleepCell = createCell(entry.cutSleep ? '✓' : '');
        row.appendChild(cutSleepCell);
        
        // Cell for shake
        const shakeCell = createCell(entry.shake ? '✓' : '');
        row.appendChild(shakeCell);
        
        // Cell for seizure
        const seizureCell = createCell(entry.seizure ? '✓' : '');
        row.appendChild(seizureCell);
        
        // Cell for events/notes
        const eventsCell = document.createElement('td');
        eventsCell.classList.add('events-cell');
        if (entry.eventsNotes) {
            eventsCell.textContent = entry.eventsNotes.length > 20 ? 
                entry.eventsNotes.substring(0, 20) + '...' : entry.eventsNotes;
            eventsCell.classList.add('has-content');
            eventsCell.addEventListener('click', () => showEntryPreview(entry.id));
        } else {
            eventsCell.textContent = '';
            if (entry.isEmpty) {
                eventsCell.classList.add('empty-cell');
            }
            eventsCell.addEventListener('click', () => showAddEntryModal(entryDate));
        }
        row.appendChild(eventsCell);
        
        // Cell for Afro
        const afroCell = createCell(entry.afr ? '✓' : '');
        row.appendChild(afroCell);
        
        // Cell for calories
        const caloriesCell = createCell(entry.calories || '', getCaloriesColor(entry.calories));
        row.appendChild(caloriesCell);
        
        // Cell for steps
        const stepsCell = createCell(entry.steps ? entry.steps.toLocaleString() : '', getStepsColor(entry.steps));
        row.appendChild(stepsCell);
        
        //// Sleep Tracker Script
    }
document.addEventListener('DOMContentLoaded', function() {
// DOM Elements - Define elements first before any other functions
const elements = {
    // Date and today's info
    currentDateDisplay: document.getElementById('current-date'),
    daysCountDisplay: document.getElementById('days-count'),
    todayTasks: document.getElementById('today-tasks'),
    todayTagsList: document.getElementById('today-tags-list'),
    
    // Month navigation
    currentMonthDisplay: document.getElementById('current-month'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    
    // Table
    sleepTable: document.getElementById('sleep-table'),
    sleepData: document.getElementById('sleep-data'),
    tagsContainer: document.getElementById('tags-container'),
    
    // Buttons
    addEntryBtn: document.getElementById('add-entry-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    dashboardBtn: document.getElementById('dashboard-btn'),
    
    // Filter controls
    searchInput: document.getElementById('search-input'),
    tagFilter: document.getElementById('tag-filter'),
    
    // Modals
    entryModal: document.getElementById('entry-modal'),
    settingsModal: document.getElementById('settings-modal'),
    dashboardModal: document.getElementById('dashboard-modal'),
    entryPreviewModal: document.getElementById('entry-preview-modal'),
    
    // Statistics
    avgSleepScore: document.getElementById('avg-sleep-score'),
    avgSleepDuration: document.getElementById('avg-sleep-duration'),
    avgSteps: document.getElementById('avg-steps'),
    avgDeepSleep: document.getElementById('avg-deep-sleep'),
    avgRemSleep: document.getElementById('avg-rem-sleep'),
    avgLightSleep: document.getElementById('avg-light-sleep'),
    
    // Entry Form
    entryForm: document.getElementById('entry-form'),
    entryId: document.getElementById('entry-id'),
    entryDate: document.getElementById('entry-date'),
    sleepScore: document.getElementById('sleep-score'),
    
    // Tasks
    newTask: document.getElementById('new-task'),
    addTaskBtn: document.getElementById('add-task-btn'),
    tasksList: document.getElementById('tasks-list'),
    
    // Dashboard charts
    sleepTrendChart: document.getElementById('sleep-trend-chart'),
    compositionChart: document.getElementById('composition-chart'),
    activityChart: document.getElementById('activity-chart'),
    eventsTimeline: document.getElementById('events-timeline'),

    // Statistics
    avgSleepScore: document.getElementById('avg-sleep-score'),
    avgSleepDuration: document.getElementById('avg-sleep-duration'),
    avgSteps: document.getElementById('avg-steps'),
    avgDeepSleep: document.getElementById('avg-deep-sleep'),
    avgRemSleep: document.getElementById('avg-rem-sleep'),
    avgLightSleep: document.getElementById('avg-light-sleep'),
    
    // Entry Form
    entryForm: document.getElementById('entry-form'),
    entryId: document.getElementById('entry-id'),
    entryDate: document.getElementById('entry-date'),
    sleepScore: document.getElementById('sleep-score'),
    
    // Tasks
    newTask: document.getElementById('new-task'),
    addTaskBtn: document.getElementById('add-task-btn'),
    tasksList: document.getElementById('tasks-list'),
    
    // Dashboard charts
    sleepTrendChart: document.getElementById('sleep-trend-chart'),
    compositionChart: document.getElementById('composition-chart'),
    activityChart: document.getElementById('activity-chart'),
    eventsTimeline: document.getElementById('events-timeline'),
};

// App state
const state = {
    entries: [],
    tasks: {}, // Tasks organized by date
    tags: [],
    settings: {
        referenceDate: '2024-04-11',
        caloriesGoal: 2000,
        stepsGoal: 10000,
        sleepThresholds: {
            totalSleep: {
                red: { hours: 6, minutes: 20 },
                yellow: { hours: 7, minutes: 0 },
                darkGreen: { hours: 8, minutes: 30 }
            },
            deepSleep: { minimum: { hours: 1, minutes: 30 } },
            lightSleep: { 
                minimum: { hours: 3, minutes: 0 },
                maximum: { hours: 5, minutes: 0 }
            },
            remSleep: {
                red: { hours: 0, minutes: 50 },
                yellow: { hours: 1, minutes: 2 }
            }
        },
        theme: 'light',
        accentColor: 'blue'
    },
    currentDate: new Date(),
    currentMonth: new Date(),
    selectedEntryId: null,
    currentTasks: [], // Tasks for the entry being edited
    entries: [],
    tasks: {}, // Tasks organized by date
    tags: [],

    settings: {
        referenceDate: '2024-04-11',
        caloriesGoal: 2000,
        stepsGoal: 10000,
        sleepThresholds: {
            totalSleep: {
                red: { hours: 6, minutes: 20 },
                yellow: { hours: 7, minutes: 0 },
                darkGreen: { hours: 8, minutes: 30 }
            },
            deepSleep: { minimum: { hours: 1, minutes: 30 } },
            lightSleep: { 
                minimum: { hours: 3, minutes: 0 },
                maximum: { hours: 5, minutes: 0 }
            },
            remSleep: {
                red: { hours: 0, minutes: 50 },
                yellow: { hours: 1, minutes: 2 }
            }
        },
        theme: 'light',
        accentColor: 'blue'
    },
    currentDate: new Date(),
    currentMonth: new Date(),
    selectedEntryId: null,
    currentTasks: [] // Tasks for the entry being edited
};

// Helper Functions
function createCell(content, color = '') {
    const cell = document.createElement('td');
    cell.textContent = content;
    
    // Mark empty cells with white background (Goal #9)
    if (content === '') {
        cell.classList.add('empty-cell');
    }
    
    if (color) {
        cell.style.backgroundColor = color;
        
        // Adjust text color for better contrast
        const luminance = getLuminance(color);
        if (luminance < 0.5) {
            cell.style.color = 'white';
        } else {
            cell.style.color = 'black';
        }
    }
    return cell;
}

function formatTime(timeObj) {
    if (!timeObj || (!timeObj.hours && !timeObj.minutes)) return '';
    const hours = timeObj.hours || 0;
    const minutes = timeObj.minutes || 0;
    return `${hours}h ${minutes}m`;
}

function formatPills(pills) {
    if (!pills || !Array.isArray(pills) || pills.length === 0) return '';
    return pills.join(', ');
}

function getScoreColor(score) {
    if (!score) return '';
    if (score < 50) return '#FF5733'; // Red
    if (score < 70) return '#FFC300'; // Yellow
    if (score < 90) return '#DAF7A6'; // Light green
    return '#57C84D'; // Dark green
}

function getSleepColor(sleepTime) {
    if (!sleepTime) return '';
    
    const thresholds = state.settings.sleepThresholds.totalSleep;
    const totalMinutes = (sleepTime.hours || 0) * 60 + (sleepTime.minutes || 0);
    
    const redThreshold = thresholds.red.hours * 60 + thresholds.red.minutes;
    const yellowThreshold = thresholds.yellow.hours * 60 + thresholds.yellow.minutes;
    const darkGreenThreshold = thresholds.darkGreen.hours * 60 + thresholds.darkGreen.minutes;
    
    if (totalMinutes <= redThreshold) return '#FF5733'; // Red
    if (totalMinutes <= yellowThreshold) return '#FFC300'; // Yellow
    if (totalMinutes >= darkGreenThreshold) return '#2E7D32'; // Dark green
    return '#57C84D'; // Regular green
}

function getDeepSleepColor(deepSleep, totalSleep) {
    if (!deepSleep || !totalSleep) return '';
    
    const deepMinutes = (deepSleep.hours || 0) * 60 + (deepSleep.minutes || 0);
    const totalMinutes = (totalSleep.hours || 0) * 60 + (totalSleep.minutes || 0);
    
    const minDeepSleep = state.settings.sleepThresholds.deepSleep.minimum;
    const minDeepMinutes = minDeepSleep.hours * 60 + minDeepSleep.minutes;
    
    // Calculate percentage of deep sleep
    const percentage = (deepMinutes / totalMinutes) * 100;
    
    if (deepMinutes < minDeepMinutes || percentage < 20) return '#FF5733'; // Red
    if (percentage > 25) return '#4A6BFF'; // Blue (good)
    return '#4A6BFF'; // Blue (ideal) - updated per Goal #9
}

function getLightSleepColor(lightSleep, totalSleep) {
    if (!lightSleep || !totalSleep) return '';
    
    const lightMinutes = (lightSleep.hours || 0) * 60 + (lightSleep.minutes || 0);
    const totalMinutes = (totalSleep.hours || 0) * 60 + (totalSleep.minutes || 0);
    
    const minLightSleep = state.settings.sleepThresholds.lightSleep.minimum;
    const maxLightSleep = state.settings.sleepThresholds.lightSleep.maximum;
    
    const minLightMinutes = minLightSleep.hours * 60 + minLightSleep.minutes;
    const maxLightMinutes = maxLightSleep.hours * 60 + maxLightSleep.minutes;
    
    // Calculate percentage of light sleep
    const percentage = (lightMinutes / totalMinutes) * 100;
    
    if (lightMinutes < minLightMinutes || percentage < 50) return '#FF5733'; // Red
    if (lightMinutes > maxLightMinutes || percentage > 60) return '#FF5733'; // Red
    return '#2C7DD4'; // Light blue (ideal) - updated per Goal #9
}

function getRemSleepColor(remSleep) {
    if (!remSleep) return '';
    
    const remMinutes = (remSleep.hours || 0) * 60 + (remSleep.minutes || 0);
    
    const redThreshold = state.settings.sleepThresholds.remSleep.red.hours * 60 + 
                      state.settings.sleepThresholds.remSleep.red.minutes;
    const yellowThreshold = state.settings.sleepThresholds.remSleep.yellow.hours * 60 + 
                         state.settings.sleepThresholds.remSleep.yellow.minutes;
    
    if (remMinutes <= redThreshold) return '#FF5733'; // Red
    if (remMinutes <= yellowThreshold) return '#FFC300'; // Yellow
    return '#3DD3CB'; // Turquoise (good) - updated per Goal #6
}

function getCaloriesColor(calories) {
    if (!calories) return '';
    
    const goal = state.settings.caloriesGoal;
    
    if (calories < goal * 0.7) return '#FF5733'; // Red (too low)
    if (calories > goal * 1.3) return '#FF5733'; // Red (too high)
    if (calories < goal * 0.9 || calories > goal * 1.1) return '#FFC300'; // Yellow
    return '#EF8A2B'; // Orange (on target) - updated per Goal #9
}

function getStepsColor(steps) {
    if (!steps) return '';
    
    const goal = state.settings.stepsGoal;
    
    if (steps < goal * 0.5) return '#FF5733'; // Red
    if (steps < goal * 0.8) return '#FFC300'; // Yellow
    if (steps > goal * 1.2) return '#2E7D32'; // Dark green
    return '#E0CB08'; // Yellow-green (on target) - updated per Goal #9
}

function getStandingColor(hours) {
    if (!hours) return '';
    
    if (hours < 6) return '#FF5733'; // Red
    if (hours < 8) return '#FFC300'; // Yellow
    if (hours > 12) return '#2E7D32'; // Dark green
    return '#43C677'; // Green (on target) - updated per Goal #9
}

function getLuminance(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16) / 255;
    const g = parseInt(hexColor.substr(3, 2), 16) / 255;
    const b = parseInt(hexColor.substr(5, 2), 16) / 255;
    
    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Function to update tag filter select dropdown
function updateTagFilter() {
    elements.tagFilter.innerHTML = '<option value="">All Tags</option>';
    
    state.tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.name;
        option.textContent = tag.name;
        elements.tagFilter.appendChild(option);
    });
}

// Function to load data from localStorage
function loadData() {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('sleepEntries');
    if (savedEntries) {
        state.entries = JSON.parse(savedEntries);
    }

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('sleepTasks');
    if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
    }

    // Load tags from localStorage
    const savedTags = localStorage.getItem('sleepTags');
    if (savedTags) {
        state.tags = JSON.parse(savedTags);
    } else {
        // Initialize with some default tags
        state.tags = [
            { id: 1, name: 'anniversary', color: '#FF5733' },
            { id: 2, name: 'outing', color: '#33FF57' },
            { id: 3, name: 'medical', color: '#3357FF' }
        ];
        saveData();
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('sleepSettings');
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    } else {
        saveData();
    }

    // Update tag filter
    updateTagFilter();
}

// Function to save data to localStorage
function saveData() {
    localStorage.setItem('sleepEntries', JSON.stringify(state.entries));
    localStorage.setItem('sleepTasks', JSON.stringify(state.tasks));
    localStorage.setItem('sleepTags', JSON.stringify(state.tags));
    localStorage.setItem('sleepSettings', JSON.stringify(state.settings));
}

function updateTagsRow() {
    elements.tagsContainer.innerHTML = '';
    
    state.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.classList.add('tag');
        tagElement.textContent = tag.name;
        tagElement.style.backgroundColor = tag.color;
        
        // Adjust text color for better contrast
        const luminance = getLuminance(tag.color);
        if (luminance < 0.5) {
            tagElement.style.color = 'white';
        } else {
            tagElement.style.color = 'black';
        }
        
        elements.tagsContainer.appendChild(tagElement);
        
        elements.tagsContainer.appendChild(tagElement);
    });
}

// Task functions (Goal #2)
function addTask() {
    const taskText = elements.newTask.value.trim();
    if (!taskText) return;
    
    // Add task to current tasks
    state.currentTasks.push({
        id: Date.now().toString(),
        text: taskText,
        completed: false
    });
    
    // Clear input
    elements.newTask.value = '';
    
    // Render tasks
    renderTasks();
}

function renderTasks() {
    if (!elements.tasksList) return;
    
    elements.tasksList.innerHTML = '';
    
    state.currentTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        
        const taskText = document.createElement('span');
        taskText.classList.add('task-text');
        taskText.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-task-btn');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', () => {
            state.currentTasks = state.currentTasks.filter(t => t.id !== task.id);
            renderTasks();
        });
        
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteBtn);
        
        elements.tasksList.appendChild(taskItem);
    });
}

function updateDateDisplay() {
    const today = new Date();
    
    // Format current date
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    elements.currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);
    
    // Calculate days since reference date
    const referenceDate = new Date(state.settings.referenceDate);
    const daysDiff = Math.floor((today - referenceDate) / (1000 * 60 * 60 * 24));
    const monthsDiff = (today.getFullYear() - referenceDate.getFullYear()) * 12 + 
                      (today.getMonth() - referenceDate.getMonth()) + 
                      (today.getDate() >= referenceDate.getDate() ? 0 : -1);
    const monthsDecimal = monthsDiff + (today.getDate() / 30);
    
    elements.daysCountDisplay.textContent = `${daysDiff} days since ${referenceDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}, ${monthsDecimal.toFixed(1)} months`;
}

function updateMonthDisplay() {
    const options = { month: 'long', year: 'numeric' };
    elements.currentMonthDisplay.textContent = state.currentMonth.toLocaleDateString('en-US', options);
}

function navigateToPreviousMonth() {
    state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
    updateMonthDisplay();
    renderEntries();
    
    // Auto-fill empty entries for the whole month (Goal #7)
    autoFillEmptyEntries();
}

function navigateToNextMonth() {
    state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
    updateMonthDisplay();
    renderEntries();
    
    // Auto-fill empty entries for the whole month (Goal #7)
    autoFillEmptyEntries();
}

function autoFillEmptyEntries() {
    const currentYear = state.currentMonth.getFullYear();
    const currentMonth = state.currentMonth.getMonth();
    
    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Check if each day has an entry
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toISOString().split('T')[0];
        
        // Check if entry exists
        const entryExists = state.entries.some(entry => entry.date === dateString);
        
        // If not, create an empty entry
        if (!entryExists) {
            const emptyEntry = {
                id: `empty-${dateString}-${Math.random().toString(36).substr(2, 9)}`,
                date: dateString,
                isEmpty: true,
                tags: []
            };
            
            state.entries.push(emptyEntry);
        }
    }
    
    // Save and re-render
    saveData();
    renderEntries();
}

// Initialize
function init() {
    loadData();
    setupEventListeners();
    updateDateDisplay();
    updateMonthDisplay();
    renderEntries();
    updateTodayInfo();
    updateStatistics();
    applyTheme();
    applyAccentColor();
    
    // Auto-fill empty entries for the whole month (Goal #7)
    autoFillEmptyEntries();
}

function setupEventListeners() {
    // Month navigation
    elements.prevMonthBtn.addEventListener('click', navigateToPreviousMonth);
    elements.nextMonthBtn.addEventListener('click', navigateToNextMonth);
    
    // Add entry button
    elements.addEntryBtn.addEventListener('click', showAddEntryModal);
    
    // Settings button
    elements.settingsBtn.addEventListener('click', showSettingsModal);
    
    // Dashboard button
    elements.dashboardBtn.addEventListener('click', showDashboardModal);
    
    // Entry form
    elements.entryForm.addEventListener('submit', saveEntry);
    
    // Search and filter
    elements.searchInput.addEventListener('input', filterEntries);
    elements.tagFilter.addEventListener('change', filterEntries);
    
    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            document.getElementById(modalId).style.display = 'none';
        });
    });
    
    // Cancel buttons
    document.getElementById('cancel-btn').addEventListener('click', function() {
        elements.entryModal.style.display = 'none';
    });
    
    document.getElementById('settings-cancel-btn').addEventListener('click', function() {
        elements.settingsModal.style.display = 'none';
    });
    
    document.getElementById('dashboard-close-btn').addEventListener('click', function() {
        elements.dashboardModal.style.display = 'none';
    });
    
    document.getElementById('preview-close-btn').addEventListener('click', function() {
        elements.entryPreviewModal.style.display = 'none';
    });
    
    document.getElementById('preview-edit-btn').addEventListener('click', function() {
        elements.entryPreviewModal.style.display = 'none';
        showEditEntryModal(state.selectedEntryId);
    });
    
    // Settings form
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    
    // Add new tag
    document.getElementById('add-tag-btn').addEventListener('click', addNewTag);
    
    // Tasks system
    if (elements.addTaskBtn) {
        elements.addTaskBtn.addEventListener('click', addTask);
        
        if (elements.newTask) {
            elements.newTask.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                }
            });
        }
    }
    
    // Accent color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            const color = this.getAttribute('data-color');
            state.settings.accentColor = color;
            applyAccentColor();
        });
    });
    
    // When clicking outside modals, close them
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Set up theme toggle
    document.getElementById('theme-selector').addEventListener('change', function() {
        state.settings.theme = this.value;
        applyTheme();
        saveData();
    });
}

function applyTheme() {
    // Apply theme to document body
    if (state.settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else if (state.settings.theme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    } else if (state.settings.theme === 'auto') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }
}

function applyAccentColor() {
    // Apply accent color to document body
    document.body.setAttribute('data-accent', state.settings.accentColor);
}

function updateTodayInfo() {
    // Clear existing content
    elements.todayTasks.innerHTML = '';
    elements.todayTagsList.innerHTML = '';
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    // Find today's entry
    const todayEntry = state.entries.find(entry => entry.date === todayString);
    
    // Get tasks for today
    const todayTasks = state.tasks[todayString] || [];
    
    // Display tasks
    if (todayTasks.length > 0) {
        todayTasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.textContent = task.text;
            if (task.completed) {
                taskElement.classList.add('completed');
            }
            elements.todayTasks.appendChild(taskElement);
        });
    } else {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No tasks for today';
        emptyMessage.classList.add('empty-message');
        elements.todayTasks.appendChild(emptyMessage);
    }
    
    // Display tags
    if (todayEntry && todayEntry.tags && todayEntry.tags.length > 0) {
        todayEntry.tags.forEach(tagName => {
            const tag = state.tags.find(t => t.name === tagName);
            if (tag) {
                const tagElement = document.createElement('span');
                tagElement.classList.add('tag');
                tagElement.textContent = tag.name;
                tagElement.style.backgroundColor = tag.color;
                
                // Adjust text color for better contrast
                const luminance = getLuminance(tag.color);
                if (luminance < 0.5) {
                    tagElement.style.color = 'white';
                } else {
                    tagElement.style.color = 'black';
                }
                
                elements.todayTagsList.appendChild(tagElement);
            }
        });
    } else {
        const emptyMessage = document.createElement('span');
        emptyMessage.textContent = 'No tags for today';
        emptyMessage.classList.add('empty-message');
        elements.todayTagsList.appendChild(emptyMessage);
    }
}

function updateStatistics() {
    // Get the current week's data
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - currentDay));
    endDate.setHours(23, 59, 59, 999);
    
    // Filter entries for the current week
    const weekEntries = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate && !entry.isEmpty;
    });
    
    // Calculate averages
    let totalSleepScore = 0;
    let totalSleepDuration = 0;
    let totalSteps = 0;
    let totalDeepSleep = 0;
    let totalLightSleep = 0;
    let totalRemSleep = 0;
    let entriesWithSleepScore = 0;
    let entriesWithSleepDuration = 0;
    let entriesWithSteps = 0;
    let entriesWithDeepSleep = 0;
    let entriesWithLightSleep = 0;
    let entriesWithRemSleep = 0;
    
    weekEntries.forEach(entry => {
        if (entry.sleepScore) {
            totalSleepScore += entry.sleepScore;
            entriesWithSleepScore++;
        }
        
        if (entry.nightSleep) {
            const minutes = (entry.nightSleep.hours || 0) * 60 + (entry.nightSleep.minutes || 0);
            totalSleepDuration += minutes;
            entriesWithSleepDuration++;
        }
        
        if (entry.steps) {
            totalSteps += entry.steps;
            entriesWithSteps++;
        }
        
        if (entry.deepSleep) {
            const minutes = (entry.deepSleep.hours || 0) * 60 + (entry.deepSleep.minutes || 0);
            totalDeepSleep += minutes;
            entriesWithDeepSleep++;
        }
        
        if (entry.lightSleep) {
            const minutes = (entry.lightSleep.hours || 0) * 60 + (entry.lightSleep.minutes || 0);
            totalLightSleep += minutes;
            entriesWithLightSleep++;
        }
        
        if (entry.remSleep) {
            const minutes = (entry.remSleep.hours || 0) * 60 + (entry.remSleep.minutes || 0);
            totalRemSleep += minutes;
            entriesWithRemSleep++;
        }
    });
    
    // Update statistics display
    const avgSleepScore = entriesWithSleepScore > 0 ? Math.round(totalSleepScore / entriesWithSleepScore) : 0;
    elements.avgSleepScore.textContent = avgSleepScore;
    
    const avgSleepDurationMinutes = entriesWithSleepDuration > 0 ? Math.round(totalSleepDuration / entriesWithSleepDuration) : 0;
    const avgSleepDurationHours = Math.floor(avgSleepDurationMinutes / 60);
    const avgSleepDurationRemainingMinutes = avgSleepDurationMinutes % 60;
    elements.avgSleepDuration.textContent = `${avgSleepDurationHours}h ${avgSleepDurationRemainingMinutes}m`;
    
    const avgSteps = entriesWithSteps > 0 ? Math.round(totalSteps / entriesWithSteps) : 0;
    elements.avgSteps.textContent = avgSteps.toLocaleString();
    
    const avgDeepSleepMinutes = entriesWithDeepSleep > 0 ? Math.round(totalDeepSleep / entriesWithDeepSleep) : 0;
    const avgDeepSleepHours = Math.floor(avgDeepSleepMinutes / 60);
    const avgDeepSleepRemainingMinutes = avgDeepSleepMinutes % 60;
    elements.avgDeepSleep.textContent = `${avgDeepSleepHours}h ${avgDeepSleepRemainingMinutes}m`;
    
    const avgLightSleepMinutes = entriesWithLightSleep > 0 ? Math.round(totalLightSleep / entriesWithLightSleep) : 0;
    const avgLightSleepHours = Math.floor(avgLightSleepMinutes / 60);
    const avgLightSleepRemainingMinutes = avgLightSleepMinutes % 60;
    elements.avgLightSleep.textContent = `${avgLightSleepHours}h ${avgLightSleepRemainingMinutes}m`;
    
    const avgRemSleepMinutes = entriesWithRemSleep > 0 ? Math.round(totalRemSleep / entriesWithRemSleep) : 0;
    const avgRemSleepHours = Math.floor(avgRemSleepMinutes / 60);
    const avgRemSleepRemainingMinutes = avgRemSleepMinutes % 60;
    elements.avgRemSleep.textContent = `${avgRemSleepHours}h ${avgRemSleepRemainingMinutes}m`;
}

function showDashboardModal() {
    // Show modal
    elements.dashboardModal.style.display = 'block';
    
    // Update dashboard with current data
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - currentDay));
    endDate.setHours(23, 59, 59, 999);
    
    // Filter entries for the current week
    const weekEntries = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate && !entry.isEmpty;
    });
    
    // Sort entries by date
    weekEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Create dashboard charts if we have data
    if (weekEntries.length > 0) {
        try {
            updateDashboardCharts(weekEntries);
            updateSleepInsights(weekEntries);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    } else {
        // Show no data message
        const noDataMessage = '<div class="no-data">No data available for the selected period</div>';
        if (elements.sleepTrendChart) elements.sleepTrendChart.innerHTML = noDataMessage;
        if (elements.compositionChart) elements.compositionChart.innerHTML = noDataMessage;
        if (elements.activityChart) elements.activityChart.innerHTML = noDataMessage;
        if (elements.eventsTimeline) elements.eventsTimeline.innerHTML = noDataMessage;
        
        const insightsContainer = document.getElementById('sleep-insights');
        if (insightsContainer) {
            insightsContainer.innerHTML = '<div>No data available for insights</div>';
        }
    }
    
    // Set up date range buttons
    const rangeButtons = document.querySelectorAll('.range-btn');
    rangeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            rangeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get date range
            const range = this.getAttribute('data-range');
            
            // Calculate date range
            const today = new Date();
            let startDate, endDate;
            
            switch (range) {
                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay());
                    startDate.setHours(0, 0, 0, 0);
                    
                    endDate = new Date(today);
                    endDate.setDate(today.getDate() + (6 - today.getDay()));
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case 'month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
                    break;
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
                    break;
                case 'all':
                    startDate = new Date(0); // Beginning of time
                    endDate = new Date(8640000000000000); // End of time
                    break;
            }
            
            // Filter entries based on selected date range
            const filteredEntries = state.entries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= startDate && entryDate <= endDate && !entry.isEmpty;
            });
            
            // Sort entries by date
            filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Update charts with filtered data
            if (filteredEntries.length > 0) {
                try {
                    updateDashboardCharts(filteredEntries);
                    updateSleepInsights(filteredEntries);
                } catch (error) {
                    console.error('Error updating dashboard:', error);
                }
            } else {
                // Show no data message
                const noDataMessage = '<div class="no-data">No data available for the selected period</div>';
                if (elements.sleepTrendChart) elements.sleepTrendChart.innerHTML = noDataMessage;
                if (elements.compositionChart) elements.compositionChart.innerHTML = noDataMessage;
                if (elements.activityChart) elements.activityChart.innerHTML = noDataMessage;
                if (elements.eventsTimeline) elements.eventsTimeline.innerHTML = noDataMessage;
                
                const insightsContainer = document.getElementById('sleep-insights');
                if (insightsContainer) {
                    insightsContainer.innerHTML = '<div>No data available for insights</div>';
                }
            }
        });
    });
}

// Dashboard charts update function
function updateDashboardCharts(entries) {
    // Clear existing charts
    if (window.sleepTrendChart) window.sleepTrendChart.destroy();
    if (window.compositionChart) window.compositionChart.destroy();
    if (window.activityChart) window.activityChart.destroy();
    
    // Prepare data
    const dates = entries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const sleepScores = entries.map(entry => entry.sleepScore || 0);
    
    const deepSleepData = entries.map(entry => {
        if (!entry.deepSleep) return 0;
        return (entry.deepSleep.hours || 0) * 60 + (entry.deepSleep.minutes || 0);
    });
    
    const lightSleepData = entries.map(entry => {
        if (!entry.lightSleep) return 0;
        return (entry.lightSleep.hours || 0) * 60 + (entry.lightSleep.minutes || 0);
    });
    
    const remSleepData = entries.map(entry => {
        if (!entry.remSleep) return 0;
        return (entry.remSleep.hours || 0) * 60 + (entry.remSleep.minutes || 0);
    });
    
    const stepsData = entries.map(entry => entry.steps || 0);
    const caloriesData = entries.map(entry => entry.calories || 0);
    const standingData = entries.map(entry => entry.standing || 0);
    
    // Create sleep trend chart
    const sleepTrendCtx = document.createElement('canvas');
    elements.sleepTrendChart.innerHTML = '';
    elements.sleepTrendChart.appendChild(sleepTrendCtx);
    
    window.sleepTrendChart = new Chart(sleepTrendCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Sleep Score',
                data: sleepScores,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Create sleep composition chart (doughnut)
    const compositionCtx = document.createElement('canvas');
    elements.compositionChart.innerHTML = '';
    elements.compositionChart.appendChild(compositionCtx);
    
    // Calculate averages for composition
    const avgDeep = deepSleepData.reduce((sum, val) => sum + val, 0) / deepSleepData.length || 0;
    const avgLight = lightSleepData.reduce((sum, val) => sum + val, 0) / lightSleepData.length || 0;
    const avgRem = remSleepData.reduce((sum, val) => sum + val, 0) / remSleepData.length || 0;
    
    window.compositionChart = new Chart(compositionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Deep Sleep', 'Light Sleep', 'REM Sleep'],
            datasets: [{
                data: [avgDeep, avgLight, avgRem],
                backgroundColor: ['#4A6BFF', '#2C7DD4', '#3DD3CB'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const minutes = Math.round(context.raw);
                            const hours = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return `${context.label}: ${hours}h ${mins}m`;
                        }
                    }
                }
            }
        }
    });
    
    // Create activity metrics chart (bar)
    const activityCtx = document.createElement('canvas');
    elements.activityChart.innerHTML = '';
    elements.activityChart.appendChild(activityCtx);
    
    window.activityChart = new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Steps',
                    data: stepsData.map(steps => steps / 100), // Scale down steps for better visualization
                    backgroundColor: '#E0CB08'
                },
                {
                    label: 'Calories',
                    data: caloriesData.map(calories => calories / 20), // Scale down calories
                    backgroundColor: '#EF8A2B'
                },
                {
                    label: 'Standing Hours',
                    data: standingData,
                    backgroundColor: '#43C677'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.raw;
                            
                            if (datasetLabel === 'Steps') {
                                return `Steps: ${Math.round(value * 100).toLocaleString()}`;
                            } else if (datasetLabel === 'Calories') {
                                return `Calories: ${Math.round(value * 20).toLocaleString()} kcal`;
                            } else {
                                return `Standing: ${value} hours`;
                            }
                        }
                    }
                }
            }
        }
    });
    
    // Create timeline visualization for health events
    updateEventsTimeline(entries);
}

function updateEventsTimeline(entries) {
    // Create a timeline of health events (shake, seizure, cut sleep)
    elements.eventsTimeline.innerHTML = '';
    
    if (entries.length === 0) {
        elements.eventsTimeline.innerHTML = '<div class="no-data">No events data available</div>';
        return;
    }
    
    // Create a simple visualization of events
    const timelineContainer = document.createElement('div');
    timelineContainer.classList.add('timeline-container');
    
    const eventTypes = {
        cutSleep: { label: 'Cut Sleep', color: '#FF5733' },
        shake: { label: 'Shake', color: '#FFC300' },
        seizure: { label: 'Seizure', color: '#C70039' }
    };
    
    // Create timeline
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const dayEvents = [];
        
        if (entry.cutSleep) dayEvents.push(eventTypes.cutSleep);
        if (entry.shake) dayEvents.push(eventTypes.shake);
        if (entry.seizure) dayEvents.push(eventTypes.seizure);
        
        if (dayEvents.length > 0) {
            const dayContainer = document.createElement('div');
            dayContainer.classList.add('timeline-day');
            
            const dateLabel = document.createElement('div');
            dateLabel.classList.add('timeline-date');
            dateLabel.textContent = dateStr;
            dayContainer.appendChild(dateLabel);
            
            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('timeline-events');
            
            dayEvents.forEach(event => {
                const eventMarker = document.createElement('div');
                eventMarker.classList.add('event-marker');
                eventMarker.style.backgroundColor = event.color;
                eventMarker.setAttribute('title', event.label);
                
                // Add tooltip
                eventMarker.addEventListener('mouseover', function(e) {
                    const tooltip = document.createElement('div');
                    tooltip.classList.add('event-tooltip');
                    tooltip.textContent = event.label;
                    tooltip.style.top = `${e.clientY}px`;
                    tooltip.style.left = `${e.clientX}px`;
                    document.body.appendChild(tooltip);
                    
                    eventMarker.addEventListener('mouseout', function() {
                        document.body.removeChild(tooltip);
                    }, { once: true });
                });
                
                eventsContainer.appendChild(eventMarker);
            });
            
            dayContainer.appendChild(eventsContainer);
            timelineContainer.appendChild(dayContainer);
        }
    });
    
    if (timelineContainer.children.length === 0) {
        elements.eventsTimeline.innerHTML = '<div class="no-data">No health events recorded</div>';
    } else {
        elements.eventsTimeline.appendChild(timelineContainer);
    }
}

function updateSleepInsights(entries) {
    const insightsContainer = document.getElementById('sleep-insights');
    if (!insightsContainer) return;
    
    insightsContainer.innerHTML = '';
    
    if (entries.length < 3) {
        insightsContainer.innerHTML = '<div class="no-data">Not enough data for insights (need at least 3 days)</div>';
        return;
    }
    
    // Calculate metrics
    const totalSleepTimes = entries.map(entry => {
        if (!entry.nightSleep) return 0;
        return (entry.nightSleep.hours || 0) * 60 + (entry.nightSleep.minutes || 0);
    }).filter(time => time > 0);
    
    const avgSleepTime = totalSleepTimes.reduce((sum, time) => sum + time, 0) / totalSleepTimes.length;
    const sleepScores = entries.map(entry => entry.sleepScore || 0).filter(score => score > 0);
    const avgSleepScore = sleepScores.reduce((sum, score) => sum + score, 0) / sleepScores.length;
    
    // Create insights
    const insights = [];
    
    // Sleep duration insight
    if (totalSleepTimes.length > 0) {
        const avgHours = Math.floor(avgSleepTime / 60);
        const avgMinutes = Math.round(avgSleepTime % 60);
        
        let durationMessage = '';
        if (avgSleepTime < 380) { // Less than 6h20m
            durationMessage = 'Your sleep duration is below recommended levels. Aim for at least 7 hours of sleep.';
        } else if (avgSleepTime < 420) { // Less than 7h
            durationMessage = 'Your sleep duration is slightly below ideal. Try to get closer to 7-8 hours.';
        } else if (avgSleepTime <= 510) { // Between 7h and 8h30m
            durationMessage = 'Your sleep duration is within the recommended range. Keep it up!';
        } else {
            durationMessage = 'Your sleep duration is above average. This is generally good, but consistency is key.';
        }
        
        insights.push({
            title: `Average Sleep Duration: ${avgHours}h ${avgMinutes}m`,
            description: durationMessage
        });
    }
    
    // Sleep score insight
    if (sleepScores.length > 0) {
        let scoreMessage = '';
        if (avgSleepScore < 65) {
            scoreMessage = 'Your sleep quality score is below average. Check the factors affecting your sleep.';
        } else if (avgSleepScore < 80) {
            scoreMessage = 'Your sleep quality score is decent. Small improvements could help you feel more rested.';
        } else {
            scoreMessage = 'Your sleep quality score is excellent! You\'re getting good quality sleep.';
        }
        
        insights.push({
            title: `Average Sleep Score: ${Math.round(avgSleepScore)}`,
            description: scoreMessage
        });
    }
    
    // Sleep consistency insight
    if (totalSleepTimes.length >= 3) {
        const sleepTimeVariation = Math.sqrt(
            totalSleepTimes.reduce((sum, time) => sum + Math.pow(time - avgSleepTime, 2), 0) / totalSleepTimes.length
        );
        
        let consistencyMessage = '';
        if (sleepTimeVariation < 30) {
            consistencyMessage = 'Your sleep schedule is very consistent. This is excellent for your body\'s circadian rhythm.';
        } else if (sleepTimeVariation < 60) {
            consistencyMessage = 'Your sleep schedule is fairly consistent. Strive to keep regular sleep hours.';
        } else {
            consistencyMessage = 'Your sleep schedule varies significantly. Try to go to bed and wake up at similar times each day.';
        }
        
        insights.push({
            title: 'Sleep Consistency',
            description: consistencyMessage
        });
    }
    
    // Deep sleep insight
    const deepSleepTimes = entries.map(entry => {
        if (!entry.deepSleep) return 0;
        return (entry.deepSleep.hours || 0) * 60 + (entry.deepSleep.minutes || 0);
    }).filter(time => time > 0);
    
    if (deepSleepTimes.length > 0) {
        const avgDeepSleep = deepSleepTimes.reduce((sum, time) => sum + time, 0) / deepSleepTimes.length;
        const avgDeepHours = Math.floor(avgDeepSleep / 60);
        const avgDeepMinutes = Math.round(avgDeepSleep % 60);
        
        let deepSleepMessage = '';
        if (avgDeepSleep < 90) { // Less than 1h30m
            deepSleepMessage = 'Your deep sleep duration is below recommended levels. Deep sleep is crucial for physical recovery.';
        } else {
            deepSleepMessage = 'Your deep sleep duration is good. Deep sleep contributes to physical recovery and immune function.';
        }
        
        insights.push({
            title: `Average Deep Sleep: ${avgDeepHours}h ${avgDeepMinutes}m`,
            description: deepSleepMessage
        });
    }
    
    // Render insights
    insights.forEach(insight => {
        const insightCard = document.createElement('div');
        insightCard.classList.add('insight-card');
        
        const insightTitle = document.createElement('div');
        insightTitle.classList.add('insight-title');
        insightTitle.textContent = insight.title;
        insightCard.appendChild(insightTitle);
        
        const insightDescription = document.createElement('div');
        insightDescription.classList.add('insight-description');
        insightDescription.textContent = insight.description;
        insightCard.appendChild(insightDescription);
        
        insightsContainer.appendChild(insightCard);
    });
}

function showSettingsModal() {
    // Show modal
    elements.settingsModal.style.display = 'block';
    
    // Fill form with current settings
    document.getElementById('reference-date').value = state.settings.referenceDate;
    document.getElementById('calories-goal').value = state.settings.caloriesGoal;
    document.getElementById('steps-goal').value = state.settings.stepsGoal;
    
    // Sleep thresholds
    document.getElementById('sleep-red-hours').value = state.settings.sleepThresholds.totalSleep.red.hours;
    document.getElementById('sleep-red-minutes').value = state.settings.sleepThresholds.totalSleep.red.minutes;
    
    document.getElementById('sleep-yellow-hours').value = state.settings.sleepThresholds.totalSleep.yellow.hours;
    document.getElementById('sleep-yellow-minutes').value = state.settings.sleepThresholds.totalSleep.yellow.minutes;
    
    document.getElementById('sleep-darkgreen-hours').value = state.settings.sleepThresholds.totalSleep.darkGreen.hours;
    document.getElementById('sleep-darkgreen-minutes').value = state.settings.sleepThresholds.totalSleep.darkGreen.minutes;
    
    document.getElementById('deep-min-hours').value = state.settings.sleepThresholds.deepSleep.minimum.hours;
    document.getElementById('deep-min-minutes').value = state.settings.sleepThresholds.deepSleep.minimum.minutes;
    
    document.getElementById('light-min-hours').value = state.settings.sleepThresholds.lightSleep.minimum.hours;
    document.getElementById('light-min-minutes').value = state.settings.sleepThresholds.lightSleep.minimum.minutes;
    
    document.getElementById('light-max-hours').value = state.settings.sleepThresholds.lightSleep.maximum.hours;
    document.getElementById('light-max-minutes').value = state.settings.sleepThresholds.lightSleep.maximum.minutes;
    
    document.getElementById('rem-red-hours').value = state.settings.sleepThresholds.remSleep.red.hours;
    document.getElementById('rem-red-minutes').value = state.settings.sleepThresholds.remSleep.red.minutes;
    
    document.getElementById('rem-yellow-hours').value = state.settings.sleepThresholds.remSleep.yellow.hours;
    document.getElementById('rem-yellow-minutes').value = state.settings.sleepThresholds.remSleep.yellow.minutes;
    
    // Theme
    document.getElementById('theme-selector').value = state.settings.theme;
    
    // Accent color
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-color') === state.settings.accentColor) {
            option.classList.add('selected');
        }
    });
    
    // Populate tags list
    const tagsList = document.getElementById('tags-list');
    tagsList.innerHTML = '';
    
    state.tags.forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.classList.add('tag-item');
        
        const tagSpan = document.createElement('span');
        tagSpan.textContent = tag.name;
        tagSpan.style.backgroundColor = tag.color;
        
        // Adjust text color for better contrast
        const luminance = getLuminance(tag.color);
        if (luminance < 0.5) {
            tagSpan.style.color = 'white';
        } else {
            tagSpan.style.color = 'black';
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-tag-btn');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', function() {
            deleteTag(tag.id);
        });
        
        tagItem.appendChild(tagSpan);
        tagItem.appendChild(deleteBtn);
        
        tagsList.appendChild(tagItem);
    });
}

function deleteTag(tagId) {
    // Remove tag from state
    state.tags = state.tags.filter(tag => tag.id !== tagId);
    
    // Remove tag from entries
    state.entries.forEach(entry => {
        if (entry.tags) {
            const tagName = state.tags.find(t => t.id === tagId)?.name;
            if (tagName) {
                entry.tags = entry.tags.filter(t => t !== tagName);
            }
        }
    });
    
    // Save data
    saveData();
    
    // Update tag filter
    updateTagFilter();
    
    // Refresh settings modal
    showSettingsModal();
}

function addNewTag() {
    const tagName = document.getElementById('new-tag').value.trim();
    const tagColor = document.getElementById('tag-color').value;
    
    if (!tagName) return;
    
    // Check if tag already exists
    if (state.tags.some(tag => tag.name === tagName)) {
        alert(`Tag "${tagName}" already exists.`);
        return;
    }
    
    // Add new tag
    state.tags.push({
        id: Date.now().toString(),
        name: tagName,
        color: tagColor
    });
    
    // Save data
    saveData();
    
    // Update tag filter
    updateTagFilter();
    
    // Clear input
    document.getElementById('new-tag').value = '';
    
    // Refresh settings modal
    showSettingsModal();
}

function saveSettings(event) {
    event.preventDefault();
    
    // Collect form data
    state.settings.referenceDate = document.getElementById('reference-date').value;
    state.settings.caloriesGoal = parseInt(document.getElementById('calories-goal').value);
    state.settings.stepsGoal = parseInt(document.getElementById('steps-goal').value);
    
    // Sleep thresholds
    state.settings.sleepThresholds.totalSleep.red.hours = parseInt(document.getElementById('sleep-red-hours').value);
    state.settings.sleepThresholds.totalSleep.red.minutes = parseInt(document.getElementById('sleep-red-minutes').value);
    
    state.settings.sleepThresholds.totalSleep.yellow.hours = parseInt(document.getElementById('sleep-yellow-hours').value);
    state.settings.sleepThresholds.totalSleep.yellow.minutes = parseInt(document.getElementById('sleep-yellow-minutes').value);
    
    state.settings.sleepThresholds.totalSleep.darkGreen.hours = parseInt(document.getElementById('sleep-darkgreen-hours').value);
    state.settings.sleepThresholds.totalSleep.darkGreen.minutes = parseInt(document.getElementById('sleep-darkgreen-minutes').value);
    
    state.settings.sleepThresholds.deepSleep.minimum.hours = parseInt(document.getElementById('deep-min-hours').value);
    state.settings.sleepThresholds.deepSleep.minimum.minutes = parseInt(document.getElementById('deep-min-minutes').value);
    
    state.settings.sleepThresholds.lightSleep.minimum.hours = parseInt(document.getElementById('light-min-hours').value);
    state.settings.sleepThresholds.lightSleep.minimum.minutes = parseInt(document.getElementById('light-min-minutes').value);
    
    state.settings.sleepThresholds.lightSleep.maximum.hours = parseInt(document.getElementById('light-max-hours').value);
    state.settings.sleepThresholds.lightSleep.maximum.minutes = parseInt(document.getElementById('light-max-minutes').value);
    
    state.settings.sleepThresholds.remSleep.red.hours = parseInt(document.getElementById('rem-red-hours').value);
    state.settings.sleepThresholds.remSleep.red.minutes = parseInt(document.getElementById('rem-red-minutes').value);
    
    state.settings.sleepThresholds.remSleep.yellow.hours = parseInt(document.getElementById('rem-yellow-hours').value);
    state.settings.sleepThresholds.remSleep.yellow.minutes = parseInt(document.getElementById('rem-yellow-minutes').value);
    
    // Save data
    saveData();
    
    // Hide modal
    elements.settingsModal.style.display = 'none';
    
    // Update UI
    updateDateDisplay();
    renderEntries();
    updateStatistics();
}

function renderEntries() {
    // Clear existing entries
    elements.sleepData.innerHTML = '';
    
    // Filter entries for current month
    const currentYear = state.currentMonth.getFullYear();
    const currentMonth = state.currentMonth.getMonth();
    
    const filteredEntries = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
    });
    
    // Sort entries by date
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Define the reference date for day calculations
    const referenceDate = new Date(state.settings.referenceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    
    // Render entries
    filteredEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((entryDate - referenceDate) / (1000 * 60 * 60 * 24));
        const daysDiffFromToday = Math.floor((entryDate - today) / (1000 * 60 * 60 * 24));
        
        // Determine day color based on difference from today
        let dayColor = '';
        if (daysDiffFromToday < 0) {
            dayColor = 'red-day'; // Past
        } else if (daysDiffFromToday > 0) {
            dayColor = 'green-day'; // Future
        } else {
            dayColor = 'today-day'; // Today
        }
        
        // Determine week number for shading (Goal #10)
        let weekShade = '';
        if (daysDiffFromToday < 0) {
            const weeksAgo = Math.floor(Math.abs(daysDiffFromToday) / 7) + 1;
            if (weeksAgo <= 4) {
                weekShade = `week-${weeksAgo}-past`;
            }
        } else if (daysDiffFromToday > 0) {
            const weeksAhead = Math.floor(daysDiffFromToday / 7) + 1;
            if (weeksAhead <= 4) {
                weekShade = `week-${weeksAhead}-future`;
            }
        }
        
        // Determine if this is a week separator
        const isWeekSeparator = entryDate.getDay() === 0; // Sunday
        
        // Create row
        const row = document.createElement('tr');
        if (daysDiffFromToday === 0) {
            row.classList.add('today-row');
        }
        
        if (isWeekSeparator) {
            row.classList.add('week-separator');
        }
        
        if (weekShade) {
            row.classList.add(weekShade);
        }
        
        // Cell for day number
        const dayCell = document.createElement('td');
        dayCell.classList.add('day-num', dayColor);
        dayCell.textContent = daysDiff;
        row.appendChild(dayCell);
        
        // Cell for days from today - new column (Goal #10)
        const daysFromTodayCell = document.createElement('td');
        daysFromTodayCell.classList.add('days-from-today');
        
        if (daysDiffFromToday < 0) {
            daysFromTodayCell.textContent = daysDiffFromToday;
            daysFromTodayCell.classList.add('days-past');
        } else if (daysDiffFromToday > 0) {
            daysFromTodayCell.textContent = `+${daysDiffFromToday}`;
            daysFromTodayCell.classList.add('days-future');
        } else {
            daysFromTodayCell.textContent = '0';
            daysFromTodayCell.classList.add('days-today');
        }
        row.appendChild(daysFromTodayCell);
        
        // Cell for date
        const dateCell = document.createElement('td');
        dateCell.classList.add('date-cell');
        const dayOfWeek = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateCell.innerHTML = `<span class="day-of-week">${dayOfWeek}</span> ${formattedDate}`;
        row.appendChild(dateCell);
        
        // Cell for sleep score
        const sleepScoreCell = createCell(entry.sleepScore || '', getScoreColor(entry.sleepScore));
        row.appendChild(sleepScoreCell);
        
        // Cell for night sleep
        const nightSleepCell = createCell(formatTime(entry.nightSleep), getSleepColor(entry.nightSleep));
        row.appendChild(nightSleepCell);
        
        // Cell for day nap
        const dayNapCell = createCell(formatTime(entry.dayNap));
        row.appendChild(dayNapCell);
        
        // Cell for deep sleep
        const deepSleepCell = createCell(formatTime(entry.deepSleep), getDeepSleepColor(entry.deepSleep, entry.nightSleep));
        row.appendChild(deepSleepCell);
        
        // Cell for light sleep
        const lightSleepCell = createCell(formatTime(entry.lightSleep), getLightSleepColor(entry.lightSleep, entry.nightSleep));
        row.appendChild(lightSleepCell);
        
        // Cell for REM sleep
        const remSleepCell = createCell(formatTime(entry.remSleep), getRemSleepColor(entry.remSleep));
        row.appendChild(remSleepCell);
        
        // Cell for wake ups
        const wakeUpsCell = createCell(entry.wakeUps || '');
        row.appendChild(wakeUpsCell);
        
        // Cell for cut sleep
        const cutSleepCell = createCell(entry.cutSleep ? '✓' : '');
        row.appendChild(cutSleepCell);
        
        // Cell for shake
        const shakeCell = createCell(entry.shake ? '✓' : '');
        row.appendChild(shakeCell);
        
        // Cell for seizure
        const seizureCell = createCell(entry.seizure ? '✓' : '');
        row.appendChild(seizureCell);
        
        // Cell for events/notes
        const eventsCell = document.createElement('td');
        eventsCell.classList.add('events-cell');
        if (entry.eventsNotes) {
            eventsCell.textContent = entry.eventsNotes.length > 20 ? 
                entry.eventsNotes.substring(0, 20) + '...' : entry.eventsNotes;
            eventsCell.classList.add('has-content');
            eventsCell.addEventListener('click', () => showEntryPreview(entry.id));
        } else {
            eventsCell.textContent = '';
            if (entry.isEmpty) {
                eventsCell.classList.add('empty-cell');
            }
            eventsCell.addEventListener('click', () => showAddEntryModal(entryDate));
        }
        row.appendChild(eventsCell);
        
        // Cell for Afro
        const afroCell = createCell(entry.afr ? '✓' : '');
        row.appendChild(afroCell);
        
        // Cell for calories
        const caloriesCell = createCell(entry.calories || '', getCaloriesColor(entry.calories));
        row.appendChild(caloriesCell);
        
        // Cell for steps
        const stepsCell = createCell(entry.steps ? entry.steps.toLocaleString() : '', getStepsColor(entry.steps));
        row.appendChild(stepsCell);
        
        // Cell for weight
        const weightCell = createCell(entry.weight || '');
        row.appendChild(weightCell);
        
        // Cell for standing
        const standingCell = createCell(entry.standing || '', getStandingColor(entry.standing));
        row.appendChild(standingCell);
        
        // Cell for pills
        const pillsCell = createCell(formatPills(entry.pills));
        row.appendChild(pillsCell);
        
        // Cell for actions
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('actions-cell');
        
        const editBtn = document.createElement('button');
        editBtn.classList.add('action-btn', 'edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.setAttribute('data-entry-id', entry.id);
        editBtn.addEventListener('click', () => showEditEntryModal(entry.id));
        actionsCell.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('action-btn', 'delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteEntry(entry.id));
        actionsCell.appendChild(deleteBtn);
        
        row.appendChild(actionsCell);
        
        elements.sleepData.appendChild(row);
    });
    
    // If no entries, show placeholder
    if (filteredEntries.length === 0) {
        const placeholderRow = document.createElement('tr');
        const placeholderCell = document.createElement('td');
        placeholderCell.colSpan = 21; // Updated column count
        placeholderCell.textContent = 'No entries for this month. Click the "Add New Entry" button to add one.';
        placeholderCell.classList.add('placeholder-cell');
        placeholderRow.appendChild(placeholderCell);
        elements.sleepData.appendChild(placeholderRow);
    }
    
    // Update tags row
    updateTagsRow();
}
//END RENDER ENTITIES

function filterEntries() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const selectedTag = elements.tagFilter.value;
    
    const rows = elements.sleepData.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (row.querySelector('.placeholder-cell')) {
            return; // Skip placeholder row
        }
        
        const text = row.innerText.toLowerCase();
        
        // Get entry ID from the edit button
        const editBtn = row.querySelector('.edit-btn');
        if (!editBtn) return;
        
        const entryId = editBtn.getAttribute('data-entry-id');
        const entry = state.entries.find(e => e.id === entryId);
        
        let showRow = true;
        
        // Check search term
        if (searchTerm && !text.includes(searchTerm)) {
            showRow = false;
        }
        
        // Check tag filter
        if (selectedTag && entry && (!entry.tags || !entry.tags.includes(selectedTag))) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function showEntryPreview(entryId) {
    // Get entry
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Save selected entry ID for edit button
    state.selectedEntryId = entryId;
    
    // Format date
    const entryDate = new Date(entry.date);
    const formattedDate = entryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    // Create preview content
    const previewContent = document.getElementById('entry-preview-content');
    previewContent.innerHTML = '';
    
    const dateHeader = document.createElement('h3');
    dateHeader.id = 'preview-date';
    dateHeader.textContent = formattedDate;
    previewContent.appendChild(dateHeader);
    
    const tagsContainer = document.createElement('div');
    tagsContainer.id = 'preview-tags';
    tagsContainer.classList.add('tags-container');
    
    if (entry.tags && entry.tags.length > 0) {
        entry.tags.forEach(tagName => {
            const tag = state.tags.find(t => t.name === tagName);
            if (tag) {
                const tagElement = document.createElement('span');
                tagElement.classList.add('tag');
                tagElement.textContent = tag.name;
                tagElement.style.backgroundColor = tag.color;
                
                // Adjust text color for better contrast
                const luminance = getLuminance(tag.color);
                if (luminance < 0.5) {
                    tagElement.style.color = 'white';
                } else {
                    tagElement.style.color = 'black';
                }
                
                tagsContainer.appendChild(tagElement);
            }
        });
    } else {
        tagsContainer.textContent = 'No tags';
    }
    previewContent.appendChild(tagsContainer);
    
    // Add tasks section (Goal #2)
    if (state.tasks[entry.date] && state.tasks[entry.date].length > 0) {
        const tasksSection = document.createElement('div');
        tasksSection.classList.add('preview-tasks');
        
        const tasksTitle = document.createElement('h4');
        tasksTitle.textContent = 'Tasks';
        tasksSection.appendChild(tasksTitle);
        
        const tasksList = document.createElement('ul');
        tasksList.classList.add('preview-tasks-list');
        
        state.tasks[entry.date].forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.textContent = task.text;
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            tasksList.appendChild(taskItem);
        });
        
        tasksSection.appendChild(tasksList);
        previewContent.appendChild(tasksSection);
    }
    
    // Notes section
    if (entry.eventsNotes) {
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('preview-notes');
        contentContainer.innerHTML = entry.eventsNotes.replace(/\n/g, '<br>');
        
        const notesTitle = document.createElement('h4');
        notesTitle.textContent = 'Notes';
        contentContainer.prepend(notesTitle);
        
        previewContent.appendChild(contentContainer);
    }
    
    // Create a section for sleep stats
    if (entry.nightSleep || entry.deepSleep || entry.lightSleep || entry.remSleep) {
        const statsSection = document.createElement('div');
        statsSection.classList.add('preview-stats');
        
        const statsTitle = document.createElement('h4');
        statsTitle.textContent = 'Sleep Statistics';
        statsSection.appendChild(statsTitle);
        
        const statsList = document.createElement('ul');
        
        if (entry.sleepScore) {
            const scoreItem = document.createElement('li');
            scoreItem.textContent = `Sleep Score: ${entry.sleepScore}`;
            statsList.appendChild(scoreItem);
        }
        
        if (entry.nightSleep) {
            const nightSleepItem = document.createElement('li');
            nightSleepItem.textContent = `Night Sleep: ${formatTime(entry.nightSleep)}`;
            statsList.appendChild(nightSleepItem);
        }
        
        if (entry.deepSleep) {
            const deepSleepItem = document.createElement('li');
            deepSleepItem.textContent = `Deep Sleep: ${formatTime(entry.deepSleep)}`;
            statsList.appendChild(deepSleepItem);
        }
        
        if (entry.lightSleep) {
            const lightSleepItem = document.createElement('li');
            lightSleepItem.textContent = `Light Sleep: ${formatTime(entry.lightSleep)}`;
            statsList.appendChild(lightSleepItem);
        }
        
        if (entry.remSleep) {
            const remSleepItem = document.createElement('li');
            remSleepItem.textContent = `REM Sleep: ${formatTime(entry.remSleep)}`;
            statsList.appendChild(remSleepItem);
        }
        
        statsSection.appendChild(statsList);
        previewContent.appendChild(statsSection);
    }
    
    // Show modal
    elements.entryPreviewModal.style.display = 'block';
}

function showAddEntryModal(date) {
    // Reset form
    elements.entryForm.reset();
    elements.entryId.value = '';
    
    // Set modal title
    document.getElementById('modal-title').textContent = 'Add New Entry';
    
    // Set date if provided
    if (date) {
        if (typeof date === 'string') {
            elements.entryDate.value = date;
        } else {
            elements.entryDate.value = date.toISOString().split('T')[0];
        }
    } else {
        // Default to today
        const today = new Date();
        elements.entryDate.value = today.toISOString().split('T')[0];
    }
    
    // Clear tasks
    state.currentTasks = [];
    renderTasks();
    
    // Show modal
    elements.entryModal.style.display = 'block';
}

function showEditEntryModal(entryId) {
    // Get entry
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Set modal title
    document.getElementById('modal-title').textContent = 'Edit Entry';
    
    // Fill form
    elements.entryId.value = entry.id;
    elements.entryDate.value = entry.date;
    elements.sleepScore.value = entry.sleepScore || '';
    
    // Night sleep
    if (entry.nightSleep) {
        document.getElementById('night-sleep-hours').value = entry.nightSleep.hours || '';
        document.getElementById('night-sleep-minutes').value = entry.nightSleep.minutes || '';
    } else {
        document.getElementById('night-sleep-hours').value = '';
        document.getElementById('night-sleep-minutes').value = '';
    }
    
    // Day nap
    if (entry.dayNap) {
        document.getElementById('day-nap-hours').value = entry.dayNap.hours || '';
        document.getElementById('day-nap-minutes').value = entry.dayNap.minutes || '';
    } else {
        document.getElementById('day-nap-hours').value = '';
        document.getElementById('day-nap-minutes').value = '';
    }
    
    // Deep sleep
    if (entry.deepSleep) {
        document.getElementById('deep-sleep-hours').value = entry.deepSleep.hours || '';
        document.getElementById('deep-sleep-minutes').value = entry.deepSleep.minutes || '';
    } else {
        document.getElementById('deep-sleep-hours').value = '';
        document.getElementById('deep-sleep-minutes').value = '';
    }
    
    // Light sleep
    if (entry.lightSleep) {
        document.getElementById('light-sleep-hours').value = entry.lightSleep.hours || '';
        document.getElementById('light-sleep-minutes').value = entry.lightSleep.minutes || '';
    } else {
        document.getElementById('light-sleep-hours').value = '';
        document.getElementById('light-sleep-minutes').value = '';
    }
    
    // REM sleep
    if (entry.remSleep) {
        document.getElementById('rem-sleep-hours').value = entry.remSleep.hours || '';
        document.getElementById('rem-sleep-minutes').value = entry.remSleep.minutes || '';
    } else {
        document.getElementById('rem-sleep-hours').value = '';
        document.getElementById('rem-sleep-minutes').value = '';
    }
    
    // Wake ups
    document.getElementById('wake-ups').value = entry.wakeUps || '';
    
    // Checkboxes
    document.getElementById('cut-sleep').checked = entry.cutSleep || false;
    document.getElementById('shake').checked = entry.shake || false;
    document.getElementById('seizure').checked = entry.seizure || false;
    document.getElementById('afr').checked = entry.afr || false;
    
    // Events/notes
    document.getElementById('events-notes').value = entry.eventsNotes || '';
    
    // Tags
    document.getElementById('tags').value = entry.tags ? entry.tags.join(', ') : '';
    
    // Calories, steps, weight, standing
    document.getElementById('calories').value = entry.calories || '';
    document.getElementById('steps').value = entry.steps || '';
    document.getElementById('weight').value = entry.weight || '';
    document.getElementById('standing').value = entry.standing || '';
    
    // Pills
    document.getElementById('pill-1').checked = entry.pills && entry.pills.includes('Pill 1') || false;
    document.getElementById('pill-2').checked = entry.pills && entry.pills.includes('Pill 2') || false;
    document.getElementById('pill-3').checked = entry.pills && entry.pills.includes('Pill 3') || false;
    
    // Load tasks for this entry (Goal #2)
    state.currentTasks = state.tasks[entry.date] || [];
    renderTasks();
    
    // Show modal
    elements.entryModal.style.display = 'block';
}

function saveEntry(event) {
    event.preventDefault();
    
    // Get form data
    const entryId = elements.entryId.value;
    const date = elements.entryDate.value;
    const sleepScore = elements.sleepScore.value ? parseInt(elements.sleepScore.value) : null;
    
    // Night sleep
    const nightSleepHours = document.getElementById('night-sleep-hours').value;
    const nightSleepMinutes = document.getElementById('night-sleep-minutes').value;
    const nightSleep = (nightSleepHours || nightSleepMinutes) ? {
        hours: nightSleepHours ? parseInt(nightSleepHours) : 0,
        minutes: nightSleepMinutes ? parseInt(nightSleepMinutes) : 0
    } : null;
    
    // Day nap
    const dayNapHours = document.getElementById('day-nap-hours').value;
    const dayNapMinutes = document.getElementById('day-nap-minutes').value;
    const dayNap = (dayNapHours || dayNapMinutes) ? {
        hours: dayNapHours ? parseInt(dayNapHours) : 0,
        minutes: dayNapMinutes ? parseInt(dayNapMinutes) : 0
    } : null;
    
    // Deep sleep
    const deepSleepHours = document.getElementById('deep-sleep-hours').value;
    const deepSleepMinutes = document.getElementById('deep-sleep-minutes').value;
    const deepSleep = (deepSleepHours || deepSleepMinutes) ? {
        hours: deepSleepHours ? parseInt(deepSleepHours) : 0,
        minutes: deepSleepMinutes ? parseInt(deepSleepMinutes) : 0
    } : null;
    
    // Light sleep
    const lightSleepHours = document.getElementById('light-sleep-hours').value;
    const lightSleepMinutes = document.getElementById('light-sleep-minutes').value;
    const lightSleep = (lightSleepHours || lightSleepMinutes) ? {
        hours: lightSleepHours ? parseInt(lightSleepHours) : 0,
        minutes: lightSleepMinutes ? parseInt(lightSleepMinutes) : 0
    } : null;
    
    // REM sleep
    const remSleepHours = document.getElementById('rem-sleep-hours').value;
    const remSleepMinutes = document.getElementById('rem-sleep-minutes').value;
    const remSleep = (remSleepHours || remSleepMinutes) ? {
        hours: remSleepHours ? parseInt(remSleepHours) : 0,
        minutes: remSleepMinutes ? parseInt(remSleepMinutes) : 0
    } : null;
    
    // Wake ups
    const wakeUps = document.getElementById('wake-ups').value ? parseInt(document.getElementById('wake-ups').value) : null;
    
    // Checkboxes
    const cutSleep = document.getElementById('cut-sleep').checked;
    const shake = document.getElementById('shake').checked;
    const seizure = document.getElementById('seizure').checked;
    const afr = document.getElementById('afr').checked;
    
    // Events/notes
    const eventsNotes = document.getElementById('events-notes').value;
    
    // Tags
    const tagsInput = document.getElementById('tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Calories, steps, weight, standing
    const calories = document.getElementById('calories').value ? parseInt(document.getElementById('calories').value) : null;
    const steps = document.getElementById('steps').value ? parseInt(document.getElementById('steps').value) : null;
    const weight = document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null;
    const standing = document.getElementById('standing').value ? parseInt(document.getElementById('standing').value) : null;
    
    // Pills
    const pills = [];
    if (document.getElementById('pill-1').checked) pills.push('Pill 1');
    if (document.getElementById('pill-2').checked) pills.push('Pill 2');
    if (document.getElementById('pill-3').checked) pills.push('Pill 3');
    
    // Create entry object
    const entry = {
        id: entryId || `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date,
        sleepScore,
        nightSleep,
        dayNap,
        deepSleep,
        lightSleep,
        remSleep,
        wakeUps,
        cutSleep,
        shake,
        seizure,
        afr,
        eventsNotes,
        tags,
        calories,
        steps,
        weight,
        standing,
        pills: pills.length > 0 ? pills : null
    };
    
    // Check if this is a new entry or an update
    if (entryId) {
        // Update existing entry
        const entryIndex = state.entries.findIndex(e => e.id === entryId);
        if (entryIndex !== -1) {
            state.entries[entryIndex] = entry;
        }
    } else {
        // Add new entry
        state.entries.push(entry);
    }
    
    // Save tasks for this entry (Goal #2)
    state.tasks[date] = state.currentTasks;
    
    // Save data
    saveData();
    
    // Hide modal
    elements.entryModal.style.display = 'none';
    
    // Update UI
    renderEntries();
    updateStatistics();
    updateTodayInfo();
    }
});