import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export function AccountForm({ register, setUser }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const input = Object.fromEntries(new FormData(event.currentTarget));
      const result = await api(register ? 'register' : 'login', input);
      setUser(result.userName);
      navigate('/dealers');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return <main className="page form-page">
    <h1>{register ? 'Create an account' : 'Log in'}</h1>
    <form onSubmit={submit}>
      {register && <>
        <label>First name<input name="firstName" autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
        <label>Email<input type="email" name="email" autoComplete="email" required /></label>
      </>}
      <label>Username<input name="userName" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required /></label>
      {register && <label>Confirm password<input type="password" name="confirmation" autoComplete="new-password" required /></label>}
      {error && <p role="alert">{error}</p>}
      <button disabled={saving}>{register ? 'Register' : 'Log in'}</button>
      {!register && <Link to="/register">Create an account</Link>}
    </form>
  </main>;
}

export default function Register({ setUser }) {
  return <AccountForm register setUser={setUser} />;
}
