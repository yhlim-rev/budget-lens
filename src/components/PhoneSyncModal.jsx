import React, { useMemo } from 'react';
import { QrCode } from 'lucide-react';
import { Modal, Button } from './common';

export const PhoneSyncModal = ({ isOpen, onClose, t }) => {
  const sessionId = "webrtc-lens-8f4a";
  const size = 21;
  const cellSize = 140 / size;

  const qrRects = useMemo(() => {
    const list = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isCornerTL = r < 7 && c < 7;
        const isCornerTR = r < 7 && c >= size - 7;
        const isCornerBL = r >= size - 7 && c < 7;

        let isDark = false;
        if (isCornerTL || isCornerTR || isCornerBL) {
          const lr = isCornerBL ? r - (size - 7) : r;
          const lc = isCornerTR ? c - (size - 7) : c;
          if (lr === 0 || lr === 6 || lc === 0 || lc === 6) isDark = true;
          else if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) isDark = true;
        } else {
          isDark = (r * 11 + c * 7 + r * c) % 3 === 0;
        }

        if (isDark) {
          list.push(
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize - 0.5}
              height={cellSize - 0.5}
              fill="#09090b"
              rx={1}
            />
          );
        }
      }
    }
    return list;
  }, [cellSize, size]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#e8834a]/10 text-[#e8834a] mx-auto">
          <QrCode className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wide">
            {t.modal_sync_title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-mono">{t.modal_sync_sub}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl mx-auto inline-block shadow-lg">
          <svg width="140" height="140" viewBox="0 0 140 140" className="w-36 h-36">
            {qrRects}
          </svg>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 space-y-1">
          <p>{t.sync_step_1}</p>
          <p>{t.sync_step_2}</p>
          <span className="inline-block mt-1 text-[10px] text-[#e8834a] bg-[#e8834a]/10 px-2 py-0.5 rounded font-mono">
            {t.lbl_session_id} <strong>{sessionId}</strong>
          </span>
        </div>

        <Button variant="secondary" size="lg" onClick={onClose} className="w-full">
          {t.btn_close}
        </Button>
      </div>
    </Modal>
  );
};