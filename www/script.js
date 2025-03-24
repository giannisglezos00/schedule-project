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
    currentMonth: new Date(),
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
    previewEditBtn: document.getElementById('preview-edit-btn'),
    previewCloseBtn: document.getElementById('preview-close-btn'),
    
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
    // Reset the form
    document.getElementById('entry-form').reset();
    
    // Clear tasks list
    document.getElementById('tasks-list').innerHTML = '';
    
    // Set modal title
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Entry';
    
    // Set today's date if no date provided
    if (date) {
        document.getElementById('entry-date').value = formatDateForInput(date);
    } else {
        const today = new Date();
        document.getElementById('entry-date').value = formatDateForInput(today);
    }
    
    // Show the modal
    const modal = document.getElementById('entry-modal');
    showModal(modal);
    
    // Focus on date field
    setTimeout(() => {
        document.getElementById('entry-date').focus();
    }, 100);
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
    renderTasksList();
    
    // Show modal
    elements.entryModal.classList.add('visible');
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
    elements.entryPreviewModal.classList.add('visible');
}

function showSettingsModal() {
    // Initialize settings form with current values
    initializeSettings();
    
    // Show the modal
    const modal = document.getElementById('settings-modal');
    showModal(modal);
    
    // Focus on reference date field
    setTimeout(() => {
        const refDateInput = document.getElementById('reference-date');
        if (refDateInput) {
            refDateInput.focus();
        }
    }, 100);
}

function showDashboardModal() {
    // Update charts with current data
    updateDashboardCharts(state.entries);
    
    // Show the modal
    const modal = document.getElementById('dashboard-modal');
    showModal(modal);
}

function showAddTaskModal() {
    // Reset the task form
    const taskInput = document.getElementById('new-task');
    if (taskInput) {
        taskInput.value = '';
    }
    
    // Clear tasks list
    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
        tasksList.innerHTML = '';
    }
    
    // Set modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-tasks"></i> Add New Task';
    }
    
    // Show the modal
    const modal = document.getElementById('entry-modal');
    showModal(modal);
    
    // Focus on task input
    setTimeout(() => {
        if (taskInput) {
            taskInput.focus();
        }
    }, 100);
}

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sleep Tracker initializing...');
    
    try {
        // Validate required DOM elements exist
        if (validateElements()) {
            console.log('All elements validated successfully!');
            
            // Load data from localStorage first
            loadData();
            
            // Setup event listeners for user interaction
            setupEventListeners();
            
            // Initialize modals
            initializeModals();
            
            // Setup tag color presets in settings
            setupTagColorPresets();
            
            // Update UI displays
            updateDateDisplay();
            updateMonthDisplay();
            updateTodayInfo();
            updateTagFilter();
            
            // Set theme based on settings
            applyTheme();
            
            // Set accent color based on settings
            applyAccentColor();
            
            // Check for scheduling conflicts
            console.log('Checking for scheduling conflicts...');
            const conflicts = detectConflicts();
            
            if (conflicts.length > 0) {
                console.warn(`Found ${conflicts.length} potential conflicts:`);
                conflicts.forEach(conflict => console.warn(`- ${conflict.message}`));
                console.log('Found', conflicts.length, 'conflicts in the data. Check console for details.');
                
                // Count specific conflicts related to duplicate dates
                const duplicateDateConflicts = conflicts.filter(conflict => 
                    conflict.type === 'duplicate_date'
                );
                
                if (duplicateDateConflicts.length > 0) {
                    // Ask user if they want to automatically fix duplicate entries
                    const shouldFix = confirm(`Found ${duplicateDateConflicts.length} dates with multiple entries. Would you like to automatically resolve these issues by keeping only the most complete entry for each date?`);
                    
                    if (shouldFix) {
                        // Resolve duplicate entries
                        console.log('Checking for duplicate entries...');
                        resolveEntryDuplicates();
                    } else {
                        // Show notification to user
                        showConflictsNotification(conflicts);
                    }
                } else {
                    // Show notification for other types of conflicts
                    showConflictsNotification(conflicts);
                }
            }
            
            // Render entries
            console.log('Rendering entries...');
            renderEntries();
            
            // Update statistics
            updateStatistics();
            
            // Scroll to today's entry if it exists
            setTimeout(scrollToToday, 100);
            
            console.log('✅ Sleep Tracker initialized successfully');
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('There was an error initializing the Sleep Tracker. Please check the console for details.');
    }
});

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

// Set up all event listeners
function setupEventListeners() {
    // Add Entry button
    if (elements.addEntryBtn) {
        elements.addEntryBtn.addEventListener('click', () => {
            console.log('Add entry button clicked');
            showAddEntryModal();
        });
    }
    
    // Add task standalone button
    if (elements.addTaskStandaloneBtn) {
        elements.addTaskStandaloneBtn.addEventListener('click', () => {
            console.log('Add task standalone button clicked');
            showAddTaskModal();
        });
    }
    
    // Settings button
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', showSettingsModal);
    }
    
    // Entry form submit
    if (elements.entryForm) {
        elements.entryForm.addEventListener('submit', saveEntry);
    }
    
    // Search and filter
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', filterEntries);
    }
    
    if (elements.tagFilter) {
        elements.tagFilter.addEventListener('change', filterEntries);
    }
    
    if (elements.sortBy) {
        elements.sortBy.addEventListener('change', sortEntries);
    }
    
    // Month navigation
    if (elements.prevMonth) {
        elements.prevMonth.addEventListener('click', navigateToPreviousMonth);
    }
    
    if (elements.nextMonth) {
        elements.nextMonth.addEventListener('click', navigateToNextMonth);
    }
    
    // Modal close buttons
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
    
    // Add task button in modal
    if (elements.addTaskBtn) {
        elements.addTaskBtn.addEventListener('click', addTask);
    }
    
    // Settings form submit
    if (elements.settingsForm) {
        elements.settingsForm.addEventListener('submit', saveSettings);
    }
    
    // Add tag button in settings
    if (elements.addTagBtn) {
        elements.addTagBtn.addEventListener('click', addNewTag);
    }
    
    // Theme selector
    if (elements.themeSelector) {
        elements.themeSelector.addEventListener('change', function() {
            state.settings.theme = this.value;
            applyTheme();
            saveData();
        });
    }
    
    // Preview edit button
    if (elements.previewEditBtn) {
        elements.previewEditBtn.addEventListener('click', function() {
            const entryId = this.getAttribute('data-entry-id');
            elements.entryPreviewModal.classList.remove('visible');
            showEditEntryModal(entryId);
        });
    }
    
    // Preview close button
    if (elements.previewCloseBtn) {
        elements.previewCloseBtn.addEventListener('click', function() {
            elements.entryPreviewModal.classList.remove('visible');
        });
    }

    // Set up the add tag quick button if it exists
    setupAddTagQuickButton();
    
    // Floating action buttons
    const addEntryFab = document.getElementById('add-entry-fab');
    const addTaskFab = document.getElementById('add-task-fab');
    const settingsFab = document.getElementById('settings-fab');
    
    if (addEntryFab) {
        addEntryFab.addEventListener('click', () => showAddEntryModal());
    }
    
    if (addTaskFab) {
        addTaskFab.addEventListener('click', showAddTaskModal);
    }
    
    if (settingsFab) {
        settingsFab.addEventListener('click', showSettingsModal);
    }
}

// Initialize modal behaviors
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    
    // Add event listeners to all modals
    modals.forEach(modal => {
        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
        
        // Close modal when clicking close button
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal);
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal(modal);
            }
        });
    });
    
    // Cancel buttons for forms
    const cancelButtons = document.querySelectorAll('#cancel-btn, #settings-cancel-btn, #dashboard-close-btn, #preview-close-btn');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    console.log('Modals initialized: Entry, Settings, Dashboard, and Preview modals are ready.');
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
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

function filterEntries() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const selectedTag = elements.tagFilter.value;
    
    // Create a filtered copy of entries
    let filteredEntries = state.entries.filter(entry => {
        // For search term, check both the date and notes
        const matchesSearchTerm = searchTerm === '' || 
            (entry.date && entry.date.toLowerCase().includes(searchTerm)) ||
            (entry.eventsNotes && entry.eventsNotes.toLowerCase().includes(searchTerm));
        
        // For tags, check if the entry contains the selected tag
        const matchesTag = selectedTag === '' || 
            (Array.isArray(entry.tags) && entry.tags.includes(selectedTag));
        
        // Entry must match both filters
        return matchesSearchTerm && matchesTag;
    });
    
    // Apply sorting
    sortEntries(filteredEntries);
    
    // Update the display
    renderEntries(filteredEntries);
    
    // If there's a search term, highlight it
    if (searchTerm) {
        highlightSearchTerms(searchTerm);
    }
    
    // Update the count
    const countMsg = `Showing ${filteredEntries.length} of ${state.entries.length} entries`;
    console.log(countMsg);
    
    // Function to update the date display in the header
    updateDateDisplay();
}

