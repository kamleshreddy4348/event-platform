import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard__eyebrow">Week 1 · Day 1</div>
      <h1 className="dashboard__title">Welcome back, admin.</h1>
      <p className="dashboard__subtitle">
        This is the application shell — header, sidebar, and footer are wired up.
        Event creation, RSVPs, and guest lists come online over the next two weeks.
      </p>

      <div className="dashboard__cards">
        <div className="dashboard__card">
          <div className="dashboard__card-label">Upcoming events</div>
          <div className="dashboard__card-value">—</div>
          <div className="dashboard__card-note">Backend not yet connected</div>
        </div>
        <div className="dashboard__card">
          <div className="dashboard__card-label">Registered guests</div>
          <div className="dashboard__card-value">—</div>
          <div className="dashboard__card-note">Backend not yet connected</div>
        </div>
        <div className="dashboard__card">
          <div className="dashboard__card-label">Reminders sent</div>
          <div className="dashboard__card-value">—</div>
          <div className="dashboard__card-note">Backend not yet connected</div>
        </div>
      </div>
    </div>
  );
}
