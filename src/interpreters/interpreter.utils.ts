export const isObserverObject = (obj: any) => {
  const checkNext = 'next' in obj;
  const checkError = 'error' in obj;
  const checkComplete = 'complete' in obj;

  return checkNext && checkError && checkComplete;
};
