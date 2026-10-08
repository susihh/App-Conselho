import React, { useMemo, useState } from 'react';
import { Report, Question } from '../store';
import { 
  Printer, Trash2, CheckCircle2, Clock, 
  HelpCircle, MessageSquare, Eye, Users, FileText
} from 'lucide-react';

interface TurmaConsolidatedReportProps {
  grade: string;
  letter: string;
  reports: Report[];
  questions: Question[];
  searchQuery?: string;
  onDeleteReport: (reportId: string, subject: string, teacherName: string) => void;
  onViewReportModal?: (report: Report) => void;
}

export const TurmaConsolidatedReport: React.FC<TurmaConsolidatedReportProps> = ({
  grade,
  letter,
  reports,
  questions,
  searchQuery = '',
  onDeleteReport,
  onViewReportModal,
}) => {
  const [viewMode, setViewMode] = useState<'individual' | 'consolidated'>('individual');

  // Filter reports by search query if present
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(r => 
      (r.teacherName || '').toLowerCase().includes(q) ||
      (r.subject || '').toLowerCase().includes(q) ||
      Object.values(r.answers || {}).some(ans => typeof ans === 'string' && ans.toLowerCase().includes(q))
    );
  }, [reports, searchQuery]);

  // Unique list of participating teachers in this class
  const participatingTeachers = useMemo(() => {
    const list: { reportId: string; teacherName: string; subject: string; date: string; rawReport: Report }[] = [];
    filteredReports.forEach(r => {
      list.push({
        reportId: r.id,
        teacherName: r.teacherName || 'Professor não identificado',
        subject: r.subject || 'Disciplina não informada',
        date: r.date,
        rawReport: r
      });
    });
    return list;
  }, [filteredReports]);

  // Group questions by section/category
  const categories = useMemo(() => {
    const sectionsOrder: string[] = [];
    const map: Record<string, Question[]> = {};

    questions.forEach(q => {
      const sec = q.section?.trim() || 'Geral';
      if (!map[sec]) {
        map[sec] = [];
        sectionsOrder.push(sec);
      }
      map[sec].push(q);
    });

    return sectionsOrder.map((name, idx) => ({
      index: idx + 1,
      name,
      questions: map[name]
    }));
  }, [questions]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pt-1">
      {/* Cabeçalho do Relatório da Turma */}
      <div className="bg-white rounded-2xl border-2 border-blue-200/90 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs">
              {grade} {letter}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                  Turma {grade} {letter}
                </h4>
                {reports.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {participatingTeachers.length} {participatingTeachers.length === 1 ? 'professor participante' : 'professores participantes'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Aguardando respostas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Relatórios e respostas de pré-conselho dos professores desta turma.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 no-print">
            {reports.length > 0 && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                title="Imprimir relatório da turma"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Imprimir Relatório</span>
              </button>
            )}
          </div>
        </div>

        {/* Alternador de Modo de Visualização quando há relatórios */}
        {reports.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 no-print flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('individual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Por Professor Individual ({filteredReports.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('consolidated')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'consolidated'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Visão Consolidada por Categoria
            </button>
          </div>
        )}
      </div>

      {/* ESTADO VAZIO: Quando a turma ainda não tem nenhum envio */}
      {reports.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-slate-900 text-base">
              Nenhum professor enviou respostas para a Turma {grade} {letter} ainda
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Assim que os professores responderem o formulário no Painel do Professor selecionando a Turma <strong>{grade} {letter}</strong>, os relatórios aparecerão aqui.
            </p>
          </div>
        </div>
      )}

      {/* MODO 1: POR PROFESSOR INDIVIDUAL */}
      {reports.length > 0 && viewMode === 'individual' && (
        <div className="space-y-3">
          {filteredReports.map(report => {
            const answeredCount = Object.values(report.answers || {}).filter(
              ans => typeof ans === 'string' && ans.trim().length > 0
            ).length;

            return (
              <div 
                key={report.id} 
                className="p-4 sm:p-5 rounded-2xl border border-blue-200 bg-white hover:border-blue-400 transition-all shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-base text-slate-900">
                        Prof(a). {report.teacherName}
                      </h5>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                        {report.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Enviado em: {report.date ? new Date(report.date).toLocaleDateString('pt-BR') : 'Data não informada'} • {answeredCount} {answeredCount === 1 ? 'questão respondida' : 'questões respondidas'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onViewReportModal && (
                      <button
                        type="button"
                        onClick={() => onViewReportModal(report)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visualizar Relatório
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deseja realmente excluir o relatório de ${report.teacherName} (${report.subject}) da Turma ${grade} ${letter}?`)) {
                          onDeleteReport(report.id, report.subject, report.teacherName);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                      title="Excluir este relatório"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODO 2: VISÃO CONSOLIDADA POR CATEGORIA */}
      {reports.length > 0 && viewMode === 'consolidated' && (
        <div className="space-y-6">
          {categories.map(category => {
            return (
              <section
                key={category.name}
                className="bg-white rounded-2xl border-2 border-blue-200/90 shadow-2xs overflow-hidden"
              >
                {/* Cabeçalho da Categoria */}
                <div className="bg-blue-600 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white/20 text-white text-xs font-black flex items-center justify-center shrink-0 border border-white/30">
                      {category.index}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base tracking-wide">
                      {category.name}
                    </h3>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    {category.questions.length} {category.questions.length === 1 ? 'pergunta' : 'perguntas'}
                  </span>
                </div>

                {/* Perguntas da Categoria com as Respostas de Todos os Professores Juntas */}
                <div className="divide-y divide-slate-200">
                  {category.questions.map((question, qIdx) => {
                    const teacherAnswers = filteredReports
                      .map(report => ({
                        reportId: report.id,
                        teacherName: report.teacherName || 'Professor não identificado',
                        subject: report.subject || 'Disciplina não especificada',
                        date: report.date,
                        text: (report.answers && typeof report.answers[question.id] === 'string') 
                          ? report.answers[question.id].trim() 
                          : ''
                      }))
                      .filter(item => item.text.length > 0);

                    return (
                      <div key={question.id} className="p-4 sm:p-6 space-y-4 bg-white">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                            {category.index}.{qIdx + 1}
                          </div>
                          <div className="flex-1">
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                              Pergunta {category.index}.{qIdx + 1}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mt-0.5">
                              {question.text}
                            </h4>
                          </div>
                        </div>

                        <div className="ml-0 sm:ml-10 space-y-2.5">
                          {teacherAnswers.length === 0 ? (
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 italic flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>Nenhum professor desta turma registrou resposta para esta pergunta.</span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                <span>
                                  Respostas dos Professores ({teacherAnswers.length}):
                                </span>
                              </div>

                              {teacherAnswers.map(ans => (
                                <div
                                  key={ans.reportId}
                                  className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-blue-100/80 pb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                                        Prof(a). {ans.teacherName}
                                      </span>
                                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                                        {ans.subject}
                                      </span>
                                    </div>
                                    {ans.date && (
                                      <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                        Data: {new Date(ans.date).toLocaleDateString('pt-BR')}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pt-1">
                                    {ans.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
