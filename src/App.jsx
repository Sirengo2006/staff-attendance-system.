
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function App() {
  const [status, setStatus] = useState('Testing connection...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          setStatus('Supabase error: ' + error.message);
        } else {
          setStatus('React is working. Supabase connection is responding!');
        }
      } catch (error) {
        setStatus('Error: ' + error.message);
      }
    }

    testConnection();
  }, []);

  return (
    <main style={{
      padding: '30px',
      fontFamily: 'Arial',
      textAlign: 'center'
    }}>
      <h1>Staff Attendance System</h1>
      <p>{status}</p>
    </main>
  );
}
