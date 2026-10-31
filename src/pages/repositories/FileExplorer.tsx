import React, { useEffect, useState } from 'react';
import { Folder, FileText, ChevronRight, Upload, Plus, Download, Trash2, CreditCard as Edit3, AlertTriangle, Image, FileCode, File } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { MarkdownViewer } from '../../components/ui/MarkdownViewer';
import type { GitHubContent } from '../../types';

interface FileExplorerProps {
  owner: string;
  repo: string;
  defaultBranch?: string;
}

export function FileExplorer({ owner, repo, defaultBranch = 'main' }: FileExplorerProps) {
  const { api, t, showToast, confirm } = useApp();
  const [path, setPath] = useState('');
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [selectedFile, setSelectedFile] = useState<GitHubContent | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadContents = async (p: string) => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.repos.getContents(owner, repo, p || '.');
      const items = Array.isArray(data) ? data : [data];
      const sorted = [...items].sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
      setContents(sorted);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContents(path); }, [path, owner, repo]);

  const loadFile = async (file: GitHubContent) => {
    setSelectedFile(file);
    setFileLoading(true);
    setFileContent('');
    try {
      const data = await api!.repos.getContents(owner, repo, file.path) as GitHubContent;
      if (data.content && data.encoding === 'base64') {
        const decoded = decodeBase64(data.content);
        setFileContent(decoded);
      } else {
        setFileContent(t('files.binaryFile'));
      }
    } catch {
      setFileContent('');
    } finally {
      setFileLoading(false);
    }
  };

  const decodeBase64 = (b64: string): string => {
    try {
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(b64.replace(/\s/g, '')), (c: string) =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2),
          )
          .join(''),
      );
    } catch {
      return atob(b64.replace(/\s/g, ''));
    }
  };

  const isOnMainBranch = true;

  const pathParts = path.split('/').filter(Boolean);

  const handleNavigate = (item: GitHubContent) => {
    if (item.type === 'dir') {
      setPath(item.path);
      setSelectedFile(null);
    } else {
      loadFile(item);
    }
  };

  const handleDeleteFile = async (file: GitHubContent) => {
    const result = await confirm({
      title: t('files.delete.title'),
      message: t('files.delete.warning', { name: file.name }),
      severity: 'danger',
      confirmLabel: t('common.delete'),
    });
    if (!result.confirmed) return;
    try {
      await api!.repos.deleteFile(owner, repo, file.path, `Delete ${file.name}`, file.sha, defaultBranch);
      showToast('success', `"${file.name}" supprimé`);
      if (selectedFile?.path === file.path) setSelectedFile(null);
      loadContents(path);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const fileIcon = (name: string, type: string) => {
    if (type === 'dir') return <Folder size={16} className="text-amber-400" />;
    const ext = name.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext ?? '')) return <Image size={16} className="text-emerald-400" />;
    if (['js', 'ts', 'tsx', 'jsx', 'py', 'rb', 'go', 'rs', 'java', 'cpp', 'c', 'h', 'cs'].includes(ext ?? '')) return <FileCode size={16} className="text-sky-400" />;
    if (['md', 'txt', 'rst'].includes(ext ?? '')) return <FileText size={16} className="text-slate-400" />;
    return <File size={16} className="text-slate-500" />;
  };

  const isImage = (name: string) => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(name.split('.').pop()?.toLowerCase() ?? '');
  const isMarkdown = (name: string) => ['md', 'markdown'].includes(name.split('.').pop()?.toLowerCase() ?? '');

  return (
    <div className="flex gap-4 h-full min-h-0">
      <div className="w-72 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 flex-wrap">
            <button onClick={() => { setPath(''); setSelectedFile(null); }} className="hover:text-slate-300 transition-colors font-medium">
              {repo}
            </button>
            {pathParts.map((part, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={12} />
                <button
                  onClick={() => { setPath(pathParts.slice(0, i + 1).join('/')); setSelectedFile(null); }}
                  className="hover:text-slate-300 transition-colors"
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 mb-3">
          <Button size="sm" variant="secondary" icon={<Plus size={12} />} onClick={() => setNewFileOpen(true)} className="flex-1 text-xs">
            {t('files.newFile')}
          </Button>
          <Button size="sm" variant="ghost" icon={<Upload size={12} />} onClick={() => setUploadOpen(true)} />
        </div>

        {isOnMainBranch && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
            <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300/80">
              {t('files.editOnBranchWarning', { branch: defaultBranch })}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl">
          {loading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : error ? (
            <div className="p-3"><ErrorMessage error={error} onRetry={() => loadContents(path)} /></div>
          ) : (
            <ul>
              {path && (
                <li>
                  <button
                    onClick={() => {
                      const parent = pathParts.slice(0, -1).join('/');
                      setPath(parent);
                      setSelectedFile(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                  >
                    <Folder size={14} className="text-slate-600" />
                    ..
                  </button>
                </li>
              )}
              {contents.map((item) => (
                <li key={item.sha} className="group">
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors">
                    <button
                      onClick={() => handleNavigate(item)}
                      className={`flex-1 flex items-center gap-2.5 text-sm text-left min-w-0 ${selectedFile?.path === item.path ? 'text-sky-400' : 'text-slate-300'}`}
                    >
                      {fileIcon(item.name, item.type)}
                      <span className="truncate">{item.name}</span>
                    </button>
                    {item.type === 'file' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { loadFile(item); setEditOpen(true); }}
                          className="p-1 text-slate-600 hover:text-sky-400 rounded transition-colors"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(item)}
                          className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-600">
            <FileText size={32} className="mb-3 opacity-30" />
            <p className="text-sm">{t('files.title')}</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2">
                {fileIcon(selectedFile.name, selectedFile.type)}
                <span className="text-sm font-medium text-slate-200">{selectedFile.path}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedFile.download_url && (
                  <a
                    href={selectedFile.download_url}
                    download={selectedFile.name}
                    className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Download size={14} />
                  </a>
                )}
                <button
                  onClick={() => { setEditOpen(true); }}
                  className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteFile(selectedFile)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {fileLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-4" />)}
                </div>
              ) : isImage(selectedFile.name) ? (
                <img
                  src={selectedFile.download_url ?? ''}
                  alt={selectedFile.name}
                  className="max-w-full rounded"
                />
              ) : isMarkdown(selectedFile.name) ? (
                <MarkdownViewer content={fileContent} />
              ) : (
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {fileContent}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {editOpen && selectedFile && (
        <FileEditModal
          owner={owner}
          repo={repo}
          file={selectedFile}
          content={fileContent}
          defaultBranch={defaultBranch}
          onClose={() => setEditOpen(false)}
          onSaved={(newContent) => {
            setFileContent(newContent);
            setEditOpen(false);
            loadContents(path);
          }}
        />
      )}

      {newFileOpen && (
        <NewFileModal
          owner={owner}
          repo={repo}
          currentPath={path}
          defaultBranch={defaultBranch}
          onClose={() => setNewFileOpen(false)}
          onCreated={() => { setNewFileOpen(false); loadContents(path); }}
        />
      )}

      {uploadOpen && (
        <UploadFileModal
          owner={owner}
          repo={repo}
          currentPath={path}
          defaultBranch={defaultBranch}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => { setUploadOpen(false); loadContents(path); }}
        />
      )}
    </div>
  );
}

function FileEditModal({
  owner, repo, file, content, defaultBranch, onClose, onSaved,
}: {
  owner: string; repo: string; file: GitHubContent; content: string;
  defaultBranch: string; onClose: () => void; onSaved: (c: string) => void;
}) {
  const { api, t, showToast, confirm } = useApp();
  const [editContent, setEditContent] = useState(content);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!message.trim()) return;
    const result = await confirm({
      title: t('common.warning'),
      message: t('files.editOnBranchWarning', { branch: defaultBranch }),
      severity: 'warning',
      confirmLabel: t('common.save'),
    });
    if (!result.confirmed) return;

    setSaving(true);
    try {
      await api!.repos.createOrUpdateFile(owner, repo, file.path, editContent, message, file.sha, defaultBranch);
      showToast('success', t('files.saved'));
      onSaved(editContent);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`${t('files.editFile')} — ${file.name}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave} disabled={!message.trim()}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-72 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <Input
          label={t('files.editMessage')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('files.editMessagePlaceholder')}
          hint={t('files.editMessageHelp')}
          required
        />
      </div>
    </Modal>
  );
}

function NewFileModal({
  owner, repo, currentPath, defaultBranch, onClose, onCreated,
}: {
  owner: string; repo: string; currentPath: string; defaultBranch: string;
  onClose: () => void; onCreated: () => void;
}) {
  const { api, t, showToast } = useApp();
  const [filename, setFilename] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!filename.trim() || !message.trim()) return;
    setSaving(true);
    const fullPath = currentPath ? `${currentPath}/${filename}` : filename;
    try {
      await api!.repos.createOrUpdateFile(owner, repo, fullPath, fileContent, message, undefined, defaultBranch);
      showToast('success', t('files.saved'));
      onCreated();
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('files.newFile')} size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleCreate} disabled={!filename.trim() || !message.trim()}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input label={t('common.name')} value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="README.md" required />
        <Textarea label={t('common.description')} value={fileContent} onChange={(e) => setFileContent(e.target.value)} placeholder={t('files.editMessagePlaceholder')} rows={8} />
        <Input label={t('files.editMessage')} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('files.editMessagePlaceholder')} required />
      </div>
    </Modal>
  );
}

function UploadFileModal({
  owner, repo, currentPath, defaultBranch, onClose, onUploaded,
}: {
  owner: string; repo: string; currentPath: string; defaultBranch: string;
  onClose: () => void; onUploaded: () => void;
}) {
  const { api, t, showToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpload = async () => {
    if (!file || !message.trim()) return;
    setSaving(true);
    try {
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      const decoded = new TextDecoder().decode(new Uint8Array(await file.arrayBuffer()));
      await api!.repos.createOrUpdateFile(owner, repo, fullPath, decoded, message, undefined, defaultBranch);
      showToast('success', t('files.uploadSuccess'));
      onUploaded();
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('files.uploadFile')} size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleUpload} disabled={!file || !message.trim()}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('files.uploadFile')}</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:text-sm hover:file:bg-slate-600 file:cursor-pointer"
          />
        </div>
        <Input label={t('files.editMessage')} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('files.editMessagePlaceholder')} required />
      </div>
    </Modal>
  );
}
