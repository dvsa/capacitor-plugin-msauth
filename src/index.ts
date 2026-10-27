import { registerPlugin } from '@capacitor/core';

import type { MsAuthPlugin as PluginDefinition } from './definitions';

const MsAuthPlugin = registerPlugin<PluginDefinition>('MsAuthPlugin', {
	web: () => import('./web').then((m) => new m.MsAuth()),
});

export * from './definitions';
export { MsAuthPlugin };
