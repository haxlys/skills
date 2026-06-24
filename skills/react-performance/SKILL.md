---
name: react-performance
description: "Use when reviewing, diagnosing, or refactoring React or Next.js code for modern rendering performance: sluggish inputs, slow search/filtering, unnecessary re-renders, bad state placement, overuse of useMemo/useCallback/React.memo, React Compiler migration, useTransition/startTransition, useDeferredValue, lazy loading, profiler-driven fixes, unstable keys, context churn, useEffect chains, and inline object props."
---

# React Performance

Modern React performance work is not "add memo everywhere." Treat performance as removing unnecessary work, keeping urgent interactions responsive, loading less JavaScript up front, and profiling before changing code.

This skill is based on Depender Sethi's "React Performance: From Sluggish to Lightning" and is meant to turn that article into an actionable code-review workflow.

Source: https://www.sethi.io/blog/react-performance-from-sluggish-to-lightning

## Review Order

Use this order unless the user gives a narrower target:

1. Measure the slow interaction.
2. Fix state placement and re-render fan-out.
3. Remove unnecessary manual memoization.
4. Use concurrent features for non-urgent updates.
5. Split heavy code and defer work that is not needed yet.
6. Audit common remount and reference hazards.

Do not start by adding `useMemo`, `useCallback`, or `React.memo`. First identify what work is unnecessary or blocking.

## 1. Measure First

Before optimizing, establish the bottleneck.

- Use React DevTools Profiler for component render cost and "why did this render?"
- Use Chrome Performance for long JavaScript tasks and input blocking.
- Use Core Web Vitals for user-facing impact:
  - LCP should be below 2.5s.
  - INP should be below 200ms.
  - CLS should be below 0.1.

Treat components below roughly 1ms render time as usually not worth optimizing. A 16ms render consumes a full 60fps frame budget. A long task above 50ms can block user input.

## 2. Move State Down

State placement is usually the highest-leverage React performance fix.

Look for state stored above components that do not read it:

```tsx
function App() {
  const [query, setQuery] = useState("");

  return (
    <>
      <Header />
      <SearchBar query={query} onChange={setQuery} />
      <Sidebar />
      <ProductList />
    </>
  );
}
```

If only search needs the state, colocate it:

```tsx
function App() {
  return (
    <>
      <Header />
      <SearchSection />
      <Sidebar />
      <ProductList />
    </>
  );
}

function SearchSection() {
  const [query, setQuery] = useState("");
  return <SearchBar query={query} onChange={setQuery} />;
}
```

Prefer this before memoization. Smaller render subtrees beat cached work around the wrong tree shape.

## 3. Use The Children Pattern

When a stateful wrapper must own state but should not re-render heavy content, pass heavy content as `children` from the parent.

```tsx
function ScrollTracker({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <ScrollIndicator position={scrollY} />
      {children}
    </>
  );
}
```

Because the child elements are created by the parent, the wrapper's state updates do not recreate those children.

For high-frequency values such as scroll, pointer position, animation frame state, or resize events, first consider refs, CSS, browser APIs, throttling, or animation libraries instead of React state.

## 4. Stop Memoizing By Default

Manual memoization has runtime and maintenance cost. Remove or avoid it when the computation is cheap, the reference is not passed to a memoized child, or React Compiler can handle it.

Avoid:

```tsx
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
const onClick = useCallback(() => setCount((count) => count + 1), []);
```

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`;
const onClick = () => setCount((count) => count + 1);
```

Reach for memoization only when profiling or API constraints prove it matters:

- Expensive computation around 1ms+ or over large collections.
- Stable references required by third-party charts, forms, maps, or animation libraries.
- Effect dependencies would otherwise loop or reconnect.
- A child is deliberately wrapped in `React.memo` and prop identity is the measured bottleneck.

If React Compiler is enabled, assume routine component/value/function memoization is redundant unless profiling shows otherwise.

## 5. Keep Urgent Updates Responsive

