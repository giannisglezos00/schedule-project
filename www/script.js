// Define the base starting date for day count calculation
const BASE_DATE = new Date('2024-04-11'); // Starting date for day count calculation

// Store all sleep data entries
let sleepData = [];

// Current page for pagination
let currentPage = 1;
const ENTRIES_PER_PAGE = 10;

// DOM Elements - Cached for better performance
const elements = {
    // Main elements
    currentDate: document.getElementById('current-date'),
    daysCount: document.getElementById('days-count'),
    sleepTable: document.getElementById('sleep-table'),
    sleepDataBody: document.getElementById('sleep-data'),
    
    // Controls
    addEntryBtn: document.getElementById('add-entry-btn'),
    searchInput: document.getElementById('search-input'),
    tagFilter: document.getElementById('tag-filter'),
    
    // Pagination
    prevPageBtn: document.getElementById('prev-page'),
    nextPageBtn: document.getElementById('next-page'),
    pageIndicator: document.getElementById('page-indicator'),
    
    // Statistics
    avgSleepScore: document.getElementById('avg-sleep-score'),
    avgSleepDuration: document.getElementById('avg-sleep-duration'),
    avgSteps: document.getElementById('avg-steps'),
    recentWeight: document.getElementById('recent-weight'),
    
    // Modal elements
    modal: document.getElementById('entry-modal'),
    modalTitle: document.getElementById('modal-title'),
    closeBtn: document.querySelector('.close-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    
    // Form elements
    entryForm: document.getElementById('entry-form'),
    entryId: document.getElementById('entry-id'),
    entryDate: document.getElementById('entry-date'),
    sleepScore: document.getElementById('sleep-score'),
    
    // Night sleep inputs
    nightSleepHours: document.getElementById('night-sleep-hours'),
    nightSleepMinutes: document.getElementById('night-sleep-minutes'),
    
    // Day nap inputs
    dayNapHours: document.getElementById('day-nap-hours'),
    dayNapMinutes: document.getElementById('day-nap-minutes'),
    
    // Sleep phases inputs
    deepSleepHours: document.getElementById('deep-sleep-hours'),
    deepSleepMinutes: document.getElementById('deep-sleep-minutes'),
    lightSleepHours: document.getElementById('light-sleep-hours'),
    lightSleepMinutes: document.getElementById('light-sleep-minutes'),
    remSleepHours: document.getElementById('rem-sleep-hours'),
    remSleepMinutes: document.getElementById('rem-sleep-minutes'),
    
    // Other inputs
    wakeUps: document.getElementById('wake-ups'),
    cutSleep: document.getElementById('cut-sleep'),
    shake: document.getElementById('shake'),
    seizure: document.getElementById('seizure'),
    afr: document.getElementById('afr'),
    eventsNotes: document.getElementById('events-notes'),
    tags: document.getElementById('tags'),
    calories: document.getElementById('calories'),
    steps: document.getElementById('steps'),
    weight: document.getElementById('weight'),
    standing: document.getElementById('standing'),
    pill1: document.getElementById('pill-1'),
    pill2: document.getElementById('pill-2'),
    pill3: document.getElementById('pill-3')
};

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current date in the header
    updateCurrentDate();
    
    // Load data from localStorage if available
    loadData();
    
    // Render table initially
    renderTable();
    
    // Update statistics
    updateStatistics();
    
    // Setup event listeners
    setupEventListeners();
});

// Update the current date display in the header
function updateCurrentDate() {
    const now = new Date();
    
    // Format the date as "Day of week DD Month YYYY"
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    elements.currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);
    
    // Calculate days since BASE_DATE
    const diffTime = Math.abs(now - BASE_DATE);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Convert to months for better readability
    const diffMonths = (diffDays / 30.44).toFixed(1); // Average days per month
    elements.daysCount.textContent = `${diffMonths} Months`;
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('sleepTrackerData');
    if (savedData) {
        sleepData = JSON.parse(savedData);
        
        // Sort data by date (newest first)
        sleepData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        // If no data, initialize with sample data for demonstration
        sleepData = getSampleData();
        saveData();
    }
    
    // Update tag filter dropdown
    updateTagFilter();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('sleepTrackerData', JSON.stringify(sleepData));
    
    // Update tag filter dropdown after saving
    updateTagFilter();
}

