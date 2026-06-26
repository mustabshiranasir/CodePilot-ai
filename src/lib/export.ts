import type { Bug, Project } from '../types';

export function exportBugsCSV(bugs: Bug[], projects: Project[]): void {
  const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Project', 'Assignee', 'Due Date', 'Labels', 'Reporter', 'Created', 'Updated'];
  const rows = bugs.map(b => {
    const project = projects.find(p => p.id === b.projectId);
    return [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.description.replace(/"/g, '""').substring(0, 200)}"`,
      b.status,
      b.priority,
      project?.name || 'Unknown',
      b.assignee,
      b.dueDate || '',
      b.labels.join('; '),
      b.reporter,
      b.createdAt,
      b.updatedAt,
    ].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, 'bugs-export.csv', 'text/csv');
}

export function exportProjectsCSV(projects: Project[]): void {
  const headers = ['Name', 'Description', 'Status', 'Progress', 'Bugs', 'Members', 'Created', 'Updated'];
  const rows = projects.map(p => [
    `"${p.name}"`,
    `"${p.description.replace(/"/g, '""').substring(0, 200)}"`,
    p.status,
    `${p.progress}%`,
    p.bugCount,
    p.memberCount,
    p.createdAt,
    p.updatedAt,
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, 'projects-export.csv', 'text/csv');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportBugsJSON(bugs: Bug[]): void {
  const json = JSON.stringify(bugs, null, 2);
  downloadFile(json, 'bugs-export.json', 'application/json');
}

export function printReport(title: string): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<html><head><title>${title}</title><style>body{font-family:system-ui;padding:2em;color:#111}h1{font-size:1.5em;margin-bottom:1em}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5}</style></head><body>`);
  win.document.write(`<h1>${title}</h1>`);
  win.document.write(document.getElementById('printable-report')?.innerHTML || '');
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}
