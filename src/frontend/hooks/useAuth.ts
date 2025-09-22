import { useState, useEffect } from 'react';

interface User {
  id: number;
  nombre: string;
  correo: string;
  rol_id: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // <-- Añadir estado de carga

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
        // Asumimos que rol_id 1 es Admin
        setIsAdmin(parsedUser.rol_id === 1);
      }
    } catch (error) {
      console.error("Error al parsear datos del usuario desde localStorage:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false); // <-- Terminar la carga
    }
  }, []);

  return { user, isAdmin, loading }; // <-- Devolver estado de carga
};
