// src/components/Sidebar.js
import React, { useState, forwardRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Drawer, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  IconButton, Collapse, Switch, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Typography, Select, MenuItem, Tooltip, Divider, Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Delete as DeleteIcon, Edit as EditIcon,
  ExpandLess, ExpandMore, Add as AddIcon, Folder as FolderIcon,
  ChevronLeft as ChevronLeftIcon, Menu as MenuIcon, 
  Cloud as WeatherIcon, Satellite as SatelliteIcon, 
  Sensors as SensorDataIcon, Home as OverviewIcon,
  AirplanemodeActive as DroneIcon, Spa as PlantIcon,
  Water as WaterIcon, Opacity as SoilIcon, 
  FiberManualRecord as BulletIcon, Spa as SiteIcon,
  AccountCircle, Settings, ExitToApp, GolfCourse, GolfCourseOutlined,
  GolfCourseRounded, GolfCourseSharp, GolfCourseTwoTone, SportsGolf,
  Foundation, Pool, HotTub, Dining, Deck, Liquor, CameraOutdoor,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import SiteMenu from './SiteMenu';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { useBrand } from '../contexts/BrandContext';
import smartgrowLogoFull from '../assets/smartgrow_logo_full.png';
import smartgrowLogoMin from '../assets/smartgrow_logo_min.png';
import smartcourseLogoFull from '../assets/smartcourse_logo_full.png';
import smartcourseLogoMin from '../assets/smartcourse_logo_min.png';
import aEyeLogoFull from '../assets/a_eye_logo_full.png';
import aEyeLogoMin from '../assets/a_eye_logo_min.png';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import apiService from '../services/apiService';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme, open, currentTheme }) => ({
  '& .MuiDrawer-paper': {
    position: 'fixed',
    whiteSpace: 'nowrap',
    width: open ? drawerWidth : theme.spacing(7),
    transition: theme.transitions.create([ 'width', 'max-width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    overflowX: 'hidden',
    borderRight: 'none',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  paddingTop: theme.spacing(0.75),
  paddingBottom: theme.spacing(0.75),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(1), // Reduced right padding
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: '30px',
  marginRight: theme.spacing(2), // Add this line to increase space
  color: theme.palette.primary.contrastText,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  marginLeft: '-8px',
  color: theme.palette.primary.contrastText,
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiOutlinedInput-root': {
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.text.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    paddingTop: 8,
    paddingBottom: 8,
    display: 'flex',
    alignItems: 'center',
  },
  color: theme.palette.text.primary,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.text.primary,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiSelect-icon': {
    color: theme.palette.text.primary,
  },
  width: 'calc(100% - 48px)', // Adjust this value to fit your layout
}));

const iconMap = {
  'Weather': WeatherIcon,
  'Satellite': SatelliteIcon,
  'Sensor Data': SensorDataIcon,
  'Overview': OverviewIcon,
  'Drones': DroneIcon,
  'Plants': PlantIcon,
  'Water': WaterIcon,
  'Soil': SoilIcon,
  'Golf1': GolfCourse, 
  'Golf2': GolfCourseOutlined,
  'Golf3': GolfCourseRounded, 
  'Golf4': GolfCourseSharp, 
  'Golf5': GolfCourseTwoTone, 
  'SportsGolf': SportsGolf,
  'Clubhouse': Foundation, 
  'Pool': Pool, 
  'Spa': HotTub,
  'Bar': Liquor,
  'Resort': Deck,
  'Dining': Dining,
  'Default': FolderIcon,
  'CameraLocation1': CameraOutdoor
};

const SmallIcon = styled(({ component: Icon, ...props }) => <Icon {...props} />)(({ theme }) => ({
  fontSize: '1rem', // Adjust this value to get the desired size
}));

const SmallBulletIcon = styled(BulletIcon)(({ theme }) => ({
  fontSize: '0.5rem', // Adjust this value to get the desired size
  marginRight: theme.spacing(1), // Add some space between the bullet and the text
}));

const CompactList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItem-root': {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
  '& > *': {
    padding: theme.spacing(0.5),
  },
}));

