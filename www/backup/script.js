// Global variables
let elements = {};
let state = {
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
                backgroundColor: [
                    '#4A6BFF', // Deep sleep - updated per requirements
                    '#2C7DD4', // Light sleep - updated per requirements
                    '#3DD3CB'  // REM sleep - updated per requirements
                ],
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
                    backgroundColor: '#E0CB08' // Steps - updated per requirements
                },
                {
                    label: 'Calories',
                    data: caloriesData.map(calories => calories / 20), // Scale down calories
                    backgroundColor: '#EF8A2B' // Calories - updated per requirements
                },
                {
                    label: 'Standing Hours',
                    data: standingData,
                    backgroundColor: '#43C677' // Standing hours - updated per requirements
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

// Modal Functions
function showAddEntryModal(date = null) {
    // Reset form
    elements.entryForm.reset();
    elements.entryId.value = '';
    state.currentTasks = [];
    renderTasks();
    
    // Set date if provided
    if (date) {
        elements.entryDate.value = date.toISOString().split('T')[0];
    } else {
        elements.entryDate.value = new Date().toISOString().split('T')[0];
    }
    
    // Show modal
    elements.entryModal.style.display = 'block';
}

function showEditEntryModal(entryId) {
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Populate form with entry data
    elements.entryId.value = entry.id;
    elements.entryDate.value = entry.date;
    elements.sleepScore.value = entry.sleepScore || '';
    elements.nightSleepHours.value = entry.nightSleep?.hours || '';
    elements.nightSleepMinutes.value = entry.nightSleep?.minutes || '';
    elements.dayNapHours.value = entry.dayNap?.hours || '';
    elements.dayNapMinutes.value = entry.dayNap?.minutes || '';
    document.getElementById('deep-sleep-hours').value = entry.deepSleep?.hours || '';
    document.getElementById('deep-sleep-minutes').value = entry.deepSleep?.minutes || '';
    document.getElementById('light-sleep-hours').value = entry.lightSleep?.hours || '';
    document.getElementById('light-sleep-minutes').value = entry.lightSleep?.minutes || '';
    document.getElementById('rem-sleep-hours').value = entry.remSleep?.hours || '';
    document.getElementById('rem-sleep-minutes').value = entry.remSleep?.minutes || '';
    elements.wakeUps.value = entry.wakeUps || '';
    elements.cutSleep.checked = entry.cutSleep || false;
    elements.eventsNotes.value = entry.eventsNotes || '';
    elements.calories.value = entry.calories || '';
    elements.steps.value = entry.steps || '';
    document.getElementById('weight').value = entry.weight || '';
    elements.standing.value = entry.standing || '';
    elements.afr.checked = entry.afr || false;
    elements.tags.value = entry.tags ? entry.tags.join(', ') : '';
    
    // Set current tasks
    state.currentTasks = state.tasks[entry.date] || [];
    renderTasks();
    
    // Show modal
    elements.entryModal.style.display = 'block';
}

function showEntryPreview(entryId) {
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Populate preview modal with entry data
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `
        <div class="preview-section">
            <h3>Date: ${new Date(entry.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            })}</h3>
            <p><strong>Sleep Score:</strong> ${entry.sleepScore || 'N/A'}</p>
            <p><strong>Total Sleep:</strong> ${formatTime(entry.nightSleep) || 'N/A'}</p>
            <p><strong>Day Nap:</strong> ${formatTime(entry.dayNap) || 'N/A'}</p>
            <p><strong>Wake Ups:</strong> ${entry.wakeUps || 'N/A'}</p>
            <p><strong>Cut Sleep:</strong> ${entry.cutSleep ? 'Yes' : 'No'}</p>
            <p><strong>Events/Notes:</strong> ${entry.eventsNotes || 'N/A'}</p>
            <p><strong>Calories:</strong> ${entry.calories || 'N/A'}</p>
            <p><strong>Steps:</strong> ${entry.steps ? entry.steps.toLocaleString() : 'N/A'}</p>
            <p><strong>Standing Hours:</strong> ${entry.standing || 'N/A'}</p>
            <p><strong>Girlfriend:</strong> ${entry.afr ? 'Yes' : 'No'}</p>
        </div>
    `;
    
    // Show modal
    elements.entryPreviewModal.style.display = 'block';
}

function showSettingsModal() {
    // Populate settings form with current values
    document.getElementById('reference-date').value = state.settings.referenceDate;
    document.getElementById('calories-goal').value = state.settings.caloriesGoal;
    document.getElementById('steps-goal').value = state.settings.stepsGoal;
    document.getElementById('theme-selector').value = state.settings.theme;
    
    // Show modal
    elements.settingsModal.style.display = 'block';
}

function showDashboardModal() {
    // Update dashboard charts
    updateDashboardCharts(state.entries);
    updateSleepInsights(state.entries);
    
    // Show modal
    elements.dashboardModal.style.display = 'block';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    elements = {
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
        
        // Buttons
        addEntryBtn: document.getElementById('add-entry-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        dashboardBtn: document.getElementById('dashboard-btn'),
        
        // Filter controls
        searchInput: document.getElementById('search-input'),
        tagFilter: document.getElementById('tag-filter'),
        sortBy: document.getElementById('sort-by'),
        
        // Modals
        entryModal: document.getElementById('entry-modal'),
        settingsModal: document.getElementById('settings-modal'),
        dashboardModal: document.getElementById('dashboard-modal'),
        entryPreviewModal: document.getElementById('entry-preview-modal'),
        
        // Statistics
        avgSleepDuration: document.getElementById('avg-sleep-duration'),
        avgSteps: document.getElementById('avg-steps'),
        avgCalories: document.getElementById('avg-calories'),
        avgStanding: document.getElementById('avg-standing'),
        
        // Entry Form
        entryForm: document.getElementById('entry-form'),
        entryId: document.getElementById('entry-id'),
        entryDate: document.getElementById('entry-date'),
        sleepScore: document.getElementById('sleep-score'),
        nightSleepHours: document.getElementById('night-sleep-hours'),
        nightSleepMinutes: document.getElementById('night-sleep-minutes'),
        dayNapHours: document.getElementById('day-nap-hours'),
        dayNapMinutes: document.getElementById('day-nap-minutes'),
        wakeUps: document.getElementById('wake-ups'),
        cutSleep: document.getElementById('cut-sleep'),
        eventsNotes: document.getElementById('events-notes'),
        calories: document.getElementById('calories'),
        steps: document.getElementById('steps'),
        standing: document.getElementById('standing'),
        afr: document.getElementById('afr'),
        tags: document.getElementById('tags'),
        
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

    // Initialize the app
    loadData();
    setupEventListeners();
    updateDateDisplay();
    updateMonthDisplay();
    renderEntries();
    updateTodayInfo();
    updateStatistics();
    applyTheme();
    applyAccentColor();
    
    // Auto-fill empty entries for the whole month
    autoFillEmptyEntries();
});

// Helper Functions
function createCell(content, color = '') {
    const cell = document.createElement('td');
    cell.textContent = content;
    
    // Mark empty cells with white background
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
    return '#4A6BFF'; // Blue (good) - updated per requirements
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
    return '#2C7DD4'; // Light blue (ideal) - updated per requirements
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
    return '#3DD3CB'; // Turquoise (good) - updated per requirements
}

function getCaloriesColor(calories) {
    if (!calories) return '';
    
    const goal = state.settings.caloriesGoal;
    
    if (calories < goal * 0.7) return '#FF5733'; // Red (too low)
    if (calories > goal * 1.3) return '#FF5733'; // Red (too high)
    if (calories < goal * 0.9 || calories > goal * 1.1) return '#FFC300'; // Yellow
    return '#EF8A2B'; // Orange (on target) - updated per requirements
}

function getStepsColor(steps) {
    if (!steps) return '';
    
    const goal = state.settings.stepsGoal;
    
    if (steps < goal * 0.5) return '#FF5733'; // Red
    if (steps < goal * 0.8) return '#FFC300'; // Yellow
    if (steps > goal * 1.2) return '#2E7D32'; // Dark green
    return '#E0CB08'; // Yellow-green (on target) - updated per requirements
}

function getStandingColor(hours) {
    if (!hours) return '';
    
    if (hours < 6) return '#FF5733'; // Red
    if (hours < 8) return '#FFC300'; // Yellow
    if (hours > 12) return '#2E7D32'; // Dark green
    return '#43C677'; // Green (on target) - updated per requirements
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

// Task functions
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
    
    // Auto-fill empty entries for the whole month
    autoFillEmptyEntries();
}

function navigateToNextMonth() {
    state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
    updateMonthDisplay();
    renderEntries();
    
    // Auto-fill empty entries for the whole month
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
    elements.sortBy.addEventListener('change', sortEntries);
    
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
    // Get the current week's data (for last 7 days)
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    // Filter entries for the last 7 days
    const weekEntries = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo && entryDate <= today && !entry.isEmpty;
    });
    
    // Calculate averages
    let totalSleepDuration = 0;
    let totalSteps = 0;
    let totalCalories = 0;
    let totalStanding = 0;
    
    let entriesWithSleepDuration = 0;
    let entriesWithSteps = 0;
    let entriesWithCalories = 0;
    let entriesWithStanding = 0;
    
    weekEntries.forEach(entry => {
        if (entry.nightSleep) {
            const minutes = (entry.nightSleep.hours || 0) * 60 + (entry.nightSleep.minutes || 0);
            totalSleepDuration += minutes;
            entriesWithSleepDuration++;
        }
        
        if (entry.steps) {
            totalSteps += entry.steps;
            entriesWithSteps++;
        }
        
        if (entry.calories) {
            totalCalories += entry.calories;
            entriesWithCalories++;
        }
        
        if (entry.standing) {
            totalStanding += entry.standing;
            entriesWithStanding++;
        }
    });
    
    // Update statistics display
    const avgSleepDurationMinutes = entriesWithSleepDuration > 0 ? Math.round(totalSleepDuration / entriesWithSleepDuration) : 0;
    const avgSleepDurationHours = Math.floor(avgSleepDurationMinutes / 60);
    const avgSleepDurationRemainingMinutes = avgSleepDurationMinutes % 60;
    elements.avgSleepDuration.textContent = `${avgSleepDurationHours}h ${avgSleepDurationRemainingMinutes}m`;
    
    const avgSteps = entriesWithSteps > 0 ? Math.round(totalSteps / entriesWithSteps) : 0;
    elements.avgSteps.textContent = avgSteps.toLocaleString();
    
    const avgCalories = entriesWithCalories > 0 ? Math.round(totalCalories / entriesWithCalories) : 0;
    elements.avgCalories.textContent = avgCalories.toLocaleString();
    
    const avgStanding = entriesWithStanding > 0 ? Math.round(totalStanding / entriesWithStanding) : 0;
    elements.avgStanding.textContent = avgStanding;
}

