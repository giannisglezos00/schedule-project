# Sleep Tracker Application Documentation

## Overview
The Sleep Tracker application is a comprehensive tool for tracking sleep patterns, daily activities, and health metrics. This documentation provides guidelines for maintaining and extending the application with a focus on modern design principles.

## Style Guide

### Design System

#### Color System
- **Primary Colors**:
  - Primary: #6366f1 (Indigo)
  - Primary Dark: #4f46e5
  - Primary Light: #a5b4fc
- **Background Colors**:
  - Main Background: #ffffff (Light) / #111827 (Dark)
  - Card Background: #f9fafb (Light) / #1f2937 (Dark)
  - Sidebar Background: #f3f4f6 (Light) / #1f2937 (Dark)
- **Text Colors**:
  - Primary Text: #111827 (Light) / #f9fafb (Dark)
  - Secondary Text: #4b5563 (Light) / #e5e7eb (Dark)
  - Muted Text: #6b7280 (Light) / #d1d5db (Dark)
- **Border Colors**:
  - Light Border: #e5e7eb (Light) / #374151 (Dark)
  - Medium Border: #d1d5db (Light) / #4b5563 (Dark)
- **Status Colors**:
  - Error: #ef4444
  - Warning: #f59e0b
  - Success: #10b981
  - Info: #3b82f6

#### Typography
- Font Family: 'Inter', sans-serif
- Base Size: 16px (1rem)
- Scale:
  - Small: 0.875rem (14px)
  - Base: 1rem (16px)
  - Medium: 1.125rem (18px)
  - Large: 1.25rem (20px)
  - Extra Large: 1.5rem (24px)
- Weights:
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

#### Spacing
- Scale:
  - xs: 0.25rem (4px)
  - sm: 0.5rem (8px)
  - md: 1rem (16px)
  - lg: 1.5rem (24px)
  - xl: 2rem (32px)
  - 2xl: 3rem (48px)

#### Border Radius
- sm: 0.25rem (4px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)

#### Shadows
- sm: 0 1px 2px rgba(0, 0, 0, 0.05)
- md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)

### Component Guidelines

#### Buttons
1. **Primary Button**
   - Background: var(--primary)
   - Text Color: white
   - Hover: var(--primary-dark)
   - Used for main actions (Save, Add Entry)
   - With shadow on hover and slight y-translation

2. **Secondary Button**
   - Background: var(--bg-card)
   - Text Color: var(--text-primary)
   - Border: 1px solid var(--border-light)
   - Hover: var(--bg-table-row-hover)
   - Used for secondary actions (Cancel, Settings)

3. **Accent Button**
   - Background: var(--primary-light)
   - Text Color: var(--text-primary)
   - Hover: var(--primary) with white text
   - Used for special actions (Add Task)

4. **Warning Button**
   - Background: var(--error)
   - Text Color: white
   - Hover: darker red
   - Used for destructive actions (Delete, Reset)

#### Button Properties
- Padding: 10px 20px
- Border Radius: var(--radius-md)
- Font Size: 0.95rem
- Min Height: 40px
- Min Width: 120px
- Display: inline-flex with centered content
- Gap between icon and text: 8px
- Hover effects: translateY(-1px) + box-shadow

#### Cards
- Background: var(--bg-card)
- Border Radius: var(--radius-md)
- Border: 1px solid transparent (visible on hover)
- Box Shadow: var(--shadow-sm)
- Hover: Box shadow increases to var(--shadow-md) with slight lift
- Padding: var(--space-md)

#### Modals
1. **Structure**
   - Full screen with 40px padding (20px on smaller screens)
   - Modal content max-width: 1200px, centered
   - Border radius: var(--radius-lg)
   - Box shadow: var(--shadow-xl)

2. **Header**
   - Sticky positioned at top
   - Flex layout with space between
   - Border bottom: 1px solid var(--border-light)
   - Title with icon
   - Close button: circular with hover effects

3. **Content**
   - Scrollable with padding
   - Organized in sections
   - Proper spacing between elements

4. **Footer/Actions**
   - Sticky positioned at bottom
   - Flex layout with end justification
   - Border top: 1px solid var(--border-light)
   - Standard button spacing and sizing

#### Form Controls
1. **Text Inputs**
   - Border: 1px solid var(--border-light)
   - Border Radius: var(--radius-md)
   - Padding: var(--space-sm) var(--space-md)
   - Focus: Border color changes to primary with subtle glow

2. **Checkboxes and Radios**
   - Custom styling with accent color
   - Clear hover and checked states

