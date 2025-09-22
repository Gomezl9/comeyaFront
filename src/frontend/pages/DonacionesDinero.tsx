import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './DonacionesDinero.css';

interface Comedor {
  id: number;
  nombre: string;
  direccion: string;
  capacidad: number;
}

const DonacionesDinero: React.FC = () => {
  const navigate = useNavigate();
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [monto, setMonto] = useState('');
  const [comedorId, setComedorId] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchComedores = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/comedores');
        const data = await response.json();
        if (Array.isArray(data)) {
          setComedores(data);
        } else if (data.success && Array.isArray(data.data)) {
          setComedores(data.data);
        } else {
          setComedores([]);
        }
      } catch (error) {
        console.error('Error al cargar comedores:', error);
        setComedores([]);
      }
    };

    fetchComedores();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!monto.trim()) newErrors.monto = 'El monto es requerido';
    if (parseFloat(monto) <= 0) newErrors.monto = 'El monto debe ser mayor a 0';
    if (!comedorId) newErrors.comedor = 'Debe seleccionar un comedor';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Obtener usuario logueado
      const userStr = localStorage.getItem('user');
      let usuario_id = undefined;
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj && typeof userObj.id === 'number') usuario_id = userObj.id;
        } catch {}
      }
      if (!usuario_id) {
        alert('No hay usuario logueado. Por favor inicia sesión.');
        return;
      }

      const data = {
        usuario_id,
        comedor_id: parseInt(comedorId),
        monto: parseFloat(monto),
        fecha: new Date().toISOString().split('T')[0]
      };

  const response = await fetch('http://localhost:3000/api/donacionesdinero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        alert('Error: El servidor respondió con un formato inesperado o HTML. Verifica la URL y que el backend esté corriendo correctamente.');
        return;
      }

      if (response.ok) {
        alert('¡Donación de dinero registrada exitosamente! 🎉');
        setMonto('');
        setComedorId('');
        setErrors({});
        navigate('/Donaciones');
      } else {
        alert(result?.message || 'Error al registrar donación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  return (
    <Layout>
      <div className="donaciones-dinero-container">
        <div className="form-header">
          <button 
            className="back-button"
            onClick={() => navigate('/Donaciones')}
          >
            ← Volver
          </button>
          <h1>Donar Dinero</h1>
          <p>Apoya económicamente a los comedores comunitarios</p>
        </div>

        <div className="form-section">
          <form onSubmit={handleSubmit} className="donacion-form">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="monto">💵 Monto (S/)</label>
                <input
                  type="number"
                  id="monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className={errors.monto ? 'error' : ''}
                  placeholder="Ej: 50"
                  min="1"
                  step="0.01"
                  required
                />
                {errors.monto && <span className="error-message">{errors.monto}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="fecha">Fecha de Donación</label>
                <input
                  type="date"
                  id="fecha"
                  value={new Date().toISOString().split('T')[0]}
                  readOnly
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="comedor">Comedor Destinatario</label>
                <select
                  id="comedor"
                  value={comedorId}
                  onChange={(e) => setComedorId(e.target.value)}
                  className={errors.comedor ? 'error' : ''}
                  required
                >
                  <option value="">Selecciona un comedor</option>
                  {comedores.map(comedor => (
                    <option key={comedor.id} value={comedor.id}>
                      {comedor.nombre} - {comedor.direccion} (Cap: {comedor.capacidad})
                    </option>
                  ))}
                </select>
                {errors.comedor && <span className="error-message">{errors.comedor}</span>}
              </div>
            </div>
            <button 
              type="submit" 
              className="submit-button"
            >
              💰 Registrar Donación de Dinero
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DonacionesDinero;
