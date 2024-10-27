export const calculateDroughtStressIndex = (temp, precip, humidity, windSpeed) => {
  // Replace this with your actual drought stress index calculation
  return (temp * 0.4) - (precip * 0.3) - (humidity * 0.2) + (windSpeed * 0.1);
};
