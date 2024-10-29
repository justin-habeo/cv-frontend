import React, { createContext, useContext, useState } from 'react';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brand, setBrand] = useState('a_eye'); // Default to SmartGrow

  const toggleBrand = () => {
    setBrand(prevBrand => {
      if (prevBrand === 'smartgrow') return 'smartcourse';
      if (prevBrand === 'smartcourse') return 'a_eye';
      return 'smartgrow'; // cycles back to the first option
    });
  };
  return (
    <BrandContext.Provider value={{ brand, toggleBrand }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);
