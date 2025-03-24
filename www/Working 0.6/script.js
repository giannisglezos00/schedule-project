// Global variables
let state = {
    entries: [],
    tasks: {},
    tags: [],
    settings: {
        referenceDate: '2024-04-11',
        caloriesGoal: 2500,
        stepsGoal: 10000,
        sleepThresholds: {
            red: { hours: 6, minutes: 20 },
            yellow: { hours: 7, minutes: 0 },
            darkGreen: { hours: 8, minutes: 30 }
        },
        deepSleepMin: { hours: 1, minutes: 30 },
        lightSleepRange: { 
            min: { hours: 3, minutes: 0 },
            max: { hours: 5, minutes: 0 }
        },
        remThresholds: {
            red: { hours: 0, minutes: 50 },
            yellow: { hours: 1, minutes: 2 }
        },
        theme: 'light',
        accentColor: 'blue'
    },
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    lastEntryId: 0
};

// Initialize element references
const elements = {
    // Sidebar elements
    currentDate: document.getElementById('current-date'),
    daysCount: document.getElementById('days-count'),
    todayTasks: document.getElementById('today-tasks'),
    todayTagsList: document.getElementById('today-tags-list'),
    addTagQuickBtn: document.getElementById('add-tag-quick-btn'),
    
    // Navigation buttons
    addEntryBtn: document.getElementById('add-entry-btn'),
    addTaskStandaloneBtn: document.getElementById('add-task-standalone-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    
    // Statistics elements
    avgSleepDuration: document.getElementById('avg-sleep-duration'),
    avgDeepSleep: document.getElementById('avg-deep-sleep'),
    avgLightSleep: document.getElementById('avg-light-sleep'),
    avgRemSleep: document.getElementById('avg-rem-sleep'),
    avgSteps: document.getElementById('avg-steps'),
    avgCalories: document.getElementById('avg-calories'),
    avgWakeups: document.getElementById('avg-wakeups'),
    avgStanding: document.getElementById('avg-standing'),
    
    // Filter and control elements
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    currentMonth: document.getElementById('current-month'),
    searchInput: document.getElementById('search-input'),
    tagFilter: document.getElementById('tag-filter'),
    sortBy: document.getElementById('sort-by'),
    
    // Table elements
    sleepTable: document.getElementById('sleep-table'),
    sleepData: document.getElementById('sleep-data'),
    
    // Modal elements
    entryModal: document.getElementById('entry-modal'),
    settingsModal: document.getElementById('settings-modal'),
    dashboardModal: document.getElementById('dashboard-modal'),
    entryPreviewModal: document.getElementById('entry-preview-modal'),
    entryPreviewContent: document.getElementById('entry-preview-content'),
    
    // Chart elements
    sleepTrendChart: document.getElementById('sleep-trend-chart'),
    compositionChart: document.getElementById('composition-chart'),
    activityChart: document.getElementById('activity-chart'),
    eventsTimeline: document.getElementById('events-timeline'),
    sleepInsights: document.getElementById('sleep-insights'),
    
    // Form elements
    entryForm: document.getElementById('entry-form'),
    entryId: document.getElementById('entry-id'),
    entryDate: document.getElementById('entry-date'),
    sleepScore: document.getElementById('sleep-score'),
    nightSleepHours: document.getElementById('night-sleep-hours'),
    nightSleepMinutes: document.getElementById('night-sleep-minutes'),
    dayNapHours: document.getElementById('day-nap-hours'),
    dayNapMinutes: document.getElementById('day-nap-minutes'),
    deepSleepHours: document.getElementById('deep-sleep-hours'),
    deepSleepMinutes: document.getElementById('deep-sleep-minutes'),
    lightSleepHours: document.getElementById('light-sleep-hours'),
    lightSleepMinutes: document.getElementById('light-sleep-minutes'),
    remSleepHours: document.getElementById('rem-sleep-hours'),
    remSleepMinutes: document.getElementById('rem-sleep-minutes'),
    wakeUps: document.getElementById('wake-ups'),
    cutSleep: document.getElementById('cut-sleep'),
    seizure: document.getElementById('seizure'),
    shake: document.getElementById('shake'),
    afr: document.getElementById('afr'),
    eventsNotes: document.getElementById('events-notes'),
    newTask: document.getElementById('new-task'),
    addTaskBtn: document.getElementById('add-task-btn'),
    tasksList: document.getElementById('tasks-list'),
    tags: document.getElementById('tags'),
    availableTags: document.getElementById('available-tags'),
    calories: document.getElementById('calories'),
    steps: document.getElementById('steps'),
    weight: document.getElementById('weight'),
    standing: document.getElementById('standing'),
    saveBtn: document.getElementById('save-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    
    // Settings form elements
    settingsForm: document.getElementById('settings-form'),
    referenceDate: document.getElementById('reference-date'),
    caloriesGoal: document.getElementById('calories-goal'),
    stepsGoal: document.getElementById('steps-goal'),
    sleepRedHours: document.getElementById('sleep-red-hours'),
    sleepRedMinutes: document.getElementById('sleep-red-minutes'),
    sleepYellowHours: document.getElementById('sleep-yellow-hours'),
    sleepYellowMinutes: document.getElementById('sleep-yellow-minutes'),
    sleepDarkGreenHours: document.getElementById('sleep-darkgreen-hours'),
    sleepDarkGreenMinutes: document.getElementById('sleep-darkgreen-minutes'),
    deepMinHours: document.getElementById('deep-min-hours'),
    deepMinMinutes: document.getElementById('deep-min-minutes'),
    lightMinHours: document.getElementById('light-min-hours'),
    lightMinMinutes: document.getElementById('light-min-minutes'),
    lightMaxHours: document.getElementById('light-max-hours'),
    lightMaxMinutes: document.getElementById('light-max-minutes'),
    remRedHours: document.getElementById('rem-red-hours'),
    remRedMinutes: document.getElementById('rem-red-minutes'),
    remYellowHours: document.getElementById('rem-yellow-hours'),
    remYellowMinutes: document.getElementById('rem-yellow-minutes'),
    newTag: document.getElementById('new-tag'),
    tagColor: document.getElementById('tag-color'),
    addTagBtn: document.getElementById('add-tag-btn'),
    tagsList: document.getElementById('tags-list'),
    themeSelector: document.getElementById('theme-selector'),
    colorOptions: document.querySelectorAll('.color-option'),
    settingsSaveBtn: document.getElementById('settings-save-btn'),
    settingsCancelBtn: document.getElementById('settings-cancel-btn')
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
    // Fill form with current settings
    document.getElementById('reference-date').value = state.settings.referenceDate;
    document.getElementById('calories-goal').value = state.settings.caloriesGoal;
    document.getElementById('steps-goal').value = state.settings.stepsGoal;
    
    // Set theme selector
    document.getElementById('theme-selector').value = state.settings.theme;
    
    // Set accent color
    document.querySelectorAll('.color-option').forEach(option => {
        if (option.getAttribute('data-color') === state.settings.accentColor) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Render tags list
    renderTagsList();
    
    // Setup color presets
    setupTagColorPresets();
    
    // Set first color preset as selected initially
    const firstPreset = document.querySelector('.preset-color');
    if (firstPreset) {
        firstPreset.classList.add('selected');
    }
    
    // Show modal
    elements.settingsModal.classList.add('visible');
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
    // Initialize element references
    elements = {
        // Sidebar elements
        currentDate: document.getElementById('current-date'),
        daysCount: document.getElementById('days-count'),
        todayTasks: document.getElementById('today-tasks'),
        todayTagsList: document.getElementById('today-tags-list'),
        addEntryBtn: document.getElementById('add-entry-btn'),
        addTaskStandaloneBtn: document.getElementById('add-task-standalone-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        
        // Statistics elements
        avgSleepDuration: document.getElementById('avg-sleep-duration'),
        avgDeepSleep: document.getElementById('avg-deep-sleep'),
        avgLightSleep: document.getElementById('avg-light-sleep'),
        avgRemSleep: document.getElementById('avg-rem-sleep'),
        avgWakeups: document.getElementById('avg-wakeups'),
        avgSteps: document.getElementById('avg-steps'),
        avgCalories: document.getElementById('avg-calories'),
        avgStanding: document.getElementById('avg-standing'),
        
        // Filter and control elements
        currentMonth: document.getElementById('current-month'),
        prevMonth: document.getElementById('prev-month'),
        nextMonth: document.getElementById('next-month'),
        searchInput: document.getElementById('search-input'),
        tagFilter: document.getElementById('tag-filter'),
        sortBy: document.getElementById('sort-by'),
        
        // Table elements
        sleepTable: document.getElementById('sleep-table'),
        sleepData: document.getElementById('sleep-data'),
        
        // Modal elements
        entryModal: document.getElementById('entry-modal'),
        settingsModal: document.getElementById('settings-modal'),
        dashboardModal: document.getElementById('dashboard-modal'),
        entryPreviewModal: document.getElementById('entry-preview-modal'),
        
        // Chart elements (dashboard)
        sleepTrendChart: document.getElementById('sleep-trend-chart'),
        compositionChart: document.getElementById('composition-chart'),
        activityChart: document.getElementById('activity-chart'),
        eventsTimeline: document.getElementById('events-timeline'),
        sleepInsights: document.getElementById('sleep-insights'),
        
        // Form elements
        entryForm: document.getElementById('entry-form'),
        entryId: document.getElementById('entry-id'),
        entryDate: document.getElementById('entry-date'),
        sleepScore: document.getElementById('sleep-score'),
        nightSleepHours: document.getElementById('night-sleep-hours'),
        nightSleepMinutes: document.getElementById('night-sleep-minutes'),
        dayNapHours: document.getElementById('day-nap-hours'),
        dayNapMinutes: document.getElementById('day-nap-minutes'),
        deepSleepHours: document.getElementById('deep-sleep-hours'),
        deepSleepMinutes: document.getElementById('deep-sleep-minutes'),
        lightSleepHours: document.getElementById('light-sleep-hours'),
        lightSleepMinutes: document.getElementById('light-sleep-minutes'),
        remSleepHours: document.getElementById('rem-sleep-hours'),
        remSleepMinutes: document.getElementById('rem-sleep-minutes'),
        wakeUps: document.getElementById('wake-ups'),
        cutSleep: document.getElementById('cut-sleep'),
        seizure: document.getElementById('seizure'),
        shake: document.getElementById('shake'),
        afr: document.getElementById('afr'),
        eventsNotes: document.getElementById('events-notes'),
        newTask: document.getElementById('new-task'),
        addTaskBtn: document.getElementById('add-task-btn'),
        tasksList: document.getElementById('tasks-list'),
        tags: document.getElementById('tags'),
        availableTags: document.getElementById('available-tags'),
        calories: document.getElementById('calories'),
        steps: document.getElementById('steps'),
        weight: document.getElementById('weight'),
        standing: document.getElementById('standing'),
        cancelBtn: document.getElementById('cancel-btn'),
        saveBtn: document.getElementById('save-btn'),
        
        // Settings form elements
        settingsForm: document.getElementById('settings-form'),
        referenceDate: document.getElementById('reference-date'),
        themeSelector: document.getElementById('theme-selector'),
        colorOptions: document.querySelectorAll('.color-option'),
        addTagBtn: document.getElementById('add-tag-btn'),
        previewEditBtn: document.getElementById('preview-edit-btn'),
        previewCloseBtn: document.getElementById('preview-close-btn'),
        settingsCancelBtn: document.getElementById('settings-cancel-btn')
    };
    
    // Setup event listeners
    setupEventListeners();
    
    // Load data from localStorage
    loadData();
    
    // Initialize UI
    updateDateDisplay();
    updateTodayInfo();
    updateStatistics();
    renderEntries();
    updateTagFilter();
    
    // Set initial theme
    applyTheme();
    applyAccentColor();
    initializeModals();
    setupAddTagQuickButton();
    setupTagColorPresets();
    scrollToToday();
});

// Add keyboard shortcut for scrolling to today
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'c') {
        scrollToToday();
    }
});

function scrollToToday() {
    const todayRow = document.querySelector('.today-row');
    if (todayRow) {
        todayRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Helper Functions
function formatDate(date) {
    const options = { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatTimeCompact(hours, minutes) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
}

function createCell(content, type = 'text') {
    const cell = document.createElement('td');
    
    switch(type) {
        case 'date':
            cell.textContent = formatDate(content);
            break;
        case 'time':
            cell.textContent = formatTimeCompact(content.hours, content.minutes);
            break;
        case 'checkbox':
            cell.textContent = content ? '✓' : '';
            cell.style.textAlign = 'center';
            break;
        case 'number':
            cell.textContent = content.toLocaleString();
            cell.style.textAlign = 'right';
            break;
        default:
            cell.textContent = content;
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
    // Get reference to the tag filter dropdown
    const tagFilter = document.getElementById('tag-filter');
    
    // Clear existing options
    tagFilter.innerHTML = '';
    
    // Add "All Tags" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All Tags';
    tagFilter.appendChild(allOption);
    
    // Create a Set to collect unique tags
    const tagsSet = new Set();
    
    // Add tags from state.tags
    state.tags.forEach(tag => tagsSet.add(tag.name));
    
    // Add tags from entries that may not be in state.tags
    state.entries.forEach(entry => {
        if (entry.tags && Array.isArray(entry.tags)) {
            entry.tags.forEach(tag => tagsSet.add(tag));
        }
    });
    
    // Convert Set to Array and sort alphabetically
    const uniqueTags = Array.from(tagsSet).sort();
    
    // Create an option for each tag
    uniqueTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
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
    updateTodayInfo();
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
    
    // Create new task
    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false
    };
    
    // Add task to current tasks
    state.currentTasks.push(newTask);
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // If we're editing today's entry, update the tasks in state.tasks
    const entryDate = elements.entryDate.value;
    if (entryDate === todayString) {
        if (!state.tasks[todayString]) {
            state.tasks[todayString] = [];
        }
        state.tasks[todayString].push(newTask);
        
        // Update the sidebar immediately
        updateTodayInfo();
    }
    
    // Clear input
    elements.newTask.value = '';
    
    // Render tasks in modal
    renderTasks();
    
    // Save data to ensure persistence
    saveData();
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
    elements.currentDate.textContent = today.toLocaleDateString('en-US', options);
    
    // Calculate days since reference date
    const referenceDate = new Date(state.settings.referenceDate);
    const daysDiff = Math.floor((today - referenceDate) / (1000 * 60 * 60 * 24));
    const monthsDiff = (today.getFullYear() - referenceDate.getFullYear()) * 12 + 
                      (today.getMonth() - referenceDate.getMonth()) + 
                      (today.getDate() >= referenceDate.getDate() ? 0 : -1);
    const monthsDecimal = monthsDiff + (today.getDate() / 30);
    
    elements.daysCount.textContent = `${daysDiff} days since ${referenceDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}, ${monthsDecimal.toFixed(1)} months`;
}

function updateMonthDisplay() {
    const options = { month: 'long', year: 'numeric' };
    elements.currentMonth.textContent = state.currentMonth.toLocaleDateString('en-US', options);
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
    // Add Entry button
    elements.addEntryBtn.addEventListener('click', () => {
        console.log('Add entry button clicked');
        showAddEntryModal();
    });
    
    // Add task standalone button
    elements.addTaskStandaloneBtn.addEventListener('click', () => {
        console.log('Add task standalone button clicked');
        showAddTaskModal();
    });
    
    // Settings button
    elements.settingsBtn.addEventListener('click', showSettingsModal);
    
    // Entry form submit
    elements.entryForm.addEventListener('submit', saveEntry);
    
    // Search and filter
    elements.searchInput.addEventListener('input', filterEntries);
    elements.tagFilter.addEventListener('change', filterEntries);
    elements.sortBy.addEventListener('change', sortEntries);
    
    // Month navigation
    elements.prevMonth.addEventListener('click', navigateToPreviousMonth);
    elements.nextMonth.addEventListener('click', navigateToNextMonth);
    
    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('visible');
        });
    });
    
    // Cancel buttons in modals
    elements.cancelBtn.addEventListener('click', function() {
        elements.entryModal.classList.remove('visible');
    });
    
    elements.settingsCancelBtn.addEventListener('click', function() {
        elements.settingsModal.classList.remove('visible');
    });
    
    // Add task button in modal
    elements.addTaskBtn.addEventListener('click', addTask);
    
    // Settings form submit
    elements.settingsForm.addEventListener('submit', saveSettings);
    
    // Add tag button in settings
    elements.addTagBtn.addEventListener('click', addNewTag);
    
    // Theme selector
    elements.themeSelector.addEventListener('change', function() {
        state.settings.theme = this.value;
        applyTheme();
        saveData();
    });
    
    // Preview edit button
    elements.previewEditBtn.addEventListener('click', function() {
        const entryId = this.getAttribute('data-entry-id');
        elements.entryPreviewModal.classList.remove('visible');
        showEditEntryModal(entryId);
    });
    
    // Preview close button
    elements.previewCloseBtn.addEventListener('click', function() {
        elements.entryPreviewModal.classList.remove('visible');
    });

    // Add this function to your setupEventListeners function
    setupAddTagQuickButton();
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
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Find today's entry
    const todayEntry = state.entries.find(entry => entry.date === todayString);
    
    // Get today's tasks from state.tasks
    const todayTasks = state.tasks[todayString] || [];
    
    // Display today's tasks in sidebar
    const todayTasksList = document.getElementById('today-tasks');
    todayTasksList.innerHTML = '';
    
    if (todayTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'No tasks for today';
        todayTasksList.appendChild(emptyMessage);
    } else {
        todayTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.textContent = task.text;
            taskItem.dataset.taskId = task.id;
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            // Make task clickable to show details
            taskItem.addEventListener('click', function() {
                if (todayEntry) {
                    showEditEntryModal(todayEntry.id);
                    // Highlight the task input field
                    setTimeout(() => {
                        const taskItems = document.querySelectorAll('#tasks-list .task-item');
                        taskItems.forEach(item => {
                            if (item.textContent.includes(task.text)) {
                                item.classList.add('highlighted');
                                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        });
                    }, 300);
                } else {
                    showAddTaskModal();
                }
            });
            
            todayTasksList.appendChild(taskItem);
        });
    }
    
    // Update today's tags
    const todayTagsList = document.getElementById('today-tags-list');
    todayTagsList.innerHTML = '';
    
    if (todayEntry && todayEntry.tags && todayEntry.tags.length > 0) {
        todayEntry.tags.forEach(tagName => {
            // Find the tag in state.tags to get its color
            const tagInfo = state.tags.find(t => t.name === tagName) || { color: '#6366f1', name: tagName };
            
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag');
            tagElement.textContent = tagInfo.name;
            tagElement.style.backgroundColor = tagInfo.color;
            
            // Make tag clickable to filter by this tag
            tagElement.addEventListener('click', function() {
                elements.tagFilter.value = tagInfo.name;
                filterEntries();
            });
            
            todayTagsList.appendChild(tagElement);
        });
    } else {
        const emptyTag = document.createElement('span');
        emptyTag.classList.add('tag', 'empty-tag');
        emptyTag.textContent = 'No tags';
        todayTagsList.appendChild(emptyTag);
    }
}

