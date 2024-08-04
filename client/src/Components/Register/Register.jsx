import "./Register.css";

export default function Register() {
  return (
    <div className="register">
      <span className="registerTitle">Register</span>
      <form className="registerForm">
        <label htmlFor="username">Username</label>
        <input
          className="registerInput"
          type="text"
          placeholder="Enter your username..."
          id="uername"
        />

        <label htmlFor="email">Email</label>
        <input
          className="registerInput"
          type="text"
          placeholder="Enter your email..."
          id="email"
        />

        <label htmlFor="password">Password</label>
        <input
          className="registerInput"
          type="password"
          placeholder="Enter your password..."
          id="password"
        />

        <button className="registerButton">Register</button>
      </form>
      <button className="registerLoginButton">Login</button>
    </div>
  )
}
