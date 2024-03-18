import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function BasicTable(props) {
  const rows = props.data;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 950 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center"> {/* Align the header cell content in the center */}
              <b></b>
            </TableCell>
            <TableCell align="center"> {/* Align the header cell content in the center */}
              <b>Id</b>
            </TableCell>
            <TableCell align="center"> {/* Align the header cell content in the center */}
              <b>Text</b>
            </TableCell>
            <TableCell align="center"> {/* Align the header cell content in the center */}
              <b>Created at</b>
            </TableCell>
            <TableCell align="center"> {/* Align the header cell content in the center */}
              <b>Data Source</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row" align="center">
                {index + 1} {/* Display serial number (1-based index) */}
              </TableCell>
              <TableCell align="center">{row.id}</TableCell>
              <TableCell align="center">{row.text}</TableCell>
              <TableCell align="center">{row.created_at}</TableCell>
              <TableCell align="center">{row.data_source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
