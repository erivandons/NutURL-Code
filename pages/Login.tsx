
import React, { useState, useEffect } from 'react';
import { Card, Input, Button } from '../components';
import { AccountType, User } from '../types';
import { loginUser, registerUser, googleLogin, forgotPassword } from '../store';
import { useLanguage } from '../i18n';

interface LoginProps {
  onLogin: (user: User) => void;
}

// Declaração global para TS entender o Google One Tap/Button
declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPassMode, setForgotPassMode] = useState(false);

  // Inicializa Google Button
  useEffect(() => {
    // Usa a variável de ambiente do Vite (frontend) de forma segura
    const env = (import.meta as any).env;
    const CLIENT_ID = env?.VITE_GOOGLE_CLIENT_ID;

    if (window.google && !forgotPassMode && CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleGoogleResponse
      });
      
      const btnDiv = document.getElementById("googleSignInDiv");
      if (btnDiv) {
        window.google.accounts.id.renderButton(
          btnDiv,
          { theme: "outline", size: "large", width: "100%" } 
        );
      }
    } else if (!CLIENT_ID && !forgotPassMode) {
      console.warn("VITE_GOOGLE_CLIENT_ID not found in environment variables.");
    }
  }, [forgotPassMode]);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    try {
      const user = await googleLogin(response.credential);
      onLogin(user);
    } catch (err) {
      setError(t('login.google_fail'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      alert(t('login.recover_success'));
      setForgotPassMode(false);
    } catch (e) {
      alert(t('login.recover_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user;
      if (isRegister) {
        user = await registerUser(name, email, password);
      } else {
        user = await loginUser(email, password);
      }
      onLogin(user);
    } catch (err) {
      setError('Error. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (forgotPassMode) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <Card className="w-full max-w-md p-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-100 tracking-tight">{t('login.recover_title')}</h2>
            <p className="text-slate-500">{t('login.recover_desc')}</p>
          </div>
          <form onSubmit={handleForgotPass} className="space-y-4">
             <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-600 ml-1">{t('login.email_label')}</label>
              <Input 
                type="email" 
                placeholder="exemplo@email.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full py-4 mt-4">
              {loading ? '...' : t('login.btn_send')}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setForgotPassMode(false)} 
              className="w-full"
            >
              {t('login.btn_back')}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-12">
      <Card className="w-full max-w-md p-10 space-y-6 border-amber-500/10 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">
            {isRegister ? t('login.create_title') : t('login.welcome_title')}
          </h2>
          <p className="text-slate-500">
            {isRegister ? t('login.create_desc') : t('login.welcome_desc')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Google Auth Container */}
        <div className="w-full h-[40px] flex justify-center mb-4" id="googleSignInDiv"></div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink-0 mx-4 text-slate-600 text-xs uppercase tracking-widest">{t('login.or_email')}</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
             <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-600 ml-1">{t('login.name_label')}</label>
              <Input 
                type="text" 
                placeholder={t('login.name_placeholder')}
                required={isRegister}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
           <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-black text-slate-600 ml-1">{t('login.email_label')}</label>
            <Input 
              type="email" 
              placeholder="exemplo@email.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-black text-slate-600 ml-1">{t('login.pass_label')}</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {!isRegister && (
            <div className="flex justify-end">
              <span 
                onClick={() => setForgotPassMode(true)}
                className="text-xs text-slate-500 hover:text-amber-400 cursor-pointer"
              >
                {t('login.forgot_pass')}
              </span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full py-4 mt-4 text-lg">
            {loading ? '...' : (isRegister ? t('login.btn_create') : t('login.btn_login'))}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600">
          {isRegister ? t('login.have_account') : t('login.no_account')}{' '}
          <span 
            onClick={() => setIsRegister(!isRegister)}
            className="text-amber-500 cursor-pointer font-bold hover:underline"
          >
            {isRegister ? t('login.action_login') : t('login.action_create')}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default Login;
