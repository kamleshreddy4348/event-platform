import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './Layout.css';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__body">
        <Header />
        <main className="app-shell__main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
