import React, { useState, useEffect, useCallback } from "react";
import DisplayTable from "../components/DisplayTable";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from 'react-router-dom';
import DownloadIcon from "@mui/icons-material/Download";
import { Menu, MenuItem } from "@mui/material";
import { utils, writeFile } from "xlsx";
import SearchIcon from "@mui/icons-material/Search";
import API_URL from "../apis/api";

function Home() {
  const [data, setData] = useState([]);
  const [currentSource, setCurrentSource] = useState("All");
  const resultsPerPage = 50;
  const [totalRecords, setTotalRecords] = useState(0); // State for total records
  const [pageNumbers, setPageNumbers] = useState([]); // State for page numbers display
  const [queryString, setQueryString] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for the menu
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

const menuStyles = {
    paper: {
      backgroundColor: "#99ceed",
      color: "white",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      borderRadius: "8px",
    },
    menuItem: {
      padding: "10px 20px",
      fontSize: "15px",
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "#6eb9e6",
      },
    },};

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportMenuOpen = (event) => {
    setExportMenuAnchorEl(event.currentTarget);
  };
  
  const handleExportMenuClose = () => {
    setExportMenuAnchorEl(null);
  };

  const handleClearSearch = () => {
    setQueryString("");
  };

  //this fetches data at each page number
  const fetchData = useCallback(async (page = 1) => {
    try {
      const response = await fetch(API_URL + `/healthshare/api/alldata?page=${page}`, {
        mode: "cors",
      });
      const result = await response.json();
      setData(result.data);
      setTotalRecords(result.totalRecords);
      setCurrentPage(page);
      
      // Calculate page numbers for pagination
      const totalPages = Math.ceil(result.totalRecords / resultsPerPage);
      const numberOfPages = 6; // Max pages to show
      const startPage = Math.max(1, page - Math.floor(numberOfPages / 2));
      const endPage = Math.min(totalPages, startPage + numberOfPages - 1);
      // Create an array of page numbers
      const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
      setPageNumbers(pages);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }}, []);
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleQuery = async (query) => {
    try {
      const url = new URL(API_URL + "/healthshare/api/querydata");
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

  const handleSortBy = useCallback(async (source, page = 1) => {
    try {
      const response = await fetch(API_URL + `/healthshare/api/sortbysource?source=${source}&page=${page}`, {
        mode: "cors",
      });
      const result = await response.json();
      // Update the state with the new sorted data
      setData(result.data);
      setTotalRecords(result.totalRecords);
      setCurrentPage(page);
      setCurrentSource(source); // Set the current source
      // Calculate page numbers for pagination
      const totalPages = Math.ceil(result.totalRecords / resultsPerPage);
      const numberOfPages = 6; // Max pages to show
      const startPage = Math.max(1, page - Math.floor(numberOfPages / 2));
      const endPage = Math.min(totalPages, startPage + numberOfPages - 1);
      // Create an array of page numbers
      const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
      setPageNumbers(pages);
      handleMenuClose(); // Close the sort menu
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }, []);
  
  const handleExportCurrentPage = () => {
    const headings = [["Id", "Text", "Created at", "Source"]];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws, data, { origin: "A2", skipHeader: true });
    utils.book_append_sheet(wb, ws, "Current Page");
    writeFile(wb, "Current_Page_Data.xlsx");
    handleExportMenuClose();
  };

  const handleExportAllResults = async (source) => {
    try {
      const response = await fetch(`${API_URL}/healthshare/api/allresults?source=${source}`, {
        mode: "cors",
      });
      const result = await response.json();
      const allData = result.data;
      if (!allData.length) return;
      const headings = [["Id", "Text", "Created at", "Source"]];
      const wb = utils.book_new();
      const ws = utils.json_to_sheet([]);
      utils.sheet_add_aoa(ws, headings);
      utils.sheet_add_json(ws, allData, { origin: "A2", skipHeader: true });
      utils.book_append_sheet(wb, ws, "All Data");
      writeFile(wb, "All_Data.xlsx");
      handleExportMenuClose();
    } catch (error) {
      console.error("There was a problem fetching all results:", error);
    }
  };
  
  return  (
    <div className="m-3">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px",
          backgroundColor: "#6eb9e6",
          color: "white",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <HomeIcon
            style={{ marginRight: "10px", fontSize: "2rem", cursor: "pointer", color: "white" }}
            onClick={() => {
              fetchData();
              setCurrentSource("All");
              handleClearSearch();
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "right", flex: 1, justifyContent: "right" }}>
        <div style={{ position: "relative", width: "40%" }}>
      <input
        type="search"
        id="query"
        style={{
          padding: "10px 40px 10px 15px",
          borderRadius: "20px",
          border: "none",
          width: "100%",
          outline: 'none',
          fontSize: "13px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          backgroundColor: queryString ? "#f7f7f7" : "white", // Change color if text is present
          transition: "background-color 0.1s", // Smooth transition for color change
        }}
        placeholder="Search here"
        aria-label="Search"
        value={queryString}
        onChange={(e) => setQueryString(e.target.value)}
      />
      <SearchIcon
        style={{
          position: "absolute",
          right: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "1.5rem",
          cursor: "pointer",
          color:"#5894b8", // Change icon color when clicked
          transition: "color 0.3s", // Smooth transition for color change
        }}
        onClick={() => queryString && handleQuery(queryString)} />
    </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link to="/search">
          <button
            style={{
              marginLeft: '10px',
              padding: "10px",
              height: "100%",
              borderRadius:'6px',
              fontWeight: 'bold',
              border: "none",
              backgroundColor: 'inherit',
              color: "white",
              cursor: "pointer",
              fontSize: "15px",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#99ceed"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "inherit"}
          >
            Advanced Search
          </button>
        </Link>

        <button
          style={{
            marginLeft: '10px',
            padding: "10px",
            height: "100%",
            borderRadius:'6px',
            fontWeight: 'bold',
            border: "none",
            backgroundColor: 'inherit',
            color: "white",
            cursor: "pointer",
            fontSize: "15px",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#99ceed"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "inherit"}
          onClick={handleMenuOpen}
        >
          Sort By
        </button>

        <DownloadIcon
          style={{ marginLeft: "10px", fontSize: "1.8rem", cursor: "pointer", color: "white" }}
          onClick={handleExportMenuOpen}/>
            <Menu
              anchorEl={exportMenuAnchorEl}
              open={Boolean(exportMenuAnchorEl)}
              onClose={handleExportMenuClose}
              PaperProps={{ sx: menuStyles.paper }}>
              <MenuItem sx={menuStyles.menuItem} onClick={handleExportCurrentPage}>
                Download Current Page
              </MenuItem>
              <MenuItem sx={menuStyles.menuItem} onClick={() => handleExportAllResults(currentSource)}>
                Download All Results
              </MenuItem>
            </Menu>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{ sx: menuStyles.paper }}>
            <MenuItem sx={menuStyles.menuItem} onClick={() => { fetchData(); handleMenuClose(); setCurrentSource(null); }}>
              All
            </MenuItem>
            <MenuItem sx={menuStyles.menuItem} onClick={() => { handleSortBy("Twitter"); handleMenuClose(); }}>
              Twitter
            </MenuItem>
            <MenuItem sx={menuStyles.menuItem} onClick={() => { handleSortBy("Facebook"); handleMenuClose(); }}>
              Facebook
            </MenuItem>
            <MenuItem sx={menuStyles.menuItem} onClick={() => { handleSortBy("Medium"); handleMenuClose(); }}>
              Medium
            </MenuItem>
            <MenuItem sx={menuStyles.menuItem} onClick={() => { handleSortBy("CNN"); handleMenuClose(); }}>
              CNN
            </MenuItem>
          </Menu>
        </div>
      </div>

      <div style={{ paddingTop: "2px" }}>
      <DisplayTable data={data} startIndex={(currentPage - 1) * resultsPerPage + 1} />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <button
  disabled={currentPage === 1}
  onClick={() => {
    // Check if currentSource is "All" explicitly
    if (currentSource === "All") {
      fetchData(currentPage - 1); // Call fetchData for the previous page
    } else {
      handleSortBy(currentSource, currentPage - 1); // Call handleSortBy for other sources
    }
  }}
  style={{ marginRight: '10px', border: '1px solid black' }}
>
  &#60; {/* Previous arrow */}
</button>

{pageNumbers.map((page) => (
  <button
    key={page}
    onClick={() => {
      // Again check if currentSource is "All"
      if (currentSource === "All") {
        fetchData(page); // Fetch data for this specific page when source is "All"
      } else {
        handleSortBy(currentSource, page); // Sort by current source for this specific page
      }
    }}
    style={{
      margin: '0 5px',
      fontWeight: currentPage === page ? 'bold' : 'normal',
      backgroundColor: currentPage === page ? '#80bddc' : 'transparent',
      border: '1px solid #ccc',
      padding: '5px 10px',
      cursor: 'pointer',
    }}
  >
    {page}
  </button>
))}

<button
  disabled={currentPage === Math.ceil(totalRecords / resultsPerPage)}
  onClick={() => {
    // Check if currentSource is "All"
    if (currentSource === "All") {
      fetchData(currentPage + 1); // Fetch next page data when the source is "All"
    } else {
      handleSortBy(currentSource, currentPage + 1); // Use handleSortBy for other sources
    }
  }}
  style={{ marginLeft: '10px', border: '1px solid black' }}
>
  &#62; {/* Next arrow */}
</button>
      </div>
</div>


    </div>
  );
}

export default Home;
