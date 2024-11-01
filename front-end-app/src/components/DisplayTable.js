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
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function BasicTable(props) {
  const [sortBy, setSortBy] = React.useState(null);
  const [expandedTextId, setExpandedTextId] = React.useState(null);
  const [sortOrder, setSortOrder] = React.useState("asc");
  const [openModal, setOpenModal] = React.useState(false);
  const [modalText, setModalText] = React.useState('');
  
  const startIndex = props.startIndex;
  const rows = props.data;

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    } else {
      return text.substring(0, maxLength) + "..."; 
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  };

  const handleOpenModal = (text) => {
    setModalText(text);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalText('');
  };

  const handleSortChange = (property) => (event) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 950, backgroundColor: "aliceblue" }} aria-label="simple table">
        <TableHead style={{ backgroundColor: 'aliceblue' }}>
          <TableRow>
            <TableCell align="center"><b>Sr No</b></TableCell>
            <TableCell align="center"><b>Source</b></TableCell>
            <TableCell align="center">
              <TableSortLabel
                active={sortBy === "created_at"}
                direction={sortOrder}
                onClick={handleSortChange("created_at")}
              >
                <b>Date</b>
              </TableSortLabel>
            </TableCell>
            <TableCell align="center"><b>Text</b></TableCell>
            <TableCell align="center"><b>URL</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row" align="center">
                {startIndex + index} {/* Use startIndex to continue serial numbers */}
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
                    {truncateText(row.text || '', 100)}  {/* Use empty string if text is null */}
                    <span
                      style={{ color: "#238bc8", cursor: "pointer" }}
                      onClick={() => handleOpenModal(row.text || 'No Text Available')}
                    >
                      more
                    </span>
                  </>
                )}
              </TableCell>
              <TableCell align="center">
                {(row.data_source === "Medium" || row.data_source === "CNN") && (
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1a6a98", marginBottom: "10px" }}
                  >
                    click here
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Modal for expanded text */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          <p id="modal-description">{modalText}</p>
        </Box>
      </Modal>
    </TableContainer>
  );
}
