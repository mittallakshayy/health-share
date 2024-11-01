import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { Link } from "react-router-dom";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";

export default function BasicTable(props) {
  const [sortBy, setSortBy] = React.useState(null);
  const [expandedTextId, setExpandedTextId] = React.useState(null);
  const [sortOrder, setSortOrder] = React.useState("asc");
  const startIndex = props.startIndex;
  const rows = props.data;
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    } else {
      return text.substring(0, maxLength) + "..."; // Truncate text and add ellipsis
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) { // Check for empty or undefined date
      return ''; // Return empty string if no valid date
    }

    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  };
  const handleExpandText = (id) => {
    if (expandedTextId === id) {
      setExpandedTextId(null);
    } else {
      setExpandedTextId(id);
    }
  };

  const handleSortChange = (property) => (event) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  const sortedRows = rows.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 950, backgroundColor:"aliceblue" }} aria-label="simple table">
        <TableHead style={{backgroundColor:'aliceblue'}}>
          <TableRow>
            <TableCell align="center">
              <b></b>
            </TableCell>
            <TableCell align="center">
              <b>Source</b>
            </TableCell>
            <TableCell align="center">
              <TableSortLabel
                active={sortBy === "created_at"}
                direction={sortOrder}
                onClick={handleSortChange("created_at")}
              >
                <b>Date</b>
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">
              <b>Text</b>
            </TableCell>
            
           
            <TableCell align="center">
              <b>URL</b>
            </TableCell>
          </TableRow>
        </TableHead>
       <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row" align="center">
                {props.startIndex + index} {/* Use startIndex to continue serial numbers */}
              </TableCell>
              <TableCell align="center">{row.data_source}</TableCell>
              <TableCell align="center">{formatDate(row.created_at)}</TableCell>       
              <TableCell align="left">
                {row.data_source === "Medium" || row.data_source === "CNN" ? (
                  <Link to={`/article/${row.id}`}
                    style={{ background: "none", color: "black", border: "none", cursor: "pointer", textDecoration: "none" }}
                    onMouseOver={(e) => e.target.style.color = "#2598da"}
                    onMouseOut={(e) => e.target.style.color = "black"}  
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`/article/${row.id}`, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {truncateText(row.text, 100)}
                  </Link>
                ) : (
                  <>
                    {expandedTextId === row.id ? (
                      <>
                        {row.text || 'No Text Available'}  {/* Default text if row.text is null */}
                        <span style={{ color: "#238bc8", cursor: "pointer" }} onClick={() => handleExpandText(row.id)}>less</span>
                      </>
                    ) : (
                      <>
                        {truncateText(row.text || '', 100)}  {/* Use empty string if text is null */}
                        <span style={{ color: "#238bc8", cursor: "pointer" }} onClick={() => handleExpandText(row.id)}>more</span>
                      </>
                    )}
                  </>
                )}
              </TableCell>
            
              
              <TableCell align="center">
                <a href={row.url} style={{ color: "#1a6a98", marginBottom: "10px" }} target="_blank"
  rel="noopener noreferrer">click here</a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
