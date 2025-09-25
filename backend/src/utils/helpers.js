import crypto from 'crypto';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

// Generate random string
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate random number
export const generateRandomNumber = (min = 100000, max = 999999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate UUID
export const generateUUID = () => {
  return uuidv4();
};

// Hash string
export const hashString = (string, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(string).digest('hex');
};

// Generate verification token
export const generateVerificationToken = () => {
  return generateRandomString(32);
};

// Generate password reset token
export const generatePasswordResetToken = () => {
  return generateRandomString(32);
};

// Generate API key
export const generateApiKey = () => {
  const prefix = 'rbb_';
  const randomPart = generateRandomString(40);
  return `${prefix}${randomPart}`;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format number
export const formatNumber = (number, locale = 'en-US') => {
  return new Intl.NumberFormat(locale).format(number);
};

// Format date
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Format date time
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

// Format relative time
export const formatRelativeTime = (date) => {
  return moment(date).fromNow();
};

// Calculate time remaining
export const calculateTimeRemaining = (endDate) => {
  const now = moment();
  const end = moment(endDate);
  const duration = moment.duration(end.diff(now));
  
  if (duration.asMilliseconds() <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Check if date is expired
export const isExpired = (date) => {
  return moment().isAfter(moment(date));
};

// Check if date is in the future
export const isFuture = (date) => {
  return moment().isBefore(moment(date));
};

// Add time to date
export const addTime = (date, amount, unit = 'minutes') => {
  return moment(date).add(amount, unit).toDate();
};

// Subtract time from date
export const subtractTime = (date, amount, unit = 'minutes') => {
  return moment(date).subtract(amount, unit).toDate();
};

// Generate slug from string
export const generateSlug = (string) => {
  return string
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Capitalize first letter
export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Capitalize words
export const capitalizeWords = (string) => {
  return string.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Truncate string
export const truncateString = (string, length = 100, suffix = '...') => {
  if (string.length <= length) return string;
  return string.substring(0, length - suffix.length) + suffix;
};

// Remove HTML tags
export const stripHtml = (html) => {
  return html.replace(/<[^>]*>/g, '');
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

// Validate URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Generate pagination info
export const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

// Calculate pagination offset
export const calculateOffset = (page, limit) => {
  return (page - 1) * limit;
};

// Generate search query
export const generateSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  const regex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map(field => ({ [field]: regex }))
  };
};

// Generate sort object
export const generateSortObject = (sortBy, sortOrder = 'asc') => {
  const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
  return { [sortBy]: order };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Merge objects deeply
export const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

// Remove undefined values from object
export const removeUndefined = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};

// Convert object to query string
export const objectToQueryString = (obj) => {
  const params = new URLSearchParams();
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      params.append(key, obj[key]);
    }
  }
  return params.toString();
};

// Parse query string to object
export const queryStringToObject = (queryString) => {
  const params = new URLSearchParams(queryString);
  const obj = {};
  for (const [key, value] of params) {
    obj[key] = value;
  }
  return obj;
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate avatar initials
export const generateAvatarInitials = (firstName, lastName) => {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  return firstInitial + lastInitial;
};

// Calculate distance between coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate QR code data
export const generateQRCodeData = (data) => {
  return JSON.stringify({
    type: 'auction',
    data: data,
    timestamp: Date.now()
  });
};

// Parse QR code data
export const parseQRCodeData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch {
    return null;
  }
};

// Generate unique filename
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
};

// Validate file type
export const validateFileType = (filename, allowedTypes) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

// Get file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Sleep function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default {
  generateRandomString,
  generateRandomNumber,
  generateUUID,
  hashString,
  generateVerificationToken,
  generatePasswordResetToken,
  generateApiKey,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  calculateTimeRemaining,
  isExpired,
  isFuture,
  addTime,
  subtractTime,
  generateSlug,
  capitalize,
  capitalizeWords,
  truncateString,
  stripHtml,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  generatePagination,
  calculateOffset,
  generateSearchQuery,
  generateSortObject,
  deepClone,
  deepMerge,
  removeUndefined,
  objectToQueryString,
  queryStringToObject,
  generateRandomColor,
  generateAvatarInitials,
  calculateDistance,
  generateQRCodeData,
  parseQRCodeData,
  generateUniqueFilename,
  validateFileType,
  formatFileSize,
  sleep,
  retry,
  debounce,
  throttle
};