Use `useTransition` or `startTransition` when you own the state update and the expensive result can lag behind the direct user input.

```tsx
function Search({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    startTransition(() => {
      setResults(filterItems(items, nextQuery));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results items={results} />
    </>
  );
}
```

Good use cases:

- Search or filtering over large datasets.
- Tab changes that reveal heavy content.
- Navigation or route transitions.
- Any update where stale UI for a moment is better than blocking input.

Use `useDeferredValue` when you do not own the state update, such as when the value comes from props, context, URL params, or external state.

```tsx
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  const filtered = useMemo(
    () => filterExpensiveList(deferredQuery),
    [deferredQuery],
  );

  return <ResultList items={filtered} dimmed={isStale} />;
}
```

Rule of thumb:

- Own the setter: use `useTransition` or `startTransition`.
- Receive the value: use `useDeferredValue`.

## 6. Split Heavy Code

Do not load heavy routes or feature sections before the user needs them.

Use route-level splitting where the framework gives it to you, such as Next.js app routes. Add component-level splitting only for genuinely heavy or rarely used sections:

```tsx
const DataVisualization = lazy(() => import("./DataVisualization"));

function Report({ showChart }: { showChart: boolean }) {
  return (
    <>
      <ReportSummary />
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <DataVisualization />
        </Suspense>
      )}
    </>
  );
}
```

Do not split tiny components such as buttons or badges. Every lazy boundary adds loading UI, coordination overhead, and potential network latency.

## 7. Audit High-Risk Hazards

Check these patterns before making more subtle optimizations.

### Components Defined Inside Components

Never define a component inside another component's render body. It creates a new component type on every parent render and can remount, losing state and effects.

```tsx
function Child() {
  return <div />;
}

function Parent() {
  return <Child />;
}
```

### Unstable Keys

Do not use unstable keys for lists that can reorder, insert, or delete items.

Avoid:

```tsx
items.map((item, index) => <Row key={index} item={item} />);
items.map((item) => <Row key={Math.random()} item={item} />);
```

Prefer stable IDs:

```tsx
items.map((item) => <Row key={item.id} item={item} />);
```

### Context Providers Too High Or Too Broad

Context value changes re-render consumers. Keep providers close to where the value is needed, and split read/write contexts when many components only need the setter.

```tsx
const ThemeContext = createContext("dark");
const ThemeSetterContext = createContext<Dispatch<SetStateAction<string>>>(() => {});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeSetterContext.Provider value={setTheme}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </ThemeSetterContext.Provider>
  );
}
```

### useEffect Chains

Avoid chains where one effect sets state, causing another effect to run, causing another render. Combine dependent work into one async flow, parallelize independent requests, or use a data-fetching library.

```tsx
useEffect(() => {
  async function load() {
    const user = await fetchUser(userId);
    const [posts, followers] = await Promise.all([
      fetchPosts(user.id),
      fetchFollowers(user.id),
    ]);
    setData({ user, posts, followers });
  }

  load();
}, [userId]);
```

### Object, Array, And Style Literals In JSX Props

Inline literals create new references every render and can break memoized children or third-party components that compare by reference.

Hoist static values:

```tsx
const MAP_CENTER = { lat: 51.5, lng: -0.1 };
const CHART_DATA = [1, 2, 3, 4, 5];
const PANEL_STYLE = { marginTop: 20 };
```

Use `useMemo` only when the object depends on changing values and reference stability is required.

## Output Expectations

When using this skill for a review, report:

1. The measured or suspected bottleneck.
2. The re-render or loading path causing it.
3. The smallest structural fix, preferably state colocation or children composition before memoization.
4. Whether concurrent features, lazy loading, or context splitting apply.
5. Any hazards found: nested component definitions, unstable keys, effect chains, broad context, or inline reference props.
6. How to validate the fix: profiler interaction, Chrome trace, Core Web Vitals, or a targeted regression test.
