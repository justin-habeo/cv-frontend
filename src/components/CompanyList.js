import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import apiService from '../services/apiService';

function CompanyList() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiService.get('/companies/');
        setCompanies(response.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div>
      <Typography variant="h6">Companies</Typography>
      <List>
        {companies.map((company) => (
          <ListItem key={company.id} button>
            <ListItemText primary={company.name} secondary={company.description} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default CompanyList;