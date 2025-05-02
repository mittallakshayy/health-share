import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Alert, Modal, Button, ListGroup, Row, Col } from 'react-bootstrap';
import * as d3 from 'd3';
import { emotionColors } from './emotionColors';

const EmotionPieChart = ({ searchParams }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [emotionTexts, setEmotionTexts] = useState([]);
  const [loadingTexts, setLoadingTexts] = useState(false);
  
  const svgRef = useRef();
  const containerRef = useRef();
  
  useEffect(() => {
    if (!searchParams) return;
    
    const fetchEmotionDistribution = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Construct URL with search parameters
        const queryParams = new URLSearchParams();
        
        if (searchParams.sources && searchParams.sources.length > 0) {
          queryParams.set('sources', searchParams.sources.map(s => s.value).join(','));
        }
        
        if (searchParams.startDate) {
          queryParams.set('startDate', searchParams.startDate);
        }
        
        if (searchParams.endDate) {
          queryParams.set('endDate', searchParams.endDate);
        }
        
        // Fix for emotion filter issue - only pass emotions if not 'All'
        if (searchParams.emotions && !searchParams.emotions.includes('All')) {
          queryParams.set('emotions', searchParams.emotions);
        }
        
        console.log("Emotion pie chart query params:", queryParams.toString());
        // Use the new endpoint for max emotion values
        const response = await fetch(`http://localhost:3003/healthshare/api/emotion-max-distribution?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Emotion distribution data:", result);
        
        setData(result.emotionData || []);
        setTotalCount(result.totalCount || 0);
      } catch (err) {
        console.error('Error fetching emotion distribution data:', err);
        setError('Failed to fetch emotion distribution data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmotionDistribution();
  }, [searchParams]);
  
  // Draw the pie chart whenever data changes
  useEffect(() => {
    if (data.length === 0 || !svgRef.current) return;
    
    // Clear any existing chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Remove existing tooltip if any
    d3.selectAll(".emotion-chart-tooltip").remove();
    
    // Set up dimensions - increased to accommodate external labels
    const width = 600;
    const height = 500;
    const radius = Math.min(width, height) / 2.5; // Reduced radius to leave more space for labels
    
    // Create SVG with explicit viewBox for better scaling
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Create tooltip div with improved styling
    const tooltip = d3.select('body') // Attach to body instead of container to avoid clipping
      .append('div')
      .attr('class', 'emotion-chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('box-shadow', '0 2px 12px rgba(0,0,0,0.15)')
      .style('z-index', '10000') // Higher z-index to ensure visibility
      .style('pointer-events', 'none')
      .style('min-width', '150px')
      .style('font-size', '14px')
      .style('opacity', '0')
      .style('transition', 'opacity 0.2s');
    
    // Create pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02);
    
    // Create arc generator
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius * 0.8);
    
    // Arc for label positioning
    const labelArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);
    
    // Generate the pie data
    const pieData = pie(data);
    
    // Function to get the correct color for each emotion (case-insensitive matching)
    const getEmotionColor = (emotionName) => {
      // Try exact match first
      if (emotionColors[emotionName]) return emotionColors[emotionName];
      
      // Try case-insensitive match
      const lowerName = emotionName.toLowerCase();
      const key = Object.keys(emotionColors).find(k => k.toLowerCase() === lowerName);
      
      return key ? emotionColors[key] : '#999999';
    };
    
    // Draw pie segments
    const arcs = svg.selectAll('.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');
    
    // Add path (pie slices) with explicit color mapping
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => getEmotionColor(d.data.name))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.9)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight segment
        d3.select(this)
          .style('opacity', 1)
          .attr('stroke', '#333')
          .style('stroke-width', '3px');
        
        // Show enhanced tooltip with more information
        tooltip
          .style('visibility', 'visible')
          .style('opacity', '1')
          .html(
            `<div style="font-weight: bold; margin-bottom: 5px; color: ${getEmotionColor(d.data.name)}">
              ${d.data.name}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Count:</span>
              <span><b>${d.data.value}</b></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Percentage:</span>
              <span><b>${d.data.percentage}%</b></span>
            </div>
            <div style="font-size: 12px; margin-top: 6px; color: #666;">
              Click to view texts
            </div>`
          )
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mouseout', function() {
        // Remove highlight
        d3.select(this)
          .style('opacity', 0.9)
          .attr('stroke', 'white')
          .style('stroke-width', '2px');
        
        // Hide tooltip
        tooltip
          .style('visibility', 'hidden')
          .style('opacity', '0');
      })
      .on('click', function(event, d) {
        fetchEmotionTexts(d.data.name);
      });
    
    // Add external labels for all segments
    const labelRadius = radius * 1.1; // Position labels outside the pie
    
    // Calculate label positions and sides (left/right)
    pieData.forEach((d, i) => {
      // Determine the angle at the center of the slice
      const angle = (d.startAngle + d.endAngle) / 2;
      
      // Determine if label should be on the left or right side
      const isRightSide = angle > Math.PI / 2 && angle < Math.PI * 3 / 2;
      
      // Calculate x position (make labels go further out)
      const labelX = Math.sin(angle) * labelRadius * 1.3; // Increased distance factor
      const labelY = -Math.cos(angle) * labelRadius * 1.1; // Negate because SVG Y is inverted
      
      // Calculate anchor point on the pie edge for the connector line
      const arcPoint = arc.centroid(d);
      
      // Add the connector line
      svg.append('line')
        .attr('x1', arcPoint[0])
        .attr('y1', arcPoint[1])
        .attr('x2', labelX * 0.9) // Adjust line end to not overlap with text
        .attr('y2', labelY)
        .attr('stroke', getEmotionColor(d.data.name))
        .attr('stroke-width', 1)
        .attr('opacity', 0.7);
      
      // Create a group for the label
      const labelGroup = svg.append('g')
        .attr('transform', `translate(${labelX}, ${labelY})`);
      
      // Add a white background to the text to improve readability
      labelGroup.append('rect')
        .attr('x', isRightSide ? 0 : -85)
        .attr('y', -10)
        .attr('width', 85)
        .attr('height', 30)
        .attr('fill', 'white')
        .attr('opacity', 0.7)
        .attr('rx', 3);
      
      // Add the emotion name text
      labelGroup.append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', isRightSide ? 'start' : 'end')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .style('fill', getEmotionColor(d.data.name))
        .text(d.data.name);
      
      // Add the percentage text below the name
      labelGroup.append('text')
        .attr('dy', '1.5em')
        .attr('text-anchor', isRightSide ? 'start' : 'end')
        .attr('font-size', '10px')
        .style('fill', '#333')
        .text(`${d.data.percentage}% (${d.data.value})`);
    });
    
  }, [data]);
  
  // Function to fetch all texts for a specific emotion
  const fetchEmotionTexts = async (emotionName) => {
    setLoadingTexts(true);
    setSelectedEmotion({ name: emotionName });
    setShowModal(true);
    
    try {
      // Construct URL with search parameters
      const queryParams = new URLSearchParams();
      
      if (searchParams.sources && searchParams.sources.length > 0) {
        queryParams.set('sources', searchParams.sources.map(s => s.value).join(','));
      }
      
      if (searchParams.startDate) {
        queryParams.set('startDate', searchParams.startDate);
      }
      
      if (searchParams.endDate) {
        queryParams.set('endDate', searchParams.endDate);
      }
      
      // Use the emotion name for fetching texts
      queryParams.set('emotion', emotionName);
      
      // Since our backend still uses dominant_emotion for the texts endpoint, we may need a new endpoint
      // For now, we'll use the sample texts directly from our data to display in the modal
      const matchingEmotionData = data.find(item => item.name === emotionName);
      
      if (matchingEmotionData && matchingEmotionData.sampleTexts) {
        setEmotionTexts(matchingEmotionData.sampleTexts);
        setSelectedEmotion({
          name: emotionName,
          value: matchingEmotionData.value,
          emotionAvgs: matchingEmotionData.emotionAvgs
        });
        setLoadingTexts(false);
      } else {
        // Fallback to API if no sample texts in our data
        const response = await fetch(`http://localhost:3003/healthshare/api/emotion-texts?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        setEmotionTexts(result.texts || []);
        setSelectedEmotion({
          name: emotionName,
          value: result.texts.length
        });
      }
    } catch (err) {
      console.error('Error fetching emotion texts:', err);
      setEmotionTexts([]);
    } finally {
      setLoadingTexts(false);
    }
  };
  
  // Render the color legend with counts and percentages
  const renderColorLegend = () => {
    // Sort data by percentage for better display
    const sortedData = [...data].sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    
    return (
      <div className="mt-4">
        <h6 className="mb-3">Emotion Distribution:</h6>
        <Row className="g-2">
          {sortedData.map((item) => (
            <Col key={item.name} xs={12} sm={6} md={4} className="mb-2">
              <div 
                className="d-flex align-items-center p-2 border rounded"
                style={{ 
                  cursor: 'pointer',
                  borderLeft: `5px solid ${emotionColors[item.name] || '#999999'}`
                }}
                onClick={() => fetchEmotionTexts(item.name)}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    backgroundColor: emotionColors[item.name] || '#999999',
                    borderRadius: '3px',
                    marginRight: '8px',
                    border: '1px solid #ddd'
                  }}
                ></span>
                <div>
                  <div><strong>{item.name}</strong></div>
                  <div className="small text-muted">
                    {item.value} texts ({item.percentage}%)
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  // Clean up tooltip on unmount
  useEffect(() => {
    return () => {
      d3.selectAll(".emotion-chart-tooltip").remove();
    };
  }, []);
  
  return (
    <Card>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <div>Emotion Distribution</div>
          {totalCount > 0 && (
            <span className="badge bg-primary fs-6">{totalCount} records</span>
          )}
        </Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          Showing distribution of dominant emotions across all texts
        </Card.Subtitle>
        
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading emotion distribution data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : data.length === 0 ? (
          <Alert variant="info">No emotion data available. Try adjusting your search criteria.</Alert>
        ) : (
          <>
            <div className="d-flex justify-content-center mb-3">
              <div 
                ref={containerRef} 
                className="position-relative" 
                style={{ 
                  width: '100%', 
                  maxWidth: '750px',
                  height: '500px',
                  margin: '0 auto'
                }}
              >
                <svg 
                  ref={svgRef} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'block'
                  }}
                ></svg>
              </div>
            </div>
            
            {/* Color Legend */}
            {renderColorLegend()}
          </>
        )}
        
        <div className="mt-3">
          <Card.Text className="text-center fs-6">
            Click on pie sections to view all texts with that emotion. 
            Hover for more details.
          </Card.Text>
        </div>
      </Card.Body>
      
      {/* Modal to display texts for selected emotion */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ 
          backgroundColor: selectedEmotion ? emotionColors[selectedEmotion.name] || '#999999' : '#fff', 
          color: selectedEmotion && ['Joy', 'Anticipation'].includes(selectedEmotion.name) ? 'black' : 'white' 
        }}>
          <Modal.Title>
            {selectedEmotion?.name} Texts {selectedEmotion?.value && `(${selectedEmotion.value} records)`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {loadingTexts ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" />
              <p>Loading texts...</p>
            </div>
          ) : emotionTexts.length > 0 ? (
            <>
              {selectedEmotion?.emotionAvgs && (
                <div className="mb-3 p-3 border rounded bg-light">
                  <h6>Average Emotion Values:</h6>
                  <div className="d-flex flex-wrap">
                    {Object.entries(selectedEmotion.emotionAvgs)
                      .filter(([key]) => key !== 'count')
                      .sort(([,a], [,b]) => b - a)
                      .map(([emotion, value]) => (
                        <div key={emotion} className="me-3 mb-1">
                          <strong>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}:</strong> {value.toFixed(2)}
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              <ListGroup>
                {emotionTexts.map((item, index) => (
                  <ListGroup.Item key={item.id || index} className="mb-2">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <small className="text-muted">
                        {new Date(item.created_at).toLocaleString()}
                      </small>
                      <span className="badge" style={{ 
                        backgroundColor: selectedEmotion ? emotionColors[selectedEmotion.name] || '#999999' : '#999999',
                        color: selectedEmotion && ['Joy', 'Anticipation'].includes(selectedEmotion.name) ? 'black' : 'white'
                      }}>
                        {selectedEmotion?.name}
                      </span>
                    </div>
                    <p className="mb-0">{item.text}</p>
                    {item.emotions && (
                      <div className="mt-2 small">
                        <div className="fw-bold">Emotion Values:</div>
                        <div className="d-flex flex-wrap">
                          {Object.entries(item.emotions)
                            .sort(([,a], [,b]) => b - a)
                            .map(([emotion, value]) => (
                              <div key={emotion} className="me-2" style={{
                                color: value > 0.5 ? emotionColors[emotion.charAt(0).toUpperCase() + emotion.slice(1)] : 'inherit'
                              }}>
                                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}: {value.toFixed(2)}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <p className="text-center py-3">No texts available for this emotion.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default EmotionPieChart; 