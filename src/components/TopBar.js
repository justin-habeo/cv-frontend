// TopBar.js
import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, FormControl, Select, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const StyledTopBar = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  minHeight: '40px',
  width: '100%',
  transition: 'width 0.3s ease-in-out',
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  '& .MuiSelect-icon': {
    color: theme.palette.primary.contrastText,
  },
  '&:before': {
    borderColor: theme.palette.primary.contrastText,
  },
  '&:after': {
    borderColor: theme.palette.primary.contrastText,
  },
}));

function TopBar({ onToggle, isSidebarVisible, groupName, dashboardName, dashboards, onDashboardChange, isDesignMode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCarouselMode, setIsCarouselMode] = useState(false);
  const { currentTheme, toggleTheme } = useCustomTheme();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    let carouselInterval;
    if (isCarouselMode) {
      let currentIndex = 0;
      carouselInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % dashboards.length;
        onDashboardChange(dashboards[currentIndex].id);
      }, 30000);
    }
    return () => {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    };
  }, [isCarouselMode, dashboards, onDashboardChange]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const toggleCarousel = () => {
    setIsCarouselMode(!isCarouselMode);
  };


  return (
    <StyledTopBar>
      <IconButton onClick={onToggle} sx={{ color: 'inherit', mr: 1, padding: '4px' }}>
        <MenuIcon fontSize="small" />
      </IconButton>
      <Typography variant="subtitle1" sx={{ flexGrow: 1, fontSize: '0.875rem', fontWeight: 500 }}>
        {groupName !== 'Ungrouped' ? `${groupName} / ` : ''}{dashboardName}
      </Typography>
      {isDesignMode && (
        <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
          <StyledSelect
            value={currentTheme}
            onChange={(e) => toggleTheme(e.target.value)}
            displayEmpty
          >
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="purple">Purple</MenuItem>
            <MenuItem value="ombria">Ombria</MenuItem>
          </StyledSelect>
        </FormControl>
      )}
      <IconButton onClick={toggleCarousel} sx={{ color: 'inherit', padding: '4px', mr: 1 }}>
        {isCarouselMode ? <CancelIcon fontSize="small" /> : <ViewCarouselIcon fontSize="small" />}
      </IconButton>
      <IconButton onClick={toggleFullscreen} sx={{ color: 'inherit', padding: '4px' }}>
        {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
      </IconButton>
    </StyledTopBar>
  );
}

export default TopBar;