## React Hook Rules
Hooks can only be called at the top level of a component or a custom hook. Do not call them inside loops, conditions, or nested functions.
- **Rule**: Call hooks at the top level.
- **Fix**: Move the hook call outside of any conditionals or loops.
- **Severity**: Critical

## Missing Dependencies in useEffect/useCallback
If you are using external variables inside `useEffect` or `useCallback`, you must include them in the dependency array.
- **Rule**: Always include reactive dependencies.
- **Fix**: Add missing variables to the dependency array.
- **Severity**: Medium
