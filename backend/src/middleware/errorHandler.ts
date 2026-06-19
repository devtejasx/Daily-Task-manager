import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error)

  const status = error.status || 500
  const message = error.message || 'Internal Server Error'

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date(),
  })
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    error: error.message,
    timestamp: new Date(),
  })
}
