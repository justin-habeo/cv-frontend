import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import ReactCompareImage from 'react-compare-image';
import WidgetWrapper from '../WidgetWrapper';
import apiService from '../../../services/apiService';

function ImageDisplayWidget({ config, isDesignMode, showHeader }) {
  const [primaryImage, setPrimaryImage] = useState(null);
  const [secondaryImage, setSecondaryImage] = useState(null);

  useEffect(() => {
    if (config.primaryImage) {
      fetchImage(config.primaryImage, setPrimaryImage);
    }
    if (config.secondaryImage) {
      fetchImage(config.secondaryImage, setSecondaryImage);
    }
  }, [config.primaryImage, config.secondaryImage]);

  const fetchImage = async (imageId, setImageFunction) => {
    try {
      const response = await apiService.getUploadedImage(imageId);
      console.log('Fetched image data:', response);
      setImageFunction(response.image_url);  // Use image_url instead of image
    } catch (error) {
      console.error('Error fetching image data:', error);
    }
  };

  const renderSingleImage = (src) => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        padding: '1mm',
        boxSizing: 'border-box',
      }}
    >
      <Box
        component="img"
        src={src}
        alt="Single Image"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Box>
  );

  const renderSlider = (leftImage, rightImage) => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        padding: '1mm',
        boxSizing: 'border-box',
      }}
    >
      <ReactCompareImage
        leftImage={leftImage}
        rightImage={rightImage}
        sliderLineWidth={2}
        sliderLineColor="white"
        handle={<SliderButton />}
      />
    </Box>
  );

  const SliderButton = () => (
    <Box
      sx={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
      }}
    >
      <Box
        sx={{
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '10px 0 10px 15px',
          borderColor: 'transparent transparent transparent black',
          transform: 'translateX(2px)',
        }}
      />
      <Box
        sx={{
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '10px 15px 10px 0',
          borderColor: 'transparent black transparent transparent',
          transform: 'translateX(-2px)',
        }}
      />
    </Box>
  );

  const renderContent = () => {
    console.log('Rendering content with config:', config);
    console.log('Primary Image:', primaryImage);
    console.log('Secondary Image:', secondaryImage);

    if (config.widgetType === 'slider' && primaryImage && secondaryImage) {
      return renderSlider(primaryImage, secondaryImage);
    } else if (primaryImage) {
      return renderSingleImage(primaryImage);
    } else {
      return <Box>No image available</Box>;
    }
  };

  return (
    <WidgetWrapper title={config.name || 'Image Display'} showHeader={showHeader}>
      <Box 
        height="100%" 
        width="100%" 
        overflow="hidden"
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderContent()}
      </Box>
    </WidgetWrapper>
  );
}

export default ImageDisplayWidget;