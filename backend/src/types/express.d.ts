// Global Express request augmentation: authenticateToken attaches userId,
// route handlers written against the richer shape also read user/requestId.
declare global {
  namespace Express {
    interface Request {
      userId?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user?: any
      requestId?: string
    }
  }
}

export {}
