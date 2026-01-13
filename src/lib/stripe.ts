import Stripe from 'stripe';
import { prisma } from './prisma';

// Initialize Stripe only when the secret key is available
// This prevents build errors when the key is not set
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
};

// Lazy initialization for build compatibility
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' })
  : (null as unknown as Stripe);

export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
  VIP_MONTHLY: process.env.STRIPE_PRICE_VIP_MONTHLY!,
};

export const PURCHASE_PRICES = {
  VOTES_5: { amount: 99, description: 'Pack 5 votes bonus' },
  PHOTO_SLOT: { amount: 299, description: 'Slot photo supplémentaire' },
  BOOST_24H: { amount: 199, description: 'Boost visibilité 24h' },
  RANK_REVEAL: { amount: 49, description: 'Révéler rang exact' },
  FAST_TRACK: { amount: 299, description: 'Modération prioritaire' },
};

export type PurchaseType = keyof typeof PURCHASE_PRICES;

export async function createSubscriptionCheckout(
  userId: string,
  tier: 'PREMIUM' | 'VIP',
  returnUrl: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) throw new Error('Utilisateur non trouvé');

  const priceId = tier === 'PREMIUM'
    ? STRIPE_PRICES.PREMIUM_MONTHLY
    : STRIPE_PRICES.VIP_MONTHLY;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, tier },
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
  });

  return session.url!;
}

export async function createOneTimePayment(
  userId: string,
  purchaseType: PurchaseType,
  metadata?: Record<string, string>
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) throw new Error('Utilisateur non trouvé');

  const priceInfo = PURCHASE_PRICES[purchaseType];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: priceInfo.description },
          unit_amount: priceInfo.amount,
        },
        quantity: 1,
      },
    ],
    metadata: { userId, purchaseType, ...metadata },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase/success?type=${purchaseType}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase/canceled`,
  });

  return session.url!;
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        await handleSubscriptionCreated(session);
      } else if (session.mode === 'payment') {
        await handleOneTimePayment(session);
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(subscription);
      break;
    }
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as 'PREMIUM' | 'VIP';
  if (!userId || !tier) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  // In the 2025 API, current_period_end is on subscription items
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionId: subscription.id,
        subscriptionEnd: new Date(currentPeriodEnd * 1000),
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: tier === 'PREMIUM' ? 'SUBSCRIPTION_PREMIUM' : 'SUBSCRIPTION_VIP',
        amount: session.amount_total!,
        currency: session.currency!,
        stripePaymentId: session.payment_intent as string,
        description: `Abonnement ${tier}`,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    }),
  ]);

  // Update global stats
  await prisma.globalStats.update({
    where: { id: 'global' },
    data: {
      [tier === 'PREMIUM' ? 'totalPremium' : 'totalVip']: { increment: 1 },
      totalRevenue: { increment: session.amount_total! },
    },
  });
}

async function handleOneTimePayment(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const purchaseType = session.metadata?.purchaseType as PurchaseType;
  if (!userId || !purchaseType) return;

  await prisma.transaction.create({
    data: {
      userId,
      type: `PURCHASE_${purchaseType.replace('_', '_')}` as never,
      amount: session.amount_total!,
      currency: session.currency!,
      stripePaymentId: session.payment_intent as string,
      description: PURCHASE_PRICES[purchaseType].description,
      status: 'COMPLETED',
      completedAt: new Date(),
      metadata: session.metadata as never,
    },
  });

  // Apply purchase effects
  switch (purchaseType) {
    case 'VOTES_5':
      await prisma.user.update({
        where: { id: userId },
        data: { bonusVotes: { increment: 5 } },
      });
      break;

    case 'PHOTO_SLOT':
      await prisma.user.update({
        where: { id: userId },
        data: { bonusPhotoSlots: { increment: 1 } },
      });
      break;

    case 'BOOST_24H':
      const photoId = session.metadata?.photoId;
      if (photoId) {
        await prisma.visibilityBoost.create({
          data: {
            userId,
            photoId,
            endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }
      break;

    case 'FAST_TRACK':
      const fastTrackPhotoId = session.metadata?.photoId;
      if (fastTrackPhotoId) {
        await prisma.photo.update({
          where: { id: fastTrackPhotoId },
          data: { moderationPriority: 3 },
        });
      }
      break;
  }

  // Update global stats
  await prisma.globalStats.update({
    where: { id: 'global' },
    data: { totalRevenue: { increment: session.amount_total! } },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscription.id },
  });
  if (!user) return;

  // In the 2025 API, current_period_end is on subscription items
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionEnd: new Date(currentPeriodEnd * 1000) },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscription.id },
  });
  if (!user) return;

  const previousTier = user.subscriptionTier;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'FREE',
      subscriptionId: null,
      subscriptionEnd: null,
    },
  });

  // Update global stats
  if (previousTier !== 'FREE') {
    await prisma.globalStats.update({
      where: { id: 'global' },
      data: {
        [previousTier === 'PREMIUM' ? 'totalPremium' : 'totalVip']: { decrement: 1 },
      },
    });
  }
}

export async function createCustomerPortal(userId: string, returnUrl: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionId: true },
  });

  if (!user?.subscriptionId) throw new Error('Pas d\'abonnement actif');

  const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.customer as string,
    return_url: returnUrl,
  });

  return session.url;
}
