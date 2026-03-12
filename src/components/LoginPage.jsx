import { useState } from "react";
import "../styles/LoginPage.css";

export default function LoginPage({ onLogin, loginState }) {
  const [ formData, setFormData ] = useState({
    username: "",
    password: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (loginState.loading) {
      return;
    }

    onLogin(formData);
  }

  return (
    <section className="login-page">
      <form className="login-page__card" onSubmit={handleSubmit}>
        <div className="login-page__header">
          <p className="login-page__eyebrow">kmPianka</p>
          <h1>Logowanie</h1>
          <p>Zaloguj się, aby przejść do wyszukiwarki modeli.</p>
        </div>

        <label className="login-page__field">
          <span>Login</span>
          <input
            autoComplete="username"
            name="username"
            onChange={handleChange}
            type="text"
            value={formData.username}
          />
        </label>

        <label className="login-page__field">
          <span>Hasło</span>
          <input
            autoComplete="current-password"
            name="password"
            onChange={handleChange}
            type="password"
            value={formData.password}
          />
        </label>

        {loginState.error && (
          <p className="login-page__message login-page__message--error">
            {loginState.error}
          </p>
        )}

        <button className="login-page__submit" disabled={loginState.loading} type="submit">
          {loginState.loading ? "Logowanie..." : "Zaloguj"}
        </button>
      </form>
    </section>
  );
}
