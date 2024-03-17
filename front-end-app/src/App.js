import { useState, useEffect } from "react";
import "./App.css";
import DisplayTable from "./components/DisplayTable";

function App() {
  const [data, setData] = useState([]);
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/healthshare/alldata",
          {
            mode: "cors",
          }
        );

        const result = await response.json();
        console.log(result);
        setData(result);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchData();
  }, [data]);

  return (
    <div className=" m-5 mb-5">
      <div className="input-group p-2 mb-5">
        <input
          type="search"
          className="form-control rounded"
          placeholder="Please enter your query"
          aria-label="Search"
          aria-describedby="search-addon"
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          data-mdb-ripple-init
        >
          search
        </button>
      </div>
      <div>
        <DisplayTable data={data} />
      </div>
    </div>
  );
}

export default App;
