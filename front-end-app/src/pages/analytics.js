import React, { useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

const Analytics = () => {
  // Update document title when component mounts
  useEffect(() => {
    document.title = 'HealthShare - Visual Analytics';
  }, []);

  return (
    <>
      <Helmet>
        <title>HealthShare - Visual Analytics</title>
        <meta name="description" content="Analyze and visualize health-related social media trends, emotions, and topics with interactive dashboards." />
      </Helmet>
      <Container fluid className="p-0">
        <Dashboard />
      </Container>
    </>
  );
};

export default Analytics;
