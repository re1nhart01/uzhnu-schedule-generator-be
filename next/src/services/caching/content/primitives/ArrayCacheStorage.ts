import { equals, isNil } from "ramda";

import type { CacheStorageConfig, Primitive } from "./BaseCacheStorage";
import { BaseCacheStorage } from "./BaseCacheStorage";
import { isPrimitive } from "@/helpers/functions";

const MAX_LIMIT = 1000;

export class ArrayCacheStorage<
  Data,
  Key extends number = number
> extends BaseCacheStorage<Key, Array<Data>, Data> {
  constructor({
    config,
    limit,
  }: {
    config?: CacheStorageConfig;
    limit?: number;
  }) {
    super(limit || MAX_LIMIT, [], config);
  }
  public override addItem(key: Key, data: Data): void {
    if (this._store.length >= this.limit) {
      this._store = [];
    }
    if (equals(key, -1) || key > this._store.length) {
      this._store.push(data);
    } else {
      this._store[key] = data;
    }
  }

  public override removeAll(): void {
    this._store = [];
  }

  public override assign(data: Data[]): void {
    if (data.length <= 0) {
      return;
    }

    this._store = this.merge(this._store, data);
  }

  public override updateItem(key: Key, data: Data): void {
    const copy = [...this._store];
    if (key < 0 || key > copy.length) {
      return;
    }
    this._store[key] = data;
  }

  private merge<T>(a: T, b: Partial<T>): T {
    if (isNil(a)) return b as T;
    if (isNil(b)) return a as T;
    return Array.isArray(a) && Array.isArray(b)
      ? ([...a, ...b] as T)
      : ({ ...a, ...b } as T);
  }

  public override updateItemChunk(
    key: Key,
    data: Data extends Primitive ? Data : Partial<Data>
  ): void {
    if (key < 0 || key >= this._store.length) {
      return;
    }

    const item = this._store[key];
    if (item) {
      const isPrimitiveValue = isPrimitive(data);
      if (isPrimitiveValue) {
        this._store[key] = data as Data;
      } else {
        this._store[key] = this.merge(item, data as Partial<Data>);
      }
    }
  }

  public override getItem(key: Key): Data {
    return key >= 0 && key < this._store.length
      ? this._store[key]
      : ([] as Data);
  }
  public override removeItem(key: Key): void {
    if (key >= 0 && key < this._store.length) {
      this._store = [...this._store].splice(key, 1);
    }
  }

  public override getSpecificItems(...items: Key[]): Data[] {
    const result = [];
    for (const item in items) {
      if (this._store[item]) result.push(this._store[item]);
    }
    return result;
  }

  public override getAll(): Data[] {
    return [...this._store];
  }

  public override setAll(data: Data[]) {
    if (data.length > this.limit) {
      return;
    }
    this._store = [...data];
  }
}
