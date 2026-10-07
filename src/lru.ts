class Link<K, V> {
  prev: Link<K, V> | null = null;
  next: Link<K, V> | null = null;
  key: K;
  value: V;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

/**
 * Capacity-bounded LRU. `get` and `set` are O(1).
 * A hash map finds the node. A doubly linked list orders it.
 * `head.next` is most recently used. `tail.prev` is the eviction candidate.
 * The head and tail links are sentinels, so the list is never empty.
 */
export class LruShelf<K, V> {
  readonly capacity: number;
  private readonly items = new Map<K, Link<K, V>>();
  private readonly head = new Link<K, V>(undefined as K, undefined as V);
  private readonly tail = new Link<K, V>(undefined as K, undefined as V);

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error("capacity must be an integer >= 1");
    }
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get size(): number {
    return this.items.size;
  }

  has(key: K): boolean {
    return this.items.has(key);
  }

  /** Returns the value and marks the key most recently used. */
  get(key: K): V | undefined {
    const node = this.items.get(key);
    if (!node) return undefined;
    this.detach(node);
    this.attach(node);
    return node.value;
  }

  /**
   * Insert or replace. Replacing refreshes recency and does not grow `size`.
   * When `size` would pass `capacity`, the least recently used key is dropped.
   * `undefined` is reserved for a missing `get`, so it cannot be stored.
   */
  set(key: K, value: V): void {
    if (value === undefined) {
      throw new Error("undefined values are not stored");
    }
    const existing = this.items.get(key);
    if (existing) {
      existing.value = value;
      this.detach(existing);
      this.attach(existing);
      return;
    }
    const node = new Link(key, value);
    this.items.set(key, node);
    this.attach(node);
    if (this.items.size > this.capacity) this.evict();
  }

  delete(key: K): boolean {
    const node = this.items.get(key);
    if (!node) return false;
    this.items.delete(key);
    this.detach(node);
    return true;
  }

  /** Most recently used first. Does not change recency. */
  keys(): K[] {
    const out: K[] = [];
    let cursor = this.head.next;
    while (cursor && cursor !== this.tail) {
      out.push(cursor.key);
      cursor = cursor.next;
    }
    return out;
  }

  private attach(node: Link<K, V>) {
    const first = this.head.next;
    node.prev = this.head;
    node.next = first;
    this.head.next = node;
    if (first) first.prev = node;
  }

  private detach(node: Link<K, V>) {
    const prev = node.prev;
    const next = node.next;
    if (prev) prev.next = next;
    if (next) next.prev = prev;
    node.prev = null;
    node.next = null;
  }

  private evict() {
    const stale = this.tail.prev;
    if (!stale || stale === this.head) return;
    this.items.delete(stale.key);
    this.detach(stale);
  }
}
