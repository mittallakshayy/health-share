# Health-Share Visualization Components

This document provides an overview of the visualization components available in the Health-Share application, which help users analyze emotional content in texts.

## Available Visualizations

### 1. Word Cloud
Displays the most frequently occurring words in the analyzed texts, with size indicating frequency and color indicating the dominant emotion associated with each word. This visualization helps identify key topics and their emotional context.

[Detailed Documentation](./WordCloud.md)

### 2. Emotion Pie Chart
Shows the distribution of dominant emotions across all analyzed texts, allowing users to quickly understand the overall emotional landscape of the dataset. Each slice represents the percentage of texts where a particular emotion was dominant.

### 3. Emotion Timeline
Visualizes how emotions change over time using an interactive stream graph. This helps identify emotional trends, patterns, and shifts across different time periods.

[Detailed Documentation](./EmotionTimeline.md)

### 4. Emotion Spider Wheel
Displays emotion distribution using a radar chart with two metrics: the number of texts where each emotion is dominant (red polygon) and the percentage of texts where each emotion is present (blue polygon). This visualization helps compare emotional composition across the dataset.

[Detailed Documentation](./EmotionSpiderWheel.md)

## Integration

All visualizations are designed to work with the Advanced Search component, which provides filtering capabilities:

- **Source Filtering**: Limit visualizations to specific data sources (Twitter, CNN, Medium, etc.)
- **Date Range**: Focus on texts from a specific time period
- **Emotion Filtering**: Highlight specific emotions of interest

## Technical Stack

The visualizations are built using:

- **React** for component architecture
- **D3.js** for advanced data visualization
- **React Bootstrap** for UI components and layout

## Backend Support

The visualizations are powered by dedicated API endpoints:

- `/api/wordcloud-data` - Processes and returns word frequency data with emotional context
- `/api/emotion-max-distribution` - Provides data on emotional distribution using maximum emotion approach
- `/api/emotion-timeline` - Returns time-series data of emotions for timeline visualization
- `/api/emotion-spider` - Returns data for the Emotion Spider Wheel with dominant and presence metrics

## Usage Example

```jsx
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AdvancedSearch from './components/AdvancedSearch';
import WordCloud from './components/visualizations/WordCloud';
import EmotionPieChart from './components/visualizations/EmotionPieChart';
import EmotionTimeline from './components/visualizations/EmotionTimeline';
import EmotionSpiderWheel from './components/visualizations/EmotionSpiderWheel';

function VisualizationDashboard() {
  const [searchParams, setSearchParams] = useState(null);
  
  const handleSearch = (params) => {
    setSearchParams(params);
  };
  
  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <AdvancedSearch onSearch={handleSearch} />
        </Col>
        <Col md={9}>
          <Row>
            <Col md={6}>
              <WordCloud searchParams={searchParams} />
            </Col>
            <Col md={6}>
              <EmotionPieChart searchParams={searchParams} />
            </Col>
          </Row>
          <Row className="mt-4">
            <Col md={6}>
              <EmotionTimeline searchParams={searchParams} />
            </Col>
            <Col md={6}>
              <EmotionSpiderWheel searchParams={searchParams} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
```

## Responsive Design

All visualizations are responsive and will adapt to different screen sizes:

- On larger screens, visualizations display with optimal detail and interactivity
- On medium screens, the layout adjusts to maintain readability
- On mobile devices, components stack vertically for better user experience

## Performance Considerations

The visualizations implement several optimizations:

- **Data Processing**: Preprocessing data on the backend to minimize client-side computation
- **Lazy Loading**: Deferring visualization rendering until needed
- **Debounced Updates**: Preventing excessive re-renders during window resizing
- **Efficient DOM Updates**: Using D3's enter/update/exit pattern for smooth transitions

## Accessibility

The visualizations include:

- Color schemes chosen for visibility and contrast
- Interactive elements with appropriate labels and ARIA attributes
- Alternative text representations for screen readers
- Keyboard navigation support for interactive elements 