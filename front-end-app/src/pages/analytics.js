import React, { useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { Container } from 'react-bootstrap';

const Analytics = () => {
  // Update document title when component mounts
  useEffect(() => {
    document.title = 'HealthShare - Visual Analytics';
  }, []);

  return (
    <Container fluid className="py-4">
      <Dashboard />
    </Container>
  );
};

export default Analytics;
