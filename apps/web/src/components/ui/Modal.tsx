'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      setVisible(true);
      setIsClosing(false);
      setAnimateIn(false);
      const id = requestAnimationFrame(() => {
        setAnimateIn(true);
      });
      return () => cancelAnimationFrame(id);
    }
    if (visible) {
      setIsClosing(true);
      setAnimateIn(false);
      const timeout = setTimeout(() => {
        setVisible(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, mounted, visible]);

  if (!mounted || (!isOpen && !visible)) return null;

  const isOpenOrOpening = animateIn && !isClosing;

  const backdropClassName = [
    'fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity duration-200',
    isOpenOrOpening ? 'opacity-100' : 'opacity-0',
  ].join(' ');

  const panelClassName = [
    'pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#2A282C] bg-[#100E12] p-1 shadow-2xl',
    'transform transition-all duration-200',
    isOpenOrOpening ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4',
  ].join(' ');

  return createPortal(
    <>
      <div className={backdropClassName} onClick={onClose} />

      <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className={panelClassName}>
          <div className="absolute inset-0 -z-10">
            <div className="bg-primary/10 absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full blur-[100px]" />
            <div className="bg-secondary/10 absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full blur-[100px]" />
          </div>

          <div className="relative rounded-xl border border-[#2A282C] bg-[#100E12] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold tracking-wider text-white uppercase">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};
