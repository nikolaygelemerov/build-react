import { idGenerator } from './services/index.js';

export const React = (Component) => {
  // Component ID
  const componentId = idGenerator();

  /* useState START */
  // Initial useState index
  let useStateIndex = 0;

  // Store state values by index
  let stateValues = {};

  // Store setState fn by index
  let setStateCache = {};
  /* useState END */

  /* useLayoutEffect START */
  // Initial useLayoutEffect index
  let useLayoutEffectIndex = 0;

  // Store useLayoutEffect deps by index
  let useLayoutEffectDependencies = {};

  // Store useLayoutEffectCallback fn by index
  let useLayoutEffectCallbackCache = {};

  // Store useLayoutEffect fn in a queue
  let useLayoutEffectQueue = [];
  /* useLayoutEffect END */

  /* useEffect START */
  // Initial useEffect index
  let useEffectIndex = 0;

  // Store useEffect deps by index
  let useEffectDependencies = {};

  // Store useEffectCallback fn by index
  let useEffectCallbackCache = {};

  // Store useEffect fn in a queue
  let useEffectQueue = [];
  /* useEffect END */

  /* useCallback START */
  // Initial useCallback index
  let useCallbackIndex = 0;

  // Store useCallback deps by index
  let useCallbackDependencies = {};

  // Store useCallback fn by index
  let useCallbackFnCache = {};
  /* useCallback END */

  /* Microtask queue START */

  // Boolean flag to check if a microtask was already queued
  let hasQueuedMicrotask = false;
  // Store a reference to the latest microtask
  let latestMicrotask;

  /* Microtask queue END */

  const react = {
    componentId,

    /**
     * @method addMicrotask
     *
     * @param { function } microtaskFn
     *
     * @returns void
     */
    addMicrotask: (microtaskFn) => {
      // On each call re-assign
      latestMicrotask = microtaskFn;

      // Queue a microtask only once
      if (!hasQueuedMicrotask) {
        // Set the flag to true
        hasQueuedMicrotask = true;

        // The only queued microtask will execute with
        // the latest `microtaskFn`
        queueMicrotask(() => {
          // Reset the flag
          hasQueuedMicrotask = false;
          latestMicrotask();
        });
      }
    },

    /**
     * @method resetIndexes
     *
     * @returns void
     */
    resetIndexes() {
      useStateIndex = 0;
      useLayoutEffectIndex = 0;
      useEffectIndex = 0;
      useCallbackIndex = 0;
    },

    /**
     * @method init
     *
     * @returns void
     */
    init() {
      const result = Component(react);

      // Get the `root` element
      const root = document.querySelector('#root');

      // Check if content with the given ID already exists
      const existingContent = document.querySelector(`#${componentId}`);

      if (!existingContent) {
        // Create new content element
        const newContent = document.createElement('div');
        newContent.id = componentId;
        newContent.innerHTML = result;

        // Append new content to the parent element
        root.appendChild(newContent);
      }

      // Call `render` initially
      react.render();
    },

    /**
     * @method render
     *
     * @returns void
     */
    render() {
      const result = Component(react);

      // Get the component container element by `componentId`
      const existingContent = document.querySelector(`#${componentId}`);
      existingContent.innerHTML = result;

      requestAnimationFrame(() => {
        // Execute `useLayoutEffectQueue` effects one by one
        // in requestAnimationFrame callback
        // (just before the browser repaints)
        for (let fn of useLayoutEffectQueue) {
          fn();
        }

        // Empty the `useLayoutEffectQueue`
        useLayoutEffectQueue = [];

        // Execute `useEffectQueue` effects one by one
        // in a nested requestAnimationFrame callback
        // (just to guarantee that a paint has already occurred)
        requestAnimationFrame(() => {
          for (let fn of useEffectQueue) {
            fn();
          }

          // Empty the `useEffectQueue`
          useEffectQueue = [];
        });
      });

      // Reset indexes after each `render`
      react.resetIndexes();
    },

    /**
     * @method useState
     *
     * @param { any } initialValue
     *
     * @returns [ any, function ]
     */
    useState(initialValue) {
      // Copy the value of `useStateIndex`
      const currentIndex = useStateIndex;

      // Increment `useStateIndex` on each `useState` call
      useStateIndex++;

      // If there is currently no `currentIndex` key in `stateValues`,
      // then add one and assign the `initialValue` passed,
      // `initialValue` might be a function
      if (!(currentIndex in stateValues)) {
        stateValues[currentIndex] =
          typeof initialValue === 'function' ? initialValue() : initialValue;
      }

      // If there is currently no `currentIndex` key in `setStateCache`,
      // then add one and assign the "newVal" or
      // "newVal(stateValues[index])" fn call if "newVal" is a function
      if (!(currentIndex in setStateCache)) {
        setStateCache[currentIndex] = (newVal) => {
          const newValue =
            typeof newVal === 'function'
              ? newVal(stateValues[currentIndex])
              : newVal;

          // Compare `newValue` and the old one
          // and re-assign only if they are different
          if (newValue !== stateValues[currentIndex]) {
            stateValues[currentIndex] = newValue;

            react.addMicrotask(react.render);
          }
        };
      }

      // Return value from `stateValues` and value setter from `setStateCache` by index
      return [stateValues[currentIndex], setStateCache[currentIndex]];
    },

    /**
     * @method useLayoutEffect
     *
     * @param { function } callback
     * @param { array } deps
     *
     * @returns void
     */
    useLayoutEffect(callback, deps) {
      // Copy the value of `useLayoutEffectIndex`
      const currentIndex = useLayoutEffectIndex;

      // Increment `useLayoutEffectIndex` on each `useLayoutEffect` call
      useLayoutEffectIndex++;

      // If `useLayoutEffectDependencies[currentIndex]` is null,
      // it means that `executeCallback` is pushed only once
      // when `deps` array is [] empty
      if (useLayoutEffectDependencies[currentIndex] === null) {
        return;
      }

      const executeCallback = () => {
        // Get the previous `callback` cleanup function
        const prevCallbackCleanup = useLayoutEffectCallbackCache[currentIndex];

        // If `prevCallbackCleanup` is a function, execute it
        if (typeof prevCallbackCleanup === 'function') {
          prevCallbackCleanup();
        }

        // Re-assign the new `callback` cleanup function
        useLayoutEffectCallbackCache[currentIndex] = callback();
      };

      // If `deps` is not an array just add the `executeCallback`
      // and return
      // It's not necessary to go further
      if (!Array.isArray(deps)) {
        useLayoutEffectQueue.push(executeCallback);

        return;
      }

      // If `deps` array is [] empty, then set
      // `useLayoutEffectDependencies[currentIndex]` to null,
      // add the `executeCallback`
      // and return
      // It's not necessary to go further
      if (deps.length === 0) {
        useLayoutEffectDependencies[currentIndex] = null;
        useLayoutEffectQueue.push(executeCallback);

        return;
      }

      // `hasChange` is true only when initially `useLayoutEffectDependencies[currentIndex]` doesn't exist
      // or if there is a `deps` array item change
      const hasChange =
        typeof useLayoutEffectDependencies[currentIndex] === 'undefined' ||
        deps.some(
          (dep, index) =>
            dep !== useLayoutEffectDependencies[currentIndex][index]
        );

      // If `hasChange` is true
      // re-assign `deps` array per index,
      // add the `executeCallback` into the queue
      if (hasChange) {
        useLayoutEffectDependencies[currentIndex] = deps;
        useLayoutEffectQueue.push(executeCallback);
      }
    },

    /**
     * @method useEffect
     *
     * @param { function } callback
     * @param { array } deps
     *
     * @returns void
     */
    useEffect(callback, deps) {
      // Copy the value of `useEffectIndex`
      const currentIndex = useEffectIndex;

      // Increment `useEffectIndex` on each `useEffect` call
      useEffectIndex++;

      // If useEffectDependencies[currentIndex] is null,
      // it means that `executeCallback` is pushed only once
      // when `deps` array is [] empty
      if (useEffectDependencies[currentIndex] === null) {
        return;
      }

      const executeCallback = () => {
        // Get the previous `callback` cleanup function
        const prevCallbackCleanup = useEffectCallbackCache[currentIndex];

        // If `prevCallbackCleanup` is a function, execute it
        if (typeof prevCallbackCleanup === 'function') {
          prevCallbackCleanup();
        }

        // Re-assign the new `callback` cleanup function
        useEffectCallbackCache[currentIndex] = callback();
      };

      // If `deps` is not an array just add the `executeCallback`
      // and return
      // It's not necessary to go further
      if (!Array.isArray(deps)) {
        useEffectQueue.push(executeCallback);

        return;
      }

      // If `deps` array is [] empty, then set
      // `useEffectDependencies[currentIndex]` to null,
      // add the `executeCallback`
      // and return
      // It's not necessary to go further
      if (deps.length === 0) {
        useEffectDependencies[currentIndex] = null;
        useEffectQueue.push(executeCallback);

        return;
      }

      // `hasChange` is true only when initially `useEffectDependencies[currentIndex]` doesn't exist
      // or if there is a `deps` array item change
      const hasChange =
        typeof useEffectDependencies[currentIndex] === 'undefined' ||
        deps.some(
          (dep, index) => dep !== useEffectDependencies[currentIndex][index]
        );

      // If `hasChange` is true
      // re-assign `deps` array per index,
      // add the `executeCallback` into the queue
      if (hasChange) {
        useEffectDependencies[currentIndex] = deps;
        useEffectQueue.push(executeCallback);
      }
    },

    /**
     * @method useCallback
     *
     * @param { function } fn
     * @param { array } deps
     *
     * @returns function
     */
    useCallback(fn, deps) {
      // Copy the value of `useCallbackIndex`
      const currentIndex = useCallbackIndex;

      // Increment `useCallbackIndex` on each `useCallback` call
      useCallbackIndex++;

      // If `deps` is not an array just return the new `fn`
      if (!Array.isArray(deps)) {
        return fn;
      }

      // If `deps` array is [] empty and there is a cached function,
      // then return the cached function
      if (deps.length === 0 && useCallbackFnCache[currentIndex]) {
        return useCallbackFnCache[currentIndex];
      }

      // `hasChange` is true only when initially `useCallbackDependencies[currentIndex]` doesn't exist
      // or if there is a `deps` array item change
      const hasChange =
        typeof useCallbackDependencies[currentIndex] === 'undefined' ||
        deps.some(
          (dep, index) => dep !== useCallbackDependencies[currentIndex][index]
        );

      if (hasChange) {
        // `hasChange` is true
        // re-assign `deps` array per index,
        // re-assign `fn` per index
        useCallbackDependencies[currentIndex] = deps;
        useCallbackFnCache[currentIndex] = fn;

        return fn;
      } else {
        // `hasChange` is false
        // return the cached function
        return useCallbackFnCache[currentIndex];
      }
    }
  };

  return react;
};