const BottomMenu = ({ handleLogout }) => (
  <>
    <Divider style={{ margin: '16px 0' }} />
    <StyledListItem button>
      <StyledListItemIcon>
        <AccountCircle />
      </StyledListItemIcon>
      <StyledListItemText primary="My Account" />
    </StyledListItem>
    <StyledListItem button>
      <StyledListItemIcon>
        <Settings />
      </StyledListItemIcon>
      <StyledListItemText primary="Settings" />
    </StyledListItem>
    <StyledListItem button onClick={handleLogout}>
      <StyledListItemIcon>
        <ExitToApp />
      </StyledListItemIcon>
      <StyledListItemText primary="Logout" />
    </StyledListItem>
    <Divider style={{ margin: '16px 0' }} />
  </>
);

const MinimizedSidebar = ({ dashboardGroups, theme }) => (
  <>
    {dashboardGroups.map((group) => (
      <Tooltip title={group.name} placement="right" key={group.id}>
        <ListItem button>
          <ListItemIcon>
            {React.createElement(iconMap[group.icon] || FolderIcon, { style: { color: theme.palette.primary.contrastText, fontSize: '1.2rem' } })}
          </ListItemIcon>
        </ListItem>
      </Tooltip>
    ))}
    <Tooltip title="Ungrouped" placement="right">
      <ListItem button>
        <ListItemIcon>
          <FolderIcon style={{ color: theme.palette.primary.contrastText, fontSize: '1.2rem' }} />
        </ListItemIcon>
      </ListItem>
    </Tooltip>
  </>
);

