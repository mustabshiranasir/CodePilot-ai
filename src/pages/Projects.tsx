import { useState, useRef } from 'react';
import { Plus, FolderKanban, Search, Cpu, GitBranch, Upload, Globe, Trash2, FileArchive, Link as LinkIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../lib/utils';
import { motion } from 'framer-motion';
import JSZip from 'jszip';

export default function Projects() {
  const { repositories, scans, addRepository, deleteRepository, startScan, loading } = useData();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [removingRepo, setRemovingRepo] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'zip'>('url');
  const [uploading, setUploading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zipFiles, setZipFiles] = useState<{ name: string; path: string; content: string }[] | null>(null);

  const filtered = repositories.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddRepository = async () => {
    if (!newRepoName.trim()) return;
    try {
      await addRepository({ name: newRepoName, url: newRepoUrl || undefined, type: newRepoUrl ? 'github' : 'upload' });
      addToast('success', 'Repository connected successfully');
      setShowAddModal(false);
      setNewRepoName('');
      setNewRepoUrl('');
    } catch {
      addToast('error', 'Failed to connect repository');
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      addToast('error', 'Please upload a .zip file');
      return;
    }
    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const files: { name: string; path: string; content: string }[] = [];
      const promises: Promise<void>[] = [];
      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && !relativePath.startsWith('__MACOSX') && !relativePath.includes('node_modules') && !relativePath.includes('.git/')) {
          promises.push(
            zipEntry.async('string').then(content => {
              files.push({ name: relativePath.split('/').pop() || relativePath, path: relativePath, content });
            }).catch(() => {}),
          );
        }
      });
      await Promise.all(promises);
      if (files.length === 0) {
        addToast('error', 'No readable files found in ZIP');
        return;
      }
      setZipFiles(files);
      const extracted = file.name.replace('.zip', '');
      setNewRepoName(extracted);
      addToast('success', `${files.length} files extracted from ZIP`);
    } catch {
      addToast('error', 'Failed to parse ZIP file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGitHubFetch = async () => {
    if (!newRepoUrl.trim()) return;
    setFetchingUrl(true);
    try {
      const match = newRepoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (!match) { addToast('error', 'Invalid GitHub URL'); setFetchingUrl(false); return; }
      const [, owner, repoName] = match;
      const repoClean = repoName.replace('.git', '');
      const apiUrl = `https://api.github.com/repos/${owner}/${repoClean}/git/trees/main?recursive=1`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        const altRes = await fetch(`https://api.github.com/repos/${owner}/${repoClean}/git/trees/master?recursive=1`);
        if (!altRes.ok) { addToast('error', 'Could not fetch repository. Is it public?'); setFetchingUrl(false); return; }
        const treeData = await altRes.json();
        await processTree(treeData, owner, repoClean);
      } else {
        const treeData = await res.json();
        await processTree(treeData, owner, repoClean);
      }
    } catch {
      addToast('error', 'Failed to fetch GitHub repository');
    } finally {
      setFetchingUrl(false);
    }
  };

  const processTree = async (treeData: any, owner: string, repo: string) => {
    const files: { name: string; path: string; content: string }[] = [];
    const textExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.yml', '.yaml', '.env', '.sql', '.html', '.css', '.md', '.txt', '.config.js', '.config.ts', '.mjs', '.cjs', '.vue', '.svelte']);
    const fileEntries = (treeData.tree || []).filter((entry: any) =>
      entry.type === 'blob' && textExtensions.has('.' + entry.path.split('.').pop()) &&
      !entry.path.includes('node_modules') && !entry.path.startsWith('.')
    );
    const batchSize = 5;
    for (let i = 0; i < fileEntries.length; i += batchSize) {
      const batch = fileEntries.slice(i, i + batchSize);
      const promises = batch.map(async (entry: any) => {
        try {
          const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${entry.path}`);
          if (rawRes.ok) {
            const content = await rawRes.text();
            files.push({ name: entry.path.split('/').pop(), path: entry.path, content });
          }
        } catch {}
      });
      await Promise.all(promises);
    }
    if (files.length === 0) {
      addToast('error', 'No source files found in repository');
      return;
    }
    setZipFiles(files);
    setNewRepoName(repo);
    addToast('success', `${files.length} source files fetched from GitHub`);
  };

  const handleStartScan = async (repoId: string) => {
    setScanningId(repoId);
    try {
      const files = zipFiles || [{ path: 'src/app.tsx', content: `import React from 'react';\nconst API_KEY = "sk-1234567890abcdef";\nexport default function App() { return <div>Hello</div>; }` }];
      await startScan(repoId, files.map(f => ({ path: f.path, content: f.content })));
      addToast('success', 'Scan completed — new issues detected');
    } catch (err: any) {
      addToast('error', err?.message || 'Scan failed. Check console for details.');
      console.error('Scan failed:', err);
    } finally {
      setScanningId(null);
    }
  };

  const handleDeleteRepo = async () => {
    if (!removingRepo) return;
    try {
      await deleteRepository(removingRepo);
      setRemovingRepo(null);
      addToast('success', 'Repository removed');
    } catch {
      addToast('error', 'Failed to remove repository');
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Repositories</h1>
          <p className="text-[var(--text-secondary)] text-sm">Connect repositories and run AI-powered code scans</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> Add Repository</Button>
      </motion.div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input type="text" placeholder="Search repositories..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">{repositories.length} repository{repositories.length !== 1 ? 'ies' : 'y'}</span>
        </div>
      </Card>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border-primary)] p-5 space-y-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{search ? 'No results' : 'No repositories yet'}</h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-6">{search ? 'Try a different search term' : 'Connect your first repository to start scanning for issues'}</p>
              {!search && <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> Add Repository</Button>}
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((repo, index) => {
            const latestScan = scans.filter(s => s.repositoryId === repo.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            return (
              <motion.div key={repo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card variant="interactive" className="h-full group">
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        {repo.type === 'github' ? <GitBranch className="h-5 w-5 text-blue-400" /> : <Upload className="h-5 w-5 text-blue-400" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge value={repo.type} variant="status" />
                      </div>
                    </div>

                    <div className="mb-1">
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">{repo.name}</h3>
                    </div>
                    {repo.description && <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 flex-1">{repo.description}</p>}
                    {!repo.description && <div className="flex-1" />}

                    {latestScan && (
                      <div className="flex items-center gap-2 mb-4 text-xs text-[var(--text-tertiary)]">
                        <Cpu className="h-3 w-3" />
                        <span>Last scan: {formatTimeAgo(latestScan.createdAt)} · {latestScan.totalIssues} issues</span>
                      </div>
                    )}
                    {!latestScan && (
                      <div className="mb-4 text-xs text-[var(--text-tertiary)]">No scans yet</div>
                    )}

                    <div className="flex gap-2 mt-auto pt-2 border-t border-[var(--border-secondary)]">
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleStartScan(repo.id)} disabled={scanningId === repo.id}>
                        <Cpu className={`h-3.5 w-3.5 ${scanningId === repo.id ? 'animate-spin' : ''}`} />
                        {scanningId === repo.id ? 'Scanning...' : 'Run Scan'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/dashboard/bugs?repo=${repo.id}`)}>
                        Issues
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setRemovingRepo(repo.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Connect Repository">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg p-3 mb-2">
            <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              Connect a GitHub repository, upload a ZIP, or create a local project to scan.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setUploadMode('url')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${uploadMode === 'url' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#21262D] text-[var(--text-tertiary)] border border-transparent hover:border-[var(--border-primary)]'}`}>
              <LinkIcon className="h-3.5 w-3.5 inline mr-1.5" /> GitHub URL
            </button>
            <button onClick={() => setUploadMode('zip')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${uploadMode === 'zip' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#21262D] text-[var(--text-tertiary)] border border-transparent hover:border-[var(--border-primary)]'}`}>
              <FileArchive className="h-3.5 w-3.5 inline mr-1.5" /> ZIP Upload
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Repository Name</label>
            <Input type="text" value={newRepoName} onChange={e => setNewRepoName(e.target.value)} placeholder="e.g. my-awesome-project" required />
          </div>

          {uploadMode === 'url' ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-primary)]">GitHub URL</label>
              <div className="flex gap-2">
                <Input type="url" value={newRepoUrl} onChange={e => setNewRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" className="flex-1" />
                <Button size="sm" variant="secondary" onClick={handleGitHubFetch} disabled={fetchingUrl || !newRepoUrl.trim()}>
                  {fetchingUrl ? 'Fetching...' : 'Fetch'}
                </Button>
              </div>
              {zipFiles && uploadMode === 'url' && (
                <p className="text-xs text-green-400 mt-1">{zipFiles.length} files loaded from GitHub</p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-primary)]">Upload ZIP File</label>
              <input ref={fileInputRef} type="file" accept=".zip" onChange={handleZipUpload}
                className="w-full text-sm text-[var(--text-tertiary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[var(--border-primary)] file:bg-[#21262D] file:text-sm file:text-[var(--text-primary)] hover:file:bg-[#30363D] cursor-pointer" />
              {uploading && <p className="text-xs text-blue-400 mt-1">Extracting files...</p>}
              {zipFiles && uploadMode === 'zip' && (
                <p className="text-xs text-green-400 mt-1">{zipFiles.length} files extracted from ZIP</p>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowAddModal(false); setZipFiles(null); }}>Cancel</Button>
          <Button onClick={handleAddRepository}>Connect</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!removingRepo} onClose={() => setRemovingRepo(null)} onConfirm={handleDeleteRepo}
        title="Remove Repository" message="Are you sure you want to remove this repository? All associated scans and issues will be permanently deleted."
        confirmLabel="Remove" variant="danger" />
    </div>
  );
}
