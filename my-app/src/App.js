import './App.css';

function App() {
  return (
    <div className="container m-5">
    <div className="input-group p-2">
      <input type="search" className="form-control rounded" placeholder="Please enter your query" aria-label="Search" aria-describedby="search-addon" />
      <button type="button" className="btn btn-outline-primary" data-mdb-ripple-init>search</button>
    </div>
    <div>
      {/* Div for visualization */}
    </div>
    </div>
  );
}

export default App;
