/**
 * s10-smartgrow-frontend License
 * 
 * Copyright © 2024, Justin Morris Albertyn
 * 
 * Use of this software is restricted to projects where the copyright holder or authorized developer is directly involved.
 * For more details, see the LICENSE file in the project root.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, Typography, useTheme, ThemeProvider, FormControl, InputLabel, 
  Select, MenuItem
} from '@mui/material';
import { GlobalStyles } from '@mui/material';
import { styled } from '@mui/material/styles';
import Dashboard from './Dashboard';
import DashboardDesigner from './DashboardDesigner';
import Sidebar from '../Sidebar';
import AddDashboard from './AddDashboard';
import apiService from '../../services/apiService';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import TopBar from '../TopBar';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%', // Ensure it takes full width
  height: '100%', // Ensure it takes full height
  overflow: 'hidden',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));


const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
  },
}));

const DashboardContentBox = styled(Box)(({ theme, isSidebarVisible, sidebarWidth }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
  marginLeft: isSidebarVisible ? `${sidebarWidth}px` : '0',
  width: isSidebarVisible ? `calc(100% - ${sidebarWidth}px)` : '100%',
  backgroundColor: theme.palette.primary.main,
}));


const DashboardWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  margin: '1mm',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

function DashboardContainer() {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [dashboardGroups, setDashboardGroups] = useState([]);
  const [isAddDashboardOpen, setIsAddDashboardOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sidebarRef = useRef(null);
  const theme = useTheme();
  const { currentTheme, toggleTheme } = useCustomTheme();
  const sidebarWidth = 240;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const fetchSites = useCallback(async () => {
    try {
      const response = await apiService.get('/sites/');
      setSites(response.data);
      if (response.data.length > 0) {
        const savedSiteId = localStorage.getItem('selectedSiteId');
        const siteExists = response.data.some(site => site.id.toString() === savedSiteId);
        const siteToSelect = siteExists ? savedSiteId : response.data[0].id.toString();
        setSelectedSite(siteToSelect);
        localStorage.setItem('selectedSiteId', siteToSelect);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  }, []);

  const fetchDashboards = useCallback(async (siteId) => {
    if (!siteId) return;
    setIsLoading(true);
    try {
      const response = await apiService.get(`/dashboards/?site=${siteId}`);
      setDashboards(response.data);
      if (response.data.length > 0) {
        setSelectedDashboard(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setDashboards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardGroups = useCallback(async (siteId) => {
    if (!siteId) return;
    try {
      const response = await apiService.get(`/dashboard-groups/by_site/?site=${siteId}`);
      setDashboardGroups(response.data);
    } catch (error) {
      console.error('Error fetching dashboard groups:', error);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    if (selectedSite) {
      fetchDashboards(selectedSite);
      fetchDashboardGroups(selectedSite);
    }
  }, [selectedSite, fetchDashboards, fetchDashboardGroups]);

  const handleDashboardSelect = (dashboardId) => {
    if (dashboardId === 'add') {
      setIsAddDashboardOpen(true);
    } else {
      setSelectedDashboard(dashboardId);
    }
  };

  const handleDesignModeToggle = () => {
    setIsDesignMode(!isDesignMode);
  };

  const handleDashboardAdded = async (newDashboard) => {
    try {
      const response = await apiService.post('/dashboards/', { 
        ...newDashboard, 
        site: selectedSite,
        group: null
      });
      setDashboards(prevDashboards => [...prevDashboards, response.data]);
      setSelectedDashboard(response.data.id);
      setIsAddDashboardOpen(false);
    } catch (error) {
      console.error('Error adding dashboard:', error);
    }
  };

  const handleDeleteDashboard = async (dashboardId) => {
    try {
      await apiService.delete(`/dashboards/${dashboardId}/`);
      setDashboards(dashboards.filter(dashboard => dashboard.id !== dashboardId));
      if (selectedDashboard === dashboardId) {
        setSelectedDashboard(dashboards[0]?.id || null);
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    }
  };

  const handleRenameDashboard = async (dashboardId, newName) => {
    try {
      await apiService.put(`/dashboards/${dashboardId}/`, { name: newName });
      setDashboards(dashboards.map(dashboard => 
        dashboard.id === dashboardId ? { ...dashboard, name: newName } : dashboard
      ));
    } catch (error) {
      console.error('Error renaming dashboard:', error);
    }
  };

  const handleSiteSelect = (siteId) => {
    setIsLoading(true);
    setSelectedSite(siteId);
    setSelectedDashboard(null);
    localStorage.setItem('selectedSiteId', siteId);
    setDashboardGroups([]);
    setDashboards([]);
    fetchDashboards(siteId);
    fetchDashboardGroups(siteId);
  };

  const handleGroupAdded = async (groupName, groupIcon) => {
    try {
      const response = await apiService.post('/dashboard-groups/', { 
        name: groupName, 
        icon: groupIcon,
        site: selectedSite
      });
      setDashboardGroups([...dashboardGroups, response.data]);
    } catch (error) {
      console.error('Error adding dashboard group:', error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await apiService.delete(`/dashboard-groups/${groupId}/`);
      setDashboardGroups(dashboardGroups.filter(group => group.id !== groupId));
      setDashboards(prevDashboards =>
        prevDashboards.map(dashboard => 
          dashboard.group === groupId ? { ...dashboard, group: null } : dashboard
        )
      );
    } catch (error) {
      console.error('Error deleting dashboard group:', error);
    }
  };

  const handleRenameGroup = async (groupId, newName) => {
    try {
      await apiService.put(`/dashboard-groups/${groupId}/`, { 
        name: newName,
        site: selectedSite
      });
      setDashboardGroups(dashboardGroups.map(group => 
        group.id === groupId ? { ...group, name: newName } : group
      ));
    } catch (error) {
      console.error('Error renaming dashboard group:', error);
    }
  };

  const handleMoveDashboard = async (dashboardId, newGroupId) => {
    try {
      const response = await apiService.post(`/dashboards/${dashboardId}/assign_group/`, {
        group_id: newGroupId
      });
  
      if (response.status === 200) {
        // Update the local state
        setDashboards(prevDashboards => 
          prevDashboards.map(dashboard => 
            dashboard.id === parseInt(dashboardId, 10)
              ? { 
                  ...dashboard, 
                  group: newGroupId, 
                  group_name: newGroupId ? dashboardGroups.find(g => g.id === newGroupId)?.name : null,
                  group_icon: newGroupId ? dashboardGroups.find(g => g.id === newGroupId)?.icon : null
                }
              : dashboard
          )
        );
      }
    } catch (error) {
      console.error('Error moving dashboard:', error);
      // Implement error handling (e.g., show an error message to the user)
    }
  };
  
  const handleReorderDashboards = async (newOrder, groupId) => {
    try {
      const response = await apiService.post('/dashboards/reorder/', {
        order: newOrder,
        group_id: groupId === 'ungrouped' ? null : parseInt(groupId, 10)
      });
  
      if (response.status === 200) {
        // Update the local state
        setDashboards(prevDashboards => {
          const updatedDashboards = [...prevDashboards];
          newOrder.forEach(item => {
            const index = updatedDashboards.findIndex(d => d.id === item.id);
            if (index !== -1) {
              updatedDashboards[index] = { ...updatedDashboards[index], order: item.order };
            }
          });
          return updatedDashboards;
        });
      }
    } catch (error) {
      console.error('Error reordering dashboards:', error);
      // Implement error handling (e.g., show an error message to the user)
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleAddSite = () => {
    setIsAddSiteDialogOpen(true);
  };

  const handleAddSiteSubmit = async () => {
    try {
      const response = await apiService.post('/sites/', {
        name: newSiteName,
        location: newSiteLocation,
      });
      setSites([...sites, response.data]);
      setIsAddSiteDialogOpen(false);
      setNewSiteName('');
      setNewSiteLocation('');
    } catch (error) {
      console.error('Error adding new site:', error);
    }
  };

  const handleManageUsers = () => {
    console.log('Manage users clicked');
  };

  const handleManageDashboards = () => {
    console.log('Manage dashboards clicked');
  };

  const handleEditSite = () => {
    console.log('Edit site clicked');
  };

  const handleDeleteSite = () => {
    console.log('Delete site clicked');
  };

  const handleDashboardChange = (dashboardId) => {
    setSelectedDashboard(dashboardId);
  };

  const getCurrentDashboardInfo = () => {
    if (!selectedDashboard) return { groupName: '', dashboardName: '' };
    const dashboard = dashboards.find(d => d.id === selectedDashboard);
    if (!dashboard) return { groupName: '', dashboardName: '' };

    let groupName = 'Ungrouped';
    if (dashboard.group) {
      const group = dashboardGroups.find(g => g.id === dashboard.group);
      if (group) {
        groupName = group.name;
      }
    }

    return {
      groupName,
      dashboardName: dashboard.name
    };
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledBox>
        <GlobalStyles
          styles={{
            '.react-grid-layout': {
              margin: '0 !important',
            },
          }}
        />
        {isSidebarVisible && (
          <Sidebar 
            ref={sidebarRef}
            onDashboardSelect={handleDashboardSelect} 
            isDesignMode={isDesignMode}
            onDesignModeToggle={handleDesignModeToggle}
            dashboards={dashboards}
            dashboardGroups={dashboardGroups}
            onDeleteDashboard={handleDeleteDashboard}
            onRenameDashboard={handleRenameDashboard}
            onAddGroup={handleGroupAdded}
            onDeleteGroup={handleDeleteGroup}
            onRenameGroup={handleRenameGroup}
            onMoveDashboard={handleMoveDashboard}
            isOpen={true}
            onToggle={toggleSidebar}
            sites={sites}
            selectedSite={selectedSite}
            onSiteSelect={handleSiteSelect}
            onAddSite={handleAddSite}
            onManageUsers={handleManageUsers}
            onManageDashboards={handleManageDashboards}
            onEditSite={handleEditSite}
            onDeleteSite={handleDeleteSite}
            onReorderDashboards={handleReorderDashboards}  
          />
        )}
        <DashboardContentBox
          isSidebarVisible={isSidebarVisible}
          sidebarWidth={sidebarWidth}
        >
          <TopBar 
            onToggle={toggleSidebar}
            isSidebarVisible={isSidebarVisible}
            {...getCurrentDashboardInfo()}
            dashboards={dashboards}
            onDashboardChange={handleDashboardChange}
            isDesignMode={isDesignMode}
          />
          <Box sx={{ flexGrow: 1, overflow: 'auto', padding: '1mm' }}>
            {isLoading ? (
              <Typography variant="h4" sx={{ padding: 3 }}>Loading...</Typography>
            ) : selectedDashboard ? (
              isDesignMode ? (
                <DashboardDesigner 
                  selectedDashboard={selectedDashboard} 
                  selectedSite={selectedSite}
                  isSidebarOpen={isSidebarVisible}
                  sidebarWidth={sidebarWidth}
                  isDesignMode={isDesignMode}
                  onToggle={toggleSidebar}
                  containerWidth={isSidebarVisible ? `calc(100vw - ${sidebarWidth}px - 2mm)` : 'calc(100vw - 2mm)'}
                />
              ) : (
                <Dashboard 
                  selectedDashboard={selectedDashboard} 
                  isSidebarOpen={isSidebarVisible}
                  sidebarWidth={sidebarWidth}
                  isDesignMode={isDesignMode}
                  onToggle={toggleSidebar}
                  containerWidth={isSidebarVisible ? `calc(100vw - ${sidebarWidth}px - 2mm)` : 'calc(100vw - 2mm)'}
                  siteId={selectedSite}
                />
              )
            ) : (
              <Typography variant="h4" sx={{ padding: 3 }}>
                {selectedSite && dashboards.length === 0 ? "No dashboards available for this site" : "Please select a site"}
              </Typography>
            )}
          </Box>
        </DashboardContentBox>
        <AddDashboard 
          open={isAddDashboardOpen} 
          onClose={() => setIsAddDashboardOpen(false)} 
          onDashboardAdded={handleDashboardAdded}
        />
        <StyledDialog open={isAddSiteDialogOpen} onClose={() => setIsAddSiteDialogOpen(false)}>
          <DialogTitle>Add New Site</DialogTitle>
          <DialogContent>
            <StyledTextField
              autoFocus
              margin="dense"
              label="Site Name"
              type="text"
              fullWidth
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
            />
            <StyledTextField
              margin="dense"
              label="Site Location"
              type="text"
              fullWidth
              value={newSiteLocation}
              onChange={(e) => setNewSiteLocation(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddSiteDialogOpen(false)} color="primary">Cancel</Button>
            <Button onClick={handleAddSiteSubmit} color="primary">Add Site</Button>
          </DialogActions>
        </StyledDialog>
      </StyledBox>
    </ThemeProvider>
  );

}

export default DashboardContainer;