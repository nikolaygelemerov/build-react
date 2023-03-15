const blocker = () => {
  const now = Date.now();

  while (Date.now() < now + 3000) {}
};

const MyReact = (Component) => {
  // Store state values by index
  let stateValues = {};

  // Store setState fn by index
  let setStateCache = {};

  let setStateRAFids = {};

  // Initial useState index
  let useStateIndex = 0;

  // Initial useLayoutEffect index
  let useLayoutEffectIndex = 0;

  // Initial useEffect index
  let useEffectIndex = 0;

  // Initial useCallback index
  let useCallbackIndex = 0;

  // Store useLayoutEffect deps by index
  let useLayoutEffectDependencies = {};

  // Store useLayoutEffectCallback fn by index
  let useLayoutEffectCallbackCache = {};

  // Store useEffect deps by index
  let useEffectDependencies = {};

  // Store useEffectCallback fn by index
  let useEffectCallbackCache = {};

  // Store useCallback deps by index
  let useCallbackDependencies = {};

  // Store useCallback fn by index
  let useCallbackFnCache = {};

  let useEffectQueue = [];

  let useLayoutEffectQueue = [];

  const react = {
    /**
     * @method resetIndexes
     *
     */
    resetIndexes() {
      useStateIndex = 0;
      useLayoutEffectIndex = 0;
      useEffectIndex = 0;
      useCallbackIndex = 0;
      useEffectQueue = [];
      useLayoutEffectQueue = [];
    },

    /**
     * @method init
     *
     * @returns void
     */
    init() {
      // Calls "render" initially
      this.render(true);
    },

    /**
     * @method render
     *
     * @returns void
     */
    render(isInit) {
      const result = Component(react);

      if (useLayoutEffectQueue.length === 0) {
        document.querySelector('#root').innerHTML = result;

        if (isInit) {
          requestAnimationFrame(() => {
            for (let fn of useEffectQueue) {
              fn();
            }
          });
        } else {
          for (let fn of useEffectQueue) {
            fn();
          }
        }
      } else {
        if (isInit) {
          requestAnimationFrame(() => {
            for (let fn of useLayoutEffectQueue) {
              fn();
            }
          });
        } else {
          for (let fn of useLayoutEffectQueue) {
            fn();
          }
        }
      }

      if (isInit) {
        // Reset indexes on each render
        requestAnimationFrame(() => {
          this.resetIndexes();
        });
      } else {
        this.resetIndexes();
      }
    },

    /**
     * @method useState
     *
     * @param { any } initialValue
     *
     * @returns [any, function]
     */
    useState(initialValue) {
      // Set "index" as the current "useStateIndex"
      const index = useStateIndex;

      // If there is currently no "index" key in "stateValues",
      // then add one and assign the "initialValue" passed
      if (!(index in stateValues)) {
        stateValues[index] =
          typeof initialValue === 'function' ? initialValue() : initialValue;
      }

      // If there is currently no "index" key in "setStateCache",
      // then add one and assign the "newVal" or
      // "newVal(stateValues[index])" fn call if "newVal" is a function,
      // executed with "stateValues[index]" value
      if (!(index in setStateCache)) {
        setStateCache[index] = (newVal) => {
          if (typeof newVal === 'function') {
            stateValues[index] = newVal(stateValues[index]);
          } else {
            stateValues[index] = newVal;
          }

          // Trigger "render" inside and RAF callback to validate that
          // a new "render" will be called on the next RAF callback.
          // Cancel prev RAFid callback if it is not already executed
          // in case multiple setStates are called in the same callStack running script.
          // TODO implement "cancelAnimationFrame" on component unmount.
          // That groups multiple "setState" calls in a running task
          setStateRAFids[index] && cancelAnimationFrame(setStateRAFids[index]);
          setStateRAFids[index] = requestAnimationFrame(() => {
            react.render();
          });
        };
      }

      // Accumulate useStateIndex on each useState call
      useStateIndex++;

      // Return value from "stateValues" and setState from "setStateCache" by index
      return [stateValues[index], setStateCache[index]];
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
      const currentIndex = useLayoutEffectIndex;
      useLayoutEffectIndex++;

      const executeCallback = () => {
        let callbackResult = null;

        callbackResult = useLayoutEffectCallbackCache[currentIndex];

        if (typeof callbackResult === 'function') {
          callbackResult();
        }

        useLayoutEffectCallbackCache[currentIndex] = callback();
      };

      if (!Array.isArray(deps)) {
        useEffectDependencies[currentIndex] = null;
        useLayoutEffectQueue.push(executeCallback);

        return;
      }

      if (useLayoutEffectDependencies[currentIndex] === null) {
        return;
      }

      if (!Array.isArray(deps) || deps.length === 0) {
        useLayoutEffectDependencies[currentIndex] = null;
        useLayoutEffectQueue.push(executeCallback);

        return;
      }

      const hasChange =
        typeof useLayoutEffectDependencies[currentIndex] === 'undefined' ||
        (Array.isArray(useLayoutEffectDependencies[currentIndex])
          ? deps.some(
              (dep, useLayoutEffectIndex) =>
                dep !==
                useLayoutEffectDependencies[currentIndex][useLayoutEffectIndex]
            )
          : false);

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
      const currentIndex = useEffectIndex;
      useEffectIndex++;

      const executeCallback = () => {
        let callbackResult = null;

        callbackResult = useEffectCallbackCache[currentIndex];

        if (typeof callbackResult === 'function') {
          callbackResult();
        }

        useEffectCallbackCache[currentIndex] = callback();
      };

      if (!Array.isArray(deps)) {
        useEffectDependencies[currentIndex] = null;
        useEffectQueue.push(executeCallback);

        return;
      }

      if (useEffectDependencies[currentIndex] === null) {
        return;
      }

      if (Array.isArray(deps) && deps.length === 0) {
        useEffectDependencies[currentIndex] = null;
        useEffectQueue.push(executeCallback);

        return;
      }

      const hasChange =
        typeof useEffectDependencies[currentIndex] === 'undefined' ||
        (Array.isArray(useEffectDependencies[currentIndex])
          ? deps.some(
              (dep, useEffectIndex) =>
                dep !== useEffectDependencies[currentIndex][useEffectIndex]
            )
          : false);

      if (hasChange) {
        useEffectDependencies[currentIndex] = deps;
        useEffectQueue.push(executeCallback);
      }
    },

    /**
     * @method useCallback
     *
     * @param {function} fn
     * @param {array} deps
     *
     * @returns void
     */
    useCallback(fn, deps) {
      const currentIndex = useCallbackIndex;
      useCallbackIndex++;
      const hasChange =
        !Array.isArray(useCallbackDependencies[currentIndex]) ||
        (Array.isArray(deps) &&
          deps.some(
            (dep, index) => dep !== useCallbackDependencies[currentIndex][index]
          ));

      useCallbackDependencies[currentIndex] = deps;

      if (
        Array.isArray(deps) &&
        !hasChange &&
        useCallbackFnCache[currentIndex]
      ) {
        return useCallbackFnCache[currentIndex];
      } else {
        useCallbackFnCache[currentIndex] = fn;

        return fn;
      }
    }
  };

  return react;
};

