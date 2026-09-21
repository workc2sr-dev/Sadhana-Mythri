// Top navigation bar with links and a client login button
export default function Header({ onDashboard }) {
  return (
    <header>
      <a className="logo" href="#top">
        <strong>SADHANA MYTHRI</strong>
      </a>
      <nav>
        <a href="#solutions">
          <strong>Solutions</strong>
        </a>
        <a href="#plans">
          <strong>Plans</strong>
        </a>
        <a href="#contact">
          <strong>Contact</strong>
        </a>
      </nav>
      <button className="outline-button" onClick={onDashboard}>
        Client login
      </button>
    </header>
  );
}
