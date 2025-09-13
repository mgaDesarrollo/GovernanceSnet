import React from "react";

interface Props {
  createReportLink: string;
  lastReportLink: string;
  selfEvaluation: string;
  communityFeedback: string;
  votingMetrics: string;
}

const ReportingEvaluation: React.FC<Props> = ({
  createReportLink,
  lastReportLink,
  selfEvaluation,
  communityFeedback,
  votingMetrics,
}) => (
  <section className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">📊 Reportes y Evaluación</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <a
        href={createReportLink}
        className="inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-md font-medium hover:bg-purple-700 transition-colors text-sm"
      >
        + Crear Reporte
      </a>
      <a
        href={lastReportLink}
        className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline hover:text-purple-800 transition-colors text-sm"
      >
        Último reporte <span aria-hidden>→</span>
      </a>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Autoevaluación:</span>
      <span className="ml-2 text-lg">{selfEvaluation}</span>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Feedback de la comunidad:</span>
      <span className="ml-2 text-slate-600">{communityFeedback}</span>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Métricas de votación:</span>
      <span className="ml-2 text-slate-600">{votingMetrics}</span>
    </div>
  </section>
);

export default ReportingEvaluation; 