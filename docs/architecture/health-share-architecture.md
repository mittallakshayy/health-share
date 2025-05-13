# Health-Share System Architecture

## Architecture Diagram

```
+------------------------------------------+
|             Client Browser               |
|  +------------------------------------+  |
|  |          React Frontend            |  |
|  |  +-------------+ +--------------+  |  |
|  |  | AdvancedSearch |  |  EmotionWordCloud |  |
|  |  +-------------+ +--------------+  |  |
|  |                                    |  |
|  |  +--------------+ +--------------+ |  |
|  |  | EmotionPieChart |  | EmotionTimeline |  |
|  |  +--------------+ +--------------+ |  |
|  |                                    |  |
|  |  +--------------+                  |  |
|  |  | EmotionSpiderWheel|                  |  |
|  |  +--------------+                  |  |
|  +------------------------------------+  |
+------------------||---------------------+
                   || HTTP/HTTPS
                   \/
+------------------------------------------+
|        Amazon EC2 Instance               |
|  +------------------------------------+  |
|  |       Nginx Reverse Proxy          |  |
|  |  +------------+ +---------------+  |  |
|  |  | Static Files | | API Routing    |  |
|  |  +------------+ +---------------+  |  |
|  +----------------||------------------+  |
|                   || HTTP                |
|                   \/                     |
|  +------------------------------------+  |
|  |        Express Backend             |  |
|  |  +---------------------------+     |  |
|  |  |       API Endpoints       |     |  |
|  |  | /healthshare/api/wordcloud-data |  |
|  |  | /healthshare/api/emotion-max-... |  |
|  |  | /healthshare/api/emotion-texts  |  |
|  |  | /healthshare/api/emotion-timeline |  |
|  |  | /healthshare/api/emotion-spider |  |
|  |  +---------------------------+     |  |
|  |  |     Data Processing       |     |  |
|  |  +------------||-------------+     |  |
|  +----------------||------------------+  |
|                   || SQL                 |
|                   \/                     |
|  +------------------------------------+  |
|  |       PostgreSQL Database          |  |
|  |  +------------+ +---------------+  |  |
|  |  | Text Data    | | Emotion Values |  |
|  |  +------------+ +---------------+  |  |
|  |  +------------+                    |  |
|  |  | Sources     |                    |  |
|  |  +------------+                    |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Data Flow

1. User interacts with visualization components in the React frontend
2. Frontend components make HTTP requests through the Nginx reverse proxy
3. Nginx forwards requests to the appropriate Express backend endpoints
4. Express backend processes requests, retrieves and analyzes data from PostgreSQL
5. Data flows back through the same path to update frontend visualizations

## Component Details

### Frontend (React)
- User interface with emotion visualization components
- Built with React and React Bootstrap
- Uses D3.js and react-wordcloud for visualizations
- Communicates with backend through RESTful API calls

### Nginx Reverse Proxy
- Routes incoming requests
- Serves static frontend files
- Provides SSL termination
- Enables horizontal scaling of backend services

### Express Backend
- Handles API requests from frontend
- Processes emotion analysis data
- Aggregates results for visualizations
- Communicates with PostgreSQL database

### PostgreSQL Database
- Stores all text entries with emotion analysis
- Maintains data relationships between texts and sources
- Enables complex queries for emotion analysis
- Provides data persistence and integrity

## Deployment Environment
- All components are deployed on Amazon EC2
- Instance is configured for high availability
- Security groups control network access
- Backup and recovery processes ensure data durability 