// copilot/prompts/performance-optimization-checklist.prompt.md
# Prompt: Performance Optimization Checklist

## Overview
Use this prompt to identify and implement performance improvements in the application.

## Performance Assessment

### 1. **Baseline Measurement** 📊
- [ ] Current performance metrics captured (page load time, first paint, TTI)
- [ ] Target performance goals defined
- [ ] Chrome DevTools Performance tab analyzed
- [ ] Lighthouse report generated
- [ ] Web Vitals monitored (LCP, FID, CLS)

### 2. **Bundle Size Analysis** 📦
- [ ] Total bundle size measured
- [ ] Component-level code-splitting identified
- [ ] Unused dependencies removed
- [ ] Large dependencies evaluated for alternatives
- [ ] Tree-shaking enabled (`npm run build` uses minification)

### 3. **React/Component Performance** ⚛️
- [ ] Unnecessary re-renders identified (React DevTools Profiler)
- [ ] `React.memo()` applied to expensive components
- [ ] `useMemo()` used for expensive calculations
- [ ] `useCallback()` used for event handlers passed to children
- [ ] Key props are unique and stable (not array indices)
- [ ] State is placed at correct level (not overly deep)
- [ ] Virtualization used for large lists (100+ items)

### 4. **Firebase/Data Fetching** 🔥
- [ ] Firestore queries use indexes
- [ ] Queries are paginated (not fetching all docs)
- [ ] Real-time listeners are cleaned up on unmount
- [ ] Polling/fetching intervals are reasonable (not too frequent)
- [ ] Data is cached where appropriate
- [ ] Composite indexes created for complex queries
- [ ] Collection size assessed (consider partitioning if > 100k docs)

### 5. **Asset Optimization** 🖼️
- [ ] Images are optimized (compressed, correct format)
- [ ] Lazy loading used for off-screen images
- [ ] SVGs are preferred over PNG for icons
- [ ] Font loading optimized (font-display: swap)
- [ ] CSS is minified
- [ ] Critical CSS inlined for LCP improvement

### 6. **Network Performance** 🌐
- [ ] API calls batched where possible (GraphQL or batch endpoints)
- [ ] Request/response payloads are reasonable size
- [ ] Gzip/Brotli compression enabled
- [ ] CDN used for static assets
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] DNS prefetch configured for external domains

### 7. **Runtime Performance** ⚡
- [ ] No blocking scripts on main thread
- [ ] Long tasks broken into smaller chunks
- [ ] Worker threads used for heavy computation (if applicable)
- [ ] Debouncing/throttling applied to frequent events
- [ ] Event listeners removed when no longer needed
- [ ] No memory leaks (check DevTools Memory tab)

### 8. **Database Indexes** 📑
- [ ] Firestore indexes created for all commonly queried fields
- [ ] Compound indexes for multi-field queries
- [ ] Index size monitored (indexes consume storage)
- [ ] Unused indexes removed periodically

### 9. **Caching Strategy** 💾
- [ ] Browser caching configured (Cache-Control headers)
- [ ] Service Worker caching implemented (if offline support needed)
- [ ] Data caching strategy (when to refresh)
- [ ] Stale-while-revalidate pattern considered

### 10. **Monitoring & Profiling** 📈
- [ ] Performance monitoring set up (Sentry, Firebase Performance)
- [ ] Slow transactions identified
- [ ] Critical user journeys profiled
- [ ] Alerts configured for performance regressions

## Performance Optimization Techniques

### For Components
```typescript
// ❌ BAD: Inline arrow function, recreated each render
<Button onClick={() => doSomething(id)} />

// ✅ GOOD: useCallback to memoize function
const handleClick = useCallback(() => doSomething(id), [id]);
<Button onClick={handleClick} />
```

### For Lists
```typescript
// ❌ BAD: Rendering all 10,000 items
{items.map((item, index) => <ItemComponent key={index} item={item} />)}

// ✅ GOOD: Virtual scrolling for large lists
<VirtualList items={items} itemCount={items.length} />
```

### For Data Fetching
```typescript
// ❌ BAD: Fetching all data on component mount
useEffect(() => {
  fetchAllData(); // Could be 100k docs
}, []);

// ✅ GOOD: Pagination with limits
useEffect(() => {
  fetchData(pageSize: 20, page: currentPage);
}, [currentPage]);
```

### For Queries
```typescript
// ❌ BAD: No index, full collection scan
const docs = await db.collection('students').where('status', '==', 'active').get();

// ✅ GOOD: Indexed query with pagination
const docs = await db.collection('students')
  .where('status', '==', 'active')
  .where('institutionId', '==', institutionId)
  .limit(50)
  .get();
```

## Common Slowdowns & Fixes

| Issue | Impact | Fix |
|-------|--------|-----|
| Unindexed Firestore query | 🔴 Slow data fetching | Create composite index |
| No pagination | 🔴 Large dataset transfer | Add `.limit()` and pagination |
| Unnecessary re-renders | 🟡 Sluggish UI | Use `React.memo()`, `useMemo()` |
| Large bundle | 🔴 Slow initial load | Code-split components |
| Uncompressed images | 🟡 Slow image load | Compress and optimize |
| Memory leaks | 🔴 Degradation over time | Clean up listeners/timers |
| Blocking scripts | 🔴 Poor LCP/FID | Move to Web Workers |
| N+1 queries | 🔴 Excessive API calls | Batch or use joins |

## Performance Budget

Define and track performance budgets:
```
Performance Budget:
- Bundle size: < 500 KB (gzipped)
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s
```

## Post-Optimization

- [ ] Baseline metrics compared with new metrics
- [ ] Improvements documented (% improvement)
- [ ] Performance monitoring activated
- [ ] Team notified of improvements
- [ ] Optimization documented for future reference

## Tools

- Chrome DevTools Performance tab
- Lighthouse (npm install -g lighthouse)
- React DevTools Profiler
- Firebase Performance Monitoring
- Sentry (error and performance tracking)
- Bundle Analyzer (webpack-bundle-analyzer)

---

**Use this prompt to systematically identify and optimize performance bottlenecks in the application.**
