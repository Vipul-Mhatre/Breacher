import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const ChartContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
}));

function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    anomalies: 0,
    recentAlerts: [],
    anomalyTypes: {},
    timeSeriesData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/logs/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const anomalyChartData = {
    labels: Object.keys(stats.anomalyTypes),
    datasets: [
      {
        data: Object.values(stats.anomalyTypes),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  };

  const timeSeriesData = {
    labels: stats.timeSeriesData.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Anomalies Over Time',
        data: stats.timeSeriesData.map(d => d.count),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledPaper>
          <Typography variant="h6">Total Logs</Typography>
          <Typography variant="h3">{stats.totalLogs}</Typography>
        </StyledPaper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper>
          <Typography variant="h6">Anomalies Detected</Typography>
          <Typography variant="h3">{stats.anomalies}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper>
          <Typography variant="h6">Alert Rate</Typography>
          <Typography variant="h3">
            {stats.totalLogs ? ((stats.anomalies / stats.totalLogs) * 100).toFixed(1) : 0}%
          </Typography>
        </Paper>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Paper>
          <Typography variant="h6">Anomaly Distribution</Typography>
          <div>
            <Pie data={anomalyChartData} />
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper>
          <Typography variant="h6">Anomalies Trend</Typography>
          <div>
            <Line data={timeSeriesData} />
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Dashboard; 