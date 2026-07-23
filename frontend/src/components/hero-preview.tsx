type Marker = {
  pos: number;
  name: string;
  text: string;
  bg: string;
  fg: string;
};

const markers: Marker[] = [
  {
    pos: 22,
    name: 'bestuser',
    text: 'opening shot goes hard',
    bg: '#7F77DD',
    fg: '#26215C',
  },
  {
    pos: 48,
    name: 'mrfamous',
    text: 'how did you edit this?',
    bg: '#5DCAA5',
    fg: '#04342C',
  },
  {
    pos: 74,
    name: 'kid67',
    text: 'wow shocking',
    bg: '#F0997B',
    fg: '#4A1B0C',
  },
];

function Bubble({ name, text }: { name: string; text: string }) {
  return (
    <div className='relative flex w-fit items-center text-white space-x-1 text-center bg-accent-foreground/50 rounded-full shadow-md px-2 py-1'>
      <div className='text-xs font-bold'>{name}</div>
      <div className='text-xs leading-snug'>{text}</div>
    </div>
  );
}

export default function HeroPreview() {
  return (
    <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-purple-200'>
      {/* Bubbles — each pops in when playhead crosses its marker */}
      {markers.map((m, i) => (
        <div
          key={m.name}
          className='absolute pointer-events-none'
          style={{
            bottom: '5rem',
            left: `${m.pos}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className={`hp-bubble hp-bubble-${i + 1}`}>
            <Bubble name={m.name} text={m.text} />
          </div>
        </div>
      ))}

      {/* Progress bar */}
      <div className='absolute bottom-4 left-4 right-4 h-6'>
        <div className='absolute top-1/2 left-0 right-0 h-0.75 -translate-y-1/2 rounded-full bg-white/25' />
        <div className='absolute top-1/2 left-0 h-0.75 -translate-y-1/2 rounded-full bg-brand hp-progress'>
          <div className='hp-thumb' aria-hidden='true' />
        </div>
        {markers.map((m) => (
          <div
            key={m.name}
            className='absolute bottom-6 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold'
            style={{
              left: `${m.pos}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: m.bg,
              color: m.fg,
            }}
          >
            {' '}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes hp-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .hp-progress {
          animation: hp-progress 12s linear infinite;
        }
        .hp-bubble {
          opacity: 0;
          will-change: opacity, transform;
        }
        @keyframes hp-bubble-1 {
          0%, 18%       { opacity: 0; transform: translateY(4px) scale(0.96); }
          22%, 34%      { opacity: 1; transform: translateY(0) scale(1); }
          38%, 100%     { opacity: 0; transform: translateY(4px) scale(0.96); }
        }
        @keyframes hp-bubble-2 {
          0%, 44%       { opacity: 0; transform: translateY(4px) scale(0.96); }
          48%, 60%      { opacity: 1; transform: translateY(0) scale(1); }
          64%, 100%     { opacity: 0; transform: translateY(4px) scale(0.96); }
        }
        @keyframes hp-bubble-3 {
          0%, 70%       { opacity: 0; transform: translateY(4px) scale(0.96); }
          74%, 86%      { opacity: 1; transform: translateY(0) scale(1); }
          90%, 100%     { opacity: 0; transform: translateY(4px) scale(0.96); }
        }
        .hp-bubble-1 { animation: hp-bubble-1 12s ease-out infinite; }
        .hp-bubble-2 { animation: hp-bubble-2 12s ease-out infinite; }
        .hp-bubble-3 { animation: hp-bubble-3 12s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .hp-progress { animation: none; width: 40%; }
          .hp-bubble-1, .hp-bubble-2, .hp-bubble-3 { animation: none; }
          .hp-bubble-2 { opacity: 1; transform: translateY(0) scale(1); }
        }

        .hp-thumb {
            position: absolute;
            right: 0;
            top: 0;
            transform: translate(50%, calc(-10% - 8px));
            width: 16px;
            height: 12px;
            background: #fff;
            border-radius: 50px;
            clip-path: polygon(0 0, 100% 0, 50% 100%);
        }
      `}</style>
    </div>
  );
}
