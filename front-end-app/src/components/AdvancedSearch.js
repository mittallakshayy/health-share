import React, { useState } from 'react';
import { Form, Button, Badge, Tab, Tabs, Row, Col, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Select from 'react-select';
import { FaPlus, FaTrash, FaChartBar, FaCalendarAlt, FaDatabase, FaSmile, FaTag, FaRobot, FaInfoCircle } from 'react-icons/fa';
import DateRangeTimeline from './DateRangeTimeline';
import '../styles/DateRangeTimeline.css';

const sourceOptions = [
  { value: 'Twitter', label: 'Twitter' },
  { value: 'CNN', label: 'CNN' },
  { value: 'Medium', label: 'Medium' },
];
const emotionOptions = ['All', 'Anger', 'Anticipation', 'Disgust', 'Fear', 'Joy', 'Sadness', 'Surprise', 'Trust'];

// Custom styling for react-select
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#58afe2' : provided.borderColor,
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(88, 175, 226, 0.25)' : provided.boxShadow,
    '&:hover': {
      borderColor: state.isFocused ? '#58afe2' : '#ced4da',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e9f4fb',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#1e88e5',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#1e88e5',
    '&:hover': {
      backgroundColor: '#58afe2',
      color: 'white',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#58afe2' 
      : state.isFocused 
        ? '#e9f4fb' 
        : provided.backgroundColor,
    color: state.isSelected ? 'white' : provided.color,
    '&:active': {
      backgroundColor: '#58afe2',
      color: 'white'
    }
  }),
};

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
    <Form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="comparison-mode"
            checked={comparisonMode}
            onChange={toggleComparisonMode}
          />
          <label className="form-check-label ms-2" htmlFor="comparison-mode">
            <span className="fw-medium">Comparison Mode</span>
            {comparisonMode && <span className="text-muted ms-2">(Compare multiple queries side by side)</span>}
          </label>
        </div>
      </div>
      
      {comparisonMode ? (
        <>
          <div className="mb-3 d-flex align-items-center">
            <h6 className="mb-0 me-3 d-flex align-items-center">
              <FaDatabase className="me-2" />
              Comparison Queries
            </h6>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Add new comparison query</Tooltip>}
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
            className="mb-4 comparison-tabs"
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
                <Card className="border-0 shadow-sm rounded">
                  <Card.Body className="p-4">
                    <Form.Group controlId={`queryLabel-${index}`} className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FaTag className="me-2" /> Query Label
                      </Form.Label>
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
        <Button 
          variant="primary" 
          type="submit" 
          className="d-flex align-items-center justify-content-center py-2"
          size="lg"
        >
          <FaChartBar className="me-2" />
          {comparisonMode ? 'Compare & Visualize' : 'Search & Visualize'}
        </Button>
      </div>
    </Form>
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
    <Row>
      <Col md={6}>
        <Form.Group controlId={`source-${index}`} className="mb-3">
          <Form.Label className="d-flex align-items-center">
            <FaDatabase className="me-2" /> Data Source
          </Form.Label>
          <Select
            isMulti
            options={sourceOptions}
            value={query.selectedSources}
            onChange={(options) => handleSourceChange(options, index)}
            className="mt-1"
            classNamePrefix="react-select"
            placeholder="Select data sources"
            styles={selectStyles}
          />
          <Form.Text className="text-muted">
            Select one or more data sources to analyze
          </Form.Text>
        </Form.Group>

        <Form.Group controlId={`dateRange-${index}`} className="mb-3">
          <Form.Label className="d-flex align-items-center">
            <FaCalendarAlt className="me-2" /> Date Range
          </Form.Label>
          <DateRangeTimeline
            startDate={query.startDate}
            endDate={query.endDate}
            onStartDateChange={(date) => handleDateChange(date, 'startDate', index)}
            onEndDateChange={(date) => handleDateChange(date, 'endDate', index)}
          />
          <Form.Text className="text-muted mt-2">
            Drag the markers to adjust the date range or use the inputs for precise selection
          </Form.Text>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group controlId={`aiInsights-${index}`} className="mb-3">
          <Form.Label className="d-flex align-items-center">
            <FaRobot className="me-2" /> AI Insights
          </Form.Label>
          <div className="d-flex align-items-center">
            <Form.Check
              type="switch"
              label="Enable AI-powered analysis"
              checked={query.aiInsights}
              onChange={() => handleAiInsightsChange(index)}
              className="mb-0"
            />
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip>
                  AI Insights uses machine learning algorithms to identify patterns and anomalies in the data
                </Tooltip>
              }
            >
              <FaInfoCircle className="ms-2 text-muted" style={{ cursor: 'pointer' }} />
            </OverlayTrigger>
          </div>
          <Form.Text className="text-muted">
            Get deeper insights with AI-powered analysis
          </Form.Text>
        </Form.Group>

        <Form.Group controlId={`emotions-${index}`} className="mb-3">
          <Form.Label className="d-flex align-items-center">
            <FaSmile className="me-2" /> Emotions
          </Form.Label>
          <div className="emotion-badges-container">
            {emotionOptions.map((item) => {
              const isSelected = query.emotion.includes(item);
              const badgeVariant = isSelected ? "primary" : "light";
              
              return (
                <Badge
                  key={item}
                  bg={badgeVariant}
                  className={`emotion-badge ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleEmotionChange(item, index)}
                  pill
                >
                  {item}
                </Badge>
              );
            })}
          </div>
          <Form.Text className="text-muted">
            Select emotions to analyze in the data
          </Form.Text>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default AdvancedSearch;