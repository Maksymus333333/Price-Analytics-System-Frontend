import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PricesPage } from '../../pages/PricesPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PricesPage />} />
    </Routes>
  );
};
