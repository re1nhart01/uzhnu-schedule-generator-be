import type { FC, PropsWithChildren } from "react";
import { useState } from "react";
import { createContext } from "react";

import { CacheSpecifier } from "./content/CacheSpecifier";
import type { SpecifierType } from "./index";
import { currentCacheCluster } from "./index";

export const cache: CacheSpecifier<SpecifierType> =
  new CacheSpecifier<SpecifierType>();
export const CacheContext = createContext<CacheSpecifier<SpecifierType> | null>(
  null
);

export const CacheProvider: FC<PropsWithChildren> = ({ children }) => {
  const [currentCache, setCurrentCache] = useState(cache);

  // useEffect(() => {
  //   if (!isNil(spacesIds)) {
  //     setCurrentCache(
  //       cache.createMany(
  //         [...spacesIds, LocalConfig.globalCacheCluster],
  //         currentCacheCluster
  //       )
  //     );
  //     cache.restoreAll();
  //   }
  // }, [spacesIds]);

  return (
    <CacheContext.Provider value={currentCache}>
      {children}
    </CacheContext.Provider>
  );
};
