'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-zinc-600">
        <div className="inline-block w-8 h-8 border-4 border-black border-t-[#2563eb] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono font-bold">Loading operational incident evidence...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-zinc-600">
        <h2 className="text-xl font-black text-black mb-2">Event Not Found</h2>
        <Link href="/events" className="text-blue-700 text-xs font-bold hover:underline">← Return to Events Catalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono font-bold mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">Command Center</Link>
            <span>/</span>
            <Link href="/events" className="text-zinc-700 hover:underline">Events</Link>
            <span>/</span>
            <span className="text-black font-bold">{event.eventType}</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-black tracking-tight">{event.eventType}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-black font-mono bg-[#ffe4e6] text-[#881337] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {event.severity}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white hover:bg-zinc-100 text-black text-xs rounded-xl border-2 border-black font-black shadow-[2px_2px_0px_0px_#000] transition-all"
        >
          ← Back
        </button>
      </div>

      {/* Main Incident Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Well Identifier</span>
            <Link
              href={`/wells/${event.wellId}/intelligence`}
              className="text-base font-black text-[#1e3a8a] font-mono hover:underline block mt-1"
            >
              {event.well?.wellId || event.wellId}
            </Link>
          </div>

          <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Start Depth</span>
            <span className="text-base font-black text-black font-mono mt-1 block">{event.startDepth} m</span>
          </div>

          <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Formation</span>
            <span className="text-base font-bold text-black mt-1 block">
              {event.formation?.formationName || 'Barail Sandstone'}
            </span>
          </div>

          <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Confidence</span>
            <span className="text-base font-black text-[#064e3b] font-mono mt-1 block">
              {((event.confidence || 0.95) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Preceding Indicators */}
        {event.precedingIndicators && event.precedingIndicators.length > 0 && (
          <div>
            <span className="text-xs font-black text-black uppercase tracking-wider mb-2 font-mono block">
              Detected Precursor Indicators:
            </span>
            <div className="flex flex-wrap gap-2">
              {event.precedingIndicators.map((ind: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs bg-[#fef3c7] text-[#78350f] border-2 border-black font-mono font-bold shadow-[2px_2px_0px_0px_#000]"
                >
                  ⚠ {ind}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <span className="text-xs font-black text-black uppercase tracking-wider mb-1 font-mono block">
            Incident Description:
          </span>
          <p className="text-xs text-black font-semibold leading-relaxed bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {event.description}
          </p>
        </div>

        {/* Root Cause & Mitigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-xs font-black text-black uppercase mb-1 font-mono block">
              Root Cause Analysis:
            </span>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed">
              {event.rootCause || 'Differential sticking aggravated by carbonaceous shale packoff.'}
            </p>
          </div>

          <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-xs font-black text-black uppercase mb-1 font-mono block">
              Mitigation &amp; Action Taken:
            </span>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed">
              {event.mitigation || 'Circulated freeing agent and jarred down with hydraulic jars.'}
            </p>
          </div>
        </div>

        {/* Outcome */}
        {event.outcome && (
          <div className="bg-[#d1fae5] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-xs font-black text-[#064e3b] uppercase mb-0.5 font-mono block">
              Operational Outcome:
            </span>
            <p className="text-xs font-bold text-black">{event.outcome}</p>
          </div>
        )}

        {/* Evidence Citations */}
        <div className="border-t-2 border-black pt-4">
          <h3 className="text-xs font-black text-black uppercase tracking-wider mb-3 font-mono">
            Corroborating Archival Evidence:
          </h3>
          {event.evidence && event.evidence.length > 0 ? (
            <div className="space-y-3">
              {event.evidence.map((evi: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black space-y-2 shadow-[2px_2px_0px_0px_#000]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1e3a8a]">
                      📄 {evi.document?.title || 'Daily Drilling Report'} (Page {evi.pageNumber})
                    </span>
                    <span className="font-mono text-xs text-zinc-600">
                      {evi.document?.fileName || 'drilling-report.txt'}
                    </span>
                  </div>
                  <p className="text-xs text-black italic bg-[#fffbeb] p-3 rounded-lg border border-black font-medium">
                    &quot;{evi.textExcerpt}&quot;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black text-xs text-zinc-700 shadow-[2px_2px_0px_0px_#000]">
              <span>Source Document: </span>
              <strong className="text-black font-black">
                {event.document?.fileName || 'synthetic-well-003-ddr.txt'} (Page {event.sourcePage || 1})
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
