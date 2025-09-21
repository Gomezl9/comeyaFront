const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simulación de almacenamiento en memoria
let comedores = [
  {
    id: 1,
    nombre: 'Comedor San Juan',
    direccion: 'Av. San Juan 123, Lima',
    latitud: -12.046374,
    longitud: -77.042793,
    horarios: 'Lunes a Viernes 12:00-14:00',
    activo: true,
    calificacion: 4.8,
    capacidad: 50,
    telefono: '+51 999 888 777'
  },
  {
    id: 2,
    nombre: 'Comedor Los Olivos',
    direccion: 'Jr. Los Olivos 456, Lima',
    latitud: -12.056374,
    longitud: -77.052793,
    horarios: 'Todos los días 11:30-15:00',
    activo: true,
    calificacion: 4.5,
    capacidad: 75,
    telefono: '+51 999 777 666'
  },
  {
    id: 3,
    nombre: 'Comedor Villa El Salvador',
    direccion: 'Av. Villa El Salvador 789, Lima',
    latitud: -12.036374,
    longitud: -77.032793,
    horarios: 'Lunes a Sábado 12:00-16:00',
    activo: false,
    calificacion: 4.2,
    capacidad: 60,
    telefono: '+51 999 666 555'
  },
  {
    id: 4,
    nombre: 'Comedor San Miguel',
    direccion: 'Av. La Marina 321, Lima',
    latitud: -12.066374,
    longitud: -77.062793,
    horarios: 'Lunes a Viernes 11:00-14:30',
    activo: true,
    calificacion: 4.9,
    capacidad: 40,
    telefono: '+51 999 555 444'
  },
  {
    id: 5,
    nombre: 'Comedor Callao',
    direccion: 'Av. Grau 654, Callao',
    latitud: -12.056374,
    longitud: -77.132793,
    horarios: 'Todos los días 12:00-15:00',
    activo: true,
    calificacion: 4.6,
    capacidad: 80,
    telefono: '+51 999 444 333'
  }
];

let usuarios = [
  {
    id: 1,
    email: 'admin@comeya.com',
    password: '123456',
    nombre: 'Administrador',
    rol: 'admin',
    telefono: '+51 999 123 456'
  },
  {
    id: 2,
    email: 'usuario@test.com',
    password: '123456',
    nombre: 'Usuario Test',
    rol: 'usuario',
    telefono: '+51 999 654 321'
  }
];

let donaciones = [];
let reservas = [];
let comedorId = 6;
let usuarioId = 3;
let donacionId = 1;
let reservaId = 1;

// Rutas principales
app.get('/', (req, res) => {
  res.json({ 
    message: 'API COMEYA funcionando correctamente 🍽️',
    version: '1.0.0',
    endpoints: {
      comedores: '/api/comedores',
      usuarios: '/api/usuarios',
      donaciones: '/api/donaciones',
      reservas: '/api/reservas',
      auth: '/api/auth'
    }
  });
});

// ========== RUTAS DE AUTENTICACIÓN ==========
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const usuario = usuarios.find(u => u.email === email && u.password === password);
  
  if (usuario) {
    const { password, ...userWithoutPassword } = usuario;
    res.json({
      success: true,
      message: 'Login exitoso',
      user: userWithoutPassword,
      token: 'fake-jwt-token-' + usuario.id
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, nombre, telefono } = req.body;
  
  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'El email ya está registrado'
    });
  }
  
  const nuevoUsuario = {
    id: usuarioId++,
    email,
    password,
    nombre,
    telefono,
    rol: 'usuario'
  };
  
  usuarios.push(nuevoUsuario);
  
  const { password: _, ...userWithoutPassword } = nuevoUsuario;
  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    user: userWithoutPassword
  });
});

// ========== RUTAS DE COMEDORES ==========
app.get('/api/comedores', (req, res) => {
  res.json({
    success: true,
    data: comedores,
    count: comedores.length
  });
});

app.get('/api/comedores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const comedor = comedores.find(c => c.id === id);
  
  if (comedor) {
    res.json({
      success: true,
      data: comedor
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Comedor no encontrado'
    });
  }
});

app.post('/api/comedores', (req, res) => {
  const nuevoComedor = {
    id: comedorId++,
    ...req.body,
    activo: true,
    calificacion: 0
  };
  
  comedores.push(nuevoComedor);
  
  res.status(201).json({
    success: true,
    message: 'Comedor creado exitosamente',
    data: nuevoComedor
  });
});

app.put('/api/comedores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = comedores.findIndex(c => c.id === id);
  
  if (index !== -1) {
    comedores[index] = { ...comedores[index], ...req.body };
    res.json({
      success: true,
      message: 'Comedor actualizado exitosamente',
      data: comedores[index]
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Comedor no encontrado'
    });
  }
});

app.delete('/api/comedores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = comedores.findIndex(c => c.id === id);
  
  if (index !== -1) {
    comedores.splice(index, 1);
    res.json({
      success: true,
      message: 'Comedor eliminado exitosamente'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Comedor no encontrado'
    });
  }
});

// ========== RUTAS DE DONACIONES ==========
app.get('/api/donaciones', (req, res) => {
  res.json({
    success: true,
    data: donaciones,
    count: donaciones.length
  });
});

app.post('/api/donaciones', (req, res) => {
  const nuevaDonacion = {
    id: donacionId++,
    ...req.body,
    fecha: new Date().toISOString(),
    estado: 'pendiente'
  };
  
  donaciones.push(nuevaDonacion);
  
  res.status(201).json({
    success: true,
    message: 'Donación registrada exitosamente',
    data: nuevaDonacion
  });
});

// ========== RUTAS DE RESERVAS ==========
app.get('/api/reservas', (req, res) => {
  res.json({
    success: true,
    data: reservas,
    count: reservas.length
  });
});

app.post('/api/reservas', (req, res) => {
  const nuevaReserva = {
    id: reservaId++,
    ...req.body,
    fecha_creacion: new Date().toISOString(),
    estado: 'confirmada'
  };
  
  reservas.push(nuevaReserva);
  
  res.status(201).json({
    success: true,
    message: 'Reserva creada exitosamente',
    data: nuevaReserva
  });
});

// ========== RUTAS DE USUARIOS ==========
app.get('/api/usuarios', (req, res) => {
  const usuariosSinPassword = usuarios.map(({ password, ...usuario }) => usuario);
  res.json({
    success: true,
    data: usuariosSinPassword,
    count: usuariosSinPassword.length
  });
});


// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 ===== SERVIDOR COMEYA INICIADO =====');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`💻 Frontend: http://localhost:5173`);
  console.log(`📊 Estado: ✅ Funcionando correctamente`);
  console.log(`📋 Comedores registrados: ${comedores.length}`);
  console.log(`👥 Usuarios registrados: ${usuarios.length}`);
  console.log('=========================================\n');
});
