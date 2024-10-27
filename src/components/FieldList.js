import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import apiService from '../services/apiService';

function FieldList({ siteId }) {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await apiService.get(`/fields/?site=${siteId}`);
        setFields(response.data);
      } catch (error) {
        console.error('Error fetching fields:', error);
      }
    };

    if (siteId) {
      fetchFields();
    }
  }, [siteId]);

  return (
    <div>
      <Typography variant="h6">Fields</Typography>
      <List>
        {fields.map((field) => (
          <ListItem key={field.id} button>
            <ListItemText primary={field.name} secondary={`Size: ${field.size}, Soil Type: ${field.soil_type}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default FieldList;