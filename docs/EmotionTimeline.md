# Emotion Timeline Component

## Overview
The Emotion Timeline is a visualization component that displays how emotions in text data change over time. It uses a stream graph to represent the distribution and intensity of different emotions across a timeline, making it easy to identify emotional trends, patterns, and shifts over specific periods.

## Features
- Interactive stream graph visualizing emotion frequency over time
- Responsive design that adapts to different screen sizes
- Hoverable regions that display detailed information for specific dates and emotions
- Color-coded emotional categories for intuitive understanding
- Dynamic filtering based on date ranges, sources, and emotion types
- Handles edge cases like single data points and duplicate dates

## Screenshot
![Emotion Timeline Visualization](../screenshots/emotion-timeline.png)

## Technical Implementation

### Data Processing
The component processes time-series emotion data by:
1. Fetching data from the `/api/emotion-timeline` endpoint with user-specified filters
2. Deduplicating entries by date and combining emotion values
3. Sorting data chronologically
4. Filtering out the "Mixed" emotion category to focus on dominant emotions only
5. Calculating totals for each emotion across the timeline

### Visualization
The stream graph is built using D3.js with the following key features:
- **Stack Layout**: Uses `d3.stack()` with `stackOrderNone` and `stackOffsetWiggle` to create an aesthetically pleasing stream effect
- **Time Scale**: Implements a time-based x-axis for accurate date representation
- **Smooth Curves**: Applies `curveBasis` to create natural-looking transitions between data points
- **Interactive Tooltips**: Shows detailed information about emotion counts and percentages on hover
- **Responsive Design**: Automatically resizes when the container or window dimensions change

### Backend Integration
The component relies on the `/api/emotion-timeline` endpoint, which:
- Accepts filters for sources, date ranges, and emotion types
- Processes text data to identify the maximum emotion for each entry
- Groups results by date and emotion
- Returns a structured JSON response with timelineData and available emotions

## Usage

### Basic Usage
```jsx
import EmotionTimeline from '../components/visualizations/EmotionTimeline';

function Dashboard() {
  const searchParams = {
    sources: [{ value: 'Twitter', label: 'Twitter' }],
    startDate: '2021-01-01',
    endDate: '2021-12-31',
    emotions: 'All'
  };
  
  return (
    <div className="dashboard">
      <EmotionTimeline searchParams={searchParams} />
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
- Each colored stream represents a different emotion
- The height of each stream indicates the number of texts with that emotion as the maximum on a given day
- Streams are stacked to show the total distribution of emotions across time
- The visualization automatically scales to accommodate varying data volumes

### Interaction
- Hover over any part of the stream graph to see details about the specific emotion and date
- View the total count of records in the top-right corner
- Use the legend at the bottom to identify which color corresponds to which emotion

### Filtering
The visualization responds to the following filters set in the Advanced Search panel:
- **Sources**: Filter by data sources (Twitter, CNN, etc.)
- **Date Range**: Specify start and end dates
- **Emotions**: Select specific emotions to focus on

## Edge Cases and Error Handling
- If no data matches the current filters, a helpful message is displayed
- For single data points, the component creates a duplicated point to enable visualization
- Error states during data loading or rendering are clearly communicated
- The component gracefully handles varying data volumes and time spans

## Performance Considerations
- The stream graph uses efficient D3 algorithms for data transformation
- Tooltips are optimized to prevent performance issues during hover interactions
- Responsive design uses event throttling to prevent excessive re-renders on resize
- Data deduplication minimizes unnecessary DOM operations

## Dependencies
- D3.js for data visualization
- React Bootstrap for UI components
- Custom emotion color mappings (imported from emotionColors.js) 