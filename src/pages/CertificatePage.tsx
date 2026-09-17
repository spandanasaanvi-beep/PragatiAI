import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Award, Download, Eye, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { useAppContext } from '../context/AppContext';
import { SectionTitle } from '../components/EmptyState';
import { useToast } from '../components/Toast';

const ACET_LOGO_PATH = '/logos/acet-logo.png';
const PRAGATI_AI_LOGO_PATH = '/logos/pragati-ai-logo.png';

const loadImageData = async (path: string): Promise<string> => {
  const response = await fetch(path);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const CertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, isReady, roleReadiness } = useAppContext();
  const { notify } = useToast();

  const user = state.user;
  const cert = state.certificate;

  /* ------------------------- PDF generation ------------------------- */
  const downloadCertificate = async () => {
    if (!isReady || !user || !cert) return;
    const [acetLogo, pragatiAiLogo] = await Promise.all([
      loadImageData(ACET_LOGO_PATH),
      loadImageData(PRAGATI_AI_LOGO_PATH),
    ]);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;

    // Border + background
    doc.setFillColor(254, 254, 254);
    doc.rect(0, 0, W, H, 'F');
    doc.setDrawColor(23, 52, 150);
    doc.setLineWidth(2.5);
    doc.rect(8, 8, W - 16, H - 16);
    doc.setLineWidth(0.6);
    doc.rect(11, 11, W - 22, H - 22);

    // Tricolor accent
    doc.setFillColor(255, 153, 51); doc.rect(8, 8, W - 16, 2.2, 'F');
    doc.setFillColor(19, 136, 8); doc.rect(8, H - 10.2, W - 16, 2.2, 'F');

    // Certificate logos
    doc.addImage(acetLogo, 'PNG', 18, 14, 24, 23.4);
    doc.addImage(pragatiAiLogo, 'PNG', W - 40, 14, 22, 19.2);

    // Header
    doc.setTextColor(23, 52, 150);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
    doc.text('PRAGATIAI', W / 2, 26, { align: 'center' });
    doc.setFont('normal'); doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Personalized Competency & Learning Platform for iGOT Karmayogi', W / 2, 32, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(90, 37, W - 90, 37);

    doc.setTextColor(30, 41, 59);
    doc.setFont('times', 'bold'); doc.setFontSize(26);
    doc.text('CERTIFICATE OF COMPLETION & APPRECIATION', W / 2, 52, { align: 'center' });

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('This is to certify that', W / 2, 66, { align: 'center' });

    doc.setFont('times', 'bolditalic'); doc.setFontSize(24);
    doc.setTextColor(23, 52, 150);
    doc.text(user.fullName, W / 2, 80, { align: 'center' });
    doc.setDrawColor(249, 125, 12);
    doc.setLineWidth(0.5);
    doc.line(110, 84, W - 110, 84);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${user.role} · ${user.organization}`, W / 2, 91, { align: 'center' });

    // Statement
    doc.setFontSize(10);
    const statement =
      'has successfully completed the required competency development journey, demonstrating proficiency across all mandated competencies through assessment, personalized learning, and evaluation on the PragatiAI platform.';
    const lines = doc.splitTextToSize(statement, W - 110);
    doc.setTextColor(51, 65, 85);
    doc.text(lines, W / 2, 101, { align: 'center' });

    // Achievement stats
    const achieved = state.competencies.filter((c) => c.currentScore >= c.requiredScore).length;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Overall Competency Achievement: ${achieved} / ${state.competencies.length}    ·    Role Readiness: ${roleReadiness}%`, W / 2, 118, { align: 'center' });

    // Date + cert id
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Completion Date: ${new Date(cert.completionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 40, 150);
    doc.text(`Certificate ID: ${cert.certificateId}`, W - 40, 150, { align: 'right' });

    // Signature lines
    doc.setDrawColor(148, 163, 184);
    doc.line(40, 172, 95, 172);
    doc.line(W - 95, 172, W - 40, 172);
    doc.setFontSize(8.5);
    doc.text('PragatiAI Competency Platform', 67.5, 177, { align: 'center' });
    doc.text('iGOT Karmayogi Ecosystem', W - 67.5, 177, { align: 'center' });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Verify this certificate with the Certificate ID on the PragatiAI platform. Prototype document — demo data.', W / 2, 192, { align: 'center' });

    doc.save(`PragatiAI_Certificate_${cert.certificateId}.pdf`);
    notify('success', 'Certificate downloaded.');
  };

  /* --------------------------- Locked state --------------------------- */
  if (!isReady || !cert) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card p-6">
          <SectionTitle sub="Earned by achieving every required competency for your role">
            <span className="flex items-center gap-2"><Award size={20} className="text-primary-800" /> Certificate</span>
          </SectionTitle>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
            <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">🔒 Certificate Locked</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Complete all required competencies to unlock your certificate.
              </p>
            </div>
          </div>
        </div>

        {/* Sample certificate (watermarked, no real name) */}
        <div className="card p-6">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide font-bold mb-4 text-center">Sample preview — not a valid certificate</p>
          <div className="certificate-border bg-white p-8 sm:p-10 relative overflow-hidden" aria-hidden>
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-5xl font-extrabold text-slate-200/70 -rotate-12 select-none">SAMPLE CERTIFICATE</span>
            </span>
            <div className="relative">
              <div className="flex items-start justify-between">
                <img src={ACET_LOGO_PATH} alt="ACET logo" className="h-16 w-auto object-contain" />
                <img src={PRAGATI_AI_LOGO_PATH} alt="PragatiAI logo" className="h-16 w-auto object-contain" />
              </div>
              <div className="text-center">
              <p className="text-xs font-bold text-primary-800 tracking-widest">PRAGATIAI</p>
              <h3 className="text-xl font-serif font-bold text-slate-800 mt-4">Certificate of Completion &amp; Appreciation</h3>
              <p className="text-xs text-slate-500 mt-3">This is to certify that</p>
              <p className="text-lg font-serif font-bold text-slate-300 mt-2">________________________</p>
              <p className="text-[11px] text-slate-500 mt-3 max-w-md mx-auto">
                has successfully completed the required competency development journey on the PragatiAI platform.
              </p>
              <div className="flex justify-between mt-10 text-[10px] text-slate-400">
                <span>Certificate ID: PRG-XXXX-XXXXXX</span>
                <span>Date: ____________</span>
              </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button className="btn-secondary" onClick={() => navigate('/learning-path')}>Continue Learning</button>
            <button className="btn-primary" onClick={() => navigate('/adaptive')}>View Remaining Gaps</button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------- Unlocked state -------------------------- */
  const achieved = state.competencies.filter((c) => c.currentScore >= c.requiredScore).length;
  const completionDate = new Date(cert.completionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionTitle sub={`Unlocked on ${completionDate} · ID ${cert.certificateId}`}>
            <span className="flex items-center gap-2 text-emerald-700"><Award size={20} /> Certificate Unlocked</span>
          </SectionTitle>
          <p className="text-sm text-slate-600">
            Congratulations! You have successfully completed the required competency development journey.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => window.print()}>
            <Eye size={15} /> View Certificate
          </button>
          <button className="btn-primary" onClick={downloadCertificate}>
            <Download size={15} /> Download Certificate
          </button>
        </div>
      </div>

      {/* The certificate */}
      <div id="certificate-print" className="certificate-border bg-white p-8 sm:p-12">
        <div className="relative">
          <div className="flex items-start justify-between">
            <img src={ACET_LOGO_PATH} alt="ACET logo" className="h-20 w-auto object-contain" />
            <img src={PRAGATI_AI_LOGO_PATH} alt="PragatiAI logo" className="h-20 w-auto object-contain" />
          </div>

          <div className="text-center">
            <p className="text-sm font-extrabold text-primary-800 tracking-[0.3em]">PRAGATIAI</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Personalized Competency &amp; Learning Platform for iGOT Karmayogi</p>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-6">Certificate of Completion &amp; Appreciation</h2>

          <p className="text-xs text-slate-500 mt-6">This is to certify that</p>
          <p className="text-3xl font-serif font-bold text-primary-800 mt-2">{user?.fullName}</p>
          <p className="text-xs text-slate-600 mt-1.5">{user?.role} · {user?.organization}</p>

          <p className="text-xs text-slate-600 mt-6 max-w-lg mx-auto leading-relaxed">
            Congratulations! You have successfully completed the required competency development journey,
            demonstrating proficiency across all mandated competencies through assessment, personalized learning and evaluation.
          </p>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-6 text-xs">
            <span className="font-semibold text-slate-700">Overall Competency Achievement: <span className="text-emerald-700">{achieved} / {state.competencies.length}</span></span>
            <span className="font-semibold text-slate-700">Role Readiness: <span className="text-emerald-700">{roleReadiness}%</span></span>
          </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-12 text-xs text-slate-500">
              <div className="text-center sm:text-left">
                <p className="border-t border-slate-300 pt-1.5 w-44">Completion Date</p>
                <p className="font-semibold text-slate-700 mt-1">{completionDate}</p>
              </div>
              <div className="text-center mt-6 sm:mt-0">
                <p className="font-bold text-primary-800 tracking-widest">PRAGATIAI</p>
                <p className="text-[10px]">Competency Development Platform</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="border-t border-slate-300 pt-1.5 w-44 sm:ml-auto">Certificate ID</p>
                <p className="font-semibold text-slate-700 mt-1">{cert.certificateId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <FileDown size={13} /> Use Download Certificate for a print-ready PDF; use View Certificate to print.
      </p>
    </div>
  );
};

export default CertificatePage;
