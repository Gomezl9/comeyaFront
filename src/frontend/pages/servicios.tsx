import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Servicios.css';

interface Servicio {
	id?: number;
	nombre: string;
	descripcion: string;
	comedor_id?: number;
}

interface Comedor {
	id: number;
	nombre: string;
	direccion: string;
	creado_por: number;
}

const Servicios: React.FC = () => {
	const [servicios, setServicios] = useState<Servicio[]>([]);
	const [comedores, setComedores] = useState<Comedor[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<{ 
		nombre: string; 
		descripcion: string; 
		comedor_id: string; 
	}>({ 
		nombre: '', 
		descripcion: '', 
		comedor_id: '' 
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);

	// Obtener ID del usuario actual
	const getCurrentUserId = (): number | null => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				console.log('No hay token en localStorage');
				return null;
			}
			const payload = JSON.parse(atob(token.split('.')[1]));
			
			// Intentar diferentes campos comunes
			const userId = payload.id || 
						  payload.user_id || 
						  payload.userId || 
						  payload.sub ||
						  (payload.user && payload.user.id) ||
						  (payload.data && payload.data.id) ||
						  (payload.userData && payload.userData.id);
			
			console.log('ID del usuario encontrado:', userId);
			console.log('Tipo del ID:', typeof userId);
			return userId ? Number(userId) : null;
		} catch (error) {
			console.error('Error al decodificar token:', error);
			return null;
		}
	};

	// Cargar datos
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Obtener ID del usuario actual primero
				const userId = getCurrentUserId();
				setCurrentUserId(userId);
				console.log('ID del usuario obtenido:', userId);

				// Cargar servicios
				const serviciosResponse = await fetch('http://localhost:3000/api/servicios');
				const serviciosData = await serviciosResponse.json();
				setServicios(Array.isArray(serviciosData) ? serviciosData : []);

				// Cargar comedores
				const comedoresResponse = await fetch('http://localhost:3000/api/comedores');
				const comedoresData = await comedoresResponse.json();
				setComedores(Array.isArray(comedoresData) ? comedoresData : []);
			} catch (err) {
				console.error('Error cargando datos:', err);
				setServicios([]);
				setComedores([]);
			}
		};
		fetchData();
	}, []);

	// Recargar comedores cuando cambie el currentUserId
	useEffect(() => {
		if (currentUserId) {
			console.log('currentUserId cambió, recargando comedores...');
		}
	}, [currentUserId]);

	// Filtrar comedores del usuario actual
	const comedoresDelUsuario = comedores.filter(comedor => {
		console.log(`Comedor: ${comedor.nombre}, creado_por: ${comedor.creado_por}, currentUserId: ${currentUserId}, match: ${comedor.creado_por === currentUserId}`);
		return comedor.creado_por === currentUserId;
	});
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleEdit = (servicio: Servicio) => {
		setEditingId(servicio.id!);
		setForm({ 
			nombre: servicio.nombre, 
			descripcion: servicio.descripcion,
			comedor_id: servicio.comedor_id?.toString() || ''
		});
		setShowForm(true);
	};

	const handleCancel = () => {
		setEditingId(null);
		setForm({ nombre: '', descripcion: '', comedor_id: '' });
		setShowForm(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No estás autenticado. Por favor, inicia sesión.');
			}

			// Preparar datos para enviar
			const servicioData = {
				nombre: form.nombre,
				descripcion: form.descripcion,
				comedor_id: parseInt(form.comedor_id)
			};

			const url = editingId 
				? `http://localhost:3000/api/servicios/${editingId}`
				: 'http://localhost:3000/api/servicios';
			
			const method = editingId ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(servicioData),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Error al ${editingId ? 'actualizar' : 'crear'} el servicio`);
			}

			// Recargar servicios
			const serviciosResponse = await fetch('http://localhost:3000/api/servicios');
			const serviciosData = await serviciosResponse.json();
			setServicios(Array.isArray(serviciosData) ? serviciosData : []);

			handleCancel();
		} catch (err) {
			console.error('Error:', err);
			setError(err instanceof Error ? err.message : 'Error desconocido');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (!window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No estás autenticado. Por favor, inicia sesión.');
			}

			const response = await fetch(`http://localhost:3000/api/servicios/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || 'Error al eliminar el servicio');
			}

			// Recargar servicios
			const serviciosResponse = await fetch('http://localhost:3000/api/servicios');
			const serviciosData = await serviciosResponse.json();
			setServicios(Array.isArray(serviciosData) ? serviciosData : []);
		} catch (err) {
			console.error('Error:', err);
			setError(err instanceof Error ? err.message : 'Error desconocido');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ display: 'flex' }}>
			<Sidebar />
			<div style={{ flex: 1, marginLeft: 280 }}>
				<div className="servicios-container">
					<h2>🛎️ Servicios de Mis Comedores</h2>
					<p className="desc">Gestiona los servicios de los comedores que has creado.</p>
					
					<button 
						className="add-btn" 
						onClick={() => {
							setEditingId(null);
							setForm({ nombre: '', descripcion: '', comedor_id: '' });
							setShowForm(true);
						}}
					>
						➕ Agregar Servicio
					</button>

					{showForm && (
						<form className="servicio-form" onSubmit={handleSubmit}>
							<h3>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
							<div>
								<label>Comedor</label>
								<select 
									name="comedor_id" 
									value={form.comedor_id} 
									onChange={handleInputChange} 
									required
									disabled={comedoresDelUsuario.length === 0}
								>
									<option value="">
										{comedoresDelUsuario.length === 0 
											? 'No tienes comedores creados' 
											: 'Selecciona un comedor'
										}
									</option>
									{comedoresDelUsuario.map(comedor => (
										<option key={comedor.id} value={comedor.id}>
											{comedor.nombre} - {comedor.direccion}
										</option>
									))}
								</select>
								{comedoresDelUsuario.length === 0 && (
									<p style={{ color: '#e53e3e', fontSize: '0.9rem', marginTop: '0.5rem' }}>
										Primero debes crear un comedor para poder agregar servicios
									</p>
								)}
							</div>
							<div>
								<label>Nombre del Servicio</label>
								<input 
									name="nombre" 
									type="text" 
									value={form.nombre} 
									onChange={handleInputChange} 
									required 
									placeholder="Ej: Desayuno, Almuerzo, Cena"
								/>
							</div>
							<div>
								<label>Descripción</label>
								<textarea 
									name="descripcion" 
									value={form.descripcion} 
									onChange={handleInputChange} 
									required 
									rows={3}
									placeholder="Describe el servicio que se ofrece"
								/>
							</div>
							<div className="form-actions">
								<button type="submit" className="submit-btn" disabled={loading}>
									{loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
								</button>
								<button type="button" className="cancel-btn" onClick={handleCancel}>
									Cancelar
								</button>
							</div>
							{error && <div className="error-message">{error}</div>}
						</form>
					)}

					<div className="servicios-list">
						<h3>Servicios Registrados</h3>
						{servicios.length === 0 ? (
							<p className="no-data">No hay servicios registrados.</p>
						) : (
							<div className="servicios-grid">
								{servicios.map(servicio => {
									const comedor = comedores.find(c => c.id === servicio.comedor_id);
									return (
										<div key={servicio.id} className="servicio-card">
											<div className="servicio-header">
												<h4>{servicio.nombre}</h4>
												<div className="servicio-actions">
													<button 
														className="edit-btn" 
														onClick={() => handleEdit(servicio)}
														title="Editar servicio"
													>
														Editar
													</button>
													<button 
														className="delete-btn" 
														onClick={() => handleDelete(servicio.id!)}
														title="Eliminar servicio"
													>
														Eliminar
													</button>
												</div>
											</div>
											<p className="servicio-desc">{servicio.descripcion}</p>
											<div className="comedor-info">
												<strong>Comedor:</strong> {comedor?.nombre || 'Comedor no encontrado'}
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

export default Servicios;