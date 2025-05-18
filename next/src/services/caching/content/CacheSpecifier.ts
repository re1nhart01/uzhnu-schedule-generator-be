import type { AcceptableCacheStore, CacheCluster } from "./CacheCluster";

export class CacheSpecifier<T extends AcceptableCacheStore> {
  private readonly _clusterList: { [key: string]: CacheCluster<T> };
  constructor() {
    this._clusterList = {};
  }

  public create(id: string, createFn: () => CacheCluster<T>) {
    this._clusterList[id] = createFn();
    return this;
  }

  public createMany(ids: string[], createFn: (id: string) => CacheCluster<T>) {
    ids.forEach((id) => {
      this._clusterList[id] = createFn(id);
    });
    return this;
  }

  public destroy() {
    for (const cluster in this._clusterList) {
      this._clusterList[cluster].clear();
    }
  }

  public restoreAll() {
    for (const cluster in this._clusterList) {
      this._clusterList?.[cluster].restore();
    }
  }

  public cluster(id: string) {
    return this._clusterList[id];
  }
}
