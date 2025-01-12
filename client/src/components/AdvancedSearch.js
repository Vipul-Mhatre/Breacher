import React, { useState } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Chip,
  makeStyles,
} from '@material-ui/core';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  filterGroup: {
    padding: theme.spacing(2),
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const OPERATORS = {
  string: ['equals', 'contains', 'starts with', 'ends with'],
  number: ['equals', 'greater than', 'less than', 'between'],
  date: ['equals', 'after', 'before', 'between'],
  boolean: ['equals'],
};

function AdvancedSearch({ fields, onSearch, onExport }) {
  const classes = useStyles();
  const [filters, setFilters] = useState([getEmptyFilter()]);
  const [activeFilters, setActiveFilters] = useState([]);

  function getEmptyFilter() {
    return {
      field: '',
      operator: '',
      value: '',
      value2: '', // for 'between' operator
    };
  }

  const handleAddFilter = () => {
    setFilters([...filters, getEmptyFilter()]);
  };

  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    
    // Reset operator when field changes
    if (field === 'field') {
      newFilters[index].operator = '';
      newFilters[index].value = '';
      newFilters[index].value2 = '';
    }
    
    setFilters(newFilters);
  };

  const handleSearch = () => {
    const validFilters = filters.filter(f => f.field && f.operator && f.value);
    setActiveFilters(validFilters);
    onSearch(validFilters);
  };

  const handleClear = () => {
    setFilters([getEmptyFilter()]);
    setActiveFilters([]);
    onSearch([]);
  };

  const getFieldType = (fieldName) => {
    const field = fields.find(f => f.name === fieldName);
    return field ? field.type : 'string';
  };

  return (
    <Paper className={classes.root}>
      {filters.map((filter, index) => (
        <Paper key={index} className={classes.filterGroup} variant="outlined">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Field</InputLabel>
                <Select
                  value={filter.field}
                  onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                >
                  {fields.map((field) => (
                    <MenuItem key={field.name} value={field.name}>
                      {field.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={filter.operator}
                  onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                  disabled={!filter.field}
                >
                  {filter.field &&
                    OPERATORS[getFieldType(filter.field)].map((op) => (
                      <MenuItem key={op} value={op}>
                        {op}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={filter.operator === 'between' ? 3 : 6}>
              <TextField
                fullWidth
                label="Value"
                value={filter.value}
                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                type={getFieldType(filter.field) === 'date' ? 'date' : 'text'}
                disabled={!filter.operator}
              />
            </Grid>

            {filter.operator === 'between' && (
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Second Value"
                  value={filter.value2}
                  onChange={(e) => handleFilterChange(index, 'value2', e.target.value)}
                  type={getFieldType(filter.field) === 'date' ? 'date' : 'text'}
                />
              </Grid>
            )}
          </Grid>

          {filters.length > 1 && (
            <IconButton
              size="small"
              className={classes.removeButton}
              onClick={() => handleRemoveFilter(index)}
            >
              <RemoveIcon />
            </IconButton>
          )}
        </Paper>
      ))}

      <Box mt={2} display="flex" justifyContent="space-between">
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddFilter}
            color="primary"
          >
            Add Filter
          </Button>
          {onExport && (
            <Button
              onClick={() => onExport(activeFilters)}
              style={{ marginLeft: 8 }}
            >
              Export Results
            </Button>
          )}
        </Box>
        <Box>
          <Button
            startIcon={<ClearIcon />}
            onClick={handleClear}
            style={{ marginRight: 8 }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Box>
      </Box>

      {activeFilters.length > 0 && (
        <Box mt={2}>
          {activeFilters.map((filter, index) => (
            <Chip
              key={index}
              label={`${filter.field} ${filter.operator} ${filter.value}${
                filter.value2 ? ` and ${filter.value2}` : ''
              }`}
              onDelete={() => {
                const newFilters = activeFilters.filter((_, i) => i !== index);
                setActiveFilters(newFilters);
                onSearch(newFilters);
              }}
              className={classes.chip}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default AdvancedSearch; 