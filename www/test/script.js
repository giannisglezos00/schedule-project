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
}