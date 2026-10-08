import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LogOut, ClipboardList, BookOpen, Users, Calendar, CheckCircle2, Save } from 'lucide-react';

const GRADES = ['6°', '7°', '8°', '9°', '1°', '2°', '3°'] as const;
const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { 
    currentUserRole, 
    currentTeacherId,
    teachers, 
    logout, 
    questions, 
    addReport 
  } = useStore();

  const teacher = teachers.find(t => t.id === currentTeacherId);

  // Form State - Fixos
  const [subject, setSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('6°');
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Form State - Dinâmicos
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (currentUserRole !== 'teacher' || !teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-xl text-slate-700 mb-4">Acesso não autorizado.</p>
          <button onClick={() => navigate('/')} className="text-blue-600 underline">Voltar ao Início</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addReport({
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject,
      className: `${selectedGrade} ${selectedLetter}`,
      date,
      answers
    });

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setSubject('');
      setSelectedGrade('6°');
      setSelectedLetter('A');
      setAnswers({});
    }, 3000);
  };

  // Group questions by section
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {} as Record<string, typeof questions>);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <ClipboardList className="w-6 h-6" />
            <span className="font-bold text-lg text-slate-800">Painel do Professor</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">Olá, {teacher.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        
        {isSubmitted && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="font-medium">Relatório enviado com sucesso! A direção já pode visualizá-lo.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Informações Gerais */}
          <section className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200/70 overflow-hidden">
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-900">1. Informações Gerais</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Disciplina e Data agrupados */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Componente Curricular / Disciplina
                  </label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white shadow-2xs"
                    placeholder="Ex: Matemática, História"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Data
                  </label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 bg-white shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Turma
                  </label>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Selecionada: {selectedGrade} {selectedLetter}
                  </span>
                </div>

                {/* Seleção do Ano/Série */}
                <div>
                  <span className="text-xs font-medium text-slate-500 mb-1.5 block">Ano / Série:</span>
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {GRADES.map(grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setSelectedGrade(grade)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          selectedGrade === grade
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seleção da Letra da Turma */}
                <div>
                  <span className="text-xs font-medium text-slate-500 mb-1.5 block">Turma:</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {LETTERS.map(letter => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setSelectedLetter(letter)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          selectedLetter === letter
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Dynamic Sections (Todas as seções atuais e perguntas adicionadas automaticamente) */}
          {Object.entries(groupedQuestions).map(([sectionTitle, sectionQuestions], index) => (
            <section 
              key={sectionTitle} 
              className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200/70 overflow-hidden"
            >
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
                <h2 className="text-lg font-bold text-emerald-900">
                  {index + 2}. {sectionTitle}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {sectionQuestions.map(q => (
                  <div key={q.id} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {q.text}
                    </label>
                    <textarea 
                      required
                      rows={4}
                      value={answers[q.id] || ''}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-y bg-white shadow-2xs"
                      placeholder="Sua resposta..."
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Action */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Enviar Relatório
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