// Example
const Counter = ({ useCallback, useEffect, useLayoutEffect, useState }) => {
  const [countOne, setCountOne] = useState(() => 44);
  const [countTwo, setCountTwo] = useState(0);
  const [color, setColor] = useState('green');

  const onButtonOneClick = useCallback(() => {
    setCountOne((prevState) => (countTwo !== 0 ? countTwo : prevState + 1));
  }, [countTwo]);

  // Add event listeners
  useEffect(() => {
    document
      .querySelector('#button-one')
      .addEventListener('click', onButtonOneClick);

    document.querySelector('#button-two').addEventListener('click', () => {
      setCountTwo((prevState) => prevState + 1);
    });

    document.querySelector('#button-toggle').addEventListener('click', () => {
      setColor('red');
    });
  });

  useLayoutEffect(() => {
    blocker();
    setColor('orange');
  }, [color]);

  /*
  useLayoutEffect(() => {
    console.log('useLayoutEffect countOne: ', countOne);

    return () => {
      console.log('useLayoutEffect return countOne: ', countOne);
    };
  }, [countOne]);

  useEffect(() => {
    console.log('useEffect countOne: ', countOne);

    return () => {
      console.log('useEffect return countOne: ', countOne);
    };
  }, [countOne]);
  */

  console.log('RENDER color: ', color);

  return `
    <button id="button-one" type="button">Update Count One ${countOne}</button>
    <button id="button-two" type="button">Update Count Two ${countTwo}</button>
    <button id="button-toggle" type="button">Toggle Green</button>
    <div class="box" style="background-color: ${color}"></div>
  `;
};

MyReact(Counter).init();
