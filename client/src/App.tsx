function SimpleHome() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', padding: '2rem' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1.5rem' 
        }}>
          The AM Project
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#374151', 
          marginBottom: '2rem' 
        }}>
          Redefining what it means to be a man in the modern world.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button style={{
            backgroundColor: '#d97706',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Get Started
          </button>
          <button style={{
            border: '2px solid #d97706',
            color: '#d97706',
            backgroundColor: 'transparent',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <SimpleHome />;
}