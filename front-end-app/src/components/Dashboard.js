import React, { useState } from 'react';
import { Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { FaChartPie, FaChartLine, FaTachometerAlt, FaInfoCircle } from 'react-icons/fa';
import AdvancedSearch from './AdvancedSearch';
import ComparisonView from './ComparisonView';
import '../styles/ComparisonView.css';

const Dashboard = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Utility function to ensure search parameters are properly formatted
  const sanitizeSearchParams = (params) => {
    if (!params) return null;
    
    // Create a copy to avoid mutating the original
    const sanitized = { ...params };
    
    // Convert empty strings to null for consistency
    if (sanitized.startDate === '') sanitized.startDate = null;
    if (sanitized.endDate === '') sanitized.endDate = null;
    
    // Ensure sources is always an array
    if (!sanitized.sources) sanitized.sources = [];
    
    // Ensure emotions is always a string
    if (!sanitized.emotions) sanitized.emotions = 'All';
    
    // Ensure label is provided
    if (!sanitized.label) sanitized.label = 'Unnamed Query';
    
    return sanitized;
  };

  // Helper function to prepare data for visualization components
  const prepareVisualizationData = (queries) => {
    if (!Array.isArray(queries)) {
      queries = [queries];
    }
    
    return queries.map(query => {
      const sanitized = sanitizeSearchParams(query);
      
      // Add additional properties that might be needed by visualizations
      return {
        ...sanitized,
        // Use empty arrays rather than null for collections
        sources: sanitized.sources || [],
        // Ensure we use consistent date formats
        startDate: sanitized.startDate || '',
        endDate: sanitized.endDate || '',
        // Provide a unique ID for each query
        queryId: `query-${Math.random().toString(36).substr(2, 9)}`
      };
    });
  };

  const handleSearch = (queries) => {
    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    
    // Simulate API delay for demo purposes
    setTimeout(() => {
      try {
        // Process and prepare data for visualizations
        const processedQueries = prepareVisualizationData(queries);
        setSearchResults(processedQueries);
        setLoading(false);
      } catch (err) {
        console.error('Error processing search:', err);
        setError('An error occurred while processing your search. Please try again.');
        setLoading(false);
      }
    }, 800); // Simulated delay to show loading state
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header text-center">
        <Container fluid>
          <Row className="justify-content-center">
            <Col xs={12} lg={10}>
              <h2 className="dashboard-title">
                <FaTachometerAlt className="me-2" /> Visual Analytics Dashboard
              </h2>
              <p className="dashboard-subtitle">
                Analyze and compare health-related social media trends, emotions, and topics across different sources and time periods.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
      
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} lg={12}>
            {/* Search Card with improved styling */}
            <Card className="search-card mb-3 shadow-sm">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaChartLine className="me-2" /> Advanced Search
                  </h5>
                  <div className="text-white small d-none d-md-block">
                    <FaInfoCircle className="me-1" /> Configure your visualization parameters
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <AdvancedSearch onSearch={handleSearch} />
              </Card.Body>
            </Card>
            
            {/* Error display */}
            {error && (
              <Alert variant="danger" className="mt-3 fade-in">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
              </Alert>
            )}
            
            {/* Loading indicator */}
            {loading ? (
              <div className="text-center p-4 fade-in bg-light rounded shadow-sm mb-3">
                <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-primary fw-bold">Processing your search request...</p>
                <p className="text-muted">This may take a few moments depending on the amount of data.</p>
                
                <div className="progress mt-3" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: '100%' }}
                    aria-valuenow="100" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            ) : searchPerformed && searchResults.length > 0 ? (
              <div className="slide-in">
                <ComparisonView searchResults={searchResults} />
              </div>
            ) : searchPerformed ? (
              <Alert variant="info" className="mt-3 fade-in">
                <Alert.Heading>No Results Found</Alert.Heading>
                <p>Please try adjusting your search criteria or selecting different data sources.</p>
              </Alert>
            ) : (
              <div className="text-center p-4 bg-light rounded shadow-sm mt-3">
                <FaChartPie size={40} className="text-secondary mb-3" />
                <h4>Ready to Visualize</h4>
                <p className="text-muted">
                  Configure your search parameters above and click "Search & Visualize" to get started.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard; 