const blocker = (time = 200) => {
  const now = Date.now();

  while (Date.now() < now + time) {}
};

const MyReact = (Component) => {
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

  let hasQueuedMicrotask = false;
  let latestMicrotask;

  /* Microtask queue END */

  const react = {
    /**
     * @method addMicrotask
     *
     * @param { function } microtaskFn
     *
     * @returns void
     */
    addMicrotask: (microtaskFn) => {
      latestMicrotask = microtaskFn;

      if (!hasQueuedMicrotask) {
        hasQueuedMicrotask = true;

        queueMicrotask(() => {
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
      // Calls "render" initially
      react.render();
    },

    /**
     * @method render
     *
     * @returns void
     */
    render() {
      const result = Component(react);

      document.querySelector('#root').innerHTML = result;

      requestAnimationFrame(() => {
        for (let fn of useLayoutEffectQueue) {
          fn();
        }

        useLayoutEffectQueue = [];

        requestAnimationFrame(() => {
          for (let fn of useEffectQueue) {
            fn();
          }

          useEffectQueue = [];
        });
      });

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
      // Set "index" as the current "useStateIndex"
      const currentIndex = useStateIndex;

      // If there is currently no "index" key in "stateValues",
      // then add one and assign the "initialValue" passed
      if (!(currentIndex in stateValues)) {
        stateValues[currentIndex] =
          typeof initialValue === 'function' ? initialValue() : initialValue;
      }

      // If there is currently no "index" key in "setStateCache",
      // then add one and assign the "newVal" or
      // "newVal(stateValues[index])" fn call if "newVal" is a function,
      // assigned to "stateValues[index]"
      if (!(currentIndex in setStateCache)) {
        setStateCache[currentIndex] = (newVal) => {
          const newValue =
            typeof newVal === 'function'
              ? newVal(stateValues[currentIndex])
              : newVal;

          if (newValue !== stateValues[currentIndex]) {
            stateValues[currentIndex] = newValue;

            react.addMicrotask(react.render);
          }
        };
      }

      // Accumulate useStateIndex on each useState call
      useStateIndex++;

      // Return value from "stateValues" and setState from "setStateCache" by index
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
      const currentIndex = useLayoutEffectIndex;
      useLayoutEffectIndex++;

      // If useLayoutEffectDependencies[currentIndex] is null,
      // that means that the executeCallback is pushed only once
      // when deps array is [] empty
      if (useLayoutEffectDependencies[currentIndex] === null) {
        return;
      }

      const executeCallback = () => {
        let callbackResult = null;

        callbackResult = useLayoutEffectCallbackCache[currentIndex];

        if (typeof callbackResult === 'function') {
          callbackResult();
        }

        useLayoutEffectCallbackCache[currentIndex] = callback();
      };

      // If there is no deps array just add the executeCallback
      // and return
      // It's not necessary to go further
      if (!Array.isArray(deps)) {
        useLayoutEffectQueue.push(executeCallback);

        return;
      }

      // Deps array is [] empty,
      // so set the useLayoutEffectDependencies[currentIndex] to null
      if (deps.length === 0) {
        useLayoutEffectDependencies[currentIndex] = null;
        useLayoutEffectQueue.push(executeCallback);

        return;
      }

      // hasChange is true only when initially useLayoutEffectDependencies[currentIndex] doesn't exist
      // or if there is a deps array item change
      const hasChange =
        typeof useLayoutEffectDependencies[currentIndex] === 'undefined' ||
        deps.some(
          (dep, index) =>
            dep !== useLayoutEffectDependencies[currentIndex][index]
        );

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

      // If useEffectDependencies[currentIndex] is null,
      // that means that the executeCallback is pushed only once
      // when deps array is [] empty
      if (useEffectDependencies[currentIndex] === null) {
        return;
      }

      const executeCallback = () => {
        let callbackResult = null;

        callbackResult = useEffectCallbackCache[currentIndex];

        if (typeof callbackResult === 'function') {
          callbackResult();
        }

        useEffectCallbackCache[currentIndex] = callback();
      };

      // If there is no deps array just add the executeCallback
      // and return
      // It's not necessary to go further
      if (!Array.isArray(deps)) {
        useEffectQueue.push(executeCallback);

        return;
      }

      // Deps array is [] empty,
      // so set the useEffectDependencies[currentIndex] to null
      if (deps.length === 0) {
        useEffectDependencies[currentIndex] = null;
        useEffectQueue.push(executeCallback);

        return;
      }

      // hasChange is true only when initially useEffectDependencies[currentIndex] doesn't exist
      // or if there is a deps array item change
      const hasChange =
        typeof useEffectDependencies[currentIndex] === 'undefined' ||
        deps.some(
          (dep, index) => dep !== useEffectDependencies[currentIndex][index]
        );

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
      const currentIndex = useCallbackIndex;
      useCallbackIndex++;

      if (!Array.isArray(deps)) {
        return fn;
      }

      if (deps.length === 0 && useCallbackFnCache[currentIndex]) {
        return useCallbackFnCache[currentIndex];
      }

      const hasChange =
        typeof useCallbackDependencies[currentIndex] === 'undefined' ||
        deps.some(
          (dep, index) => dep !== useCallbackDependencies[currentIndex][index]
        );

      if (hasChange) {
        useCallbackDependencies[currentIndex] = deps;
        useCallbackFnCache[currentIndex] = fn;

        return fn;
      } else {
        return useCallbackFnCache[currentIndex];
      }
    }
  };

  return react;
};

// Example
const Counter = ({ useCallback, useEffect, useLayoutEffect, useState }) => {
  const [countOne, setCountOne] = useState(() => 10);
  const [countTwo, setCountTwo] = useState(0);
  const [color, setColor] = useState('green');

  const onButtonOneClick = useCallback(() => {
    setCountOne((prevState) =>
      countTwo !== 0 ? prevState + countTwo : prevState + 1
    );
  }, [countTwo]);

  const onButtonTwoClick = useCallback(() => {
    setCountTwo((prevState) => prevState + 1);
    setCountTwo((prevState) => prevState + 1);
  }, []);

  const onButtonToggleClick = useCallback(() => {
    setColor('red');
  }, []);

  // Add event listeners
  useEffect(() => {
    const buttonOne = document.querySelector('#button-one');
    const newButtonOne = buttonOne.cloneNode(true);
    buttonOne.parentNode.replaceChild(newButtonOne, buttonOne);
    newButtonOne.addEventListener('click', onButtonOneClick);

    const buttonTwo = document.querySelector('#button-two');
    const newButtonTwo = buttonTwo.cloneNode(true);
    buttonTwo.parentNode.replaceChild(newButtonTwo, buttonTwo);
    newButtonTwo.addEventListener('click', onButtonTwoClick);

    const buttonToggle = document.querySelector('#button-toggle');
    const newButtonToggle = buttonToggle.cloneNode(true);
    buttonToggle.parentNode.replaceChild(newButtonToggle, buttonToggle);
    newButtonToggle.addEventListener('click', onButtonToggleClick);
  });

  useEffect(() => {
    blocker(100);

    // console.log(
    //   'bg-color: ',
    //   document.querySelector('.box')?.style?.backgroundColor
    // );

    setColor('orange');
  }, [color]);

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

  console.log('RENDER color: ', color);

  return `
    <button id="button-one" type="button">Update Count One ${countOne}</button>
    <button id="button-two" type="button">Update Count Two ${countTwo}</button>
    <button id="button-toggle" type="button">Toggle Box bg-color</button>
    <div class="box" style="background-color: ${color}"></div>
  `;
};

MyReact(Counter).init();
