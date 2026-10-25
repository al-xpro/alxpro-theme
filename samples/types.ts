// Generics, classes, decorators, numbers and the rest of TypeScript's grammar.

export const enum Size {
  Sm = 0x10,
  Md = 1_000,
  Lg = 2.5e3,
}

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

type RouteParams<Path extends string> = Path extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof RouteParams<Rest>]: string }
  : Path extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : {};

function logged<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext<This>
) {
  return function (this: This, ...args: Args): R {
    console.log(`→ ${String(context.name)}`, args);
    return target.apply(this, args);
  };
}

export abstract class Cache<K, V> implements Iterable<[K, V]> {
  static readonly #instances = new Set<Cache<unknown, unknown>>();
  protected readonly store = new Map<K, { value: V; expires: number }>();

  constructor(private readonly ttl = 60 * 1000) {
    Cache.#instances.add(this);
  }

  @logged
  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (entry && entry.expires > Date.now()) return entry.value;
    this.store.delete(key);
    return undefined;
  }

  abstract load(key: K): Promise<V>;

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (const [key, { value }] of this.store) yield [key, value];
  }
}

export const isEmail = (value: string): value is `${string}@${string}` =>
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value) && value.length <= 254;

let retries = 3;
const timeout = 250n;
const flags = {
  dryRun: true,
  verbose: false,
  target: null,
  region: undefined,
} as const satisfies Record<string, unknown>;

export type Settings = DeepPartial<typeof flags> & RouteParams<"/teams/:team/projects/:id">;
