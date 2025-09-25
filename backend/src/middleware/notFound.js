import { AppError } from './errorHandler.js';

const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export default notFound;
