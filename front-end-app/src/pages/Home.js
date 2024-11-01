import React, { useState, useEffect, useCallback } from "react";
import DisplayTable from "../components/DisplayTable";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from 'react-router-dom';
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft"; 
import DownloadIcon from "@mui/icons-material/Download";
import { Menu, MenuItem } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import { utils, writeFile } from "xlsx";
import SearchIcon from "@mui/icons-material/Search";
import API_URL from "../apis/api";

function Home() {
  const [data, setData] = useState([]);
  const [currentSource, setCurrentSource] = useState([]);
  const resultsPerPage = 50;
  const [totalRecords, setTotalRecords] = useState(0); 
  const [pageNumbers, setPageNumbers] = useState([]); 
  const [queryString, setQueryString] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); 
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    console.log('Current Source Updated:', currentSource);
}, [currentSource]);
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


  const fetchData = useCallback(async (page = 1) => {
    try {
      const response = await fetch(API_URL + `/healthshare/api/alldata?page=${page}`, {
        mode: "cors",
      });
      const result = await response.json();

      setData(result.data);
      setTotalRecords(result.totalRecords);
      setCurrentPage(page);
      
      const totalPages = Math.ceil(result.totalRecords / resultsPerPage);
      const numberOfPages = 6;
      const startPage = Math.max(1, page - Math.floor(numberOfPages / 2));
      const endPage = Math.min(totalPages, startPage + numberOfPages - 1);
     
      const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
      setPageNumbers(pages);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }}, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuery = async (query) => {
    try {
      const response = await fetch(API_URL + `/healthshare/api/querydata?query=${query}`, {
        mode: "cors",
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };
  const handleSortBy = useCallback(async (sources, page = 1) => {
    try {
        const response = await fetch(API_URL + `/healthshare/api/sortbysource?source=${sources}&page=${page}`, {
            mode: "cors",
        });
        if (!response.ok) {
            const errorText = await response.text(); 
            console.error("Error response:", errorText); 
            throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result.data);
        setTotalRecords(result.totalRecords);
        setCurrentPage(page);
        const totalPages = Math.ceil(result.totalRecords / resultsPerPage);
        const numberOfPages = 6; 
        const startPage = Math.max(1, page - Math.floor(numberOfPages / 2));
        const endPage = Math.min(totalPages, startPage + numberOfPages - 1);
        const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
        setPageNumbers(pages);
        handleMenuClose(); 
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

  const handleExportAllResults = async () => { 
    try {
      const sources = currentSource.join(','); 
      const response = await fetch(`${API_URL}/healthshare/api/allresults?source=${sources}`, {
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
        <button
        disabled={currentPage === 1}
        onClick={() => {
        
          if (currentSource.length === 0) {
            fetchData(currentPage - 1); 
          } else {
            handleSortBy(currentSource.join(','), currentPage - 1); 
          }
        }}
        style={{
          marginRight: '10px',
          borderRadius: "6px",
          border:'none',
          backgroundColor:'white',
          cursor: "pointer",
        }}
      >
          <KeyboardArrowLeft style={{ color: "#6eb9e6", fontSize: "2rem" }} />
      </button>
        <div style={{ display: "flex", alignItems: "center" }}>
          <HomeIcon
            style={{ marginRight: "10px", fontSize: "2rem", cursor: "pointer", color: "white" }}
            onClick={() => {
              fetchData();
              setCurrentSource([]);
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
          backgroundColor: queryString ? "#f7f7f7" : "white", 
          transition: "background-color 0.1s", 
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
          color:"#5894b8", 
          transition: "color 0.3s", 
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
          Filter
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
              <MenuItem sx={menuStyles.menuItem} onClick={handleExportAllResults}>
              Download All Results
              </MenuItem>
            </Menu>
            <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleMenuClose}
    PaperProps={{ sx: menuStyles.paper }}
>
{["Twitter", "Facebook", "Medium", "CNN"].map((source) => (
        <MenuItem key={source} sx={menuStyles.menuItem}>
        <Checkbox
          size="small"
          sx={{
              marginRight: '9px',
              color: 'white',
              '&.Mui-checked': {
                  color: 'white',
              }
          }}
          checked={currentSource.includes(source)}
          onChange={() => {
         
            const isSourceSelected = currentSource.includes(source);
          
            const updatedSources = isSourceSelected 
                ? currentSource.filter((s) => s !== source) 
                : [...currentSource, source]; 
                setCurrentSource(updatedSources);
                console.log(currentSource);

            
            if (updatedSources.length === 0) {
                fetchData(); 
            } else {
                handleSortBy(updatedSources.join(','), 1); 
            }
        }} 
    />
                {source}
            </MenuItem>
        ))}
        </Menu>
        </div>
      </div>

      <div style={{ paddingTop: "2px" }}>
      <DisplayTable data={data} startIndex={(currentPage - 1) * resultsPerPage + 1} />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
  {/* First Page Button */}
  <button
    disabled={currentPage === 1}
    onClick={() => {
      if (currentSource.length === 0) {
        fetchData(1); // Navigate to the first page
      } else {
        handleSortBy(currentSource.join(','), 1); // Navigate to the first page with sorting
      }
    }}
    style={{
      marginRight: '10px',
      border: '1px solid #58afe2',
      color: currentPage === 1 ? '#aaa' : '#58afe2',
      backgroundColor: currentPage === 1 ? '#f0f0f0' : '#fff',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: currentPage === 1 ? 'default' : 'pointer',
      transition: 'background-color 0.3s, color 0.3s',
    }}
  >
    &laquo; First
  </button>

  {/* Previous Page Button */}
  <button
    disabled={currentPage === 1}
    onClick={() => {
      if (currentSource.length === 0) {
        fetchData(currentPage - 1); // Navigate to the previous page
      } else {
        handleSortBy(currentSource.join(','), currentPage - 1); // Navigate to the previous page with sorting
      }
    }}
    style={{
      marginRight: '10px',
      border: '1px solid #58afe2',
      color: currentPage === 1 ? '#aaa' : '#58afe2',
      backgroundColor: currentPage === 1 ? '#f0f0f0' : '#fff',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: currentPage === 1 ? 'default' : 'pointer',
      transition: 'background-color 0.3s, color 0.3s',
    }}
  >
    &lsaquo;
  </button>

  {/* Page Number Buttons */}
  {pageNumbers.map((page) => (
    <button
      key={page}
      onClick={() => {
        if (currentSource.length === 0) {
          fetchData(page); // Fetch data for the selected page
        } else {
          handleSortBy(currentSource.join(','), page); // Fetch sorted data for the selected page
        }
      }}
      style={{
        margin: '0 5px',
        fontWeight: currentPage === page ? 'bold' : 'normal',
        color: currentPage === page ? '#fff' : '#58afe2',
        backgroundColor: currentPage === page ? '#58afe2' : '#fff',
        border: '1px solid #58afe2',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, color 0.3s',
      }}
    >
      {page}
    </button>
  ))}

  {/* Next Page Button */}
  <button
    disabled={currentPage === Math.ceil(totalRecords / resultsPerPage)}
    onClick={() => {
      if (currentSource.length === 0) {
        fetchData(currentPage + 1); // Navigate to the next page
      } else {
        handleSortBy(currentSource.join(','), currentPage + 1); // Navigate to the next page with sorting
      }
    }}
    style={{
      marginLeft: '10px',
      border: '1px solid #58afe2',
      color: currentPage === Math.ceil(totalRecords / resultsPerPage) ? '#aaa' : '#58afe2',
      backgroundColor: currentPage === Math.ceil(totalRecords / resultsPerPage) ? '#f0f0f0' : '#fff',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: currentPage === Math.ceil(totalRecords / resultsPerPage) ? 'default' : 'pointer',
      transition: 'background-color 0.3s, color 0.3s',
    }}
  >
    &rsaquo;
  </button>

  {/* Last Page Button */}
  <button
    disabled={currentPage === Math.ceil(totalRecords / resultsPerPage)}
    onClick={() => {
      const lastPage = Math.ceil(totalRecords / resultsPerPage);
      if (currentSource.length === 0) {
        fetchData(lastPage); // Navigate to the last page
      } else {
        handleSortBy(currentSource.join(','), lastPage); // Navigate to the last page with sorting
      }
    }}
    style={{
      marginLeft: '10px',
      border: '1px solid #58afe2',
      color: currentPage === Math.ceil(totalRecords / resultsPerPage) ? '#aaa' : '#58afe2',
      backgroundColor: currentPage === Math.ceil(totalRecords / resultsPerPage) ? '#f0f0f0' : '#fff',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: currentPage === Math.ceil(totalRecords / resultsPerPage) ? 'default' : 'pointer',
      transition: 'background-color 0.3s, color 0.3s',
    }}
  >
    Last &raquo;
  </button>
</div>



      </div>


    </div>
  );
}

export default Home;
