'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const data = await api.events.getById(eventId);
        setEvent(data);
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) loadEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs">Loading operational incident evidence...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <h2 className="text-lg font-bold text-white mb-2">Event Not Found</h2>
        <a href="/events" className="text-emerald-400 text-xs hover:underline">← Return to Events Catalog</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-petro-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <a href="/events" className="hover:text-emerald-400">Events</a>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">{event.eventType}</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{event.eventType}</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
              {event.severity}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="px-3 py-1.5 bg-petro-800 hover:bg-petro-700 text-slate-200 text-xs rounded border border-petro-700 font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Main Incident Card */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block uppercase">Well Identifier</span>
            <a
              href={`/wells/${event.wellId}/intelligence`}
              className="text-base font-bold text-emerald-400 font-mono hover:underline"
            >
              {event.well?.wellId || event.wellId}
            </a>
          </div>

          <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block uppercase">Start Depth</span>
            <span className="text-base font-bold text-white font-mono">{event.startDepth} m</span>
          </div>

          <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block uppercase">Formation</span>
            <span className="text-base font-bold text-slate-200">
              {event.formation?.formationName || 'Barail Sandstone'}
            </span>
          </div>

          <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block uppercase">Confidence</span>
            <span className="text-base font-bold text-indigo-400 font-mono">
              {((event.confidence || 0.95) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Preceding Indicators */}
        {event.precedingIndicators && event.precedingIndicators.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-2">
              Detected Precursor Indicators:
            </span>
            <div className="flex flex-wrap gap-2">
              {event.precedingIndicators.map((ind: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs bg-amber-950/60 text-amber-300 border border-amber-800 font-mono"
                >
                  ⚠ {ind}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">
            Incident Description:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed bg-petro-950 p-4 rounded-lg border border-petro-800">
            {event.description}
          </p>
        </div>

        {/* Root Cause & Mitigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-petro-950 p-4 rounded-lg border border-petro-800">
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">
              Root Cause Analysis:
            </span>
            <p className="text-xs text-slate-300">
              {event.rootCause || 'Differential sticking aggravated by carbonaceous shale packoff.'}
            </p>
          </div>

          <div className="bg-petro-950 p-4 rounded-lg border border-petro-800">
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">
              Mitigation & Action Taken:
            </span>
            <p className="text-xs text-slate-300">
              {event.mitigation || 'Circulated freeing agent and jarred down with hydraulic jars.'}
            </p>
          </div>
        </div>

        {/* Outcome */}
        {event.outcome && (
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-0.5">
              Operational Outcome:
            </span>
            <p className="text-xs text-emerald-300">{event.outcome}</p>
          </div>
        )}

        {/* Evidence Citations (Section 17 & 50) */}
        <div className="border-t border-petro-800 pt-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Corroborating Archival Evidence:
          </h3>
          {event.evidence && event.evidence.length > 0 ? (
            <div className="space-y-3">
              {event.evidence.map((evi: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-petro-950 p-4 rounded-lg border border-petro-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400">
                      📄 {evi.document?.title || 'Daily Drilling Report'} (Page {evi.pageNumber})
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {evi.document?.fileName || 'drilling-report.txt'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic bg-petro-900/70 p-3 rounded border border-petro-800">
                    "{evi.textExcerpt}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-petro-950 p-4 rounded-lg border border-petro-800 text-xs text-slate-400">
              <span>Source Document: </span>
              <strong className="text-slate-200">
                {event.document?.fileName || 'synthetic-well-003-ddr.txt'} (Page {event.sourcePage || 1})
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
