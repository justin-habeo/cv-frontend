export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const GOOGLE_MAPS_LIBRARIES = ["drawing", "places", "marker"];

export const GOOGLE_MAPS_OPTIONS = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: GOOGLE_MAPS_LIBRARIES,
};