import React from "react";

interface Props {
  frequency: string;
  meetingCalendarLink: string;
  meetingNotesArchiveLink: string;
  eventHostingParticipation: string[];
}

const ActivityLogMeetings: React.FC<Props> = ({ frequency, meetingCalendarLink, meetingNotesArchiveLink, eventHostingParticipation }) => (
  <section className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">📅 Registro de Actividad y Reuniones</h3>
    <div>
      <span className="font-semibold text-slate-700">Frecuencia de reuniones:</span>
      <span className="ml-2 text-slate-600">{frequency}</span>
    </div>
    <div className="flex flex-wrap gap-4 mt-2">
      <a
        href={meetingCalendarLink}
        className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline hover:text-purple-800 transition-colors text-sm"
      >
        Calendario de reuniones <span aria-hidden>→</span>
      </a>
      <a
        href={meetingNotesArchiveLink}
        className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline hover:text-purple-800 transition-colors text-sm"
      >
        Archivo de notas <span aria-hidden>→</span>
      </a>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Eventos organizados/participados:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {eventHostingParticipation.map((event, i) => (
          <li key={i}>{event}</li>
        ))}
      </ul>
    </div>
  </section>
);

export default ActivityLogMeetings; 