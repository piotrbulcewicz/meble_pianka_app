import axios from "axios";
import Search from "./components/Search";
import ResultsPage from "./components/ResultsPage";
import LoginPage from "./components/LoginPage";
import AdminPage from "./components/AdminPage";
import { useCallback, useEffect, useState } from "react";
import useBrowserRouter from "./hooks/useBrowserRouter";

const API_URL = "http://localhost:3001";

function getStoredAuth() {
  const savedAuth = sessionStorage.getItem("authSession");

  if (!savedAuth) {
    return null;
  }

  try {
    return JSON.parse(savedAuth);
  } catch (error) {
    console.log(error);
    return null;
  }
}

function getAuthConfig(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

function SidebarLink({ active, children, onClick }) {
  return (
    <button
      className={`app-sidebar__link${active ? " app-sidebar__link--active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function App() {
  const { pathname, navigate } = useBrowserRouter();
  const [ authSession, setAuthSession ] = useState(() => getStoredAuth());
  const [ authReady, setAuthReady ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ modelCatalog, setModelCatalog ] = useState(null);
  const [ loginState, setLoginState ] = useState({
    loading: false,
    error: ""
  });
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
  const authToken = authSession?.token ?? "";
  const userRole = authSession?.user?.role ?? null;

  const clearSession = useCallback((nextPathname = "/login") => {
    setAuthSession(null);
    setModelCatalog(null);
    setServerResults(null);
    sessionStorage.removeItem("authSession");
    sessionStorage.removeItem("serverResults");
    navigate(nextPathname);
  }, [ navigate ]);

  const fetchModelCatalog = useCallback(async (token) => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/get-model`,
        getAuthConfig(token)
      );

      setModelCatalog(response.data);
      return response.data;
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        clearSession();
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [ clearSession ]);

  useEffect(() => {
    async function restoreSession() {
      if (!authToken) {
        setAuthReady(true);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/me`,
          getAuthConfig(authToken)
        );

        setAuthSession((currentSession) => ({
          ...currentSession,
          user: response.data.user
        }));
      } catch (error) {
        console.log(error);
        clearSession();
      } finally {
        setAuthReady(true);
      }
    }

    restoreSession();
  }, [ authToken, clearSession ]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!authSession) {
      setModelCatalog(null);

      if (pathname !== "/login") {
        navigate("/login");
      }

      return;
    }

    if (pathname === "/login") {
      navigate("/");
    }

    if (pathname === "/admin" && userRole !== "admin") {
      navigate("/");
    }
  }, [ authReady, authSession, navigate, pathname, userRole ]);

  useEffect(() => {
    if (!authReady || !authToken || modelCatalog) {
      return;
    }

    fetchModelCatalog(authToken).catch(() => {});
  }, [ authReady, authToken, fetchModelCatalog, modelCatalog ]);

  async function handleSubmit(records) {
    setSubmitState({
      loading: true,
      error: "",
      success: ""
    });

    try {
      const response = await axios.post(
        `${API_URL}/api/models`,
        { records },
        getAuthConfig(authSession.token)
      );

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

      if (error.response?.status === 401) {
        clearSession();
      }

      setSubmitState({
        loading: false,
        error: "Nie udało się wysłać danych na serwer.",
        success: ""
      });
    }
  }

  async function handleLogin(credentials) {
    setLoginState({
      loading: true,
      error: ""
    });

    try {
      const response = await axios.post(`${API_URL}/api/login`, credentials);
      setAuthSession(response.data);
      sessionStorage.setItem("authSession", JSON.stringify(response.data));
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoginState({
        loading: false,
        error: error.response?.data?.message ?? "Nie udalo sie zalogowac."
      });
      return;
    }

    setLoginState({
      loading: false,
      error: ""
    });
  }

  async function handleLogout(callApi = true) {
    const token = authSession?.token;

    if (callApi && token) {
      try {
        await axios.post(
          `${API_URL}/api/logout`,
          {},
          getAuthConfig(token)
        );
      } catch (error) {
        console.log(error);
      }
    }

    clearSession();
  }

  if (!authReady) {
    return (
      <div className="App">
        <p>Sprawdzanie sesji...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {authSession && (
        <header className="app-toolbar">
          <div>
            <strong>{authSession.user.displayName}</strong>
            <span className="app-toolbar__meta">
              {authSession.user.username} ({authSession.user.role})
            </span>
          </div>
          <button className="app-toolbar__button" onClick={() => handleLogout()} type="button">
            Wyloguj
          </button>
        </header>
      )}

      {pathname === "/login" && (
        <LoginPage
          loginState={loginState}
          onLogin={handleLogin}
        />
      )}

      {authSession && pathname !== "/login" && (
        <div className="app-shell">
          <aside className="app-sidebar">
            <nav className="app-sidebar__nav" aria-label="Nawigacja">
              <SidebarLink active={pathname === "/"} onClick={() => navigate("/")}>
                Wyszukiwarka
              </SidebarLink>
              <SidebarLink active={pathname === "/wyniki"} onClick={() => navigate("/wyniki")}>
                Wyniki
              </SidebarLink>
              {userRole === "admin" && (
                <SidebarLink active={pathname === "/admin"} onClick={() => navigate("/admin")}>
                  Admin
                </SidebarLink>
              )}
            </nav>
          </aside>

          <main className="app-content">
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
            {pathname === "/admin" && userRole === "admin" && (
              <AdminPage
                authToken={authToken}
                modelCatalog={modelCatalog}
                onCatalogRefresh={() => fetchModelCatalog(authToken)}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