// Function to sort entries based on selected criteria
function sortEntries(entries) {
    const sortValue = elements.sortBy.value;
    
    // Use the filtered entries array if provided, otherwise use all entries
    let entriesToSort = entries || state.entries;
    
    // Create a copy of the array to avoid modifying the original
    let sortedEntries = [...entriesToSort];
    
    switch(sortValue) {
        case 'date':
            sortedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'sleep':
            sortedEntries.sort((a, b) => {
                const aTotal = (a.nightSleep?.hours || 0) * 60 + (a.nightSleep?.minutes || 0);
                const bTotal = (b.nightSleep?.hours || 0) * 60 + (b.nightSleep?.minutes || 0);
                return bTotal - aTotal;
            });
            break;
        case 'calories':
            sortedEntries.sort((a, b) => (b.calories || 0) - (a.calories || 0));
            break;
        case 'steps':
            sortedEntries.sort((a, b) => (b.steps || 0) - (a.steps || 0));
            break;
        case 'tags':
            sortedEntries.sort((a, b) => {
                const aTags = a.tags ? a.tags.length : 0;
                const bTags = b.tags ? b.tags.length : 0;
                return bTags - aTags;
            });
            break;
        default:
            sortedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    return sortedEntries;
}

function highlightSearchTerms(searchTerm) {
    // Only highlight text in notes cells and task cells
    updateDaysCount();
    applyTheme();
    applyAccentColor();
    
    // Close modal
    elements.settingsModal.classList.remove('visible');
}

// Function to render all entries to the table
function renderEntries() {
    console.log('Rendering entries...');
    const tbody = elements.sleepData;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Clear the table
    tbody.innerHTML = '';
    
    // Filter entries based on current month and filters
    let entriesToShow = state.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === state.currentMonth.getMonth() && 
               entryDate.getFullYear() === state.currentMonth.getFullYear();
    });
    
    // Sort entries by date (newest first by default)
    entriesToShow.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // If there are no entries for the current month, show placeholder
    if (entriesToShow.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 21;
        td.textContent = 'No entries for this month. Add a new entry to get started.';
        td.style.textAlign = 'center';
        td.style.padding = '2rem';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    
    // Render each entry
    entriesToShow.forEach((entry, index) => {
        const entryDate = new Date(entry.date);
        const isToday = entryDate.toDateString() === today.toDateString();
        
        const tr = document.createElement('tr');
        if (isToday) {
            tr.classList.add('today-row');
        }
        
        // Calculate week offset for visual indication
        const diffTime = Math.abs(today - entryDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        
        if (entryDate < today && diffWeeks <= 4) {
            tr.classList.add(`week-${diffWeeks}-past`);
        } else if (entryDate > today && diffWeeks <= 4) {
            tr.classList.add(`week-${diffWeeks}-future`);
        }
        
        // Day number (calculating from the first entry)
        const dayCell = createCell(index + 1);
        tr.appendChild(dayCell);
        
        // Offset days (calculating from the reference date)
        const referenceDate = new Date(state.settings.referenceDate);
        const offsetDays = Math.floor((entryDate - referenceDate) / (1000 * 60 * 60 * 24));
        const offsetCell = createCell(offsetDays >= 0 ? `+${offsetDays}` : offsetDays);
        tr.appendChild(offsetCell);
        
        // Date
        const dateDisplay = formatDate(entryDate);
        const dateCell = createCell(dateDisplay);
        tr.appendChild(dateCell);
        
        // Sleep Score
        const scoreColor = getScoreColor(entry.sleepScore);
        const scoreCell = createCell(entry.sleepScore || '-', 'score', scoreColor);
        tr.appendChild(scoreCell);
        
        // Total Sleep Duration
        let totalSleepMinutes = 0;
        if (entry.nightSleep) {
            totalSleepMinutes += (entry.nightSleep.hours || 0) * 60 + (entry.nightSleep.minutes || 0);
        }
        
        const totalSleepDisplay = formatTimeCompact(
            Math.floor(totalSleepMinutes / 60),
            totalSleepMinutes % 60
        );
        
        const totalSleepColor = getSleepColor({ 
            hours: Math.floor(totalSleepMinutes / 60), 
            minutes: totalSleepMinutes % 60 
        });
        
        const totalSleepCell = createCell(totalSleepDisplay, 'sleep', totalSleepColor);
        tr.appendChild(totalSleepCell);
        
        // Deep Sleep
        const deepSleepDisplay = entry.deepSleep ? 
            formatTimeCompact(entry.deepSleep.hours || 0, entry.deepSleep.minutes || 0) : '-';
        
        const deepSleepColor = getDeepSleepColor(
            entry.deepSleep,
            { hours: Math.floor(totalSleepMinutes / 60), minutes: totalSleepMinutes % 60 }
        );
        
        const deepSleepCell = createCell(deepSleepDisplay, 'sleep', deepSleepColor);
        tr.appendChild(deepSleepCell);
        
        // Light Sleep
        const lightSleepDisplay = entry.lightSleep ? 
            formatTimeCompact(entry.lightSleep.hours || 0, entry.lightSleep.minutes || 0) : '-';
        
        const lightSleepColor = getLightSleepColor(
            entry.lightSleep,
            { hours: Math.floor(totalSleepMinutes / 60), minutes: totalSleepMinutes % 60 }
        );
        
        const lightSleepCell = createCell(lightSleepDisplay, 'sleep', lightSleepColor);
        tr.appendChild(lightSleepCell);
        
        // REM Sleep
        const remSleepDisplay = entry.remSleep ? 
            formatTimeCompact(entry.remSleep.hours || 0, entry.remSleep.minutes || 0) : '-';
        
        const remSleepColor = getRemSleepColor(entry.remSleep);
        
        const remSleepCell = createCell(remSleepDisplay, 'sleep', remSleepColor);
        tr.appendChild(remSleepCell);
        
        // Day Nap
        const napDisplay = entry.dayNap ? 
            formatTimeCompact(entry.dayNap.hours || 0, entry.dayNap.minutes || 0) : '-';
        
        const napCell = createCell(napDisplay, 'sleep');
        tr.appendChild(napCell);
        
        // Wake Ups
        const wakeUpsCell = createCell(entry.wakeUps || '-');
        tr.appendChild(wakeUpsCell);
        
        // Cut Sleep (checkbox)
        const cutSleepCell = createCell(entry.cutSleep ? '✓' : '-', 'indicator', entry.cutSleep ? 'red' : null);
        tr.appendChild(cutSleepCell);
        
        // GF (Afrodite) checkbox
        const afrCell = createCell(entry.afr ? '✓' : '-', 'indicator', entry.afr ? 'pink' : null);
        tr.appendChild(afrCell);
        
        // Shake checkbox
        const shakeCell = createCell(entry.shake ? '✓' : '-', 'indicator', entry.shake ? 'orange' : null);
        tr.appendChild(shakeCell);
        
        // Seizure checkbox
        const seizureCell = createCell(entry.seizure ? '✓' : '-', 'indicator', entry.seizure ? 'red' : null);
        tr.appendChild(seizureCell);
        
        // Events/Notes
        const eventsCell = document.createElement('td');
        eventsCell.classList.add('events-cell');
        if (entry.eventsNotes) {
            eventsCell.textContent = entry.eventsNotes;
            if (entry.eventsNotes.length > 100) {
                eventsCell.classList.add('truncated');
                eventsCell.title = entry.eventsNotes;
            }
        } else {
            eventsCell.textContent = '-';
            eventsCell.classList.add('empty-cell');
        }
        tr.appendChild(eventsCell);
        
        // Tasks
        const tasksCell = document.createElement('td');
        tasksCell.classList.add('tasks-cell');
        
        if (entry.tasks && entry.tasks.length > 0) {
            const taskList = document.createElement('ul');
            taskList.classList.add('task-list-in-cell');
            
            entry.tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.classList.add('task-item-in-cell');
                if (task.completed) {
                    taskItem.classList.add('completed');
                }
                taskItem.textContent = task.text;
                taskList.appendChild(taskItem);
            });
            
            tasksCell.appendChild(taskList);
        } else {
            tasksCell.textContent = '-';
            tasksCell.classList.add('empty-cell');
        }
        tr.appendChild(tasksCell);
        
        // Tags
        const tagsCell = document.createElement('td');
        
        if (entry.tags && entry.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.classList.add('tags-container');
            
            entry.tags.forEach(tagName => {
                const tagObj = state.tags.find(t => t.name === tagName);
                const tagColor = tagObj ? tagObj.color : '#6366f1';
                
                const tag = document.createElement('span');
                tag.classList.add('tag');
                tag.textContent = tagName;
                tag.style.backgroundColor = tagColor;
                
                // Ensure contrast by checking color luminance
                if (getLuminance(tagColor) > 0.5) {
                    tag.style.color = '#000';
                }
                
                tagsContainer.appendChild(tag);
            });
            
            tagsCell.appendChild(tagsContainer);
        } else {
            tagsCell.textContent = '-';
            tagsCell.classList.add('empty-cell');
        }
        tr.appendChild(tagsCell);
        
        // Calories
        const caloriesCell = createCell(
            entry.calories || '-', 
            'metric', 
            entry.calories ? getCaloriesColor(entry.calories) : null
        );
        tr.appendChild(caloriesCell);
        
        // Steps
        const stepsCell = createCell(
            entry.steps || '-', 
            'metric', 
            entry.steps ? getStepsColor(entry.steps) : null
        );
        tr.appendChild(stepsCell);
        
        // Standing Hours
        const standingCell = createCell(
            entry.standing || '-', 
            'metric', 
            entry.standing ? getStandingColor(entry.standing) : null
        );
        tr.appendChild(standingCell);
        
        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('actions-cell');
        
        // View button
        const viewButton = document.createElement('button');
        viewButton.classList.add('view-btn');
        viewButton.innerHTML = '<i class="fas fa-search"></i>';
        viewButton.title = 'View Details';
        viewButton.setAttribute('aria-label', 'View Details');
        viewButton.addEventListener('click', () => showEntryPreview(entry.id));
        actionsCell.appendChild(viewButton);
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.classList.add('edit-btn');
        editButton.innerHTML = '<i class="fas fa-pen"></i>';
        editButton.title = 'Edit Entry';
        editButton.setAttribute('aria-label', 'Edit Entry');
        editButton.addEventListener('click', () => showEditEntryModal(entry.id));
        actionsCell.appendChild(editButton);
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.title = 'Delete Entry';
        deleteButton.setAttribute('aria-label', 'Delete Entry');
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this entry?')) {
                deleteEntry(entry.id);
            }
        });
        actionsCell.appendChild(deleteButton);
        
        tr.appendChild(actionsCell);
        
        // Add row to table
        tbody.appendChild(tr);
    });
    
    // Apply any active search filters
    if (elements.searchInput.value) {
        highlightSearchTerms(elements.searchInput.value);
    }
}

