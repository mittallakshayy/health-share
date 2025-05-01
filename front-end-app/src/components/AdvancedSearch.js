import React, { useState } from 'react';
import { Form, Button, ToggleButtonGroup, ToggleButton, Badge, ButtonGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const sourceOptions = [
  { value: 'Twitter', label: 'Twitter' },
  { value: 'CNN', label: 'CNN' },
  { value: 'Medium', label: 'Medium' },
];
const emotionOptions = ['All', 'Anger', 'Anticipation', 'Disgust', 'Fear', 'Joy', 'Sadness', 'Surprise', 'Trust'];

const AdvancedSearch = ({ onSearch }) => {
  const [selectedSources, setSelectedSources] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [aiInsights, setAiInsights] = useState(false);
  const [sentiment, setSentiment] = useState([]);
  const [emotion, setEmotion] = useState(['All']); // Default to 'All'

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const handleSourceChange = (options) => {
    setSelectedSources(options || []);
  };

  const handleSentimentChange = (value) => {
    setSentiment((prev) => 
      prev.includes(value) 
        ? prev.filter((s) => s !== value) 
        : [...prev, value]
    );
  };

  const handleEmotionChange = (value) => {
    if (value === 'All') {
      // If 'All' is selected, deselect all other options
      setEmotion(['All']);
    } else {
      // If any other emotion is selected, remove 'All' from the selection
      setEmotion((prev) => {
        const newEmotions = prev.includes(value)
          ? prev.filter((e) => e !== value)
          : [...prev.filter(e => e !== 'All'), value];
        
        // If no emotions are selected, default back to 'All'
        return newEmotions.length === 0 ? ['All'] : newEmotions;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format dates for API request
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    // Prepare search parameters
    const searchParams = {
      sources: selectedSources,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      sentiment: sentiment,
      emotions: emotion.join(',')
    };
    
    // Call the onSearch callback from parent
    if (onSearch) {
      onSearch(searchParams);
    }
  };

  return (
    <Form className="p-4" onSubmit={handleSubmit}>
      {/* Multiselect with Chips */}
      <div className="mb-3">
        <Form.Group controlId="source" className="mb-3">
          <Form.Label>Source</Form.Label>
          <Select
            isMulti
            options={sourceOptions}
            value={selectedSources}
            onChange={handleSourceChange}
            className="mt-1"
            classNamePrefix="react-select"
            placeholder="Select data sources"
          />
        </Form.Group>
      </div>

      {/* Date Picker */}
      <Form.Group controlId="dateRange" className="mb-3">
        <Form.Label>Date Range</Form.Label>
        <div className="d-flex align-items-center">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="form-control me-2"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            className="form-control"
          />
        </div>
      </Form.Group>

      {/* Toggle Button */}
      <Form.Group controlId="aiInsights" className="mb-3">
        <Form.Label>AI Insights</Form.Label>
        <Form.Check
          type="switch"
          label="Enable"
          checked={aiInsights}
          onChange={() => setAiInsights((prev) => !prev)}
        />
      </Form.Group>

      {/* Checkbox for Sentiment */}
      <Form.Group controlId="sentiment" className="mb-3">
        <Form.Label>Sentiment</Form.Label>
        <div>
          {['Positive', 'Negative', 'Neutral'].map((item) => (
            <Form.Check
              key={item}
              type="checkbox"
              inline
              label={item}
              value={item}
              checked={sentiment.includes(item)}
              onChange={() => handleSentimentChange(item)}
            />
          ))}
        </div>
      </Form.Group>

      {/* Pills Buttons for Emotions */}
      <Form.Group controlId="emotions" className="mb-3">
        <Form.Label>Emotions</Form.Label>
        <div>
          {emotionOptions.map((item) => (
            <Badge
              key={item}
              bg={emotion.includes(item) ? 'primary' : 'secondary'}
              onClick={() => handleEmotionChange(item)}
              className="me-2 p-2 cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              {item}
            </Badge>
          ))}
        </div>
      </Form.Group>

      {/* Search Button */}
      <div className="d-grid gap-2 mt-4">
        <Button variant="primary" type="submit">
          Search & Visualize
        </Button>
      </div>
    </Form>
  );
}; 

export default AdvancedSearch;
