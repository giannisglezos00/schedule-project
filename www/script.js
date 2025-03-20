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
        updateStatistics();
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
        
        // Find the first day of the month
        const firstDay = new Date(currentYear, currentMonth, 1);
        
        // Render entries
        filteredEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            const daysDiff = Math.floor((entryDate - referenceDate) / (1000 * 60 * 60 * 24));
            const daysDiffFromToday = Math.floor((entryDate - today) / (1000 * 60 * 60 * 24));
            
            // Determine day color based on difference from today
            let dayColor = 'white';
            if (daysDiffFromToday < 0) {
                dayColor = 'red-day'; // Past
            } else if (daysDiffFromToday > 0) {
                dayColor = 'green-day'; // Future
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

    function updateStatistics() {
        // Get the start and end dates of the current week
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
        
        if (weekEntries.length === 0) {
            elements.avgSleepScore.textContent = 'No Data';
            elements.avgSleepDuration.textContent = 'No Data';
            elements.avgSteps.textContent = 'No Data';
            elements.avgDeepSleep.textContent = 'No Data';
            elements.avgRemSleep.textContent = 'No Data';
            elements.avgLightSleep.textContent = 'No Data';
            return;
        }
        
        // Calculate average sleep score
        const totalSleepScore = weekEntries.reduce((sum, entry) => sum + (entry.sleepScore || 0), 0);
        const avgSleepScore = totalSleepScore / weekEntries.length;
        elements.avgSleepScore.textContent = Math.round(avgSleepScore);
        
        // Calculate average sleep duration
        let totalSleepMinutes = 0;
        let sleepEntryCount = 0;
        
        weekEntries.forEach(entry => {
            if (entry.nightSleep) {
                totalSleepMinutes += (entry.nightSleep.hours || 0) * 60 + (entry.nightSleep.minutes || 0);
                sleepEntryCount++;
            }
        });
        
        if (sleepEntryCount > 0) {
            const avgSleepMinutes = totalSleepMinutes / sleepEntryCount;
            const avgSleepHours = Math.floor(avgSleepMinutes / 60);
            const avgSleepMins = Math.round(avgSleepMinutes % 60);
            elements.avgSleepDuration.textContent = `${avgSleepHours}h ${avgSleepMins}m`;
        } else {
            elements.avgSleepDuration.textContent = 'No Data';
        }
        
        // Calculate average steps
        const totalSteps = weekEntries.reduce((sum, entry) => sum + (entry.steps || 0), 0);
        const avgSteps = totalSteps / weekEntries.length;
        elements.avgSteps.textContent = Math.round(avgSteps).toLocaleString();
        
        // Calculate average deep sleep
        let totalDeepSleepMinutes = 0;
        let deepSleepEntryCount = 0;
        
        weekEntries.forEach(entry => {
            if (entry.deepSleep) {
                totalDeepSleepMinutes += (entry.deepSleep.hours || 0) * 60 + (entry.deepSleep.minutes || 0);
                deepSleepEntryCount++;
            }
        });
        
        if (deepSleepEntryCount > 0) {
            const avgDeepSleepMinutes =

            
            // message limmite continue here

            if (deepSleepEntryCount > 0) {
                const avgDeepSleepMinutes = totalDeepSleepMinutes / deepSleepEntryCount;
                const avgDeepSleepHours = Math.floor(avgDeepSleepMinutes / 60);
                const avgDeepSleepMins = Math.round(avgDeepSleepMinutes % 60);
                elements.avgDeepSleep.textContent = `${avgDeepSleepHours}h ${avgDeepSleepMins}m`;
            } else {
                elements.avgDeepSleep.textContent = 'No Data';
            }
            
            // Calculate average REM sleep
            let totalRemSleepMinutes = 0;
            let remSleepEntryCount = 0;
            
            weekEntries.forEach(entry => {
                if (entry.remSleep) {
                    totalRemSleepMinutes += (entry.remSleep.hours || 0) * 60 + (entry.remSleep.minutes || 0);
                    remSleepEntryCount++;
                }
            });
            
            if (remSleepEntryCount > 0) {
                const avgRemSleepMinutes = totalRemSleepMinutes / remSleepEntryCount;
                const avgRemSleepHours = Math.floor(avgRemSleepMinutes / 60);
                const avgRemSleepMins = Math.round(avgRemSleepMinutes % 60);
                elements.avgRemSleep.textContent = `${avgRemSleepHours}h ${avgRemSleepMins}m`;
            } else {
                elements.avgRemSleep.textContent = 'No Data';
            }
            
            // Calculate average light sleep
            let totalLightSleepMinutes = 0;
            let lightSleepEntryCount = 0;
            
            weekEntries.forEach(entry => {
                if (entry.lightSleep) {
                    totalLightSleepMinutes += (entry.lightSleep.hours || 0) * 60 + (entry.lightSleep.minutes || 0);
                    lightSleepEntryCount++;
                }
            });
            
            if (lightSleepEntryCount > 0) {
                const avgLightSleepMinutes = totalLightSleepMinutes / lightSleepEntryCount;
                const avgLightSleepHours = Math.floor(avgLightSleepMinutes / 60);
                const avgLightSleepMins = Math.round(avgLightSleepMinutes % 60);
                elements.avgLightSleep.textContent = `${avgLightSleepHours}h ${avgLightSleepMins}m`;
            } else {
                elements.avgLightSleep.textContent = 'No Data';
            }
            
            // Update dashboard charts if dashboard is visible
            if (elements.dashboardModal.style.display === 'block') {
                updateDashboardCharts(weekEntries);
            }
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
                const entryDate = row.querySelector('.date-cell').innerText;
                
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
    
        function showAddEntryModal(date = null) {
            // Clear form
            elements.entryForm.reset();
            elements.entryId.value = '';
            
            // Set date to today if not provided
            if (date) {
                if (!(date instanceof Date)) {
                    date = new Date(date);
                }
                elements.entryDate.value = date.toISOString().split('T')[0];
            } else {
                elements.entryDate.value = new Date().toISOString().split('T')[0];
            }
            
            // Reset tag checkboxes
            document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Show modal
            elements.entryModal.style.display = 'block';
            document.getElementById('entry-modal-title').textContent = 'Add New Entry';
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
            }
            
            // Set day nap
            if (entry.dayNap) {
                document.getElementById('day-nap-hours').value = entry.dayNap.hours || '';
                document.getElementById('day-nap-minutes').value = entry.dayNap.minutes || '';
            }
            
            // Set deep sleep
            if (entry.deepSleep) {
                document.getElementById('deep-sleep-hours').value = entry.deepSleep.hours || '';
                document.getElementById('deep-sleep-minutes').value = entry.deepSleep.minutes || '';
            }
            
            // Set light sleep
            if (entry.lightSleep) {
                document.getElementById('light-sleep-hours').value = entry.lightSleep.hours || '';
                document.getElementById('light-sleep-minutes').value = entry.lightSleep.minutes || '';
            }
            
            // Set REM sleep
            if (entry.remSleep) {
                document.getElementById('rem-sleep-hours').value = entry.remSleep.hours || '';
                document.getElementById('rem-sleep-minutes').value = entry.remSleep.minutes || '';
            }
            
            // Set wakeups
            document.getElementById('wake-ups').value = entry.wakeUps || '';
            
            // Set checkboxes
            document.getElementById('cut-sleep').checked = entry.cutSleep || false;
            document.getElementById('shake').checked = entry.shake || false;
            document.getElementById('seizure').checked = entry.seizure || false;
            document.getElementById('afro').checked = entry.afro || false;
            
            // Set events/notes
            document.getElementById('events-notes').value = entry.eventsNotes || '';
            
            // Set calories
            document.getElementById('calories').value = entry.calories || '';
            
            // Set steps
            document.getElementById('steps').value = entry.steps || '';
            
            // Set weight
            document.getElementById('weight').value = entry.weight || '';
            
            // Set standing
            document.getElementById('standing').value = entry.standing || '';
            
            // Set pills
            document.getElementById('pills').value = entry.pills ? entry.pills.join(', ') : '';
            
            // Set tags
            document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
                checkbox.checked = entry.tags && entry.tags.includes(checkbox.value);
            });
            
            // Show modal
            elements.entryModal.style.display = 'block';
            document.getElementById('entry-modal-title').textContent = 'Edit Entry';
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
            
            document.getElementById('preview-date').textContent = formattedDate;
            document.getElementById('preview-content').textContent = entry.eventsNotes || 'No notes for this entry.';
            
            // Show tags
            const tagsContainer = document.getElementById('preview-tags');
            tagsContainer.innerHTML = '';
            
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
            
            // Show modal
            elements.entryPreviewModal.style.display = 'block';
        }
    
        function showSettingsModal() {
            // Fill form with settings data
            document.getElementById('reference-date').value = state.settings.referenceDate;
            document.getElementById('calories-goal').value = state.settings.caloriesGoal;
            document.getElementById('steps-goal').value = state.settings.stepsGoal;
            
            // Set sleep thresholds
            document.getElementById('total-sleep-red-hours').value = state.settings.sleepThresholds.totalSleep.red.hours;
            document.getElementById('total-sleep-red-minutes').value = state.settings.sleepThresholds.totalSleep.red.minutes;
            
            document.getElementById('total-sleep-yellow-hours').value = state.settings.sleepThresholds.totalSleep.yellow.hours;
            document.getElementById('total-sleep-yellow-minutes').value = state.settings.sleepThresholds.totalSleep.yellow.minutes;
            
            document.getElementById('total-sleep-dark-green-hours').value = state.settings.sleepThresholds.totalSleep.darkGreen.hours;
            document.getElementById('total-sleep-dark-green-minutes').value = state.settings.sleepThresholds.totalSleep.darkGreen.minutes;
            
            document.getElementById('deep-sleep-min-hours').value = state.settings.sleepThresholds.deepSleep.minimum.hours;
            document.getElementById('deep-sleep-min-minutes').value = state.settings.sleepThresholds.deepSleep.minimum.minutes;
            
            document.getElementById('light-sleep-min-hours').value = state.settings.sleepThresholds.lightSleep.minimum.hours;
            document.getElementById('light-sleep-min-minutes').value = state.settings.sleepThresholds.lightSleep.minimum.minutes;
            
            document.getElementById('light-sleep-max-hours').value = state.settings.sleepThresholds.lightSleep.maximum.hours;
            document.getElementById('light-sleep-max-minutes').value = state.settings.sleepThresholds.lightSleep.maximum.minutes;
            
            document.getElementById('rem-sleep-red-hours').value = state.settings.sleepThresholds.remSleep.red.hours;
            document.getElementById('rem-sleep-red-minutes').value = state.settings.sleepThresholds.remSleep.red.minutes;
            
            document.getElementById('rem-sleep-yellow-hours').value = state.settings.sleepThresholds.remSleep.yellow.hours;
            document.getElementById('rem-sleep-yellow-minutes').value = state.settings.sleepThresholds.remSleep.yellow.minutes;
            
            // Set theme
            document.getElementById('theme-selector').value = state.settings.theme;
            
            // Set accent color
            document.getElementById('accent-color').value = state.settings.accentColor;
            
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
    
        function showDashboardModal() {
            // Get the start and end dates of the current week
            const today = new Date();
            const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - currentDay);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + (6 - currentDay));
            endDate.setHours(23, 59, 59, 999);
            
            // Set dashboard title
            document.getElementById('dashboard-title').textContent = `Dashboard: Week of ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            
            // Filter entries for the current week
            const weekEntries = state.entries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= startDate && entryDate <= endDate;
            });
            
            // Update dashboard charts
            updateDashboardCharts(weekEntries);
            
            // Show modal
            elements.dashboardModal.style.display = 'block';
        }
    
        function updateDashboardCharts(entries) {
            // Use Chart.js to create visualizations
            
            // Sleep Trend Chart
            const sleepTrendCtx = elements.sleepTrendChart.getContext('2d');
            const sleepTrendLabels = [];
            const sleepScoreData = [];
            const sleepDurationData = [];
            
            entries.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            entries.forEach(entry => {
                const entryDate = new Date(entry.date);
                sleepTrendLabels.push(entryDate.toLocaleDateString('en-US', { weekday: 'short' }));
                sleepScoreData.push(entry.sleepScore || 0);
                
                const totalMinutes = entry.nightSleep ? 
                    (entry.nightSleep.hours || 0) * 60 + (entry.nightSleep.minutes || 0) : 0;
                sleepDurationData.push(totalMinutes / 60); // Convert to hours
            });
            
            // Clear previous chart if it exists
            if (window.sleepTrendChart) {
                window.sleepTrendChart.destroy();
            }
            
            window.sleepTrendChart = new Chart(sleepTrendCtx, {
                type: 'line',
                data: {
                    labels: sleepTrendLabels,
                    datasets: [
                        {
                            label: 'Sleep Score',
                            data: sleepScoreData,
                            borderColor: '#4A6BFF',
                            backgroundColor: 'rgba(74, 107, 255, 0.1)',
                            yAxisID: 'y-score',
                            fill: true
                        },
                        {
                            label: 'Sleep Duration (hours)',
                            data: sleepDurationData,
                            borderColor: '#2C7DD4',
                            backgroundColor: 'rgba(44, 125, 212, 0.1)',
                            yAxisID: 'y-duration',
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        'y-score': {
                            position: 'left',
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Sleep Score'
                            }
                        },
                        'y-duration': {
                            position: 'right',
                            beginAtZero: true,
                            max: 12,
                            title: {
                                display: true,
                                text: 'Hours'
                            }
                        }
                    }
                }
            });
            
            // Sleep Composition Chart
            const compositionCtx = elements.compositionChart.getContext('2d');
            
            // Calculate averages
            let totalDeep = 0, totalLight = 0, totalRem = 0, count = 0;
            
            entries.forEach(entry => {
                if (entry.deepSleep && entry.lightSleep && entry.remSleep) {
                    totalDeep += (entry.deepSleep.hours || 0) * 60 + (entry.deepSleep.minutes || 0);
                    totalLight += (entry.lightSleep.hours || 0) * 60 + (entry.lightSleep.minutes || 0);
                    totalRem += (entry.remSleep.hours || 0) * 60 + (entry.remSleep.minutes || 0);
                    count++;
                }
            });
            
            const avgDeep = count > 0 ? totalDeep / count : 0;
            const avgLight = count > 0 ? totalLight / count : 0;
            const avgRem = count > 0 ? totalRem / count : 0;
            
            // Clear previous chart if it exists
            if (window.compositionChart) {
                window.compositionChart.destroy();
            }
            
            window.compositionChart = new Chart(compositionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Deep Sleep', 'Light Sleep', 'REM Sleep'],
                    datasets: [{
                        data: [avgDeep, avgLight, avgRem],
                        backgroundColor: ['#4A6BFF', '#2C7DD4', '#3DD3CB'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const minutes = context.raw;
                                    const hours = Math.floor(minutes / 60);
                                    const mins = Math.round(minutes % 60);
                                    return `${context.label}: ${hours}h ${mins}m`;
                                }
                            }
                        }
                    }
                }
            });
            
            // Activity Chart
            const activityCtx = elements.activityChart.getContext('2d');
            const activityLabels = [];
            const caloriesData = [];
            const stepsData = [];
            
            entries.forEach(entry => {
                const entryDate = new Date(entry.date);
                activityLabels.push(entryDate.toLocaleDateString('en-US', { weekday: 'short' }));
                caloriesData.push(entry.calories || 0);
                stepsData.push(entry.steps || 0);
            });
            
            // Clear previous chart if it exists
            if (window.activityChart) {
                window.activityChart.destroy();
            }
            
            window.activityChart = new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: activityLabels,
                    datasets: [
                        {
                            label: 'Calories',
                            data: caloriesData,
                            backgroundColor: '#EF8A2B',
                            yAxisID: 'y-calories'
                        },
                        {
                            label: 'Steps',
                            data: stepsData,
                            backgroundColor: '#E0CB08',
                            yAxisID: 'y-steps'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        'y-calories': {
                            position: 'left',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Calories'
                            }
                        },
                        'y-steps': {
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Steps'
                            }
                        }
                    }
                }
            });
            
            // Events Timeline
            const eventsContainer = elements.eventsTimeline;
            eventsContainer.innerHTML = '';
            
            entries.forEach(entry => {
                if (entry.eventsNotes) {
                    const entryDate = new Date(entry.date);
                    const dateString = entryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    const eventItem = document.createElement('div');
                    eventItem.classList.add('event-item');
                    
                    const eventDate = document.createElement('div');
                    eventDate.classList.add('event-date');
                    eventDate.textContent = dateString;
                    eventItem.appendChild(eventDate);
                    
                    const eventContent = document.createElement('div');
                    eventContent.classList.add('event-content');
                    eventContent.textContent = entry.eventsNotes;
                    eventItem.appendChild(eventContent);
                    
                    eventsContainer.appendChild(eventItem);
                }
            });
            
            if (eventsContainer.children.length === 0) {
                eventsContainer.textContent = 'No events for this week.';
            }
        }
    
        function saveEntry(event) {
            event.preventDefault();
            
            const entryId = elements.entryId.value || Date.now().toString();
            const date = elements.entryDate.value;
            
            // Create sleep time objects
            const nightSleep = {
                hours: parseInt(document.getElementById('night-sleep-hours').value) || 0,
                minutes: parseInt(document.getElementById('night-sleep-minutes').value) || 0
            };
            
            const dayNap = {
                hours: parseInt(document.getElementById('day-nap-hours').value) || 0,
                minutes: parseInt(document.getElementById('day-nap-minutes').value) || 0
            };
            
            const deepSleep = {
                hours: parseInt(document.getElementById('deep-sleep-hours').value) || 0,
                minutes: parseInt(document.getElementById('deep-sleep-minutes').value) || 0
            };
            
            const lightSleep = {
                hours: parseInt(document.getElementById('light-sleep-hours').value) || 0,
                minutes: parseInt(document.getElementById('light-sleep-minutes').value) || 0
            };
            
            const remSleep = {
                hours: parseInt(document.getElementById('rem-sleep-hours').value) || 0,
                minutes: parseInt(document.getElementById('rem-sleep-minutes').value) || 0
            };
            
            // Get selected tags
            const selectedTags = [];
            document.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
                selectedTags.push(checkbox.value);
            });
            
            // Get pills (comma-separated list)
            const pillsInput = document.getElementById('pills').value;
            const pills = pillsInput ? pillsInput.split(',').map(pill => pill.trim()) : [];
            
            // Create entry object
            const entry = {
                id: entryId,
                date: date,
                sleepScore: parseInt(elements.sleepScore.value) || 0,
                nightSleep: nightSleep.hours === 0 && nightSleep.minutes === 0 ? null : nightSleep,
                dayNap: dayNap.hours === 0 && dayNap.minutes === 0 ? null : dayNap,
                deepSleep: deepSleep.hours === 0 && deepSleep.minutes === 0 ? null : deepSleep,
                lightSleep: lightSleep.hours === 0 && lightSleep.minutes === 0 ? null : lightSleep,
                remSleep: remSleep.hours === 0 && remSleep.minutes === 0 ? null : remSleep,
                wakeUps: parseInt(document.getElementById('wake-ups').value) || 0,
                cutSleep: document.getElementById('cut-sleep').checked,
                shake: document.getElementById('shake').checked,
                seizure: document.getElementById('seizure').checked,
                afro: document.getElementById('afro').checked,
                eventsNotes: document.getElementById('events-notes').value,
                calories: parseInt(document.getElementById('calories').value) || 0,
                steps: parseInt(document.getElementById('steps').value) || 0,
                weight: parseFloat(document.getElementById('weight').value) || 0,
                standing: parseInt(document.getElementById('standing').value) || 0,
                pills: pills,
                tags: selectedTags
            };
            
            // Find index of existing entry or -1 if new
            const existingIndex = state.entries.findIndex(e => e.id === entryId);
            
            if (existingIndex >= 0) {
                // Update existing entry
                state.entries[existingIndex] = entry;
            } else {
                // Add new entry
                state.entries.push(entry);
            }
            
            // Save data
            saveData();
            
            // Update UI
            renderEntries();
            updateTodayInfo();
            updateStatistics();
            
            // Close modal
            elements.entryModal.style.display = 'none';
        }
    
        function saveSettings(event) {
            event.preventDefault();
            
            // Get reference date
            state.settings.referenceDate = document.getElementById('reference-date').value;
            
            // Get goals
            state.settings.caloriesGoal = parseInt(document.getElementById('calories-goal').value) || 2000;
            state.settings.stepsGoal = parseInt(document.getElementById('steps-goal').value) || 10000;
            
            // Get sleep thresholds
            state.settings.sleepThresholds.totalSleep.red.hours = parseInt(document.getElementById('total-sleep-red-hours').value) || 0;
            state.settings.sleepThresholds.totalSleep.red.minutes = parseInt(document.getElementById('total-sleep-red-minutes').value) || 0;
            
            state.settings.sleepThresholds.totalSleep.yellow.hours = parseInt(document.getElementById('total-sleep-yellow-hours').value) || 0;
            state.settings.sleepThresholds.totalSleep.yellow.minutes = parseInt(document.getElementById('total-sleep-yellow-minutes').value) || 0;
            
            state.settings.sleepThresholds.totalSleep.darkGreen.hours = parseInt(document.getElementById('total-sleep-dark-green-hours').value) || 0;
            state.settings.sleepThresholds.totalSleep.darkGreen.minutes = parseInt(document.getElementById('total-sleep-dark-green-minutes').value) || 0;
            
            state.settings.sleepThresholds.deepSleep.minimum.hours = parseInt(document.getElementById('deep-sleep-min-hours').value) || 0;
            state.settings.sleepThresholds.deepSleep.minimum.minutes = parseInt(document.getElementById('deep-sleep-min-minutes').value) || 0;
            
            state.settings.sleepThresholds.lightSleep.minimum.hours = parseInt(document.getElementById('light-sleep-min-hours').value) || 0;
            state.settings.sleepThresholds.lightSleep.minimum.minutes = parseInt(document.getElementById('light-sleep-min-minutes').value) || 0;
            
            state.settings.sleepThresholds.lightSleep.maximum.hours = parseInt(document.getElementById('light-sleep-max-hours').value) || 0;
            state.settings.sleepThresholds.lightSleep.maximum.minutes = parseInt(document.getElementById('light-sleep-max-minutes').value) || 0;
            
            state.settings.sleepThresholds.remSleep.red.hours = parseInt(document.getElementById('rem-sleep-red-hours').value) || 0;
            state.settings.sleepThresholds.remSleep.red.minutes = parseInt(document.getElementById('rem-sleep-red-minutes').value) || 0;
            
            state.settings.sleepThresholds.remSleep.yellow.hours = parseInt(document.getElementById('rem-sleep-yellow-hours').value) || 0;
            state.settings.sleepThresholds.remSleep.yellow.minutes = parseInt(document.getElementById('rem-sleep-yellow-minutes').value) || 0;
            
            // Get theme
            state.settings.theme = document.getElementById('theme-selector').value;
            
            // Get accent color
            state.settings.accentColor = document.getElementById('accent-color').value;
            
            // Save data
            saveData();
            
            // Update UI
            updateDateDisplay();
            document.documentElement.setAttribute('data-theme', state.settings.theme);
            document.documentElement.style.setProperty('--accent-color', state.settings.accentColor);
            renderEntries();
            
            // Close modal
            elements.settingsModal.style.display = 'none';
        }
        
        function addNewTag() {
            const tagName = document.getElementById('new-tag-name').value.trim();
            if (!tagName) {
                alert('Please enter a tag name.');
                return;
            }
            
            // Check if tag already exists
            if (state.tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
                alert('Tag already exists.');
                return;
            }
            
            // Generate a random color or use default
            const tagColor = document.getElementById('new-tag-color').value || getRandomColor();
            
            // Create new tag
            const newTag = {
                id: Date.now().toString(),
                name: tagName,
                color: tagColor
            };
            
            // Add to state
            state.tags.push(newTag);
            
            // Save data
            saveData();
            
            // Update UI
            updateTagFilter();
            updateTagsRow();
            document.getElementById('new-tag-name').value = '';
            document.getElementById('new-tag-color').value = '#' + Math.floor(Math.random()*16777215).toString(16);
            
            // Refresh settings modal
            showSettingsModal();
        }
        
        function deleteEntry(entryId) {
            if (confirm('Are you sure you want to delete this entry?')) {
                // Remove entry from state
                state.entries = state.entries.filter(entry => entry.id !== entryId);
                
                // Save data
                saveData();
                
                // Update UI
                renderEntries();
                updateTodayInfo();
                updateStatistics();
            }
        }
        
        function getRandomColor() {
            // Generate pastel colors for better readability
            const hue = Math.floor(Math.random() * 360);
            const saturation = 65 + Math.floor(Math.random() * 25); // 65-90%
            const lightness = 65 + Math.floor(Math.random() * 15); // 65-80%
            
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
        
        // Theme handling
        function applyTheme() {
            document.documentElement.setAttribute('data-theme', state.settings.theme);
            document.documentElement.style.setProperty('--accent-color', state.settings.accentColor);
        }
        
        // Function to export data as JSON file
        function exportData() {
            const data = {
                entries: state.entries,
                tags: state.tags,
                settings: state.settings
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `sleep_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // Function to import data from JSON file
        function importData(file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    if (importedData.entries && importedData.tags && importedData.settings) {
                        // Confirm import
                        if (confirm('This will replace all your current data. Continue?')) {
                            state.entries = importedData.entries;
                            state.tags = importedData.tags;
                            state.settings = importedData.settings;
                            
                            saveData();
                            init();
                            alert('Data imported successfully!');
                        }
                    } else {
                        alert('Invalid data format.');
                    }
                } catch (error) {
                    alert('Error importing data: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        }
        
        // Initialize import/export functionality
        function setupImportExport() {
            const exportBtn = document.getElementById('export-data-btn');
            const importBtn = document.getElementById('import-data-btn');
            const importFileInput = document.getElementById('import-file');
            
            exportBtn.addEventListener('click', exportData);
            
            importBtn.addEventListener('click', () => {
                importFileInput.click();
            });
            
            importFileInput.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    importData(event.target.files[0]);
                }
            });
        }
        
        // Setup keyboard shortcuts
        function setupKeyboardShortcuts() {
            document.addEventListener('keydown', function(event) {
                // Alt+N: Add new entry
                if (event.altKey && event.key === 'n') {
                    event.preventDefault();
                    showAddEntryModal();
                }
                
                // Alt+S: Open settings
                if (event.altKey && event.key === 's') {
                    event.preventDefault();
                    showSettingsModal();
                }
                
                // Alt+D: Open dashboard
                if (event.altKey && event.key === 'd') {
                    event.preventDefault();
                    showDashboardModal();
                }
                
                // Escape: Close modal
                if (event.key === 'Escape') {
                    document.querySelectorAll('.modal').forEach(modal => {
                        if (modal.style.display === 'block') {
                            modal.style.display = 'none';
                        }
                    });
                }
            });
        }
        
        // Call additional setup functions
        setupImportExport();
        setupKeyboardShortcuts();
        applyTheme();
    });