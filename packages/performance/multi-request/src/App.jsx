const modules = import.meta.globEager('./components/*');

console.log(modules);

function App() {
  return (
    <>
      {Object.values(modules).map(({ default: Comp }, index) => (
        <Comp key={index} />
      ))}
    </>
  );
}

export default App;
