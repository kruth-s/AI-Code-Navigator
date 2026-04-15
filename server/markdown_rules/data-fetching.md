## Avoid useEffect for Data Fetching
In Next.js App Router, using `useEffect` for data fetching on the client side is discouraged unless you have a specific reason. 
It can lead to waterfall requests, layout shifts, and poor performance.
- **Rule**: Avoid `useEffect` for data fetching.
- **Fix**: Use Server Components (async/await directly) or Server Actions. If client-side fetching is necessary, use `SWR` or `React Query`.
- **Severity**: High

## Do not use APIs inside Server Components
Server components shouldn't call their own Next.js API routes using `fetch('/api/...')` because it causes an unnecessary network roundtrip.
- **Rule**: Never fetch internal API routes from Server Components.
- **Fix**: Import and call the server-side logic (e.g. database query) directly inside the component.
- **Severity**: High