// Helper function to format dates consistently
function formatDate(date) {
    const options = { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

// Function to add a new tag
function addNewTag() {
    const tagName = elements.newTag.value.trim().toLowerCase();
    const tagColor = elements.tagColor.value;
    
    if (!tagName) {
        alert('Please enter a tag name');
        return;
    }
    
    // Check if tag already exists
    const existingTag = state.tags.find(tag => tag.name === tagName);
    if (existingTag) {
        alert('This tag already exists');
        return;
    }
    
    // Add new tag
    const newTag = {
        id: Date.now(),
        name: tagName,
        color: tagColor
    };
    
    state.tags.push(newTag);
    saveData();
    
    // Update tag management UI
    renderTagsManagement();
    
    // Clear input fields
    elements.newTag.value = '';
}

// Function to delete an entry
function deleteEntry(entryId) {
    state.entries = state.entries.filter(entry => entry.id !== entryId);
    saveData();
    renderEntries();
    updateTodayInfo();
    updateStatistics();
}

// Function to render tags in the tag management section
function renderTagsManagement() {
    const tagsList = elements.tagsList;
    tagsList.innerHTML = '';
    
    state.tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.classList.add('managed-tag');
        
        const colorPreview = document.createElement('span');
        colorPreview.classList.add('tag-color-preview');
        colorPreview.style.backgroundColor = tag.color;
        tagElement.appendChild(colorPreview);
        
        const tagName = document.createElement('span');
        tagName.classList.add('tag-name');
        tagName.textContent = tag.name;
        tagElement.appendChild(tagName);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('tag-delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', () => {
            deleteTag(tag.id);
        });
        tagElement.appendChild(deleteBtn);
        
        tagsList.appendChild(tagElement);
    });
    
    // Update the tag filter dropdown
    updateTagFilter();
}

// Function to delete a tag
function deleteTag(tagId) {
    if (confirm('Are you sure you want to delete this tag? It will be removed from all entries.')) {
        state.tags = state.tags.filter(tag => tag.id !== tagId);
        
        // Remove this tag from all entries
        state.entries.forEach(entry => {
            if (entry.tags) {
                const tagToRemove = state.tags.find(t => t.id === tagId);
                if (tagToRemove) {
                    entry.tags = entry.tags.filter(t => t !== tagToRemove.name);
                }
            }
        });
        
        saveData();
        renderTagsManagement();
        renderEntries();
        updateTodayInfo();
    }
}

// Function to render available tags in the settings modal
function renderTagsList() {
    const availableTags = document.querySelector('#available-tags');
    if (!availableTags) return;
    
    // Clear current tags
    availableTags.innerHTML = '';
    
    // Render each tag as a selectable element
    state.tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.classList.add('tag');
        tagElement.textContent = tag.name;
        tagElement.style.backgroundColor = tag.color;
        
        // Ensure text contrast
        if (getLuminance(tag.color) > 0.5) {
            tagElement.style.color = '#000';
        }
        
        // Make the tag selectable
        tagElement.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
        
        availableTags.appendChild(tagElement);
    });
}

// Debug function to validate DOM elements
function validateElements() {
    console.log('Validating DOM elements...');
    
    // Initialize any missing elements
    if (!elements.colorOptions) {
        elements.colorOptions = document.querySelectorAll('.color-option');
    }
    
    const elementChecks = {
        'Current Date': elements.currentDate,
        'Days Count': elements.daysCount,
        'Today Tasks': elements.todayTasks,
        'Today Tags List': elements.todayTagsList,
        'Add Entry Button': elements.addEntryBtn,
        'Settings Button': elements.settingsBtn,
        'Sleep Table': elements.sleepTable,
        'Sleep Data': elements.sleepData,
        'Entry Modal': elements.entryModal,
        'Settings Modal': elements.settingsModal,
        'Entry Form': elements.entryForm,
        'Settings Form': elements.settingsForm,
        'Reference Date': elements.referenceDate,
        'Tag Filter': elements.tagFilter,
        'Sort By': elements.sortBy,
        'Search Input': elements.searchInput
    };
    
    let missingElements = [];
    
    for (const [name, element] of Object.entries(elementChecks)) {
        if (!element) {
            console.error(`Missing required element: ${name}`);
            missingElements.push(name);
        }
    }
    
    // Check form elements that might not be critical
    const formElements = {
        'Calories Goal': elements.caloriesGoal,
        'Steps Goal': elements.stepsGoal,
        'Sleep Red Hours': elements.sleepRedHours,
        'Sleep Red Minutes': elements.sleepRedMinutes,
        'Sleep Yellow Hours': elements.sleepYellowHours, 
        'Sleep Yellow Minutes': elements.sleepYellowMinutes,
        'Sleep Dark Green Hours': elements.sleepDarkGreenHours,
        'Sleep Dark Green Minutes': elements.sleepDarkGreenMinutes,
        'Deep Min Hours': elements.deepMinHours,
        'Deep Min Minutes': elements.deepMinMinutes,
        'Light Min Hours': elements.lightMinHours,
        'Light Min Minutes': elements.lightMinMinutes,
        'Light Max Hours': elements.lightMaxHours,
        'Light Max Minutes': elements.lightMaxMinutes,
        'REM Red Hours': elements.remRedHours,
        'REM Red Minutes': elements.remRedMinutes,
        'REM Yellow Hours': elements.remYellowHours,
        'REM Yellow Minutes': elements.remYellowMinutes,
        'Theme Selector': elements.themeSelector
    };
    
    let missingFormElements = [];
    
    for (const [name, element] of Object.entries(formElements)) {
        if (!element) {
            console.warn(`Missing form element: ${name}`);
            missingFormElements.push(name);
        }
    }
    
    if (missingElements.length > 0) {
        console.error(`Found ${missingElements.length} missing critical elements. Application may not function correctly.`);
        return false;
    }
    
    if (missingFormElements.length > 0) {
        console.warn(`Found ${missingFormElements.length} missing form elements. Some features may not work properly.`);
        // Still continue with the application, but some features might be limited
    }
    
    console.log('All elements validated successfully!');
    return true;
}

// Call validation on page load
document.addEventListener('DOMContentLoaded', function() {
    // Execute after initialization
    setTimeout(validateElements, 1000);
});

