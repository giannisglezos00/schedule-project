// Sleep Tracker Script
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
        eventsTimeline: document.getElementById('events-timeline')
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

    function getCaloriesColor(calories) {
        if (!calories) return '';
        
        const goal = state.settings.caloriesGoal;
        
        if (calories < goal * 0.7) return '#FF5733'; // Red (too low)
        if (calories > goal * 1.3) return '#FF5733'; // Red (too high)
        if (calories < goal * 0.9 || calories > goal * 1.1) return '#FFC300'; // Yellow
        return '#EF8A2B'; // Orange (on target) - updated per Goal #9
    }
    
    // Initialize the app
    init();
});