3. **Selects**
   - Consistent with text inputs
   - Custom dropdown indicator

4. **Labels**
   - Clear hierarchy and spacing
   - Font weight: 500
   - Margin bottom: var(--space-xs)

#### Tables
- Clean borders and separators
- Sticky headers
- Hover effects on rows
- Proper cell padding
- Color-coding for status indicators

### Layout Guidelines

1. **Main Layout**
   - Sidebar + Main Content structure
   - Full-height design
   - Sticky header with filters and controls

2. **Sidebar**
   - Fixed width (320px)
   - Sectioned content with clear headings
   - Navigation buttons at bottom

3. **Responsive Behavior**
   - Desktop-optimized but adaptable
   - Stacking elements on smaller screens
   - Adjusted spacing and sizing

### Animation Guidelines
- Transitions: 150ms to 350ms duration
- Subtle scale and translate effects
- Smooth opacity changes
- Consistent easing functions

### Best Practices
1. Always use CSS variables for consistency
2. Follow established component patterns
3. Maintain proper spacing rhythm
4. Ensure adequate color contrast
5. Use transitions for interactive elements
6. Consider hierarchy and visual weight
7. Implement proper focus states for accessibility

## Component Examples

### Button Example
```html
<button class="primary-btn">
  <i class="fas fa-plus"></i> Add Entry
</button>

<button class="secondary-btn">
  <i class="fas fa-times"></i> Cancel
</button>
```

### Card Example
```html
<div class="stat-card">
  <h3>Average Sleep Duration</h3>
  <div class="stat-value">7h 30m</div>
  <div class="stat-icon">
    <i class="fas fa-bed"></i>
  </div>
</div>
```

### Modal Section Example
```html
<div class="modal-section">
  <div class="modal-section-title">
    <i class="fas fa-moon"></i>
    <h3>Sleep Metrics</h3>
  </div>
  <div class="modal-grid">
    <!-- Form controls here -->
  </div>
</div>
```

### Form Group Example
```html
<div class="form-group">
  <label for="sleep-score">Sleep Score</label>
  <div class="input-with-icon">
    <i class="fas fa-star"></i>
    <input type="number" id="sleep-score" min="0" max="100" placeholder="0-100">
  </div>
</div>
```

## Implementation Notes

### CSS Structure
- Variables defined at :root level
- Dark theme overrides via body.dark-theme
- Component-specific styles grouped together
- Responsive adjustments via media queries
- Utility classes for common patterns

### JavaScript Interaction
- Modal handling with proper focus management
- Form validation and submission
- Dynamic content rendering
- Theme switching with proper persistence

### Accessibility Considerations
- Proper focus management
- Adequate color contrast
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly attributes

## Future Enhancement Suggestions

1. **Animation Refinements**
   - Add subtle micro-interactions
   - Improve transition between states

2. **Component Extensions**
   - Multi-step form wizard for complex entries
   - Data visualization improvements
   - Custom dropdown components

3. **Layout Improvements**
   - Collapsible sidebar for more space
   - Dashboard layout customization
   - Split-pane viewing for data comparison

4. **Theming**
   - Additional theme color options
   - User-configurable accent colors
   - High contrast mode for accessibility

5. **Advanced Features**
   - Keyboard shortcuts for power users
   - Advanced filtering and sorting options
   - Data export visualization options

## Technical Documentation

For detailed technical documentation on functions, data structures, and implementation details, please refer to the extended technical documentation section.

## Application Structure
The application is organized into several key components:

### Main Layout
- Left sidebar with navigation and quick actions
- Main content area with statistics and data table
- Responsive design that adapts to screen size

### Data Management
- Local storage for data persistence
- Import/Export functionality
- Data validation and conflict detection

### Theme System
- Light/Dark mode support
- Accent color customization
- Consistent styling across components

## Future Enhancements
1. Implement data backup system
2. Add data visualization improvements
3. Enhance mobile responsiveness
4. Add keyboard shortcuts
5. Implement undo/redo functionality
6. Add data export formats
7. Enhance accessibility features

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
- Click on tasks to view details and associated tags

### Tag System
- Create and manage custom tags with color coding
- Filter entries by tags
- Visualize tag distribution
- Add tags directly from the entry form, sidebar, or settings
- Custom color selection for tags with presets

### Data Visualization
- Weekly/monthly statistics
- Sleep quality trends
- Sleep composition breakdown
- Activity metrics comparison
- Health events timeline

## Application Initialization