// Function to detect scheduling conflicts between entries
function detectConflicts() {
    console.log('Checking for scheduling conflicts...');
    
    const conflicts = [];
    
    // Check for duplicate dates (multiple entries on the same day)
    const dateMap = {};
    
    state.entries.forEach(entry => {
        if (!entry.date) return;
        
        if (dateMap[entry.date]) {
            dateMap[entry.date].push(entry);
        } else {
            dateMap[entry.date] = [entry];
        }
    });
    
    // Identify dates with multiple entries
    for (const [date, entries] of Object.entries(dateMap)) {
        if (entries.length > 1) {
            conflicts.push({
                type: 'duplicate_date',
                date,
                entries,
                message: `Multiple entries (${entries.length}) found for date ${formatDate(new Date(date))}`,
                resolve: () => {
                    const entriesToShow = entries.map((entry, index) => 
                        `Entry ${index + 1}: ${entry.eventsNotes ? `"${entry.eventsNotes.substring(0, 30)}${entry.eventsNotes.length > 30 ? '...' : ''}"` : 'No notes'}`
                    ).join('\n');
                    
                    const shouldResolve = confirm(`${entries.length} entries found for ${formatDate(new Date(date))}:\n\n${entriesToShow}\n\nWould you like to keep only the most complete entry and delete the others?`);
                    
                    if (shouldResolve) {
                        // Score each entry based on completeness
                        const scoredEntries = entries.map(entry => {
                            let score = 0;
                            
                            // Add points for each filled field
                            score += entry.sleepScore ? 1 : 0;
                            score += (entry.nightSleep && (entry.nightSleep.hours > 0 || entry.nightSleep.minutes > 0)) ? 1 : 0;
                            score += (entry.deepSleep && (entry.deepSleep.hours > 0 || entry.deepSleep.minutes > 0)) ? 1 : 0;
                            score += (entry.lightSleep && (entry.lightSleep.hours > 0 || entry.lightSleep.minutes > 0)) ? 1 : 0;
                            score += (entry.remSleep && (entry.remSleep.hours > 0 || entry.remSleep.minutes > 0)) ? 1 : 0;
                            score += entry.wakeUps ? 1 : 0;
                            score += entry.eventsNotes ? 1 : 0;
                            score += entry.tasks && entry.tasks.length > 0 ? 1 : 0;
                            score += entry.tags && entry.tags.length > 0 ? 1 : 0;
                            score += entry.calories ? 1 : 0;
                            score += entry.steps ? 1 : 0;
                            score += entry.weight ? 1 : 0;
                            score += entry.standing ? 1 : 0;
                            
                            return { entry, score };
                        });
                        
                        // Sort by score (descending)
                        scoredEntries.sort((a, b) => b.score - a.score);
                        
                        // Keep only the entry with highest score
                        const entriesToRemove = scoredEntries.slice(1).map(item => item.entry.id);
                        
                        // Remove duplicate entries
                        state.entries = state.entries.filter(entry => !entriesToRemove.includes(entry.id));
                        
                        // Save changes
                        saveData();
                        
                        // Update UI
                        renderEntries();
                        updateStatistics();
                        
                        alert(`Kept the most complete entry and removed ${entriesToRemove.length} duplicates.`);
                        return true;
                    }
                    return false;
                }
            });
        }
    }
    
    // Look for inconsistent sequential data (missing days between entries)
    const sortedDates = Object.keys(dateMap).sort();
    if (sortedDates.length > 1) {
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i-1]);
            const currentDate = new Date(sortedDates[i]);
            
            // Calculate days difference
            const diffTime = Math.abs(currentDate - prevDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            // If more than 1 day difference, it's a gap
            if (diffDays > 1) {
                conflicts.push({
                    type: 'date_gap',
                    startDate: prevDate,
                    endDate: currentDate,
                    daysMissing: diffDays - 1,
                    message: `Gap of ${diffDays - 1} days detected between ${formatDate(prevDate)} and ${formatDate(currentDate)}`
                });
            }
        }
    }
    
    // Check for entries with scores outside reasonable range
    state.entries.forEach(entry => {
        if (entry.sleepScore && (entry.sleepScore < 0 || entry.sleepScore > 100)) {
            conflicts.push({
                type: 'invalid_score',
                entry,
                message: `Entry on ${formatDate(new Date(entry.date))} has an invalid sleep score: ${entry.sleepScore}`
            });
        }
    });
    
    // Log all conflicts
    if (conflicts.length > 0) {
        console.warn(`Found ${conflicts.length} potential conflicts:`);
        conflicts.forEach(conflict => {
            console.warn(`- ${conflict.message}`);
        });
    } else {
        console.log('No conflicts found in schedule data.');
    }
    
    return conflicts;
}

