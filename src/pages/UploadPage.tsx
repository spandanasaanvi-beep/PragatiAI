import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, Loader2, Tags, BrainCircuit, ListChecks, FileWarning } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { analyzeMaterial, generateQuiz } from '../services/aiService';
import { EmptyState, SectionTitle } from '../components/EmptyState';
import { UploadedMaterial } from '../types';

const ACCEPTED = ['.pdf', '.docx', '.pptx', '.txt'];
const MAX_SIZE_MB = 50;

const PROCESS_STEPS = [
  'Material uploaded',
  'Content analyzed',
  'Topics identified',
  'Competencies detected',
  'Quiz ready',
];

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, addMaterial, updateMaterial, setGeneratedQuiz, addActivity } = useAppContext();
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = state.materials.find((m) => m.id === activeId) ?? null;

  const validate = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return `Unable to process this file. Please upload PDF, DOCX, PPTX or TXT.`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return 'File size must not exceed 50 MB.';
    return null;
  };

  const handleFile = async (file: File) => {
    const err = validate(file);
    if (err) {
      notify('error', err);
      return;
    }

    const material: UploadedMaterial = {
      id: `mat-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'FILE',
      uploadedAt: new Date().toISOString(),
      processingStage: 0,
      status: 'processing',
      topics: [],
      detectedCompetencies: [],
    };
    addMaterial(material);
    setActiveId(material.id);
    setProcessingId(material.id);

    // Simulated processing pipeline (real impl: server-side text extraction + LLM analysis)
    for (let stage = 1; stage <= 4; stage++) {
      await new Promise((r) => setTimeout(r, 750));
      updateMaterial(material.id, { processingStage: stage });
    }

    const analysis = await analyzeMaterial(file.name);
    updateMaterial(material.id, {
      status: 'ready',
      topics: analysis.topics,
      detectedCompetencies: analysis.competencies,
    });
    addActivity('upload', `"${file.name}" uploaded and analyzed — ${analysis.topics.length} topics identified.`);
    setProcessingId(null);
    notify('success', 'Material processed successfully. Quiz is ready to generate.');
  };

  const generateQuizFromMaterial = async (material: UploadedMaterial) => {
    notify('info', 'Generating quiz from your material…');
    const questions = await generateQuiz({
      count: 10,
      difficulty: 'mixed',
      source: 'material',
      materialTopics: material.topics,
    });
    setGeneratedQuiz({
      questions,
      source: `Material: ${material.fileName}`,
      difficulty: 'mixed',
    });
    navigate('/quiz?autostart=1', { replace: false });
  };

  const formatSize = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <SectionTitle sub="Upload PDF, DOCX, PPTX or TXT — topics and competencies are detected, then a quiz is generated from your material">
          Upload Your Learning Material &amp; Take Quiz
        </SectionTitle>

        {/* Dropzone */}
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
            dragOver ? 'border-primary-600 bg-primary-50/60' : 'border-slate-300 hover:border-primary-400 bg-slate-50/60'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
        >
          <UploadCloud size={40} className="mx-auto text-primary-700" />
          <p className="text-sm font-semibold text-slate-700 mt-3">Drag &amp; drop your file here, or</p>
          <button className="btn-primary mt-3" onClick={() => fileRef.current?.click()}>Browse Files</button>
          <input
            ref={fileRef} type="file" className="hidden" accept={ACCEPTED.join(',')}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
          <p className="text-xs text-slate-400 mt-3">Accepted: PDF, DOCX, PPTX, TXT · max {MAX_SIZE_MB} MB · files are validated and kept local</p>
        </div>
      </div>

      {/* Processing / result panel */}
      {active && (
        <div className="card p-6 animate-fadeIn">
          <SectionTitle sub={active.status === 'ready' ? 'Processing complete' : 'Processing your learning material…'}>
            <span className="flex items-center gap-2"><FileText size={18} className="text-primary-800" /> {active.fileName}</span>
          </SectionTitle>

          {/* Pipeline checklist */}
          <ol className="space-y-2.5 mb-6">
            {PROCESS_STEPS.map((step, i) => {
              const done = active.processingStage > i || active.status === 'ready';
              const busy = processingId === active.id && active.processingStage === i;
              return (
                <li key={step} className="flex items-center gap-2.5 text-sm">
                  {done ? <CheckCircle2 size={16} className="text-emerald-600" />
                    : busy ? <Loader2 size={16} className="animate-spin text-primary-700" />
                    : <span className="w-4 h-4 rounded-full border-2 border-slate-200 inline-block" />}
                  <span className={done ? 'text-slate-700 font-medium' : 'text-slate-400'}>{step}</span>
                </li>
              );
            })}
          </ol>

          {active.status === 'error' && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center gap-2">
              <FileWarning size={15} /> {active.error ?? 'Processing failed.'}
            </p>
          )}

          {active.status === 'ready' && (
            <>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    <Tags size={13} /> Identified Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {active.topics.map((t) => (
                      <span key={t} className="badge bg-primary-50 text-primary-800 border border-primary-100">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    <BrainCircuit size={13} /> Competencies Detected
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {active.detectedCompetencies.map((c) => (
                      <span key={c} className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button className="btn-primary" onClick={() => generateQuizFromMaterial(active)}>
                  <ListChecks size={16} /> Generate Quiz
                </button>
                <button className="btn-secondary" onClick={() => navigate('/quiz')}>Go to Quiz Generator</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Previous uploads */}
      {state.materials.length > 0 && (
        <div className="card p-6">
          <SectionTitle sub="Everything stays in your browser">Your Uploaded Materials</SectionTitle>
          <div className="divide-y divide-slate-100">
            {state.materials.map((m) => (
              <button key={m.id}
                onClick={() => { setActiveId(m.id); }}
                className="w-full text-left py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded transition-colors">
                <span className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-primary-700 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800 truncate">{m.fileName}</span>
                    <span className="block text-[11px] text-slate-500">
                      {formatSize(m.fileSize)} · {new Date(m.uploadedAt).toLocaleString()} · {m.topics.length} topics
                    </span>
                  </span>
                </span>
                <span className={`badge shrink-0 ${
                  m.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
                }`}>
                  {m.status === 'ready' ? '✓ Quiz ready' : 'Processing…'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {state.materials.length === 0 && !active && (
        <EmptyState
          icon={<UploadCloud size={44} />}
          title="No learning material uploaded yet"
          description="Upload a document to see topic extraction in action — the quiz generator will build questions from your material."
        />
      )}
    </div>
  );
};

export default UploadPage;