// Populate tag filter dropdown with unique tags from data
function updateTagFilter() {
    // Clear existing options except the first one
    while (elements.tagFilter.options.length > 1) {
        elements.tagFilter.options.remove(1);
    }
    
    // Get all unique tags
    const allTags = new Set();
    sleepData.forEach(entry => {
        if (entry.tags && entry.tags.length) {
            entry.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Add tags to dropdown
    Array.from(allTags).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        elements.tagFilter.appendChild(option);
    });
}

// Set up all event listeners
function setupEventListeners() {
    // Add new entry button
    elements.addEntryBtn.addEventListener('click', () => openModal());
    
    // Close modal buttons
    elements.closeBtn.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            closeModal();
        }
    });
    
    // Form submission
    elements.entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEntry();
    });
    
    // Search and filter
    elements.searchInput.addEventListener('input', renderTable);
    elements.tagFilter.addEventListener('change', renderTable);
    
    // Pagination
    elements.prevPageBtn.addEventListener('click', () => changePage(-1));
    elements.nextPageBtn.addEventListener('click', () => changePage(1));
}

// Change pagination page
function changePage(direction) {
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / ENTRIES_PER_PAGE);
    
    currentPage += direction;
    
    // Ensure page is within valid range
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    renderTable();
}

// Get filtered data based on search and tag filter
function getFilteredData() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const tagFilter = elements.tagFilter.value;
    
    return sleepData.filter(entry => {
        // Check if entry matches search term
        const matchesSearch = !searchTerm || 
            (entry.eventsNotes && entry.eventsNotes.toLowerCase().includes(searchTerm)) ||
            (entry.date && entry.date.toLowerCase().includes(searchTerm));
            
        // Check if entry matches tag filter
        const matchesTag = !tagFilter || 
            (entry.tags && entry.tags.includes(tagFilter));
            
        return matchesSearch && matchesTag;
    });
}

