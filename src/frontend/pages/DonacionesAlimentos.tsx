import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './DonacionesAlimentos.css';

interface Comedor {
  id: number;
  nombre: string;
}

const DonacionesAlimentos: React.FC = () => {
  const navigate = useNavigate();
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('kg');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [comedorId, setComedorId] = useState('');
  const [donante, setDonante] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchComedores = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/comedores');
        const data = await response.json();
        setComedores(data);
      } catch (error) {
        console.error('Error al cargar comedores:', error);
        setComedores([]);
      }
    };
    fetchComedores();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!cantidad.trim()) newErrors.cantidad = 'La cantidad es requerida';
    if (parseFloat(cantidad) <= 0) newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
  if (!comedorId) newErrors.comedor = 'Debe seleccionar un comedor';
    if (!donante.trim()) newErrors.donante = 'El nombre del donante es requerido';
    if (!telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (telefono && !/^[\+]?[1-9][\d]{0,15}$/.test(telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);

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
      setLoading(false);
      return;
    }

    // Simula inventario_id (debes adaptarlo si tienes inventario real)
    const data = {
      usuario_id,
      comedor_id: Number(comedorId),
      cantidad: parseInt(cantidad),
      fecha
    };

    try {
      const response = await fetch('http://localhost:3000/api/donacionesinventario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert('¡Donación de alimentos registrada exitosamente! 🎉');
  setCantidad('');
  setComedorId('');
  setErrors({});
  navigate('/Donaciones');
      } else {
        alert(result.message || 'Error al registrar donación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la donación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="donaciones-alimentos-container">
        <div className="form-header">
          <button 
            className="back-button"
            onClick={() => navigate('/Donaciones')}
          >
            ← Volver
          </button>
          <h1>🥘 Donar Alimentos</h1>
          <p>Contribuye con alimentos nutritivos para los comedores comunitarios</p>
        </div>

        <div className="form-section">
          <form onSubmit={handleSubmit} className="donacion-form">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="cantidad">📊 Cantidad</label>
                <div className="cantidad-input">
                  <input
                    type="number"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className={errors.cantidad ? 'error' : ''}
                    placeholder="Ej: 25"
                    min="0.1"
                    step="0.1"
                    required
                  />
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    className="unidad-select"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">litros</option>
                    <option value="unidades">unidades</option>
                    <option value="cajas">cajas</option>
                  </select>
                </div>
                {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="fecha">📅 Fecha de Donación</label>
                <input
                  type="date"
                  id="fecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="descripcion">📝 Descripción de los Alimentos</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className={errors.descripcion ? 'error' : ''}
                placeholder="Ej: Arroz, frijoles, verduras frescas, pollo..."
                rows={4}
                required
              />
              {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="donante">👤 Nombre del Donante</label>
                <input
                  type="text"
                  id="donante"
                  value={donante}
                  onChange={(e) => setDonante(e.target.value)}
                  className={errors.donante ? 'error' : ''}
                  placeholder="Tu nombre completo"
                  required
                />
                {errors.donante && <span className="error-message">{errors.donante}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="telefono">📱 Teléfono de Contacto</label>
                <input
                  type="tel"
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={errors.telefono ? 'error' : ''}
                  placeholder="Ej: +51 987 654 321"
                  required
                />
                {errors.telefono && <span className="error-message">{errors.telefono}</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="comedor">🏢 Comedor Destinatario</label>
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
                    {comedor.nombre}
                  </option>
                ))}
              </select>
              {errors.comedor && <span className="error-message">{errors.comedor}</span>}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Registrando...
                </>
              ) : (
                '🥘 Registrar Donación de Alimentos'
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DonacionesAlimentos;
