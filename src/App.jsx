
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import './styles.css';

const ADMIN_EMAIL = 'sirengorodneywafula@gmail.com';

export default function App() {
  const [session, setSession] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      checkAdmin(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        checkAdmin(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkAdmin(currentSession) {
    setChecking(true);
    setAuthorized(false);

    if (!currentSession) {
      setChecking(false);
      return;
    }

    const { data, error } = await supabase
      .from('admin_profiles')
      .select('user_id')
      .eq('user_id', currentSession.user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setAuthorized(true);
      await loadStaff();
    } else {
      setMessage('This account is not authorised as an admin.');
    }

    setChecking(false);
  }

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) setMessage(error.message);
    setBusy(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setAuthorized(false);
    setSession(null);
  }

  async function loadStaff() {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('full_name');

    if (error) setMessage(error.message);
    else setStaff(data || []);
  }

  async function saveStaff(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    setMessage('');

    const values = {
      full_name: name.trim(),
      department: department.trim() || null
    };

    const result = editing
      ? await supabase.from('staff').update(values).eq('id', editing)
      : await supabase.from('staff').insert(values);

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(editing ? 'Staff updated.' : 'Staff added.');
      setName('');
      setDepartment('');
      setEditing(null);
      await loadStaff();
    }

    setBusy(false);
  }

  function startEdit(person) {
    setEditing(person.id);
    setName(person.full_name);
    setDepartment(person.department || '');
  }

  async function toggleActive(person) {
    const { error } = await supabase
      .from('staff')
      .update({ active: !person.active })
      .eq('id', person.id);

    if (error) setMessage(error.message);
    else {
      setMessage(person.active ? 'Staff deactivated.' : 'Staff reactivated.');
      await loadStaff();
    }
  }

  if (checking) return <main className="app"><h2>Checking access...</h2></main>;

  if (!session || !authorized) {
    return (
      <main className="app">
        <section className="panel login">
          <h1>Staff Attendance</h1>
          <p>Administrator Login</p>
          <form onSubmit={login}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button disabled={busy}>
              {busy ? 'Signing in...' : 'Login to Dashboard'}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Staff Attendance Management</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <section className="panel">
        <h2>Staff Management</h2>
        <form onSubmit={saveStaff}>
          <label>Staff full name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter staff name"
            required
          />
          <label>Department</label>
          <input
            value={department}
            onChange={e => setDepartment(e.target.value)}
            placeholder="Enter department"
          />
          <button disabled={busy}>
            {editing ? 'Save Changes' : 'Add Staff'}
          </button>
          {editing && (
            <button type="button" onClick={() => {
              setEditing(null);
              setName('');
              setDepartment('');
            }}>
              Cancel Edit
            </button>
          )}
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="panel">
        <h2>Staff Directory ({staff.length})</h2>
        {staff.map(person => (
          <div className="staff-row" key={person.id}>
            <div>
              <strong>{person.full_name}</strong>
              <p>{person.department || 'No department'}</p>
              <small>{person.active ? 'Active' : 'Inactive'}</small>
            </div>
            <div className="actions">
              <button onClick={() => startEdit(person)}>Edit</button>
              <button onClick={() => toggleActive(person)}>
                {person.active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
