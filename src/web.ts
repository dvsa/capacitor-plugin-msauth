import { PublicClientApplication } from "@azure/msal-browser";
import { WebPlugin } from "@capacitor/core";

import type { BaseOptions, MsAuthPlugin } from "./definitions";

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
		const context = this.createContext(options);

		try {
			const redirectResult = await context.handleRedirectPromise();

			if (redirectResult?.accessToken && redirectResult.idToken) {
				return {
					accessToken: redirectResult.accessToken,
					idToken: redirectResult.idToken,
					scopes: redirectResult.scopes,
				};
			}

			return await this.acquireTokenSilently(
				context,
				options.scopes,
				options.forceRefresh,
			).catch(() =>
				this.acquireTokenInteractively(
					context,
					options.scopes,
					options.redirectUri,
				),
			);
		} catch (error) {
			console.error("MSAL: Error occurred while logging in", error);

			throw error;
		}
	}

	async logout(options: WebLogoutOptions): Promise<void> {
		const context = this.createContext(options);
		const account = context.getAllAccounts()[0];

		// Ensure local token cache is cleared even if there is no signed-in account.
		this.clearMsalCache();

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

	private clearMsalCache(): void {
		const clearStorage = (storage: Storage) => {
			const keysToRemove: string[] = [];

			for (let index = 0; index < storage.length; index += 1) {
				const key = storage.key(index);

				if (key?.startsWith("msal.")) {
					keysToRemove.push(key);
				}
			}

			for (const key of keysToRemove) {
				storage.removeItem(key);
			}
		};

		try {
			clearStorage(window.localStorage);
		} catch (error) {
			console.warn("MSAL: Failed to clear localStorage cache", error);
		}

		try {
			clearStorage(window.sessionStorage);
		} catch (error) {
			console.warn("MSAL: Failed to clear sessionStorage cache", error);
		}
	}

	private createContext(options: WebBaseOptions) {
		const config = {
			auth: {
				clientId: options.clientId,
				domainHint: options.domainHint,
				authority:
					options.authorityUrl ??
					`https://login.microsoftonline.com/${options.tenant ?? "common"}`,
				knownAuthorities: options.knownAuthorities,
				redirectUri: this.getCurrentUrl(),
			},
			cache: {
				cacheLocation: "localStorage",
			},
		};

		return new PublicClientApplication(config);
	}

	private getCurrentUrl(): string {
		return window.location.href.split(/[?#]/)[0];
	}

	private async acquireTokenInteractively(
		context: PublicClientApplication,
		scopes: string[],
		redirectUri?: string,
	): Promise<AuthResult> {
		await context.acquireTokenRedirect({
			scopes,
			prompt: "select_account",
			redirectUri: redirectUri ?? this.getCurrentUrl(),
		});

		throw new Error(
			"MSAL redirect started. Call login again after returning to the app.",
		);
	}

	private async acquireTokenSilently(
		context: PublicClientApplication,
		scopes: string[],
		forceRefresh?: boolean,
	): Promise<AuthResult> {
		const { accessToken, idToken } = await context.acquireTokenSilent({
			scopes,
			account: context.getAllAccounts()[0],
			forceRefresh: forceRefresh ?? false,
		});

		return { accessToken, idToken, scopes };
	}
}
