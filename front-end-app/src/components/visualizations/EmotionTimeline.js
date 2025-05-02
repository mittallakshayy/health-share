import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Alert, Badge, ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as d3 from 'd3';
import { emotionColors } from './emotionColors';
import { FaSearchPlus, FaSearchMinus, FaUndo, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

const EmotionTimeline = ({ searchParams }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [emotionList, setEmotionList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomTransform, setZoomTransform] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
  const [brushExtent, setBrushExtent] = useState(null);
  const [yScaleType, setYScaleType] = useState('wiggle'); // 'wiggle', 'expand', or 'none'
  
  const svgRef = useRef();
  const containerRef = useRef();
  const chartRef = useRef(null);
  const tooltipRef = useRef();
  const brushRef = useRef();
  const zoomRef = useRef();
  
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
        setBrushExtent(null); // Reset brush when new data is loaded
        setZoomTransform(null); // Reset zoom when new data is loaded
        
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
  
  // Handle zoom in button click
  const handleZoomIn = () => {
    if (chartRef.current && zoomRef.current) {
      const newZoom = d3.zoomTransform(chartRef.current).scale(zoomLevel * 1.5);
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, newZoom);
      setZoomLevel(zoomLevel * 1.5);
    }
  };
  
  // Handle zoom out button click
  const handleZoomOut = () => {
    if (chartRef.current && zoomRef.current) {
      const newZoom = d3.zoomTransform(chartRef.current).scale(Math.max(1, zoomLevel / 1.5));
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, newZoom);
      setZoomLevel(Math.max(1, zoomLevel / 1.5));
    }
  };
  
  // Handle reset zoom button click
  const handleResetZoom = () => {
    if (chartRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
      setZoomLevel(1);
      setZoomTransform(null);
      setBrushExtent(null);
      
      // Clear any brush selection
      if (brushRef.current) {
        d3.select(brushRef.current).call(d3.brushX().move, null);
      }
    }
  };
  
  // Handle time range filter
  const handleTimeRangeFilter = (days) => {
    if (!data || data.length === 0) return;
    
    const sortedDates = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const lastDate = new Date(sortedDates[sortedDates.length - 1].date);
    const firstDate = days ? new Date(lastDate.getTime() - (days * 24 * 60 * 60 * 1000)) : new Date(sortedDates[0].date);
    
    setSelectedTimeRange(days);
    
    // Update the brush to reflect this time range
    if (chartRef.current && brushRef.current && zoomRef.current) {
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)))
        .range([0, containerRef.current.clientWidth - 100]);
      
      // Clear current zoom
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
      
      // Set brush selection
      d3.select(brushRef.current)
        .transition()
        .duration(300)
        .call(d3.brushX().move, [x(firstDate), x(lastDate)]);
      
      // Update brush extent
      setBrushExtent([firstDate, lastDate]);
    }
  };
  
  // Add new function to handle Y-axis scaling changes
  const handleYScaleChange = (type) => {
    setYScaleType(type);
    
    // Force redraw with the new scale type
    if (data.length > 0) {
      const tempData = [...data];
      setData([]);
      setTimeout(() => setData(tempData), 10);
    }
  };
  
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
      const margin = { top: 50, right: 30, bottom: 80, left: 60 };
      const containerWidth = containerRef.current.clientWidth;
      const width = containerWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      
      // Create main SVG with explicit width and height
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + 40); // Extra space for brush
      
      // Create tooltip div
      const tooltip = d3.select(tooltipRef.current)
        .classed('emotion-timeline-tooltip', true)
        .style('position', 'fixed')
        .style('visibility', 'hidden')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('padding', '10px')
        .style('box-shadow', '0 4px 15px rgba(0,0,0,0.2)')
        .style('z-index', '9999')
        .style('pointer-events', 'none')
        .style('min-width', '200px')
        .style('font-size', '14px')
        .style('opacity', '0')
        .style('transition', 'opacity 0.2s');
      
      // Create a clip path to prevent drawing outside the chart area
      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
      
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
      
      // Create stack generator with selected offset based on yScaleType
      const stack = d3.stack()
        .keys(emotionList)
        .order(d3.stackOrderNone);
        
      // Apply the appropriate offset based on user selection
      if (yScaleType === 'wiggle') {
        stack.offset(d3.stackOffsetWiggle); // Stream graph (default)
      } else if (yScaleType === 'expand') {
        stack.offset(d3.stackOffsetExpand); // Normalized to 100%
      } else {
        stack.offset(d3.stackOffsetNone); // Regular stacked area
      }
      
      // Create the layers
      let layers;
      try {
        layers = stack(formattedData);
        console.log("Stack layers:", layers);
      } catch (err) {
        console.error("Error creating stack layout:", err);
        throw new Error("Failed to create stack layout: " + err.message);
      }
      
      // Set up the main chart group with margin
      const mainGroup = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      
      // Reference for chart group to apply zoom
      chartRef.current = mainGroup.node();
      
      // Find date extent from data
      const dateExtent = d3.extent(formattedData, d => d.date);
      
      // Set up scales - use original width before zoom
      const x = d3.scaleTime()
        .domain(brushExtent || dateExtent)
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
      
      // Get formatted y-axis ticks based on the scale type
      const getYAxisTicks = () => {
        if (yScaleType === 'expand') {
          return d3.axisLeft(y).ticks(5).tickFormat(d => `${Math.round(d * 100)}%`);
        } else {
          return d3.axisLeft(y).ticks(5);
        }
      };
      
      // Create zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([1, 15]) // Limit zoom scale
        .translateExtent([[0, 0], [width, height]]) // Limit pan area
        .extent([[0, 0], [width, height]])
        .on("zoom", (event) => {
          // Prevent default to avoid triggering page scroll
          event.sourceEvent && event.sourceEvent.preventDefault();
          
          // Update the zoom level state
          setZoomLevel(event.transform.k);
          setZoomTransform(event.transform);
          
          // Get the new scale after zoom
          const newX = event.transform.rescaleX(x);
          
          // Update the x-axis with new scale
          mainGroup.select(".x-axis").call(d3.axisBottom(newX).ticks(10));
          
          // Update all area paths
          mainGroup.selectAll(".layer")
            .attr("d", d3.area()
              .x(d => newX(d.data.date))
              .y0(d => y(d[0]))
              .y1(d => y(d[1]))
              .curve(d3.curveBasis));
        });
      
      // Store zoom behavior reference
      zoomRef.current = zoom;
      
      // Add zoom behavior to the svg - ensure we're capturing all events
      svg.call(zoom)
        .on("wheel.zoom", null) // Disable wheel to prevent conflicts with page scroll
        .call(zoom.filter(event => {
          // Only allow zooming with explicit zoom buttons or mousedown (pan)
          return !event.button && 
                 (event.type === 'mousedown' || event.type === 'touchstart');
        }));
      
      // Add an invisible overlay to capture pan events
      mainGroup.append("rect")
        .attr("class", "zoom-overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .call(zoom);
      
      // Apply previous transform if any
      if (zoomTransform) {
        svg.call(zoom.transform, zoomTransform);
      }
      
      // Create area generator
      const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis); // Smooth curves
      
      // Draw background for contrast
      mainGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f8f9fa");
      
      // Draw areas for each emotion
      mainGroup.selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", (d, i) => emotionColors[d.key] || "#999")
        .style("opacity", 0.8)
        .style("stroke", "#fff")
        .style("stroke-width", 0.1)
        .style("pointer-events", "all") // Ensure layers can receive mouse events
        .attr("clip-path", "url(#clip)") // Apply clip path to prevent drawing outside
        .on("mouseover", function(event, d) {
          // Debug log to confirm mouse events are being received
          console.log("Mouseover on layer:", d.key);
          
          // Fix for hover stuck issue - clear any previous stuck hover states
          mainGroup.selectAll(".layer")
            .style("opacity", 0.8)
            .style("stroke", "#fff")
            .style("stroke-width", 0.1);
            
          d3.select(this)
            .style("opacity", 1)
            .style("stroke", "#000")
            .style("stroke-width", 1); // Increased for better visibility
          
          // Make tooltip visible
          tooltip
            .style('visibility', 'visible')
            .style('opacity', '1')
            .style('display', 'block')
            .html(`<div style="font-weight: bold; color: ${emotionColors[d.key]};">${d.key}</div>`);
        })
        .on("mousemove", function(event, d) {
          // Debug log the event coordinates
          console.log("Mouse coordinates:", event.pageX, event.pageY);
          
          // Get the zoom-adjusted x scale
          const currentX = zoomTransform ? zoomTransform.rescaleX(x) : x;
          
          // Find the data point closest to the mouse position
          const xPos = currentX.invert(d3.pointer(event, this)[0]);
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

          // Calculate percentage of this emotion relative to all emotions on this date
          const totalOnDate = emotionList.reduce((sum, emotion) => sum + (dataPoint[emotion] || 0), 0);
          const percentageOnDate = totalOnDate > 0 ? (count / totalOnDate * 100).toFixed(1) : 0;
          
          // Calculate percentage relative to all data
          const percentageOfTotal = totalCount > 0 ? (count / totalCount * 100).toFixed(1) : 0;
          
          // Find if this is the dominant emotion for this date
          const emotions = emotionList.map(emotion => ({ 
            name: emotion, 
            count: dataPoint[emotion] || 0 
          }));
          emotions.sort((a, b) => b.count - a.count);
          const isDominant = emotions.length > 0 && emotions[0].name === d.key && emotions[0].count > 0;
          
          // Find other emotions present on this date for comparison
          const otherEmotions = emotions
            .filter(e => e.name !== d.key && e.count > 0)
            .slice(0, 3); // Top 3 other emotions
              
          // Get the most frequent emotion on this date
          const mostFrequentEmotion = emotions.length > 0 ? emotions[0] : null;
          
          // Calculate percentage change from previous day if available
          let percentageChange = null;
          let trendIcon = "";
          if (index > 0) {
            const prevDay = formattedData[index - 1];
            const prevCount = prevDay[d.key] || 0;
            if (prevCount > 0 && count > 0) {
              percentageChange = ((count - prevCount) / prevCount * 100).toFixed(1);
              trendIcon = percentageChange > 0 ? "▲" : percentageChange < 0 ? "▼" : "◆";
            }
          }
          
          // Enhanced tooltip with more emotion context
          tooltip
            .html(
              `<div class="tooltip-header" style="
                font-weight: bold; 
                color: white; 
                background-color: ${emotionColors[d.key]}; 
                padding: 6px 10px; 
                margin: -10px -10px 8px -10px; 
                border-radius: 4px 4px 0 0;
                display: flex;
                justify-content: space-between;
              ">
                <span>${d.key}</span>
                <span>${date}</span>
              </div>
              
              <div style="
                background-color: #f8f9fa;
                margin: -8px -10px 8px -10px;
                padding: 8px 10px;
                border-bottom: 1px solid #eee;
                text-align: center;
                font-weight: bold;
              ">
                <span style="font-size: 16px;">${totalOnDate} total tweets on this day</span>
              </div>
              
              <div class="tooltip-content">
                <div style="margin-bottom: 12px; background-color: ${emotionColors[d.key] + '15'}; padding: 8px; border-radius: 4px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <strong>${d.key} count:</strong>
                    <span>${count} tweets ${percentageChange !== null ? 
                      `<span style="color: ${percentageChange > 0 ? '#28a745' : percentageChange < 0 ? '#dc3545' : '#6c757d'}">
                        ${trendIcon} ${Math.abs(percentageChange)}%
                      </span>` : ''}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <strong>% of day's tweets:</strong>
                    <span>${percentageOnDate}%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <strong>% of all tweets:</strong>
                    <span>${percentageOfTotal}%</span>
                  </div>
                </div>
                
                ${isDominant ? 
                  `<div style="
                    background-color: ${emotionColors[d.key] + '22'}; 
                    padding: 8px; 
                    border-radius: 4px;
                    margin-bottom: 8px;
                    border-left: 3px solid ${emotionColors[d.key]};
                  ">
                    <strong>${d.key}</strong> is the most common emotion on this day.
                  </div>` : 
                  mostFrequentEmotion && mostFrequentEmotion.name !== d.key ? 
                  `<div style="
                    background-color: ${emotionColors[mostFrequentEmotion.name] + '22'}; 
                    padding: 8px; 
                    border-radius: 4px;
                    margin-bottom: 8px;
                    border-left: 3px solid ${emotionColors[mostFrequentEmotion.name]};
                  ">
                    <strong>${mostFrequentEmotion.name}</strong> is the most common emotion on this day with 
                    <strong>${mostFrequentEmotion.count}</strong> tweets (${(mostFrequentEmotion.count/totalOnDate*100).toFixed(1)}%).
                  </div>` : ''
                }
                
                ${otherEmotions.length > 0 ? 
                  `<div style="margin-top: 8px;">
                    <strong>Other emotions on this day:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                      ${otherEmotions.map(e => 
                        `<span style="
                          background-color: ${emotionColors[e.name] + '33'}; 
                          color: #333;
                          padding: 4px 8px; 
                          border-radius: 12px;
                          font-size: 12px;
                          white-space: nowrap;
                        ">
                          ${e.name}: ${e.count} (${totalOnDate > 0 ? (e.count / totalOnDate * 100).toFixed(1) : 0}%)
                        </span>`
                      ).join('')}
                    </div>
                  </div>`
                  : '<div style="font-style: italic; color: #666; margin-top: 8px;">No other emotions recorded on this date.</div>'
                }
              </div>
              <div class="tooltip-footer" style="
                margin-top: 10px;
                padding-top: 8px;
                border-top: 1px solid #eee;
                font-size: 11px;
                color: #666;
                display: flex;
                justify-content: space-between;
              ">
                <span>Date: ${date}</span>
                <span>${count} of ${totalOnDate} tweets</span>
              </div>`
            )
            // Position tooltip right at cursor with enough offset to avoid hiding cursor
            .style('left', `${event.clientX + 20}px`)
            .style('top', `${event.clientY - 10}px`)
            .style('visibility', 'visible')
            .style('display', 'block')
            .style('opacity', '1')
            .style('max-width', '320px')
            .style('box-shadow', '0 4px 15px rgba(0,0,0,0.2)');
        })
        .on("mouseout", function(event) {
          // Debug log to confirm mouseout events are being received
          console.log("Mouseout event detected");
          
          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke", "#fff")
            .style("stroke-width", 0.1);
          
          // Hide tooltip immediately to prevent it from staying visible
          tooltip
            .style('visibility', 'hidden')
            .style('opacity', '0')
            .style('display', 'none');
        });
      
      // Add x-axis at the bottom
      mainGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(Math.min(formattedData.length, 7)));
      
      // Add y-axis with appropriate format based on scale type
      mainGroup.append("g")
        .attr("class", "y-axis")
        .call(getYAxisTicks());
      
      // Add axis labels
      mainGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .style("font-size", "12px")
        .text("Date");
      
      // Y-axis label based on scale type
      const yAxisLabel = yScaleType === 'expand' ? 'Percentage (%)' : 
                         yScaleType === 'wiggle' ? 'Stream Volume' : 'Count';
      
      mainGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("font-size", "12px")
        .text(yAxisLabel);
      
      // Create brush for range selection
      const brushArea = svg.append("g")
        .attr("class", "brush")
        .attr("transform", `translate(${margin.left}, ${height + margin.top + 20})`)
        .on("click", function(event) {
          if (event.defaultPrevented) return; // Click originated from a brush
        });
        
      // Store brush reference
      brushRef.current = brushArea.node();
      
      // Create a mini x-axis for the brush
      const miniX = d3.scaleTime()
        .domain(dateExtent)
        .range([0, width]);
        
      // Add mini axis for the brush
      brushArea.append("g")
        .attr("class", "mini-axis")
        .call(d3.axisBottom(miniX).ticks(5));
        
      // Create brush behavior
      const brush = d3.brushX()
        .extent([[0, -20], [width, 20]])
        .on("start", (event) => {
          // Prevent event propagation to avoid zoom conflicts
          if (event.sourceEvent) event.sourceEvent.stopPropagation();
        })
        .on("end", (event) => {
          // Prevent default to avoid triggering page scroll
          if (event.sourceEvent) event.sourceEvent.preventDefault();
          
          if (!event.selection) return;
          
          // Get the brush selection in domain units (dates)
          const [x0, x1] = event.selection.map(miniX.invert);
          
          // Update the x domain to zoom to selected area
          x.domain([x0, x1]);
          
          // Store brush extent
          setBrushExtent([x0, x1]);
          
          // Clear time range selection if we're using the brush directly
          setSelectedTimeRange(null);
          
          // Reset zoom transform and apply new scale
          svg.call(zoom.transform, d3.zoomIdentity);
          
          // Update the x-axis with new domain
          mainGroup.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x).ticks(5));
          
          // Update all area paths with the new domain
          mainGroup.selectAll(".layer")
            .transition()
            .duration(500)
            .attr("d", area);
        });
        
      // Apply brush to the brush area
      brushArea.call(brush);
      
      // If we have a saved brush extent, apply it
      if (brushExtent) {
        brushArea.call(brush.move, brushExtent.map(miniX));
      }
      
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
  }, [data, emotionList, totalCount, brushExtent, zoomTransform, yScaleType]);
  
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
  
  // Render zoom controls with y-axis scale options
  const renderZoomControls = () => {
    return (
      <div className="zoom-controls mb-3">
        <div className="d-flex align-items-center mb-2">
          <ButtonGroup size="sm" className="me-3">
            <Button variant="outline-secondary" onClick={handleZoomIn} title="Zoom In">
              <FaSearchPlus />
            </Button>
            <Button variant="outline-secondary" onClick={handleZoomOut} title="Zoom Out">
              <FaSearchMinus />
            </Button>
            <Button variant="outline-secondary" onClick={handleResetZoom} title="Reset View">
              <FaUndo />
            </Button>
          </ButtonGroup>
          
          <ButtonGroup size="sm" className="me-3">
            <Button 
              variant={selectedTimeRange === 7 ? "primary" : "outline-secondary"} 
              onClick={() => handleTimeRangeFilter(7)}
            >
              7 Days
            </Button>
            <Button 
              variant={selectedTimeRange === 30 ? "primary" : "outline-secondary"} 
              onClick={() => handleTimeRangeFilter(30)}
            >
              30 Days
            </Button>
            <Button 
              variant={selectedTimeRange === 90 ? "primary" : "outline-secondary"} 
              onClick={() => handleTimeRangeFilter(90)}
            >
              90 Days
            </Button>
            <Button 
              variant={selectedTimeRange === null && !brushExtent ? "primary" : "outline-secondary"} 
              onClick={() => handleTimeRangeFilter(null)}
            >
              All
            </Button>
          </ButtonGroup>
          
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip>
                <strong>Zoom Controls:</strong> Use buttons to zoom in/out or select a time range.<br/>
                <strong>Brush Selection:</strong> Drag below the chart to select a time range.<br/>
                <strong>Pan:</strong> Click and drag the chart area to move around when zoomed.
              </Tooltip>
            }
          >
            <Button variant="link" className="text-muted p-0">
              <FaInfoCircle />
            </Button>
          </OverlayTrigger>
        </div>
        
        <div className="d-flex align-items-center">
          <div className="me-2"><strong>Y-Axis Scale:</strong></div>
          <ButtonGroup size="sm">
            <Button 
              variant={yScaleType === 'wiggle' ? "primary" : "outline-secondary"} 
              onClick={() => handleYScaleChange('wiggle')}
              title="Stream view (default)"
            >
              Stream
            </Button>
            <Button 
              variant={yScaleType === 'expand' ? "primary" : "outline-secondary"} 
              onClick={() => handleYScaleChange('expand')}
              title="Show relative proportions (100%)"
            >
              Normalized (%)
            </Button>
            <Button 
              variant={yScaleType === 'none' ? "primary" : "outline-secondary"} 
              onClick={() => handleYScaleChange('none')}
              title="Show absolute values"
            >
              Stacked
            </Button>
          </ButtonGroup>
          
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip>
                <strong>Stream:</strong> Streamgraph layout showing trends over time<br/>
                <strong>Normalized:</strong> Shows percentage distribution (100%)<br/>
                <strong>Stacked:</strong> Shows absolute count values stacked
              </Tooltip>
            }
          >
            <Button variant="link" className="text-muted p-0 ms-2">
              <FaInfoCircle />
            </Button>
          </OverlayTrigger>
        </div>
      </div>
    );
  };
  
  // Check for window resize to make the chart responsive
  useEffect(() => {
    const handleResize = () => {
      // Re-render chart on window resize
      if (data.length > 0 && emotionList.length > 0) {
        // Re-trigger the chart drawing effect while maintaining current zoom
        const tempData = [...data];
        const tempBrushExtent = brushExtent;
        const tempZoomTransform = zoomTransform;
        
        // Preserve state before redrawing
        setData([]);
        
        // Redraw and restore state
        setTimeout(() => {
          setData(tempData);
          setBrushExtent(tempBrushExtent);
          setZoomTransform(tempZoomTransform);
        }, 10);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, emotionList, brushExtent, zoomTransform]);
  
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
            <Alert variant="info" className="mb-3 d-flex align-items-center">
              <FaCalendarAlt className="me-2 fs-4" />
              <div>
                <strong>Interactive Timeline:</strong> Hover over the colored areas to see details.
                <br />
                <span className="text-muted">Use the controls below to zoom, pan, and filter the timeline.</span>
              </div>
            </Alert>
            
            {/* Zoom and time range controls */}
            {renderZoomControls()}
            
            {/* Chart container */}
            <div className="d-flex justify-content-center mb-3" style={{ width: '100%', position: 'relative' }}>
              <div 
                ref={containerRef} 
                className="position-relative timeline-container" 
                style={{ 
                  width: '100%', 
                  height: '500px',
                  margin: '0 auto',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  touchAction: 'none',
                  cursor: 'crosshair' // Change cursor to indicate interactivity
                }}
              >
                <svg 
                  ref={svgRef} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'block',
                    touchAction: 'none',
                    cursor: 'crosshair' // Change cursor to indicate interactivity
                  }}
                ></svg>
                
                {/* Fixed tooltip container with higher z-index */}
                <div 
                  ref={tooltipRef}
                  id="emotion-timeline-tooltip" // Add ID for easier debugging
                  style={{
                    position: 'fixed',
                    zIndex: 9999,
                    visibility: 'hidden',
                    display: 'none', // Add display property
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    pointerEvents: 'none',
                    maxWidth: '320px',
                    transition: 'opacity 0.2s',
                    opacity: 0
                  }}
                ></div>
              </div>
            </div>
            
            {/* Debug message for testing */}
            <div className="text-muted small mb-2" style={{ display: 'none' }}>
              Hover over the colored areas to see emotion details. If tooltips aren't appearing, try clicking first.
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