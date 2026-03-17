import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: `File too large. Max allowed is ${process.env.MAX_FILE_SIZE_MB || 500}MB.`,
      });
      return;
    }

    res.status(400).json({ error: err.message });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Unexpected server error',
  });
};
