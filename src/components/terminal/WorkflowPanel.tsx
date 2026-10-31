import { useState, useEffect, useCallback } from 'react';
import { X, Play, ChevronRight, CheckCircle, Circle, Trophy } from 'lucide-react';
import { WORKFLOWS, type Workflow, type WorkflowStep, getWorkflowById } from './workflowData';
import { useApp } from '../../context/AppContext';

interface WorkflowPanelProps {
  onCommand: (cmd: string) => void;
  onClose: () => void;
  lastOutput: string;
  language: string;
}

// Écran de sélection des workflows
function WorkflowSelector({
  onSelect,
  language,
}: {
  onSelect: (id: string) => void;
  language: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid #1e293b' }}>
        <p className="text-xs font-semibold" style={{ color: '#64748b' }}>
          {language === 'fr' ? 'Choisir un workflow guidé' : 'Choose a guided workflow'}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {WORKFLOWS.map(w => (
          <button
            key={w.id}
            onClick={() => onSelect(w.id)}
            className="w-full text-left p-3 rounded-lg transition-colors group"
            style={{ background: '#0f172a', border: '1px solid #1e293b' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#1e293b')}
            type="button"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{w.emoji}</span>
              <p className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>{w.title}</p>
              <span
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-medium"
                style={{ background: '#052e16', color: '#4ade80' }}
              >
                🟢 {w.steps.length} {language === 'fr' ? 'étapes' : 'steps'}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#64748b' }}>{w.description}</p>
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={10} style={{ color: 'var(--gold)' }} />
              <span className="text-[10px]" style={{ color: 'var(--gold)' }}>
                {language === 'fr' ? 'Démarrer ce workflow' : 'Start workflow'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Écran de félicitations
function CompletionScreen({
  workflow,
  onClose,
  onNextWorkflow,
  language,
}: {
  workflow: Workflow;
  onClose: () => void;
  onNextWorkflow?: (id: string) => void;
  language: string;
}) {
  const next = workflow.nextWorkflowId ? getWorkflowById(workflow.nextWorkflowId) : undefined;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-bg)', border: '2px solid var(--gold-border)' }}>
        <Trophy size={28} style={{ color: 'var(--gold)' }} />
      </div>
      <div>
        <p className="text-sm font-bold mb-2" style={{ color: 'var(--gold)' }}>
          {language === 'fr' ? 'Workflow terminé !' : 'Workflow complete!'}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
          {workflow.completionMessage}
        </p>
      </div>
      {next && (
        <button
          onClick={() => onNextWorkflow?.(next.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
          type="button"
        >
          {next.emoji} {next.title}
          <ChevronRight size={12} />
        </button>
      )}
      <button
        onClick={onClose}
        className="text-xs transition-colors"
        style={{ color: '#475569' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}
        type="button"
      >
        {language === 'fr' ? 'Fermer' : 'Close'}
      </button>
    </div>
  );
}

// Écran d'exécution du workflow
function WorkflowRunner({
  workflow,
  lastOutput,
  onCommand,
  onComplete,
  language,
}: {
  workflow: Workflow;
  lastOutput: string;
  onCommand: (cmd: string) => void;
  onComplete: () => void;
  language: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showValidate, setShowValidate] = useState(false);
  const [executing, setExecuting] = useState(false);

  const currentStep: WorkflowStep | undefined = workflow.steps[currentIndex];
  const isLastStep = currentIndex === workflow.steps.length - 1;

  const advance = useCallback(() => {
    if (!currentStep) return;
    setCompletedIds(prev => new Set([...prev, currentStep.id]));
    setShowValidate(false);
    setExecuting(false);
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [currentStep, isLastStep, onComplete]);

  // Auto-détection du succès via successPatterns
  useEffect(() => {
    if (!executing || !currentStep?.successPatterns || !lastOutput) return;
    const matched = currentStep.successPatterns.some(p => p.test(lastOutput));
    if (matched) {
      const timer = setTimeout(advance, 600);
      return () => clearTimeout(timer);
    }
  }, [lastOutput, currentStep, executing, advance]);

  // Afficher le bouton "Valider" après 1.8s d'exécution (si pas d'auto-détection)
  useEffect(() => {
    if (!executing) return;
    const timer = setTimeout(() => setShowValidate(true), 1800);
    return () => clearTimeout(timer);
  }, [executing, currentIndex]);

  const handleExecute = () => {
    if (!currentStep) return;
    onCommand(currentStep.command);
    setExecuting(true);
    setShowValidate(false);
  };

  if (!currentStep) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Progression */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #1e293b' }}>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold" style={{ color: '#64748b' }}>
            {workflow.emoji} {workflow.title}
          </p>
          <p className="text-[10px]" style={{ color: '#334155' }}>
            {currentIndex + 1}/{workflow.steps.length}
          </p>
        </div>
        <div className="flex gap-1">
          {workflow.steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                background: i < currentIndex ? '#4ade80'
                  : i === currentIndex ? 'var(--gold)'
                  : '#1e293b',
              }}
            />
          ))}
        </div>
      </div>

      {/* Liste des étapes */}
      <div className="flex-1 overflow-y-auto py-1">
        {workflow.steps.map((step, i) => {
          const isDone = completedIds.has(step.id);
          const isActive = i === currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div
              key={step.id}
              className="px-3 py-2"
              style={{
                borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                opacity: isFuture ? 0.4 : 1,
              }}
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">
                  {isDone
                    ? <CheckCircle size={13} style={{ color: '#4ade80' }} />
                    : isActive
                      ? <Circle size={13} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                      : <Circle size={13} style={{ color: '#1e293b' }} />
                  }
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold" style={{ color: isActive ? 'var(--gold)' : isDone ? '#4ade80' : '#475569' }}>
                    {step.title}
                  </p>

                  {isActive && (
                    <>
                      <p className="text-[10px] mt-1 leading-relaxed" style={{ color: '#94a3b8' }}>
                        {step.description}
                      </p>

                      <div
                        className="my-2 px-2 py-1.5 rounded font-mono text-[11px] break-all"
                        style={{ background: '#060d1a', border: '1px solid #1e293b', color: '#4ade80' }}
                      >
                        $ {step.command}
                      </div>

                      {step.hint && (
                        <p className="text-[10px] mb-2 leading-relaxed" style={{ color: '#475569' }}>
                          💡 {step.hint}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExecute}
                          disabled={executing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                          style={{
                            background: executing ? '#1e293b' : 'var(--gold-bg)',
                            color: executing ? '#475569' : 'var(--gold)',
                            border: `1px solid ${executing ? '#1e293b' : 'var(--gold-border)'}`,
                          }}
                          type="button"
                        >
                          <Play size={10} />
                          {executing
                            ? (language === 'fr' ? 'En cours...' : 'Running...')
                            : (language === 'fr' ? 'Exécuter' : 'Execute')}
                        </button>

                        {showValidate && (
                          <button
                            onClick={advance}
                            className="flex items-center gap-1 text-[10px] transition-colors"
                            style={{ color: '#475569' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}
                            type="button"
                          >
                            {language === 'fr' ? 'Passer →' : 'Skip →'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Composant principal WorkflowPanel
export function WorkflowPanel({ onCommand, onClose, lastOutput, language }: WorkflowPanelProps) {
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const { showToast } = useApp();

  const activeWorkflow = activeWorkflowId ? getWorkflowById(activeWorkflowId) : undefined;

  const handleStart = (id: string) => {
    setActiveWorkflowId(id);
    setCompleted(false);
  };

  const handleComplete = () => {
    setCompleted(true);
    const wf = activeWorkflowId ? getWorkflowById(activeWorkflowId) : undefined;
    const msg = wf
      ? (language === 'fr' ? `🏆 Workflow "${wf.title}" terminé !` : `🏆 Workflow "${wf.title}" complete!`)
      : (language === 'fr' ? '🏆 Workflow terminé !' : '🏆 Workflow complete!');
    showToast('success', msg, 5000);
  };

  const handleNextWorkflow = (id: string) => {
    setActiveWorkflowId(id);
    setCompleted(false);
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ background: '#0f172a', border: '1px solid #1e293b' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 shrink-0"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
      >
        <p className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>
          {language === 'fr' ? '🧭 Workflows guidés' : '🧭 Guided workflows'}
        </p>
        <div className="flex items-center gap-2">
          {activeWorkflowId && !completed && (
            <button
              onClick={() => { setActiveWorkflowId(null); setCompleted(false); }}
              className="text-[10px] transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}
              type="button"
            >
              {language === 'fr' ? '← Retour' : '← Back'}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: '#475569' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f87171')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}
            type="button"
            title={language === 'fr' ? 'Fermer les workflows' : 'Close workflows'}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {!activeWorkflow ? (
          <WorkflowSelector onSelect={handleStart} language={language} />
        ) : completed ? (
          <CompletionScreen
            workflow={activeWorkflow}
            onClose={onClose}
            onNextWorkflow={handleNextWorkflow}
            language={language}
          />
        ) : (
          <WorkflowRunner
            key={activeWorkflowId ?? undefined}
            workflow={activeWorkflow}
            lastOutput={lastOutput}
            onCommand={onCommand}
            onComplete={handleComplete}
            language={language}
          />
        )}
      </div>
    </div>
  );
}
