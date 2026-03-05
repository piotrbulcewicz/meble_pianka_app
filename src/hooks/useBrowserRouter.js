import { useEffect, useState } from "react";

export default function useBrowserRouter() {
  const [ pathname, setPathname ] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigate(nextPathname) {
    if (nextPathname === window.location.pathname) {
      return;
    }

    window.history.pushState({}, "", nextPathname);
    setPathname(nextPathname);
  }

  return {
    pathname,
    navigate
  };
}
