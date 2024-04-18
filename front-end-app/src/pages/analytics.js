import React, { useState, useEffect, useCallback } from "react";
import { Menu, MenuItem } from "@mui/material";
import { utils, writeFile } from "xlsx";
import LineChart from "../components/LineChart";


function Analytics() {
    const [data, setData] = useState([]);
    const [twitterData, setTwitterData] = useState([]);
    const fetchData = useCallback(async () => {
        try {
          const response = await fetch(
            "http://localhost:3003/healthshare/alldata",
            {
              mode: "cors",
            }
          );
          const result = await response.json();
          console.log(result);
          setData(result);
        } catch (error) {
          console.error("There was a problem with the fetch operation:", error);
        }
      }, []);
    const fetchTwitterData = useCallback(async () => {
        try {
          const response = await fetch(
            "http://localhost:3003/healthshare/twitter-visualization",
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
        fetchData();
        fetchTwitterData();
      }, [fetchData, fetchTwitterData]);
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