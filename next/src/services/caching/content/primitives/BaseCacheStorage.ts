import { NONE_TIMESTAMP } from "../CacheCluster";

export type Primitive = string | number | boolean | null | undefined | symbol;

export interface BaseCacheStorage<Key, Store, Entity> {
  setAll?(data: Record<string, Entity> | Entity[]): void;
  getAll?():
    | { [key in keyof Key]: Entity }
    | { [key: string]: Entity }
    | Entity[];
  removeAll?(): void;
  updateItemChunk?(
    key: Key,
    data: Entity extends Primitive ? Entity : Partial<Entity>
  ): Promise<void> | void;
  assign?(
    data: { [key in keyof Key]: Entity } | Entity[]
  ): Promise<void> | void;
  getSpecificItems?(): { [key in keyof Key]: Entity } | Entity[];
  find?(f: (item: Entity) => boolean): {
    index: number | string;
    item: Entity;
  } | null;
}

export type CacheStorageConfig = {
  TTL: number;
};

export abstract class BaseCacheStorage<
  Key = unknown,
  Store = unknown,
  Entity = unknown
> {
  protected _store: Store;
  public config: CacheStorageConfig;
  protected constructor(
    protected limit: number,
    store: Store,
    config?: CacheStorageConfig
  ) {
    this._store = store;
    this.config = config || { TTL: NONE_TIMESTAMP };
  }

  public abstract addItem(key: Key, data: Entity): Promise<void> | void;
  public abstract updateItem(key: Key, data: Entity): Promise<void> | void;
  public abstract getItem(key: Key): Promise<Entity | null> | Entity | null;
  public abstract removeItem(key: Key): Promise<void> | void;
}