function updateStatistics() {
    // Get entries from the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const recentEntries = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo && entryDate <= today;
    });
    
    // Initialize totals
    let totalSleepMinutes = 0;
    let totalDeepSleepMinutes = 0;
    let totalLightSleepMinutes = 0;
    let totalRemSleepMinutes = 0;
    let totalWakeUps = 0;
    let totalSteps = 0;
    let totalCalories = 0;
    let totalStandingHours = 0;
    
    // Calculate totals
    recentEntries.forEach(entry => {
        // Sleep data
        if (entry.nightSleep) {
            totalSleepMinutes += (entry.nightSleep.hours * 60) + entry.nightSleep.minutes;
        }
        if (entry.deepSleep) {
            totalDeepSleepMinutes += (entry.deepSleep.hours * 60) + entry.deepSleep.minutes;
        }
        if (entry.lightSleep) {
            totalLightSleepMinutes += (entry.lightSleep.hours * 60) + entry.lightSleep.minutes;
        }
        if (entry.remSleep) {
            totalRemSleepMinutes += (entry.remSleep.hours * 60) + entry.remSleep.minutes;
        }
        
        // Other metrics
        if (entry.wakeUps) {
            totalWakeUps += entry.wakeUps;
        }
        if (entry.steps) {
            totalSteps += entry.steps;
        }
        if (entry.calories) {
            totalCalories += entry.calories;
        }
        if (entry.standing) {
            totalStandingHours += entry.standing;
        }
    });
    
    // Calculate averages, avoiding division by zero
    const entryCount = recentEntries.length || 1; // Use 1 if no entries to avoid division by zero
    
    const avgSleepMinutes = totalSleepMinutes / entryCount;
    const avgDeepSleepMinutes = totalDeepSleepMinutes / entryCount;
    const avgLightSleepMinutes = totalLightSleepMinutes / entryCount;
    const avgRemSleepMinutes = totalRemSleepMinutes / entryCount;
    const avgWakeUps = totalWakeUps / entryCount;
    const avgSteps = totalSteps / entryCount;
    const avgCalories = totalCalories / entryCount;
    const avgStandingHours = totalStandingHours / entryCount;
    
    // Update UI elements
    // Sleep Duration
    const avgSleepHours = Math.floor(avgSleepMinutes / 60);
    const avgSleepRemainingMinutes = Math.round(avgSleepMinutes % 60);
    document.getElementById('avg-sleep-duration').textContent = `${avgSleepHours}h ${avgSleepRemainingMinutes}m`;
    
    // Deep Sleep
    const avgDeepSleepHours = Math.floor(avgDeepSleepMinutes / 60);
    const avgDeepSleepRemainingMinutes = Math.round(avgDeepSleepMinutes % 60);
    document.getElementById('avg-deep-sleep').textContent = `${avgDeepSleepHours}h ${avgDeepSleepRemainingMinutes}m`;
    
    // Light Sleep
    const avgLightSleepHours = Math.floor(avgLightSleepMinutes / 60);
    const avgLightSleepRemainingMinutes = Math.round(avgLightSleepMinutes % 60);
    document.getElementById('avg-light-sleep').textContent = `${avgLightSleepHours}h ${avgLightSleepRemainingMinutes}m`;
    
    // REM Sleep
    const avgRemSleepHours = Math.floor(avgRemSleepMinutes / 60);
    const avgRemSleepRemainingMinutes = Math.round(avgRemSleepMinutes % 60);
    document.getElementById('avg-rem-sleep').textContent = `${avgRemSleepHours}h ${avgRemSleepRemainingMinutes}m`;
    
    // Wake Ups
    document.getElementById('avg-wakeups').textContent = Math.round(avgWakeUps);
    
    // Steps
    document.getElementById('avg-steps').textContent = Math.round(avgSteps).toLocaleString();
    
    // Calories
    document.getElementById('avg-calories').textContent = Math.round(avgCalories).toLocaleString();
    
    // Standing Hours
    document.getElementById('avg-standing').textContent = Math.round(avgStandingHours);
}

