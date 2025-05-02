# Emotion Word Cloud Visualization

## Overview

The Emotion Word Cloud visualization provides an intuitive and visually engaging way to analyze the emotional content of text data in our database. This visualization creates a dynamic word cloud where:

1. **Word Size**: Represents the frequency of the word in the dataset
2. **Word Color**: Corresponds to the dominant emotion associated with the word
3. **Interactive Tooltips**: Display detailed emotion percentages on hover

## Technical Implementation

### Data Processing

The visualization analyzes data from the `rawdata_with_emotion` table which contains the following emotional dimensions for each text entry:

- Anger
- Anticipation
- Disgust
- Fear
- Joy
- Sadness
- Surprise
- Trust

For each word extracted from the text data, the system:

1. Calculates the frequency of the word across all texts matching the search criteria
2. Determines the dominant emotion based on the most common dominant emotion across texts containing the word
3. Calculates the average emotional scores for each of the eight emotions to determine the emotional profile

### Color Mapping

Each emotion is mapped to a distinct color for visual differentiation:

- Anger: Red (#e41a1c)
- Anticipation: Orange (#ff7f00)
- Disgust: Purple (#984ea3)
- Fear: Brown (#a65628)
- Joy: Yellow (#ffff33)
- Sadness: Blue (#377eb8)
- Surprise: Green (#4daf4a)
- Trust: Pink (#f781bf)

### Interactive Features

When users hover over a word in the cloud, a tooltip displays:

1. The word and its frequency count
2. The dominant emotion associated with the word
3. A breakdown of percentages for each emotion, sorted by strength

## How to Use

1. **Search Parameters**: Use the Advanced Search form to filter data by:
   - Data sources (Twitter, CNN, Medium, etc.)
   - Date range
   - Specific emotions of interest

2. **Visualization Interpretation**:
   - Larger words appear more frequently in the filtered dataset
   - The color of each word represents its dominant emotional association
   - Hover over any word to see a detailed breakdown of emotional percentages

3. **Analysis Techniques**:
   - Identify common themes by observing clusters of similarly colored words
   - Detect outliers by looking for words with colors that differ from surrounding words
   - Track emotional shifts over time by comparing word clouds from different time periods

## Technical Architecture

The visualization is built using:

- **Backend**: Node.js with Express for the API endpoints
- **Database**: PostgreSQL with the `rawdata_with_emotion` table
- **Frontend**: React with the following libraries:
  - `react-wordcloud` for the word cloud rendering
  - `d3-scale-chromatic` for color schemes
  - `tippy.js` for enhanced tooltips

## SQL Query

The core SQL query used for generating the word cloud data:

```sql
WITH words AS (
  SELECT 
    unnest(string_to_array(lower(regexp_replace(text, '[^a-zA-Z0-9\\s]', '', 'g')), ' ')) AS word,
    dominant_emotion,
    anger, anticipation, disgust, fear, joy, sadness, surprise, trust
  FROM rawdata_with_emotion
  WHERE <search_filters>
)
SELECT 
  word,
  COUNT(*) as frequency,
  MODE() WITHIN GROUP (ORDER BY dominant_emotion) as dominant_emotion,
  AVG(anger) as avg_anger,
  AVG(anticipation) as avg_anticipation,
  AVG(disgust) as avg_disgust,
  AVG(fear) as avg_fear,
  AVG(joy) as avg_joy,
  AVG(sadness) as avg_sadness,
  AVG(surprise) as avg_surprise,
  AVG(trust) as avg_trust
FROM words
WHERE length(word) > 3
AND word NOT IN (<common_stop_words>)
GROUP BY word
ORDER BY frequency DESC
LIMIT 100
```

## Future Enhancements

Future versions of this visualization may include:

1. **Temporal Analysis**: Tracking emotional shifts over time with time-series visualizations
2. **Comparative Views**: Comparing emotional profiles between different sources or topics
3. **Contextual Analysis**: Showing common phrases or n-grams instead of single words
4. **Emotion Intensity Scale**: Adding gradient colors to represent emotion intensity
5. **Topic Clustering**: Grouping related words by topic in addition to emotion 