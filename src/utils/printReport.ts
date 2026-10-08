import { Report, Question } from '../store';

export interface TurmaPrintData {
  grade: string;
  letter: string;
  participatingTeachers: {
    teacherName: string;
    subject: string;
    date: string;
  }[];
  categories: {
    index: number;
    name: string;
    questions: {
      id: string;
      text: string;
      answers: {
        teacherName: string;
        subject: string;
        date: string;
        text: string;
      }[];
    }[];
  }[];
}

/**
 * Generates standalone, print-optimized HTML for the consolidated class report.
 */
export function generateTurmaPrintHTML(data: TurmaPrintData): string {
  const { grade, letter, participatingTeachers, categories } = data;
  const now = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const teachersHTML = participatingTeachers.length > 0 
    ? `
      <div class="teachers-section">
        <div class="teachers-title">Professores Participantes por Disciplina (${participatingTeachers.length})</div>
        <div class="teachers-grid">
          ${participatingTeachers.map(t => `
            <div class="teacher-item">
              <span class="teacher-name">Prof(a). ${escapeHtml(t.teacherName)}</span>
              <span class="teacher-subject">${escapeHtml(t.subject)}</span>
              ${t.date ? `<span class="teacher-date">${new Date(t.date).toLocaleDateString('pt-BR')}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `
    : `
      <div class="teachers-section empty">
        <div class="teachers-title">Nenhum professor registrou respostas para esta turma até o momento.</div>
        <p style="margin: 4px 0 0 0; font-size: 8.5pt; color: #64748b;">(Modelo para preenchimento manual no Conselho de Classe)</p>
      </div>
    `;

  const categoriesHTML = categories.map(cat => {
    const questionsHTML = cat.questions.map((q, qIdx) => {
      const answersHTML = q.answers.length > 0
        ? `
          <div class="answers-container">
            ${q.answers.map(ans => `
              <div class="answer-card">
                <div class="answer-header">
                  <span class="answer-author">Prof(a). ${escapeHtml(ans.teacherName)} — <strong>${escapeHtml(ans.subject)}</strong></span>
                  ${ans.date ? `<span class="answer-date">${new Date(ans.date).toLocaleDateString('pt-BR')}</span>` : ''}
                </div>
                <div class="answer-body">${escapeHtml(ans.text)}</div>
              </div>
            `).join('')}
          </div>
        `
        : `
          <div class="empty-answer">
            Nenhuma resposta registrada para esta pergunta.
          </div>
        `;

      return `
        <div class="question-block">
          <div class="question-title">
            <span class="question-number">${cat.index}.${qIdx + 1}</span>
            <span>${escapeHtml(q.text)}</span>
          </div>
          ${answersHTML}
        </div>
      `;
    }).join('');

    return `
      <div class="category-block">
        <div class="category-header">
          <span class="category-badge">${cat.index}</span>
          <span class="category-name">${escapeHtml(cat.name)}</span>
        </div>
        <div class="category-content">
          ${questionsHTML}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Relatório de Pré-Conselho — Turma ${grade} ${letter}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #0f172a;
          margin: 0;
          padding: 8px;
          background: #ffffff;
        }
        .header {
          border-bottom: 2.5px solid #2563eb;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .header-left {
          flex: 1;
        }
        .school-badge {
          font-size: 8pt;
          font-weight: 800;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }
        .header-title {
          font-size: 13.5pt;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 3px 0;
          letter-spacing: -0.2px;
        }
        .header-subtitle {
          font-size: 10.5pt;
          font-weight: 700;
          color: #1d4ed8;
          margin: 0;
        }
        .header-meta {
          text-align: right;
          font-size: 8.5pt;
          color: #64748b;
          white-space: nowrap;
        }
        .header-tag {
          display: inline-block;
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          border-radius: 4px;
          padding: 3px 8px;
          font-weight: 700;
          font-size: 9pt;
          margin-bottom: 4px;
        }
        .teachers-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 16px;
          page-break-inside: avoid;
        }
        .teachers-section.empty {
          border-style: dashed;
          text-align: center;
          padding: 12px;
        }
        .teachers-title {
          font-size: 8.5pt;
          font-weight: 800;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .teachers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px 12px;
        }
        .teacher-item {
          font-size: 8.5pt;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          padding: 4px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        .teacher-name {
          font-weight: 700;
          color: #0f172a;
        }
        .teacher-subject {
          background: #2563eb;
          color: #ffffff;
          font-size: 7.5pt;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 3px;
        }
        .teacher-date {
          margin-left: auto;
          font-size: 7.5pt;
          color: #64748b;
        }
        .category-block {
          margin-bottom: 18px;
          page-break-inside: avoid;
        }
        .category-header {
          background-color: #1e40af !important;
          color: #ffffff !important;
          padding: 6px 12px;
          border-radius: 5px;
          font-weight: 800;
          font-size: 10pt;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          letter-spacing: 0.2px;
        }
        .category-badge {
          background: rgba(255, 255, 255, 0.25);
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 8.5pt;
          font-weight: 900;
        }
        .category-name {
          text-transform: uppercase;
        }
        .question-block {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 10px;
          background: #ffffff;
          page-break-inside: avoid;
        }
        .question-title {
          font-weight: 700;
          font-size: 9.5pt;
          color: #0f172a;
          margin-bottom: 8px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }
        .question-number {
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 8pt;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 3px;
          border: 1px solid #bfdbfe;
          shrink: 0;
        }
        .answers-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .answer-card {
          background: #f8fafc;
          border-left: 3.5px solid #2563eb;
          padding: 6px 10px;
          border-radius: 3px;
          border-top: 1px solid #f1f5f9;
          border-right: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }
        .answer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8.5pt;
          margin-bottom: 3px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 2px;
        }
        .answer-author {
          color: #1e3a8a;
          font-weight: 600;
        }
        .answer-date {
          font-size: 7.5pt;
          color: #64748b;
        }
        .answer-body {
          font-size: 9pt;
          color: #1e293b;
          white-space: pre-wrap;
          line-height: 1.4;
        }
        .empty-answer {
          font-size: 8.5pt;
          font-style: italic;
          color: #94a3b8;
          padding: 4px 6px;
        }
        .deliberations-box {
          border: 1.5px dashed #94a3b8;
          border-radius: 6px;
          padding: 10px 14px;
          margin-top: 20px;
          page-break-inside: avoid;
        }
        .deliberations-title {
          font-size: 9pt;
          font-weight: 800;
          text-transform: uppercase;
          color: #334155;
          margin-bottom: 6px;
        }
        .deliberations-lines {
          height: 60px;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 19px,
            #e2e8f0 20px
          );
        }
        .signatures-area {
          margin-top: 35px;
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          page-break-inside: avoid;
        }
        .sig-block {
          flex: 1;
          text-align: center;
        }
        .sig-line {
          border-top: 1px solid #475569;
          margin-bottom: 4px;
        }
        .sig-role {
          font-size: 8pt;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <!-- Cabeçalho Oficial -->
      <div class="header">
        <div class="header-top">
          <div class="header-left">
            <div class="school-badge">Conselho de Classe Participativo</div>
            <h1 class="header-title">Ficha Integrada de Pré-Conselho</h1>
            <p class="header-subtitle">Turma: <strong>${escapeHtml(grade)} ${escapeHtml(letter)}</strong></p>
          </div>
          <div class="header-meta">
            <div class="header-tag">Ano Letivo ${new Date().getFullYear()}</div>
            <div>Emitido em: ${now}</div>
            <div>Professores: <strong>${participatingTeachers.length}</strong></div>
          </div>
        </div>
      </div>

      <!-- Resumo dos Professores -->
      ${teachersHTML}

      <!-- Categorias com Perguntas e Respostas -->
      ${categoriesHTML}

      <!-- Espaço para Deliberações do Conselho -->
      <div class="deliberations-box">
        <div class="deliberations-title">Deliberações e Encaminhamentos Registrados no Conselho:</div>
        <div class="deliberations-lines"></div>
      </div>

      <!-- Assinaturas -->
      <div class="signatures-area">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-role">Direção Escolar</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-role">Coordenação Pedagógica</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-role">Representante dos Professores</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Triggers the print dialog reliably using an isolated hidden iframe with complete standalone HTML.
 * Automatically falls back to standard window.print() if iframe printing fails.
 */
export function printTurmaConsolidatedReport(data: TurmaPrintData): boolean {
  try {
    const html = generateTurmaPrintHTML(data);

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.setAttribute('title', 'Impressão do Relatório');
    
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return true;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Give browser time to parse CSS and DOM before triggering print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print():', err);
        window.print();
      } finally {
        // Clean up the iframe after the print dialog finishes/closes
        setTimeout(() => {
          try {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (_) {}
        }, 1500);
      }
    }, 300);

    return true;
  } catch (error) {
    console.error('Print generation error:', error);
    window.print();
    return false;
  }
}

/**
 * Formats the entire consolidated report as clean structured plain text for clipboard copying.
 */
export function formatTurmaReportAsText(data: TurmaPrintData): string {
  const { grade, letter, participatingTeachers, categories } = data;
  const now = new Date().toLocaleDateString('pt-BR');
  
  const lines: string[] = [];
  lines.push('================================================================');
  lines.push(`CONSELHO DE CLASSE — FICHA INTEGRADA DE PRÉ-CONSELHO`);
  lines.push(`TURMA: ${grade} ${letter} | DATA DE EMISSÃO: ${now}`);
  lines.push('================================================================\n');

  lines.push(`PROFESSORES PARTICIPANTES (${participatingTeachers.length}):`);
  if (participatingTeachers.length === 0) {
    lines.push('(Nenhum professor enviou respostas ainda)\n');
  } else {
    participatingTeachers.forEach(t => {
      lines.push(`• Prof(a). ${t.teacherName} — Disciplina: ${t.subject}`);
    });
    lines.push('');
  }

  lines.push('----------------------------------------------------------------');
  lines.push('RESPOSTAS CONSOLIDADAS POR CATEGORIA E PERGUNTA');
  lines.push('----------------------------------------------------------------\n');

  categories.forEach(cat => {
    lines.push(`\n[ CATEGORIA ${cat.index}: ${cat.name.toUpperCase()} ]\n`);

    cat.questions.forEach((q, qIdx) => {
      lines.push(`Pergunta ${cat.index}.${qIdx + 1}: ${q.text}`);
      
      if (q.answers.length === 0) {
        lines.push('  (Sem respostas registradas para esta pergunta)\n');
      } else {
        q.answers.forEach(ans => {
          lines.push(`  ➤ Prof(a). ${ans.teacherName} [${ans.subject}]:`);
          lines.push(`     "${ans.text.replace(/\n/g, '\n     ')}"`);
        });
        lines.push('');
      }
    });
  });

  lines.push('\n================================================================');
  lines.push('ENCAMINHAMENTOS DO CONSELHO DE CLASSE:');
  lines.push('[ ___________________________________________________________ ]');
  lines.push('================================================================');

  return lines.join('\n');
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