The application follows a specific initialization sequence:
1. Script begins with "Sleep Tracker initializing..." message
2. DOM element validation via `validateElements()`
3. Loading data from localStorage using `loadData()`
4. Checking for scheduling conflicts with `detectConflicts()`
5. Rendering entries with `renderEntries()`
6. Setting up event listeners with `setupEventListeners()`
7. Initializing modals with `initializeModals()`

During initialization, the application checks for potential data conflicts such as gaps between entry dates that might indicate missing data. The conflict detection system will output warnings to the console with details about any detected issues.

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
- `detectConflicts()`: Checks for scheduling conflicts and data integrity issues

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
  - Depends on `createCell()` helper function to generate table cells
  - Depends on `getScoreColor()` to determine appropriate coloring for sleep scores
  - Depends on `formatTimeCompact()` to format sleep time values in table cells
  - Depends on `getSleepColor()` to determine appropriate coloring for sleep duration values
  - Depends on `getDeepSleepColor()` to determine appropriate coloring for deep sleep values
- `updateMonthDisplay()`: Updates the month display in header
- `updateDateDisplay()`: Updates the date display and days count in sidebar
  - Formats current date with weekday, month, day, and year
  - Calculates days since reference date
  - Shows time elapsed in both days and months
  - Uses `toLocaleDateString()` with '2-digit' year format (not 'yy')
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
  - Sorting by tags will group entries by tag count and presence

### Data Analysis
- `updateDashboardCharts()`: Updates charts in the dashboard
- `updateSleepInsights()`: Generates insights from sleep data
- `detectConflicts()`: Identifies conflicts in the data
  - Checks for gaps between consecutive entries
  - Identifies duplicate entries for the same date
  - Reports conflicts to the console
- `resolveEntryDuplicates()`: Resolves duplicate entries
- `resolveAllConflicts()`: Handles all detected data conflicts
- `showConflictsNotification()`: Displays notification about data conflicts

### Utility Functions
- `getLuminance()`: Calculates color luminance for contrast
- `setupTagColorPresets()`: Sets up color preset selection for tags
- `setupAddTagQuickButton()`: Configures quick tag addition from sidebar
- `createCell(content, className, colorClass)`: Helper function for creating table cells in the entry table
  - Creates td elements with appropriate styling
  - Handles empty values by adding the 'empty-cell' class
  - Applies color classes and emphasis for important values
- `getScoreColor(score)`: Determines color coding based on sleep score value
  - Returns 'dark-green' for scores 85 and above
  - Returns 'green' for scores 70-84
  - Returns 'yellow' for scores 55-69
  - Returns 'red' for scores below 55
- `formatTimeCompact(hours, minutes)`: Formats time values in a compact way
  - Returns a string in format "7h 30m" for hours and minutes
  - Returns just "7h" if minutes is 0
  - Returns just "30m" if hours is 0
  - Returns "-" if both hours and minutes are 0 or null
- `getSleepColor(hours, minutes)`: Determines color coding for sleep duration based on configured thresholds
  - Compares total minutes against red, yellow, and dark green thresholds in settings
  - Returns appropriate color class ('red', 'yellow', 'green', or 'dark-green')
  - Used to highlight sleep duration cells based on quality thresholds
- `getDeepSleepColor(hours, minutes)`: Determines color coding for deep sleep values based on thresholds
  - This function is missing and causes rendering errors

### Theme Functions
- `applyTheme()`: Applies the selected theme (light/dark/auto) to the application
  - Handles theme switching based on user preference or system setting
  - Adds or removes appropriate CSS classes from document body
- `applyAccentColor()`: Applies the selected accent color to the application
  - Sets data-accent attribute on document body

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

### Required Settings Enhancements
The current settings modal is too simplified and needs to be expanded to include:

1. **Reference Date Configuration**: 
   - Critical setting that's currently missing (causing errors in initialization)
   - Needed for proper day counting calculations
   
2. **Sleep Quality Thresholds**:
   - Total sleep duration thresholds (currently missing)
   - Deep, Light, and REM sleep thresholds (all currently missing)
   
3. **Daily Goal Settings**:
   - Calories goal
   - Steps goal
   
4. **Tag Management**:
   - Tag creation, editing, and deletion with color selection
   - Tag organization and categorization
   
5. **Data Management**:
   - Import/export functionality for backup and migration
   - Data reset options
   - Conflict resolution tools

6. **Advanced Settings**:
   - Custom time formats
   - Display preferences for statistics
   - Regional settings

## Data Storage
The application uses browser localStorage to persist user data between sessions with `saveData()` and `loadData()` functions managing data serialization.

