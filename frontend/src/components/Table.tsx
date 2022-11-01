import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createData(
  address: string,
  rssi: number,
  nodeId: number,
  timestamp: string
) {
  const date = new Date(timestamp)
  const _timestamp = (date.getHours() + 2 ) + ':' + date.getMinutes() + ':' + date.getSeconds()
  return { address, rssi, nodeId, timestamp: _timestamp };
}

export default function CustomizedTables() {
  const [blData, setBlData] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let interval = setInterval(() => {
      fetchData().catch(console.error)
    }, (config.refreshRate))

    const fetchData = async () => {
      const result = await axios.get(process.env.REACT_APP_BACKEND_URL + '/bluetooth')

      setBlData(result.data)
    }

    fetchData().catch(console.error)

    function resizeHeader() {
      const el = document.getElementById("header69")
      if (window.innerWidth < 1687 && el != null) {
        el.style.width = "100%"
      }
    }
    resizeHeader()

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (blData) {
      let newRows: any[] = []
      for (let element of blData) {
        for (let i = 0; i < element.seenBy.length; i++) {
          newRows.push((createData(element.hashedAddress, element.seenBy[i].rssi, element.seenBy[i].nodeId, element.seenBy[i].timestamp)))
        }
      }
      setRows(newRows)
    } else {
      setRows([createData('No devices found', -1, -1, '')])
    }
  }, [blData])

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 200 }} aria-label='customized table' margin-left='100' margin-right='100'>
        <TableHead>
          <TableRow>
            <StyledTableCell align='left'>Address</StyledTableCell>
            <StyledTableCell align='right'>RSSI</StyledTableCell>
            <StyledTableCell align='right'>Signal received by</StyledTableCell>
            <StyledTableCell align='right'>Timestamp</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <StyledTableRow key={i}>
              <StyledTableCell align='left'>{row.address}</StyledTableCell>
              <StyledTableCell align='right'>{row.rssi} dB</StyledTableCell>
              <StyledTableCell align='right'>{row.nodeId}</StyledTableCell>
              <StyledTableCell align='right'>{row.timestamp}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
