# HealthShare: Healthcare Frontline Stories Platform

![HealthShare Dashboard](./front-end-app/src/Assets/illustration.jpg)

## About HealthShare

HealthShare is an innovative data analytics platform designed to capture, organize, and visualize the experiences of healthcare professionals during the COVID-19 pandemic. By leveraging advanced machine learning and data mining techniques, this platform transforms scattered information from various social media sources into structured, searchable data that provides valuable insights into frontline healthcare experiences.

## Mission

Our mission is to amplify the voices of healthcare workers by making their experiences accessible and meaningful to researchers, policymakers, and the general public. By understanding these experiences, we aim to drive better healthcare policies and improve support systems for frontline workers.

## Key Features

### Data Collection and Analysis
- **Large Dataset**: Contains ~90K tweets, 10K articles, and 1K posts from healthcare professionals
- **Emotion Analysis**: Advanced sentiment and emotion analysis of healthcare worker content
- **Structured Database**: Organized repository of healthcare experiences

### Visual Analytics Dashboard
- **Interactive Visualizations**: Explore data through multiple visualization types:
  - Emotion Distribution Pie Charts
  - Word Clouds showing key topics and concerns
  - Emotion Spider Wheels for sentiment breakdown
  - Timeline Analysis showing trends over time

### Advanced Search Capabilities
- **Multi-faceted Search**: Filter by source, date range, and emotions
- **Timeline Date Range Selector**: Intuitive date range selection with draggable markers
- **Comparison Mode**: Compare multiple queries side-by-side
- **AI Insights**: Option to enable AI-powered analysis of search results

## Technology Stack

### Frontend
- React.js
- Bootstrap/React-Bootstrap for responsive UI
- D3.js for custom visualizations
- Material UI components

### Backend
- Node.js with Express
- PostgreSQL database
- NLP processing for emotion analysis

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- PostgreSQL (v12 or later)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/health-share.git
cd health-share
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../front-end-app
npm install
```

4. Configure database
- Create a PostgreSQL database
- Update the configuration in `backend/db.js`
- Run database setup scripts (if provided)

5. Start the backend server
```bash
cd backend
npm start
```

6. Start the frontend application
```bash
cd ../front-end-app
npm start
```

7. Access the application at `http://localhost:3000`

## Usage Guide

### Exploring Data
1. Navigate to the Visual Analytics dashboard from the main page
2. Use the Advanced Search to filter data by sources, date range, and emotions
3. View visualizations including emotion distributions, word clouds, and timeline data

### Comparison Analysis
1. Enable Comparison Mode in the Advanced Search
2. Create multiple queries with different parameters
3. View side-by-side visualizations to identify patterns and differences

### Understanding Emotions
- Click on sectors in the emotion pie chart to view specific texts
- Hover over the word cloud to see emotion associations with specific terms
- Use the timeline to track emotional trends over the pandemic period

## Project Structure

```
health-share/
├── backend/              # Express server and API routes
│   ├── db.js             # Database configuration
│   ├── routes/           # API endpoints
│   └── ...
├── front-end-app/        # React frontend application
│   ├── src/
│   │   ├── Assets/       # Images and static assets
│   │   ├── components/   # React components
│   │   │   ├── visualizations/  # Visualization components
│   │   │   └── ...
│   │   ├── pages/        # Page components
│   │   ├── styles/       # CSS styles
│   │   ├── utils/        # Utility functions
│   │   └── ...
│   └── ...
└── ...
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Healthcare professionals who shared their experiences
- Open-source libraries and tools that made this project possible
- Research funding and support from partner organizations

---

*Note: HealthShare is dedicated to healthcare workers worldwide who have worked tirelessly throughout the COVID-19 pandemic. Their stories matter, and through this platform, we hope to ensure their experiences lead to positive change.*