import React from 'react';
import { Grid, TextField, Select, MenuItem } from '@mui/material';

function RelativeDateRangeSelector({ value, unit, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          fullWidth
          type="number"
          label="Value"
          value={value}
          onChange={(e) => onChange(e.target.value, unit)}
        />
      </Grid>
      <Grid item xs={6}>
        <Select
          fullWidth
          value={unit}
          onChange={(e) => onChange(value, e.target.value)}
        >
          <MenuItem value="hours">Hours</MenuItem>
          <MenuItem value="days">Days</MenuItem>
          <MenuItem value="weeks">Weeks</MenuItem>
          <MenuItem value="months">Months</MenuItem>
        </Select>
      </Grid>
    </Grid>
  );
}

export default RelativeDateRangeSelector;
