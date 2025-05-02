import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Alert, Badge } from 'react-bootstrap';
import * as d3 from 'd3';
import { emotionColors } from './emotionColors';

const EmotionTimeline = ({ searchParams }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [emotionList, setEmotionList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  const svgRef = useRef();
  const containerRef = useRef();
  
  useEffect(() => {
    if (!searchParams) return;
    
    const fetchEmotionTimeline = async () => {
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
        
        console.log("Emotion timeline query params:", queryParams.toString());
        const response = await fetch(`http://localhost:3003/healthshare/api/emotion-timeline?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Emotion timeline data:", result);
        
        // Handle and deduplicate data
        let processedData = result.timelineData || [];
        
        // Create a Map to deduplicate by date and combine values
        const dateMap = new Map();
        processedData.forEach(entry => {
          const dateStr = new Date(entry.date).toISOString().split('T')[0];
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, {...entry, date: dateStr});
          } else {
            // Combine values for duplicate dates
            const existingEntry = dateMap.get(dateStr);
            result.emotions.forEach(emotion => {
              existingEntry[emotion] = (existingEntry[emotion] || 0) + (entry[emotion] || 0);
            });
          }
        });
        
        // Convert back to array
        processedData = Array.from(dateMap.values());
        
        // Sort by date
        processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log("Processed timeline data:", processedData);
        
        setData(processedData);
        
        // Filter out 'Mixed' from emotions if present
        const filteredEmotions = (result.emotions || []).filter(emotion => emotion !== 'Mixed');
        setEmotionList(filteredEmotions);
        
        // Calculate total count from all emotions (excluding Mixed)
        const count = processedData.reduce((total, entry) => {
          let entrySum = 0;
          filteredEmotions.forEach(emotion => {
            entrySum += (entry[emotion] || 0);
          });
          return total + entrySum;
        }, 0);
        
        setTotalCount(count);
      } catch (err) {
        console.error('Error fetching emotion timeline data:', err);
        setError('Failed to fetch emotion timeline data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmotionTimeline();
  }, [searchParams]);
  
  // Draw the stream graph whenever data changes
  useEffect(() => {
    if (data.length === 0 || !svgRef.current || emotionList.length === 0) return;
    
    // Debug data
    console.log("Timeline data for rendering:", data);
    console.log("Emotion list for rendering:", emotionList);
    
    // Check if there's any emotion data to display
    const hasEmotionData = data.some(entry => {
      return emotionList.some(emotion => entry[emotion] > 0);
    });
    
    // Clear any existing chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    if (!hasEmotionData) {
      // No emotion data to display
      d3.select(svgRef.current)
        .append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('No emotion data available for the selected time period');
      return;
    }
    
    // Remove existing tooltip if any
    d3.selectAll(".emotion-timeline-tooltip").remove();
    
    try {
      // Set up dimensions
      const margin = { top: 50, right: 30, bottom: 50, left: 60 };
      const containerWidth = containerRef.current.clientWidth;
      const width = containerWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      
      // Create SVG with explicit width and height
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      
      // Create tooltip div
      const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'emotion-timeline-tooltip')
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
      
      // Format data for d3 stack
      const formattedData = data.map(d => {
        // Ensure date is a Date object
        const dateObj = new Date(d.date);
        
        // Create a new object with all emotions as numbers
        const entry = { date: dateObj };
        emotionList.forEach(emotion => {
          entry[emotion] = +(d[emotion] || 0); // Convert to number and handle undefined
        });
        
        return entry;
      });
      
      console.log("Formatted data for graph:", formattedData);
      
      // Ensure we have valid data
      if (formattedData.length === 0) {
        throw new Error("No valid data points for graph");
      }
      
      // Make sure dates are sorted in ascending order
      formattedData.sort((a, b) => a.date - b.date);
      
      // If we only have one data point, duplicate it with a different date
      if (formattedData.length === 1) {
        const firstPoint = formattedData[0];
        const newDate = new Date(firstPoint.date);
        newDate.setDate(newDate.getDate() + 1);
        
        const secondPoint = { ...firstPoint, date: newDate };
        formattedData.push(secondPoint);
        console.log("Added duplicate point for single data point case:", formattedData);
      }
      
      // Create stack generator - ensure we're only using filtered emotions (no 'Mixed')
      const stack = d3.stack()
        .keys(emotionList)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetWiggle); // This creates a stream graph
      
      // Create the layers
      let layers;
      try {
        layers = stack(formattedData);
        console.log("Stack layers:", layers);
      } catch (err) {
        console.error("Error creating stack layout:", err);
        throw new Error("Failed to create stack layout: " + err.message);
      }
      
      // Set up scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([0, width]);
      
      // Find min and max values across all layers
      const yExtent = [
        d3.min(layers, layer => d3.min(layer, d => d[0])),
        d3.max(layers, layer => d3.max(layer, d => d[1]))
      ];
      
      console.log("Y extent:", yExtent);
      
      const y = d3.scaleLinear()
        .domain(yExtent)
        .range([height, 0]);
      
      // Create area generator
      const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis); // Smooth curves
      
      // Draw background for contrast
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f8f9fa");
      
      // Draw areas for each emotion
      svg.selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", (d, i) => emotionColors[d.key] || "#999")
        .style("opacity", 0.8)
        .style("stroke", "#fff")
        .style("stroke-width", 0.1)
        .on("mouseover", function(event, d) {
          d3.select(this)
            .style("opacity", 1)
            .style("stroke", "#000")
            .style("stroke-width", 0.5);
          
          tooltip
            .style('visibility', 'visible')
            .style('opacity', '1')
            .html(`<div style="font-weight: bold; color: ${emotionColors[d.key]};">${d.key}</div>`);
        })
        .on("mousemove", function(event, d) {
          // Find the data point closest to the mouse position
          const xPos = x.invert(d3.pointer(event, this)[0]);
          const bisectDate = d3.bisector(d => d.date).left;
          const index = bisectDate(formattedData, xPos, 1);
          
          if (index >= formattedData.length) return;
          
          let dataPoint;
          if (index === 0) {
            dataPoint = formattedData[0];
          } else {
            const dateLeft = formattedData[index - 1];
            const dateRight = formattedData[index];
            dataPoint = xPos - dateLeft.date > dateRight.date - xPos ? dateRight : dateLeft;
          }
          
          // Get the count for this emotion on this date
          const count = dataPoint[d.key] || 0;
          
          // Format the date
          const dateFormatter = d3.timeFormat("%b %d, %Y");
          const date = dateFormatter(dataPoint.date);
          
          tooltip
            .html(
              `<div style="font-weight: bold; color: ${emotionColors[d.key]};">
                ${d.key}
              </div>
              <div>Date: ${date}</div>
              <div>Count: ${count}</div>
              <div>Percentage: ${totalCount > 0 ? (count / totalCount * 100).toFixed(1) : 0}%</div>`
            )
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 30}px`);
        })
        .on("mouseout", function() {
          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke", "#fff")
            .style("stroke-width", 0.1);
          
          tooltip
            .style('visibility', 'hidden')
            .style('opacity', '0');
        });
      
      // Add x-axis at the bottom
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
      
      // Add axis labels
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .style("font-size", "12px")
        .text("Date");
      
    } catch (err) {
      console.error("Error rendering stream graph:", err);
      // Display error message on the SVG
      d3.select(svgRef.current).selectAll("*").remove();
      d3.select(svgRef.current)
        .append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("fill", "red")
        .style("font-size", "16px")
        .text(`Error rendering graph: ${err.message}`);
    }
    
    // Clean up on unmount
    return () => {
      d3.selectAll(".emotion-timeline-tooltip").remove();
    };
  }, [data, emotionList, totalCount]);
  
  // Render the color legend
  const renderColorLegend = () => {
    return (
      <div className="mt-3">
        <h6>Legend:</h6>
        <div className="d-flex flex-wrap">
          {emotionList.map(emotion => (
            <div key={emotion} className="me-3 mb-2 d-flex align-items-center">
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: emotionColors[emotion] || '#999999',
                  borderRadius: '3px',
                  marginRight: '8px',
                  border: '1px solid #ddd'
                }}
              ></span>
              <span>{emotion}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Check for window resize to make the chart responsive
  useEffect(() => {
    const handleResize = () => {
      // Re-render chart on window resize
      if (data.length > 0 && emotionList.length > 0) {
        // Re-trigger the chart drawing effect
        const tempData = [...data];
        setData([]);
        setTimeout(() => setData(tempData), 10);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, emotionList]);
  
  return (
    <Card>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <div>Emotion Timeline</div>
          {totalCount > 0 && (
            <Badge bg="primary" className="fs-6">{totalCount} records</Badge>
          )}
        </Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          Stream graph showing maximum emotion trends over time
        </Card.Subtitle>
        
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading emotion timeline data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : data.length === 0 ? (
          <Alert variant="info">No timeline data available. Try adjusting your search criteria.</Alert>
        ) : (
          <>
            <Alert variant="info" className="mb-3">
              <strong>How to use:</strong> Hover over the colored areas to see emotion details for specific dates.
              The height of each colored section represents the number of texts with that maximum emotion on a given day.
            </Alert>
            <div className="d-flex justify-content-center mb-3" style={{ width: '100%' }}>
              <div 
                ref={containerRef} 
                className="position-relative" 
                style={{ 
                  width: '100%', 
                  height: '450px',
                  margin: '0 auto',
                  overflow: 'visible',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px'
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
            
            {/* Only one legend */}
            <div className="mt-4">
              {renderColorLegend()}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmotionTimeline; 