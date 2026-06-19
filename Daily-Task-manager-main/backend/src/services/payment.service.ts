/**
 * Payment Service - Stripe Integration
 * 
 * Handles subscriptions, billing, and payment processing
 */

import Stripe from 'stripe';
import logger from '../config/logger';
import { getCacheService } from './cache.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

// Subscription plans
export const PLANS = {
  FREE: {
    id: 'price_free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: null,
    features: {
      tasks: 100,
      storage: '1GB',
      ai_requests: 5,
      team_members: 1
    }
  },
  PRO: {
    id: 'price_pro_monthly',
    name: 'Pro',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    features: {
      tasks: 10000,
      storage: '100GB',
      ai_requests: 1000,
      team_members: 10
    }
  },
  ENTERPRISE: {
    id: 'price_enterprise_monthly',
    name: 'Enterprise',
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    features: {
      tasks: 100000,
      storage: '1TB',
      ai_requests: 100000,
      team_members: 100,
      sso: true,
      advanced_reporting: true
    }
  }
};

class PaymentService {
  /**
   * Create or get Stripe customer
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string) {
    try {
      const cache = await getCacheService();
      const cacheKey = cache.keys.user(userId, 'stripe_customer');
      
      // Check cache first
      const cached = await cache.get<any>(cacheKey);
      if (cached?.id) {
        return cached;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name: name || email,
        metadata: { userId }
      });

      // Cache for 30 days
      await cache.set(cacheKey, customer, 30 * 24 * 60 * 60);

      logger.info('Stripe customer created', {
        userId,
        customerId: customer.id
      });

      return customer;
    } catch (error: any) {
      logger.error('Failed to create Stripe customer', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create subscription for user
   */
  async createSubscription(
    userId: string,
    customerId: string,
    priceId: string
  ): Promise<any> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });

      logger.info('Subscription created', {
        userId,
        subscriptionId: subscription.id,
        status: subscription.status
      });

      return subscription;
    } catch (error: any) {
      logger.error('Failed to create subscription', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, updates: any): Promise<any> {
    try {
      const subscription = await stripe.subscriptions.update(
        subscriptionId,
        updates
      );

      logger.info('Subscription updated', {
        subscriptionId,
        changes: Object.keys(updates)
      });

      return subscription;
    } catch (error: any) {
      logger.error('Failed to update subscription', {
        subscriptionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediate: boolean = false) {
    try {
      const subscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: !immediate,
          // If immediate, leave cancel_at_period_end as is to let delete handle it
        }
      );

      if (immediate) {
        await stripe.subscriptions.del(subscriptionId);
      }

      logger.info('Subscription cancelled', {
        subscriptionId,
        immediate
      });

      return subscription;
    } catch (error: any) {
      logger.error('Failed to cancel subscription', {
        subscriptionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error: any) {
      logger.error('Failed to get subscription', {
        subscriptionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create payment intent for one-time payment
   */
  async createPaymentIntent(
    customerId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: any
  ): Promise<any> {
    try {
      const intent = await stripe.paymentIntents.create({
        customer: customerId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true
        },
        metadata: metadata || {}
      });

      logger.info('Payment intent created', {
        customerId,
        amount,
        intentId: intent.id
      });

      return intent;
    } catch (error: any) {
      logger.error('Failed to create payment intent', {
        customerId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          logger.debug('Unhandled webhook event', { type: event.type });
      }
    } catch (error: any) {
      logger.error('Webhook processing error', {
        eventId: event.id,
        error: error.message
      });
      throw error;
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    logger.info('Subscription updated webhook', {
      subscriptionId: subscription.id,
      status: subscription.status
    });

    // TODO: Update subscription status in database
    // const user = await User.findOne({ stripeCustomerId: subscription.customer });
    // if (user) {
    //   await User.updateOne(
    //     { _id: user._id },
    //     { subscriptionStatus: subscription.status }
    //   );
    // }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    logger.info('Subscription deleted webhook', {
      subscriptionId: subscription.id
    });

    // TODO: Update user to free plan
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    logger.info('Invoice paid webhook', {
      invoiceId: invoice.id,
      amount: invoice.amount_paid
    });

    // TODO: Record payment and update user subscription
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    logger.warn('Payment failed webhook', {
      invoiceId: invoice.id,
      customerId: invoice.customer
    });

    // TODO: Notify user of failed payment
  }

  private async handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
    logger.info('Payment succeeded webhook', {
      intentId: intent.id,
      amount: intent.amount
    });

    // TODO: Record payment
  }

  private async handlePaymentIntentFailed(intent: Stripe.PaymentIntent) {
    logger.warn('Payment intent failed webhook', {
      intentId: intent.id,
      customerId: intent.customer
    });

    // TODO: Notify user
  }

  /**
   * Calculate pricing tier based on usage
   */
  async calculateReceivedPrice(usage: any): Promise<{ plan: string; price: number }> {
    // Determines which plan is appropriate based on usage
    const { tasks, ai_requests, team_members } = usage;

    if (tasks <= PLANS.FREE.features.tasks && 
        ai_requests <= PLANS.FREE.features.ai_requests &&
        team_members <= PLANS.FREE.features.team_members) {
      return {
        plan: 'free',
        price: PLANS.FREE.price
      };
    }

    if (tasks <= PLANS.PRO.features.tasks && 
        ai_requests <= PLANS.PRO.features.ai_requests &&
        team_members <= PLANS.PRO.features.team_members) {
      return {
        plan: 'pro',
        price: PLANS.PRO.price
      };
    }

    return {
      plan: 'enterprise',
      price: PLANS.ENTERPRISE.price
    };
  }

  /**
   * Generate invoice for user
   */
  async generateInvoice(customerId: string): Promise<Stripe.Invoice> {
    try {
      // By default, Stripe generates invoices automatically on subscription renewal
      // This method can be used to generate an immediate invoice for upgrades, usage, etc.

      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: true
      });

      logger.info('Invoice generated', {
        customerId,
        invoiceId: invoice.id
      });

      return invoice;
    } catch (error: any) {
      logger.error('Failed to generate invoice', {
        customerId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      return await stripe.invoices.retrieve(invoiceId);
    } catch (error: any) {
      logger.error('Failed to get invoice', {
        invoiceId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * List invoices for customer
   */
  async listInvoices(customerId: string): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 50
      });

      return invoices.data;
    } catch (error: any) {
      logger.error('Failed to list invoices', {
        customerId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(
    body: string,
    signature: string,
    secret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error: any) {
      logger.error('Webhook signature validation failed', {
        error: error.message
      });
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