// Render the data table with current filters and pagination
function renderTable() {
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / ENTRIES_PER_PAGE);
    
    // Update page indicator
    elements.pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    
    // Clear existing table rows

    elements.sleepDataBody.innerHTML = '';
    
    // Calculate starting and ending indices for current page
    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    const endIndex = startIndex + ENTRIES_PER_PAGE;
    
    // Get current page data
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    // Render each entry row
    currentPageData.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        // Calculate day number (negative for past days, positive for future days)
        const entryDate = new Date(entry.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayDiff = Math.floor((entryDate - today) / (1000 * 60 * 60 * 24));
        
        // Format date as DD/MM/YYYY
        const formattedDate = formatDate(entry.date);
        
        // Create row cells
        row.innerHTML = `
            <td>${dayDiff}</td>
            <td>${formattedDate}</td>
            <td><span class="sleep-score ${getSleepScoreClass(entry.sleepScore)}">${entry.sleepScore || '-'}</span></td>
            <td>${formatDuration(entry.nightSleepHours, entry.nightSleepMinutes)}</td>
            <td>${formatDuration(entry.dayNapHours, entry.dayNapMinutes) || '-'}</td>
            <td class="deep-sleep">
                <span class="phase-value">${formatDuration(entry.deepSleepHours, entry.deepSleepMinutes)}</span>
                <span class="phase-percentage">${calculatePercentage(
                    entry.deepSleepHours, 
                    entry.deepSleepMinutes, 
                    entry.nightSleepHours, 
                    entry.nightSleepMinutes
                )}%</span>
            </td>
            <td class="light-sleep">
                <span class="phase-value">${formatDuration(entry.lightSleepHours, entry.lightSleepMinutes)}</span>
                <span class="phase-percentage">${calculatePercentage(
                    entry.lightSleepHours, 
                    entry.lightSleepMinutes, 
                    entry.nightSleepHours, 
                    entry.nightSleepMinutes
                )}%</span>
            </td>
            <td class="rem-sleep">
                <span class="phase-value">${formatDuration(entry.remSleepHours, entry.remSleepMinutes)}</span>
                <span class="phase-percentage">${calculatePercentage(
                    entry.remSleepHours, 
                    entry.remSleepMinutes, 
                    entry.nightSleepHours, 
                    entry.nightSleepMinutes
                )}%</span>
            </td>
            <td>${entry.wakeUps || '-'}</td>
            <td><span class="indicator ${entry.cutSleep ? 'checked' : 'unchecked'}">${entry.cutSleep ? '✓' : ''}</span></td>
            <td><span class="indicator ${entry.shake ? 'checked' : 'unchecked'}">${entry.shake ? '✓' : ''}</span></td>
            <td><span class="indicator ${entry.seizure ? 'checked' : 'unchecked'}">${entry.seizure ? '✓' : ''}</span></td>
            <td><span class="indicator ${entry.afr ? 'checked' : 'unchecked'}">${entry.afr ? '✓' : ''}</span></td>
            <td>
                <div>${entry.eventsNotes || ''}</div>
                ${renderTags(entry.tags)}
            </td>
            <td>
                ${updateProgressBars(entry).calories}
            </td>
            <td>
                ${updateProgressBars(entry).steps}
            </td>
            <td>${entry.weight || '-'}</td>
            <td>${entry.standing || '-'}</td>
            <td>
                <div class="pill-indicators">
                    <span class="pill ${entry.pill1 ? 'taken' : ''}"></span>
                    <span class="pill ${entry.pill2 ? 'taken' : ''}"></span>
                    <span class="pill ${entry.pill3 ? 'taken' : ''}"></span>
                </div>
            </td>
            <td>
                <button class="action-btn edit-btn" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        // Add row to table
        elements.sleepDataBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            openModal(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            deleteEntry(id);
        });
    });
    
    // Update pagination button states
    elements.prevPageBtn.disabled = currentPage === 1;
    elements.nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Format tags into HTML
function renderTags(tags) {
    if (!tags || !tags.length) return '';
    
    return `
        <div class="tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;
}

// Calculate sleep phase percentage
function calculatePercentage(phaseHours, phaseMinutes, totalHours, totalMinutes) {
    // Convert to minutes
    const phaseInMinutes = (phaseHours || 0) * 60 + (phaseMinutes || 0);
    const totalInMinutes = (totalHours || 0) * 60 + (totalMinutes || 0);
    
    // Calculate percentage
    if (totalInMinutes === 0) return 0;
    return Math.round((phaseInMinutes / totalInMinutes) * 100);
}

// Format date as DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Format duration as "Xh Ym"
function formatDuration(hours, minutes) {
    if ((hours === undefined || hours === null) && (minutes === undefined || minutes === null)) {
        return '';
    }
    
    const h = hours || 0;
    const m = minutes || 0;
    
    if (h === 0 && m === 0) return '0h 0m';
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    
    return `${h}h ${m}m`;
}

// Get CSS class based on sleep score
function getSleepScoreClass(score) {
    if (!score) return '';
    
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
}

