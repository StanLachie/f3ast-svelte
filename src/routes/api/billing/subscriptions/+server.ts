import { stripe } from '$lib/stripe';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import prisma from '$lib/prisma';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature') as string;
	let event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		console.error(`⚠️ Webhook signature verification failed.`, err);
		throw error(400, 'Invalid request.');
	}

	switch (event.type) {
		case 'invoice.paid':
			{
				const subscriptionDetails = event.data.object.subscription_details;
				const restaurantId = subscriptionDetails?.metadata?.restaurantId;

				if (restaurantId) {
					const restaurant = await prisma.restaurant.findUnique({
						where: {
							id: parseInt(restaurantId)
						}
					});

					if (restaurant) {
						await prisma.restaurant.update({
							where: {
								id: restaurant.id
							},
							data: {
								active: true
							}
						});

						await prisma.subscription.upsert({
							where: {
								restaurantId: restaurant.id
							},
							update: {
								status: 'active',
								stripeSubscriptionId: (event.data.object.subscription as string) || '',
								stripeCustomerId: (event.data.object.customer as string) || ''
							},
							create: {
								restaurantId: restaurant.id,
								stripeSubscriptionId: (event.data.object.subscription as string) || '',
								stripeCustomerId: (event.data.object.customer as string) || '',
								status: 'active'
							}
						});
					}
				}
			}

			break;
		case 'invoice.payment_failed': {
			const subscriptionDetails = event.data.object.subscription_details;
			const restaurantId = subscriptionDetails?.metadata?.restaurantId;

			if (restaurantId) {
				const restaurant = await prisma.restaurant.findUnique({
					where: {
						id: parseInt(restaurantId)
					}
				});

				if (restaurant) {
					await prisma.restaurant.update({
						where: {
							id: restaurant.id
						},
						data: {
							active: false
						}
					});

					await prisma.subscription.update({
						where: {
							restaurantId: restaurant.id
						},
						data: {
							status: 'inactive'
						}
					});
				}
			}

			break;
		}
	}

	return json({ received: true });
};
