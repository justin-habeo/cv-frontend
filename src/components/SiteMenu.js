import React from 'react';
import { IconButton, Menu, MenuItem, styled } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SiteMenu = ({ onManageUsers, onManageDashboards, onEditSite, onDeleteSite }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledIconButton onClick={handleClick} size="small">
        <MoreVertIcon fontSize="small" />
      </StyledIconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { onManageUsers(); handleClose(); }}>Manage users</MenuItem>
        <MenuItem onClick={() => { onManageDashboards(); handleClose(); }}>Manage dashboards</MenuItem>
        <MenuItem onClick={() => { onEditSite(); handleClose(); }}>Edit site</MenuItem>
        <MenuItem onClick={() => { onDeleteSite(); handleClose(); }}>Delete site</MenuItem>
      </Menu>
    </>
  );
};

export default SiteMenu;