// Function to show conflicts in the UI
function showConflictsNotification(conflicts) {
    if (!conflicts || conflicts.length === 0) return;
    
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'notification-header';
    header.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Scheduling Conflicts Detected (${conflicts.length})`;
    notification.appendChild(header);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    // Get duplicate date conflicts
    const duplicateConflicts = conflicts.filter(conflict => conflict.type === 'duplicate_date');
    
    // Add summary of conflicts
    const summaryMsg = document.createElement('p');
    if (duplicateConflicts.length > 0) {
        summaryMsg.innerHTML = `Found <strong>${duplicateConflicts.length}</strong> dates with duplicate entries.`;
    } else {
        summaryMsg.textContent = 'Conflicts detected in your schedule data.';
    }
    content.appendChild(summaryMsg);
    
    // Add first three conflicts as examples
    const conflictsToShow = conflicts.slice(0, 3);
    const list = document.createElement('ul');
    conflictsToShow.forEach(conflict => {
        const item = document.createElement('li');
        item.textContent = conflict.message;
        list.appendChild(item);
    });
    
    if (conflicts.length > 3) {
        const more = document.createElement('li');
        more.textContent = `... and ${conflicts.length - 3} more issues`;
        list.appendChild(more);
    }
    
    content.appendChild(list);
    notification.appendChild(content);
    
    // Create actions
    const actions = document.createElement('div');
    actions.className = 'notification-actions';
    
    // Add resolve all button
    const resolveAllBtn = document.createElement('button');
    resolveAllBtn.className = 'notification-btn primary';
    resolveAllBtn.innerHTML = '<i class="fas fa-magic"></i> Fix All';
    resolveAllBtn.addEventListener('click', () => {
        const resolved = resolveAllConflicts();
        if (resolved > 0) {
            alert(`Successfully resolved ${resolved} conflicts.`);
        } else {
            alert('No conflicts could be automatically resolved.');
        }
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    actions.appendChild(resolveAllBtn);
    
    // Add specific fix for duplicates if needed
    if (duplicateConflicts.length > 0) {
        const fixDuplicatesBtn = document.createElement('button');
        fixDuplicatesBtn.className = 'notification-btn';
        fixDuplicatesBtn.innerHTML = '<i class="fas fa-clone"></i> Fix Duplicates';
        fixDuplicatesBtn.addEventListener('click', () => {
            resolveEntryDuplicates();
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        actions.appendChild(fixDuplicatesBtn);
    }
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'notification-btn';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i> View All';
    viewBtn.addEventListener('click', () => {
        console.table(conflicts);
        alert('Full details are available in the browser console (F12)');
    });
    actions.appendChild(viewBtn);
    
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'notification-btn';
    dismissBtn.innerHTML = '<i class="fas fa-times"></i> Dismiss';
    dismissBtn.addEventListener('click', () => {
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    actions.appendChild(dismissBtn);
    
    notification.appendChild(actions);
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto dismiss after 10 seconds
    setTimeout(() => {
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 10000);
}

// Function to detect and resolve duplicate entries
function resolveEntryDuplicates() {
    console.log('Checking for duplicate entries...');
    
    // Build a map of dates to entries
    const dateMap = {};
    
    // Group entries by date
    state.entries.forEach(entry => {
        if (!entry.date) return;
        
        if (dateMap[entry.date]) {
            dateMap[entry.date].push(entry);
        } else {
            dateMap[entry.date] = [entry];
        }
    });
    
    // Find dates with duplicates
    const duplicateDates = Object.entries(dateMap)
        .filter(([_, entries]) => entries.length > 1)
        .map(([date, entries]) => ({ date, entries }));
    
    if (duplicateDates.length === 0) {
        console.log('No duplicate entries found.');
        return [];
    }
    
    console.warn(`Found ${duplicateDates.length} dates with duplicate entries.`);
    
    // Prompt user to resolve duplicates
    const shouldResolve = confirm(`Found ${duplicateDates.length} dates with multiple entries. Would you like to automatically resolve these conflicts?`);
    
    if (!shouldResolve) {
        console.log('User opted not to resolve duplicates.');
        return duplicateDates;
    }
    
    // Resolve duplicates - keep the most complete entry for each date
    duplicateDates.forEach(({ date, entries }) => {
        console.log(`Resolving duplicates for ${date} (${entries.length} entries)`);
        
        // Score each entry based on completeness
        const scoredEntries = entries.map(entry => {
            let score = 0;
            
            // Add points for each filled field
            score += entry.sleepScore ? 1 : 0;
            score += (entry.nightSleep && (entry.nightSleep.hours > 0 || entry.nightSleep.minutes > 0)) ? 1 : 0;
            score += (entry.deepSleep && (entry.deepSleep.hours > 0 || entry.deepSleep.minutes > 0)) ? 1 : 0;
            score += (entry.lightSleep && (entry.lightSleep.hours > 0 || entry.lightSleep.minutes > 0)) ? 1 : 0;
            score += (entry.remSleep && (entry.remSleep.hours > 0 || entry.remSleep.minutes > 0)) ? 1 : 0;
            score += entry.wakeUps ? 1 : 0;
            score += entry.eventsNotes ? 1 : 0;
            score += entry.tasks && entry.tasks.length > 0 ? 1 : 0;
            score += entry.tags && entry.tags.length > 0 ? 1 : 0;
            score += entry.calories ? 1 : 0;
            score += entry.steps ? 1 : 0;
            score += entry.weight ? 1 : 0;
            score += entry.standing ? 1 : 0;
            
            return { entry, score };
        });
        
        // Sort by score (descending)
        scoredEntries.sort((a, b) => b.score - a.score);
        
        // Keep only the entry with highest score
        const entriesToRemove = scoredEntries.slice(1).map(item => item.entry.id);
        
        // Remove duplicate entries
        state.entries = state.entries.filter(entry => !entriesToRemove.includes(entry.id));
        
        console.log(`Kept entry ID ${scoredEntries[0].entry.id} with score ${scoredEntries[0].score}. Removed ${entriesToRemove.length} duplicate entries.`);
    });
    
    // Save changes
    saveData();
    
    // Update UI
    renderEntries();
    updateStatistics();
    
    alert(`Successfully resolved ${duplicateDates.length} duplicate entries. The most complete entry for each date was kept.`);
    
    return duplicateDates;
}

// Function to resolve all types of conflicts
function resolveAllConflicts() {
    console.log('Attempting to resolve all conflicts...');
    
    // Get current conflicts
    const conflicts = detectConflicts();
    if (conflicts.length === 0) {
        console.log('No conflicts to resolve.');
        return 0;
    }
    
    console.log(`Found ${conflicts.length} conflicts to resolve.`);
    
    // Resolve each type of conflict
    let resolvedCount = 0;
    
    // Resolve duplicate date conflicts
    const duplicateDateConflicts = conflicts.filter(conflict => 
        conflict.type === 'duplicate_date'
    );
    
    if (duplicateDateConflicts.length > 0) {
        console.log(`Resolving ${duplicateDateConflicts.length} duplicate date conflicts...`);
        resolveEntryDuplicates();
        resolvedCount += duplicateDateConflicts.length;
    }
    
    // Other conflict types can be resolved here in the future
    
    console.log(`Successfully resolved ${resolvedCount} conflicts.`);
    alert(`Successfully resolved ${resolvedCount} conflicts.`);
    
    return resolvedCount;
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

// Function to update today's information in the sidebar
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

// Function to update the displayed month in the UI
function updateMonthDisplay() {
    const options = { month: 'long', year: 'numeric' };
    elements.currentMonth.textContent = state.currentMonth.toLocaleDateString('en-US', options);
}

// Function to navigate to the previous month
function navigateToPreviousMonth() {
    state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
    updateMonthDisplay();
    renderEntries();
}

// Function to navigate to the next month
function navigateToNextMonth() {
    state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
    updateMonthDisplay();
    renderEntries();
}

// Function to add a new task
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
    
    // Clear the input field
    elements.newTask.value = '';
    
    // Render the tasks in the modal
    renderTasksList();
    
    // Save data to ensure persistence
    saveData();
}

// Function to update the date display in the header
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
    
    // Update the days count display
    if (elements.daysCount) {
        elements.daysCount.innerHTML = `
            <span class="days-since">${daysDiff} days since ${referenceDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</span>
            <span class="months-since">${monthsDecimal.toFixed(1)} months</span>
        `;
    }
}

// Function to calculate color luminance for text contrast
function getLuminance(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16) / 255;
    const g = parseInt(hexColor.substr(3, 2), 16) / 255;
    const b = parseInt(hexColor.substr(5, 2), 16) / 255;
    
    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Function to render the tasks list in the entry modal
function renderTasksList() {
    if (!elements.tasksList) return;
    
    elements.tasksList.innerHTML = '';
    
    state.currentTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        const taskText = document.createElement('span');
        taskText.classList.add('task-text');
        taskText.textContent = task.text;
        
        // Click on task to toggle completion
        taskItem.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-task-btn') || 
                e.target.closest('.delete-task-btn')) {
                return; // Don't toggle if delete button was clicked
            }
            task.completed = !task.completed;
            renderTasksList();
            saveData();
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-task-btn');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', () => {
            state.currentTasks = state.currentTasks.filter(t => t.id !== task.id);
            renderTasksList();
            saveData();
        });
        
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteBtn);
        
        elements.tasksList.appendChild(taskItem);
    });
}

// Function to save entry data from the form
function saveEntry(e) {
    e.preventDefault();
    
    // Get form data
    const entryId = elements.entryId.value;
    const entryDate = elements.entryDate.value;
    const sleepScore = elements.sleepScore.value ? parseInt(elements.sleepScore.value) : null;
    
    // Check for duplicate date when adding a new entry
    if (!entryId) {
        const existingEntry = state.entries.find(entry => entry.date === entryDate);
        if (existingEntry) {
            // Show confirmation dialog
            if (!confirm(`An entry already exists for ${formatDate(new Date(entryDate))}. Do you want to edit that entry instead?`)) {
                return; // User canceled, don't save
            } else {
                // User wants to edit the existing entry instead
                showEditEntryModal(existingEntry.id);
                return;
            }
        }
    }
    
    // Collect sleep times
    const nightSleep = {
        hours: elements.nightSleepHours.value ? parseInt(elements.nightSleepHours.value) : 0,
        minutes: elements.nightSleepMinutes.value ? parseInt(elements.nightSleepMinutes.value) : 0
    };
    
    const dayNap = {
        hours: elements.dayNapHours.value ? parseInt(elements.dayNapHours.value) : 0,
        minutes: elements.dayNapMinutes.value ? parseInt(elements.dayNapMinutes.value) : 0
    };
    
    const deepSleep = {
        hours: elements.deepSleepHours.value ? parseInt(elements.deepSleepHours.value) : 0,
        minutes: elements.deepSleepMinutes.value ? parseInt(elements.deepSleepMinutes.value) : 0
    };
    
    const lightSleep = {
        hours: elements.lightSleepHours.value ? parseInt(elements.lightSleepHours.value) : 0,
        minutes: elements.lightSleepMinutes.value ? parseInt(elements.lightSleepMinutes.value) : 0
    };
    
    const remSleep = {
        hours: elements.remSleepHours.value ? parseInt(elements.remSleepHours.value) : 0,
        minutes: elements.remSleepMinutes.value ? parseInt(elements.remSleepMinutes.value) : 0
    };
    
    // Get health indicators
    const cutSleep = elements.cutSleep.checked;
    const seizure = elements.seizure.checked;
    const shake = elements.shake.checked;
    const afr = elements.afr.checked;
    
    // Get notes and tasks
    const eventsNotes = elements.eventsNotes.value;
    const tasks = state.currentTasks || [];
    
    // Get tags
    const tagsInput = elements.tags.value;
    const customTags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    
    // Get selected tags from interface
    const selectedTags = Array.from(document.querySelectorAll('#available-tags .tag.selected'))
        .map(tagElement => tagElement.textContent.trim());
    
    // Combine both tag sources
    const allTags = [...new Set([...selectedTags, ...customTags])];
    
    // Get activity metrics
    const calories = elements.calories.value ? parseInt(elements.calories.value) : null;
    const steps = elements.steps.value ? parseInt(elements.steps.value) : null;
    const weight = elements.weight.value ? parseFloat(elements.weight.value) : null;
    const standing = elements.standing.value ? parseInt(elements.standing.value) : null;
    
    // Create entry object
    const entry = {
        id: entryId || `entry_${Date.now()}`,
        date: entryDate,
        sleepScore,
        nightSleep,
        dayNap,
        deepSleep,
        lightSleep,
        remSleep,
        wakeUps: elements.wakeUps.value ? parseInt(elements.wakeUps.value) : 0,
        cutSleep,
        seizure,
        shake,
        afr,
        eventsNotes,
        tasks,
        tags: allTags,
        calories,
        steps,
        weight,
        standing
    };
    
    // Update or add entry
    if (entryId) {
        // Update existing entry
        const index = state.entries.findIndex(e => e.id === entryId);
        if (index !== -1) {
            state.entries[index] = entry;
        }
    } else {
        // Add new entry
        state.entries.push(entry);
    }
    
    // Save and update UI
    saveData();
    renderEntries();
    updateTodayInfo();
    
    // Close modal
    elements.entryModal.classList.remove('visible');
}

// Function to save settings from the settings form
function saveSettings(event) {
    event.preventDefault();
    
    // Update settings from the form
    state.settings.referenceDate = elements.referenceDate.value;
    state.settings.caloriesGoal = parseInt(elements.caloriesGoal.value || 0);
    state.settings.stepsGoal = parseInt(elements.stepsGoal.value || 0);
    
    // Sleep thresholds
    state.settings.sleepThresholds = {
        red: {
            hours: parseInt(elements.sleepRedHours.value || 0),
            minutes: parseInt(elements.sleepRedMinutes.value || 0)
        },
        yellow: {
            hours: parseInt(elements.sleepYellowHours.value || 0),
            minutes: parseInt(elements.sleepYellowMinutes.value || 0)
        },
        darkGreen: {
            hours: parseInt(elements.sleepDarkGreenHours.value || 0),
            minutes: parseInt(elements.sleepDarkGreenMinutes.value || 0)
        }
    };
    
    // Deep sleep thresholds
    state.settings.deepSleepMin = {
        hours: parseInt(elements.deepMinHours.value || 0),
        minutes: parseInt(elements.deepMinMinutes.value || 0)
    };
    
    // Light sleep thresholds
    state.settings.lightSleepRange = {
        min: {
            hours: parseInt(elements.lightMinHours.value || 0),
            minutes: parseInt(elements.lightMinMinutes.value || 0)
        },
        max: {
            hours: parseInt(elements.lightMaxHours.value || 0),
            minutes: parseInt(elements.lightMaxMinutes.value || 0)
        }
    };
    
    // REM sleep thresholds
    state.settings.remThresholds = {
        red: {
            hours: parseInt(elements.remRedHours.value || 0),
            minutes: parseInt(elements.remRedMinutes.value || 0)
        },
        yellow: {
            hours: parseInt(elements.remYellowHours.value || 0),
            minutes: parseInt(elements.remYellowMinutes.value || 0)
        }
    };
    
    // Theme settings
    state.settings.theme = elements.themeSelector.value;
    
    // Accent color
    const selectedColorOption = document.querySelector('.color-option.selected');
    if (selectedColorOption) {
        state.settings.accentColor = selectedColorOption.dataset.color;
        document.body.setAttribute('data-accent', selectedColorOption.dataset.color);
    }
    
    // Apply theme
    if (state.settings.theme === 'dark' || 
        (state.settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Save data and update UI
    saveData();
    renderEntries();
    updateDateDisplay();
    updateTodayInfo();
    
    // Close the settings modal
    elements.settingsModal.classList.remove('visible');
}

// Function to update theme based on settings
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

// Function to apply accent color from settings
function applyAccentColor() {
    // Apply accent color to document body
    document.body.setAttribute('data-accent', state.settings.accentColor);
}

// Helper function to create table cells with appropriate styling
function createCell(content, className = '', colorClass = null) {
    const cell = document.createElement('td');
    
    // Set content
    cell.textContent = content;
    
    // Add class if provided
    if (className) {
        cell.classList.add(className);
    }
    
    // If it's an empty value, add empty-cell class
    if (content === '-') {
        cell.classList.add('empty-cell');
    }
    
    // Add color class if provided
    if (colorClass) {
        cell.classList.add(colorClass);
        
        // Add emphasis for important values
        if (colorClass === 'green' || colorClass === 'red' || colorClass === 'dark-green') {
            cell.style.fontWeight = 'bold';
        }
    }
    
    return cell;
}

// Helper function to determine the color class based on sleep score
function getScoreColor(score) {
    if (score === null || score === undefined || score === '') {
        return null;
    }
    
    score = parseInt(score);
    
    if (score >= 85) {
        return 'dark-green';
    } else if (score >= 70) {
        return 'green';
    } else if (score >= 55) {
        return 'yellow';
    } else {
        return 'red';
    }
}

/**
 * Helper function to format time values in a compact way (e.g., "7h 30m")
 * @param {number} hours - Number of hours
 * @param {number} minutes - Number of minutes
 * @returns {string} Formatted time string
 */
function formatTimeCompact(hours, minutes) {
    if (hours === null || minutes === null || (hours === 0 && minutes === 0)) {
        return '-';
    }
    
    if (hours === 0) {
        return `${minutes}m`;
    }
    
    if (minutes === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${minutes}m`;
}

/**
 * Helper function to determine color coding for sleep duration based on thresholds
 * @param {number} hours - Hours of sleep
 * @param {number} minutes - Minutes of sleep
 * @returns {string|null} Color class to apply or null if no color
 */
function getSleepColor(hours, minutes) {
    // Convert hours and minutes to total minutes
    const totalMinutes = (hours || 0) * 60 + (minutes || 0);
    
    // Get settings or use defaults
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        sleepThresholds: {
            red: { hours: 6, minutes: 0 },
            yellow: { hours: 7, minutes: 0 },
            darkGreen: { hours: 8, minutes: 0 }
        }
    };
    
    // Calculate threshold minutes
    let redThresholdMinutes = 360; // Default: 6h
    let yellowThresholdMinutes = 420; // Default: 7h
    let darkGreenThresholdMinutes = 480; // Default: 8h
    
    if (settings.sleepThresholds) {
        if (settings.sleepThresholds.red) {
            redThresholdMinutes = (settings.sleepThresholds.red.hours || 0) * 60 + 
                                 (settings.sleepThresholds.red.minutes || 0);
        }
        
        if (settings.sleepThresholds.yellow) {
            yellowThresholdMinutes = (settings.sleepThresholds.yellow.hours || 0) * 60 + 
                                    (settings.sleepThresholds.yellow.minutes || 0);
        }
        
        if (settings.sleepThresholds.darkGreen) {
            darkGreenThresholdMinutes = (settings.sleepThresholds.darkGreen.hours || 0) * 60 + 
                                       (settings.sleepThresholds.darkGreen.minutes || 0);
        }
    }
    
    // Determine color class based on thresholds
    if (totalMinutes === 0) {
        return ''; // No color for zero values
    } else if (totalMinutes < redThresholdMinutes) {
        return 'poor'; // Below red threshold
    } else if (totalMinutes < yellowThresholdMinutes) {
        return 'average'; // Between red and yellow thresholds
    } else if (totalMinutes >= darkGreenThresholdMinutes) {
        return 'excellent'; // Above dark green threshold
    } else {
        return 'good'; // Between yellow and dark green thresholds
    }
}

