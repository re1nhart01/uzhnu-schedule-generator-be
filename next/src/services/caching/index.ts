import { LocalConfig } from "@/constants/localconfig";
import { CacheCluster } from "./content/CacheCluster";
import { TokensStorage } from "./content/primitives/TokensStorage";
export const tokensCacheStore = new TokensStorage();

export type SpecifierType = {};

export const currentCacheCluster = (id: string) =>
  new CacheCluster({
    cluster: {},
    config: {
      allow: [],
      persistenceName: `${id}_${LocalConfig.cacheClusterPeristKey}`,
      timestampsName: `${id}_${LocalConfig.cacheClusterTTLKey}`,
      headersName: `${id}_${LocalConfig.headersCacheKey}`,
    },
    storage: {
      getString(key: string) {
        return localStorage.getItem(key);
      },
      delete(key: string) {
        return localStorage.removeItem(key);
      },
      set(key: string, data: unknown) {
        return localStorage.setItem(key, JSON.stringify(data));
      },
    },
  });
