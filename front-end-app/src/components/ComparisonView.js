import React from 'react';
import { Container, Row, Col, Card, Badge, Tabs, Tab } from 'react-bootstrap';
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
  // Guard against empty results
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  // For single result, render normal view
  if (searchResults.length === 1) {
    return (
      <Container fluid className="mb-5 fade-in">
        <Row className="mb-4">
          <Col xs={12} xl={6} className="mb-4">
            <EmotionPieChart searchParams={searchResults[0]} />
          </Col>
          <Col xs={12} xl={6} className="mb-4">
            <EmotionWordCloud searchParams={searchResults[0]} />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col xs={12} xl={6} className="mb-4">
            <EmotionSpiderWheel searchParams={searchResults[0]} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <EmotionTimeline searchParams={searchResults[0]} />
          </Col>
        </Row>
      </Container>
    );
  }

  // For multiple results, render comparison view
  return (
    <Container fluid className="mb-5 fade-in">
      {/* Top Section: PieChart and WordCloud side by side */}
      <div className="comparison-section">
        <h4 className="comparison-section-title">Emotion Distribution Comparison</h4>
        <Row className="g-4">
          {searchResults.map((result, index) => (
            <Col key={`pie-${index}`} xs={12} md={6} lg={4} xl={3} className="mb-4">
              <div className="comparison-card-wrapper">
                <Card className="comparison-card">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{result.label || `Query ${index + 1}`}</h5>
                  </Card.Header>
                  <Card.Body className="pie-chart-container">
                    <EmotionPieChart searchParams={result} />
                  </Card.Body>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="comparison-section">
        <h4 className="comparison-section-title">Word Cloud Comparison</h4>
        <Row className="g-4">
          {searchResults.map((result, index) => (
            <Col key={`word-${index}`} xs={12} md={6} lg={4} xl={3} className="mb-4">
              <div className="comparison-card-wrapper">
                <Card className="comparison-card">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{result.label || `Query ${index + 1}`}</h5>
                  </Card.Header>
                  <Card.Body className="word-cloud-container">
                    <EmotionWordCloud searchParams={result} />
                  </Card.Body>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="comparison-section">
        <h4 className="comparison-section-title">Emotion Spider Wheel Comparison</h4>
        <Row className="g-4">
          {searchResults.map((result, index) => (
            <Col key={`spider-${index}`} xs={12} md={6} lg={4} xl={3} className="mb-4">
              <div className="comparison-card-wrapper">
                <Card className="comparison-card">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{result.label || `Query ${index + 1}`}</h5>
                  </Card.Header>
                  <Card.Body className="spider-wheel-container">
                    <EmotionSpiderWheel searchParams={result} />
                  </Card.Body>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>
      
      {/* Full Width: Timeline charts stacked vertically */}
      <div className="comparison-section">
        <h4 className="comparison-section-title">Emotion Timeline Comparison</h4>
        <Row className="g-4">
          {searchResults.map((result, index) => (
            <Col key={`timeline-${index}`} xs={12} className="mb-4">
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
    </Container>
  );
};

export default ComparisonView; 