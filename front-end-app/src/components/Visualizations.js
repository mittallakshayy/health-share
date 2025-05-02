import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import EmotionWordCloud from './visualizations/EmotionWordCloud';
import EmotionPieChart from './visualizations/EmotionPieChart';
import EmotionTimeline from './visualizations/EmotionTimeline';
import EmotionSpiderWheel from './visualizations/EmotionSpiderWheel';
import AdvancedSearch from './AdvancedSearch';

const Visualizations = () => {
  const [activeTab, setActiveTab] = useState('wordcloud');
  const [searchParams, setSearchParams] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle search parameters from the AdvancedSearch component
  const handleSearch = (params) => {
    setSearchParams(params);
    setIsLoading(true);
    
    // Reset error state
    setError(null);
    
    // Here we would fetch the data for visualizations based on search params
    const fetchData = async () => {
      try {
        // In a real implementation, this would use the params to construct the API request
        const response = await fetch(`http://localhost:3003/healthshare/api/emotion-visualization?${new URLSearchParams(params)}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
      } catch (err) {
        console.error('Error fetching visualization data:', err);
        setError('Failed to fetch visualization data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  };
  
  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Advanced Search</Card.Title>
              <AdvancedSearch onSearch={handleSearch} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Nav variant="tabs" defaultActiveKey="wordcloud">
                <Nav.Item>
                  <Nav.Link 
                    eventKey="wordcloud" 
                    onClick={() => setActiveTab('wordcloud')}
                  >
                    Emotion Word Cloud
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="emotiontrend" 
                    onClick={() => setActiveTab('emotiontrend')}
                  >
                    Emotion Distribution
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="emotiontimeline" 
                    onClick={() => setActiveTab('emotiontimeline')}
                  >
                    Emotion Timeline
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="emotionspiderwheel" 
                    onClick={() => setActiveTab('emotionspiderwheel')}
                  >
                    Emotion Spider Wheel
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center p-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading visualization data...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : !searchParams ? (
                <div className="text-center p-5">
                  <p>Use the search form above to visualize data</p>
                </div>
              ) : (
                <div>
                  {activeTab === 'wordcloud' && <EmotionWordCloud searchParams={searchParams} />}
                  {activeTab === 'emotiontrend' && <EmotionPieChart searchParams={searchParams} />}
                  {activeTab === 'emotiontimeline' && <EmotionTimeline searchParams={searchParams} />}
                  {activeTab === 'emotionspiderwheel' && <EmotionSpiderWheel searchParams={searchParams} />}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Visualizations; 