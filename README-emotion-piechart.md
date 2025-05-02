# Emotion Distribution Pie Chart Visualization

## Overview

The Emotion Distribution Pie Chart provides a clear visualization of the emotional landscape within text data. This interactive visualization:

1. **Shows Proportions**: Displays the relative proportions of different emotions in the dataset
2. **Color Coding**: Uses distinct colors for each emotion category for easy identification
3. **Interactive Elements**: Supports hover tooltips and click actions to explore the data
4. **Sample Texts**: Allows viewing sample texts associated with each emotion

## Technical Implementation

### Data Processing

The visualization analyzes data from the `rawdata_with_emotion` table, focusing on the dominant emotion for each text entry. The system:

1. Counts the number of texts associated with each dominant emotion
2. Calculates the percentage distribution of each emotion
3. Retrieves sample texts (up to 10) for each emotion to provide context
4. Returns both aggregate statistics and representative examples

### Data Visualization

The pie chart is built using D3.js and implements several interactive features:

- **Segments**: Each segment of the pie represents a distinct emotion
- **Size**: The size of each segment corresponds to the proportion of texts with that emotion
- **Labels**: Segments are clearly labeled with the emotion name and percentage
- **Hover Effects**: Segments are highlighted on hover with an animated tooltip
- **Click Interaction**: Clicking a segment opens a modal with sample texts

### Color Mapping and Legend

The visualization uses a consistent color scheme shared with other emotion visualizations and includes a comprehensive color legend below the chart for easy reference:

- Anger: Red (#e41a1c)
- Anticipation: Orange (#ff7f00)
- Disgust: Purple (#984ea3)
- Fear: Brown (#a65628)
- Joy: Yellow (#ffff33)
- Sadness: Blue (#377eb8)
- Surprise: Green (#4daf4a)
- Trust: Pink (#f781bf)

## Enhanced Visualization Features

### Improved Label Visibility

The pie chart includes several enhancements to ensure label clarity:

1. **Text Outlines**: Labels use a white outline effect to ensure visibility regardless of background
2. **Color-Coded Text**: Each label uses the same color as its corresponding pie segment
3. **Color-Coded Lines**: Connection lines use matching colors for better visual tracing
4. **Strategic Positioning**: Labels are positioned with adequate spacing to prevent overlap

### Interactive Color Legend

The color legend provides:
- A clear reference for all emotion categories
- Visual consistency with the pie chart colors
- A compact, responsive layout that works across different screen sizes

## How to Use

1. **Filter Data**: Use the Advanced Search form to filter texts by:
   - Data sources (Twitter, CNN, Medium, etc.)
   - Date range
   - Emotions of interest

2. **Interaction Techniques**:
   - Hover over any segment to see exact count and percentage
   - Click on a segment to view sample texts with that emotion
   - Observe the total record count displayed in the header
   - Refer to the color legend below the chart to identify emotions

3. **Analysis Approaches**:
   - Identify dominant emotions in the dataset
   - Compare emotional distributions across different filters
   - Analyze specific emotions by examining their sample texts
   - Use the color coding to visually connect related information

## Technical Architecture

The visualization is built using:

- **Backend**: Node.js with Express for API endpoints
- **Database**: PostgreSQL with the `rawdata_with_emotion` table
- **Frontend**: React with:
  - D3.js for rendering the interactive pie chart
  - React Bootstrap for UI components and modal dialogs
  - Custom React hooks for data fetching and state management

## SQL Query

The core SQL query used for generating the pie chart data:

```sql
-- Get count of texts for each emotion
SELECT 
  dominant_emotion,
  COUNT(*) as count
FROM rawdata_with_emotion
WHERE [search_filters]
GROUP BY dominant_emotion
ORDER BY count DESC;

-- Get sample texts for each emotion
WITH ranked_texts AS (
  SELECT 
    text_id,
    text,
    dominant_emotion,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY dominant_emotion ORDER BY created_at DESC) as rn
  FROM rawdata_with_emotion
  WHERE [search_filters]
)
SELECT text_id, text, dominant_emotion, created_at
FROM ranked_texts
WHERE rn <= 10
ORDER BY dominant_emotion, created_at DESC;
```

## Implementation Details

### D3.js Integration

The visualization integrates D3.js with React using the following approach:
1. React manages component lifecycle and state
2. D3 handles the DOM manipulation for SVG elements
3. React refs provide access to the DOM for D3 to manipulate
4. D3 events are connected to React state for interactive features

### Label Enhancement Techniques

To ensure optimal label visibility:
1. Labels use a paint-order technique to create text outlines
2. A thresholding system hides labels for very small segments (<2%)
3. Labels are positioned outside the chart with adequate spacing
4. Color-matching is used to visually connect labels to segments

### Modal Implementation

The sample text modal provides additional context for each emotion:
1. Shows up to 10 most recent texts for the selected emotion
2. Displays the creation date for each text
3. Uses the emotion's color in the header for visual continuity
4. Automatically adjusts text color for light-colored emotions (Joy, Anticipation)
5. Allows users to close and explore different emotions

## Future Enhancements

Potential improvements for future versions include:

1. **Time Series Analysis**: Adding a timeline view to track emotion changes over time
2. **Comparison View**: Allowing side-by-side comparison of emotion distributions for different filters
3. **Drill-Down Capability**: Enabling exploration of sub-emotions within major categories
4. **Export Options**: Adding capabilities to export visualization data and images
5. **Responsive Layout**: Enhancing mobile responsiveness for better small-screen viewing 