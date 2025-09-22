import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registrarse.css';
import loginImage from '../assets/img/login.png';

interface Rol {
	id: number;
	nombre: string;
}

const Registrarse: React.FC = () => {
	const [nombre, setNombre] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rol, setRol] = useState<number | ''>(''); 
	const [roles, setRoles] = useState<Rol[]>([]); 
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchRoles = async () => {
			try {
				const response = await fetch('http://localhost:3000/api/roles');
				const data = await response.json();
				setRoles(data);
			} catch (error) {
				console.error("Error cargando roles:", error);
			}
		};
		fetchRoles();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setErrors({}); // Limpiar errores previos

		try {
			const response = await fetch('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					nombre, 
					correo: email,              
					contraseña: password,      
					rol_id: rol           
				}),
			});

			const data = await response.json();

			if (response.ok) {
				alert('¡Registro exitoso! 🎉');
				navigate('/');
			} else if (response.status === 422) {
				const formattedErrors = data.errors.reduce((acc: Record<string, string>, error: Record<string, string>) => {
					const field = Object.keys(error)[0];
					// Mapear 'correo' a 'email' para que coincida con el estado local
					const clientField = field === 'correo' ? 'email' : field;
					acc[clientField] = Object.values(error)[0];
					return acc;
				}, {});
				setErrors(formattedErrors);
				alert('Por favor, corrige los errores en el formulario.');
			} else {
				alert(data.message || 'Error al registrarse');
			}
		} catch (error) {
			console.error('Error:', error);
			alert('Error de conexión con el servidor');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="registrarse-container">
			<div className="registrarse-left" aria-hidden="true">
				<figure className="registrarse-image" role="img" aria-label="Comunidad unida apoyando comedores">
					<div className="registrarse-img-placeholder">
						<img src={loginImage} alt="Login" />
					</div>
					<figcaption className="registrarse-caption">Comunidad unida apoyando comedores</figcaption>
				</figure>
			</div>
			
			<div className="registrarse-right">
				<div className="registrarse-content">
					<div className="registrarse-header">
						<h2>🚀 Únete a COMEYA</h2>
						<p>Crea tu cuenta y ayuda a gestionar comedores comunitarios</p>
					</div>
					
					<form className="registrarse-form" onSubmit={handleSubmit}>
						<div className="input-group">
							<label htmlFor="nombre">Nombre Completo</label>
							<input
								type="text"
								id="nombre"
								value={nombre}
								onChange={e => setNombre(e.target.value)}
								placeholder="Ej: Juan Pérez"
								required
								maxLength={100}
							/>
							{errors.nombre && <p className="error-message">{errors.nombre}</p>}
						</div>
						
						<div className="input-group">
							<label htmlFor="email">Correo Electrónico</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder="Ej: juan@correo.com"
								required
								maxLength={100}
							/>
							{errors.email && <p className="error-message">{errors.email}</p>}
						</div>
						
						<div className="input-group">
							<label htmlFor="password">Contraseña</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder="Mínimo 6 caracteres"
								required
								minLength={6}
							/>
							{errors.contraseña && <p className="error-message">{errors.contraseña}</p>}
						</div>
						
						<div className="input-group">
							<label htmlFor="rol">Rol</label>
							<select
								id="rol"
								value={rol}
								onChange={e => setRol(Number(e.target.value))}
								required
							>
								<option value="">Seleccione un rol</option>
								{roles.map(r => (
									<option key={r.id} value={r.id}>{r.nombre}</option>
								))}
							</select>
							{errors.rol_id && <p className="error-message">{errors.rol_id}</p>}
						</div>
						
						<button type="submit" className="registrarse-button" disabled={loading}>
							{loading ? (
								<>
									<div className="spinner"></div>
									Registrando...
								</>
							) : (
								'✨ Crear Cuenta'
							)}
						</button>
						
						<div className="login-link">
							<p>¿Ya tienes cuenta? <button type="button" onClick={() => navigate('/')} className="link-button">Inicia Sesión</button></p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Registrarse;
