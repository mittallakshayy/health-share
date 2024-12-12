import React, { useState } from 'react';

const AdvancedSearch = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sourceType, setSourceType] = useState("all");

  return (
    <div style={{
      marginTop: '6px',
      padding: '25px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: 'auto',
    }}>
      <h4 style={{
        marginBottom: '20px',
        fontWeight: 'bold',
        textAlign: 'center',
      }}>Advanced Search</h4>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', width: '100%', marginBottom: '5px', fontWeight: 'bold', fontSize: '16px' }}>
          Keywords:
        </label>
        <input
          type="text"
          name="keywords"
          placeholder="Enter keywords"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #bbb',
            fontSize: '15px',
          }}
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', width: '100%', marginBottom: '5px', fontWeight: 'bold', fontSize: '16px' }}>
          Source Type:
        </label>
        <select
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #bbb',
            fontSize: '15px',
          }}
          name="sourceType"
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="news">CNN</option>
          <option value="social-media">Social Media</option>
          <option value="articles">Articles</option>
        </select>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', width: '100%', marginBottom: '5px', fontWeight: 'bold', fontSize: '16px' }}>
          Date Range:
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '48%' }}>
            <span style={{ marginRight: '5px' }}>From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #bbb',
                fontSize: '15px',
              }}
            />
          </div>
          <div style={{ width: '48%' }}>
            <span style={{ marginRight: '5px' }}>To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #bbb',
                fontSize: '15px',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', width: '100%', marginBottom: '5px', fontWeight: 'bold', fontSize: '16px' }}>
          Article Type:
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            News
            <input type="checkbox" style={{ marginLeft: '5px' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            Social Media
            <input type="checkbox" style={{ marginLeft: '5px' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            Articles
            <input type="checkbox" style={{ marginLeft: '5px' }} />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', width: '100%', marginBottom: '5px', fontWeight: 'bold', fontSize: '16px' }}>
          Sort By:
        </label>
        <select
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #bbb',
            fontSize: '15px',
          }}
          name="sortBy"
        >
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
        </select>
      </div>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button style={{
          marginRight: '10px',
          cursor: 'pointer',
          padding: '12px 25px',
          borderRadius: '5px',
          border: '1px solid #0077b6',
          backgroundColor: '#0077b6',
          color: 'white',
          fontSize: '15px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s, border-color 0.3s',
        }}>
          Search
        </button>
        <button style={{
          cursor: 'pointer',
          padding: '12px 25px',
          borderRadius: '5px',
          border: '1px solid #888',
          backgroundColor: '#ccc',
          color: 'white',
          fontSize: '15px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s, border-color 0.3s',
        }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearch;