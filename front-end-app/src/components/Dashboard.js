import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
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
    <Container fluid className="mt-4 mb-5">
      <Row>
        <Col>
          <h2 className="mb-4">Visual Analytics Dashboard</h2>
          <p className="text-muted mb-4">
            Analyze and compare health-related social media trends, emotions, and topics across different sources and time periods.
          </p>
          
          <AdvancedSearch onSearch={handleSearch} />
          
          {error && (
            <Alert variant="danger" className="mt-4 fade-in">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          
          {loading ? (
            <div className="text-center p-5 fade-in">
              <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3 text-primary fw-bold">Processing your search request...</p>
              <p className="text-muted">This may take a few moments depending on the amount of data.</p>
            </div>
          ) : searchPerformed && searchResults.length > 0 ? (
            <ComparisonView searchResults={searchResults} />
          ) : searchPerformed ? (
            <Alert variant="info" className="mt-4 fade-in">
              <Alert.Heading>No Results Found</Alert.Heading>
              <p>Please try adjusting your search criteria or selecting different data sources.</p>
            </Alert>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 