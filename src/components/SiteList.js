import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import apiService from '../services/apiService';

function SiteList({ companyId }) {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await apiService.get(`/sites/?company=${companyId}`);
        setSites(response.data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    if (companyId) {
      fetchSites();
    }
  }, [companyId]);

  return (
    <div>
      <Typography variant="h6">Sites</Typography>
      <List>
        {sites.map((site) => (
          <ListItem key={site.id} button>
            <ListItemText primary={site.name} secondary={`Location: ${site.location}, Size: ${site.size}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default SiteList;