import React, { useState } from 'react';
import { LogIn, UserPlus, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.showError('Por favor, preencha todos os campos.');
      return;
    }

    if (!isLogin && username.length < 3) {
      toast.showError('Username deve ter pelo menos 3 caracteres.');
      return;
    }

    if (password.length < 6) {
      toast.showError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(username, password);
        if (error) {
          toast.showError(error);
        } else {
          toast.showSuccess('Login realizado com sucesso!');
        }
      } else {
        const { error } = await signUp(username, password);
        if (error) {
          toast.showError(error);
        } else {
          toast.showSuccess('Conta criada com sucesso!');
        }
      }
    } catch (error) {
      toast.showError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-brand-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-8 text-center">
          <div className="bg-white/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.0524 4.38234 14.3823 5.71228 16.7647 6.76471C14.3823 7.81713 13.0524 9.14708 12 11.5294C10.9476 9.14708 9.61767 7.81713 7.23529 6.76471C9.61767 5.71228 10.9476 4.38234 12 2Z" fill="white"/>
              <path d="M5 10C5.70161 11.6935 6.69355 12.6855 8.3871 13.3871C6.69355 14.0887 5.70161 15.0806 5 16.7742C4.29839 15.0806 3.30645 14.0887 1.6129 13.3871C3.30645 12.6855 4.29839 11.6935 5 10Z" fill="white"/>
              <path d="M19 14C19.7016 15.6935 20.6935 16.6855 22.3871 17.3871C20.6935 18.0887 19.7016 19.0806 19 20.7742C18.2984 19.0806 17.3065 18.0887 15.6129 17.3871C17.3065 16.6855 18.2984 15.6935 19 14Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">YasminAromas</h1>
          <p className="text-brand-100 text-sm mt-2">Gestão Inteligente</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
              isLogin
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LogIn size={18} />
              <span>Entrar</span>
            </div>
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
              !isLogin
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus size={18} />
              <span>Registrar</span>
            </div>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome de Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                placeholder="seu_usuario"
                required
                disabled={loading}
                minLength={3}
              />
            </div>
            {!isLogin && (
              <p className="mt-2 text-xs text-gray-500">
                Mínimo 3 caracteres, apenas letras, números e underscore
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              A senha deve ter pelo menos 6 caracteres
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white py-3 px-4 rounded-lg font-medium hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isLogin ? 'Entrando...' : 'Criando conta...'}
              </span>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-gray-500">
            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              {isLogin ? 'Registre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

