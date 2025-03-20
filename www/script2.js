// Sleep Tracker Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');

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

    // [Previous setupEventListeners, updateDateDisplay, etc. functions remain the same]

    // Include all the functions from the previous script here
    // (renderEntries, filterEntries, showAddEntryModal, saveEntry, etc.)

    function showAddEntryModal(date = null) {
        // Clear form
        elements.entryForm.reset();
        elements.entryId.value = '';
        
        // Set date to today if not provided
        let targetDate;
        if (date) {
            // Handle different input types
            if (date instanceof Date) {
                targetDate = date;
            } else if (typeof date === 'string') {
                // Try parsing the string date
                targetDate = new Date(date);
            } else {
                // Fallback to today's date
                targetDate = new Date();
            }
        } else {
            targetDate = new Date();
        }
        
        // Ensure valid date
        if (isNaN(targetDate.getTime())) {
            targetDate = new Date();
        }
        
        // Format date for input (YYYY-MM-DD)
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        
        elements.entryDate.value = `${year}-${month}-${day}`;
        
        // Show modal
        elements.entryModal.style.display = 'block';
        document.getElementById('modal-title').textContent = 'Add New Entry';
    }

    // Export functionality
    function exportData() {
        try {
            // Convert entries to CSV
            const headers = [
                'Date', 'Sleep Score', 'Night Sleep', 'Day Nap', 
                'Deep Sleep', 'Light Sleep', 'REM Sleep', 'Wake Ups', 
                'Cut Sleep', 'Shake', 'Seizure', 'Afro', 
                'Events/Notes', 'Tags', 'Calories', 'Steps', 
                'Weight', 'Standing', 'Pills'
            ];

            const csvRows = [
                headers.join(','),
                ...state.entries.map(entry => [
                    entry.date,
                    entry.sleepScore || '',
                    formatTime(entry.nightSleep),
                    formatTime(entry.dayNap),
                    formatTime(entry.deepSleep),
                    formatTime(entry.lightSleep),
                    formatTime(entry.remSleep),
                    entry.wakeUps || '',
                    entry.cutSleep ? 'Yes' : 'No',
                    entry.shake ? 'Yes' : 'No',
                    entry.seizure ? 'Yes' : 'No',
                    entry.afr ? 'Yes' : 'No',
                    `"${entry.eventsNotes || ''}"`,
                    `"${(entry.tags || []).join('; ')}"`,
                    entry.calories || '',
                    entry.steps || '',
                    entry.weight || '',
                    entry.standing || '',
                    `"${(entry.pills || []).join('; ')}"`,
                ].map(field => field.toString().replace(/"/g, '""')).join(','))
            ];

            const csvString = csvRows.join('\n');
            
            // Create a Blob with the CSV data
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            
            // Create a link element to trigger download
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `sleep_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            alert('Data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    // Import functionality
    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Use Papa Parse for robust CSV parsing
                Papa.parse(e.target.result, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        // Validate import
                        if (!results.data || results.data.length === 0) {
                            throw new Error('No data found in the file');
                        }

                        // Confirm import
                        const confirmImport = confirm(`Found ${results.data.length} entries. Do you want to import them? This will replace existing data.`);
                        
                        if (confirmImport) {
                            // Transform imported data to match internal structure
                            const importedEntries = results.data.map(entry => ({
                                id: entry.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                                date: entry.Date || entry.date,
                                sleepScore: entry['Sleep Score'] || entry.sleepScore,
                                nightSleep: parseTimeObject(entry['Night Sleep'] || entry.nightSleep),
                                dayNap: parseTimeObject(entry['Day Nap'] || entry.dayNap),
                                deepSleep: parseTimeObject(entry['Deep Sleep'] || entry.deepSleep),
                                lightSleep: parseTimeObject(entry['Light Sleep'] || entry.lightSleep),
                                remSleep: parseTimeObject(entry['REM Sleep'] || entry.remSleep),
                                wakeUps: entry['Wake Ups'] || entry.wakeUps,
                                cutSleep: entry['Cut Sleep'] === 'Yes' || entry.cutSleep === true,
                                shake: entry.Shake === 'Yes' || entry.shake === true,
                                seizure: entry.Seizure === 'Yes' || entry.seizure === true,
                                afr: entry.Afro === 'Yes' || entry.afr === true,
                                eventsNotes: entry['Events/Notes'] || entry.eventsNotes,
                                tags: parseList(entry.Tags || entry.tags),
                                calories: entry.Calories || entry.calories,
                                steps: entry.Steps || entry.steps,
                                weight: entry.Weight || entry.weight,
                                standing: entry.Standing || entry.standing,
                                pills: parseList(entry.Pills || entry.pills)
                            }));

                            // Update state and save
                            state.entries = importedEntries;
                            saveData();

                            // Refresh UI
                            renderEntries();
                            updateTodayInfo();
                            updateStatistics();

                            alert(`Successfully imported ${importedEntries.length} entries!`);
                        }
                    },
                    error: function(error) {
                        console.error('CSV parsing error:', error);
                        alert('Failed to parse the CSV file. Please check the file format.');
                    }
                });
            } catch (error) {
                console.error('Import failed:', error);
                alert('Failed to import data. Please try again.');
            }
        };

        reader.readAsText(file);
    }

    // Helper function to parse time strings or objects
    function parseTimeObject(timeInput) {
        // If already an object with hours and minutes, return it
        if (timeInput && typeof timeInput === 'object' && 
            (timeInput.hours !== undefined || timeInput.minutes !== undefined)) {
            return {
                hours: parseInt(timeInput.hours) || 0,
                minutes: parseInt(timeInput.minutes) || 0
            };
        }

        // If string input (like "2h 30m")
        if (typeof timeInput === 'string') {
            const match = timeInput.match(/(\d+)h\s*(\d+)m/);
            if (match) {
                return {
                    hours: parseInt(match[1]) || 0,
                    minutes: parseInt(match[2]) || 0
                };
            }
        }

        // Default to zero if no valid input
        return { hours: 0, minutes: 0 };
    }

    // Helper function to parse comma or semicolon separated lists
    function parseList(input) {
        if (Array.isArray(input)) return input;
        
        if (typeof input === 'string') {
            // Split by comma or semicolon, trim whitespace
            return input.split(/[,;]/).map(item => item.trim()).filter(item => item);
        }
        
        return [];
    }

    // Backup functionality
    function createBackup() {
        const backupData = {
            entries: state.entries,
            tags: state.tags,
            settings: state.settings,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sleep_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('Backup created successfully!');
    }

    // Restore backup functionality
    function restoreBackup(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);

                // Validate backup
                if (!backupData.entries || !backupData.tags || !backupData.settings) {
                    throw new Error('Invalid backup file');
                }

                const confirmRestore = confirm('Are you sure you want to restore this backup? This will replace all existing data.');
                
                if (confirmRestore) {
                    // Restore data
                    state.entries = backupData.entries,
                    state.tags = backupData.tags,
                    state.settings = backupData.settings;

                    // Save and update UI
                    saveData();
                    renderEntries();
                    updateTodayInfo();
                    updateStatistics();
                    showSettingsModal(); // Refresh settings display

                    alert(`Backup from ${backupData.timestamp} restored successfully!`);
                }
            } catch (error) {
                console.error('Restore failed:', error);
                alert('Failed to restore backup. Please check the file format.');
            }
        };

        reader.readAsText(file);
    }

    // Error logging mechanism
    function logError(error, context = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context: context
        };

        // Store in localStorage
        const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        errorLogs.push(errorLog);
        
        // Limit to last 50 errors
        if (errorLogs.length > 50) {
            errorLogs.shift();
        }

        localStorage.setItem('errorLogs', JSON.stringify(errorLogs));

        // Optional: Send error to console
        console.error('Logged Error:', errorLog);
    }

    // Advanced Event Listeners and Setup
    function setupEventListeners() {
        // Existing event listeners from previous implementation
        
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
        
        // Create hidden file input for import/export
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.csv,.json';
        importInput.style.display = 'none';
        importInput.addEventListener('change', function(event) {
            const fileType = event.target.files[0].name.split('.').pop().toLowerCase();
            if (fileType === 'csv') {
                importData(event);
            } else if (fileType === 'json') {
                restoreBackup(event);
            }
        });
        document.body.appendChild(importInput);

        // Export button in dashboard
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportData);
        }

        // Backup and restore buttons in settings
        const backupBtn = document.createElement('button');
        backupBtn.textContent = 'Create Backup';
        backupBtn.classList.add('secondary-btn');
        backupBtn.addEventListener('click', createBackup);

        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = 'Restore Backup';
        restoreBtn.classList.add('secondary-btn');
        restoreBtn.addEventListener('click', () => {
            importInput.click();
        });

        // Add these buttons to the settings modal
        const settingsFormActions = document.querySelector('#settings-form .form-actions');
        if (settingsFormActions) {
            settingsFormActions.insertBefore(backupBtn, settingsFormActions.firstChild);
            settingsFormActions.insertBefore(restoreBtn, settingsFormActions.firstChild);
        }

        // Global error handling
        window.addEventListener('error', function(event) {
            logError(event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Optional: Add method to view error logs
        function viewErrorLogs() {
            const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            const logContainer = document.createElement('div');
            logContainer.style.maxHeight = '400px';
            logContainer.style.overflowY = 'auto';

            if (logs.length === 0) {
                logContainer.innerHTML = '<p>No error logs found.</p>';
            } else {
                const logTable = document.createElement('table');
                logTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td>${log.timestamp}</td>
                                <td>${log.message}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                logContainer.appendChild(logTable);
            }

            // Create modal to display logs
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h2>Error Logs</h2>
                </div>
            `;
            
            const modalContent = modal.querySelector('.modal-content');
            modalContent.appendChild(logContainer);

            // Add close functionality
            const closeBtn = modal.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            document.body.appendChild(modal);
            modal.style.display = 'block';
        }

        // Add error logs view button in settings
        const settingsLogsBtn = document.createElement('button');
        settingsLogsBtn.textContent = 'View Error Logs';
        settingsLogsBtn.type = 'button';
        settingsLogsBtn.classList.add('secondary-btn');
        settingsLogsBtn.addEventListener('click', viewErrorLogs);
        
        if (settingsFormActions) {
            settingsFormActions.appendChild(settingsLogsBtn);
        }
    }

    // Theme application
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

    // Utility functions for common tasks
    function formatTime(timeObj) {
        if (!timeObj || (!timeObj.hours && !timeObj.minutes)) return '';
        const hours = timeObj.hours || 0;
        const minutes = timeObj.minutes || 0;
        return `${hours}h ${minutes}m`;
    }

    function formatSleepDuration(duration) {
        return `${duration.hours}h ${duration.minutes}m`;
    }

    // Export some functions for potential external use
    window.sleepTracker = {
        exportData,
        importData,
        createBackup,
        restoreBackup,
        logError
    };

    // Run initialization
    init();
});