// Update settings form to apply theme changes immediately for preview
document.addEventListener('DOMContentLoaded', function() {
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.addEventListener('change', function() {
            // Apply theme immediately as preview
            const selectedTheme = themeSelector.value;
            applyTheme(selectedTheme);
            // Note: The actual preference will be saved when the form is submitted
        });
    }
    
    // Apply proper styling to settings buttons
    const settingsCancelBtn = document.getElementById('settings-cancel-btn');
    const settingsSaveBtn = document.getElementById('settings-save-btn');
    
    if (settingsCancelBtn) {
        settingsCancelBtn.classList.add('secondary-btn');
    }
    
    if (settingsSaveBtn) {
        settingsSaveBtn.classList.add('primary-btn');
    }
    
    // Ensure modals respect dark mode
    const modals = document.querySelectorAll('.modal');
    const currentTheme = localStorage.getItem('theme') || 'auto';
    
    if (currentTheme === 'dark' || 
        (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        modals.forEach(modal => {
            modal.classList.add('dark-theme');
        });
    }
});

// Fix saveEntry function to work correctly
function fixSaveEntry() {
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get form data
            const entryId = document.getElementById('entry-id').value;
            const entryDate = document.getElementById('entry-date').value;
            
            if (!entryDate) {
                alert('Please select a date');
                return;
            }
            
            // Create entry object
            const entry = {
                id: entryId || Date.now().toString(),
                date: entryDate,
                // Add other fields as needed
                // ...
            };
            
            // Add to entries array
            if (!entryId) {
                state.entries.push(entry);
            } else {
                // Update existing entry
                const index = state.entries.findIndex(e => e.id === entryId);
                if (index !== -1) {
                    state.entries[index] = entry;
                }
            }
            
            // Save data and close modal
            saveData();
            document.getElementById('entry-modal').style.display = 'none';
            
            // Re-render entries
            renderEntries();
            
            console.log('Entry saved successfully');
        });
    }
}

// CSS variables for themes
function setupThemeVariables() {
    // Define CSS Variables
    const root = document.documentElement;
    
    // Light Theme
    root.style.setProperty('--bg-color', '#f8f9fa');
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--text-color', '#333333');
    root.style.setProperty('--border-color', '#e2e8f0');
    root.style.setProperty('--input-bg', '#ffffff');
    root.style.setProperty('--accent-color', '#4361ee');
    root.style.setProperty('--accent-hover', '#3a56d4');
    root.style.setProperty('--accent-rgb', '67, 97, 238');
    
    // Dark Theme Variables
    root.style.setProperty('--dark-bg', '#121212');
    root.style.setProperty('--dark-bg-secondary', '#1e1e1e');
    root.style.setProperty('--dark-text', '#e2e8f0');
    root.style.setProperty('--dark-border-color', '#383838');
    root.style.setProperty('--dark-input-bg', '#2c2c2c');
    root.style.setProperty('--dark-accent', '#5d76f7');
    root.style.setProperty('--dark-accent-hover', '#6e84ff');
    
    // Score colors
    root.style.setProperty('--color-excellent', '#22c55e');
    root.style.setProperty('--color-good', '#84cc16');
    root.style.setProperty('--color-average', '#f59e0b');
    root.style.setProperty('--color-poor', '#ef4444');
}

