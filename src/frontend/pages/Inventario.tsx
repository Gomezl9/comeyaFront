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
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la búsqueda

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
        setAlimentos(Array.isArray(data) ? data : []);
      } catch (err) {
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

  // Lógica para filtrar alimentos
  const filteredAlimentos = alimentos.filter(alimento =>
    alimento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (comedores.find(c => c.id === alimento.comedor_id)?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener un ícono según la unidad
  const getUnitIcon = (unidad: string) => {
    switch (unidad.toLowerCase()) {
      case 'kg': case 'g': return '⚖️';
      case 'l': case 'ml': return '💧';
      case 'unidades': return '📦';
      case 'paquetes': return '🥡';
      default: return '🍴';
    }
  };

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
    
    // Enviar al backend
    fetch('http://localhost:3000/api/inventarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al guardar en la base');
        }
        const saved = await res.json();
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
          <h2>Inventario de Alimentos</h2>
          <p className="desc">Aquí puedes ver todos los alimentos donados y agregar más al inventario.</p>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Agregar Alimento'}
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

          <div className="inventario-list-header">
            <h3>Listado de Alimentos</h3>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar por nombre o comedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="inventario-list">
            {filteredAlimentos.length === 0 ? (
              <div className="empty-inventario">
                <div className="empty-icon">🍽️</div>
                <h4>Inventario Vacío</h4>
                <p>{searchTerm ? 'No se encontraron alimentos con ese criterio.' : 'Aún no has agregado alimentos. ¡Empieza ahora!'}</p>
              </div>
            ) : (
              <div className="cards-container">
                {filteredAlimentos.map(a => {
                  const comedor = comedores.find(c => c.id === a.comedor_id);
                  return (
                    <div key={a.id} className="alimento-card">
                      <div className="card-icon">{getUnitIcon(a.unidad)}</div>
                      <div className="card-details">
                        <h4 className="card-title">{a.nombre}</h4>
                        <p className="card-comedor">{comedor ? comedor.nombre : `Comedor ID: ${a.comedor_id}`}</p>
                      </div>
                      <div className="card-quantity">
                        <span className="quantity-number">{a.cantidad}</span>
                        <span className="quantity-unit">{a.unidad}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;