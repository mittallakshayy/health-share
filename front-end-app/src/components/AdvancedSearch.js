import React, { useState } from 'react';
import { Form, Button, ToggleButtonGroup, ToggleButton, Badge, ButtonGroup, Tab, Tabs, Row, Col, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { FaPlus, FaTrash, FaSyncAlt, FaChartBar } from 'react-icons/fa';

const sourceOptions = [
  { value: 'Twitter', label: 'Twitter' },
  { value: 'CNN', label: 'CNN' },
  { value: 'Medium', label: 'Medium' },
];
const emotionOptions = ['All', 'Anger', 'Anticipation', 'Disgust', 'Fear', 'Joy', 'Sadness', 'Surprise', 'Trust'];

// Initial search query template
const initialSearchQuery = {
  selectedSources: [],
  startDate: null,
  endDate: null,
  aiInsights: false,
  emotion: ['All']
};

const AdvancedSearch = ({ onSearch }) => {
  const [comparisonMode, setComparisonMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQueries, setSearchQueries] = useState([
    {...initialSearchQuery, label: 'Query 1'}
  ]);

  const formatDate = (date) => {
    if (!date) return '';
    
    // Make sure we have a valid Date object
    if (!(date instanceof Date) || isNaN(date)) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }
    
    try {
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleSourceChange = (options, index) => {
    const newQueries = [...searchQueries];
    newQueries[index].selectedSources = options || [];
    setSearchQueries(newQueries);
  };

  const handleEmotionChange = (value, index) => {
    const newQueries = [...searchQueries];
    
    if (value === 'All') {
      // If 'All' is selected, deselect all other options
      newQueries[index].emotion = ['All'];
    } else {
      // If any other emotion is selected, remove 'All' from the selection
      newQueries[index].emotion = (newQueries[index].emotion || []).includes(value)
        ? newQueries[index].emotion.filter((e) => e !== value)
        : [...newQueries[index].emotion.filter(e => e !== 'All'), value];
      
      // If no emotions are selected, default back to 'All'
      if (newQueries[index].emotion.length === 0) {
        newQueries[index].emotion = ['All'];
      }
    }
    
    setSearchQueries(newQueries);
  };

  const handleDateChange = (date, field, index) => {
    const newQueries = [...searchQueries];
    newQueries[index][field] = date;
    setSearchQueries(newQueries);
  };

  const handleAiInsightsChange = (index) => {
    const newQueries = [...searchQueries];
    newQueries[index].aiInsights = !newQueries[index].aiInsights;
    setSearchQueries(newQueries);
  };

  const handleLabelChange = (e, index) => {
    const newQueries = [...searchQueries];
    newQueries[index].label = e.target.value;
    setSearchQueries(newQueries);
  };

  const addComparisonTab = () => {
    // Clone the current active tab's data for the new tab
    const currentTabData = searchQueries[activeTab];
    const newTabData = {
      ...JSON.parse(JSON.stringify(currentTabData)), // Deep clone to avoid reference issues
      label: `Query ${searchQueries.length + 1}`
    };
    
    setSearchQueries([...searchQueries, newTabData]);
    setActiveTab(searchQueries.length); // Switch to the new tab
  };

  const removeComparisonTab = (index) => {
    if (searchQueries.length <= 1) return; // Don't remove the last tab
    
    const newQueries = searchQueries.filter((_, i) => i !== index);
    setSearchQueries(newQueries);
    
    // If the active tab was removed or was after the removed tab, adjust it
    if (activeTab >= newQueries.length) {
      setActiveTab(newQueries.length - 1);
    } else if (activeTab === index) {
      setActiveTab(Math.max(0, index - 1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format all search queries for API request
    const formattedQueries = searchQueries.map(query => {
      // Ensure we have proper Date objects or null
      const startDate = query.startDate ? new Date(query.startDate) : null;
      const endDate = query.endDate ? new Date(query.endDate) : null;
      
      return {
        label: query.label,
        sources: query.selectedSources,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        aiInsights: query.aiInsights,
        emotions: query.emotion.join(',')
      };
    });
    
    // Call the onSearch callback with single query or multiple queries based on mode
    if (onSearch) {
      if (comparisonMode) {
        onSearch(formattedQueries);
      } else {
        onSearch(formattedQueries[0]);
      }
    }
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    
    // If turning off comparison mode, keep only the active tab
    if (comparisonMode) {
      const activeQuery = searchQueries[activeTab];
      setSearchQueries([activeQuery]);
      setActiveTab(0);
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Advanced Search</h5>
        <Form.Check
          type="switch"
          id="comparison-mode"
          label="Comparison Mode"
          checked={comparisonMode}
          onChange={toggleComparisonMode}
          className="text-white"
        />
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {comparisonMode ? (
            <>
              <div className="mb-3 d-flex align-items-center">
                <h6 className="mb-0 me-3">Comparison Queries</h6>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Add comparison query</Tooltip>}
                >
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={addComparisonTab} 
                    className="me-2"
                  >
                    <FaPlus /> Add Query
                  </Button>
                </OverlayTrigger>
              </div>
            
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(Number(k))}
                className="mb-4"
              >
                {searchQueries.map((query, index) => (
                  <Tab 
                    key={index} 
                    eventKey={index} 
                    title={
                      <div className="d-flex align-items-center">
                        <span className="me-2">{query.label}</span>
                        {index > 0 && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 text-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeComparisonTab(index);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    }
                  >
                    <Card className="border-0">
                      <Card.Body>
                        <Form.Group controlId={`queryLabel-${index}`} className="mb-3">
                          <Form.Label>Query Label</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter a descriptive label"
                            value={query.label}
                            onChange={(e) => handleLabelChange(e, index)}
                          />
                        </Form.Group>
                        
                        <SearchQueryForm 
                          query={query} 
                          index={index}
                          handleSourceChange={handleSourceChange}
                          handleEmotionChange={handleEmotionChange}
                          handleDateChange={handleDateChange}
                          handleAiInsightsChange={handleAiInsightsChange}
                        />
                      </Card.Body>
                    </Card>
                  </Tab>
                ))}
              </Tabs>
            </>
          ) : (
            <SearchQueryForm 
              query={searchQueries[0]} 
              index={0}
              handleSourceChange={handleSourceChange}
              handleEmotionChange={handleEmotionChange}
              handleDateChange={handleDateChange}
              handleAiInsightsChange={handleAiInsightsChange}
            />
          )}

          {/* Search Button */}
          <div className="d-grid gap-2 mt-4">
            <Button variant="primary" type="submit" className="d-flex align-items-center justify-content-center">
              <FaChartBar className="me-2" />
              {comparisonMode ? 'Compare & Visualize' : 'Search & Visualize'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

// Extracted form component for reuse
const SearchQueryForm = ({ 
  query, 
  index, 
  handleSourceChange, 
  handleEmotionChange, 
  handleDateChange, 
  handleAiInsightsChange 
}) => {
  return (
    <>
      <Form.Group controlId={`source-${index}`} className="mb-3">
        <Form.Label>Source</Form.Label>
        <Select
          isMulti
          options={sourceOptions}
          value={query.selectedSources}
          onChange={(options) => handleSourceChange(options, index)}
          className="mt-1"
          classNamePrefix="react-select"
          placeholder="Select data sources"
        />
      </Form.Group>

      <Form.Group controlId={`dateRange-${index}`} className="mb-3">
        <Form.Label>Date Range</Form.Label>
        <div className="d-flex align-items-center">
          <DatePicker
            selected={query.startDate}
            onChange={(date) => handleDateChange(date, 'startDate', index)}
            placeholderText="Start Date"
            className="form-control me-2"
          />
          <DatePicker
            selected={query.endDate}
            onChange={(date) => handleDateChange(date, 'endDate', index)}
            placeholderText="End Date"
            className="form-control"
          />
        </div>
      </Form.Group>

      <Form.Group controlId={`aiInsights-${index}`} className="mb-3">
        <Form.Label>AI Insights</Form.Label>
        <Form.Check
          type="switch"
          label="Enable"
          checked={query.aiInsights}
          onChange={() => handleAiInsightsChange(index)}
        />
      </Form.Group>

      <Form.Group controlId={`emotions-${index}`} className="mb-3">
        <Form.Label>Emotions</Form.Label>
        <div>
          {emotionOptions.map((item) => (
            <Badge
              key={item}
              bg={query.emotion.includes(item) ? 'primary' : 'secondary'}
              onClick={() => handleEmotionChange(item, index)}
              className="me-2 p-2 cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              {item}
            </Badge>
          ))}
        </div>
      </Form.Group>
    </>
  );
};

export default AdvancedSearch;