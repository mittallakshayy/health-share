# Emotion Word Cloud Component

## Overview
The Emotion Word Cloud is a visualization component that displays the most frequently occurring words in the analyzed texts. Each word is sized according to its frequency and colored based on the dominant emotion associated with it. This visualization helps identify key topics and their emotional context at a glance.

## Features
- Interactive word cloud using the react-wordcloud library
- Words sized proportionally to their frequency in the dataset
- Color-coded words based on their highest associated emotion
- Detailed tooltips showing emotion percentages on hover
- Responsive design that adapts to different screen sizes
- Comprehensive error handling and loading states
- Color legend explaining the emotion-color mapping
- Record count display showing the total number of analyzed texts

## Screenshot
![Emotion Word Cloud Visualization](../screenshots/emotion-word-cloud.png)

## Technical Implementation

### Data Processing
The component processes word frequency and emotion data by:
1. Fetching data from the `/api/wordcloud-data` endpoint with user-specified filters
2. Calculating the highest emotion for each word based on average emotion values
3. Processing average emotion values to generate percentage distributions
4. Formatting the data for consumption by the react-wordcloud library

### Calculation Methods
The component uses several methods to determine emotion values:
- **Highest Emotion Detection**: Compares all emotion values for each word and identifies the highest one
- **Emotion Percentage Calculation**: Converts raw emotion values to percentages for easier interpretation
- **Color Assignment**: Maps each word to a color based on its highest emotion using the emotionColors utility

### Visualization
The word cloud is built using react-wordcloud with the following key features:
- **Sizing**: Words are sized according to their frequency in the dataset
- **Color Coding**: Words are colored based on their highest associated emotion
- **Tooltips**: Custom tooltips show detailed emotion breakdowns for each word
- **Responsive Layout**: Automatically adjusts to different screen sizes
- **Custom Callbacks**: Implements callbacks for word color and tooltip content

### Backend Integration
The component relies on the `/api/wordcloud-data` endpoint, which:
- Accepts filters for sources, date ranges, and emotion types
- Processes text data to identify word frequencies and associated emotions
- Returns a structured JSON response with word data and total record count

## Usage

### Basic Usage
```jsx
import EmotionWordCloud from '../components/visualizations/EmotionWordCloud';

function Dashboard() {
  const searchParams = {
    sources: [{ value: 'Twitter', label: 'Twitter' }],
    startDate: '2021-01-01',
    endDate: '2021-12-31',
    emotions: 'All'
  };
  
  return (
    <div className="dashboard">
      <EmotionWordCloud searchParams={searchParams} />
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
- Each word's size indicates its frequency in the analyzed texts
- Each word's color indicates the dominant emotion associated with it
- The total number of records is displayed in the top-right corner
- A color legend at the bottom explains the emotion-color mapping

### Interaction
- Hover over any word to see detailed information about its frequency and emotion breakdown
- The tooltip shows the word, its occurrence count, and a percentage breakdown of all associated emotions
- The highest emotion is highlighted in the tooltip for quick reference

### Word Cloud Configuration
The word cloud is configured with the following properties:
- Words can appear in different rotations (0° or 90°) for visual variety
- Font sizes are scaled between 12px and 60px based on frequency
- Transitions are animated over 1000ms for a smooth user experience
- The layout uses a square root scale for more balanced visual representation

### Filtering
The visualization responds to the following filters set in the Advanced Search panel:
- **Sources**: Filter by data sources (Twitter, CNN, etc.)
- **Date Range**: Specify start and end dates
- **Emotions**: Select specific emotions to focus on

## Edge Cases and Error Handling
- If no data matches the current filters, a helpful message is displayed
- Loading states are clearly indicated with spinners and messages
- Error states during data loading or rendering are communicated to the user
- The component gracefully handles varying data volumes and word lengths

## Performance Considerations
- The word cloud uses deterministic layout to ensure consistent positioning
- Tooltips use efficient HTML rendering to display complex information
- API requests are properly managed to prevent redundant network calls
- Component cleanup is handled properly to prevent memory leaks

## Dependencies
- react-wordcloud for the core visualization
- tippy.js for enhanced tooltips
- React Bootstrap for UI components
- Custom emotion color mappings (imported from emotionColors.js) 