import { Link } from 'react-router-dom';

export default function Dynamic() {
  return (
    <div className="container">
      这是动态 import 的组件
      <br />
      <Link to="/">返回</Link>
    </div>
  );
}
