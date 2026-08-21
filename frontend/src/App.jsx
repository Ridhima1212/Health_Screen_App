import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, PhoneOff, Activity, FileText, User, AlertCircle, Clock, HeartPulse, Heart, Plus } from 'lucide-react';

// Vapi Configuration
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

export default function App() {
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'loading' | 'active'
  const [transcripts, setTranscripts] = useState([]);
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const transcriptEndRef = useRef(null);
  const transcriptsRef = useRef([]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus('active');
      setIsAnalyzing(false);
    };

    const onCallEnd = async () => {
      setCallStatus('idle');
      
      const fullTranscript = transcriptsRef.current.join('\n');
      if (fullTranscript.trim() !== '') {
        setIsAnalyzing(true);
        try {
          const res = await fetch('http://localhost:5000/api/generate-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: fullTranscript }),
          });
          const data = await res.json();
          setReport(data);
        } catch (err) {
          console.error('Report Generation Error:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    const onMessage = (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newText = `${message.role}: ${message.transcript}`;
        setTranscripts((prev) => [...prev, newText]);
        transcriptsRef.current.push(newText);
      }
    };

    const onError = (e) => {
      console.error('Vapi Error:', e);
      setCallStatus('idle');
    };

    // Attach Vapi Event Listeners
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);

    // Cleanup listeners on unmount
    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('error', onError);
    };
  }, []);

  const handleStartCall = async () => {
    setCallStatus('loading');
    setReport(null);
    setTranscripts([]);
    transcriptsRef.current = [];

    try {
      // Step 1: Explicit Microphone Permission Request
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Step 2: Start Vapi with your Dashboard Assistant ID
      await vapi.start(import.meta.env.VITE_VAPI_ASSISTANT_ID);
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('Call Error: ' + (err.message || 'Microphone access issue'));
      setCallStatus('idle');
    }
  };

  const handleEndCall = () => {
    // Calling vapi.stop() automatically triggers the 'call-end' event,
    // where the report generation is now handled.
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-purple-50 text-purple-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background Floating Health Animations */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Heart className="absolute top-10 left-[10%] text-purple-200/60 w-16 h-16 animate-float-1" />
        <Activity className="absolute top-40 right-[15%] text-fuchsia-200/50 w-24 h-24 animate-float-2" />
        <Plus className="absolute bottom-20 left-[20%] text-purple-300/40 w-20 h-20 animate-float-3" />
        <HeartPulse className="absolute bottom-1/3 right-[10%] text-purple-300/50 w-12 h-12 animate-pulse-soft" />
        <Plus className="absolute top-1/2 left-[5%] text-fuchsia-200/60 w-10 h-10 animate-float-2" />
        <Heart className="absolute top-20 right-[25%] text-purple-200/70 w-14 h-14 animate-float-1" />
        <Activity className="absolute bottom-10 right-[35%] text-purple-200/40 w-16 h-16 animate-float-3" />
      </div>

      <div className="max-w-xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-200/50 p-6 sm:p-8 border border-purple-100/50 text-center relative z-10 overflow-hidden">
        
        {/* Header Section */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className="text-purple-600 w-7 h-7 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-900">
            AI Health Assistant
          </h1>
        </div>
        <p className="text-purple-500 text-sm mb-6">
          Voice-based intake & preliminary health screening
        </p>

        {/* How to begin instructions */}
        <div className="text-left bg-purple-50/50 p-5 rounded-2xl mb-8 border border-purple-100/50 shadow-inner">
          <h3 className="text-purple-800 font-semibold mb-3">How to begin:</h3>
          <ul className="text-sm text-purple-700 space-y-3">
            <li className="flex items-center gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold shadow-sm">1</span> Click 'Start Screening Call'</li>
            <li className="flex items-center gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold shadow-sm">2</span> Allow microphone access when prompted</li>
            <li className="flex items-center gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold shadow-sm">3</span> Speak naturally about your symptoms</li>
          </ul>
        </div>

        {/* Call Controls & Status */}
        <div className="flex flex-col items-center justify-center mb-8">
          {callStatus === 'idle' && !isAnalyzing && (
            <button
              onClick={handleStartCall}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-full flex items-center gap-3 shadow-lg shadow-purple-600/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Mic size={22} /> Start Screening Call
            </button>
          )}

          {callStatus === 'loading' && (
            <div className="flex items-center gap-3 text-purple-600 font-semibold text-lg bg-purple-100 px-6 py-3 rounded-full border border-purple-200 animate-pulse">
              <Clock className="animate-spin" size={20} /> Connecting Call...
            </div>
          )}

          {callStatus === 'active' && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2 text-purple-700 text-sm font-medium bg-purple-100 px-4 py-1.5 rounded-full border border-purple-200">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping"></span>
                Call Active - Speak Naturally
              </div>

              {/* Live Transcript Box */}
              <div className="w-full bg-purple-50 p-4 rounded-2xl border border-purple-100 h-48 overflow-y-auto flex flex-col gap-3 shadow-inner">
                {transcripts.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-purple-400 italic animate-pulse">
                    Listening for conversation...
                  </div>
                ) : (
                  <>
                    {transcripts.map((t, idx) => {
                      const role = t.split(':')[0];
                      const text = t.split(':').slice(1).join(':');
                      const isUser = role === 'user';
                      return (
                        <div key={idx} className={`p-3 rounded-xl max-w-[85%] text-sm text-left ${isUser ? 'bg-purple-600 text-white self-end rounded-br-none' : 'bg-white text-purple-900 self-start rounded-bl-none border border-purple-100 shadow-sm'}`}>
                          <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 block ${isUser ? 'text-purple-200' : 'text-purple-500'}`}>
                            {role}
                          </span>
                          {text}
                        </div>
                      );
                    })}
                    <div ref={transcriptEndRef} />
                  </>
                )}
              </div>

              <button
                onClick={handleEndCall}
                className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-8 py-4 rounded-full flex items-center gap-3 shadow-lg shadow-rose-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer mt-2"
              >
                <PhoneOff size={22} /> End Call & Extract Report
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-purple-600 font-semibold text-base flex items-center gap-2 animate-pulse bg-purple-100 px-6 py-3 rounded-full border border-purple-200">
              <HeartPulse className="animate-bounce" size={20} /> Generating Structured Patient Report...
            </div>
          )}
        </div>

        {/* Structured Medical Report Display */}
        {report && (
          <div className="bg-white text-left p-6 rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50">
            <h2 className="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2 border-b border-purple-100 pb-3">
              <FileText size={20} /> Patient Intake Report
            </h2>

            <div className="space-y-3 text-sm text-purple-800">
              <div className="flex items-start gap-2">
                <User size={16} className="text-purple-400 mt-0.5" />
                <p><span className="font-semibold text-purple-900">Patient Name:</span> {report.name || 'Not provided'}</p>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-purple-400 mt-0.5" />
                <p><span className="font-semibold text-purple-900">Primary Symptom:</span> {report.primarySymptom || 'Not provided'}</p>
              </div>

              <div className="flex items-start gap-2">
                <Clock size={16} className="text-purple-400 mt-0.5" />
                <p><span className="font-semibold text-purple-900">Duration:</span> {report.duration || 'Not provided'}</p>
              </div>

              <p><span className="font-semibold text-purple-900 pl-6">Severity Scale:</span> {report.severity || 'N/A'} / 10</p>
              <p><span className="font-semibold text-purple-900 pl-6">Additional Symptoms:</span> {report.additionalSymptoms || 'None reported'}</p>

              <div className="mt-4 pt-3 border-t border-purple-100 bg-purple-50 p-3 rounded-xl border border-purple-50">
                <span className="font-semibold text-purple-600 text-xs tracking-wider uppercase block mb-1">
                  Preliminary Summary
                </span>
                <p className="text-purple-800 text-xs leading-relaxed">{report.doctorSummary || 'Call ended early.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}