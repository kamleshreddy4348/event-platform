import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} Eventry</span>
      <span className="app-footer__divider">·</span>
      <span>Event Management Platform</span>
    </footer>
  );
}
