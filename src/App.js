import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2> You have successfully testing Jenkins </h2>
        <h3> Updated</h3>
        <a
          className="App-link"
          href="https://example.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Jenkins on Udemy
        </a>
      </header>
      <p>
          Application version: 1
      </p>
    </div>
  );
}

export default App;
