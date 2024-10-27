import React, { createContext, useContext, useState } from 'react';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brand, setBrand] = useState('smartgrow'); // Default to SmartGrow

  const toggleBrand = () => {
    setBrand(prevBrand => prevBrand === 'smartgrow' ? 'smartcourse' : 'smartgrow');
  };

  return (
    <BrandContext.Provider value={{ brand, toggleBrand }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);