// Update statistics based on current data
function updateStatistics() {
    // Calculate average sleep score
    const scores = sleepData.filter(entry => entry.sleepScore).map(entry => entry.sleepScore);
    const avgScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    elements.avgSleepScore.textContent = avgScore;
    
    // Calculate average sleep duration
    const totalMinutes = sleepData
        .filter(entry => entry.nightSleepHours !== undefined || entry.nightSleepMinutes !== undefined)
        .reduce((sum, entry) => {
            const hours = entry.nightSleepHours || 0;
            const minutes = entry.nightSleepMinutes || 0;
            return sum + (hours * 60 + minutes);
        }, 0);
    
    const entriesWithDuration = sleepData.filter(entry => 
        entry.nightSleepHours !== undefined || entry.nightSleepMinutes !== undefined
    ).length;
    
    if (entriesWithDuration > 0) {
        const avgMinutes = Math.round(totalMinutes / entriesWithDuration);
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = avgMinutes % 60;
        elements.avgSleepDuration.textContent = `${avgHours}h ${avgMins}m`;
    } else {
        elements.avgSleepDuration.textContent = '0h 0m';
    }
    
    // Calculate average steps
    const steps = sleepData.filter(entry => entry.steps).map(entry => entry.steps);
    const avgSteps = steps.length ? Math.round(steps.reduce((sum, step) => sum + step, 0) / steps.length) : 0;
    elements.avgSteps.textContent = avgSteps.toLocaleString();
    
    // Get most recent weight
    const entriesWithWeight = sleepData.filter(entry => entry.weight);
    if (entriesWithWeight.length) {
        // Sort by date and get the most recent
        const sortedByDate = [...entriesWithWeight].sort((a, b) => new Date(b.date) - new Date(a.date));
        elements.recentWeight.textContent = sortedByDate[0].weight;
    } else {
        elements.recentWeight.textContent = 'N/A';
    }
}

// Open modal for adding or editing an entry
function openModal(entryId) {
    // Reset form initially
    elements.entryForm.reset();
    
    if (entryId) {
        // Editing existing entry
        elements.modalTitle.textContent = 'Edit Entry';
        
        // Find entry by ID
        const entry = sleepData.find(item => item.id === entryId);
        
        if (entry) {
            // Populate form with entry data
            elements.entryId.value = entry.id;
            elements.entryDate.value = entry.date;
            elements.sleepScore.value = entry.sleepScore || '';
            
            // Night sleep
            elements.nightSleepHours.value = entry.nightSleepHours || '';
            elements.nightSleepMinutes.value = entry.nightSleepMinutes || '';
            
            // Day nap
            elements.dayNapHours.value = entry.dayNapHours || '';
            elements.dayNapMinutes.value = entry.dayNapMinutes || '';
            
            // Sleep phases
            elements.deepSleepHours.value = entry.deepSleepHours || '';
            elements.deepSleepMinutes.value = entry.deepSleepMinutes || '';
            elements.lightSleepHours.value = entry.lightSleepHours || '';
            elements.lightSleepMinutes.value = entry.lightSleepMinutes || '';
            elements.remSleepHours.value = entry.remSleepHours || '';
            elements.remSleepMinutes.value = entry.remSleepMinutes || '';
            
            // Other fields
            elements.wakeUps.value = entry.wakeUps || '';
            elements.cutSleep.checked = entry.cutSleep || false;
            elements.shake.checked = entry.shake || false;
            elements.seizure.checked = entry.seizure || false;
            elements.afr.checked = entry.afr || false;
            elements.eventsNotes.value = entry.eventsNotes || '';
            elements.tags.value = entry.tags ? entry.tags.join(', ') : '';
            elements.calories.value = entry.calories || '';
            elements.steps.value = entry.steps || '';
            elements.weight.value = entry.weight || '';
            elements.standing.value = entry.standing || '';
            elements.pill1.checked = entry.pill1 || false;
            elements.pill2.checked = entry.pill2 || false;
            elements.pill3.checked = entry.pill3 || false;
        }
    } else {
        // Adding new entry
        elements.modalTitle.textContent = 'Add New Entry';
        elements.entryId.value = '';
        
        // Set default date to today
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        elements.entryDate.value = `${year}-${month}-${day}`;
    }
    
    // Show modal
    elements.modal.style.display = 'block';
}

// Close the modal
function closeModal() {
    elements.modal.style.display = 'none';
}

