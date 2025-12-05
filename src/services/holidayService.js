// src/services/holidayService.js
import api from './api';

// Get all holidays
export const getHolidays = async (params) => {
  const { data } = await api.get('/holidays', { params });
  return data;
};

// Get holiday by ID
export const getHolidayById = async (id) => {
  const { data } = await api.get(`/holidays/${id}`);
  return data;
};

// Create new holiday
export const createHoliday = async (holidayData) => {
  const { data } = await api.post('/holidays', holidayData);
  return data;
};

// Update holiday
export const updateHoliday = async (id, holidayData) => {
  const { data } = await api.put(`/holidays/${id}`, holidayData);
  return data;
};

// Delete holiday
export const deleteHoliday = async (id) => {
  const { data } = await api.delete(`/holidays/${id}`);
  return data;
};

// Get upcoming holidays
export const getUpcomingHolidays = async () => {
  const { data } = await api.get('/holidays/upcoming');
  return data;
};

// Get holidays by year
export const getHolidaysByYear = async (year) => {
  const { data } = await api.get(`/holidays/year/${year}`);
  return data;
};