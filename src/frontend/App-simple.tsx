
function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3em', marginBottom: '0.5em' }}>🎉 COMEYA! - React Funcionando</h1>
      <p style={{ fontSize: '1.2em', marginBottom: '1.5em' }}>
        ¡El frontend React está funcionando correctamente!
      </p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '2em',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        maxWidth: '600px',
        width: '90%'
      }}>
        <h2 style={{ fontSize: '1.8em', marginBottom: '1em' }}>✅ Estado del Sistema:</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '0.8em', fontSize: '1.1em' }}>
            ✅ Frontend React: <span style={{ fontWeight: 'bold' }}>Funcionando</span>
          </li>
          <li style={{ marginBottom: '0.8em', fontSize: '1.1em' }}>
            ✅ Backend API: <span style={{ fontWeight: 'bold' }}>Funcionando</span>
          </li>
          <li style={{ marginBottom: '0.8em', fontSize: '1.1em' }}>
            ✅ Base de Datos: <span style={{ fontWeight: 'bold' }}>Conectada</span>
          </li>
        </ul>
        <button style={{
          marginTop: '2em',
          padding: '1em 2em',
          fontSize: '1.2em',
          fontWeight: 'bold',
          color: '#ff6b6b',
          background: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
        onClick={() => alert('¡React está funcionando perfectamente!')}
        >
          🚀 Probar React
        </button>
      </div>
      <footer style={{ marginTop: '3em', fontSize: '0.9em', opacity: 0.8 }}>
        &copy; 2025 COMEYA! Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App;