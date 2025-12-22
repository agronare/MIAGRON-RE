
import React, { useState } from 'react';
import { Lock, Mail, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { EMPLOYEES_MOCK } from '../constants';
import { AgronareLogo } from './AgronareLogo';

interface LoginViewProps {
    onLogin: (user: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate Network Delay for security (prevent timing attacks simulation)
        setTimeout(() => {
            // 1. Find user by email
            const user = EMPLOYEES_MOCK.find(
                u => u.email.toLowerCase() === email.toLowerCase()
            );

            if (!user) {
                // Generic error message for security
                setError('Credenciales inválidas. Verifique sus datos.');
                setIsLoading(false);
                return;
            }

            // 2. Verify Password
            // Check localStorage for a user-set password, otherwise use default 'admin123'
            // In a real app, this would be a hashed comparison on the backend.
            const storedHash = localStorage.getItem(`auth_pwd_${user.email}`);
            const defaultPass = 'admin123';
            
            // Simple check (in production this would use bcrypt/argon2)
            const isValid = storedHash 
                ? atob(storedHash) === password 
                : password === defaultPass;

            if (isValid) {
                onLogin(user);
            } else {
                setError('La contraseña es incorrecta.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-white p-6 font-sans">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[900px] min-h-[550px] flex overflow-hidden relative border border-slate-100">
                
                {/* Left Side - Branding */}
                <div className="hidden md:flex w-[45%] bg-[#f3fdf5] flex-col items-center justify-center p-10 relative overflow-hidden border-r border-slate-100">
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(63, 221, 143, 0.18), transparent 50%), radial-gradient(circle at 75% 30%, rgba(79, 70, 229, 0.12), transparent 55%)'
                    }}></div>

                    <div className="relative z-10 flex flex-col items-center text-center h-full justify-between py-8">
                        <div className="relative flex flex-col items-center">
                            <div className="absolute inset-0 mx-auto w-64 h-64 bg-emerald-200/20 blur-3xl rounded-full" aria-hidden="true"></div>
                            <img
                                src="/logoagronarelocal.png"
                                alt="Agronare"
                                className="relative w-44 h-auto object-contain drop-shadow-sm"
                            />
                        </div>

                        <div className="space-y-4 mt-10 px-6">
                            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                                ¡Bienvenido
                                <span className="block text-blue-600">AgroPlayer!</span>
                            </h2>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-[260px] mx-auto italic">
                                "El compromiso de hoy es la cosecha del mañana."
                            </p>
                        </div>

                        <div className="text-6xl leading-none mt-10 floaty" aria-hidden="true">🌱</div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center bg-white relative">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-8">
                            <h3 className="text-3xl font-bold text-slate-900 mb-2">
                                Iniciar Sesión
                            </h3>
                            <p className="text-slate-500 text-sm">Ingrese sus credenciales para continuar.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-600 uppercase ml-1">Correo electrónico</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                                        placeholder="usuario@agronare.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between ml-1">
                                    <label className="block text-xs font-bold text-slate-600 uppercase">Contraseña</label>
                                    <button type="button" className="text-xs text-blue-600 hover:text-blue-800 font-medium" onClick={() => alert('Contacte al administrador del sistema para restablecer su contraseña.')}>
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-start pt-1">
                                <label className="flex items-center cursor-pointer select-none group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                                        {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="ml-2.5 text-slate-600 text-sm">Mantener sesión iniciada</span>
                                </label>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:transform-none flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verificando...
                                    </span>
                                ) : 'Ingresar al Sistema'}
                            </button>
                        </form>
                        
                        <div className="mt-8 text-center">
                            <p className="text-xs text-slate-400">
                                © 2025 Agronare. Todos los derechos reservados.
                                <br/>Acceso exclusivo para personal autorizado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
