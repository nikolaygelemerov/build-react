export const blocker = (time = 200) => {
  const now = Date.now();

  while (Date.now() < now + time) {}
};

export const idGenerator = () =>
  '_' + Math.random().toString(36).substring(2, 9);
