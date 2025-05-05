# Emotion Pie Chart Component

## Overview
The Emotion Pie Chart is a visualization component that displays the distribution of dominant emotions across all analyzed texts. This interactive chart helps users quickly understand the overall emotional landscape of the dataset, with each slice representing the percentage of texts where a particular emotion was dominant.

## Features
- Interactive D3.js pie chart showing emotion distribution
- Color-coded emotion categories for intuitive understanding
- Detailed tooltips showing exact counts and percentages on hover
- External labels with connecting lines for better readability
- Modal view displaying all texts associated with a selected emotion
- Responsive design that adapts to different screen sizes
- Legend with clickable entries to view texts for each emotion
- Comprehensive error handling and loading states

## Screenshot
![Emotion Pie Chart Visualization](../screenshots/emotion-pie-chart.png)

## Technical Implementation

### Data Processing
The component processes emotion distribution data by:
1. Fetching data from the `/api/emotion-max-distribution` endpoint with user-specified filters
2. Calculating percentages for each emotion based on the total count
3. Mapping emotions to their corresponding colors from the emotionColors map
4. Processing additional data for detailed emotion analysis in the modal view

### Visualization
The pie chart is built using D3.js with the following key features:
- **Pie Layout**: Uses `d3.pie()` for basic pie chart creation with padding for visual separation
- **Arc Generator**: Implements `d3.arc()` to create the pie segments
- **External Labels**: Places labels outside the pie with connector lines for better readability
- **Interactive Elements**: Implements hover effects and click handlers for user interaction
- **Custom Tooltips**: Shows detailed information about emotion counts and percentages
- **Responsive Design**: Automatically adjusts to container dimensions

### Modal View
When a user clicks on a pie segment, a modal displays:
- All texts where the selected emotion was dominant
- Creation date for each text
- Emotion intensity values for all emotions in each text
- Average emotion values across all displayed texts

### Backend Integration
The component relies on two endpoints:
- `/api/emotion-max-distribution`: Returns the distribution of emotions based on maximum intensity
- `/api/emotion-texts`: Returns text samples for a specific emotion when requested

## Usage

### Basic Usage
```jsx
import EmotionPieChart from '../components/visualizations/EmotionPieChart';

function Dashboard() {
  const searchParams = {
    sources: [{ value: 'Twitter', label: 'Twitter' }],
    startDate: '2021-01-01',
    endDate: '2021-12-31',
    emotions: 'All'
  };
  
  return (
    <div className="dashboard">
      <EmotionPieChart searchParams={searchParams} />
    </div>
  );
}
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| searchParams | object | Configuration object containing filter parameters |
| searchParams.sources | array | Array of source objects with value and label properties |
| searchParams.startDate | string | Start date in YYYY-MM-DD format |
| searchParams.endDate | string | End date in YYYY-MM-DD format |
| searchParams.emotions | string | Comma-separated list of emotions to include, or 'All' |

## User Guide

### Interpreting the Visualization
- Each colored slice represents a different emotion
- The size of each slice indicates the percentage of texts where that emotion was dominant
- The total number of records is displayed in the top-right corner
- External labels show both the percentage and count for each emotion

### Interaction
- Hover over any slice to see detailed information about the emotion
- Click on a slice to open a modal with all texts where that emotion was dominant
- Use the legend at the bottom to identify which color corresponds to which emotion
- Click on legend entries to view all texts for that emotion

### Modal View
The modal view provides:
- A list of all texts where the selected emotion was dominant
- Timestamps showing when each text was created
- A breakdown of all emotion values for each text
- Color highlighting for high emotion values

### Filtering
The visualization responds to the following filters set in the Advanced Search panel:
- **Sources**: Filter by data sources (Twitter, CNN, etc.)
- **Date Range**: Specify start and end dates
- **Emotions**: Select specific emotions to focus on

## Edge Cases and Error Handling
- If no data matches the current filters, a helpful message is displayed
- Loading states are clearly indicated with spinners and messages
- Error states during data loading or rendering are communicated to the user
- The component gracefully handles varying data volumes

## Performance Considerations
- D3 selections are properly managed to prevent memory leaks
- Modal data is loaded on demand to minimize initial load times
- SVG elements use a viewBox for better scaling across different devices
- Tooltips are optimized to prevent performance issues during hover interactions

## Dependencies
- D3.js for data visualization
- React Bootstrap for UI components and modal
- Custom emotion color mappings (imported from emotionColors.js) 