// Initialize settings
function initializeSettings() {
    // Load settings
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        theme: 'auto',
        referenceDate: new Date().toISOString().split('T')[0],
        caloriesGoal: 2000,
        stepsGoal: 10000,
        sleepThresholds: {
            red: { hours: 6, minutes: 0 },
            yellow: { hours: 7, minutes: 0 },
            darkGreen: { hours: 8, minutes: 0 }
        },
        deepSleepThreshold: { hours: 1, minutes: 30 },
        lightSleepRange: {
            min: { hours: 3, minutes: 0 },
            max: { hours: 5, minutes: 0 }
        },
        remSleepThresholds: {
            red: { hours: 0, minutes: 50 },
            yellow: { hours: 1, minutes: 30 }
        }
    };
    
    // Populate settings form
    const themeSelector = document.getElementById('theme-selector');
    const referenceDate = document.getElementById('reference-date');
    const caloriesGoal = document.getElementById('calories-goal');
    const stepsGoal = document.getElementById('steps-goal');
    
    // Sleep thresholds
    const sleepRedHours = document.getElementById('sleep-red-hours');
    const sleepRedMinutes = document.getElementById('sleep-red-minutes');
    const sleepYellowHours = document.getElementById('sleep-yellow-hours');
    const sleepYellowMinutes = document.getElementById('sleep-yellow-minutes');
    const sleepDarkGreenHours = document.getElementById('sleep-darkgreen-hours');
    const sleepDarkGreenMinutes = document.getElementById('sleep-darkgreen-minutes');
    
    // Deep sleep threshold
    const deepMinHours = document.getElementById('deep-min-hours');
    const deepMinMinutes = document.getElementById('deep-min-minutes');
    
    // Light sleep range
    const lightMinHours = document.getElementById('light-min-hours');
    const lightMinMinutes = document.getElementById('light-min-minutes');
    const lightMaxHours = document.getElementById('light-max-hours');
    const lightMaxMinutes = document.getElementById('light-max-minutes');
    
    // REM sleep thresholds
    const remRedHours = document.getElementById('rem-red-hours');
    const remRedMinutes = document.getElementById('rem-red-minutes');
    const remYellowHours = document.getElementById('rem-yellow-hours');
    const remYellowMinutes = document.getElementById('rem-yellow-minutes');
    
    // Set values if elements exist
    if (themeSelector) {
        themeSelector.value = settings.theme || 'auto';
    }
    
    if (referenceDate) {
        referenceDate.value = settings.referenceDate || new Date().toISOString().split('T')[0];
    }
    
    if (caloriesGoal) {
        caloriesGoal.value = settings.caloriesGoal || 2000;
    }
    
    if (stepsGoal) {
        stepsGoal.value = settings.stepsGoal || 10000;
    }
    
    // Sleep thresholds
    if (sleepRedHours && settings.sleepThresholds && settings.sleepThresholds.red) {
        sleepRedHours.value = settings.sleepThresholds.red.hours || 6;
    }
    
    if (sleepRedMinutes && settings.sleepThresholds && settings.sleepThresholds.red) {
        sleepRedMinutes.value = settings.sleepThresholds.red.minutes || 0;
    }
    
    if (sleepYellowHours && settings.sleepThresholds && settings.sleepThresholds.yellow) {
        sleepYellowHours.value = settings.sleepThresholds.yellow.hours || 7;
    }
    
    if (sleepYellowMinutes && settings.sleepThresholds && settings.sleepThresholds.yellow) {
        sleepYellowMinutes.value = settings.sleepThresholds.yellow.minutes || 0;
    }
    
    if (sleepDarkGreenHours && settings.sleepThresholds && settings.sleepThresholds.darkGreen) {
        sleepDarkGreenHours.value = settings.sleepThresholds.darkGreen.hours || 8;
    }
    
    if (sleepDarkGreenMinutes && settings.sleepThresholds && settings.sleepThresholds.darkGreen) {
        sleepDarkGreenMinutes.value = settings.sleepThresholds.darkGreen.minutes || 0;
    }
    
    // Deep sleep threshold
    if (deepMinHours && settings.deepSleepThreshold) {
        deepMinHours.value = settings.deepSleepThreshold.hours || 1;
    }
    
    if (deepMinMinutes && settings.deepSleepThreshold) {
        deepMinMinutes.value = settings.deepSleepThreshold.minutes || 30;
    }
    
    // Light sleep range
    if (lightMinHours && settings.lightSleepRange && settings.lightSleepRange.min) {
        lightMinHours.value = settings.lightSleepRange.min.hours || 3;
    }
    
    if (lightMinMinutes && settings.lightSleepRange && settings.lightSleepRange.min) {
        lightMinMinutes.value = settings.lightSleepRange.min.minutes || 0;
    }
    
    if (lightMaxHours && settings.lightSleepRange && settings.lightSleepRange.max) {
        lightMaxHours.value = settings.lightSleepRange.max.hours || 5;
    }
    
    if (lightMaxMinutes && settings.lightSleepRange && settings.lightSleepRange.max) {
        lightMaxMinutes.value = settings.lightSleepRange.max.minutes || 0;
    }
    
    // REM sleep thresholds
    if (remRedHours && settings.remSleepThresholds && settings.remSleepThresholds.red) {
        remRedHours.value = settings.remSleepThresholds.red.hours || 0;
    }
    
    if (remRedMinutes && settings.remSleepThresholds && settings.remSleepThresholds.red) {
        remRedMinutes.value = settings.remSleepThresholds.red.minutes || 50;
    }
    
    if (remYellowHours && settings.remSleepThresholds && settings.remSleepThresholds.yellow) {
        remYellowHours.value = settings.remSleepThresholds.yellow.hours || 1;
    }
    
    if (remYellowMinutes && settings.remSleepThresholds && settings.remSleepThresholds.yellow) {
        remYellowMinutes.value = settings.remSleepThresholds.yellow.minutes || 30;
    }
    
    // Render tags list for management
    renderTagsManagement();
    
    // Apply theme
    applyTheme(settings.theme || 'auto');
}

// Save settings
function saveSettings(e) {
    if (e) e.preventDefault();
    
    // Get form elements
    const themeSelector = document.getElementById('theme-selector');
    const referenceDate = document.getElementById('reference-date');
    const caloriesGoal = document.getElementById('calories-goal');
    const stepsGoal = document.getElementById('steps-goal');
    
    // Sleep thresholds
    const sleepRedHours = document.getElementById('sleep-red-hours');
    const sleepRedMinutes = document.getElementById('sleep-red-minutes');
    const sleepYellowHours = document.getElementById('sleep-yellow-hours');
    const sleepYellowMinutes = document.getElementById('sleep-yellow-minutes');
    const sleepDarkGreenHours = document.getElementById('sleep-darkgreen-hours');
    const sleepDarkGreenMinutes = document.getElementById('sleep-darkgreen-minutes');
    
    // Deep sleep threshold
    const deepMinHours = document.getElementById('deep-min-hours');
    const deepMinMinutes = document.getElementById('deep-min-minutes');
    
    // Light sleep range
    const lightMinHours = document.getElementById('light-min-hours');
    const lightMinMinutes = document.getElementById('light-min-minutes');
    const lightMaxHours = document.getElementById('light-max-hours');
    const lightMaxMinutes = document.getElementById('light-max-minutes');
    
    // REM sleep thresholds
    const remRedHours = document.getElementById('rem-red-hours');
    const remRedMinutes = document.getElementById('rem-red-minutes');
    const remYellowHours = document.getElementById('rem-yellow-hours');
    const remYellowMinutes = document.getElementById('rem-yellow-minutes');
    
    // Build settings object
    const settings = {
        theme: themeSelector ? themeSelector.value : 'auto',
        referenceDate: referenceDate ? referenceDate.value : new Date().toISOString().split('T')[0],
        caloriesGoal: caloriesGoal ? parseInt(caloriesGoal.value) : 2000,
        stepsGoal: stepsGoal ? parseInt(stepsGoal.value) : 10000,
        sleepThresholds: {
            red: {
                hours: sleepRedHours ? parseInt(sleepRedHours.value) : 6,
                minutes: sleepRedMinutes ? parseInt(sleepRedMinutes.value) : 0
            },
            yellow: {
                hours: sleepYellowHours ? parseInt(sleepYellowHours.value) : 7,
                minutes: sleepYellowMinutes ? parseInt(sleepYellowMinutes.value) : 0
            },
            darkGreen: {
                hours: sleepDarkGreenHours ? parseInt(sleepDarkGreenHours.value) : 8,
                minutes: sleepDarkGreenMinutes ? parseInt(sleepDarkGreenMinutes.value) : 0
            }
        },
        deepSleepThreshold: {
            hours: deepMinHours ? parseInt(deepMinHours.value) : 1,
            minutes: deepMinMinutes ? parseInt(deepMinMinutes.value) : 30
        },
        lightSleepRange: {
            min: {
                hours: lightMinHours ? parseInt(lightMinHours.value) : 3,
                minutes: lightMinMinutes ? parseInt(lightMinMinutes.value) : 0
            },
            max: {
                hours: lightMaxHours ? parseInt(lightMaxHours.value) : 5,
                minutes: lightMaxMinutes ? parseInt(lightMaxMinutes.value) : 0
            }
        },
        remSleepThresholds: {
            red: {
                hours: remRedHours ? parseInt(remRedHours.value) : 0,
                minutes: remRedMinutes ? parseInt(remRedMinutes.value) : 50
            },
            yellow: {
                hours: remYellowHours ? parseInt(remYellowHours.value) : 1,
                minutes: remYellowMinutes ? parseInt(remYellowMinutes.value) : 30
            }
        }
    };
    
    // Save settings to localStorage
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Apply theme
    applyTheme(settings.theme);
    
    // Close the modal
    document.getElementById('settings-modal').style.display = 'none';
    
    // Update UI
    updateDateDisplay(); // Update date display with new reference date
    renderEntries(); // Re-render entries with new thresholds
    
    console.log('Settings saved successfully');
}