function renderEntries(entries = state.entries) {
    // Clear existing entries
    elements.sleepData.innerHTML = '';
    
    // Filter entries for current month
    const currentYear = state.currentMonth.getFullYear();
    const currentMonth = state.currentMonth.getMonth();
    
    let filteredEntries = entries.filter(entry => {
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
        
        // Create row
        const row = document.createElement('tr');
        if (daysDiffFromToday === 0) {
            row.classList.add('today-row');
            row.id = 'today-row'; // Add ID for easier targeting
        }
        
        // Cell for day number
        const dayCell = document.createElement('td');
        dayCell.classList.add('day-num');
        dayCell.textContent = daysDiff;
        row.appendChild(dayCell);
        
        // Cell for days from today - new column with color
        const daysFromTodayCell = document.createElement('td');
        daysFromTodayCell.classList.add('days-from-today');
        
        if (daysDiffFromToday < 0) {
            daysFromTodayCell.textContent = daysDiffFromToday;
            daysFromTodayCell.classList.add('days-past');
            daysFromTodayCell.style.backgroundColor = state.settings.theme === 'dark' ? '#FF5733' : '#FF5733';
            daysFromTodayCell.style.color = 'white';
        } else if (daysDiffFromToday > 0) {
            daysFromTodayCell.textContent = `+${daysDiffFromToday}`;
            daysFromTodayCell.classList.add('days-future');
            daysFromTodayCell.style.backgroundColor = state.settings.theme === 'dark' ? '#2E7D32' : '#2E7D32';
            daysFromTodayCell.style.color = 'white';
        } else {
            daysFromTodayCell.textContent = '0';
            daysFromTodayCell.classList.add('days-today');
            daysFromTodayCell.style.backgroundColor = state.settings.theme === 'dark' ? '#4A6BFF' : '#4A6BFF';
            daysFromTodayCell.style.color = 'white';
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
        
        // Cell for deep sleep
        const deepSleepCell = createCell(formatTime(entry.deepSleep), getDeepSleepColor(entry.deepSleep, entry.nightSleep));
        row.appendChild(deepSleepCell);
        
        // Cell for light sleep
        const lightSleepCell = createCell(formatTime(entry.lightSleep), getLightSleepColor(entry.lightSleep, entry.nightSleep));
        row.appendChild(lightSleepCell);
        
        // Cell for REM sleep
        const remSleepCell = createCell(formatTime(entry.remSleep), getRemSleepColor(entry.remSleep));
        row.appendChild(remSleepCell);
        
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
        
        if (entry.eventsNotes && entry.eventsNotes.trim()) {
            // Set the full text as a data attribute
            eventsCell.setAttribute('data-full-text', entry.eventsNotes.trim());
            
            // Set the truncated text as the visible content
            const truncatedText = entry.eventsNotes.length > 20 ? 
                entry.eventsNotes.substring(0, 20) + '...' : 
                entry.eventsNotes;
            eventsCell.textContent = truncatedText;
            
            // Add click handler for entry preview
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
        const tasksCell = createTasksCell(entry);
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
        placeholderCell.colSpan = 16;
        placeholderCell.textContent = 'No entries for this month. Click the "Add New Entry" button to add one.';
        placeholderCell.classList.add('placeholder-cell');
        placeholderRow.appendChild(placeholderCell);
        elements.sleepData.appendChild(placeholderRow);
    }
}

function createTasksCell(entry) {
    const cell = document.createElement('td');
    cell.classList.add('tasks-cell');
    
    const tasks = state.tasks[entry.date] || [];
    
    if (tasks.length === 0) {
        cell.textContent = '-';
        cell.classList.add('empty-cell');
    } else {
        const taskList = document.createElement('div');
        taskList.classList.add('task-list-in-cell');
        
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item-in-cell');
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.textContent = task.text;
            
            // Make task item clickable to open the corresponding entry
            taskItem.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent row click handler from firing
                showEditEntryModal(entry.id);
                
                // Highlight the corresponding task in the modal
                setTimeout(() => {
                    const modalTaskItems = document.querySelectorAll('#tasks-list .task-item');
                    modalTaskItems.forEach(item => {
                        if (item.textContent.includes(task.text)) {
                            item.classList.add('highlighted');
                            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                }, 300);
            });
            
            taskList.appendChild(taskItem);
        });
        
        cell.appendChild(taskList);
    }
    
    return cell;
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
    
    // Remove isEmpty flag if it exists
    if (entry.tags.length > 0 || state.currentTasks.length > 0) {
        entry.isEmpty = false;
    }
    
    // Update or add entry
    const existingIndex = state.entries.findIndex(e => e.id === entryId);
    if (existingIndex >= 0) {
        state.entries[existingIndex] = { ...state.entries[existingIndex], ...entry };
    } else {
        // Remove any existing empty entry for this date before adding the new one
        state.entries = state.entries.filter(e => e.date !== entry.date);
        state.entries.push(entry);
    }
    
    // Save tasks for this date
    if (state.currentTasks.length > 0) {
        state.tasks[entryDate] = [...state.currentTasks];
        
        // If this is today's entry, update the sidebar immediately
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        if (entryDate === todayString) {
            updateTodayInfo();
        }
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
    const tagName = document.getElementById('new-tag').value.trim();
    const tagColor = document.getElementById('tag-color').value;
    
    if (tagName.length === 0) {
        alert('Please enter a tag name');
        return;
    }
    
    // Check if tag already exists
    if (state.tags.some(tag => tag.name === tagName)) {
        alert('Tag already exists');
        return;
    }
    
    // Add new tag to state
    state.tags.push({
        name: tagName,
        color: tagColor
    });
    
    // Save data
    saveData();
    
    // Reset input fields
    document.getElementById('new-tag').value = '';
    
    // Refresh the tag list display
    renderTagsList();
    
    // Update tags filter which uses tags
    updateTagFilter();
}

function renderTagsList() {
    const tagsList = document.getElementById('tags-list');
    if (!tagsList) return;
    
    tagsList.innerHTML = '';
    
    if (state.tags.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'No tags created yet';
        tagsList.appendChild(emptyMessage);
    } else {
        state.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.classList.add('managed-tag');
            
            const colorPreview = document.createElement('div');
            colorPreview.classList.add('tag-color-preview');
            colorPreview.style.backgroundColor = tag.color;
            
            const tagName = document.createElement('div');
            tagName.classList.add('tag-name');
            tagName.textContent = tag.name;
            
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('tag-delete-btn');
            deleteButton.innerHTML = '<i class="fas fa-times"></i>';
            deleteButton.addEventListener('click', function() {
                deleteTag(tag.name);
            });
            
            tagElement.appendChild(colorPreview);
            tagElement.appendChild(tagName);
            tagElement.appendChild(deleteButton);
            
            tagsList.appendChild(tagElement);
        });
    }
}

// Function to delete a tag
function deleteTag(tagName) {
    if (confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
        // Remove tag from state.tags
        state.tags = state.tags.filter(tag => tag.name !== tagName);
        
        // Remove the tag from any entries that have it
        state.entries.forEach(entry => {
            if (entry.tags && entry.tags.includes(tagName)) {
                entry.tags = entry.tags.filter(tag => tag !== tagName);
            }
        });
        
        // Save data
        saveData();
        
        // Update UI
        renderTagsList();
        updateTagFilter();
    }
}

function filterEntries() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const selectedTag = elements.tagFilter.value;
    
    const filteredEntries = state.entries.filter(entry => {
        // Check if entry matches search term in date or notes
        const matchesSearch = !searchTerm || 
            entry.date.toLowerCase().includes(searchTerm) || 
            (entry.eventsNotes && entry.eventsNotes.toLowerCase().includes(searchTerm));
        
        // Check if entry has the selected tag
        const matchesTag = !selectedTag || 
            (entry.tags && Array.isArray(entry.tags) && entry.tags.includes(selectedTag));
        
        // Return true if both conditions are met
        return matchesSearch && matchesTag;
    });
    
    // Update display
    renderEntries(filteredEntries);
    
    // Highlight search term in entries
    if (searchTerm) {
        highlightSearchTerms(searchTerm);
    }
}

