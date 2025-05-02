# Emotion Spider Wheel Component

## Overview
The Emotion Spider Wheel is a radar chart visualization that displays the distribution of emotions in analyzed texts using two key metrics: dominant emotion counts and emotion presence percentages. This dual-metric approach provides a comprehensive view of emotional composition across the dataset.

## Features
- Interactive radar chart showing emotion distribution
- Two metrics represented as overlapping polygons:
  - **Red polygon**: Number of texts where each emotion is the dominant emotion
  - **Blue polygon**: Percentage of texts where each emotion is present (value > 0)
- Interactive data points with detailed tooltips
- Color-coded vertices representing each emotion
- Concentric grid circles for scale reference
- Responsive design that maintains proportions across screen sizes

## Screenshot
![Emotion Spider Wheel Visualization](../screenshots/emotion-spider-wheel.png)

## Technical Implementation

### Data Processing
The component processes emotion data by:
1. Fetching data from the `/api/emotion-spider` endpoint with user-specified filters
2. Processing two key metrics for each emotion:
   - Dominant count: Number of texts where the emotion has the highest value
   - Presence percentage: Percentage of texts where the emotion has a value > 0
3. Calculating scales based on the maximum values for proper visualization

### Visualization
The radar chart is built using D3.js with the following key features:
- **Radial Layout**: Places emotion vertices evenly around a circle
- **Dual Polygons**: Uses d3.lineRadial() to create the overlapping emotion metrics
- **Interactive Points**: Adds dots at each vertex for both metrics with hover interactions
- **Concentric Grid**: Shows reference circles for scale comparison
- **Tooltip Information**: Displays detailed counts and percentages on hover

### Backend Integration
The component relies on the `/api/emotion-spider` endpoint, which:
- Accepts filters for sources, date ranges, and emotion types
- Returns two metrics for each emotion:
  - dominantCounts: Where each emotion is the maximum
  - presentCounts: Where each emotion is present (value > 0)
- Provides total count of texts for percentage calculations

## Usage

### Basic Usage
```jsx
import EmotionSpiderWheel from '../components/visualizations/EmotionSpiderWheel';

function Dashboard() {
  const searchParams = {
    sources: [{ value: 'Twitter', label: 'Twitter' }],
    startDate: '2021-01-01',
    endDate: '2021-12-31',
    emotions: 'All'
  };
  
  return (
    <div className="dashboard">
      <EmotionSpiderWheel searchParams={searchParams} />
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
- Each vertex of the spider wheel represents one of the eight primary emotions
- The red polygon shows the count of texts where each emotion is dominant
- The blue polygon shows the percentage of texts where each emotion is present
- The larger the area of each polygon, the stronger the emotional presence across the dataset
- Compare the shapes to understand both dominant emotions and underlying emotional composition

### Interaction
- Hover over any colored dot to see detailed information about that emotion:
  - For red dots: Number of texts where the emotion is dominant
  - For blue dots: Percentage and count of texts where the emotion is present
- The concentric circles provide scale reference for the values
- The legend at the top left explains what each polygon represents

### Filtering
The visualization responds to the following filters set in the Advanced Search panel:
- **Sources**: Filter by data sources (Twitter, CNN, etc.)
- **Date Range**: Specify start and end dates
- **Emotions**: Select specific emotions to focus on

## Edge Cases and Error Handling
- If no data matches the current filters, a helpful message is displayed
- Zero values are handled properly in the visualization
- Missing emotions are gracefully displayed with zero values
- The component adjusts scales automatically based on the maximum values present

## Performance Considerations
- SVG elements are optimized to prevent rendering issues
- Tooltips are created once and reused to minimize DOM operations
- The component cleans up D3 elements when unmounting to prevent memory leaks

## Dependencies
- D3.js for data visualization
- React Bootstrap for UI components
- Custom emotion color mappings (imported from emotionColors.js) 