// Apply theme based on preference
function applyTheme(theme) {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'dark' || (theme === 'auto' && prefersDark)) {
        root.classList.add('dark-theme');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('dark-theme');
        });
    } else {
        root.classList.remove('dark-theme');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('dark-theme');
        });
    }
}

// Call these functions on page load
document.addEventListener('DOMContentLoaded', function() {
    setupThemeVariables();
    initializeSettings();
    
    // Settings form event listeners
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
    }
    
    const settingsCancelBtn = document.getElementById('settings-cancel-btn');
    if (settingsCancelBtn) {
        settingsCancelBtn.addEventListener('click', function() {
            document.getElementById('settings-modal').style.display = 'none';
        });
    }
});

// Updated getSleepColor function to use the new thresholds from settings
function getSleepColor(sleepDuration) {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        goodSleepThreshold: 7.5,
        badSleepThreshold: 6.0
    };
    
    if (sleepDuration >= settings.goodSleepThreshold) {
        return 'excellent';
    } else if (sleepDuration < settings.badSleepThreshold) {
        return 'poor';
    } else {
        return 'average';
    }
}

// Call additional initialization functions during document load
document.addEventListener('DOMContentLoaded', function() {
    setupThemeVariables();
    initializeSettings();
    initializeModals();
    
    // Call fixSaveEntry to ensure entry saving works
    fixSaveEntry();
    
    // Load and render data
    loadData();
    renderEntries();
});

/**
 * Determines the appropriate color class for deep sleep values based on thresholds
 * @param {Number} hours - Deep sleep hours
 * @param {Number} minutes - Deep sleep minutes
 * @returns {String} Color class name
 */
function getDeepSleepColor(hours, minutes) {
    // Convert hours and minutes to total minutes for easier comparison
    const totalMinutes = (hours || 0) * 60 + (minutes || 0);
    
    // Get settings or use defaults if not available
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    // Deep sleep thresholds (default values if not in settings)
    const deepMinMinutes = settings.deepMinMinutes || 90; // 1h 30m minimum recommended
    
    if (totalMinutes === 0) {
        return ''; // No color for zero values
    } else if (totalMinutes < deepMinMinutes * 0.7) {
        return 'poor'; // Below 70% of minimum threshold
    } else if (totalMinutes < deepMinMinutes) {
        return 'average'; // Below minimum but above 70%
    } else if (totalMinutes >= deepMinMinutes * 1.3) {
        return 'excellent'; // 30% above minimum threshold
    } else {
        return 'good'; // Between minimum and 30% above
    }
}

// Add event listeners for data management buttons
document.addEventListener('DOMContentLoaded', function() {
    // Export data
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    // Import data
    const importDataBtn = document.getElementById('import-data-btn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', function() {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            // Trigger click on the file input
            fileInput.click();
            
            // Handle file selection
            fileInput.addEventListener('change', function() {
                const file = fileInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        importData(e.target.result);
                    };
                    reader.readAsText(file);
                }
                
                // Clean up
                document.body.removeChild(fileInput);
            });
        });
    }
    
    // Reset data
    const resetDataBtn = document.getElementById('reset-data-btn');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
                resetData();
            }
        });
    }
});

// Export data function
function exportData() {
    // Get all data from localStorage
    const data = {
        entries: JSON.parse(localStorage.getItem('entries') || '[]'),
        settings: JSON.parse(localStorage.getItem('settings') || '{}'),
        tags: JSON.parse(localStorage.getItem('tags') || '[]'),
        tasks: JSON.parse(localStorage.getItem('tasks') || '{}')
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob with the data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleep-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    
    // Append the link to the body
    document.body.appendChild(a);
    
    // Programmatically click the link
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data function
function importData(jsonString) {
    try {
        // Parse the JSON data
        const data = JSON.parse(jsonString);
        
        // Validate data structure
        if (!data.entries || !data.settings || !data.tags || !data.tasks) {
            throw new Error('Invalid data format');
        }
        
        // Store the data in localStorage
        localStorage.setItem('entries', JSON.stringify(data.entries));
        localStorage.setItem('settings', JSON.stringify(data.settings));
        localStorage.setItem('tags', JSON.stringify(data.tags));
        localStorage.setItem('tasks', JSON.stringify(data.tasks));
        
        // Reload the data
        loadData();
        
        // Update UI
        renderEntries();
        renderTagsList();
        updateDateDisplay();
        
        alert('Data imported successfully');
    } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data: ' + error.message);
    }
}

// Reset data function
function resetData() {
    // Clear all application data
    localStorage.removeItem('entries');
    localStorage.removeItem('settings');
    localStorage.removeItem('tags');
    localStorage.removeItem('tasks');
    
    // Reset to defaults
    loadData();
    
    // Update UI
    renderEntries();
    renderTagsList();
    updateDateDisplay();
    
    alert('All data has been reset to defaults');
}

// Add the missing getLightSleepColor function
function getLightSleepColor(hours, minutes) {
    // Convert to total minutes for easier comparison
    const totalMinutes = (hours || 0) * 60 + (minutes || 0);
    
    // Get light sleep thresholds from settings or use defaults
    const settings = state.settings || {};
    
    // Min threshold (default 3h 0m = 180 min)
    const minHours = settings.lightMinHours || 3;
    const minMinutes = settings.lightMinMinutes || 0;
    const minThreshold = minHours * 60 + minMinutes;
    
    // Max threshold (default 5h 0m = 300 min)
    const maxHours = settings.lightMaxHours || 5;
    const maxMinutes = settings.lightMaxMinutes || 0;
    const maxThreshold = maxHours * 60 + maxMinutes;
    
    // Determine color based on thresholds
    if (totalMinutes === 0) {
        return ''; // No color for 0 values
    } else if (totalMinutes < minThreshold) {
        return 'poor'; // Too little light sleep
    } else if (totalMinutes > maxThreshold) {
        return 'poor'; // Too much light sleep
    } else {
        return 'good'; // Just right
    }
}

// Helper function to format date for input field
function formatDateForInput(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Determines the appropriate color class for REM sleep values based on thresholds
 * @param {Object} remSleep - REM sleep object with hours and minutes
 * @returns {String} Color class name
 */
function getRemSleepColor(remSleep) {
    // Return empty string if remSleep is not provided
    if (!remSleep) {
        return '';
    }
    
    // Convert hours and minutes to total minutes for easier comparison
    const totalMinutes = (remSleep.hours || 0) * 60 + (remSleep.minutes || 0);
    
    // Get settings or use defaults if not available
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    // REM sleep thresholds (default values if not in settings)
    // Poor threshold (red)
    const remRedMinutes = (settings.remThresholds && settings.remThresholds.red) 
        ? settings.remThresholds.red.hours * 60 + settings.remThresholds.red.minutes 
        : 50; // Default: 0h 50m
    
    // Moderate threshold (yellow)
    const remYellowMinutes = (settings.remThresholds && settings.remThresholds.yellow) 
        ? settings.remThresholds.yellow.hours * 60 + settings.remThresholds.yellow.minutes 
        : 90; // Default: 1h 30m
    
    if (totalMinutes === 0) {
        return ''; // No color for zero values
    } else if (totalMinutes <= remRedMinutes) {
        return 'poor'; // Below red threshold
    } else if (totalMinutes <= remYellowMinutes) {
        return 'average'; // Between red and yellow thresholds
    } else if (totalMinutes >= remYellowMinutes * 1.3) {
        return 'excellent'; // 30% above yellow threshold
    } else {
        return 'good'; // Between yellow and 30% above yellow
    }
}