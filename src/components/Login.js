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

const StyledTextField = styled(TextField)({
  marginBottom: '1rem',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'white',
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
    smartcourse: SmartCourseLogo
  };

  const taglines = {
    smartgrow: "Collect • Analyse • Report • Action",
    smartcourse: "Optimise • Maintain • Enhance • Excel"
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
    <Container maxWidth={false} className="login-container">
      <Box className="login-form-container">
        <img 
          src={logos[brand]} 
          alt={`${brand === 'smartgrow' ? 'SmartGrow' : 'SmartCourse'} Logo`} 
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
                sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
              />
            }
            label="Remember Me"
            className="remember-me"
            sx={{ color: 'white' }}
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