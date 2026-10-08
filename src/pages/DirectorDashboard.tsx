import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Report } from '../store';
import { TurmaConsolidatedReport } from '../components/TurmaConsolidatedReport';
import { 
  Users, FileText, Plus, Trash2, LogOut, Settings, ListPlus, 
  CheckCircle2, Eye, EyeOff, ChevronDown, ChevronUp, Search, 
  Folder, FolderOpen, Clock, User, BookOpen
} from 'lucide-react';

const GRADES = ['6°', '7°', '8°', '9°', '1°', '2°', '3°'] as const;
const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export function parseReportClass(className: string): { grade: string | null; letter: string | null } {
  if (!className) return { grade: null, letter: null };
  const str = className.trim().replace(/º/g, '°');

  // Match grade: 6°, 7°, 8°, 9°, 1°, 2°, 3°
  let matchedGrade: string | null = null;
  for (const g of GRADES) {
    const num = g.replace('°', '');
    const regex = new RegExp(`(?:^|[^0-9])${num}(?:°|\\s*°|\\s*ano|\\s*serie|\\s*série)?(?:$|[^0-9])`, 'i');
    if (regex.test(str)) {
      matchedGrade = g;
      break;
    }
  }

  // Match letter: A, B, C, D, E
  let matchedLetter: string | null = null;
  for (const l of LETTERS) {
    const regex = new RegExp(`(?:^|[\\s°º\\-_/]|turma\\s*)${l}(?:$|[\\s\\-_/])`, 'i');
    if (regex.test(str)) {
      matchedLetter = l;
      break;
    }
  }

  return { grade: matchedGrade, letter: matchedLetter };
}

export interface TeacherTurmaGroup {
  teacherName: string;
  teacherId?: string;
  reports: Report[];
}