function renderEntries() {
    // Clear existing entries
    elements.sleepData.innerHTML = '';
    
    // Filter entries for current month
    const currentYear = state.currentMonth.getFullYear();
    const currentMonth = state.currentMonth.getMonth();
    
    let filteredEntries = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
    });
    
    // Sort entries based on selected sort option
    const sortOption = elements.sortBy.value;
    
    switch(sortOption) {
        case 'date':
            filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'sleep':
            filteredEntries.sort((a, b) => {
                const aTime = a.nightSleep ? (a.nightSleep.hours || 0) * 60 + (a.nightSleep.minutes || 0) : 0;
                const bTime = b.nightSleep ? (b.nightSleep.hours || 0) * 60 + (b.nightSleep.minutes || 0) : 0;
                return bTime - aTime;
            });
            break;
        case 'calories':
            filteredEntries.sort((a, b) => (b.calories || 0) - (a.calories || 0));
            break;
        case 'steps':
            filteredEntries.sort((a, b) => (b.steps || 0) - (a.steps || 0));
            break;
        case 'tags':
            filteredEntries.sort((a, b) => {
                const aTags = a.tags ? a.tags.length : 0;
                const bTags = b.tags ? b.tags.length : 0;
                return bTags - aTags;
            });
            break;
        default:
            filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    // Define the reference date for day calculations
    const referenceDate = new Date(state.settings.referenceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
        
        // Determine week number for shading
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
        
        // Cell for days from today - new column
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
        
        // Cell for total sleep (night sleep)
        const totalSleepCell = createCell(formatTime(entry.nightSleep), getSleepColor(entry.nightSleep));
        row.appendChild(totalSleepCell);
        
        // Cell for day nap
        const dayNapCell = createCell(formatTime(entry.dayNap));
        row.appendChild(dayNapCell);
        
        // Cell for wake ups
        const wakeUpsCell = createCell(entry.wakeUps || '');
        row.appendChild(wakeUpsCell);
        
        // Cell for cut sleep
        const cutSleepCell = createCell(entry.cutSleep ? '✓' : '');
        row.appendChild(cutSleepCell);
        
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
        
        // Cell for tasks
        const tasksCell = document.createElement('td');
        tasksCell.classList.add('tasks-cell');
        const entryTasks = state.tasks[entry.date] || [];
        if (entryTasks.length > 0) {
            tasksCell.textContent = `${entryTasks.length} task${entryTasks.length > 1 ? 's' : ''}`;
            tasksCell.title = entryTasks.map(task => task.text).join(', ');
        } else {
            tasksCell.textContent = '';
            if (entry.isEmpty) {
                tasksCell.classList.add('empty-cell');
            }
        }
        row.appendChild(tasksCell);
        
        // Cell for tags
        const tagsCell = document.createElement('td');
        tagsCell.classList.add('tags-cell');
        if (entry.tags && entry.tags.length > 0) {
            entry.tags.forEach(tagName => {
                const tagSpan = document.createElement('span');
                tagSpan.classList.add('table-tag');
                tagSpan.textContent = tagName;
                
                // Find tag color
                const tag = state.tags.find(t => t.name === tagName);
                if (tag) {
                    tagSpan.style.backgroundColor = tag.color;
                    
                    // Adjust text color for better contrast
                    const luminance = getLuminance(tag.color);
                    if (luminance < 0.5) {
                        tagSpan.style.color = 'white';
                    } else {
                        tagSpan.style.color = 'black';
                    }
                }
                
                tagsCell.appendChild(tagSpan);
            });
        } else {
            tagsCell.textContent = '';
            if (entry.isEmpty) {
                tagsCell.classList.add('empty-cell');
            }
        }
        row.appendChild(tagsCell);
        
        // Cell for girlfriend (afro)
        const gfCell = createCell(entry.afr ? '❤️' : '');
        row.appendChild(gfCell);
        
        // Cell for calories
        const caloriesCell = createCell(entry.calories || '', getCaloriesColor(entry.calories));
        row.appendChild(caloriesCell);
        
        // Cell for steps
        const stepsCell = createCell(entry.steps ? entry.steps.toLocaleString() : '', getStepsColor(entry.steps));
        row.appendChild(stepsCell);
        
        // Cell for standing
        const standingCell = createCell(entry.standing || '', getStandingColor(entry.standing));
        row.appendChild(standingCell);
        
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
        placeholderCell.colSpan = 16; // Update column count
        placeholderCell.textContent = 'No entries for this month. Click the "Add New Entry" button to add one.';
        placeholderCell.classList.add('placeholder-cell');
        placeholderRow.appendChild(placeholderCell);
        elements.sleepData.appendChild(placeholderRow);
    }
}