// Save entry from form
function saveEntry() {
    // Get form data
    const entryId = elements.entryId.value;
    const entryData = {
        id: entryId || generateId(),
        date: elements.entryDate.value,
        sleepScore: elements.sleepScore.value ? parseInt(elements.sleepScore.value) : null,
        
        // Night sleep
        nightSleepHours: elements.nightSleepHours.value ? parseInt(elements.nightSleepHours.value) : null,
        nightSleepMinutes: elements.nightSleepMinutes.value ? parseInt(elements.nightSleepMinutes.value) : null,
        
        // Day nap
        dayNapHours: elements.dayNapHours.value ? parseInt(elements.dayNapHours.value) : null,
        dayNapMinutes: elements.dayNapMinutes.value ? parseInt(elements.dayNapMinutes.value) : null,
        
        // Sleep phases
        deepSleepHours: elements.deepSleepHours.value ? parseInt(elements.deepSleepHours.value) : null,
        deepSleepMinutes: elements.deepSleepMinutes.value ? parseInt(elements.deepSleepMinutes.value) : null,
        lightSleepHours: elements.lightSleepHours.value ? parseInt(elements.lightSleepHours.value) : null,
        lightSleepMinutes: elements.lightSleepMinutes.value ? parseInt(elements.lightSleepMinutes.value) : null,
        remSleepHours: elements.remSleepHours.value ? parseInt(elements.remSleepHours.value) : null,
        remSleepMinutes: elements.remSleepMinutes.value ? parseInt(elements.remSleepMinutes.value) : null,
        
        // Other fields
        wakeUps: elements.wakeUps.value ? parseInt(elements.wakeUps.value) : null,
        cutSleep: elements.cutSleep.checked,
        shake: elements.shake.checked,
        seizure: elements.seizure.checked,
        afr: elements.afr.checked,
        eventsNotes: elements.eventsNotes.value,
        tags: elements.tags.value ? elements.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        calories: elements.calories.value ? parseInt(elements.calories.value) : null,
        steps: elements.steps.value ? parseInt(elements.steps.value) : null,
        weight: elements.weight.value ? parseFloat(elements.weight.value) : null,
        standing: elements.standing.value ? parseInt(elements.standing.value) : null,
        pill1: elements.pill1.checked,
        pill2: elements.pill2.checked,
        pill3: elements.pill3.checked
    };
    
    if (entryId) {
        // Update existing entry
        const index = sleepData.findIndex(item => item.id === entryId);
        if (index !== -1) {
            sleepData[index] = entryData;
        }
    } else {
        // Add new entry
        sleepData.unshift(entryData);
    }
    
    // Sort data by date (newest first)
    sleepData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to localStorage
    saveData();
    
    // Close modal
    closeModal();
    
    // Update table and statistics
    renderTable();
    updateStatistics();
}

// Delete an entry
function deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        // Remove entry from array
        sleepData = sleepData.filter(item => item.id !== entryId);
        
        // Save to localStorage
        saveData();
        
        // Update table and statistics
        renderTable();
        updateStatistics();
    }
}

// Generate a unique ID for new entries
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Get sample data for initial demonstration
function getSampleData() {
    return [
        {
            id: 'sample1',
            date: '2025-03-18',
            sleepScore: 67,
            nightSleepHours: 6,
            nightSleepMinutes: 32,
            dayNapHours: null,
            dayNapMinutes: null,
            deepSleepHours: 1,
            deepSleepMinutes: 57,
            lightSleepHours: 3,
            lightSleepMinutes: 49,
            remSleepHours: 0,
            remSleepMinutes: 46,
            wakeUps: 1,
            cutSleep: false,
            shake: false,
            seizure: false,
            afr: false,
            eventsNotes: 'Finish messaging',
            tags: [],
            calories: 362,
            steps: 678,
            weight: null,
            standing: 9,
            pill1: true,
            pill2: true,
            pill3: true
        },
        {
            id: 'sample2',
            date: '2025-03-17',
            sleepScore: 51,
            nightSleepHours: 7,
            nightSleepMinutes: 34,
            dayNapHours: null,
            dayNapMinutes: null,
            deepSleepHours: 2,
            deepSleepMinutes: 7,
            lightSleepHours: 4,
            lightSleepMinutes: 16,
            remSleepHours: 1,
            remSleepMinutes: 11,
            wakeUps: 4,
            cutSleep: true,
            shake: false,
            seizure: false,
            afr: false,
            eventsNotes: 'Afro leaves',
            tags: [],
            calories: 412,
            steps: 2034,
            weight: 77,
            standing: 13,
            pill1: true,
            pill2: true,
            pill3: true
        },
        {
            id: 'sample3',
            date: '2025-03-16',
            sleepScore: 58,
            nightSleepHours: 8,
            nightSleepMinutes: 54,
            dayNapHours: null,
            dayNapMinutes: null,
            deepSleepHours: 2,
            deepSleepMinutes: 29,
            lightSleepHours: 5,
            lightSleepMinutes: 14,
            remSleepHours: 1,
            remSleepMinutes: 11,
            wakeUps: 4,
            cutSleep: true,
            shake: true,
            seizure: false,
            afr: true,
            eventsNotes: 'F1 AUSTRALIA GP LN Wins',
            tags: ['F1'],
            calories: 610,
            steps: 1581,
            weight: null,
            standing: 12,
            pill1: true,
            pill2: true,
            pill3: true
        }
    ];
}
// Settings-related DOM elements
const settingsElements = {
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    settingsForm: document.getElementById('settings-form'),
    referenceDate: document.getElementById('reference-date'),
    caloriesGoal: document.getElementById('calories-goal'),
    stepsGoal: document.getElementById('steps-goal'),
    newTagInput: document.getElementById('new-tag'),
    addTagBtn: document.getElementById('add-tag-btn'),
    tagsList: document.getElementById('tags-list'),
    themeSelector: document.getElementById('theme-selector'),
    colorOptions: document.querySelectorAll('.color-option'),
    settingsCancelBtn: document.getElementById('settings-cancel-btn'),
    settingsSaveBtn: document.getElementById('settings-save-btn')
};