## Theme System
- Supports light and dark mode
- Custom accent colors (blue, purple, teal, orange, pink)
- Automatic theme based on system preference
- Dynamic color contrast handling for readability
- Uses `applyTheme()` function to set theme based on user preference or system setting
- Uses `applyAccentColor()` function to apply accent color from settings to DOM

## User Interface

### Modern UI Design
The application features a modern, clean user interface with:
- Responsive layout for desktop and mobile devices
- Material design-inspired cards for displaying entries
- Floating action button for adding new entries
- Modal dialogs for forms and settings
- Color-coded indicators for sleep quality and health metrics

### UI Components
- **Settings Modal**: A modernized settings panel that allows users to:
  - Switch between light, dark, and auto (system) themes with live preview
  - Configure sleep quality thresholds
  - Save preferences or cancel changes with clearly styled buttons
- **Add Entry Button**: A floating action button fixed to the bottom-right corner of the screen
- **Entry Cards**: Visual representations of sleep entries with color-coded indicators

### Theme System
The application supports three theme modes:
- **Light**: Standard light theme with white background
- **Dark**: Dark theme with reduced brightness for night use
- **Auto**: Automatically switches based on system preferences

Theme changes are previewed immediately when selected but only saved when explicitly saving settings.

## Design Considerations
The application is optimized for desktop use with:
- Fixed-width columns for readability
- Hover effects for better interaction
- Visual grouping of related data
- Persistent header for navigation
- Color-coding for quick data interpretation

