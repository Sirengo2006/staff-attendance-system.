
import React, { useState } from 'react';

export default function App() {
  const [staff, setStaff] = useState('');
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [overtime, setOvertime] = useState('');
  const [message, setMessage] = useState('');
  const [complaint, setComplaint] = useState('');
  const [records, setRecords] = useState([]);

  const [time, setTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const staffList = [
    'Select Staff',
    'Staff Member 1',
    'Staff Member 2',
    'Staff Member 3',
    'Staff Member 4'
  ];

  function attendance(type) {
    if (!staff) {
      setMessage('Please select your name.');
      return;
    }

    if (type === 'IN' && time.getHours() * 60 + time.getMinutes() >= 520 && !reason.trim()) {
      setMessage('Please provide a reason for lateness.');
      return;
    }

    if (type === 'OUT' && time.getHours() * 60 + time.getMinutes() < 1020) {
      if (!reason.trim() || !overtime.trim()) {
        setMessage('Early checkout requires a reason and overtime reason.');
        return;
      }
    }

    const record = {
      staff,
      type,
      date: time.toLocaleDateString(),
      time: time.toLocaleTimeString(),
      reason,
      overtime
    };

    setRecords([...records, record]);
    setAction(type);
    setMessage(`${staff} successfully signed ${type === 'IN' ? 'in' : 'out'}.`);
    setReason('');
    setOvertime('');
  }

  return (
    <main className="app">
      <header className="header">
        <div className="logo">SA</div>
        <div>
          <h1>Staff Attendance Desk</h1>
          <p>Central Staff Reporting System</p>
        </div>
      </header>

      <section className="clock">
        <h2>{time.toLocaleTimeString()}</h2>
        <p>{time.toDateString()}</p>
      </section>

      <section className="panel">
        <h2>Staff Attendance</h2>
        <p>Select your name to continue</p>

        <select value={staff} onChange={e => {
          setStaff(e.target.value);
          setMessage('');
        }}>
          <option value="">Choose your name</option>
          {staffList.slice(1).map(name => (
            <option key={name}>{name}</option>
          ))}
        </select>

        <textarea
          placeholder="Reason for lateness or early checkout (if required)"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />

        <textarea
          placeholder="Explain overtime arrangement (required for early checkout)"
          value={overtime}
          onChange={e => setOvertime(e.target.value)}
        />

        <div className="buttons">
          <button className="sign-in" onClick={() => attendance('IN')}>
            Sign In
          </button>
          <button className="sign-out" onClick={() => attendance('OUT')}>
            Sign Out
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="panel">
        <h2>Staff Complaints</h2>
        <textarea
          placeholder="Write your complaint here..."
          value={complaint}
          onChange={e => setComplaint(e.target.value)}
        />
        <button onClick={() => {
          if (!staff || !complaint.trim()) {
            setMessage('Select your name and write your complaint.');
            return;
          }
          setMessage('Complaint recorded in this demo. Backend connection is next.');
          setComplaint('');
        }}>
          Submit Complaint
        </button>
      </section>

      <section className="panel">
        <h2>Today's Activity</h2>
        {records.length === 0 ? (
          <p>No attendance activity yet.</p>
        ) : records.map((r, i) => (
          <p key={i}>
            {r.staff} — {r.type} — {r.time}
          </p>
        ))}
      </section>

      <footer>Staff Attendance Management System</footer>
    </main>
  );
                }
          
