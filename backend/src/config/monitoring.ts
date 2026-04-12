import * as Sentry from '@sentry/node';
import logger from './logger';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export const initializeSentry = () => {
  if (!process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    logger.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV !== 'production',
    attachStacktrace: true,
    
    // Performance Monitoring
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ request: true, serverName: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection()
    ],

    // Ignore certain errors
    denyUrls: [
      // Browser extensions
      /extensions/i,
      /^chrome:\/\//i,
      // Browser plugins
      /1\.0\.0\/$/,
      /http:\/\/DetectifyScanner/i,
      /CloudFlare-estimate/i
    ],

    // Custom configuration
    beforeSend(event, hint) {
      // Filter out specific errors
      if (event.exception) {
        const error = hint.originalException;
        
        // Don't send 404s
        if (error instanceof Error && error.message.includes('not found')) {
          return null;
        }
      }

      return event;
    },

    // Release tracking
    release: process.env.APP_VERSION || '1.0.0'
  });

  logger.info('Sentry initialized', {
    environment: process.env.NODE_ENV,
    dsn: process.env.SENTRY_DSN ? 'configured' : 'not configured'
  });
};

/**
 * Capture exception with context
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.setContext('additional_context', context || {});
  Sentry.captureException(error);
  logger.logError(error, context);
};

/**
 * Capture message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  Sentry.captureMessage(message, level);
  logger.info(message, context || {});
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, email?: string, name?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username: name
  });
};

/**
 * Clear user context
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category: string = 'user-action', data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data
  });
};

/**
 * Get Sentry request handler middleware
 */
export const getSentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler();
};

/**
 * Get Sentry transaction middleware
 */
export const getSentryTransactionHandler = () => {
  return Sentry.Handlers.tracingHandler();
};

/**
 * Get Sentry error handler middleware
 */
export const getSentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler();
};

export default Sentry;
