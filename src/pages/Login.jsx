import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Login({ user }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try { await signInWithEmailAndPassword(auth, email, pw); }
    catch (x) {
      const bad = ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email"];
      setErr(bad.includes(x.code) ? "Wrong email or password." : "Login failed: " + (x.code || x.message));
    }
    setBusy(false);
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={go}>
        <div className="brand dark">Taana Baana<small>Admin</small></div>
        <h2>Sign in</h2>
        {user && <div className="msg bad">This account is not the admin. <button type="button" className="link" onClick={() => signOut(auth)}>Log out</button></div>}
        {err && <div className="msg bad">{err}</div>}
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
