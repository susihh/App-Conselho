import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export type Role = 'director' | 'teacher' | null;

export interface Teacher {
  id: string;
  name: string;
  password: string;
}

export interface Question {
  id: string;
  section: string;
  text: string;
}

export interface Report {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  date: string;
  answers: Record<string, string>;
  createdAt?: string;
}

interface AppState {
  // Data
  directorPassword: string;
  teachers: Teacher[];
  questions: Question[];
  reports: Report[];
  isDatabaseReady: boolean;
  
  // Auth State
  currentUserRole: Role;
  currentTeacherId: string | null;

  // Actions
  loginDirector: (password: string) => boolean;
  loginTeacher: (id: string, password: string) => boolean;
  logout: () => void;
  
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Teacher;
  removeTeacher: (id: string) => void;
  
  addQuestion: (question: Omit<Question, 'id'>) => void;
  removeQuestion: (id: string) => void;
  
  addReport: (report: Omit<Report, 'id'>) => void;
  removeReport: (id: string) => void;
  clearAllReports: () => void;

  initSync: () => () => void;
}

const defaultQuestions: Question[] = [
  { id: 'q1', section: 'Panorama da Turma', text: 'Avaliação do desenvolvimento geral da turma em relação à aprendizagem' },
  { id: 'q2', section: 'Panorama da Turma', text: 'Nível de participação, envolvimento e postura dos estudantes nas aulas' },
  { id: 'q3', section: 'Aprendizagem e Frequência', text: 'Principais habilidades ou conteúdos que apresentam maior dificuldade para a turma' },
  { id: 'q4', section: 'Aprendizagem e Frequência', text: 'Lista de estudantes com baixa frequência ou que necessitam de acompanhamento mais próximo, indicando os motivos' },
  { id: 'q5', section: 'Destaques e Situações que Merecem Atenção', text: 'Estudantes que se destacaram positivamente (aprendizagem, participação, responsabilidade ou protagonismo)' },
  { id: 'q6', section: 'Destaques e Situações que Merecem Atenção', text: 'Estudantes que apresentam dificuldades significativas ou necessitam de intervenção/encaminhamento' },
  { id: 'q7', section: 'Encaminhamentos', text: 'Estratégias já realizadas e ações sugeridas para o próximo período' },
  { id: 'q8', section: 'Encaminhamentos', text: 'Observações importantes adicionais para o Pré-Conselho' },
  { id: 'q9', section: 'Síntese do Professor', text: 'Observação geral sobre a turma ou estudantes para apresentação no Conselho de Classe' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      directorPassword: '123',
      teachers: [],
      questions: defaultQuestions,
      reports: [],
      isDatabaseReady: false,
      
      currentUserRole: null,
      currentTeacherId: null,

      loginDirector: (password) => {
        if (password === '123' || password === get().directorPassword) {
          set({ currentUserRole: 'director', currentTeacherId: null, directorPassword: '123' });
          return true;
        }
        return false;
      },

      loginTeacher: (id, password) => {
        const teacher = get().teachers.find(t => t.id === id);
        if (teacher && (password === '123' || teacher.password === password)) {
          set({ currentUserRole: 'teacher', currentTeacherId: id });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUserRole: null, currentTeacherId: null });
      },

      addTeacher: (teacher) => {
        const newTeacher: Teacher = { ...teacher, id: crypto.randomUUID() };
        // Optimistic update
        set((state) => ({ teachers: [...state.teachers, newTeacher] }));

        // Sync to Firestore
        (async () => {
          try {
            await setDoc(doc(db, 'teachers', newTeacher.id), {
              name: newTeacher.name,
              password: newTeacher.password,
              createdAt: new Date().toISOString()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `teachers/${newTeacher.id}`);
          }
        })();

        return newTeacher;
      },

      removeTeacher: (id) => {
        set((state) => ({ teachers: state.teachers.filter(t => t.id !== id) }));
        (async () => {
          try {
            await deleteDoc(doc(db, 'teachers', id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `teachers/${id}`);
          }
        })();
      },

      addQuestion: (question) => {
        const newQuestion: Question = { ...question, id: crypto.randomUUID() };
        set((state) => ({ questions: [...state.questions, newQuestion] }));

        (async () => {
          try {
            await setDoc(doc(db, 'questions', newQuestion.id), {
              section: newQuestion.section,
              text: newQuestion.text,
              order: Date.now(),
              createdAt: new Date().toISOString()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `questions/${newQuestion.id}`);
          }
        })();
      },

      removeQuestion: (id) => {
        set((state) => ({ questions: state.questions.filter(q => q.id !== id) }));
        (async () => {
          try {
            await deleteDoc(doc(db, 'questions', id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `questions/${id}`);
          }
        })();
      },

      addReport: (report) => {
        const newReport: Report = { 
          ...report, 
          id: crypto.randomUUID(), 
          createdAt: new Date().toISOString() 
        };
        set((state) => ({ reports: [newReport, ...state.reports] }));

        (async () => {
          try {
            await setDoc(doc(db, 'reports', newReport.id), {
              teacherId: newReport.teacherId,
              teacherName: newReport.teacherName,
              subject: newReport.subject,
              className: newReport.className,
              date: newReport.date,
              answers: newReport.answers,
              createdAt: newReport.createdAt
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `reports/${newReport.id}`);
          }
        })();
      },

      removeReport: (id) => {
        set((state) => ({ reports: state.reports.filter(r => r.id !== id) }));
        (async () => {
          try {
            await deleteDoc(doc(db, 'reports', id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `reports/${id}`);
          }
        })();
      },

      clearAllReports: () => {
        const prevReports = get().reports;
        set({ reports: [] });

        (async () => {
          try {
            const batch = writeBatch(db);
            prevReports.forEach((r) => {
              batch.delete(doc(db, 'reports', r.id));
            });
            await batch.commit();
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, 'reports');
          }
        })();
      },

      initSync: () => {
        // Teachers listener
        const unsubTeachers = onSnapshot(
          collection(db, 'teachers'),
          async (snapshot) => {
            // Delete any existing default teacher doc from database if present
            snapshot.docs.forEach((d) => {
              const name = (d.data()?.name || '').toLowerCase();
              if (d.id === 'prof-1' || name.includes('padrão') || name.includes('padrao')) {
                deleteDoc(doc(db, 'teachers', d.id)).catch(() => {});
              }
            });

            const loadedTeachers: Teacher[] = snapshot.docs
              .filter((d) => {
                const name = (d.data()?.name || '').toLowerCase();
                return d.id !== 'prof-1' && !name.includes('padrão') && !name.includes('padrao');
              })
              .map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  name: data.name || '',
                  password: data.password || ''
                };
              });

            if (get().currentTeacherId === 'prof-1') {
              set({ currentTeacherId: null, currentUserRole: null });
            }

            set({ teachers: loadedTeachers });
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'teachers')
        );

        // Questions listener
        const unsubQuestions = onSnapshot(
          collection(db, 'questions'),
          async (snapshot) => {
            if (snapshot.empty) {
              // Seed default questions if empty
              try {
                const batch = writeBatch(db);
                defaultQuestions.forEach((q, index) => {
                  const qRef = doc(db, 'questions', q.id);
                  batch.set(qRef, {
                    section: q.section,
                    text: q.text,
                    order: index,
                    createdAt: new Date().toISOString()
                  });
                });
                await batch.commit();
              } catch {
                // Ignore seed error
              }
            } else {
              const loadedQuestions: (Question & { order?: number })[] = snapshot.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  section: data.section || '',
                  text: data.text || '',
                  order: typeof data.order === 'number' ? data.order : 0
                };
              });
              loadedQuestions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              set({ questions: loadedQuestions });
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'questions')
        );

        // Reports listener
        const unsubReports = onSnapshot(
          collection(db, 'reports'),
          (snapshot) => {
            // Remove any legacy reports created under "prof-1" or "Professor(a) Padrão"
            snapshot.docs.forEach((d) => {
              const data = d.data();
              const teacherName = (data?.teacherName || '').toLowerCase();
              if (data?.teacherId === 'prof-1' || teacherName.includes('padrão') || teacherName.includes('padrao')) {
                deleteDoc(doc(db, 'reports', d.id)).catch(() => {});
              }
            });

            const loadedReports: Report[] = snapshot.docs
              .filter((d) => {
                const data = d.data();
                const teacherName = (data?.teacherName || '').toLowerCase();
                return data?.teacherId !== 'prof-1' && !teacherName.includes('padrão') && !teacherName.includes('padrao');
              })
              .map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  teacherId: data.teacherId || '',
                  teacherName: data.teacherName || '',
                  subject: data.subject || '',
                  className: data.className || '',
                  date: data.date || '',
                  answers: data.answers || {},
                  createdAt: data.createdAt || ''
                };
              });
            // Sort by createdAt / date descending
            loadedReports.sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date));
            set({ reports: loadedReports, isDatabaseReady: true });
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'reports')
        );

        return () => {
          unsubTeachers();
          unsubQuestions();
          unsubReports();
        };
      }
    }),
    {
      name: 'pre-conselho-storage',
      partialize: (state) => ({
        currentUserRole: state.currentUserRole,
        currentTeacherId: state.currentTeacherId,
        directorPassword: state.directorPassword
      })
    }
  )
);
