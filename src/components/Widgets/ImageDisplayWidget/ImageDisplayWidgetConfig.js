import React, { useState, useEffect } from 'react';
import { Button, Grid, TextField, FormControlLabel, Radio, RadioGroup, Select, MenuItem, IconButton, Box, Typography } from '@mui/material';
import { AddAPhoto, Delete } from '@mui/icons-material';
import apiService from '../../../services/apiService';

function ImageDisplayWidgetConfig({ widget, index, handleWidgetChange, selectedSite }) {
  const [imageWidgets, setImageWidgets] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    if (selectedSite) {
      fetchImageWidgets();
      fetchUploadedImages();
    }
  }, [selectedSite]);

  const fetchImageWidgets = async () => {
    try {
      const response = await apiService.get(`/image-widgets/?site=${selectedSite}`);
      setImageWidgets(response.data || []);
    } catch (error) {
      console.error('Error fetching image widgets:', error);
      setImageWidgets([]);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await apiService.get(`/uploaded-images/?site=${selectedSite}`);
      setUploadedImages(response.data || []);
    } catch (error) {
      console.error('Error fetching uploaded images:', error);
      setUploadedImages([]);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', file);
    formData.append('site', selectedSite);
    formData.append('name', file.name);  // Add this line to include the file name
  
    try {
      const response = await apiService.uploadImage(formData);
      console.log('Upload response:', response);
      if (response && response.id) {
        setUploadedImages(prevImages => [...prevImages, response]);
      } else {
        console.error('Invalid response from image upload:', response);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleImageSelect = (imageField, imageId) => {
    handleWidgetChange(index, `config.${imageField}`, imageId);
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await apiService.deleteImage(imageId);
      setUploadedImages(prevImages => prevImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Widget Name"
          value={widget.config.name || ''}
          onChange={(e) => handleWidgetChange(index, 'config.name', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <RadioGroup
          row
          value={widget.config.widgetType || 'single'}
          onChange={(e) => handleWidgetChange(index, 'config.widgetType', e.target.value)}
        >
          <FormControlLabel value="single" control={<Radio />} label="Single Image" />
          <FormControlLabel value="slider" control={<Radio />} label="Image Slider" />
        </RadioGroup>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" component="label" startIcon={<AddAPhoto />}>
          Upload Image
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Select
          fullWidth
          value={widget.config.primaryImage || ''}
          onChange={(e) => handleImageSelect('primaryImage', e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>Select Primary Image</em>
          </MenuItem>
          {uploadedImages.map((image) => (
            <MenuItem key={image.id} value={image.id}>
              {image.name}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      {widget.config.widgetType === 'slider' && (
        <Grid item xs={12}>
          <Select
            fullWidth
            value={widget.config.secondaryImage || ''}
            onChange={(e) => handleImageSelect('secondaryImage', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select Secondary Image</em>
            </MenuItem>
            {uploadedImages.map((image) => (
              <MenuItem key={image.id} value={image.id}>
                {image.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      )}
    </>
  );
}

export default ImageDisplayWidgetConfig;