import assert from "node:assert/strict";
import { test } from "node:test";
import { LruShelf } from "../src/lru.ts";

test("evicts the least recently used key", () => {
  const cache = new LruShelf<string, number>(2);
  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.get("b"), 2);
  assert.equal(cache.get("c"), 3);
  assert.deepEqual(cache.keys(), ["c", "b"]);
});

test("get refreshes recency and protects the key", () => {
  const cache = new LruShelf<string, number>(2);
  cache.set("a", 1);
  cache.set("b", 2);
  assert.equal(cache.get("a"), 1);
  cache.set("c", 3);
  assert.equal(cache.has("b"), false);
  assert.equal(cache.get("a"), 1);
});

test("replace does not grow the cache", () => {
  const cache = new LruShelf<string, number>(1);
  cache.set("a", 1);
  cache.set("a", 2);
  assert.equal(cache.size, 1);
  assert.equal(cache.get("a"), 2);
});

test("delete unlinks the middle of the list", () => {
  const cache = new LruShelf<string, number>(3);
  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);
  assert.equal(cache.delete("b"), true);
  assert.equal(cache.delete("b"), false);
  cache.set("d", 4);
  assert.deepEqual(cache.keys(), ["d", "c", "a"]);
});

test("has does not change recency", () => {
  const cache = new LruShelf<string, number>(2);
  cache.set("a", 1);
  cache.set("b", 2);
  assert.equal(cache.has("a"), true);
  cache.set("c", 3);
  assert.equal(cache.get("a"), undefined);
});

test("rejects a bad capacity and undefined values", () => {
  assert.throws(() => new LruShelf(0));
  assert.throws(() => new LruShelf(1.5));
  const cache = new LruShelf<string, number | undefined>(1);
  assert.throws(() => cache.set("a", undefined));
});
