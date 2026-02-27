'use client';

import React from 'react';
import { getSolscanTxUrl } from '../../constants/network';

export type TxResult = { type: 'success'; txHash: string } | { type: 'error'; message: string };

interface TxResultPopoverProps {
  result: TxResult | null;
  onDismiss: () => void;
  successLabel?: string;
  errorLabel?: string;
}

export const TxResultPopover = ({
  result,
  onDismiss,
  successLabel = 'Transaction successful',
  errorLabel = 'Transaction failed',
}: TxResultPopoverProps) => {
  if (!result) return null;

  return (
    <div className="text-xs font-sans px-3 py-2.5 rounded-lg border border-white/10 bg-white/5">
      {result.type === 'success' ? (
        <div className="flex flex-col gap-2">
          <span className="text-green-400 font-semibold">{successLabel}</span>
          <a
            href={getSolscanTxUrl(result.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View Transaction
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-red-400 font-semibold">{errorLabel}</span>
          <span className="text-white/80 break-words">{result.message}</span>
        </div>
      )}
      <button
        onClick={onDismiss}
        className="mt-2 text-white/60 hover:text-white text-[10px]"
      >
        Dismiss
      </button>
    </div>
  );
};
