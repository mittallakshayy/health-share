import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaChartPie, FaCloud, FaSpider, FaChartLine } from 'react-icons/fa';
import EmotionPieChart from './visualizations/EmotionPieChart';
import EmotionWordCloud from './visualizations/EmotionWordCloud';
import EmotionSpiderWheel from './visualizations/EmotionSpiderWheel';
import EmotionTimeline from './visualizations/EmotionTimeline';
import '../styles/ComparisonView.css';

/**
 * ComparisonView component for displaying side-by-side visualizations
 * @param {Array} searchResults - Array of search params for each comparison
 */
const ComparisonView = ({ searchResults }) => {
  const [activeVisualization, setActiveVisualization] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Guard against empty results
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  // Calculate column size based on number of results
  const getColSize = (count) => {
    if (count === 1) return { xs: 12, md: 12 };
    if (count === 2) return { xs: 12, md: 6 };
    if (count === 3) return { xs: 12, md: 6, lg: 4 };
    return { xs: 12, md: 6, lg: 4, xl: 3 };
  };

  // For single result, render optimized layout
  if (searchResults.length === 1) {
    return (
      <Container fluid className="mb-4 p-0 fade-in">
        <Row className="g-3">
          <Col lg={6} xs={12} className="mb-3">
            <Card className="comparison-card h-100">
              <Card.Header className="bg-primary text-white">
                <FaChartPie className="me-2" /> Emotion Distribution
              </Card.Header>
              <Card.Body className="pie-chart-container">
                <EmotionPieChart searchParams={searchResults[0]} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} xs={12} className="mb-3">
            <Card className="comparison-card h-100">
              <Card.Header className="bg-primary text-white">
                <FaCloud className="me-2" /> Word Cloud
              </Card.Header>
              <Card.Body className="word-cloud-container">
                <EmotionWordCloud searchParams={searchResults[0]} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} xs={12} className="mb-3">
            <Card className="comparison-card h-100">
              <Card.Header className="bg-primary text-white">
                <FaSpider className="me-2" /> Emotion Spider Wheel
              </Card.Header>
              <Card.Body className="spider-wheel-container">
                <EmotionSpiderWheel searchParams={searchResults[0]} />
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} className="mb-3">
            <Card className="comparison-card">
              <Card.Header className="bg-primary text-white">
                <FaChartLine className="me-2" /> Emotion Timeline
              </Card.Header>
              <Card.Body className="timeline-container">
                <EmotionTimeline searchParams={searchResults[0]} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // For mobile devices, show visualization selector
  const showMobileSelector = windowWidth < 768 && searchResults.length > 1;
  const colSize = getColSize(searchResults.length);

  // For multiple results, render comparison view
  return (
    <Container fluid className="mb-4 p-0 fade-in">
      {/* Mobile-friendly visualization selector */}
      {showMobileSelector && (
        <div className="mb-3">
          <Alert variant="info" className="py-2 px-3 d-md-none">
            <p className="mb-2 small"><strong>Tip:</strong> Select which visualization to view:</p>
            <div className="d-flex justify-content-between mt-2">
              <button 
                className={`viz-selector-btn ${activeVisualization === 'pie' || !activeVisualization ? 'active' : ''}`} 
                onClick={() => setActiveVisualization('pie')}
                aria-label="Show pie charts"
              >
                <FaChartPie size={18} />
                <span>Distribution</span>
              </button>
              <button 
                className={`viz-selector-btn ${activeVisualization === 'word' ? 'active' : ''}`} 
                onClick={() => setActiveVisualization('word')}
                aria-label="Show word clouds"
              >
                <FaCloud size={18} />
                <span>Word Cloud</span>
              </button>
              <button 
                className={`viz-selector-btn ${activeVisualization === 'spider' ? 'active' : ''}`} 
                onClick={() => setActiveVisualization('spider')}
                aria-label="Show spider wheels"
              >
                <FaSpider size={18} />
                <span>Spider</span>
              </button>
              <button 
                className={`viz-selector-btn ${activeVisualization === 'timeline' ? 'active' : ''}`} 
                onClick={() => setActiveVisualization('timeline')}
                aria-label="Show timelines"
              >
                <FaChartLine size={18} />
                <span>Timeline</span>
              </button>
            </div>
          </Alert>
        </div>
      )}

      {/* Optimized Grid Layout */}
      {(!showMobileSelector || activeVisualization === 'pie' || !activeVisualization) && (
        <div className="comparison-section">
          <h4 className="comparison-section-title">
            <FaChartPie className="me-2" /> Emotion Distribution Comparison
          </h4>
          <Row className="g-3">
            {searchResults.map((result, index) => (
              <Col key={`pie-${index}`} {...colSize} className="mb-3">
                <Card className="comparison-card h-100">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{result.label || `Query ${index + 1}`}</h5>
                  </Card.Header>
                  <Card.Body className="pie-chart-container">
                    <EmotionPieChart searchParams={result} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {(!showMobileSelector || activeVisualization === 'word') && (
        <div className="comparison-section">
          <h4 className="comparison-section-title">
            <FaCloud className="me-2" /> Word Cloud Comparison
          </h4>
          <Row className="g-3">
            {searchResults.map((result, index) => (
              <Col key={`word-${index}`} {...colSize} className="mb-3">
                <Card className="comparison-card h-100">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{result.label || `Query ${index + 1}`}</h5>
                  </Card.Header>
                  <Card.Body className="word-cloud-container">
                    <EmotionWordCloud searchParams={result} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {(!showMobileSelector || activeVisualization === 'spider') && (
        <div className="comparison-section">
          <h4 className="comparison-section-title">
            <FaSpider className="me-2" /> Emotion Spider Wheel Comparison
          </h4>
          <Row className="g-3">
            {searchResults.map((result, index) => (
              <Col key={`spider-${index}`} {...colSize} className="mb-3">
                <Card className="comparison-card h-100">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{result.label || `Query ${index + 1}`}</h5>
                  </Card.Header>
                  <Card.Body className="spider-wheel-container">
                    <EmotionSpiderWheel searchParams={result} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
      
      {/* Full Width: Timeline charts stacked vertically */}
      {(!showMobileSelector || activeVisualization === 'timeline') && (
        <div className="comparison-section">
          <h4 className="comparison-section-title">
            <FaChartLine className="me-2" /> Emotion Timeline Comparison
          </h4>
          <Row className="g-3">
            {searchResults.map((result, index) => (
              <Col key={`timeline-${index}`} xs={12} className="mb-3">
                <Card className="comparison-card">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{result.label || `Query ${index + 1}`}</h5>
                  </Card.Header>
                  <Card.Body className="timeline-container">
                    <EmotionTimeline searchParams={result} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default ComparisonView; 