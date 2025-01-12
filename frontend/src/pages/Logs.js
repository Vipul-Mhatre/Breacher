import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Grid,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Info as InfoIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config';
import LogDetailsDialog from '../components/LogDetailsDialog';
import { TableContainer as MuiTableContainer } from '@mui/material';

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StyledTableContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function Logs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    type: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/logs`, {
        params: {
          page,
          limit: rowsPerPage,
          ...filters
        }
      });
      setLogs(response.data.data.logs);
      setTotal(response.data.data.total);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(0);
  };

  return (
    <Root>
      <Typography variant="h6" gutterBottom>
        System Logs
      </Typography>
      <FilterContainer>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={handleFilterChange('search')}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={handleFilterChange('startDate')}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={handleFilterChange('endDate')}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Type"
              select
              value={filters.type}
              onChange={handleFilterChange('type')}
            >
              {/* Add log type options */}
            </TextField>
          </Grid>
        </Grid>
      </FilterContainer>

      <StyledPaper>
        <StyledTableContainer>
          <MuiTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.isAnomaly ? 'Anomaly' : 'Normal'}
                        color={log.isAnomaly ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedLog(log)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MuiTableContainer>
        </StyledTableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </StyledPaper>

      {selectedLog && (
        <LogDetailsDialog
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </Root>
  );
}

export default Logs; 