import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  makeStyles,
  Chip,
} from '@material-ui/core';
import axios from 'axios';
import { API_URL } from '../config';
import AdvancedSearch from './AdvancedSearch';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  table: {
    minWidth: 650,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const searchFields = [
  { name: 'action', label: 'Action', type: 'string' },
  { name: 'userId', label: 'User', type: 'string' },
  { name: 'timestamp', label: 'Timestamp', type: 'date' },
  { name: 'status', label: 'Status', type: 'string' },
  { name: 'resource', label: 'Resource', type: 'string' },
];

function AuditTrail() {
  const classes = useStyles();
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    fetchAuditLogs();
  }, [page, rowsPerPage, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/audit`, {
        params: {
          page,
          limit: rowsPerPage,
          filters: JSON.stringify(filters),
        },
      });
      setAuditLogs(response.data.data.logs);
      setTotal(response.data.data.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (filters) => {
    try {
      const response = await axios.get(`${API_URL}/audit/export`, {
        params: { filters: JSON.stringify(filters) },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit-trail.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" gutterBottom>
        Audit Trail
      </Typography>

      <AdvancedSearch
        fields={searchFields}
        onSearch={setFilters}
        onExport={handleExport}
      />

      <TableContainer>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.userName}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.resource}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={log.status}
                    color={log.status === 'success' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>
                  {log.details && (
                    <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
}

export default AuditTrail; 