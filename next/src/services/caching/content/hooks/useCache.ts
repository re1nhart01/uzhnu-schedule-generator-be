import { isNil } from "ramda";
import { useCallback, useMemo, useRef } from "react";

import type { AcceptableCacheStore } from "../CacheCluster";
import type { CacheSpecifier } from "../CacheSpecifier";
import type { ObjectCacheStorage } from "../primitives/ObjectCacheStorage";
import { allItemsByType, isObject, keyPaging } from "../../helpers";

export const useCache = <
  Specifier extends AcceptableCacheStore,
  StoreType extends CacheSpecifier<Specifier>
>(
  store: StoreType
) => {
  const currentSpace = { id: "" };
  const cache = useRef(store);
  const lastClusterConfig = useRef<string | number>("");

  const currentCluster = useMemo(() => {
    if (isNil(currentSpace)) return null;
    return cache.current.cluster(currentSpace.id);
  }, [currentSpace]);

  const compute = useCallback(
    async <ListType>({
      path,
      key,
      setter,
      fetch,
      isOverride = false,
    }: {
      path: keyof Specifier;
      fetch: () => Promise<void>;
      setter: (item: ListType) => void;
      key: string;
      isOverride?: boolean;
    }) => {
      if (!currentSpace || !cache?.current.cluster(currentSpace.id)) return;
      const cluster = cache.current.cluster(currentSpace.id);
      const [storage, needToFlush] = cluster.get(path) as unknown as [
        ObjectCacheStorage<string, ListType>,
        boolean
      ];
      const item = storage.getItem(key);
      try {
        if (item) {
          setter(item);
        }

        if (needToFlush) {
          storage.removeAll();
          cluster.persist();
        }

        if (isOverride || isNil(item)) {
          await fetch();
          const newItem = storage.getItem(key);
          if (newItem) setter(newItem);
        }
      } catch {}
    },
    [currentSpace]
  );

  const updateDataOnChange = <ListType>(
    setter: ((item: ListType[]) => void),
    prev: ListType[],
    newData: ListType[]
  ) => {
    if (JSON.stringify(prev) === JSON.stringify(newData)) {
      return;
    }

    setter(newData);
  };

  const updateCurrentItems = <ListType>(
    allItems: ListType[],
    newItems: ListType[],
    keyExtractor: (item: ListType) => string
  ): ListType[] => {
    if (newItems.length === 0) return allItems;
    if (allItems.length === 0) return newItems;

    const itemMap = new Map<string, ListType>();

    allItems.forEach((item) => itemMap.set(keyExtractor(item), item));

    newItems.forEach((newItem) => {
      const key = keyExtractor(newItem);
      if (itemMap.has(key)) {
        itemMap.set(key, newItem);
      }
    });

    const existingKeys = new Set(itemMap.keys());
    const newUniqueItems = newItems.filter(
      (item) => !existingKeys.has(keyExtractor(item))
    );

    return [
      ...allItems.map((item) => itemMap.get(keyExtractor(item))!),
      ...newUniqueItems,
    ];
  };

  const computeList = async <ListType>({
    key,
    setter,
    fetch,
    page,
    currentItems,
    all,
    setPage,
    clusterId,
    keyExtractor,
    customKeyFunc,
    effectOnCacheRead,
    pagingNow,
  }: {
    key: keyof Specifier;
    keyExtractor?: (item: ListType) => string;
    fetch: () => Promise<ListType[]>;
    setter: (item: ListType[]) => void;
    currentItems: ListType[];
    all?: boolean;
    page: number;
    clusterId?: string;
    customKeyFunc?: (page: number) => string;
    effectOnCacheRead?: () => void | Promise<void>;
    setPage?: (page: number) => void;
    pagingNow?: boolean;
  }) => {
    if (!currentSpace) return [];

    const solidClusterId = clusterId ?? currentSpace.id;
    const cluster = cache.current.cluster(solidClusterId);
    const [path, needToFlush] = cluster.get(key);
    const originalItems = currentItems ? currentItems.slice() : [];

    const config = `key_${
      key as string
    }_page_${page}_clusterId_${solidClusterId}`;

    try {
      const pathKey = customKeyFunc
        ? customKeyFunc(page)
        : isObject(path)
        ? keyPaging(page)
        : page;

      if (lastClusterConfig.current === config && pagingNow) return [];
      const newPage = path.getItem(pathKey as never) || [];
      const pagedData = [...currentItems, ...newPage];
      lastClusterConfig.current = config;

      if (all) {
        const allCachedItems = allItemsByType<
          Specifier[typeof key],
          ListType[]
        >(path);
        setter(allCachedItems);
      } else if (page > 1) {
        setter(pagedData);
      } else {
        setter(newPage);
      }

      if (newPage.length > 0) {
        effectOnCacheRead?.();
        setPage?.(page);
      }

      if (needToFlush) {
        path.removeAll();
        cluster.persist();
      }

      const fetchedData = (await fetch()) || [];
      if (!keyExtractor) {
        if (all) {
          updateDataOnChange(setter, currentItems, fetchedData);
        } else if (page > 1) {
          updateDataOnChange(setter, currentItems, [
            ...originalItems,
            ...fetchedData,
          ]);
        } else {
          updateDataOnChange(setter, currentItems, fetchedData);
        }
      } else {
        setter(updateCurrentItems(pagedData, fetchedData, keyExtractor));
      }

      return fetchedData;
    } catch (e) {
      console.log(e);
    }
    return [];
  };

  const findBool = useCallback(
    (key: keyof Specifier, uniqueId: string | number) => {
      if (isNil(currentSpace)) return false;
      return !isNil(
        store
          .cluster(currentSpace.id)
          .get(key)[0]
          .getItem(uniqueId as never)
      );
    },
    [currentSpace, store]
  );

  return {
    compute,
    computeList,
    findBool,
    currentCluster,
  };
};