export function groupReportsByTeacher(turmaReports: Report[]): TeacherTurmaGroup[] {
  const map = new Map<string, Report[]>();
  turmaReports.forEach(r => {
    const name = (r.teacherName || 'Professor não identificado').trim();
    if (!map.has(name)) {
      map.set(name, []);
    }
    map.get(name)!.push(r);
  });

  const result: TeacherTurmaGroup[] = [];
  map.forEach((reps, teacherName) => {
    result.push({
      teacherName,
      teacherId: reps[0]?.teacherId,
      reports: reps
    });
  });

  return result.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { 
    currentUserRole, logout, 
    teachers, addTeacher, removeTeacher,
    questions, addQuestion, removeQuestion,
    reports, removeReport, clearAllReports 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'reports' | 'teachers' | 'questions'>('reports');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Search & Filter state for Reports by Turma
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});
  const [selectedLetterByGrade, setSelectedLetterByGrade] = useState<Record<string, string>>({
    '6°': 'A',
    '7°': 'A',
    '8°': 'A',
    '9°': 'A',
    '1°': 'A',
    '2°': 'A',
    '3°': 'A',
  });

  // Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherPass, setNewTeacherPass] = useState('');
  const [showNewTeacherPass, setShowNewTeacherPass] = useState(false);

  // Question Form State
  const [newQuestionSection, setNewQuestionSection] = useState('Perguntas Adicionais');
  const [newQuestionText, setNewQuestionText] = useState('');

  // Group reports by Turmas (Grades: 6°, 7°, 8°, 9°, 1°, 2°, 3° and Letters: A, B, C, D, E)
  const gradeReportsData = useMemo(() => {
    const map: Record<string, Record<string, Report[]>> = {};
    GRADES.forEach(g => {
      map[g] = {};
      LETTERS.forEach(l => {
        map[g][l] = [];
      });
    });

    const unmatchedReports: Report[] = [];

    reports.forEach(r => {
      const { grade, letter } = parseReportClass(r.className);
      if (grade && letter && map[grade] && map[grade][letter]) {
        map[grade][letter].push(r);
      } else {
        unmatchedReports.push(r);
      }
    });

    const gradeCounts: Record<string, number> = {};
    GRADES.forEach(g => {
      let count = 0;
      LETTERS.forEach(l => {
        count += map[g][l].length;
      });
      gradeCounts[g] = count;
    });

    return { map, gradeCounts, unmatchedReports };
  }, [reports]);

  const toggleGradeExpanded = (grade: string) => {
    setExpandedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
  };

  const isGradeExpanded = (grade: string) => {
    return Boolean(expandedGrades[grade]);
  };

  const setGradeLetter = (grade: string, letter: string) => {
    setSelectedLetterByGrade(prev => ({
      ...prev,
      [grade]: letter
    }));
  };

  // Guard
  if (currentUserRole !== 'director') {
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

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacherName && newTeacherPass) {
      addTeacher({ name: newTeacherName, password: newTeacherPass });
      setNewTeacherName('');
      setNewTeacherPass('');
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText && newQuestionSection) {
      addQuestion({ section: newQuestionSection, text: newQuestionText });
      setNewQuestionText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Settings className="w-6 h-6" />
            <span className="font-bold text-lg text-slate-800">Painel da Direção</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pb-24 sm:pb-28">
        
        {/* Content Area */}
        <main className="w-full">
          
          {/* TAB: RELATÓRIOS (Agrupados por Turmas: 6°, 7°, 8°, 9°, 1°, 2°, 3° com A, B, C, D, E) */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200/70 space-y-6">
                
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-blue-950">Relatórios Salvos por Turmas</h2>
                    <p className="text-sm text-slate-600">
                      Consulte os relatórios por ano/série (6°, 7°, 8°, 9°, 1°, 2°, 3°) e selecione a turma (A, B, C, D, E).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {reports.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Tem certeza de que deseja excluir TODOS os relatórios salvos de todos os professores? Esta ação não pode ser desfeita.')) {
                            clearAllReports();
                          }
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-red-600 hover:bg-red-50 border border-red-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir Todos os Relatórios
                      </button>
                    )}
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-slate-700 border border-blue-200 shadow-2xs">
                      7 Séries (6° ao 3°)
                    </span>
                  </div>
                </div>

                {/* Barra de Busca de Relatórios */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por professor, componente curricular ou respostas..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-blue-200/80 bg-white text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Lista de Blocos por Turmas (6°, 7°, 8°, 9°, 1°, 2°, 3°) */}
                <div className="space-y-4">
                  {GRADES.map((grade) => {
                    const gradeTotalReports = gradeReportsData.gradeCounts[grade] || 0;
                    const expanded = isGradeExpanded(grade);
                    const activeLetter = selectedLetterByGrade[grade] || 'A';
                    const activeLetterReports = gradeReportsData.map[grade]?.[activeLetter] || [];

                    // Filtrar por busca se digitado
                    const filteredReports = activeLetterReports.filter((report) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase().trim();
                      const inAnswers = Object.values(report.answers || {}).some(
                        ans => typeof ans === 'string' && ans.toLowerCase().includes(q)
                      );
                      return (
                        report.teacherName.toLowerCase().includes(q) ||
                        report.subject.toLowerCase().includes(q) ||
                        report.className.toLowerCase().includes(q) ||
                        inAnswers
                      );
                    });

                    // Agrupar relatórios da turma por professor (separando cada professor)
                    const activeTeacherGroups = groupReportsByTeacher(filteredReports);

                    return (
                      <div
                        key={grade}
                        className="bg-white rounded-2xl border border-blue-200/90 shadow-2xs overflow-hidden transition-all"
                      >
                        {/* Cabeçalho do Bloco do Ano/Série (Clique para abrir/fechar) */}
                        <div
                          onClick={() => toggleGradeExpanded(grade)}
                          className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-blue-50/40 transition-colors select-none"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs">
                              {grade}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">
                                Turmas do {grade}
                              </h3>
                              <p className="text-xs text-slate-500">
                                Turmas: A, B, C, D, E
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {gradeTotalReports > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {gradeTotalReports} {gradeTotalReports === 1 ? 'entregue' : 'entregues'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Nenhum relatório
                              </span>
                            )}

                            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                              {expanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Conteúdo Visível Somente ao Clicar no Bloco */}
                        {expanded && (
                          <div className="px-4 sm:px-6 pb-6 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-4">
                            
                            {/* Seletor de Turma: Escolher entre (A, B, C, D, E) */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Escolha a Turma do {grade}:
                                </span>
                                <span className="text-xs font-semibold text-blue-700">
                                  Visualizando: Turma {grade} {activeLetter}
                                </span>
                              </div>
                              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                                {LETTERS.map((letter) => {
                                  const count = gradeReportsData.map[grade]?.[letter]?.length || 0;
                                  const isSelected = activeLetter === letter;
                                  return (
                                    <button
                                      key={letter}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setGradeLetter(grade, letter);
                                      }}
                                      className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                        isSelected
                                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-300'
                                          : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50/70 hover:border-blue-300'
                                      }`}
                                    >
                                      <span className="font-bold text-xs sm:text-sm">
                                        Turma {letter}
                                      </span>
                                      <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                        isSelected
                                          ? 'bg-blue-700 text-white'
                                          : count > 0 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {count} {count === 1 ? 'relatório' : 'relatórios'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Ficha de Pré-Conselho da Turma - Respostas Juntas por Categoria */}
                            <TurmaConsolidatedReport
                              grade={grade}
                              letter={activeLetter}
                              reports={activeLetterReports}
                              questions={questions}
                              searchQuery={searchQuery}
                              onDeleteReport={(reportId) => removeReport(reportId)}
                              onViewReportModal={(rep) => setSelectedReport(rep)}
                            />

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* TAB: PROFESSORES */}
          {activeTab === 'teachers' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200/70">
                <h2 className="text-xl font-bold text-blue-950 mb-1">Cadastrar Professor</h2>
                <p className="text-sm text-slate-600 mb-6">Crie um acesso para os professores preencherem os relatórios.</p>
                
                <form onSubmit={handleAddTeacher} className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    required
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    placeholder="Nome completo do professor"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                  <div className="relative sm:w-56">
                    <input 
                      type={showNewTeacherPass ? "text" : "password"} 
                      required
                      value={newTeacherPass}
                      onChange={(e) => setNewTeacherPass(e.target.value)}
                      placeholder="Senha de acesso"
                      className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewTeacherPass(!showNewTeacherPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                      title={showNewTeacherPass ? "Ocultar senha" : "Ver senha"}
                    >
                      {showNewTeacherPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-xs">
                    <Plus className="w-5 h-5" /> Adicionar
                  </button>
                </form>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200/70">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-blue-950">Professores Cadastrados</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-blue-700 border border-blue-200 shadow-2xs">
                    Total: {teachers.length}
                  </span>
                </div>
                {teachers.length === 0 ? (
                  <p className="text-slate-500">Nenhum professor cadastrado.</p>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto no-scrollbar pr-0.5">
                    {teachers.map(t => (
                      <div key={t.id} className="py-3 px-3.5 bg-white hover:bg-blue-50/70 rounded-lg border border-blue-100 flex items-center justify-between group transition-colors shadow-2xs">
                        <div>
                          <p className="font-medium text-slate-800">{t.name}</p>
                          <p className="text-sm text-slate-500">Senha: {t.password}</p>
                        </div>
                        <button 
                          onClick={() => removeTeacher(t.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                          title="Remover professor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200/70">
                <h2 className="text-xl font-bold text-blue-950 mb-1">Adicionar Pergunta ao Relatório</h2>
                <p className="text-sm text-slate-600 mb-6">Esta pergunta aparecerá para todos os professores no momento do preenchimento.</p>
                
                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      required
                      value={newQuestionSection}
                      onChange={(e) => setNewQuestionSection(e.target.value)}
                      placeholder="Seção/Categoria (Ex: Panorama da Turma)"
                      className="sm:w-1/3 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    />
                    <input 
                      type="text" 
                      required
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Qual a sua pergunta?"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                      <Plus className="w-5 h-5" /> Adicionar Pergunta
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200/70">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-blue-950">Perguntas Atuais do Formulário</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-blue-700 border border-blue-200 shadow-2xs">
                    Total: {questions.length}
                  </span>
                </div>
                <div className="space-y-6 max-h-[480px] overflow-y-auto no-scrollbar pr-0.5">
                  {/* Agrupar por seção */}
                  {Array.from(new Set(questions.map(q => q.section))).map(section => (
                    <div key={section} className="space-y-3">
                      <h3 className="font-semibold text-blue-950 bg-white border border-blue-200 px-4 py-2 rounded-lg shadow-2xs">{section}</h3>
                      <div className="space-y-2 pl-4 border-l-2 border-blue-300 ml-2">
                        {questions.filter(q => q.section === section).map(q => (
                          <div key={q.id} className="flex items-start justify-between gap-4 p-3 bg-white hover:bg-blue-50/50 rounded-lg border border-blue-200/80 group shadow-2xs transition-colors">
                            <p className="text-slate-700 text-sm">{q.text}</p>
                            <button 
                              onClick={() => removeQuestion(q.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                              title="Remover pergunta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Rodapé Fixo / Sempre à Mostra */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] py-2 sm:py-3">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-around gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Relatórios Salvos</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 sm:ml-1 ${
                activeTab === 'reports' ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {reports.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'teachers'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Professores</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 sm:ml-1 ${
                activeTab === 'teachers' ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {teachers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              <ListPlus className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                Formulário<span className="hidden sm:inline"> / Perguntas</span>
              </span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 sm:ml-1 ${
                activeTab === 'questions' ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {questions.length}
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* BLOCO FLUTUANTE NO MEIO DA TELA (MODAL DO RELATÓRIO) */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Bloco Flutuante */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    Enviado em: {new Date(selectedReport.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {selectedReport.teacherName}
                </h3>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Disciplina:</span> {selectedReport.subject} • <span className="font-medium text-slate-700">Turma:</span> {selectedReport.className}
                </p>
              </div>
            </div>

            {/* Conteúdo com Perguntas e Respostas */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">
              {questions.map((question, index) => {
                const answer = selectedReport.answers[question.id];
                return (
                  <div key={question.id} className="space-y-2 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md mt-0.5 shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                          {question.section}
                        </span>
                        <h4 className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                          {question.text}
                        </h4>
                      </div>
                    </div>
                    <div className="ml-8 bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {answer && answer.trim() ? (
                        answer
                      ) : (
                        <span className="text-slate-400 italic">Não respondido pelo professor</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Exibir respostas órfãs caso existam */}
              {Object.entries(selectedReport.answers).map(([qId, answer]) => {
                if (questions.some(q => q.id === qId)) return null;
                return (
                  <div key={qId} className="space-y-2 border-b border-slate-100 pb-5">
                    <h4 className="text-sm font-semibold text-slate-700">Pergunta anterior:</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 whitespace-pre-wrap">
                      {answer}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Deseja realmente excluir este relatório de ${selectedReport.teacherName}?`)) {
                    removeReport(selectedReport.id);
                    setSelectedReport(null);
                  }
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Relatório
              </button>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
