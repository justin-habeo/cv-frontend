// src/components/Dashboard/GoogleMapsProvider.js

import React from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_OPTIONS } from '../../config/googleMapsConfig';

function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_OPTIONS);

  if (loadError) {
    return <div>Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return <>{children}</>;
}

export default GoogleMapsProvider;