import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { User, ShieldCheck, ArrowRight, X, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { loginDirector, loginTeacher, teachers, addTeacher } = useStore();

  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherMode, setTeacherMode] = useState<'login' | 'register'>('login');
  
  const [directorPass, setDirectorPass] = useState('');
  const [showDirectorPass, setShowDirectorPass] = useState(false);

  const [teacherId, setTeacherId] = useState('');
  const [teacherPass, setTeacherPass] = useState('');
  const [showTeacherPass, setShowTeacherPass] = useState(false);

  // Self-register state
  const [regName, setRegName] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const [error, setError] = useState('');

  const handleDirectorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginDirector(directorPass)) {
      navigate('/direcao');
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) {
      setError('Selecione seu nome na lista.');
      return;
    }
    if (loginTeacher(teacherId, teacherPass)) {
      navigate('/professor');
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleTeacherRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPass.trim()) {
      setError('Por favor, informe seu nome e crie uma senha.');
      return;
    }
    const newTeacher = addTeacher({
      name: regName.trim(),
      password: regPass.trim(),
    });
    loginTeacher(newTeacher.id, regPass.trim());
    navigate('/professor');
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-to-br from-sky-100/70 via-cyan-50/40 to-emerald-100/70">
      {/* Ponta Superior/Esquerda: Azul claro esfumado */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[550px] h-[550px] rounded-full bg-sky-200/80 blur-[110px]" />
      <div className="pointer-events-none absolute top-10 left-10 w-[360px] h-[360px] rounded-full bg-blue-100/80 blur-[90px]" />
      
      {/* Centro: Mistura e transição suave */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-teal-100/40 blur-[120px]" />

      {/* Ponta Inferior/Direita: Verde claro esfumado */}
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[550px] h-[550px] rounded-full bg-emerald-200/80 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-[360px] h-[360px] rounded-full bg-green-100/80 blur-[90px]" />

      <div className="relative z-10 max-w-3xl w-full space-y-8 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight drop-shadow-2xs">
            Sistema de Pré-Conselho
          </h1>
          <p className="text-lg text-slate-700 max-w-xl mx-auto font-medium">
            Acesse o portal para gerenciar perguntas e relatórios, ou preencher sua ficha de acompanhamento de turma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Botão Direção */}
          <button 
            onClick={() => {
              setShowDirectorModal(true);
              setError('');
              setDirectorPass('');
              setShowDirectorPass(false);
            }}
            className="group relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/80 hover:border-blue-400 hover:shadow-lg transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/60 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <ShieldCheck className="w-12 h-12 text-blue-600 mb-6 relative z-10" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Sou da Direção</h2>
            <p className="text-slate-600 relative z-10">Gerenciar professores, configurar formulário e visualizar relatórios.</p>
            <ArrowRight className="w-6 h-6 text-blue-500 absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all" />
          </button>

          {/* Botão Professores */}
          <button 
            onClick={() => {
              setShowTeacherModal(true);
              setTeacherMode('login');
              setError('');
              setTeacherPass('');
              setShowTeacherPass(false);
              setTeacherId('');
              setRegName('');
              setRegPass('');
              setShowRegPass(false);
            }}
            className="group relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/80 hover:border-emerald-400 hover:shadow-lg transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/60 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <User className="w-12 h-12 text-emerald-600 mb-6 relative z-10" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Sou Professor(a)</h2>
            <p className="text-slate-600 relative z-10">Preencher relatórios de acompanhamento das turmas.</p>
            <ArrowRight className="w-6 h-6 text-emerald-500 absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all" />
          </button>
        </div>

      </div>

      {/* Modal Direção */}
      {showDirectorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                Acesso da Direção
              </h3>
              <button onClick={() => setShowDirectorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDirectorLogin} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Senha de Acesso</label>
                <div className="relative">
                  <input 
                    type={showDirectorPass ? "text" : "password"} 
                    value={directorPass}
                    onChange={(e) => setDirectorPass(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Digite a senha (padrão: 123)"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowDirectorPass(!showDirectorPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    title={showDirectorPass ? "Ocultar senha" : "Ver senha"}
                  >
                    {showDirectorPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Professores */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            
            {teacherMode === 'login' ? (
              <>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <User className="w-6 h-6 text-emerald-600" />
                    Acesso do Professor
                  </h3>
                  <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {teachers.length === 0 ? (
                  <div className="p-6 text-center space-y-4">
                    <p className="text-slate-600">Nenhum professor cadastrado ainda no sistema.</p>
                    <p className="text-sm text-slate-400">Você pode se cadastrar agora mesmo para começar.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherMode('register');
                        setError('');
                      }}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-5 h-5" />
                      Cadastrar Meu Nome Agora
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleTeacherLogin} className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Selecione seu nome</label>
                      <select 
                        value={teacherId}
                        onChange={(e) => setTeacherId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                      >
                        <option value="" disabled>Escolha na lista...</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Senha</label>
                      <div className="relative">
                        <input 
                          type={showTeacherPass ? "text" : "password"} 
                          value={teacherPass}
                          onChange={(e) => setTeacherPass(e.target.value)}
                          className="w-full pl-4 pr-11 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="Sua senha de acesso"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTeacherPass(!showTeacherPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                          title={showTeacherPass ? "Ocultar senha" : "Ver senha"}
                        >
                          {showTeacherPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button type="submit" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-xs">
                      Entrar
                    </button>

                    <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
                      <p className="text-sm text-slate-500">Não encontrou seu nome na lista?</p>
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherMode('register');
                          setError('');
                          setRegName('');
                          setRegPass('');
                          setShowRegPass(false);
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        Cadastre-se como professor
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-emerald-600" />
                    Cadastrar Professor
                  </h3>
                  <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleTeacherRegister} className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Seu Nome Completo</label>
                    <input 
                      type="text" 
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Ex: Prof. Mariana Silva"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Crie sua Senha de Acesso</label>
                    <div className="relative">
                      <input 
                        type={showRegPass ? "text" : "password"} 
                        required
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Digite sua senha pessoal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass(!showRegPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                        title={showRegPass ? "Ocultar senha" : "Ver senha"}
                      >
                        {showRegPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Essa senha será solicitada sempre que você for acessar.</p>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-5 h-5" />
                    Cadastrar e Entrar
                  </button>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherMode('login');
                        setError('');
                      }}
                      className="text-sm text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer"
                    >
                      Já tem cadastro? <span className="text-emerald-600 font-semibold">Voltar para o login</span>
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