function saveEntry(event) {
    event.preventDefault();
    
    const entryId = elements.entryId.value;
    const entryDate = elements.entryDate.value;
    const sleepScore = parseInt(elements.sleepScore.value) || null;
    
    // Create or update entry
    const entry = {
        id: entryId || `entry-${Date.now()}`,
        date: entryDate,
        sleepScore: sleepScore,
        nightSleep: {
            hours: parseInt(elements.nightSleepHours.value) || 0,
            minutes: parseInt(elements.nightSleepMinutes.value) || 0
        },
        dayNap: {
            hours: parseInt(elements.dayNapHours.value) || 0,
            minutes: parseInt(elements.dayNapMinutes.value) || 0
        },
        deepSleep: {
            hours: parseInt(document.getElementById('deep-sleep-hours').value) || 0,
            minutes: parseInt(document.getElementById('deep-sleep-minutes').value) || 0
        },
        lightSleep: {
            hours: parseInt(document.getElementById('light-sleep-hours').value) || 0,
            minutes: parseInt(document.getElementById('light-sleep-minutes').value) || 0
        },
        remSleep: {
            hours: parseInt(document.getElementById('rem-sleep-hours').value) || 0,
            minutes: parseInt(document.getElementById('rem-sleep-minutes').value) || 0
        },
        wakeUps: parseInt(elements.wakeUps.value) || null,
        cutSleep: elements.cutSleep.checked,
        eventsNotes: elements.eventsNotes.value,
        calories: parseInt(elements.calories.value) || null,
        steps: parseInt(elements.steps.value) || null,
        weight: parseFloat(document.getElementById('weight').value) || null,
        standing: parseInt(elements.standing.value) || null,
        afr: elements.afr.checked,
        tags: elements.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    // Update or add entry
    const existingIndex = state.entries.findIndex(e => e.id === entryId);
    if (existingIndex >= 0) {
        state.entries[existingIndex] = { ...state.entries[existingIndex], ...entry };
    } else {
        state.entries.push(entry);
    }
    
    // Save tasks for this date
    if (state.currentTasks.length > 0) {
        state.tasks[entryDate] = state.currentTasks;
    } else {
        delete state.tasks[entryDate];
    }
    
    // Save data and update UI
    saveData();
    renderEntries();
    updateTodayInfo();
    updateStatistics();
    
    // Close modal
    elements.entryModal.style.display = 'none';
}

function deleteEntry(entryId) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Remove entry
    state.entries = state.entries.filter(e => e.id !== entryId);
    
    // Remove associated tasks
    delete state.tasks[entry.date];
    
    // Save data and update UI
    saveData();
    renderEntries();
    updateTodayInfo();
    updateStatistics();
}

