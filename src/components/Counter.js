import { blocker } from '../services/index.js';

// Example
export const Counter = ({
  componentId,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState
}) => {
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
    const buttonOne = document.querySelector(`#button-one-${componentId}`);
    const newButtonOne = buttonOne.cloneNode(true);
    buttonOne.parentNode.replaceChild(newButtonOne, buttonOne);
    newButtonOne.addEventListener('click', onButtonOneClick);

    const buttonTwo = document.querySelector(`#button-two-${componentId}`);
    const newButtonTwo = buttonTwo.cloneNode(true);
    buttonTwo.parentNode.replaceChild(newButtonTwo, buttonTwo);
    newButtonTwo.addEventListener('click', onButtonTwoClick);

    const buttonToggle = document.querySelector(
      `#button-toggle-${componentId}`
    );
    const newButtonToggle = buttonToggle.cloneNode(true);
    buttonToggle.parentNode.replaceChild(newButtonToggle, buttonToggle);
    newButtonToggle.addEventListener('click', onButtonToggleClick);
  });

  useLayoutEffect(() => {
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
    <h1>Component ${componentId}</h1>
    <button id="button-one-${componentId}" type="button">Update Count One ${countOne}</button>
    <button id="button-two-${componentId}" type="button">Update Count Two ${countTwo}</button>
    <button id="button-toggle-${componentId}" type="button">Toggle Box bg-color</button>
    <div class="box" style="background-color: ${color}"></div>
  `;
};
