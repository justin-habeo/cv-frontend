import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import WidgetWrapper from '../WidgetWrapper';
import { loadHelpContent } from '../../../utils/helpLoader';
import WidgetRegistry from '../WidgetRegistry';
import apiService from '../../../services/apiService';

function ManualDataEntryWidget({ config, widgetType, isDesignMode, updateConfig, showHeader }) {
  const [rows, setRows] = useState([]);
  const [helpContent, setHelpContent] = useState('');
  const [isAddingData, setIsAddingData] = useState(false);
  const [newData, setNewData] = useState({});
  const [error, setError] = useState(null);
  const [manualDataCaptureId, setManualDataCaptureId] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const loadHelp = async () => {
      const helpFilePath = WidgetRegistry[widgetType].helpFile;
      const content = await loadHelpContent(helpFilePath);
      setHelpContent(content);
    };
    loadHelp();
    if (config.manualDataCaptureConfigId) {
      fetchManualDataCapture();
    }
  }, [widgetType, config.manualDataCaptureConfigId]);

  const fetchManualDataCapture = async () => {
    try {
      const response = await apiService.get(`/manual-data-captures/by-config/${config.manualDataCaptureConfigId}/`);
      setManualDataCaptureId(response.data.id);
      fetchData(response.data.id);
    } catch (error) {
      console.error('Error fetching ManualDataCapture:', error);
      setError(`Failed to fetch ManualDataCapture: ${error.message}`);
    }
  };

  const fetchData = async (captureId) => {
    try {
      console.log('Fetching data for ManualDataCapture:', captureId);
      const response = await apiService.get(`/manual-data-captures/${captureId}/entries/`);
      console.log('Received data:', response.data);
      setRows(response.data.map((entry, index) => ({ id: index, ...entry.data })));
      setError(null);
    } catch (error) {
      console.error('Error fetching manual data entries:', error);
      setError(`Failed to fetch data: ${error.message}`);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const columns = config.fields.map(field => ({
    field: field.name,
    headerName: field.name,
    width: 150,
    editable: true,
    type: field.type === 'number' ? 'number' : 'string'
  }));

  const handleEditRowsModelChange = async (model) => {
    const updatedRows = rows.map((row) => {
      if (model[row.id]) {
        return { ...row, ...model[row.id] };
      }
      return row;
    });
    setRows(updatedRows);
    
    // Save the updated data to the backend
    try {
      await apiService.put(`/manual-data-captures/${manualDataCaptureId}/entries/`, updatedRows);
    } catch (error) {
      console.error('Error updating manual data entries:', error);
    }
  };

  const handleAddData = () => {
    setIsAddingData(true);
    setNewData({});
  };

  const handleSaveNewData = async () => {
    try {
      await apiService.post(`/manual-data-captures/${manualDataCaptureId}/entries/`, { data: newData });
      setIsAddingData(false);
      fetchData(manualDataCaptureId);
    } catch (error) {
      console.error('Error adding new manual data entry:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleMoreClick = () => {
    console.log('More options clicked for ManualDataEntryWidget');
    // Implement additional functionality here
  };

  const renderContent = () => (
    <Box style={{ height: '100%', width: '100%' }}>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Button onClick={handleAddData} variant="contained" color="primary" style={{ marginBottom: '10px' }}>
            Add New Data
          </Button>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
            onEditRowsModelChange={handleEditRowsModelChange}
            components={{
              Toolbar: GridToolbar,
            }}
            sx={{
              color: theme.palette.text.primary,
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '& .MuiDataGrid-footer': {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
              },
            }}
          />
        </>
      )}
      <Dialog open={isAddingData} onClose={() => setIsAddingData(false)}>
        <DialogTitle>Add New Data</DialogTitle>
        <DialogContent>
          {config.fields.map(field => (
            <TextField
              key={field.name}
              label={field.name}
              type={field.type}
              value={newData[field.name] || ''}
              onChange={(e) => setNewData({ ...newData, [field.name]: e.target.value })}
              fullWidth
              margin="normal"
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingData(false)}>Cancel</Button>
          <Button onClick={handleSaveNewData} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <WidgetWrapper
      title={config.title || 'Manual Data Entry'}
      showHeader={showHeader}
      onMoreClick={handleMoreClick}
      helpContent={helpContent}
    >
      {isDesignMode ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1">Manual Data Entry Widget</Typography>
        </Box>
      ) : (
        renderContent()
      )}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </WidgetWrapper>
  );
}

export default ManualDataEntryWidget;