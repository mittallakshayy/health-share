import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Alert, Badge, Modal, Button } from 'react-bootstrap';
import * as d3 from 'd3';
import { emotionColors } from './emotionColors';

const EmotionSpiderWheel = ({ searchParams }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    emotions: [],
    dominantCounts: {},
    presentCounts: {},
    totalCount: 0
  });
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const svgRef = useRef();
  const tooltipRef = useRef();
  const legendRef = useRef();
  
  useEffect(() => {
    if (!searchParams) return;
    
    const fetchEmotionSpiderData = async () => {
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
        
        console.log("Emotion spider query params:", queryParams.toString());
        const response = await fetch(`http://localhost:3003/healthshare/api/emotion-spider?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Emotion spider data:", result);
        
        setData(result);
      } catch (err) {
        console.error('Error fetching emotion spider data:', err);
        setError('Failed to fetch emotion spider data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmotionSpiderData();
  }, [searchParams]);
  
  // Handle clicking on emotion point
  const handleEmotionClick = (emotion, dominantCount, dominantPercentage, presenceCount, presencePercentage) => {
    setSelectedEmotion({
      name: emotion,
      dominantCount,
      dominantPercentage,
      presenceCount,
      presencePercentage,
      color: emotionColors[emotion]
    });
    setShowModal(true);
  };
  
  // Draw the spider chart whenever data changes
  useEffect(() => {
    if (!svgRef.current || data.emotions.length === 0) return;
    
    // Clear any existing chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    try {
      const emotions = data.emotions;
      const dominantCounts = data.dominantCounts;
      const presentCounts = data.presentCounts;
      const totalCount = data.totalCount;
      
      // Set up dimensions
      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const width = 600 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;
      const radius = Math.min(width, height) / 2;
      
      // Create SVG
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);
      
      // Calculate percentages for dominant counts
      const dominantPercentages = {};
      emotions.forEach(emotion => {
        dominantPercentages[emotion] = dominantCounts[emotion] 
          ? (dominantCounts[emotion] / totalCount * 100) 
          : 0;
      });
      
      // Set up scales
      // Find the maximum value for scaling
      const maxDominantPercentage = Math.max(...emotions.map(emotion => dominantPercentages[emotion] || 0));
      const maxPresencePercentage = Math.max(...emotions.map(emotion => parseFloat(presentCounts[emotion]?.percentage || 0)));
      
      // Create angle scale (for the radar vertices)
      const angleScale = d3.scaleLinear()
        .domain([0, emotions.length])
        .range([0, 2 * Math.PI]);
      
      // Create radius scales (using percentages now)
      const dominantScale = d3.scaleLinear()
        .domain([0, Math.max(maxDominantPercentage, 5)]) // Ensure minimum scale for visibility
        .range([0, radius]);
      
      const presenceScale = d3.scaleLinear()
        .domain([0, Math.max(maxPresencePercentage, 5)]) // Ensure minimum scale for visibility
        .range([0, radius]);
      
      // Add tooltip div
      const tooltip = d3.select(tooltipRef.current)
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('padding', '10px')
        .style('box-shadow', '0 2px 12px rgba(0,0,0,0.15)')
        .style('z-index', '10000')
        .style('pointer-events', 'none')
        .style('min-width', '180px')
        .style('font-size', '14px')
        .style('opacity', '0')
        .style('transition', 'opacity 0.2s');
      
      // Add circles for the grid
      const circles = [1, 0.75, 0.5, 0.25];
      circles.forEach(percentage => {
        svg.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', radius * percentage)
          .attr('fill', 'none')
          .attr('stroke', '#ccc')
          .attr('stroke-dasharray', '4,4')
          .attr('stroke-width', 1);
        
        // Add labels for scales on vertical axis
        if (percentage < 1) {
          svg.append('text')
            .attr('x', 5)
            .attr('y', -radius * percentage)
            .attr('dy', '0.3em')
            .style('font-size', '10px')
            .style('fill', '#666')
            .text(`${Math.round(maxDominantPercentage * percentage)}%`); // Now showing percentages
        }
      });
      
      // Add axis lines for each emotion
      emotions.forEach((emotion, i) => {
        const angle = angleScale(i);
        const x = radius * Math.sin(angle);
        const y = -radius * Math.cos(angle);
        
        // Draw axis line
        svg.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1);
        
        // Add emotion labels
        svg.append('text')
          .attr('x', 1.1 * x)
          .attr('y', 1.1 * y)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .style('fill', emotionColors[emotion])
          .text(emotion);
        
        // Add interaction points for emotions
        const dominantCount = dominantCounts[emotion] || 0;
        const dominantPercentage = dominantPercentages[emotion] || 0;
        const dominantRadius = dominantScale(dominantPercentage);
        const presenceCount = presentCounts[emotion]?.count || 0;
        const presencePercentage = parseFloat(presentCounts[emotion]?.percentage || 0);
        const presenceRadius = presenceScale(presencePercentage);
        
        // Add dots for dominant counts (now showing percentages)
        svg.append('circle')
          .attr('cx', dominantRadius * Math.sin(angle))
          .attr('cy', -dominantRadius * Math.cos(angle))
          .attr('r', 6)
          .attr('fill', emotionColors[emotion])
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('class', 'emotion-point')
          .style('cursor', 'pointer')
          .on('mouseover', function(event) {
            d3.select(this)
              .attr('r', 8)
              .attr('stroke-width', 3);
            
            tooltip
              .style('visibility', 'visible')
              .style('opacity', '1')
              .style('left', `${event.pageX + 15}px`)
              .style('top', `${event.pageY - 30}px`)
              .html(`
                <div style="font-weight: bold; color: ${emotionColors[emotion]};">${emotion}</div>
                <div>Dominant Count: ${dominantCount}</div>
                <div>Percentage of Total: ${dominantPercentage.toFixed(1)}%</div>
                <div>(Click for details)</div>
              `);
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('r', 6)
              .attr('stroke-width', 2);
            
            tooltip
              .style('visibility', 'hidden')
              .style('opacity', '0');
          })
          .on('click', function() {
            handleEmotionClick(
              emotion, 
              dominantCount, 
              dominantPercentage, 
              presenceCount, 
              presencePercentage
            );
          });
        
        // Add dots for presence percentages
        svg.append('circle')
          .attr('cx', presenceRadius * Math.sin(angle))
          .attr('cy', -presenceRadius * Math.cos(angle))
          .attr('r', 6)
          .attr('fill', 'white')
          .attr('stroke', emotionColors[emotion])
          .attr('stroke-width', 2)
          .attr('class', 'emotion-point')
          .style('cursor', 'pointer')
          .on('mouseover', function(event) {
            d3.select(this)
              .attr('r', 8)
              .attr('stroke-width', 3);
            
            tooltip
              .style('visibility', 'visible')
              .style('opacity', '1')
              .style('left', `${event.pageX + 15}px`)
              .style('top', `${event.pageY - 30}px`)
              .html(`
                <div style="font-weight: bold; color: ${emotionColors[emotion]};">${emotion}</div>
                <div>Present Count: ${presenceCount}</div>
                <div>Present in ${presencePercentage.toFixed(1)}% of texts</div>
                <div>(Click for details)</div>
              `);
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('r', 6)
              .attr('stroke-width', 2);
            
            tooltip
              .style('visibility', 'hidden')
              .style('opacity', '0');
          })
          .on('click', function() {
            handleEmotionClick(
              emotion, 
              dominantCount, 
              dominantPercentage, 
              presenceCount, 
              presencePercentage
            );
          });
      });
      
      // Create dominant count polygon (now using percentages)
      const dominantLineGenerator = d3.lineRadial()
        .angle((d, i) => angleScale(i))
        .radius(d => dominantScale(d))
        .curve(d3.curveLinearClosed);
      
      const dominantData = emotions.map(emotion => dominantPercentages[emotion] || 0);
      
      svg.append('path')
        .datum(dominantData)
        .attr('d', dominantLineGenerator)
        .attr('fill', 'rgba(255, 0, 0, 0.2)')
        .attr('stroke', 'red')
        .attr('stroke-width', 2);
      
      // Create presence percentage polygon
      const presenceLineGenerator = d3.lineRadial()
        .angle((d, i) => angleScale(i))
        .radius(d => presenceScale(d))
        .curve(d3.curveLinearClosed);
      
      const presenceData = emotions.map(emotion => parseFloat(presentCounts[emotion]?.percentage || 0));
      
      svg.append('path')
        .datum(presenceData)
        .attr('d', presenceLineGenerator)
        .attr('fill', 'rgba(0, 0, 255, 0.2)')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2);
      
    } catch (err) {
      console.error("Error rendering spider wheel:", err);
      // Display error message on the SVG
      d3.select(svgRef.current)
        .append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("fill", "red")
        .style("font-size", "16px")
        .text(`Error rendering chart: ${err.message}`);
    }
    
  }, [data]);
  
  // Render legend separately outside the chart
  const renderLegend = () => {
    return (
      <div className="d-flex mb-3" ref={legendRef}>
        <div className="me-4">
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                border: '2px solid red',
                marginRight: '8px'
              }}
            ></div>
            <span>Dominant Emotion (% of texts)</span>
          </div>
        </div>
        <div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                border: '2px solid blue',
                marginRight: '8px'
              }}
            ></div>
            <span>Emotion Presence (% of texts)</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <div>Emotion Spider Wheel</div>
          {data.totalCount > 0 && (
            <Badge bg="primary" className="fs-6">{data.totalCount} records</Badge>
          )}
        </Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          Radar chart showing emotion distribution across texts
        </Card.Subtitle>
        
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading emotion spider data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : data.emotions.length === 0 ? (
          <Alert variant="info">No emotion data available. Try adjusting your search criteria.</Alert>
        ) : (
          <>
            <Alert variant="info" className="mb-3">
              <strong>How to use:</strong> Hover over the dots to see details or click for more information.
              <ul className="mb-0 mt-2">
                <li><strong>Red polygon:</strong> Percentage of texts where each emotion is dominant</li>
                <li><strong>Blue polygon:</strong> Percentage of texts where each emotion is present</li>
              </ul>
            </Alert>
            
            {/* Legend now rendered outside and above the chart */}
            {renderLegend()}
            
            <div className="d-flex justify-content-center mb-3">
              <div className="position-relative">
                <svg ref={svgRef} width="600" height="600"></svg>
                <div ref={tooltipRef}></div>
              </div>
            </div>
            
            {/* Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
              <Modal.Header closeButton style={{ 
                backgroundColor: selectedEmotion ? selectedEmotion.color : 'white',
                color: selectedEmotion ? (selectedEmotion.name === 'Joy' || selectedEmotion.name === 'Anticipation' ? 'black' : 'white') : 'black'
              }}>
                <Modal.Title>{selectedEmotion?.name} Emotion Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedEmotion && (
                  <div>
                    <h5 className="mb-3" style={{ color: selectedEmotion.color }}>{selectedEmotion.name} Statistics</h5>
                    
                    <div className="card mb-3 border-0 shadow-sm">
                      <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">Dominant Emotion</h6>
                        <div className="d-flex align-items-center mb-1">
                          <div className="emotion-stat-circle" style={{ 
                            backgroundColor: selectedEmotion.color,
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            color: selectedEmotion.name === 'Joy' || selectedEmotion.name === 'Anticipation' ? 'black' : 'white',
                            fontWeight: 'bold'
                          }}>
                            {selectedEmotion.dominantPercentage.toFixed(0)}%
                          </div>
                          <div>
                            <p className="mb-0">This emotion is dominant in <strong>{selectedEmotion.dominantCount}</strong> texts.</p>
                            <p className="mb-0 text-muted small">Percentage of total: <strong>{selectedEmotion.dominantPercentage.toFixed(2)}%</strong></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card mb-3 border-0 shadow-sm">
                      <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">Presence Statistics</h6>
                        <div className="d-flex align-items-center mb-1">
                          <div className="emotion-stat-circle" style={{ 
                            backgroundColor: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            border: `3px solid ${selectedEmotion.color}`,
                            color: selectedEmotion.color,
                            fontWeight: 'bold'
                          }}>
                            {selectedEmotion.presencePercentage.toFixed(0)}%
                          </div>
                          <div>
                            <p className="mb-0">This emotion is present in <strong>{selectedEmotion.presenceCount}</strong> texts.</p>
                            <p className="mb-0 text-muted small">Percentage of total: <strong>{selectedEmotion.presencePercentage.toFixed(2)}%</strong></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="alert alert-info mt-3">
                      <h6 className="mb-2"><strong>Understanding these metrics:</strong></h6>
                      <ul className="mb-0 ps-3">
                        <li><strong>Dominant:</strong> This emotion has the highest score among all emotions in a text.</li>
                        <li><strong>Present:</strong> This emotion has any score greater than zero in a text.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer style={{ borderTop: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowModal(false)}
                  style={{ 
                    backgroundColor: selectedEmotion ? selectedEmotion.color : 'secondary',
                    color: selectedEmotion ? (selectedEmotion.name === 'Joy' || selectedEmotion.name === 'Anticipation' ? 'black' : 'white') : 'white',
                    borderColor: selectedEmotion ? selectedEmotion.color : 'secondary'
                  }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmotionSpiderWheel; 