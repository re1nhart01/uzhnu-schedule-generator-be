import type { AllStorages } from "./content/CacheCluster";
import { ArrayCacheStorage } from "./content/primitives/ArrayCacheStorage";
import { ObjectCacheStorage } from "./content/primitives/ObjectCacheStorage";

export const HOUR = 3600000;
export const DAY = 86400000;
export const generateId = (...arr: unknown[]) => arr.join("_");

export const keyPaging = (page: number | string) => `page_${page}`;

export const getAllObject = <T extends ObjectCacheStorage<unknown, unknown>>(d: T) =>
  Object.values(d.getAll()).flat() as T extends ObjectCacheStorage<
    string,
    infer U
  >
    ? U
    : never;

export const isObject = <T extends AllStorages>(d: T) =>
  d instanceof ObjectCacheStorage;
export const isArray = <T extends AllStorages>(d: T) =>
  d instanceof ArrayCacheStorage;

export const allItemsByType = <T extends AllStorages, D>(path: T) => {
  if (isObject(path)) {
    return getAllObject(path as ObjectCacheStorage<string, D>);
  } else if (isArray(path)) {
    return (path as ArrayCacheStorage<D>).getAll().flat();
  } else {
    return [];
  }
};

export const instanceGetItem = <D, T extends AllStorages>(
  path: T,
  k: string | number
): D | null => {
  if (isObject(path)) {
    const objectPath = path as ObjectCacheStorage<string, D>;
    return objectPath.getItem(k as string);
  } else if (isArray(path)) {
    const objectPath = path as ArrayCacheStorage<D>;
    return objectPath.getItem(k as number);
  }

  return null;
};

export function paginateItems<T>(
  keyfunc: (page: number) => string,
  items: T[],
  itemsPerPage: number
) {
  const result: Record<string, T[]> = {};
  const totalPages = Math.ceil(items.length / itemsPerPage);

  for (let i = 0; i < totalPages; i++) {
    const start = i * itemsPerPage;
    const end = start + itemsPerPage;
    const key = keyfunc(i + 1);
    result[key] = items.slice(start, end);
  }

  return result;
}
