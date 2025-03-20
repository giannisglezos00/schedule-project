// Sleep Tracker Script
document.addEventListener('DOMContentLoaded', function() {
    // App state
    const state = {
        entries: [],
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
        selectedEntryId: null
    };

    // DOM Elements
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
        
        // Dashboard charts
        sleepTrendChart: document.getElementById('sleep-trend-chart'),
        compositionChart: document.getElementById('composition-chart'),
        activityChart: document.getElementById('activity-chart'),
        eventsTimeline: document.getElementById('events-timeline')
    };

    // Initialize
    init();

    // Core functions
    function init() {
        loadData();
        setupEventListeners();
        updateDateDisplay();
        updateMonthDisplay();
        renderEntries();
        updateTodayInfo();
        updateStatistics(state.entries); // Pass state.entries explicitly
    }

    function loadData() {
        // Load entries from localStorage
        const savedEntries = localStorage.getItem('sleepEntries');
        if (savedEntries) {
            state.entries = JSON.parse(savedEntries);
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

    function saveData() {
        localStorage.setItem('sleepEntries', JSON.stringify(state.entries));
        localStorage.setItem('sleepTags', JSON.stringify(state.tags));
        localStorage.setItem('sleepSettings', JSON.stringify(state.settings));
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

        // Apply initial theme
        applyTheme();
    }

    function applyTheme() {
        // Apply theme to document body
        if (state.settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (state.settings.theme === 'light') {
            document.body.classList.remove('dark-theme');
        } else if (state.settings.theme === 'auto') {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }
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
    }

    function navigateToNextMonth() {
        state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
        updateMonthDisplay();
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
            
            // Cell for day number
            const dayCell = document.createElement('td');
            dayCell.classList.add('day-num', dayColor);
            dayCell.textContent = daysDiff;
            row.appendChild(dayCell);
            
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
            placeholderCell.colSpan = 20;
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
        return '#4A6BFF'; // Blue (ideal)
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
        return '#2C7DD4'; // Light blue (ideal)
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
        return '#3DD3CB'; // Turquoise (good)
    }

    function getCaloriesColor(calories) {
        if (!calories) return '';
        
        const goal = state.settings.caloriesGoal;
        
        if (calories < goal * 0.7) return '#FF5733'; // Red (too low)
        if (calories > goal * 1.3) return '#FF5733'; // Red (too high)
        if (calories < goal * 0.9 || calories > goal * 1.1) return '#FFC300'; // Yellow
        return '#EF8A2B'; // Orange (on target)
    }

    function getStepsColor(steps) {
        if (!steps) return '';
        
        const goal = state.settings.stepsGoal;
        
        if (steps < goal * 0.5) return '#FF5733'; // Red
        if (steps < goal * 0.8) return '#FFC300'; // Yellow
        if (steps > goal * 1.2) return '#2E7D32'; // Dark green
        return '#E0CB08'; // Yellow-green (on target)
    }

    function getStandingColor(hours) {
        if (!hours) return '';
        
        if (hours < 6) return '#FF5733'; // Red
        if (hours < 8) return '#FFC300'; // Yellow
        if (hours > 12) return '#2E7D32'; // Dark green
        return '#43C677'; // Green (on target)
    }

    function getLuminance(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16) / 255;
        const g = parseInt(hexColor.substr(3, 2), 16) / 255;
        const b = parseInt(hexColor.substr(5, 2), 16) / 255;
        
        // Calculate luminance
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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

    function updateTagFilter() {
        elements.tagFilter.innerHTML = '<option value="">All Tags</option>';
        
        state.tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.name;
            option.textContent = tag.name;
            elements.tagFilter.appendChild(option);
        });
    }

    function updateTodayInfo() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find entry for today
        const todayEntry = state.entries.find(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });
        
        // Clear existing tasks
        elements.todayTasks.innerHTML = '';
        elements.todayTagsList.innerHTML = '';
        
        if (todayEntry) {
            // Add tasks from events/notes
            if (todayEntry.eventsNotes) {
                const tasks = todayEntry.eventsNotes.split('\n');
                tasks.forEach(task => {
                    if (task.trim()) {
                        const li = document.createElement('li');
                        li.textContent = task;
                        elements.todayTasks.appendChild(li);
                    }
                });
            }
            
            // Add tags
            if (todayEntry.tags && todayEntry.tags.length > 0) {
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
            }
        } else {
            // No entry for today
            const li = document.createElement('li');
            li.textContent = 'No tasks for today.';
            elements.todayTasks.appendChild(li);
        }
    }
    
    function showAddEntryModal(date = null) {
        // Clear form
        elements.entryForm.reset();
        elements.entryId.value = '';
        
        // Set date to today if not provided
        if (date) {
            // Ensure date is a valid Date object
            date = date instanceof Date ? date : new Date(date);
            
            // Check if date is valid before converting
            if (!isNaN(date.getTime())) {
                elements.entryDate.value = date.toISOString().split('T')[0];
            } else {
                elements.entryDate.value = new Date().toISOString().split('T')[0];
            }
        } else {
            elements.entryDate.value = new Date().toISOString().split('T')[0];
        }
        
        // Show modal
        elements.entryModal.style.display = 'block';
        document.getElementById('modal-title').textContent = 'Add New Entry';
    }
    
    function showEditEntryModal(entryId) {
        const entry = state.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        // Fill form with entry data
        elements.entryId.value = entry.id;
        elements.entryDate.value = entry.date;
        elements.sleepScore.value = entry.sleepScore || '';
        
        // Set night sleep
        if (entry.nightSleep) {
            document.getElementById('night-sleep-hours').value = entry.nightSleep.hours || '';
            document.getElementById('night-sleep-minutes').value = entry.nightSleep.minutes || '';
        } else {
            document.getElementById('night-sleep-hours').value = '';
            document.getElementById('night-sleep-minutes').value = '';
        }
        
        // Set day nap
        if (entry.dayNap) {
            document.getElementById('day-nap-hours').value = entry.dayNap.hours || '';
            document.getElementById('day-nap-minutes').value = entry.dayNap.minutes || '';
        } else {
            document.getElementById('day-nap-hours').value = '';
            document.getElementById('day-nap-minutes').value = '';
        }
        
        // Set deep sleep
        if (entry.deepSleep) {
            document.getElementById('deep-sleep-hours').value = entry.deepSleep.hours || '';
            document.getElementById('deep-sleep-minutes').value = entry.deepSleep.minutes || '';
        } else {
            document.getElementById('deep-sleep-hours').value = '';
            document.getElementById('deep-sleep-minutes').value = '';
        }
        
        // Set light sleep
        if (entry.lightSleep) {
            document.getElementById('light-sleep-hours').value = entry.lightSleep.hours || '';
            document.getElementById('light-sleep-minutes').value = entry.lightSleep.minutes || '';
        } else {
            document.getElementById('light-sleep-hours').value = '';
            document.getElementById('light-sleep-minutes').value = '';
        }
        
        // Set REM sleep
        if (entry.remSleep) {
            document.getElementById('rem-sleep-hours').value = entry.remSleep.hours || '';
            document.getElementById('rem-sleep-minutes').value = entry.remSleep.minutes || '';
        } else {
            document.getElementById('rem-sleep-hours').value = '';
            document.getElementById('rem-sleep-minutes').value = '';
        }
        
        // Set wakeups
        document.getElementById('wake-ups').value = entry.wakeUps || '';
        
        // Set checkboxes
        document.getElementById('cut-sleep').checked = entry.cutSleep || false;
        document.getElementById('shake').checked = entry.shake || false;
        document.getElementById('seizure').checked = entry.seizure || false;
        document.getElementById('afr').checked = entry.afr || false;
        
        // Set events/notes
        document.getElementById('events-notes').value = entry.eventsNotes || '';
        
        // Set tags
        document.getElementById('tags').value = entry.tags ? entry.tags.join(', ') : '';
        
        // Set calories
        document.getElementById('calories').value = entry.calories || '';
        
        // Set steps
        document.getElementById('steps').value = entry.steps || '';
        
        // Set weight
        document.getElementById('weight').value = entry.weight || '';
        
        // Set standing
        document.getElementById('standing').value = entry.standing || '';
        
        // Set pills (checkboxes)
        document.getElementById('pill-1').checked = false;
        document.getElementById('pill-2').checked = false;
        document.getElementById('pill-3').checked = false;
        
        if (entry.pills && entry.pills.length > 0) {
            entry.pills.forEach(pill => {
                const pillCheckbox = document.getElementById(`pill-${pill}`);
                if (pillCheckbox) pillCheckbox.checked = true;
            });
        }
        
        // Show modal
        elements.entryModal.style.display = 'block';
        document.getElementById('modal-title').textContent = 'Edit Entry';
    }
    
    function showEntryPreview(entryId) {
        const entry = state.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        state.selectedEntryId = entryId;
        
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
        
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('preview-notes');
        contentContainer.textContent = entry.eventsNotes || 'No notes for this entry.';
        previewContent.appendChild(contentContainer);
        
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
    
    function showSettingsModal() {
        // Fill form with settings data
        document.getElementById('reference-date').value = state.settings.referenceDate;
        document.getElementById('calories-goal').value = state.settings.caloriesGoal;
        document.getElementById('steps-goal').value = state.settings.stepsGoal;
        
        // Set sleep thresholds
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
        
        // Set theme
        document.getElementById('theme-selector').value = state.settings.theme;
        
        // Show existing tags
        const tagsContainer = document.getElementById('tags-list');
        tagsContainer.innerHTML = '';
        
        state.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.classList.add('tag-item');
            
            const tagName = document.createElement('span');
            tagName.textContent = tag.name;
            tagName.style.backgroundColor = tag.color;
            
            // Adjust text color for better contrast
            const luminance = getLuminance(tag.color);
            if (luminance < 0.5) {
                tagName.style.color = 'white';
            } else {
                tagName.style.color = 'black';
            }
            
            tagElement.appendChild(tagName);
            
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.value = tag.color;
            colorPicker.addEventListener('change', function() {
                tag.color = this.value;
                tagName.style.backgroundColor = this.value;
                
                // Adjust text color for better contrast
                const luminance = getLuminance(this.value);
                if (luminance < 0.5) {
                    tagName.style.color = 'white';
                } else {
                    tagName.style.color = 'black';
                }
                
                saveData();
                renderEntries();
                updateTagsRow();
            });
            tagElement.appendChild(colorPicker);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-tag-btn');
            deleteBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
            deleteBtn.addEventListener('click', function() {
                state.tags = state.tags.filter(t => t.id !== tag.id);
                saveData();
                updateTagFilter();
                renderEntries();
                updateTagsRow();
                showSettingsModal(); // Refresh settings modal
            });
            tagElement.appendChild(deleteBtn);
            
            tagsContainer.appendChild(tagElement);
        });
        
        // Show modal
        elements.settingsModal.style.display = 'block';
    }
    
    function addNewTag() {
        const tagName = document.getElementById('new-tag').value.trim();
        const tagColor = document.getElementById('tag-color').value;
        
        if (!tagName) return;
        
        // Check if tag already exists
        if (state.tags.find(t => t.name === tagName)) {
            alert('Tag already exists!');
            return;
        }
        
        // Add new tag
        state.tags.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: tagName,
            color: tagColor
        });
        
        // Save data
        saveData();
        
        // Refresh display
        updateTagFilter();
        renderEntries();
        updateTagsRow();
        
        // Refresh settings modal
        showSettingsModal();
        
        // Clear input
        document.getElementById('new-tag').value = '';
    }
    
    function deleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry?')) {
            state.entries = state.entries.filter(e => e.id !== entryId);
            saveData();
            renderEntries();
            updateTodayInfo();
            updateStatistics();
        }
    }
    
    function saveEntry(event) {
        event.preventDefault();
        
        const entryId = elements.entryId.value;
        const isNewEntry = !entryId;
        
        // Collect form data
        const entry = {
            id: isNewEntry ? Date.now().toString() + Math.random().toString(36).substr(2, 5) : entryId,
            date: elements.entryDate.value,
            sleepScore: elements.sleepScore.value ? parseInt(elements.sleepScore.value) : null,
            nightSleep: {
                hours: document.getElementById('night-sleep-hours').value ? parseInt(document.getElementById('night-sleep-hours').value) : 0,
                minutes: document.getElementById('night-sleep-minutes').value ? parseInt(document.getElementById('night-sleep-minutes').value) : 0
            },
            dayNap: {
                hours: document.getElementById('day-nap-hours').value ? parseInt(document.getElementById('day-nap-hours').value) : 0,
                minutes: document.getElementById('day-nap-minutes').value ? parseInt(document.getElementById('day-nap-minutes').value) : 0
            },
            deepSleep: {
                hours: document.getElementById('deep-sleep-hours').value ? parseInt(document.getElementById('deep-sleep-hours').value) : 0,
                minutes: document.getElementById('deep-sleep-minutes').value ? parseInt(document.getElementById('deep-sleep-minutes').value) : 0
            },
            lightSleep: {
                hours: document.getElementById('light-sleep-hours').value ? parseInt(document.getElementById('light-sleep-hours').value) : 0,
                minutes: document.getElementById('light-sleep-minutes').value ? parseInt(document.getElementById('light-sleep-minutes').value) : 0
            },
            remSleep: {
                hours: document.getElementById('rem-sleep-hours').value ? parseInt(document.getElementById('rem-sleep-hours').value) : 0,
                minutes: document.getElementById('rem-sleep-minutes').value ? parseInt(document.getElementById('rem-sleep-minutes').value) : 0
            },
            wakeUps: document.getElementById('wake-ups').value ? parseInt(document.getElementById('wake-ups').value) : null,
            cutSleep: document.getElementById('cut-sleep').checked,
            shake: document.getElementById('shake').checked,
            seizure: document.getElementById('seizure').checked,
            afr: document.getElementById('afr').checked,
            eventsNotes: document.getElementById('events-notes').value,
            tags: document.getElementById('tags').value ? document.getElementById('tags').value.split(',').map(tag => tag.trim()) : [],
            calories: document.getElementById('calories').value ? parseInt(document.getElementById('calories').value) : null,
            steps: document.getElementById('steps').value ? parseInt(document.getElementById('steps').value) : null,
            weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
            standing: document.getElementById('standing').value ? parseInt(document.getElementById('standing').value) : null,
            pills: []
        };
        
        // Get pills
        if (document.getElementById('pill-1').checked) entry.pills.push('1');
        if (document.getElementById('pill-2').checked) entry.pills.push('2');
        if (document.getElementById('pill-3').checked) entry.pills.push('3');
        
        // Add or update entry
        if (isNewEntry) {
            state.entries.push(entry);
        } else {
            const index = state.entries.findIndex(e => e.id === entryId);
            if (index !== -1) {
                state.entries[index] = entry;
            }
        }
        
        // Save data
        saveData();
        
        // Hide modal
        elements.entryModal.style.display = 'none';
        
        // Update UI
        renderEntries();
        updateTodayInfo();
        updateStatistics();
    }
    
    function saveSettings(event) {
        event.preventDefault();
        
        // Collect form data
        state.settings.referenceDate = document.getElementById('reference-date').value;
        state.settings.caloriesGoal = parseInt(document.getElementById('calories-goal').value) || 2000;
        state.settings.stepsGoal = parseInt(document.getElementById('steps-goal').value) || 10000;
        
        // Collect sleep thresholds
        state.settings.sleepThresholds = {
            totalSleep: {
                red: {
                    hours: parseInt(document.getElementById('sleep-red-hours').value) || 6,
                    minutes: parseInt(document.getElementById('sleep-red-minutes').value) || 20
                },
                yellow: {
                    hours: parseInt(document.getElementById('sleep-yellow-hours').value) || 7,
                    minutes: parseInt(document.getElementById('sleep-yellow-minutes').value) || 0
                },
                darkGreen: {
                    hours: parseInt(document.getElementById('sleep-darkgreen-hours').value) || 8,
                    minutes: parseInt(document.getElementById('sleep-darkgreen-minutes').value) || 30
                }
            },
            deepSleep: {
                minimum: {
                    hours: parseInt(document.getElementById('deep-min-hours').value) || 1,
                    minutes: parseInt(document.getElementById('deep-min-minutes').value) || 30
                }
            },
            lightSleep: {
                minimum: {
                    hours: parseInt(document.getElementById('light-min-hours').value) || 3,
                    minutes: parseInt(document.getElementById('light-min-minutes').value) || 0
                },
                maximum: {
                    hours: parseInt(document.getElementById('light-max-hours').value) || 5,
                    minutes: parseInt(document.getElementById('light-max-minutes').value) || 0
                }
            },
            remSleep: {
                red: {
                    hours: parseInt(document.getElementById('rem-red-hours').value) || 0,
                    minutes: parseInt(document.getElementById('rem-red-minutes').value) || 50
                },
                yellow: {
                    hours: parseInt(document.getElementById('rem-yellow-hours').value) || 1,
                    minutes: parseInt(document.getElementById('rem-yellow-minutes').value) || 2
                }
            }
        };
        
        // Save theme
        state.settings.theme = document.getElementById('theme-selector').value;
        
        // Apply theme
        applyTheme();
        
        // Save data
        saveData();
        
        // Hide modal
        elements.settingsModal.style.display = 'none';
        
        // Update UI
        updateDateDisplay();
        renderEntries();
        updateStatistics();
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
            return entryDate >= startDate && entryDate <= endDate;
        });
        
        // Update dashboard charts
        updateDashboardCharts(weekEntries);
        
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
                
                // Filter entries for the selected range
                const filteredEntries = state.entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= startDate && entryDate <= endDate;
                });
                
                // Update dashboard charts
                updateDashboardCharts(filteredEntries);
            });
        });
        
        // Set up chart metric selector
        document.getElementById('chart-metric').addEventListener('change', function() {
            updateDashboardCharts(weekEntries);
        });
    }
});