// Function to highlight search terms in entries
function highlightSearchTerms(searchTerm) {
    const eventsCells = document.querySelectorAll('.events-cell');
    eventsCells.forEach(cell => {
        let content = cell.textContent;
        if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
            // Create regex with the search term (case insensitive)
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            // Replace with highlighted version
            const highlightedContent = content.replace(regex, '<span class="highlight">$1</span>');
            cell.innerHTML = highlightedContent;
        }
    });
}

function sortEntries() {
    renderEntries();
}

// Function to show add task modal for today
function showAddTaskModal() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Check if we already have an entry for today
    const todayEntry = state.entries.find(entry => entry.date === todayString);
    
    if (todayEntry) {
        // If today's entry exists, show edit modal with focus on tasks
        showEditEntryModal(todayEntry.id);
        
        // Focus on task input after modal is fully visible
        setTimeout(() => {
            elements.newTask.focus();
        }, 300);
    } else {
        // If no entry exists for today, create a new one
        showAddEntryModal(todayString);
        
        // Focus on task input after modal is fully visible
        setTimeout(() => {
            elements.newTask.focus();
        }, 300);
    }
}

function initializeModals() {
    // Clicking outside modals should close them
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('visible');
        }
    });

    // All close buttons should close their parent modal
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('visible');
        });
    });
    
    // Cancel buttons in modals
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', function() {
            elements.entryModal.classList.remove('visible');
        });
    }
    
    if (elements.settingsCancelBtn) {
        elements.settingsCancelBtn.addEventListener('click', function() {
            elements.settingsModal.classList.remove('visible');
        });
    }
    
    if (elements.previewCloseBtn) {
        elements.previewCloseBtn.addEventListener('click', function() {
            elements.entryPreviewModal.classList.remove('visible');
        });
    }
}

// Add this function to your setupEventListeners function
function setupAddTagQuickButton() {
    const addTagQuickBtn = document.getElementById('add-tag-quick-btn');
    if (addTagQuickBtn) {
        addTagQuickBtn.addEventListener('click', function() {
            showSettingsModal();
            // Focus on the new tag input after modal is visible
            setTimeout(() => {
                document.getElementById('new-tag').focus();
            }, 300);
        });
    }
}

function setupTagColorPresets() {
    const presetColors = document.querySelectorAll('.preset-color');
    const tagColorInput = document.getElementById('tag-color');
    
    if (presetColors.length > 0 && tagColorInput) {
        presetColors.forEach(preset => {
            preset.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                tagColorInput.value = color;
                
                // Update selected state
                presetColors.forEach(p => p.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }
}