import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import apiService from '../services/apiService';

function CropList({ fieldId }) {
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await apiService.get(`/crops/?field=${fieldId}`);
        setCrops(response.data);
      } catch (error) {
        console.error('Error fetching crops:', error);
      }
    };

    if (fieldId) {
      fetchCrops();
    }
  }, [fieldId]);

  return (
    <div>
      <Typography variant="h6">Crops</Typography>
      <List>
        {crops.map((crop) => (
          <ListItem key={crop.id} button>
            <ListItemText 
              primary={`${crop.name} (${crop.variety})`} 
              secondary={`Planted: ${crop.planting_date}, Expected Harvest: ${crop.expected_harvest_date}`} 
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default CropList;