function saveSettings(event) {
    event.preventDefault();
    
    // Update settings
    state.settings.referenceDate = document.getElementById('reference-date').value;
    state.settings.caloriesGoal = parseInt(document.getElementById('calories-goal').value);
    state.settings.stepsGoal = parseInt(document.getElementById('steps-goal').value);
    
    // Save data and update UI
    saveData();
    renderEntries();
    updateDateDisplay();
    
    // Close modal
    elements.settingsModal.style.display = 'none';
}

function addNewTag() {
    const tagName = document.getElementById('new-tag-name').value.trim();
    const tagColor = document.getElementById('new-tag-color').value;
    
    if (!tagName) return;
    
    // Add new tag
    state.tags.push({
        id: Date.now().toString(),
        name: tagName,
        color: tagColor
    });
    
    // Update tag filter
    updateTagFilter();
    
    // Clear input
    document.getElementById('new-tag-name').value = '';
    
    // Save data
    saveData();
}

function filterEntries() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const selectedTag = elements.tagFilter.value;
    
    // Filter entries based on search term and selected tag
    const filteredEntries = state.entries.filter(entry => {
        const matchesSearch = !searchTerm || 
            (entry.eventsNotes && entry.eventsNotes.toLowerCase().includes(searchTerm));
        
        const matchesTag = !selectedTag || 
            (entry.tags && entry.tags.includes(selectedTag));
        
        return matchesSearch && matchesTag;
    });
    
    // Update display
    renderEntries(filteredEntries);
}

function sortEntries() {
    renderEntries();
}