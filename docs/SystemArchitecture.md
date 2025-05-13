# Health-Share System Architecture

## Overview

The Health-Share system uses a modern web architecture with React frontend visualizations, an Express.js backend, and PostgreSQL database, all hosted on Amazon EC2 and fronted by an Nginx reverse proxy.

## Architecture Diagram

For a detailed architecture diagram, see:
- [Detailed ASCII Diagram](./architecture/health-share-architecture.md)
- [PlantUML Diagram](./architecture/health-share-architecture.puml) (can be rendered with any PlantUML renderer)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Amazon EC2 Instance                             │
│                                                                         │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────────────┐   │
│  │             │ HTTP  │             │ HTTP  │                     │   │
│  │   Client    │◄─────►│    Nginx    │◄─────►│  Express Backend    │   │
│  │  (Browser)  │       │ Reverse Proxy│       │                     │   │
│  │             │       │             │       │                     │   │
│  └─────────────┘       └─────────────┘       └─────────┬───────────┘   │
│                                                        │               │
│                                                        │ SQL           │
│                                                        ▼               │
│                                                ┌───────────────┐       │
│                                                │                │       │
│                                                │  PostgreSQL    │       │
│                                                │  Database      │       │
│                                                │                │       │
│                                                └───────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Client (React Frontend)
- **Description**: Single-page application built with React
- **Key Components**:
  - Advanced Search component for filtering data
  - Visualization components:
    - Emotion Word Cloud (`EmotionWordCloud.js`)
    - Emotion Pie Chart (`EmotionPieChart.js`) 
    - Emotion Timeline
    - Emotion Spider Wheel
  - React Bootstrap for UI components
  - D3.js and react-wordcloud for data visualization
- **Communication**: Makes HTTP requests to backend API endpoints via the Nginx reverse proxy

### 2. Nginx Reverse Proxy
- **Description**: Web server that acts as an intermediary between clients and backend
- **Responsibilities**:
  - Routes client requests to the correct backend service
  - Serves static frontend assets
  - SSL termination for HTTPS
  - Load balancing (if multiple backend instances exist)
  - Caching for improved performance
- **Configuration**: Listens on port 80/443 and proxies API requests to Express backend

### 3. Express Backend
- **Description**: Node.js server using Express framework
- **Key Endpoints**:
  - `/healthshare/api/wordcloud-data`: Provides word frequency data with emotion context
  - `/healthshare/api/emotion-max-distribution`: Returns emotion distribution data
  - `/healthshare/api/emotion-texts`: Returns text samples for specific emotions
  - `/healthshare/api/emotion-timeline`: Provides time-series emotion data
  - `/healthshare/api/emotion-spider`: Returns data for the Spider Wheel visualization
- **Responsibilities**:
  - API request handling
  - Data processing and aggregation
  - Query execution to PostgreSQL
  - Authentication and authorization
  - Error handling and logging

### 4. PostgreSQL Database
- **Description**: Relational database storing text data and emotion analysis
- **Key Data**:
  - Text entries with timestamps
  - Emotion scores for each text (anger, joy, fear, etc.)
  - Source information
  - User data (if applicable)
- **Responsibilities**:
  - Persistent data storage
  - Complex queries for emotion analysis
  - Data integrity and transactions
  - Backup and recovery

## Data Flow

1. **User Interaction**:
   - User interacts with visualization components in the browser
   - Frontend components update their state based on user actions
   - Advanced Search component allows filtering by source, date range, and emotions

2. **API Request Flow**:
   - Frontend sends HTTP requests to backend API endpoints
   - Request passes through Nginx reverse proxy
   - Nginx forwards request to Express backend
   - Express processes request and queries PostgreSQL database
   - Data returns through the same path in reverse

3. **Visualization Rendering**:
   - Frontend receives data from API
   - React components process and format data for visualization
   - D3.js or react-wordcloud renders the visualizations
   - User sees interactive charts showing emotional analysis

## Deployment

The entire solution is deployed on Amazon EC2, providing:
- Scalability through instance sizing or auto-scaling groups
- High availability with multi-AZ deployments (optional)
- Security through AWS security groups and network ACLs
- Cost-effectiveness compared to managed services
- Flexibility for custom configurations

## Security Considerations

- HTTPS for all client-server communications
- JWT or session-based authentication for protected endpoints
- Database credentials stored securely
- Regular security patches for all components
- Input validation and output sanitization to prevent injection attacks

## Scaling Considerations

- Horizontal scaling by adding more backend instances behind Nginx
- Database read replicas for scaling read operations
- Caching layers for frequently accessed data
- CDN for static assets
- Database partitioning for large datasets 