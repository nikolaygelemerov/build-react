const blocker = () => {
  const now = Date.now();

  while (Date.now() < now + 3000) {}
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

  let useLayoutEffectQueue = [];
  /* useLayoutEffect END */

  /* useEffect START */
  // Initial useEffect index
  let useEffectIndex = 0;

  // Store useEffect deps by index
  let useEffectDependencies = {};

  // Store useEffectCallback fn by index
  let useEffectCallbackCache = {};

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
    },

    /**
     * @method init
     *
     * @returns void
     */
    init() {
      // Calls "render" initially
      this.render();
    },

    /**
     * @method render
     *
     * @returns void
     */
    render() {
      const result = Component(react);

      (function executeRender(isLayout) {
        if (useLayoutEffectQueue.length === 0) {
          if (isLayout) {
            document.querySelector('#root').innerHTML = result;

            for (let fn of useEffectQueue) {
              fn();
            }

            useEffectQueue = [];
          } else {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                document.querySelector('#root').innerHTML = result;

                for (let fn of useEffectQueue) {
                  fn();
                }

                useEffectQueue = [];
              });
            });
          }
        } else {
          for (let fn of useLayoutEffectQueue) {
            fn();
          }

          useLayoutEffectQueue = [];

          if (useEffectQueue.length) {
            executeRender(true);
          }
        }
      })();

      react.resetIndexes();
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

          queueMicrotask(() => {
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
          (dep, useEffectIndex) =>
            dep !== useLayoutEffectDependencies[currentIndex][useEffectIndex]
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
          (dep, useEffectIndex) =>
            dep !== useEffectDependencies[currentIndex][useEffectIndex]
        );

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
    setCountOne((prevState) =>
      countTwo !== 0 ? prevState + countTwo : prevState + 1
    );
  }, [countTwo]);

  const onButtonTwoClick = useCallback(async () => {
    console.log('1 countTwo: ', countTwo);
    await setCountTwo((prevState) => prevState + 1);

    console.log('2 countTwo: ', countTwo);
    setCountTwo((prevState) => prevState + 1);
  }, []);

  const onButtonToggleClick = useCallback(() => {
    setColor('red');
  }, []);

  // Add event listeners
  useEffect(() => {
    requestAnimationFrame(() => {
      const buttonOne = document.querySelector('#button-one');
      buttonOne.removeEventListener('click', onButtonOneClick);
      buttonOne.addEventListener('click', onButtonOneClick);

      const buttonTwo = document.querySelector('#button-two');
      buttonTwo.removeEventListener('click', onButtonTwoClick);
      buttonTwo.addEventListener('click', onButtonTwoClick);

      const buttonToggle = document.querySelector('#button-toggle');
      buttonToggle.removeEventListener('click', onButtonToggleClick);
      buttonToggle.addEventListener('click', onButtonToggleClick);
    });
  });

  useEffect(() => {
    // blocker();
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

  requestAnimationFrame(() => {
    console.log('RAF');
  });

  return `
    <button id="button-one" type="button">Update Count One ${countOne}</button>
    <button id="button-two" type="button">Update Count Two ${countTwo}</button>
    <button id="button-toggle" type="button">Toggle Box bg-color</button>
    <div class="box" style="background-color: ${color}"></div>
  `;
};

MyReact(Counter).init();