## Known UI Issues
The application has several UI inconsistencies that should be addressed:
- Theme changes not applied immediately but only after saving settings
- Modal dark mode inconsistencies (new entry, new tasks, and settings modals don't respect dark mode)
- Button styling inconsistencies in the settings page (cancel and save buttons need proper styling)
- Entry save functionality may not work correctly
- Settings page needs a more modern UI update
- Settings modal is missing critical fields for reference date and threshold configurations

## Error Handling and Debugging

### Common Errors and Resolutions
The application has robust error handling for common issues:

- **Missing Function Definitions**: Previously encountered errors related to missing functions have been resolved, including:
  - `createCell()`: Added to properly create table cells with formatting
  - `getScoreColor()`: Added to determine color coding for health metrics
  - `formatTimeCompact()`: Added to format time values in a compact way
  - `getSleepColor()`: Added to determine color coding for sleep duration based on thresholds in settings
  - `getDeepSleepColor()`: Still missing, needs to be implemented to fix rendering errors

- **Missing DOM Elements**: The application reports various missing elements during initialization:
  - Critical: Reference Date element is missing from the simplified settings modal, causing functional issues
  - Non-critical: Various form elements for sleep thresholds are missing but marked as warnings
  - The system reports "Found 1 missing critical elements. Application may not function correctly."

- **Data Gap Warning**: The application checks for large gaps between entries and provides warnings when gaps exceed 31 days.

- **Theme Application**: The theme system now properly applies themes to all UI elements, including modals and buttons.

### Recent Improvements
- **Settings UI Modernization**: The settings interface has been redesigned with a cleaner, more modern appearance and live theme preview.
- **Button Styling**: Added consistent styling for primary and secondary buttons across the application.
- **Add Entry Button**: Improved the visibility and interaction design of the add entry floating action button.
- **Modal Styling**: Enhanced modal dialogs with proper dark mode support and improved form layouts.

## Future Enhancements
Based on the Goals.txt file and user feedback, potential improvements include:
- Improved tag filtering to show only entries with selected tags
- Better alignment of rendered task lists with table headers
- Enhanced interaction with today's tasks in the sidebar
- Weather API integration for each day
- Automatic subscription reminders
- Implementing missing functions to fix rendering issues (`getDeepSleepColor()`)
- Modernizing the UI of the settings page and modals
- Fixing theme inconsistencies across modals
- Ensuring proper button styling throughout the application
- Fixing entry save functionality
- Expanding the settings modal to include all necessary configuration options
- Adding comprehensive tag management in settings
- Implementing data import/export functionality
- Restoring all missing form elements in the settings modal:
  - Reference date
  - Calories and steps goals
  - Sleep threshold values (red, yellow, dark green)
  - Deep, light, and REM sleep thresholds

## Common Issues and Solutions
- **Date formatting error**: If you encounter `RangeError: Value yy out of range for Date.prototype.toLocaleDateString options property year`, ensure you're using `'2-digit'` instead of `'yy'` for year formatting in `toLocaleDateString()` options.
- **Missing theme functions**: If you see `ReferenceError: applyTheme is not defined`, ensure that the `applyTheme()` and `applyAccentColor()` functions are properly defined in your script. These functions are essential for applying theme and accent color settings to the application.
- **Modal behavior issues**: If modals don't close when clicking outside or using the close button, check the event listeners in the `initializeModals()` function.
- **Table rendering issues**: If you see error messages about undefined functions (`createCell`, `getScoreColor`, `formatTimeCompact`, `getSleepColor`, `getDeepSleepColor`), implement the missing functions in script.js. These utility functions are required by `renderEntries()` to properly generate and style table cells.
- **Data gap warnings**: Console warnings about "Gap of X days detected between dates" indicate potential missing entries. These are reported by the `detectConflicts()` function and can be addressed by adding entries for the missing dates or can be ignored if the gaps are intentional.
- **Theme application issues**: Theme changes don't take effect until settings are saved. To fix this, modify the theme selector event handler to apply themes immediately as a preview while still saving the preference on form submit.
- **Modal theme inconsistencies**: Modals might not reflect the current theme correctly. Ensure modals use the appropriate theme classes and styles.
- **Missing critical elements**: The "Missing required element: Reference Date" error indicates that a required DOM element for the reference date setting is missing from the settings modal, which needs to be restored.

## Developer Guide: Application Structure, IDs, and Components

This section provides a comprehensive reference of the Sleep Tracker application's HTML structure, element IDs, and components to help with development and troubleshooting.

### HTML Structure Overview

```
body
├── .container
│   └── .main-layout
│       ├── .date-sidebar (Left sidebar)
│       │   ├── .app-logo
│       │   ├── .date-display
│       │   ├── .today-container (Today's Tasks)
│       │   ├── .today-tags
│       │   └── .sidebar-navigation (Hidden, replaced by floating buttons)
│       └── .main-content (Right side content)
│           ├── header
│           │   ├── .current-stats (Statistics cards)
│           │   └── .controls (Month selector and filters)
│           └── .table-container (Main sleep data table)
├── .floating-action-buttons (Fixed position buttons)
└── Modals
    ├── #entry-modal (Add/Edit Entry)
    ├── #settings-modal (Settings)
    ├── #dashboard-modal (Analytics Dashboard) 
    └── #entry-preview-modal (Entry Details)
```

### Important Element IDs

#### Date and Navigation
- `#current-date` - Current date display in sidebar
- `#days-count` - Container for days/months since reference date
- `#current-month` - Month display in header
- `#prev-month` - Previous month button
- `#next-month` - Next month button

#### Tasks and Tags
- `#today-tasks` - Today's tasks list in sidebar
- `#today-tags-list` - Today's tags in sidebar
- `#add-tag-quick-btn` - Quick button to add tags
- `#add-task-standalone-btn` - Button to add tasks from sidebar (hidden now)

#### Main Table
- `#sleep-table` - Main sleep tracking table
- `#sleep-data` - Table body for sleep entries

#### Filters and Controls
- `#search-input` - Search box for filtering entries
- `#tag-filter` - Dropdown for filtering by tags
- `#sort-by` - Dropdown for sorting entries

#### Floating Action Buttons
- `#add-entry-fab` - Floating button to add new entry
- `#add-task-fab` - Floating button to add new task
- `#settings-fab` - Floating button to open settings

#### Entry Modal
- `#entry-modal` - Modal for adding/editing entries
- `#entry-form` - Form for entry data
- `#entry-id` - Hidden input for entry ID when editing
- `#entry-date` - Date input for entry
- `#sleep-score` - Input for sleep score
- `#night-sleep-hours` / `#night-sleep-minutes` - Inputs for night sleep duration
- `#day-nap-hours` / `#day-nap-minutes` - Inputs for day nap duration
- `#deep-sleep-hours` / `#deep-sleep-minutes` - Inputs for deep sleep duration
- `#light-sleep-hours` / `#light-sleep-minutes` - Inputs for light sleep duration
- `#rem-sleep-hours` / `#rem-sleep-minutes` - Inputs for REM sleep duration
- `#wake-ups` - Input for number of wake ups
- `#cut-sleep` - Checkbox for cut sleep indicator
- `#seizure` - Checkbox for seizure indicator
- `#shake` - Checkbox for shake indicator
- `#afr` - Checkbox for Afrodite indicator
- `#events-notes` - Textarea for entry notes
- `#new-task` - Input for adding tasks to an entry
- `#add-task-btn` - Button to add task to current entry
- `#tasks-list` - Container for tasks in the entry modal
- `