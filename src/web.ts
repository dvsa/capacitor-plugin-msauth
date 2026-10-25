// biome-ignore-all lint/suspicious/noConsole: Logging is helpful here
import {
	BrowserCacheLocation,
	CacheLookupPolicy,
	type Configuration,
	createStandardPublicClientApplication,
	type IPublicClientApplication,
} from '@azure/msal-browser';
import { WebPlugin } from '@capacitor/core';

import type { BaseOptions, MsAuthPlugin } from './definitions';

type WebBaseOptions = BaseOptions;

interface WebLoginOptions extends WebBaseOptions {
	scopes: string[];
	forceRefresh?: boolean;
	redirectUri?: string;
}

type WebLogoutOptions = WebBaseOptions;

interface AuthResult {
	accessToken: string;
	idToken: string;
	scopes: string[];
}

export class MsAuth extends WebPlugin implements MsAuthPlugin {
	async login(options: WebLoginOptions): Promise<AuthResult> {
		const context = await this.createContext(options);

		try {
			const redirectResult = await context.handleRedirectPromise();

			if (redirectResult?.accessToken && redirectResult.idToken) {
				return {
					accessToken: redirectResult.accessToken,
					idToken: redirectResult.idToken,
					scopes: options.scopes,
				};
			}

			return await this.acquireTokenSilently(context, options.scopes, options.forceRefresh).catch(() =>
				this.acquireTokenInteractively(context, options.scopes, options.redirectUri, options.domainHint)
			);
		} catch (error) {
			console.error('MSAL: Error occurred while logging in', error);

			throw error;
		}
	}

	async logout(options: WebLogoutOptions): Promise<void> {
		const context = await this.createContext(options);
		const account = context.getAllAccounts()[0];

		// Ensure local token cache is cleared even if there is no signed-in account.
		await context.clearCache();

		if (!account) {
			return;
		}

		await context.logoutRedirect({
			account,
			postLogoutRedirectUri: this.getCurrentUrl(),
		});
	}

	logoutAll(options: WebLogoutOptions): Promise<void> {
		return this.logout(options);
	}

	private createContext(options: WebBaseOptions): Promise<IPublicClientApplication> {
		const config: Configuration = {
			auth: {
				clientId: options.clientId,
				authority: options.authorityUrl ?? `https://login.microsoftonline.com/${options.tenant ?? 'common'}`,
				knownAuthorities: options.knownAuthorities,
				redirectUri: this.getCurrentUrl(),
			},
			cache: {
				cacheLocation: BrowserCacheLocation.LocalStorage,
			},
		};

		// MSAL v3+ must be initialised before use; this returns an initialised instance.
		return createStandardPublicClientApplication(config);
	}

	private getCurrentUrl(): string {
		return window.location.href.split(/[?#]/)[0];
	}

	private async acquireTokenInteractively(
		context: IPublicClientApplication,
		scopes: string[],
		redirectUri?: string,
		domainHint?: string
	): Promise<AuthResult> {
		await context.acquireTokenRedirect({
			scopes,
			prompt: 'select_account',
			redirectUri: redirectUri ?? this.getCurrentUrl(),
			domainHint,
		});

		// Redirect-based auth navigates away; this call will complete after the app returns and `handleRedirectPromise()` is processed.
		return new Promise<AuthResult>(() => undefined);
	}

	private async acquireTokenSilently(
		context: IPublicClientApplication,
		scopes: string[],
		forceRefresh?: boolean
	): Promise<AuthResult> {
		const { accessToken, idToken } = await context.acquireTokenSilent({
			scopes,
			account: context.getAllAccounts()[0],
			// Never fall back to hidden-iframe renewal: since MSAL v5 it needs a redirect bridge page in the host app.
			// If the refresh token can't be used, this fails fast and login() falls back to the redirect flow.
			cacheLookupPolicy: forceRefresh ? CacheLookupPolicy.RefreshToken : CacheLookupPolicy.AccessTokenAndRefreshToken,
		});

		return { accessToken, idToken, scopes };
	}
}