// Settings state
let settings = {
    referenceDate: BASE_DATE.toISOString().split('T')[0],
    caloriesGoal: 2000,
    stepsGoal: 10000,
    theme: 'light',
    accentColor: 'blue'
};

// Initialize settings
function initializeSettings() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('sleepTrackerSettings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }

    // Apply settings
    applySettings();
    
    // Set up settings event listeners
    setupSettingsEventListeners();
}

// Set up settings-related event listeners
function setupSettingsEventListeners() {
    // Open settings modal
    settingsElements.settingsBtn.addEventListener('click', openSettingsModal);
    
    // Close settings modal
    settingsElements.settingsCancelBtn.addEventListener('click', closeSettingsModal);
    
    // Add new tag
    settingsElements.addTagBtn.addEventListener('click', addNewTag);
    
    // Save settings
    settingsElements.settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });
    
    // Theme selection
    settingsElements.themeSelector.addEventListener('change', (e) => {
        settings.theme = e.target.value;
        applyTheme();
    });
    
    // Accent color selection
    settingsElements.colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.dataset.color;
            settings.accentColor = color;
            applyAccentColor();
            
            // Update selected state
            settingsElements.colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

// Open settings modal
function openSettingsModal() {
    // Populate form with current settings
    settingsElements.referenceDate.value = settings.referenceDate;
    settingsElements.caloriesGoal.value = settings.caloriesGoal;
    settingsElements.stepsGoal.value = settings.stepsGoal;
    settingsElements.themeSelector.value = settings.theme;
    
    // Display current tags
    renderTagsList();
    
    // Show modal
    settingsElements.settingsModal.style.display = 'block';
}

// Close settings modal
function closeSettingsModal() {
    settingsElements.settingsModal.style.display = 'none';
}

// Save settings
function saveSettings() {
    // Update settings object
    settings.referenceDate = settingsElements.referenceDate.value;
    settings.caloriesGoal = parseInt(settingsElements.caloriesGoal.value);
    settings.stepsGoal = parseInt(settingsElements.stepsGoal.value);
    
    // Save to localStorage
    localStorage.setItem('sleepTrackerSettings', JSON.stringify(settings));
    
    // Apply settings
    applySettings();
    
    // Close modal
    closeSettingsModal();
    
    // Update display
    updateCurrentDate();
    renderTable();
}

// Apply all settings
function applySettings() {
    applyTheme();
    applyAccentColor();
}

// Apply theme
function applyTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (settings.theme === 'dark' || (settings.theme === 'auto' && prefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
    }
}

