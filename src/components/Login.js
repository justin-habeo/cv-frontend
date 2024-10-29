import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import './Login.css';
import SmartGrowLogo from '../assets/smartgrow_logo_full.png';
import SmartCourseLogo from '../assets/smartcourse_logo_full.png';
import AEyeLogo from '../assets/a_eye_logo_full.png';

// Modified StyledTextField in Login.js
const StyledTextField = styled(TextField)({
  marginBottom: '1rem',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(122, 199, 215, 0.3)',  // Using primary color with opacity
    },
    '&:hover fieldset': {
      borderColor: '#7AC7D7',  // Primary color
    },
    '&.Mui-focused fieldset': {
      borderColor: '#7AC7D7',  // Primary color
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#7AC7D7',  // Primary color
    }
  },
  '& .MuiInputBase-input': {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { brand } = useBrand();

  const logos = {
    smartgrow: SmartGrowLogo,
    smartcourse: SmartCourseLogo,
    a_eye: AEyeLogo
  };

  const taglines = {
    smartgrow: "Collect • Analyse • Report • Action",
    smartcourse: "Optimise • Maintain • Enhance • Excel",
    a_eye: "Track, Report and Alert"
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await authService.login(username, password);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (e.g., show error message to user)
    }
  };

  return (
    <Container 
        maxWidth={false} 
        disableGutters  // Add this
        className="login-container"
        sx={{  // Add this
            p: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
        }}
    >
        <Box 
            className="login-form-container"
            sx={{  // Add this for better positioning
                position: 'relative',
                zIndex: 1
            }}
        >
        <img 
          src={logos[brand]} 
          alt={`${brand === 'smartgrow' ? 'SmartGrow' : brand === 'smartcourse' ? 'SmartCourse' : 'A Eye'} Logo`}
          className="logo" 
        />
        <Typography variant="subtitle1" className="tagline">
          {taglines[brand]}
        </Typography>
        <form onSubmit={handleLogin} className="login-form">
          <StyledTextField
            label="Username or Email Address"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
          />
          <StyledTextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{ 
                  color: 'rgba(122, 199, 215, 0.5)', 
                  '&.Mui-checked': { 
                    color: '#7AC7D7'  
                  } 
                }}
              />
            }
            label="Remember Me"
            className="remember-me"
            sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
          />
          <Button type="submit" variant="contained" fullWidth className="login-button">
            Log In
          </Button>
        </form>
        <Typography variant="body2" className="forgot-password">
          <a href="/forgot-password">Lost your password?</a>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;