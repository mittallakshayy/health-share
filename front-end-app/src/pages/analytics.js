import React, { useState, useEffect, useCallback } from "react";
import LineChart from "../components/LineChart";
import API_URL from "../apis/api";

function Analytics() {
  const [twitterData, setTwitterData] = useState([]);
  const fetchTwitterData = useCallback(async () => {
    try {
      const response = await fetch(
        API_URL + "/healthshare/api/twitter-visualization",
        {
          mode: "cors",
        }
      );
      const result = await response.json();
      setTwitterData(result);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }, []);

  useEffect(() => {
    fetchTwitterData();
  }, [fetchTwitterData]);
  return (
    <div style={containerStyle}>
      <LineChart data={twitterData} />
    </div>
  );
}

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  height: "100vh",
  padding: "2rem", // Adjust the gap size as needed
};

export default Analytics;