// Add system theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (settings.theme === 'auto') {
        applyTheme();
    }
});

// Apply accent color
function applyAccentColor() {
    const root = document.documentElement;
    const color = settings.accentColor;
    
    root.style.setProperty('--accent-primary', `var(--${color}-primary)`);
    root.style.setProperty('--accent-secondary', `var(--${color}-secondary)`);
    root.style.setProperty('--accent-light', `var(--${color}-light)`);
}

// Render tags list in settings
function renderTagsList() {
    const allTags = new Set();
    sleepData.forEach(entry => {
        if (entry.tags && entry.tags.length) {
            entry.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    settingsElements.tagsList.innerHTML = Array.from(allTags)
        .sort()
        .map(tag => `
            <div class="tag-item">
                <span class="tag">${tag}</span>
                <button type="button" class="delete-tag-btn" data-tag="${tag}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    
    // Add delete event listeners
    document.querySelectorAll('.delete-tag-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTag(btn.dataset.tag));
    });
}

// Add new tag
function addNewTag() {
    const newTag = settingsElements.newTagInput.value.trim();
    if (!newTag) return;
    
    // Add tag to an existing entry to ensure it's saved
    if (sleepData.length > 0) {
        const firstEntry = sleepData[0];
        firstEntry.tags = [...new Set([...(firstEntry.tags || []), newTag])];
        saveData();
    }
    
    // Clear input and refresh tags list
    settingsElements.newTagInput.value = '';
    renderTagsList();
}

// Delete tag
function deleteTag(tagToDelete) {
    if (!confirm(`Are you sure you want to delete the tag "${tagToDelete}"?`)) return;
    
    // Remove tag from all entries
    sleepData.forEach(entry => {
        if (entry.tags) {
            entry.tags = entry.tags.filter(tag => tag !== tagToDelete);
        }
    });
    
    // Save data and refresh display
    saveData();
    renderTagsList();
    renderTable();
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...
    initializeSettings();
});
// Dashboard-related DOM elements
const dashboardElements = {
    dashboardBtn: document.getElementById('dashboard-btn'),
    dashboardModal: document.getElementById('dashboard-modal'),
    dashboardCloseBtn: document.getElementById('dashboard-close-btn'),
    rangeBtns: document.querySelectorAll('.range-btn'),
    chartMetric: document.getElementById('chart-metric'),
    exportBtn: document.getElementById('export-btn')
};

// Setup dashboard event listeners
function setupDashboardEventListeners() {
    // Open dashboard modal
    dashboardElements.dashboardBtn.addEventListener('click', openDashboardModal);
    
    // Close dashboard modal
    dashboardElements.dashboardCloseBtn.addEventListener('click', closeDashboardModal);
    dashboardElements.dashboardModal.querySelector('.close-btn').addEventListener('click', closeDashboardModal);
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === dashboardElements.dashboardModal) {
            closeDashboardModal();
        }
    });
}

// Open dashboard modal
function openDashboardModal() {
    dashboardElements.dashboardModal.style.display = 'block';
    // Add additional dashboard initialization logic here
}

// Close dashboard modal
function closeDashboardModal() {
    dashboardElements.dashboardModal.style.display = 'none';
}

// Add to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...
    setupDashboardEventListeners();
});

// Update progress bars based on goals
function updateProgressBars(entry) {
    const caloriesPercent = Math.min((entry.calories / settings.caloriesGoal) * 100, 100);
    const stepsPercent = Math.min((entry.steps / settings.stepsGoal) * 100, 100);
    
    return {
        calories: entry.calories ? `
            <div>${entry.calories} / ${settings.caloriesGoal}</div>
            <div class="progress-container">
                <div class="progress-bar progress-calories" style="width: ${caloriesPercent}%"></div>
            </div>
        ` : '-',
        steps: entry.steps ? `
            <div>${entry.steps} / ${settings.stepsGoal}</div>
            <div class="progress-container">
                <div class="progress-bar progress-steps" style="width: ${stepsPercent}%"></div>
            </div>
        ` : '-'
    };
}