import React from "react";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Risk Manager</h1>
        <p>Real-time transaction risk scoring</p>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;
