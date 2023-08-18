import logo from './assets/react.svg';
import { Helmet } from 'react-helmet';

export interface AppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

function App({ data }: AppProps) {
  return (
    <>
      <Helmet>
        <title>{data.user}的页面</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <img src={logo} className="App-logo" alt="logo" />
      <h1>hello</h1>
    </>
  );
}

export default App;
