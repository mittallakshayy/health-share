import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";

export default function BasicTable(props) {
  const [sortBy, setSortBy] = React.useState(null);
  const [sortOrder, setSortOrder] = React.useState("asc");
  const rows = props.data;
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    } else {
      return text.substring(0, maxLength) + "..."; // Truncate text and add ellipsis
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
      <Table sx={{ minWidth: 950 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <b></b>
            </TableCell>
            <TableCell align="center">
              <b>ID</b>
            </TableCell>
            <TableCell align="center">
              <b>Text</b>
            </TableCell>
            <TableCell align="center">
              <TableSortLabel
                active={sortBy === "created_at"}
                direction={sortOrder}
                onClick={handleSortChange("created_at")}
              >
                <b>Timestamp</b>
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">
              <b>Source</b>
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
                {index + 1}
              </TableCell>
              <TableCell align="center">{row.id}</TableCell>
              <TableCell align="center">{truncateText(row.text, 100)}</TableCell>
              <TableCell align="center">{row.created_at}</TableCell>
              <TableCell align="center">{row.data_source}</TableCell>
              <TableCell align="center">{row.url}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
