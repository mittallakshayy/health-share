import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '../utils/helpers';

/**
 * Timeline-based date range selector component
 * @param {Object} props - Component props
 * @param {Date} props.startDate - The selected start date
 * @param {Date} props.endDate - The selected end date
 * @param {Date} props.minDate - The minimum selectable date
 * @param {Date} props.maxDate - The maximum selectable date
 * @param {Function} props.onStartDateChange - Callback when start date changes
 * @param {Function} props.onEndDateChange - Callback when end date changes
 */
const DateRangeTimeline = ({
  startDate,
  endDate,
  minDate = new Date('2020-01-01'),
  maxDate = new Date(),
  onStartDateChange,
  onEndDateChange
}) => {
  const timelineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [formattedStartDate, setFormattedStartDate] = useState('');
  const [formattedEndDate, setFormattedEndDate] = useState('');

  // Calculate the total time range in milliseconds
  const totalRange = maxDate.getTime() - minDate.getTime();
  
  // Function to convert date to position
  const dateToPosition = (date) => {
    if (!date) return 0;
    const dateTime = date instanceof Date ? date.getTime() : new Date(date).getTime();
    return Math.max(0, Math.min(100, ((dateTime - minDate.getTime()) / totalRange) * 100));
  };
  
  // Function to convert position to date
  const positionToDate = (position) => {
    const percentage = Math.max(0, Math.min(100, position));
    const milliseconds = (percentage / 100) * totalRange;
    return new Date(minDate.getTime() + milliseconds);
  };
  
  // Get start and end positions for markers
  const startPosition = dateToPosition(startDate) || 0;
  const endPosition = dateToPosition(endDate) || 100;
  
  // Update formatted dates when dates change
  useEffect(() => {
    if (startDate instanceof Date && !isNaN(startDate)) {
      setFormattedStartDate(formatDate(startDate));
    } else {
      setFormattedStartDate('');
    }
    
    if (endDate instanceof Date && !isNaN(endDate)) {
      setFormattedEndDate(formatDate(endDate));
    } else {
      setFormattedEndDate('');
    }
  }, [startDate, endDate]);
  
  // Measure timeline width on mount and window resize
  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  
  // Handle marker drag events
  const handleMouseDown = (marker) => (e) => {
    e.preventDefault();
    setIsDragging(marker);
  };
  
  // Handle input field changes
  const handleInputChange = (isStart) => (e) => {
    const dateString = e.target.value;
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        if (isStart) {
          if (date < maxDate && (!endDate || date <= endDate)) {
            onStartDateChange(date);
          }
        } else {
          if (date > minDate && (!startDate || date >= startDate)) {
            onEndDateChange(date);
          }
        }
      }
    } catch (err) {
      console.error('Invalid date format:', err);
    }
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = (offsetX / rect.width) * 100;
      
      const newDate = positionToDate(percentage);
      
      if (isDragging === 'start') {
        if (endDate && newDate > endDate) return;
        onStartDateChange(newDate);
      } else if (isDragging === 'end') {
        if (startDate && newDate < startDate) return;
        onEndDateChange(newDate);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onStartDateChange, onEndDateChange, startDate, endDate, timelineWidth]);
  
  // Format date for tooltip display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return date instanceof Date && !isNaN(date) 
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '';
  };
  
  return (
    <Card className="date-range-timeline-card">
      <Card.Body>
        <div className="mb-2 d-flex align-items-center">
          <FaCalendarAlt className="text-primary me-2" />
          <h6 className="mb-0">Select Date Range</h6>
        </div>
        
        {/* Manual date inputs */}
        <Row className="mb-3">
          <Col sm={6}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={formattedStartDate}
                onChange={handleInputChange(true)}
                min={formatDate(minDate)}
                max={formatDate(endDate || maxDate)}
              />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={formattedEndDate}
                onChange={handleInputChange(false)}
                min={formatDate(startDate || minDate)}
                max={formatDate(maxDate)}
              />
            </Form.Group>
          </Col>
        </Row>
        
        {/* Timeline with draggable markers */}
        <div className="date-timeline-container">
          {/* Timeline labels */}
          <div className="timeline-labels d-flex justify-content-between mb-1">
            <small className="text-muted">{formatDateForDisplay(minDate)}</small>
            <small className="text-muted">{formatDateForDisplay(maxDate)}</small>
          </div>
          
          {/* Timeline bar */}
          <div 
            ref={timelineRef}
            className="timeline-bar position-relative"
          >
            {/* Timeline background track */}
            <div className="timeline-track"></div>
            
            {/* Selected range */}
            <div 
              className="timeline-range"
              style={{ 
                left: `${startPosition}%`, 
                width: `${endPosition - startPosition}%` 
              }}
            ></div>
            
            {/* Start marker */}
            <div
              ref={startMarkerRef}
              className={`timeline-marker start-marker ${isDragging === 'start' ? 'dragging' : ''}`}
              style={{ left: `${startPosition}%` }}
              onMouseDown={handleMouseDown('start')}
              title={formatDateForDisplay(startDate)}
            >
              <div className="marker-tooltip">{formatDateForDisplay(startDate)}</div>
            </div>
            
            {/* End marker */}
            <div
              ref={endMarkerRef}
              className={`timeline-marker end-marker ${isDragging === 'end' ? 'dragging' : ''}`}
              style={{ left: `${endPosition}%` }}
              onMouseDown={handleMouseDown('end')}
              title={formatDateForDisplay(endDate)}
            >
              <div className="marker-tooltip">{formatDateForDisplay(endDate)}</div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DateRangeTimeline; 