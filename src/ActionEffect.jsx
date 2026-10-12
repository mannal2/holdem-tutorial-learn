import React from 'react';

// Persistent visual targets shared by any lesson that plays a player action.
export default function ActionEffect({ index, elements }) {
  return <span className="action-effect" aria-hidden="true" ref={node => { elements.current.effects[index] = node; }}>
    <span className="action-chip"><i className="chip" /></span>
    <svg className="check-hand" viewBox="0 0 40 40"><path d="M9 28V16c0-4 5-4 5-1v-5c0-4 5-4 5 0V8c0-4 5-4 5 0v3c0-4 5-4 5 0v10l3-4c2-3 6 0 4 3l-6 12c-2 4-6 5-11 5-6 0-10-3-10-9Z" fill="#fff1c2" stroke="#856e39" strokeWidth="1.5"/><path d="M14 16v7m5-12v11m5-10v10m5-5v8" fill="none" stroke="#b29656" strokeWidth="1.5" /></svg>
    <span className="knock-ring" />
  </span>;
}
