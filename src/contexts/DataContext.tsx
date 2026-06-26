import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Project, Bug, ProjectMember } from '../types';


interface DataContextType {
  projects: Project[];
  bugs: Bug[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'bugCount' | 'memberCount' | 'progress' | 'members'> & { members: ProjectMember[]; progress: number }) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addBug: (bug: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBug: (id: string, data: Partial<Bug>) => void;
  deleteBug: (id: string) => void;
  moveBug: (id: string, newStatus: Bug['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const teamMembers: ProjectMember[] = [
  { id: 'm1', name: 'Alex Chen', avatar: 'AC', role: 'Lead Developer' },
  { id: 'm2', name: 'Sarah Kim', avatar: 'SK', role: 'Frontend Developer' },
  { id: 'm3', name: 'Marcus Johnson', avatar: 'MJ', role: 'Backend Developer' },
  { id: 'm4', name: 'Emily Rodriguez', avatar: 'ER', role: 'UI/UX Designer' },
  { id: 'm5', name: 'David Wilson', avatar: 'DW', role: 'DevOps Engineer' },
  { id: 'm6', name: 'Lisa Park', avatar: 'LP', role: 'QA Engineer' },
];

const initialProjects: Project[] = [
  { id: 'p1', name: 'Frontend App', description: 'React-based dashboard application with real-time updates and modern UI components.', status: 'active', progress: 72, bugCount: 23, memberCount: 4, members: [teamMembers[0], teamMembers[1], teamMembers[3], teamMembers[5]], createdAt: '2026-01-15', updatedAt: '2026-06-24' },
  { id: 'p2', name: 'API Gateway', description: 'Microservices API gateway service handling authentication and rate limiting.', status: 'active', progress: 45, bugCount: 12, memberCount: 3, members: [teamMembers[2], teamMembers[4], teamMembers[0]], createdAt: '2026-02-01', updatedAt: '2026-06-23' },
  { id: 'p3', name: 'Mobile App', description: 'React Native mobile application for iOS and Android platforms.', status: 'active', progress: 88, bugCount: 31, memberCount: 5, members: [teamMembers[1], teamMembers[3], teamMembers[2], teamMembers[5], teamMembers[0]], createdAt: '2026-03-10', updatedAt: '2026-06-24' },
  { id: 'p4', name: 'Legacy System', description: 'Legacy monolith migration project to modern microservices.', status: 'archived', progress: 100, bugCount: 5, memberCount: 2, members: [teamMembers[2], teamMembers[4]], createdAt: '2025-11-20', updatedAt: '2026-05-01' },
  { id: 'p5', name: 'Data Pipeline', description: 'Real-time data processing pipeline with Apache Kafka and Spark.', status: 'active', progress: 33, bugCount: 8, memberCount: 3, members: [teamMembers[4], teamMembers[2], teamMembers[0]], createdAt: '2026-04-05', updatedAt: '2026-06-22' },
  { id: 'p6', name: 'Design System', description: 'Shared UI component library built with Storybook and Tailwind.', status: 'completed', progress: 100, bugCount: 15, memberCount: 2, members: [teamMembers[3], teamMembers[1]], createdAt: '2026-05-01', updatedAt: '2026-06-20' },
];

const initialBugs: Bug[] = [
  { id: '1424', title: 'Memory leak in data processing pipeline', description: 'Users report increasing memory usage over time. Need to investigate the event loop and garbage collection patterns in the data processing module.', status: 'in_progress', priority: 'critical', projectId: 'p5', assignee: 'Marcus J.', dueDate: '2026-06-30', labels: ['backend', 'performance'], attachments: [], reporter: 'Alex C.', createdAt: '2026-06-24', updatedAt: '2026-06-24' },
  { id: '1423', title: 'Token expiration not handled gracefully', description: 'When JWT tokens expire, the app throws an unhandled exception instead of redirecting to login.', status: 'todo', priority: 'high', projectId: 'p1', assignee: 'Sarah K.', dueDate: '2026-06-28', labels: ['auth', 'frontend'], attachments: [], reporter: 'Lisa P.', createdAt: '2026-06-23', updatedAt: '2026-06-24' },
  { id: '1422', title: 'UI glitch on mobile navigation drawer', description: 'Navigation drawer overlaps with status bar on iOS devices when scrolling.', status: 'testing', priority: 'medium', projectId: 'p3', assignee: 'Emily R.', dueDate: '2026-06-26', labels: ['mobile', 'ui'], attachments: [], reporter: 'Sarah K.', createdAt: '2026-06-22', updatedAt: '2026-06-23' },
  { id: '1421', title: 'API rate limiting not working for authenticated routes', description: 'Rate limiter middleware incorrectly skips authenticated requests, allowing excessive API calls.', status: 'resolved', priority: 'high', projectId: 'p2', assignee: 'Marcus J.', dueDate: '2026-06-25', labels: ['backend', 'security'], attachments: [], reporter: 'David W.', createdAt: '2026-06-20', updatedAt: '2026-06-22' },
  { id: '1420', title: 'CSS overflow in settings panel', description: 'Long text in settings fields overflows the container on smaller screens.', status: 'closed', priority: 'low', projectId: 'p1', assignee: 'Emily R.', dueDate: '2026-06-18', labels: ['frontend', 'css'], attachments: [], reporter: 'Alex C.', createdAt: '2026-06-18', updatedAt: '2026-06-21' },
  { id: '1419', title: 'WebSocket connection drops after 5 minutes', description: 'WebSocket connections are being terminated after exactly 5 minutes of inactivity. Need to implement keepalive pings.', status: 'in_progress', priority: 'critical', projectId: 'p2', assignee: 'Alex C.', dueDate: '2026-06-27', labels: ['backend', 'realtime'], attachments: [], reporter: 'Marcus J.', createdAt: '2026-06-17', updatedAt: '2026-06-20' },
  { id: '1418', title: 'Database connection pool exhaustion', description: 'Under high load, database connections are not being returned to the pool, causing new requests to timeout.', status: 'resolved', priority: 'critical', projectId: 'p5', assignee: 'David W.', dueDate: '2026-06-22', labels: ['backend', 'database', 'performance'], attachments: [], reporter: 'Marcus J.', createdAt: '2026-06-15', updatedAt: '2026-06-19' },
  { id: '1417', title: 'Form validation errors not showing', description: 'Custom form components do not display validation error messages properly after submit.', status: 'todo', priority: 'high', projectId: 'p3', assignee: 'Sarah K.', dueDate: '2026-06-29', labels: ['frontend', 'forms'], attachments: [], reporter: 'Emily R.', createdAt: '2026-06-14', updatedAt: '2026-06-16' },
  { id: '1416', title: 'Search results pagination broken', description: 'Clicking next page on search results resets filters and shows incorrect data.', status: 'todo', priority: 'medium', projectId: 'p1', assignee: 'Sarah K.', dueDate: '2026-07-02', labels: ['frontend', 'search'], attachments: [], reporter: 'Lisa P.', createdAt: '2026-06-13', updatedAt: '2026-06-15' },
  { id: '1415', title: 'Dark mode toggle does not persist', description: 'Theme preference resets to light mode on page refresh in the settings panel.', status: 'testing', priority: 'low', projectId: 'p1', assignee: 'Emily R.', dueDate: '2026-06-25', labels: ['frontend', 'ui', 'theme'], attachments: [], reporter: 'David W.', createdAt: '2026-06-12', updatedAt: '2026-06-14' },
  { id: '1414', title: 'Push notifications delayed on Android', description: 'Push notifications arrive 5-10 minutes late on Android devices compared to iOS.', status: 'in_progress', priority: 'high', projectId: 'p3', assignee: 'Marcus J.', dueDate: '2026-07-01', labels: ['mobile', 'notifications'], attachments: [], reporter: 'Lisa P.', createdAt: '2026-06-11', updatedAt: '2026-06-13' },
  { id: '1413', title: 'File upload size limit not enforced', description: 'Backend does not enforce the 10MB file upload limit documented in the API spec.', status: 'todo', priority: 'medium', projectId: 'p2', assignee: 'Alex C.', dueDate: '2026-07-03', labels: ['backend', 'security', 'api'], attachments: [], reporter: 'David W.', createdAt: '2026-06-10', updatedAt: '2026-06-12' },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [bugs, setBugs] = useState<Bug[]>(initialBugs);

  const addProject = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'bugCount' | 'memberCount' | 'progress' | 'members'> & { members: ProjectMember[]; progress: number }) => {
    const now = new Date().toISOString().split('T')[0];
    const newProject: Project = {
      ...data,
      id: `p${Date.now()}`,
      bugCount: 0,
      memberCount: data.members.length,
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prev => [newProject, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setBugs(prev => prev.filter(b => b.projectId !== id));
  }, []);

  const addBug = useCallback((data: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBug: Bug = {
      ...data,
      id: (Math.max(...bugs.map(b => parseInt(b.id)), 1400) + 1).toString(),
      createdAt: now,
      updatedAt: now,
    };
    setBugs(prev => [newBug, ...prev]);
    setProjects(prev => prev.map(p => p.id === newBug.projectId ? { ...p, bugCount: p.bugCount + 1 } : p));
  }, [bugs]);

  const updateBug = useCallback((id: string, data: Partial<Bug>) => {
    setBugs(prev => prev.map(b => b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b));
  }, []);

  const deleteBug = useCallback((id: string) => {
    const bug = bugs.find(b => b.id === id);
    setBugs(prev => prev.filter(b => b.id !== id));
    if (bug) {
      setProjects(prev => prev.map(p => p.id === bug.projectId ? { ...p, bugCount: Math.max(0, p.bugCount - 1) } : p));
    }
  }, [bugs]);

  const moveBug = useCallback((id: string, newStatus: Bug['status']) => {
    setBugs(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b));
  }, []);

  return (
    <DataContext.Provider value={{ projects, bugs, addProject, updateProject, deleteProject, addBug, updateBug, deleteBug, moveBug }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
