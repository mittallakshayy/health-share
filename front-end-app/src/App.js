import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import DisplayTable from "./components/DisplayTable";
import HomeIcon from "@mui/icons-material/Home";
import { Menu, MenuItem } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import {utils,writeFile} from "xlsx";
import LineChart from "./components/LineChart";

function App() {
  const [data, setData] = useState([]);
  const [twitterData, setTwitterData] = useState([]);
  const [queryString, setQueryString] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for the menu

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleClearSearch = () => {
    setQueryString(""); // Set query string to an empty string
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/healthshare/alldata", {
        mode: "cors",
      });
      const result = await response.json();
      console.log(result);
      setData(result);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }, []);

  const fetchTwitterData = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/healthshare/twitter-visualization", {
        mode: "cors",
      });
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

  const handleQuery = async (query) => {
    try {
      const url = new URL("http://localhost:3001/healthshare/querydata");
      url.searchParams.append("query", query);
      const response = await fetch(url, {
        mode: "cors",
      });
      const result = await response.json();
      console.log(result);
      setData(result);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleSortBy = async (source) => {
    try {
      const url = new URL("http://localhost:3003/healthshare/sortbysource");
      url.searchParams.append("source", source);
      const response = await fetch(url, {
        mode: "cors",
      });
      const result = await response.json();
      console.log(result);
      setData(result);
      handleMenuClose();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };
  const handleExport = async ()=> {
    const headings = [['Id', 'Text','Created at', 'Source' ]];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws,data,{origin: "A2",skipHeader:true});
    utils.book_append_sheet(wb, ws , "Data");
    writeFile(wb, "Data.xlsx");

  };
  
  return (
    
    <div className="m-5 mb-5">
      <div className="input-group p-2 mb-5">
        <HomeIcon
          style={{
            marginRight: "25px",
            fontSize: "2rem",
            marginTop: "0.2rem",
            cursor: "pointer",
          }}
          onClick={() => {
            fetchData();
            handleClearSearch(); // Clear the search bar input
          }}
        />
        <input
          type="search"
          id="query"
          className="form-control rounded"
          placeholder="Please enter your query"
          aria-label="Search"
          aria-describedby="search-addon"
          value={queryString} 
          onChange={(e) => setQueryString(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          style={{fontWeight:'bold'}}
          onClick={() => queryString && handleQuery(queryString)}
          data-mdb-ripple-init
        >
          search
        </button>
        <div>
          <button
            type="button"
            style={{marginLeft:'1rem', fontWeight:'bold'}}
            onClick={handleMenuOpen}
            className="btn btn-outline-primary"
          >
            Sort By
          </button>
          <DownloadIcon className="mx-3" onClick ={handleExport}></DownloadIcon>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleSortBy("Twitter")}>Twitter Data</MenuItem>
            <MenuItem onClick={() => handleSortBy("Facebook")}>Facebook Data</MenuItem>
            <MenuItem onClick={() => handleSortBy("Medium")}>Articles Data</MenuItem>
          </Menu>
        </div>
      </div>
      <div>
        <LineChart data={twitterData}/>
      </div>
      <div>
        <DisplayTable data={data} />
      </div>
    </div>
  );
}

export default App;
