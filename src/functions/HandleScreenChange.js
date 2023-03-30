const handleScreenChange = (setCurrentScreen) => {
  setCurrentScreen((prevCount) => (prevCount === 2 ? 0 : prevCount + 1));
};

export default handleScreenChange;
