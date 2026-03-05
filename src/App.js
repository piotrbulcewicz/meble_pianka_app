import axios from "axios";
import Search from "./components/Search";
import ResultsPage from "./components/ResultsPage";
import { useState, useEffect } from "react";
import useBrowserRouter from "./hooks/useBrowserRouter";

function App() {
  const { pathname, navigate } = useBrowserRouter();
  const [ loading, setLoading ] = useState(false);
  const [ modelCatalog, setModelCatalog ] = useState(null);
  const [ serverResults, setServerResults ] = useState(() => {
    const savedResults = sessionStorage.getItem("serverResults");

    if (!savedResults) {
      return null;
    }

    try {
      return JSON.parse(savedResults);
    } catch (error) {
      console.log(error);
      return null;
    }
  });
  const [ submitState, setSubmitState ] = useState({
    loading: false,
    error: "",
    success: ""
  });

  useEffect(() => {
    setLoading(true);

    async function getData() {
      try {
        await axios.get("http://localhost:3001/api/get-model")
          .then((res) => {
            setModelCatalog(res.data);
            setLoading(false);
          });
      } catch(error) {
        console.log(error);
        setLoading(false);
      }
    }

    getData();
  }, []);

  async function handleSubmit(records) {
    setSubmitState({
      loading: true,
      error: "",
      success: ""
    });

    try {
      const response = await axios.post("http://localhost:3001/api/models", { records });
      setServerResults(response.data);
      sessionStorage.setItem("serverResults", JSON.stringify(response.data));
      setSubmitState({
        loading: false,
        error: "",
        success: "Dane zostały wysłane na serwer."
      });
      navigate("/wyniki");
    } catch (error) {
      console.log(error);
      setSubmitState({
        loading: false,
        error: "Nie udało się wysłać danych na serwer.",
        success: ""
      });
    }
  }

  return (
    <div className="App">
      {pathname === "/" && loading && <p>Ładowanie modeli...</p>}
      {pathname === "/" && modelCatalog && (
        <Search
          modelCatalog={modelCatalog}
          onSubmit={handleSubmit}
          submitState={submitState}
        />
      )}
      {pathname === "/wyniki" && (
        <ResultsPage
          results={serverResults}
          onBack={() => navigate("/")}
        />
      )}
    </div>
  );
}

export default App;
