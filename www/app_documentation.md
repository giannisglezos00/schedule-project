# Sleep Tracker Application Documentation

## Overview
The Sleep Tracker is a web application designed to help users track and analyze their sleep patterns, health metrics, and daily activities. It provides a comprehensive dashboard with statistics, visualizations, and insights about sleep quality and duration.

## File Structure
- `index.html` - Main HTML structure of the application
- `style.css` - Styling and theme definitions
- `script.js` - Application logic and functionality
- `favicon.ico` - Website icon

## Core Components

### Main Layout
- **Left Sidebar**: Displays the current date, days since reference date, today's tasks, and today's tags
- **Main Content Area**: Contains weekly statistics, monthly sleep data table, and filtering controls

### Modals
1. **Entry Modal**: For adding/editing sleep entries
2. **Settings Modal**: For configuring application preferences
3. **Dashboard Modal**: For viewing sleep analytics and charts
4. **Entry Preview Modal**: For viewing details of a specific entry

## Key Features

### Sleep Tracking
- Record daily sleep metrics (total sleep, deep sleep, light sleep, REM sleep)
- Track sleep quality score
- Log daytime naps
- Note wake-ups during sleep

### Health Indicators
- Mark special health conditions (cut sleep, seizure, etc.)
- Track activity metrics (calories, steps, standing hours)
- Record weight

### Task Management
- Add and manage daily tasks
- Mark tasks as completed
- Associate tasks with specific dates

### Tag System
- Create and manage custom tags with color coding
- Filter entries by tags
- Visualize tag distribution

### Data Visualization
- Weekly/monthly statistics
- Sleep quality trends
- Sleep composition breakdown
- Activity metrics comparison

## State Management
The application uses a global `state` object that contains:
- `entries`: Array of all sleep entries
- `currentMonth`: The month being displayed in the table
- `settings`: User preferences and thresholds
- `tags`: Available tags for entries
- `tasks`: Tasks organized by date
- `currentTasks`: Tasks for the entry being edited

## Main Functions

### Initialization
- `loadData()`: Loads data from localStorage
- `validateElements()`: Ensures all DOM elements are available
- `setupEventListeners()`: Sets up interactive elements
- `initializeModals()`: Configures modal behaviors

### Entry Management
- `showAddEntryModal()`: Opens modal to add a new entry
- `showEditEntryModal()`: Opens modal to edit an existing entry
- `saveEntry()`: Saves entry data from the form
- `deleteEntry()`: Removes an entry

### Task Management
- `addTask()`: Adds a new task
- `renderTasksList()`: Displays tasks in the modal

### Tag Management
- `addNewTag()`: Creates a new tag
- `renderTagsList()`: Displays tags in the available tags container
- `renderTagsManagement()`: Displays tags in the settings modal
- `deleteTag()`: Removes a tag

### Display Functions
- `renderEntries()`: Renders the entries table
- `updateMonthDisplay()`: Updates the month display in header
- `updateDateDisplay()`: Updates the date display
- `updateTodayInfo()`: Updates today's tasks and tags
- `updateStatistics()`: Updates weekly statistics

### Navigation
- `navigateToPreviousMonth()`: Shows previous month data
- `navigateToNextMonth()`: Shows next month data

### Filtering and Sorting
- `filterEntries()`: Filters entries based on search and tag selection
- `sortEntries()`: Sorts entries based on chosen criteria

### Data Analysis
- `updateDashboardCharts()`: Updates charts in the dashboard
- `updateSleepInsights()`: Generates insights from sleep data
- `detectConflicts()`: Identifies conflicts in the data
- `resolveEntryDuplicates()`: Resolves duplicate entries

## Settings
- Reference date for day counting
- Daily calorie and step goals
- Sleep quality thresholds
- Deep sleep minimum
- Light sleep ideal range
- Theme and accent color

## Data Storage
The application uses browser localStorage to persist user data between sessions.

## Theme System
- Supports light and dark mode
- Custom accent colors (blue, purple, teal, orange, pink)
- Automatic theme based on system preference

## Responsive Design
The application is designed for desktop use, featuring a clean and modern UI optimized for larger screens. 