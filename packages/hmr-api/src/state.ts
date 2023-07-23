let timer: number | null;

if (import.meta.hot) {
  // initial count
  if (import.meta.hot.data) {
    import.meta.hot.data.count = 0;
  }

  import.meta.hot.dispose(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
}

export function initState() {
  const getAndIncCount = () => {
    const data = import.meta.hot?.data || { count: 0 };
    data.count = data.count + 1;
    return data.count;
  };

  timer = setInterval(() => {
    const countEle = document.getElementById('count');
    countEle!.innerText = getAndIncCount() + '';
  }, 1000);
}
