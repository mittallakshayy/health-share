import React, { useState, useEffect, useCallback } from 'react';
import ReactWordcloud from 'react-wordcloud';
import { Card, Spinner, Alert } from 'react-bootstrap';
import * as d3 from 'd3';
import { schemeCategory10 } from 'd3-scale-chromatic';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

// Map emotions to colors using d3 color scheme
const emotionColors = {
  'Anger': '#e41a1c',       // Red
  'Anticipation': '#ff7f00', // Orange
  'Disgust': '#984ea3',     // Purple
  'Fear': '#a65628',        // Brown
  'Joy': '#ffff33',         // Yellow
  'Sadness': '#377eb8',     // Blue
  'Surprise': '#4daf4a',    // Green
  'Trust': '#f781bf'        // Pink
};

const EmotionWordCloud = ({ searchParams }) => {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get color for a word based on its dominant emotion
  const getWordColor = useCallback((word) => {
    return emotionColors[word.dominant_emotion] || '#999999'; // Default gray color
  }, []);

  // Function to create emotion percentage text for tooltip
  const getEmotionPercentages = useCallback((word) => {
    const emotions = [
      { name: 'Anger', value: word.avg_anger },
      { name: 'Anticipation', value: word.avg_anticipation },
      { name: 'Disgust', value: word.avg_disgust },
      { name: 'Fear', value: word.avg_fear },
      { name: 'Joy', value: word.avg_joy },
      { name: 'Sadness', value: word.avg_sadness },
      { name: 'Surprise', value: word.avg_surprise },
      { name: 'Trust', value: word.avg_trust }
    ].sort((a, b) => b.value - a.value);

    // Calculate total for percentage conversion
    const total = emotions.reduce((acc, emotion) => acc + emotion.value, 0);
    
    return emotions.map(emotion => {
      const percentage = total > 0 ? ((emotion.value / total) * 100).toFixed(1) : 0;
      return `${emotion.name}: ${percentage}%`;
    }).join('<br>');
  }, []);

  // Setup wordcloud options
  const options = {
    colors: schemeCategory10,
    enableTooltip: true,
    deterministic: true,
    fontFamily: 'Arial',
    fontSizes: [12, 60],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000,
  };

  // Callbacks for the word cloud
  const getCallbacks = useCallback(() => {
    return {
      getWordColor: getWordColor,
      getWordTooltip: word => 
        `<div style="text-align: left;">
          <strong>${word.text}</strong> (${word.value} occurrences)<br>
          <strong>Dominant Emotion:</strong> ${word.dominant_emotion}<br>
          <strong>Emotion Percentages:</strong><br>
          ${getEmotionPercentages(word)}
        </div>`,
    };
  }, [getWordColor, getEmotionPercentages]);

  useEffect(() => {
    if (!searchParams) return;
    
    const fetchWordCloudData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Construct URL with search parameters
        const queryParams = new URLSearchParams({
          sources: searchParams.sources?.map(s => s.value).join(','),
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          emotions: searchParams.emotions
        });
        
        const response = await fetch(`http://localhost:3003/healthshare/api/wordcloud-data?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format the data for react-wordcloud
        const formattedWords = data.map(item => ({
          text: item.word,
          value: parseInt(item.frequency),
          dominant_emotion: item.dominant_emotion,
          avg_anger: parseFloat(item.avg_anger),
          avg_anticipation: parseFloat(item.avg_anticipation),
          avg_disgust: parseFloat(item.avg_disgust),
          avg_fear: parseFloat(item.avg_fear),
          avg_joy: parseFloat(item.avg_joy),
          avg_sadness: parseFloat(item.avg_sadness),
          avg_surprise: parseFloat(item.avg_surprise),
          avg_trust: parseFloat(item.avg_trust)
        }));
        
        setWords(formattedWords);
      } catch (err) {
        console.error('Error fetching word cloud data:', err);
        setError('Failed to fetch word cloud data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWordCloudData();
  }, [searchParams]);

  // Render the component
  return (
    <Card>
      <Card.Body>
        <Card.Title>Emotion Word Cloud</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Words sized by frequency and colored by dominant emotion
        </Card.Subtitle>
        
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading word cloud data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : words.length === 0 ? (
          <Alert variant="info">No word data available. Try adjusting your search criteria.</Alert>
        ) : (
          <div style={{ height: '500px', width: '100%' }}>
            <ReactWordcloud words={words} options={options} callbacks={getCallbacks()} />
          </div>
        )}
        
        <div className="mt-3">
          <h6>Color Legend:</h6>
          <div className="d-flex flex-wrap">
            {Object.entries(emotionColors).map(([emotion, color]) => (
              <div key={emotion} className="me-3 mb-2">
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    marginRight: '5px',
                    verticalAlign: 'middle'
                  }}
                ></span>
                <span style={{ verticalAlign: 'middle' }}>{emotion}</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EmotionWordCloud; 