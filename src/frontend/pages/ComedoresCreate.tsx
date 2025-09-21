import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComedorForm from '../ComedorForm';
import './ComedoresCreate.css';

const ComedoresCreate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="comedores-create-container">
      <header className="comedores-create-header">
        <h1>Crear Nuevo Comedor</h1>
        <button 
          onClick={() => navigate('/comedores')}
          className="btn-secondary"
        >
          ← Volver a Lista
        </button>
      </header>

      <div className="comedores-create-content">
        <div className="form-container">
          <ComedorForm />
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Registrando comedor...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComedoresCreate;

