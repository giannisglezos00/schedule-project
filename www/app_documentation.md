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
- Mark special health conditions (cut sleep, seizure, shake, afrodite)
- Track activity metrics (calories, steps, standing hours)
- Record weight

### Task Management
- Add and manage daily tasks
- Mark tasks as completed
- Associate tasks with specific dates
- View tasks in the sidebar for quick access

### Tag System
- Create and manage custom tags with color coding
- Filter entries by tags
- Visualize tag distribution
- Add tags directly from the entry form or settings

### Data Visualization
- Weekly/monthly statistics
- Sleep quality trends
- Sleep composition breakdown
- Activity metrics comparison
- Health events timeline

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
- `saveSettings()`: Saves user settings and preferences
- `showEntryPreview()`: Displays detailed view of an entry

### Task Management
- `addTask()`: Adds a new task
- `renderTasksList()`: Displays tasks in the modal
- `showAddTaskModal()`: Opens modal to add standalone tasks

### Tag Management
- `addNewTag()`: Creates a new tag with custom color
- `renderTagsList()`: Displays tags in the available tags container
- `renderTagsManagement()`: Displays tags in the settings modal
- `deleteTag()`: Removes a tag
- `updateTagFilter()`: Updates tag filter dropdown options

### Display Functions
- `renderEntries()`: Renders the entries table
- `updateMonthDisplay()`: Updates the month display in header
- `updateDateDisplay()`: Updates the date display and days count
- `updateTodayInfo()`: Updates today's tasks and tags in sidebar
- `updateStatistics()`: Updates weekly statistics
- `formatDate()`: Formats date objects consistently
- `highlightSearchTerms()`: Highlights search matches in the table

### Navigation
- `navigateToPreviousMonth()`: Shows previous month data
- `navigateToNextMonth()`: Shows next month data

### Filtering and Sorting
- `filterEntries()`: Filters entries based on search and tag selection
- `sortEntries()`: Sorts entries based on chosen criteria (date, sleep time, calories, steps, tags)

### Data Analysis
- `updateDashboardCharts()`: Updates charts in the dashboard
- `updateSleepInsights()`: Generates insights from sleep data
- `detectConflicts()`: Identifies conflicts in the data
- `resolveEntryDuplicates()`: Resolves duplicate entries
- `resolveAllConflicts()`: Handles all detected data conflicts
- `showConflictsNotification()`: Displays notification about data conflicts

### Utility Functions
- `getLuminance()`: Calculates color luminance for contrast
- `setupTagColorPresets()`: Sets up color preset selection for tags
- `setupAddTagQuickButton()`: Configures quick tag addition from sidebar

## Settings
- Reference date for day counting
- Daily calorie and step goals
- Sleep quality thresholds:
  - Total sleep duration (red, yellow, dark green levels)
  - Deep sleep minimum thresholds
  - Light sleep ideal range
  - REM sleep thresholds
- Theme preferences (light/dark/auto)
- Accent color selection (blue, purple, teal, orange, pink)

## Data Storage
The application uses browser localStorage to persist user data between sessions with `saveData()` and `loadData()` functions managing data serialization.

## Theme System
- Supports light and dark mode
- Custom accent colors (blue, purple, teal, orange, pink)
- Automatic theme based on system preference
- Dynamic color contrast handling for readability

## User Interface
The application features a clean, modern UI with:
- Interactive data table with sortable columns
- Visual indicators for sleep quality
- Color-coded tags and health indicators
- Modal-based forms for data entry
- Date navigation and filtering controls
- Dashboard with visualization charts

## Design Considerations
The application is optimized for desktop use with:
- Fixed-width columns for readability
- Hover effects for better interaction
- Visual grouping of related data
- Persistent header for navigation
- Color-coding for quick data interpretation 