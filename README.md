# lrushelf

O(1) LRU cache. No dependencies.

`get` and `set` are constant time. A `Map` finds the entry. A doubly linked list remembers which key was used last. The two ends of the list are sentinel nodes, so insert and delete never special-case an empty list.

## Use

```ts
import { LruShelf } from "./src/lru.ts";

const cache = new LruShelf<string, number>(2);
cache.set("a", 1);
cache.set("b", 2);
cache.get("a");
cache.set("c", 3);
cache.get("b"); // undefined, b was the least recently used
```

`has` does not refresh recency. Replacing a key updates the value and moves it to the front without growing `size`. `undefined` is not a stored value, because `get` uses it for a miss.

## Cost

| operation | time |
|---|---|
| get, set, delete, has | O(1) |
| keys | O(n) |

Eviction drops `tail.prev`, the least recently used real node.

## Test

```bash
node --experimental-strip-types --test test/*.test.ts
```

## License

MIT
