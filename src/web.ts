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
			const redirectResponse = await context.handleRedirectPromise();

			if (redirectResponse?.accessToken && redirectResponse.idToken) {
				const { accessToken, idToken, scopes } = redirectResponse;

				return { accessToken, idToken, scopes };
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

	logout(options: WebLogoutOptions): Promise<void> {
		const context = this.createContext(options);

		if (!context.getAllAccounts()[0]) {
			return Promise.reject(new Error("Nothing to sign out from."));
		} else {
			return context.logoutPopup();
		}
	}

	logoutAll(options: WebLogoutOptions): Promise<void> {
		return this.logout(options);
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

		throw new Error("MSAL: Interactive login redirect initiated.");
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
