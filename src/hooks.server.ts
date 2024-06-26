import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			/**
			 * SvelteKit's cookies API requires `path` to be explicitly set in
			 * the cookie options. Setting `path` to `/` replicates previous/
			 * standard behavior.
			 */
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, path: '/' });
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, path: '/' });
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	event.locals.getClientAccount = async () => {
		const { data: clientAccount, error: clientAccountError } = await event.locals.supabase
			.from('ClientAccount')
			.select('*')
			.eq('email', event.locals.user?.email)
			.single();

		if (clientAccountError || !clientAccount) {
			return { clientAccount: null, restaurant: null };
		}

		const { data: restaurant, error: restaurantError } = await event.locals.supabase
			.from('Restaurant')
			.select('*')
			.eq('id', clientAccount.restaurantId)
			.single();

		if (restaurantError || !restaurant) {
			return { clientAccount: null, restaurant: null };
		}

		return { clientAccount, restaurant };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` header, so we need to
			 * tell SvelteKit to pass it through.
			 */
			return name === 'content-range';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!event.locals.session && event.url.pathname.startsWith('/private')) {
		return redirect(303, '/auth');
	}

	if (event.locals.session && event.url.pathname === '/auth') {
		return redirect(303, '/private');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
