import React, { useState } from 'react';

const AdvancedSearch = () => {
  // State to hold form inputs
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sourceType, setSourceType] = useState("all");
  


  return (
    <div style={{ marginTop: '6px',backgroundColor: "#f6fbfd", padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
    <h5 style={{ color: "#333", marginBottom: '15px',fontWeight:'bold' }}>Advanced Search</h5>
    <div style={{ marginBottom: '13px' }}>
      <label style={{ display: 'block', margin: '3px', fontWeight:'bold' }}>
        Keywords: 
        <input
          type="text"
          name="keywords"
          placeholder="Enter keywords"
          style={{
            width: '30%',
            marginLeft:'46px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        />
      </label>
      </div>
      <div style={{ marginBottom: '13px' }}>
        <label style={{ display: 'block', margin: '3px', fontWeight:'bold'  }}>
          Source Type:
          <select style={{
              width: '30%',
              marginLeft:'26px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }} 
            name="sourceType" 
            value={sourceType} 
            onChange={(e) => setSourceType(e.target.value)}>
            <option value="all">All</option>
            <option value="news">CNN</option>
            <option value="social-media">Social Media</option>
            <option value="articles">Articles</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '13px' }}>
      <label style={{ display: 'flex', alignItems: 'center', margin: '3px', fontWeight: 'bold' }}>
    Date Range:
    <span style={{ fontWeight:'normal', marginLeft: '32px', marginRight: '5px' }}>From</span>
    <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            width: '100px', // Set width appropriately
            marginRight: '5px', // Space between input fields
        }}
    />
    <span style={{ fontWeight:'normal', marginRight: '5px' }}>To</span>
    <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            width: '100px', // Set width appropriately
        }}
    />
</label>
      </div>
      <div style={{ marginBottom: '13px', display:'flex' }}>
    <label style={{ fontWeight: 'bold', margin: '3px' }}>
        Article Type:
    </label>
    <span style={{ marginLeft: '23px', display:'flex'}}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: '10px'}}>
            News
            <input 
                type="checkbox" 
                style={{marginLeft:'5px'}}
               
            /> 
        </label>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
            Social Media
            <input 
                type="checkbox" 
                style={{marginLeft:'5px'}}
            /> 
        </label>
        <label style={{ display: 'flex', alignItems: 'center' }}>
            Articles
            <input 
                type="checkbox" 
                style={{marginLeft:'5px'}}
            /> 
        </label> </span> </div>
      <div style={{ marginTop: '10px' }}>
        <button style={{ 
            marginRight: '10px', 
            cursor: 'pointer', 
            padding: '10px 15px',
            borderRadius: '4px',
            border: '1px solid #58afe2',
            backgroundColor: '#58afe2', // Match the color scheme
            color: 'white', 
            fontSize: '14px', 
            fontWeight: 'bold',
            transition: 'background-color 0.3s, border-color 0.3s', // Smooth transition on hover
        }} >
          Search
        </button>
        <button style={{ 
            marginRight: '10px', 
            cursor: 'pointer', 
            padding: '10px 15px',
            borderRadius: '4px',
            border: '1px solid #58afe2',
            backgroundColor: '#58afe2', // Match the color scheme
            color: 'white', 
            fontSize: '14px', 
            fontWeight: 'bold',
            transition: 'background-color 0.3s, border-color 0.3s', // Smooth transition on hover
        }} >
          Close
        </button>
      </div>
    </div>
  )} 

export default AdvancedSearch;
