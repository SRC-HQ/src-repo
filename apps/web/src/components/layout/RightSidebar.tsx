import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../../store/gameStore';
import { prettyTruncate } from '../../utils/format';
import { SolColorIconSvg } from '../svgs';

const CopyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const SpermIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C7.58 2 4 4.5 4 7.5C4 9.5 5.5 11.5 8 12.5C6 15 4 19 4 22H6C6 18 8 15 12 15C16.42 15 20 12.5 20 9.5C20 6.5 16.42 2 12 2ZM12 13C10 13 8.5 11.5 8 10C9 10 10 9 10 7.5C10 6.5 11 6 12 6C14 6 15 7.5 15 9.5C15 11.5 13.5 13 12 13Z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ProfileHoverCard = ({
  name,
  avatarColor,
  position,
  isVisible,
  onMouseEnter,
  onMouseLeave,
}: {
  name: string;
  avatarColor: string;
  position: { top?: number; bottom?: number; left: number; transformOrigin: string };
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  // Mock data for display
  const address = 'nY57...bzI8';
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(address); // Actually copy text
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return createPortal(
    <div
      className={`fixed z-[9999] w-64 bg-[#1a1b1f] border border-white/10 rounded-xl p-4 shadow-xl transform transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : `opacity-0 scale-95 pointer-events-none ${position.bottom ? 'translate-y-2' : '-translate-y-2'}`
      }`}
      style={{
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        transformOrigin: position.transformOrigin,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-full ${avatarColor} flex-shrink-0 border-2 border-white/10`}
        />
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-white text-base truncate font-mono">{name}</h3>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <span className="font-mono">{address}</span>
            <button
              onClick={handleCopy}
              className={`transition-colors ${isCopied ? 'text-white cursor-default' : 'hover:text-white cursor-pointer'}`}
              disabled={isCopied}
            >
              {isCopied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10 mb-4" />

      {/* Stats */}
      <div className="space-y-3 font-mono">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Earnings</span>
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
            <SolColorIconSvg className="w-4 h-4" />
            <span className="text-white font-bold">8.1599</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Races</span>
          <span className="text-white font-bold px-2">23</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Wallet</span>
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
            <SolColorIconSvg className="w-4 h-4" />
            <span className="text-white font-bold">8.1599</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">SRC</span>
          <div className="flex items-center gap-1.5 px-2">
            <SpermIcon className="w-4 h-4 text-white" />
            <span className="text-white font-bold">20.4</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ChatBubble = ({
  name,
  message,
  time,
  avatarColor = 'bg-gray-600',
  onAvatarEnter,
  onAvatarLeave,
}: {
  name: string;
  message: string;
  time: string;
  avatarColor?: string;
  onAvatarEnter: (e: React.MouseEvent) => void;
  onAvatarLeave: () => void;
}) => (
  <div className="flex gap-3 mb-4 group relative">
    <div className="relative">
      <div
        className={`w-8 h-8 rounded-full ${avatarColor} flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-white/20 transition-all`}
        onMouseEnter={onAvatarEnter}
        onMouseLeave={onAvatarLeave}
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="font-bold text-xs text-gray-600 font-mono truncate">{name}</span>
        <span className="text-[10px] text-gray-500 font-mono">{time}</span>
      </div>
      <p className="text-xs text-white break-words leading-relaxed font-mono">{message}</p>
    </div>
  </div>
);

export const RightSidebar = () => {
  const { isWalletConnected } = useGameStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Profile Hover State
  const [hoveredProfile, setHoveredProfile] = useState<{
    name: string;
    avatarColor: string;
    position: { top?: number; bottom?: number; left: number; transformOrigin: string };
  } | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const unmountTimeoutRef = useRef<NodeJS.Timeout>();

  const handleProfileEnter = (e: React.MouseEvent, name: string, avatarColor: string) => {
    // Clear any pending timeouts
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);

    const rect = e.currentTarget.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const cardHeight = 320; // Estimated height including margin
    const spaceBelow = windowHeight - rect.bottom;

    let position: { top?: number; bottom?: number; left: number; transformOrigin: string };

    // Check if there's enough space below, if not show above
    if (spaceBelow < cardHeight) {
      position = {
        bottom: windowHeight - rect.top + 10, // 10px gap
        left: rect.left,
        transformOrigin: 'bottom left',
      };
    } else {
      position = {
        top: rect.bottom + 10, // 10px gap
        left: rect.left,
        transformOrigin: 'top left',
      };
    }

    setHoveredProfile({
      name,
      avatarColor,
      position,
    });
    // Small delay to ensure render happens before transition
    requestAnimationFrame(() => setIsCardVisible(true));
  };

  const handleProfileLeave = () => {
    // Delay hiding to allow moving to card
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCardVisible(false);
      // Wait for transition to finish before unmounting
      unmountTimeoutRef.current = setTimeout(() => {
        setHoveredProfile(null);
      }, 300); // Match CSS transition duration
    }, 150);
  };

  const handleCardEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
    setIsCardVisible(true);
  };

  const handleCardLeave = () => {
    handleProfileLeave();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Generate 50 mock messages on client side only to avoid hydration mismatch
    const msgs = [];
    const walletChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const names = [
      'MoonWalker',
      'SpeedDemon',
      'CryptoKing',
      'WhaleWatcher',
      'RacerX',
      'HodlGang',
      'ToTheMoon',
      'DiamondHands',
    ];
    const chatMessages = [
      'LFG!!!',
      'Which one is winning?',
      'Betting on #4',
      'Just won 5 SOL',
      'This is intense!',
      'Anyone else lagging?',
      'Claimed my winnings!',
      'Blue is fast today',
      'Red looks tired',
      'When is the next race?',
      'HODL',
      'Nice race!',
      'GG',
      'Unlucky...',
      'Next time!',
      'Yea it scales linearly.',
      'Someone did the math.',
      'Only advantageous to claim ur uORE after like 6 years.',
      'Otherwise uORE is always king.',
      'Wait for the dip.',
    ];
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500',
    ];

    for (let i = 0; i < 50; i++) {
      const isWallet = Math.random() > 0.4; // 60% chance of wallet address
      let name = '';

      if (isWallet) {
        let addr = '';
        for (let j = 0; j < 44; j++)
          addr += walletChars.charAt(Math.floor(Math.random() * walletChars.length));
        name = prettyTruncate(addr, 4, 4);
      } else {
        name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
      }

      msgs.push({
        id: i,
        name,
        message: chatMessages[Math.floor(Math.random() * chatMessages.length)],
        time: `${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}`,
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setMessages(msgs);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-80 flex-shrink-0 bg-game-bg border-l border-white/10 flex flex-col h-full font-sans">
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4" ref={scrollRef}>
        <div className="flex flex-col">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              {...msg}
              onAvatarEnter={(e) => handleProfileEnter(e, msg.name, msg.avatarColor)}
              onAvatarLeave={handleProfileLeave}
            />
          ))}
        </div>
      </div>

      {/* Profile Hover Card Portal */}
      {hoveredProfile && (
        <ProfileHoverCard
          name={hoveredProfile.name}
          avatarColor={hoveredProfile.avatarColor}
          position={hoveredProfile.position}
          isVisible={isCardVisible}
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleCardLeave}
        />
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-game-bg">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isWalletConnected}
            placeholder={
              isWalletConnected ? 'Type your message...' : 'Connect your wallet to chat...'
            }
            className={`w-full bg-transparent border-none text-sm focus:ring-0 px-0 py-2 placeholder:text-gray-500 font-mono ${!isWalletConnected ? 'cursor-not-allowed opacity-50' : 'text-white'}`}
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <div
              className={`w-3 h-3 rounded-full border ${isWalletConnected ? 'bg-green-500 border-green-400' : 'border-gray-600'}`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
