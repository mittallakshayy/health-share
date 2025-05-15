import React, { useState, useEffect, useCallback } from 'react';
import ReactWordcloud from 'react-wordcloud';
import { Card, Spinner, Alert, Badge } from 'react-bootstrap';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { emotionColors } from './emotionColors';
import API_URL from "../../apis/api";


const EmotionWordCloud = ({ searchParams }) => {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordCount, setRecordCount] = useState(0);

  // Get the highest emotion and its value for a word
  const getHighestEmotion = (word) => {
    const emotions = [
      { name: 'Anger', value: word.avg_anger },
      { name: 'Anticipation', value: word.avg_anticipation },
      { name: 'Disgust', value: word.avg_disgust },
      { name: 'Fear', value: word.avg_fear },
      { name: 'Joy', value: word.avg_joy },
      { name: 'Sadness', value: word.avg_sadness },
      { name: 'Surprise', value: word.avg_surprise },
      { name: 'Trust', value: word.avg_trust }
    ];
    
    // Sort by value in descending order
    emotions.sort((a, b) => b.value - a.value);
    
    // Return the highest emotion
    return emotions[0];
  };

  // Function to get color for a word based on its highest emotion
  const getWordColor = useCallback((word) => {
    if (!word.highest_emotion) return '#999999';
    return emotionColors[word.highest_emotion] || '#999999';
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
    tooltipOptions: {
      allowHTML: true,
      animation: 'scale',
      theme: 'light',
      arrow: true,
      placement: 'top',
      maxWidth: 300,
    },
  };

  // Callbacks for the word cloud
  const callbacks = {
    getWordColor: getWordColor,
    getWordTooltip: word => 
      `<div style="text-align: left;">
        <strong>${word.text}</strong> (${word.value} occurrences)<br>
        <strong>Highest Emotion:</strong> ${word.highest_emotion}<br>
        <strong>Emotion Percentages:</strong><br>
        ${getEmotionPercentages(word)}
      </div>`,
  };

  useEffect(() => {
    if (!searchParams) return;
    
    const fetchWordCloudData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Construct URL with search parameters
        const queryParams = new URLSearchParams();
        
        if (searchParams.sources && searchParams.sources.length > 0) {
          queryParams.set('sources', searchParams.sources.map(s => s.value).join(','));
        }
        
        if (searchParams.startDate) {
          queryParams.set('startDate', searchParams.startDate);
        }
        
        if (searchParams.endDate) {
          queryParams.set('endDate', searchParams.endDate);
        }
        
        // Updated emotion handling to be consistent with other components
        if (searchParams.emotions) {
          // Ensure emotions is a string and filter out 'All'
          const emotions = Array.isArray(searchParams.emotions) 
            ? searchParams.emotions.join(',') 
            : searchParams.emotions;
            
          if (emotions && !emotions.includes('All')) {
            queryParams.set('emotions', emotions);
          }
        }
        
        console.log("Query params:", queryParams.toString());
        const response = await fetch(`${API_URL}/healthshare/api/wordcloud-data?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log("API Response:", responseData);
        
        const data = responseData.words || [];
        setRecordCount(responseData.totalRecords || 0);
        
        // Format the data for react-wordcloud and calculate highest emotion
        const formattedWords = data.map(item => {
          const wordData = {
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
          };
          
          // Calculate the highest emotion
          const highestEmotion = getHighestEmotion(wordData);
          wordData.highest_emotion = highestEmotion.name;
          wordData.highest_emotion_value = highestEmotion.value;
          
          return wordData;
        });
        
        console.log("Formatted words with highest emotion:", formattedWords);
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
        <Card.Title className="d-flex justify-content-between align-items-center">
          <div>Emotion Word Cloud</div>
          {recordCount > 0 && (
            <Badge bg="primary" className="fs-6">
              {recordCount} records found
            </Badge>
          )}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Words sized by frequency and colored by highest emotion intensity
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
            <ReactWordcloud words={words} options={options} callbacks={callbacks} />
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