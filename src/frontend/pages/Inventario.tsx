import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Inventario.css';

interface Alimento {
  id?: number;
  comedor_id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

const unidades = ['kg', 'g', 'l', 'ml', 'unidades', 'paquetes'];

const Inventario: React.FC = () => {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [comedores, setComedores] = useState<any[]>([]);
  // Obtener usuario logueado
  const userStr = localStorage.getItem('user');
  let usuario_id = undefined;
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      if (userObj && typeof userObj.id === 'number') usuario_id = userObj.id;
    } catch {}
  }

  React.useEffect(() => {
    // Cargar comedores desde la API y filtrar por usuario
    const fetchComedores = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/comedores');
        const data = await response.json();
        let lista = Array.isArray(data) ? data : (data.data || []);
        if (usuario_id) {
          lista = lista.filter((c: any) => c.creado_por === usuario_id);
        }
        setComedores(lista);
        // Si hay al menos uno, setear comedor_id por defecto
        if (lista.length > 0) {
          setForm(f => ({ ...f, comedor_id: lista[0].id }));
        }
      } catch (err) {
        setComedores([]);
      }
    };

    // Cargar inventarios existentes
    const fetchInventarios = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/inventarios');
        const data = await response.json();
        console.log('Inventarios cargados:', data);
        setAlimentos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando inventarios:', err);
        setAlimentos([]);
      }
    };

    fetchComedores();
    fetchInventarios();
  }, [usuario_id]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Alimento>({ comedor_id: 1, nombre: '', cantidad: 0, unidad: 'kg' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Si el campo es comedor_id, asegurarse que es un número (id)
    if (name === 'comedor_id') {
      setForm(prev => ({
        ...prev,
        comedor_id: Number(value)
      }));
    } else if (name === 'cantidad') {
      setForm(prev => ({
        ...prev,
        cantidad: Number(value)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Debug: mostrar datos que se van a enviar
    console.log('Datos a enviar:', form);
    
    // Enviar al backend
    fetch('http://localhost:3000/api/inventarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(async res => {
        console.log('Respuesta del servidor:', res.status, res.statusText);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Error del servidor:', errorData);
          throw new Error(errorData.message || 'Error al guardar en la base');
        }
        const saved = await res.json();
        console.log('Datos guardados:', saved);
        setAlimentos(prev => [...prev, saved]);
        setShowForm(false);
        setForm({ comedor_id: 1, nombre: '', cantidad: 0, unidad: 'kg' });
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 280 }}>
        <div className="inventario-container">
          <h2>📦 Inventario de Alimentos</h2>
          <p className="desc">Aquí puedes ver todos los alimentos donados y agregar más al inventario.</p>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '➕ Agregar Alimento'}
          </button>
          {showForm && (
            <form className="inventario-form" onSubmit={handleSubmit}>
              <div>
                <label>Comedor</label>
                <select name="comedor_id" value={form.comedor_id} onChange={handleInputChange} required>
                  {comedores.length === 0 && <option value="">No tienes comedores creados</option>}
                  {comedores.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} - {c.direccion}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Nombre</label>
                <input name="nombre" type="text" value={form.nombre} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Cantidad</label>
                <input name="cantidad" type="number" min={1} value={form.cantidad} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Unidad</label>
                <select name="unidad" value={form.unidad} onChange={handleInputChange} required>
                  {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Agregando...' : 'Agregar'}
              </button>
              {error && <div className="error-message">{error}</div>}
            </form>
          )}
          <div className="inventario-list">
            {alimentos.length === 0 ? (
              <p>No hay alimentos en el inventario.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Comedor</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {alimentos.map(a => {
                    const comedor = comedores.find(c => c.id === a.comedor_id);
                    return (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{comedor ? comedor.nombre : a.comedor_id}</td>
                        <td>{a.nombre}</td>
                        <td>{a.cantidad}</td>
                        <td>{a.unidad}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;