const Sidebar = forwardRef(({
  onDashboardSelect,
  isDesignMode,
  onDesignModeToggle,
  dashboards,
  dashboardGroups,
  onDeleteDashboard,
  onRenameDashboard,
  onDeleteGroup,
  onRenameGroup,
  onMoveDashboard,
  isOpen,
  sites,
  selectedSite,
  onSiteSelect,
  onAddGroup,
  onAddSite, 
  onManageUsers,
  onManageDashboards,
  onEditSite,
  onDeleteSite,
  onReorderDashboards,
}, ref) => {
  const { brand } = useBrand();
  const logos = {
    smartgrow: {
      full: smartgrowLogoFull,
      min: smartgrowLogoMin
    },
    smartcourse: {
      full: smartcourseLogoFull,
      min: smartcourseLogoMin
    },
    a_eye: {
      full: aEyeLogoFull,
      min: aEyeLogoMin
    }
  };
  const { logout } = useAuth();
  const [openGroups, setOpenGroups] = useState(() => {
    const initialState = { ungrouped: true };
    dashboardGroups.forEach(group => {
      initialState[group.id] = true;  // Initialize all groups as open
    });
    return initialState;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [itemToRename, setItemToRename] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('Default');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const muiTheme = useMuiTheme();
  const { currentTheme, toggleTheme } = useCustomTheme();

  const handleMenuOpen = (event, item) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleLogout = () => {
    logout();
  };

  const handleToggleGroup = (groupId) => {
    setOpenGroups(prevState => ({
      ...prevState,
      [groupId]: !prevState[groupId]
    }));
  };

  const handleOpenDialog = (action, item = null) => {
    setDialogAction(action);
    if (action === 'rename') {
      setItemToRename(item);
      setNewItemName(item.name);
    } else {
      setNewItemName('');
      setNewGroupIcon('Default');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogAction(null);
    setItemToRename(null);
    setNewItemName('');
    setNewGroupIcon('Default');
  };

  const handleDialogSubmit = () => {
    if (dialogAction === 'rename') {
      if (itemToRename.type === 'dashboard') {
        onRenameDashboard(itemToRename.id, newItemName);
      } else if (itemToRename.type === 'group') {
        onRenameGroup(itemToRename.id, newItemName);
      }
    } else if (dialogAction === 'addGroup') {
      onAddGroup(newItemName, newGroupIcon);
    }
    handleCloseDialog();
  };

  const handleRenameClick = (item, type, event) => {
    if (event) {
      event.stopPropagation();
    }
    handleOpenDialog('rename', { ...item, type });
  };
  
  const handleDeleteClick = (id, type, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (type === 'dashboard') {
      onDeleteDashboard(id);
    } else if (type === 'group') {
      onDeleteGroup(id);
    }
  };

  const handleMoveDashboard = (dashboardId, groupId) => {
    onMoveDashboard(dashboardId, groupId);
  };
  
  // Group dashboards by their group
  const groupedDashboards = dashboards.reduce((acc, dashboard) => {
    if (dashboard.group) {
      if (!acc[dashboard.group]) {
        acc[dashboard.group] = [];
      }
      acc[dashboard.group].push(dashboard);
    }
    return acc;
  }, {});

  // Sort dashboards within each group
  Object.keys(groupedDashboards).forEach(groupId => {
    groupedDashboards[groupId].sort((a, b) => a.order - b.order);
  });

  // Get ungrouped dashboards
  const ungroupedDashboards = dashboards.filter(dashboard => !dashboard.group);

  const onDragEnd = useCallback((result) => {
    if (!result.destination || !isDesignMode) {
      return;
    }
  
    const { source, destination, draggableId } = result;
    const sourceGroupId = source.droppableId === 'ungrouped' ? null : source.droppableId.split('-')[1];
    const destGroupId = destination.droppableId === 'ungrouped' ? null : destination.droppableId.split('-')[1];
    const dashboardId = draggableId.split('-')[1];
  
    if (sourceGroupId !== destGroupId) {
      // Moving between groups or to/from ungrouped
      onMoveDashboard(dashboardId, destGroupId === 'ungrouped' ? null : parseInt(destGroupId, 10));
    } else {
      // Reordering within the same group
      const groupDashboards = sourceGroupId === null
        ? ungroupedDashboards
        : groupedDashboards[sourceGroupId] || [];
  
      const reorderedDashboards = Array.from(groupDashboards);
      const [reorderedItem] = reorderedDashboards.splice(source.index, 1);
      reorderedDashboards.splice(destination.index, 0, reorderedItem);
  
      const newOrder = reorderedDashboards.map((d, index) => ({
        id: d.id,
        order: index,
      }));
  
      onReorderDashboards(newOrder, sourceGroupId === 'ungrouped' ? null : parseInt(sourceGroupId, 10));
    }
  }, [isDesignMode, groupedDashboards, ungroupedDashboards, onMoveDashboard, onReorderDashboards]);

  const sortDashboards = useCallback((dashboardsToSort) => {
    return dashboardsToSort.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
  }, []);

  console.log("All dashboards:", dashboards);
  console.log("Dashboard groups:", dashboardGroups);

  return (
    <StyledDrawer 
      variant="permanent" 
      open={isOpen} 
      ref={ref}
      theme={muiTheme}
      currentTheme={currentTheme}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <List sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>  

          {isOpen ? (
            <>
                {sites.length > 0 && (
                  <ListItem sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: muiTheme.spacing(1, 1),
                    flexDirection: 'row', // Ensure items are in a row
                    flexWrap: 'nowrap', // Prevent wrapping
                    width: '110%',
                  }}>
                    <StyledSelect
                      value={selectedSite || ''}
                      onChange={(e) => onSiteSelect(e.target.value)}
                      renderValue={(value) => {
                        const site = sites.find(f => f.id.toString() === value);
                        return site ? (
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <CameraOutdoor style={{ marginRight: '8px', color: muiTheme.palette.primary.contrastText }} />
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Typography variant="body2" style={{ color: muiTheme.palette.primary.contrastText }}>{site.name}</Typography>
                              <Typography variant="caption" style={{ color: muiTheme.palette.primary.contrastText }}>
                                {site.location}
                              </Typography>
                            </div>
                          </div>
                        ) : '';
                      }}
                    >
                      {sites.map((site) => (
                        <MenuItem key={site.id} value={site.id.toString()}>
                          <ListItemIcon>
                            <SportsGolf />
                          </ListItemIcon>
                          <ListItemText 
                            primary={site.name}
                            secondary={site.location}
                          />
                        </MenuItem>
                      ))}
                      <MenuItem value="add_new" onClick={() => onAddSite()}>
                        <ListItemIcon>
                          <AddIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Add new site" />
                      </MenuItem>
                    </StyledSelect>
                </ListItem>
              )}
              {isDesignMode && (
                <StyledListItem button onClick={() => handleOpenDialog('addGroup')}>
                  <StyledListItemIcon>
                    <AddIcon />
                  </StyledListItemIcon>
                  <StyledListItemText primary="Add New Group" />
                </StyledListItem>
              )}

              {dashboardGroups.map((group) => {
                const groupDashboards = groupedDashboards[group.id] || [];
                
                return (
                  <React.Fragment key={group.id}>
                    <StyledListItem button onClick={() => handleToggleGroup(group.id)}>
                      <StyledListItemIcon>
                        {React.createElement(iconMap[group.icon] || FolderIcon)}
                      </StyledListItemIcon>
                      <StyledListItemText primary={group.name} />
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        handleToggleGroup(group.id);
                      }}>
                        {openGroups[group.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      </IconButton>
                      {isDesignMode && (
                        <IconButton 
                          size="small" 
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMenuOpen(event, { type: 'group', ...group });
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </StyledListItem>
                    <Collapse in={openGroups[group.id]} timeout="auto" unmountOnExit>
                      <Droppable droppableId={`group-${group.id}`} isDropDisabled={!isDesignMode}>
                        {(provided) => (
                          <CompactList 
                            component="div" 
                            disablePadding
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {groupDashboards.map((dashboard, index) => (
                              <Draggable
                                key={dashboard.id}
                                draggableId={`dashboard-${dashboard.id}`}
                                index={index}
                                isDragDisabled={!isDesignMode}
                              >
                                {(provided, snapshot) => (
                                  <StyledListItem
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    button
                                    onClick={() => onDashboardSelect(dashboard.id)}
                                    sx={{
                                      paddingLeft: muiTheme.spacing(4),
                                      '&:first-of-type': {
                                        paddingTop: muiTheme.spacing(0.5),
                                      },
                                      backgroundColor: snapshot.isDragging ? muiTheme.palette.action.hover : 'inherit',
                                    }}
                                  >
                                    <StyledListItemIcon style={{ minWidth: 'auto' }}>
                                      <SmallBulletIcon />
                                    </StyledListItemIcon>
                                    <StyledListItemText 
                                      primary={dashboard.name}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                    {isDesignMode && (
                                      <IconButton 
                                        size="small" 
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleMenuOpen(event, { type: 'dashboard', ...dashboard });
                                        }}
                                      >
                                        <MoreVertIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </StyledListItem>
                                )}
                              </Draggable>
                            ))}
                            {groupDashboards.length === 0 && isDesignMode && (
                              <StyledListItem sx={{ paddingLeft: muiTheme.spacing(4) }}>
                                <Typography variant="body2" color="textSecondary">
                                  Drag dashboards here
                                </Typography>
                              </StyledListItem>
                            )}
                            {provided.placeholder}
                          </CompactList>
                        )}
                      </Droppable>
                    </Collapse>
                  </React.Fragment>
                );
              })}

              {ungroupedDashboards.length > 0 && (
                <>
                  <StyledListItem button onClick={() => handleToggleGroup('ungrouped')}>
                    <StyledListItemIcon>
                      <FolderIcon />
                    </StyledListItemIcon>
                    <StyledListItemText primary="Ungrouped" />
                    <IconButton size="small" onClick={() => handleToggleGroup('ungrouped')}>
                      {openGroups['ungrouped'] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                  </StyledListItem>
                  <Collapse in={openGroups['ungrouped']} timeout="auto" unmountOnExit>
                    <Droppable droppableId="ungrouped" isDropDisabled={!isDesignMode}>
                      {(provided) => (
                        <CompactList 
                          component="div" 
                          disablePadding
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {sortDashboards(ungroupedDashboards).map((dashboard, index) => (
                            <Draggable
                              key={dashboard.id}
                              draggableId={`dashboard-${dashboard.id}`}
                              index={index}
                              isDragDisabled={!isDesignMode}
                            >
                              {(provided, snapshot) => (
                                <StyledListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  button
                                  onClick={() => onDashboardSelect(dashboard.id)}
                                  sx={{
                                    paddingLeft: muiTheme.spacing(4),
                                    '&:first-of-type': {
                                      paddingTop: muiTheme.spacing(0.5),
                                    },
                                    backgroundColor: snapshot.isDragging ? muiTheme.palette.action.hover : 'inherit',
                                  }}
                                >
                                  <StyledListItemIcon style={{ minWidth: 'auto' }}>
                                    <SmallBulletIcon />
                                  </StyledListItemIcon>
                                  <StyledListItemText 
                                    primary={dashboard.name}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                  {isDesignMode && (
                                    <IconButton 
                                      size="small" 
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleMenuOpen(event, { type: 'dashboard', ...dashboard });
                                      }}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </StyledListItem>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </CompactList>
                      )}
                    </Droppable>
                  </Collapse>
                </>
              )}
    
              {isDesignMode && (
                <StyledListItem button onClick={() => onDashboardSelect('add')}>
                  <StyledListItemIcon>
                    <AddIcon />
                  </StyledListItemIcon>
                  <StyledListItemText primary="Add New Dashboard" />
                </StyledListItem>
              )}
    
              <StyledListItem>
                <StyledListItemText primary="Design Mode" />
                <Switch
                  edge="end"
                  onChange={onDesignModeToggle}
                  checked={isDesignMode}
                  color="secondary"
                />
              </StyledListItem>
    
              <Divider style={{ backgroundColor: muiTheme.palette.divider, margin: '16px 0' }} />
              
              <Box sx={{ flexGrow: 1 }} /> {/* This will push the BottomMenu and logo to the bottom */}

              <BottomMenu handleLogout={handleLogout} />

              <ListItem sx={{ justifyContent: 'center', mt: 2 }}>
                <img 
                  src={isOpen ? logos[brand].full : logos[brand].min}
                  alt={`${brand === 'smartgrow' ? 'SmartGrow' : brand === 'smartcourse' ? 'SmartCourse' : 'A Eye'} Logo`}
                  style={{
                    maxWidth: isOpen ? '200px' : '40px',
                    height: 'auto',
                  }}
                />
              </ListItem>

            </>
          ) : (
            <>
              <MinimizedSidebar dashboardGroups={dashboardGroups} theme={muiTheme} />
              <Box sx={{ flexGrow: 1 }} />
              <ListItem sx={{ justifyContent: 'center', mt: 2 }}>
                <img 
                  src={smartcourseLogoMin}
                  alt="SmartCourse Logo" 
                  style={{
                    width: '40px',
                    height: 'auto',
                  }}
                />
              </ListItem>
            </>
          )}
        </List>

        <StyledDialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>
            {dialogAction === 'rename'
              ? `Rename ${itemToRename?.type === 'dashboard' ? 'Dashboard' : 'Group'}`
              : 'Add New Group'}
          </DialogTitle>
          <DialogContent>
            <StyledTextField
              autoFocus
              margin="dense"
              id="name"
              label={dialogAction === 'rename' ? "New Name" : "Group Name"}
              type="text"
              fullWidth
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            {dialogAction === 'addGroup' && (
              <StyledSelect
                fullWidth
                value={newGroupIcon}
                onChange={(e) => setNewGroupIcon(e.target.value)}
                style={{ marginTop: '16px' }}
              >
                {Object.keys(iconMap).map((iconName) => (
                  <MenuItem key={iconName} value={iconName}>
                    {React.createElement(iconMap[iconName], { style: { marginRight: '8px' } })}
                    {iconName}
                  </MenuItem>
                ))}
              </StyledSelect>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDialogSubmit} color="primary" variant="contained">
              {dialogAction === 'rename' ? 'Rename' : 'Add Group'}
            </Button>
          </DialogActions>
        </StyledDialog>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={(event) => {
            event.stopPropagation();
            handleRenameClick(selectedItem, selectedItem.type);
            handleMenuClose();
          }}>
            Rename
          </MenuItem>
          <MenuItem onClick={(event) => {
            event.stopPropagation();
            handleDeleteClick(selectedItem.id, selectedItem.type);
            handleMenuClose();
          }}>
            Delete
          </MenuItem>
          {selectedItem?.type === 'dashboard' && (
            <MenuItem>
              <StyledSelect
                value={selectedItem.group || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handleMoveDashboard(selectedItem.id, e.target.value);
                  handleMenuClose();
                }}
                onClick={(e) => e.stopPropagation()}
                size="small"
              >
                <MenuItem value="">Ungrouped</MenuItem>
                {dashboardGroups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
              </StyledSelect>
            </MenuItem>
          )}
        </Menu>
      </DragDropContext>
    </StyledDrawer>
  );

});

export default Sidebar;