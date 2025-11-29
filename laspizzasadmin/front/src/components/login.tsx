import React, {useState}from 'react';
import { useAuth } from '../context/AuthContext.tsx';


const Login: React.FC = () => {
    const {login} = useAuth();
    cosnt [usuario, setUsuario] = useState('');
    cosnt [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');


    cont handleSubmint = async (e: React.FormEvent) =>{
        e.preventDefault();
        const success = await login(usuario, contraseña);
        if (!success) setError('Crendenciales invalidas');

    };

    return(
        <div className="login-container">
            <h2>Iniciar Sesion</h2>
            <form onSubmit={handleSubmit}>
            <label>Usuario</label>
            <input> value={usuario} onChange={e => setUsuario(e.target.value)}</input>
            <label>Contraseña</label>
            <input>value{contraseña} onChange{e => setContarseña(e.)}</input>
            

            </form>


        </div>
    )
}
