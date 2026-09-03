'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  User,
  Zap,
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  X,
  Sparkles,
  ShieldCheck,
  Server,
  Activity,
  AlertTriangle,
  FileText,
  ArrowRight,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { SupabaseConfigDTO } from '@cronjob/shared';
import { api } from '@/lib/api';

interface PingAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: SupabaseConfigDTO[];
  onComplete?: () => void;
}

type PingStatus = 'idle' | 'pinging' | 'success' | 'failed';
type ActiveView = 'visual' | 'report';
type ReportFilter = 'all' | 'failed' | 'success';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; title?: string }
>(({ className, children, title }, ref) => {
  return (
    <div
      ref={ref}
      title={title}
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = 'Circle';

const Icons = {
  notion: () => (
    <svg
      className="size-full"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
        fill="#ffffff"
      />
      <path
        d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
        fill="#000000"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  ),
  openai: () => (
    <svg
      className="size-full"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  ),
  googleDrive: () => (
    <svg
      className="size-full"
      viewBox="0 0 87.3 78"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      <path
        d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
        fill="#00ac47"
      />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path
        d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
        fill="#00832d"
      />
      <path
        d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
        fill="#2684fc"
      />
      <path
        d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  ),
  whatsapp: () => (
    <svg
      className="size-full"
      viewBox="0 0 175.216 175.552"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="wa-grad"
          x1="85.915"
          x2="86.535"
          y1="32.567"
          y2="137.092"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
      </defs>
      <path
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        fill="#ffffff"
      />
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        fill="url(#wa-grad)"
      />
      <path
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        fill="#ffffff"
        fillRule="evenodd"
      />
    </svg>
  ),
  googleDocs: () => (
    <svg
      className="size-full"
      viewBox="0 0 47 65"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          x1="50%"
          y1="8.5%"
          x2="50%"
          y2="100%"
          id="docs-grad"
        >
          <stop stopColor="#1A237E" stopOpacity="0.2" offset="0%" />
          <stop stopColor="#1A237E" stopOpacity="0.02" offset="100%" />
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path
          d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L36.71875,10.3409091 L29.375,0 Z"
          fill="#4285F4"
          fillRule="nonzero"
        />
        <polygon
          fill="url(#docs-grad)"
          fillRule="nonzero"
          points="30.6638281 16.4309659 47 32.8582386 47 17.7272727"
        />
        <path
          d="M11.75,47.2727273 L35.25,47.2727273 L35.25,44.3181818 L11.75,44.3181818 L11.75,47.2727273 Z M11.75,53.1818182 L29.375,53.1818182 L29.375,50.2272727 L11.75,50.2272727 L11.75,53.1818182 Z M11.75,32.5 L11.75,35.4545455 L35.25,35.4545455 L35.25,32.5 L11.75,32.5 Z M11.75,41.3636364 L35.25,41.3636364 L35.25,38.4090909 L11.75,38.4090909 L11.75,41.3636364 Z"
          fill="#F1F1F1"
          fillRule="nonzero"
        />
        <path
          d="M29.375,0 L29.375,13.2954545 C29.375,15.7440341 31.3467969,17.7272727 33.78125,17.7272727 L47,17.7272727 L29.375,0 Z"
          fill="#A1C2FA"
          fillRule="nonzero"
        />
      </g>
    </svg>
  ),
  zapier: () => (
    <svg
      className="size-full"
      viewBox="0 0 244 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M57.1877 45.2253L57.1534 45.1166L78.809 25.2914V15.7391H44.0663V25.2914H64.8181L64.8524 25.3829L43.4084 45.2253V54.7775H79.1579V45.2253H57.1877Z"
        fill="#201515"
      />
      <path
        d="M100.487 14.8297C96.4797 14.8297 93.2136 15.434 90.6892 16.6429C88.3376 17.6963 86.3568 19.4321 85.0036 21.6249C83.7091 23.8321 82.8962 26.2883 82.6184 28.832L93.1602 30.3135C93.5415 28.0674 94.3042 26.4754 95.4482 25.5373C96.7486 24.5562 98.3511 24.0605 99.9783 24.136C102.118 24.136 103.67 24.7079 104.634 25.8519C105.59 26.9959 106.076 28.5803 106.076 30.6681V31.7091H95.9401C90.7807 31.7091 87.0742 32.8531 84.8206 35.1411C82.5669 37.429 81.442 40.4492 81.4458 44.2014C81.4458 48.0452 82.5707 50.9052 84.8206 52.7813C87.0704 54.6574 89.8999 55.5897 93.3089 55.5783C97.5379 55.5783 100.791 54.1235 103.067 51.214C104.412 49.426 105.372 47.3793 105.887 45.2024H106.27L107.723 54.7546H117.275V30.5651C117.275 25.5659 115.958 21.6936 113.323 18.948C110.688 16.2024 106.409 14.8297 100.487 14.8297ZM103.828 44.6475C102.312 45.9116 100.327 46.5408 97.8562 46.5408C95.8199 46.5408 94.4052 46.1843 93.6121 45.4712C93.2256 45.1338 92.9182 44.7155 92.7116 44.246C92.505 43.7764 92.4043 43.2671 92.4166 42.7543C92.3941 42.2706 92.4702 41.7874 92.6403 41.3341C92.8104 40.8808 93.071 40.4668 93.4062 40.1174C93.7687 39.7774 94.1964 39.5145 94.6633 39.3444C95.1303 39.1743 95.6269 39.1006 96.1231 39.1278H106.093V39.7856C106.113 40.7154 105.919 41.6374 105.527 42.4804C105.134 43.3234 104.553 44.0649 103.828 44.6475Z"
        fill="#201515"
      />
      <path d="M39.0441 45.2253H0V54.789H39.0441V45.2253Z" fill="#FF4F00" />
    </svg>
  ),
  messenger: () => (
    <svg
      className="size-full"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <radialGradient
        id="msg-grad"
        cx="11.087"
        cy="7.022"
        r="47.612"
        gradientTransform="matrix(1 0 0 -1 0 50)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#1292ff" />
        <stop offset=".079" stopColor="#2982ff" />
        <stop offset=".23" stopColor="#4e69ff" />
        <stop offset=".351" stopColor="#6559ff" />
        <stop offset=".428" stopColor="#6d53ff" />
        <stop offset=".754" stopColor="#df47aa" />
        <stop offset=".946" stopColor="#ff6257" />
      </radialGradient>
      <path
        fill="url(#msg-grad)"
        d="M44,23.5C44,34.27,35.05,43,24,43c-1.651,0-3.25-0.194-4.784-0.564	c-0.465-0.112-0.951-0.069-1.379,0.145L13.46,44.77C12.33,45.335,11,44.513,11,43.249v-4.025c0-0.575-0.257-1.111-0.681-1.499	C6.425,34.165,4,29.11,4,23.5C4,12.73,12.95,4,24,4S44,12.73,44,23.5z"
      />
      <path
        fill="#ffffff"
        d="M34.394,18.501l-5.7,4.22c-0.61,0.46-1.44,0.46-2.04,0.01L22.68,19.74	c-1.68-1.25-4.06-0.82-5.19,0.94l-1.21,1.89l-4.11,6.68c-0.6,0.94,0.55,2.01,1.44,1.34l5.7-4.22c0.61-0.46,1.44-0.46,2.04-0.01	l3.974,2.991c1.68,1.25,4.06,0.82,5.19-0.94l1.21-1.89l4.11-6.68C36.434,18.901,35.284,17.831,34.394,18.501z"
      />
    </svg>
  ),
  user: () => (
    <svg
      className="size-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000000"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export function PingAllModal({
  isOpen,
  onClose,
  configs,
  onComplete,
}: PingAllModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);
  const div8Ref = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('visual');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');
  const [statuses, setStatuses] = useState<Record<string, PingStatus>>({});
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [generatingTableId, setGeneratingTableId] = useState<string | null>(null);
  const [retryingSingleId, setRetryingSingleId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prevIsOpenRef = useRef(false);

  // Initialize statuses ONLY when modal transitions from closed to open!
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && configs.length > 0) {
      const initialStatus: Record<string, PingStatus> = {};
      configs.forEach((c) => {
        initialStatus[c.id] = 'idle';
      });
      setStatuses(initialStatus);
      setLatencies({});
      setErrorMessages({});
      setHasExecuted(false);
      setActiveView('visual');
      setReportFilter('all');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  const handleManualClose = () => {
    onClose();
    if (hasExecuted) {
      onComplete?.();
    }
  };

  // Ping a single config
  const handleSinglePing = async (cfg: SupabaseConfigDTO) => {
    setRetryingSingleId(cfg.id);
    setStatuses((prev) => ({ ...prev, [cfg.id]: 'pinging' }));
    const startTime = performance.now();

    try {
      const res = await api.post(`/cronjob/${cfg.id}/ping`, {
        pingMessage: `Keep-alive ping ${new Date().toISOString()}`,
      });
      const elapsed = Math.round(performance.now() - startTime);

      if (res.isSuccess) {
        setStatuses((prev) => ({ ...prev, [cfg.id]: 'success' }));
        setLatencies((prev) => ({ ...prev, [cfg.id]: elapsed }));
        setErrorMessages((prev) => {
          const copy = { ...prev };
          delete copy[cfg.id];
          return copy;
        });
      } else {
        setStatuses((prev) => ({ ...prev, [cfg.id]: 'failed' }));
        setErrorMessages((prev) => ({
          ...prev,
          [cfg.id]: res.error || 'Connection failed',
        }));
      }
    } catch (err: any) {
      setStatuses((prev) => ({ ...prev, [cfg.id]: 'failed' }));
      setErrorMessages((prev) => ({
        ...prev,
        [cfg.id]: err.message || 'Network error',
      }));
    } finally {
      setRetryingSingleId(null);
    }
  };

  // Auto-generate table then retry ping
  const handleGenerateTable = async (cfg: SupabaseConfigDTO) => {
    setGeneratingTableId(cfg.id);
    try {
      const res = await api.post(`/cronjob/${cfg.id}/generate-table`);
      if (res.isSuccess) {
        await handleSinglePing(cfg);
      } else {
        setErrorMessages((prev) => ({
          ...prev,
          [cfg.id]: `Migrasi gagal: ${res.error || 'Gagal membuat tabel'}`,
        }));
      }
    } catch (err: any) {
      setErrorMessages((prev) => ({
        ...prev,
        [cfg.id]: err.message || 'Gagal mengeksekusi migrasi',
      }));
    } finally {
      setGeneratingTableId(null);
    }
  };

  // Execute concurrent ping for all databases
  const handleStartPingAll = async (targetConfigs: SupabaseConfigDTO[] = configs) => {
    if (isPingingAll || targetConfigs.length === 0) return;
    setIsPingingAll(true);
    setHasExecuted(true);

    // Set targets to pinging
    setStatuses((prev) => {
      const copy = { ...prev };
      targetConfigs.forEach((c) => {
        copy[c.id] = 'pinging';
      });
      return copy;
    });

    const pingPromises = targetConfigs.map(async (cfg) => {
      const startTime = performance.now();
      try {
        const res = await api.post(`/cronjob/${cfg.id}/ping`, {
          pingMessage: `Animated Beam keep-alive ping ${new Date().toISOString()}`,
        });
        const elapsed = Math.round(performance.now() - startTime);

        if (res.isSuccess) {
          setStatuses((prev) => ({ ...prev, [cfg.id]: 'success' }));
          setLatencies((prev) => ({ ...prev, [cfg.id]: elapsed }));
          setErrorMessages((prev) => {
            const copy = { ...prev };
            delete copy[cfg.id];
            return copy;
          });
        } else {
          setStatuses((prev) => ({ ...prev, [cfg.id]: 'failed' }));
          setErrorMessages((prev) => ({
            ...prev,
            [cfg.id]: res.error || 'Connection failed',
          }));
        }
      } catch (err: any) {
        setStatuses((prev) => ({ ...prev, [cfg.id]: 'failed' }));
        setErrorMessages((prev) => ({
          ...prev,
          [cfg.id]: err.message || 'Network error',
        }));
      }
    });

    await Promise.all(pingPromises);
    setIsPingingAll(false);

    // Langsung buka tampilan ringkasan laporan tanpa timer / timing set!
    setActiveView('report');
  };

  // Retry only failed projects
  const handleRetryFailedOnly = () => {
    const failedConfigs = configs.filter((c) => statuses[c.id] === 'failed');
    if (failedConfigs.length > 0) {
      handleStartPingAll(failedConfigs);
    }
  };

  if (!isOpen || !mounted) return null;

  const successCount = Object.values(statuses).filter((s) => s === 'success').length;
  const failCount = Object.values(statuses).filter((s) => s === 'failed').length;
  const totalCount = configs.length;
  const progressPercent =
    totalCount > 0 ? Math.round(((successCount + failCount) / totalCount) * 100) : 0;

  const filteredConfigs = configs.filter((c) => {
    if (reportFilter === 'failed') return statuses[c.id] === 'failed';
    if (reportFilter === 'success') return statuses[c.id] === 'success';
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop (Static backdrop - modal only closes when user clicks Close/Tutup button) */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 my-auto">
        {/* Glowing Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-purple-500 to-emerald-400 shrink-0" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">
                Magic UI Animated Beam
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Real-Time Keep-Alive Hub
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="size-5 text-brand-400" /> Ping All Supabase Projects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi transmisi heartbeat serentak & laporan hasil eksekusi keep-alive database.
            </p>
          </div>
          <button
            onClick={handleManualClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('visual')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                activeView === 'visual'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Zap className="size-3.5" />
              <span>Visual Sinar Real-Time</span>
            </button>

            <button
              onClick={() => setActiveView('report')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                activeView === 'report'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <FileText className="size-3.5" />
              <span>Ringkasan & Laporan Hasil</span>
              {hasExecuted && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold ml-0.5',
                    failCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  )}
                >
                  {successCount}/{totalCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Counter Badges in Tab Bar */}
          {hasExecuted && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> {successCount} Berhasil
              </span>
              {failCount > 0 && (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="size-3" /> {failCount} Gagal
                </span>
              )}
            </div>
          )}
        </div>

        {/* View 1: Magic UI Animated Beam Stage matching Image 2 & 3 */}
        {activeView === 'visual' ? (
          <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-950/60 overflow-y-auto">
            {/* Real-time Status Banner */}
            <div className="flex items-center justify-between px-4 py-2.5 mb-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-slate-200 font-medium">
                  {isPingingAll
                    ? 'Sedang mentransmisikan keep-alive heartbeat serentak...'
                    : hasExecuted
                    ? 'Transmisi selesai. Arahkan kursor ke ikon untuk info database, atau buka Ringkasan Laporan.'
                    : 'Siap menjalankan transmisi. Klik tombol "Mulai Ping Serentak" di bawah.'}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> {successCount} Sukses
                </span>
                {failCount > 0 && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="size-3" /> {failCount} Gagal
                  </span>
                )}
              </div>
            </div>

            {/* Exact Magic UI Animated Beam Stage */}
            <div
              className="relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10 bg-white rounded-3xl border border-slate-200 shadow-2xl"
              ref={containerRef}
            >
              <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
                {/* Left: User Node */}
                <div className="flex flex-col justify-center">
                  <Circle ref={div7Ref} title="Super Admin (Trigger Origin)">
                    <Icons.user />
                  </Circle>
                </div>

                {/* Center: OpenAI Node */}
                <div className="flex flex-col justify-center">
                  <Circle
                    ref={div6Ref}
                    className={cn(
                      'size-16 transition-all duration-300',
                      isPingingAll && 'ring-4 ring-purple-400/50 shadow-purple-500/30'
                    )}
                    title="KeepAlive Hub (Cron Engine)"
                  >
                    <Icons.openai />
                  </Circle>
                </div>

                {/* Right: 5 Output Circles */}
                <div className="flex flex-col justify-center gap-2">
                  <Circle
                    ref={div1Ref}
                    title={
                      configs[0]
                        ? `${configs[0].databaseName} (${statuses[configs[0].id] || 'idle'})`
                        : 'Google Drive'
                    }
                    className={cn(
                      'transition-all duration-200 hover:scale-110',
                      statuses[configs[0]?.id] === 'success' &&
                        'ring-2 ring-emerald-500 shadow-emerald-500/20',
                      statuses[configs[0]?.id] === 'failed' &&
                        'ring-2 ring-rose-500 shadow-rose-500/20',
                      statuses[configs[0]?.id] === 'pinging' &&
                        'ring-2 ring-amber-500 animate-pulse'
                    )}
                  >
                    <Icons.googleDrive />
                  </Circle>

                  <Circle
                    ref={div2Ref}
                    title={
                      configs[1]
                        ? `${configs[1].databaseName} (${statuses[configs[1].id] || 'idle'})`
                        : 'Google Docs'
                    }
                    className={cn(
                      'transition-all duration-200 hover:scale-110',
                      statuses[configs[1]?.id] === 'success' &&
                        'ring-2 ring-emerald-500 shadow-emerald-500/20',
                      statuses[configs[1]?.id] === 'failed' &&
                        'ring-2 ring-rose-500 shadow-rose-500/20',
                      statuses[configs[1]?.id] === 'pinging' &&
                        'ring-2 ring-amber-500 animate-pulse'
                    )}
                  >
                    <Icons.googleDocs />
                  </Circle>

                  <Circle
                    ref={div3Ref}
                    title={
                      configs[2]
                        ? `${configs[2].databaseName} (${statuses[configs[2].id] || 'idle'})`
                        : 'WhatsApp'
                    }
                    className={cn(
                      'transition-all duration-200 hover:scale-110',
                      statuses[configs[2]?.id] === 'success' &&
                        'ring-2 ring-emerald-500 shadow-emerald-500/20',
                      statuses[configs[2]?.id] === 'failed' &&
                        'ring-2 ring-rose-500 shadow-rose-500/20',
                      statuses[configs[2]?.id] === 'pinging' &&
                        'ring-2 ring-amber-500 animate-pulse'
                    )}
                  >
                    <Icons.whatsapp />
                  </Circle>

                  <Circle
                    ref={div4Ref}
                    title={
                      configs[3]
                        ? `${configs[3].databaseName} (${statuses[configs[3].id] || 'idle'})`
                        : 'Messenger'
                    }
                    className={cn(
                      'transition-all duration-200 hover:scale-110',
                      statuses[configs[3]?.id] === 'success' &&
                        'ring-2 ring-emerald-500 shadow-emerald-500/20',
                      statuses[configs[3]?.id] === 'failed' &&
                        'ring-2 ring-rose-500 shadow-rose-500/20',
                      statuses[configs[3]?.id] === 'pinging' &&
                        'ring-2 ring-amber-500 animate-pulse'
                    )}
                  >
                    <Icons.messenger />
                  </Circle>

                  <Circle
                    ref={div5Ref}
                    title={
                      configs[4]
                        ? `${configs[4].databaseName} (${statuses[configs[4].id] || 'idle'})`
                        : 'Notion'
                    }
                    className={cn(
                      'transition-all duration-200 hover:scale-110',
                      statuses[configs[4]?.id] === 'success' &&
                        'ring-2 ring-emerald-500 shadow-emerald-500/20',
                      statuses[configs[4]?.id] === 'failed' &&
                        'ring-2 ring-rose-500 shadow-rose-500/20',
                      statuses[configs[4]?.id] === 'pinging' &&
                        'ring-2 ring-amber-500 animate-pulse'
                    )}
                  >
                    <Icons.notion />
                  </Circle>

                  {configs.length > 5 && (
                    <Circle
                      ref={div8Ref}
                      title={
                        configs[5]
                          ? `${configs[5].databaseName} (${statuses[configs[5].id] || 'idle'})`
                          : 'Zapier'
                      }
                      className={cn(
                        'transition-all duration-200 hover:scale-110',
                        statuses[configs[5]?.id] === 'success' &&
                          'ring-2 ring-emerald-500 shadow-emerald-500/20',
                        statuses[configs[5]?.id] === 'failed' &&
                          'ring-2 ring-rose-500 shadow-rose-500/20',
                        statuses[configs[5]?.id] === 'pinging' &&
                          'ring-2 ring-amber-500 animate-pulse'
                      )}
                    >
                      <Icons.zapier />
                    </Circle>
                  )}
                </div>
              </div>

              {/* AnimatedBeams connecting right output circles to center OpenAI circle */}
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div6Ref}
                duration={3}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div6Ref}
                duration={3}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div6Ref}
                duration={3}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div4Ref}
                toRef={div6Ref}
                duration={3}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div5Ref}
                toRef={div6Ref}
                duration={3}
              />
              {configs.length > 5 && (
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={div8Ref}
                  toRef={div6Ref}
                  duration={3}
                />
              )}

              {/* AnimatedBeam connecting center OpenAI circle to user circle */}
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div7Ref}
                duration={3}
              />
            </div>
          </div>
        ) : (
          /* View 2: Detailed Execution Summary Report */
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 min-h-[380px] max-h-[500px] space-y-5 bg-slate-900/60">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block mb-1">Total Database</span>
                <span className="text-xl font-bold text-white font-mono">{totalCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 block mb-1">✅ Berhasil</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{successCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[11px] text-rose-400 block mb-1">❌ Gagal / Error</span>
                <span className="text-xl font-bold text-rose-400 font-mono">{failCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30">
                <span className="text-[11px] text-brand-400 block mb-1">Persentase Sukses</span>
                <span className="text-xl font-bold text-brand-400 font-mono">{progressPercent}%</span>
              </div>
            </div>

            {/* Filter Pill Buttons */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReportFilter('all')}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-semibold transition-all',
                    reportFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  Semua ({totalCount})
                </button>
                <button
                  onClick={() => setReportFilter('failed')}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                    reportFilter === 'failed'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <XCircle className="size-3 text-rose-400" />
                  Gagal / Error ({failCount})
                </button>
                <button
                  onClick={() => setReportFilter('success')}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                    reportFilter === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  Berhasil ({successCount})
                </button>
              </div>

              {failCount > 0 && (
                <button
                  onClick={handleRetryFailedOnly}
                  disabled={isPingingAll}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="size-3" />
                  <span>Coba Ulang Gagal ({failCount})</span>
                </button>
              )}
            </div>

            {/* Report Cards List */}
            <div className="space-y-3">
              {filteredConfigs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
                  Tidak ada data untuk filter ini.
                </div>
              ) : (
                filteredConfigs.map((cfg) => {
                  const status = statuses[cfg.id] || 'idle';
                  const latency = latencies[cfg.id];
                  const errorMsg = errorMessages[cfg.id];
                  const isRetrying = retryingSingleId === cfg.id;
                  const isMigrating = generatingTableId === cfg.id;

                  const isTableMissing =
                    errorMsg?.toLowerCase().includes('tabel') ||
                    errorMsg?.toLowerCase().includes('table') ||
                    errorMsg?.toLowerCase().includes('does not exist');

                  const isAuthError =
                    errorMsg?.toLowerCase().includes('password') ||
                    errorMsg?.toLowerCase().includes('credential') ||
                    errorMsg?.toLowerCase().includes('enotfound');

                  return (
                    <div
                      key={cfg.id}
                      className={cn(
                        'p-4 rounded-2xl border transition-all duration-200',
                        status === 'failed' && 'bg-rose-950/20 border-rose-500/30',
                        status === 'success' && 'bg-emerald-950/20 border-emerald-500/30',
                        status === 'idle' && 'bg-slate-800/40 border-slate-800'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'p-2.5 rounded-xl shrink-0 mt-0.5',
                              status === 'success' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                              status === 'failed' && 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
                              status === 'idle' && 'bg-slate-800 text-slate-400 border border-slate-700'
                            )}
                          >
                            <Database className="size-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">
                                {cfg.databaseName}
                              </h3>
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] font-bold',
                                  status === 'success' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                                  status === 'failed' && 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
                                  status === 'idle' && 'bg-slate-800 text-slate-400'
                                )}
                              >
                                {status === 'success' && 'BERHASIL'}
                                {status === 'failed' && 'GAGAL'}
                                {status === 'idle' && 'MENUNGGU'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {cfg.accountEmail || cfg.supabaseUrl}
                            </p>
                          </div>
                        </div>

                        {/* Single Item Action Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {status === 'failed' && isTableMissing && (
                            <button
                              onClick={() => handleGenerateTable(cfg)}
                              disabled={isMigrating || isRetrying}
                              className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
                            >
                              {isMigrating ? (
                                <>
                                  <Loader2 className="size-3 animate-spin" />
                                  <span>Membuat Tabel...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="size-3" />
                                  <span>Auto-Generate Tabel</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => handleSinglePing(cfg)}
                            disabled={isRetrying || isMigrating}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {isRetrying ? (
                              <>
                                <Loader2 className="size-3 animate-spin" />
                                <span>Menguji...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="size-3" />
                                <span>Uji Ping Ulang</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Success Details Box */}
                      {status === 'success' && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                            <span>Keep-Alive Confirmed: Masa aktif 7 hari Supabase berhasil di-reset.</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400 shrink-0">
                            {latency ?? 24}ms
                          </span>
                        </div>
                      )}

                      {/* Error Summary Box (Lengkap, Tidak Terpotong, Ada Solusi) */}
                      {status === 'failed' && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1 font-mono">
                                  Penyebab Error:
                                </span>
                                <p className="text-xs text-rose-200 font-mono break-words whitespace-pre-wrap leading-relaxed">
                                  {errorMsg || 'Koneksi ke Supabase gagal dieksekusi.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actionable Suggestions */}
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="size-4 text-amber-400 shrink-0" />
                              <span>
                                {isTableMissing
                                  ? 'Tabel cronjob_keepalive belum tersedia di database. Klik tombol Auto-Generate Tabel di atas.'
                                  : isAuthError
                                  ? 'Periksa Database Password atau URL Supabase pada menu Supabase Configs.'
                                  : 'Pastikan database Supabase tidak sedang dalam status pause di dashboard Supabase.'}
                              </span>
                            </div>
                            <Link
                              href="/config"
                              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 shrink-0 underline ml-6 sm:ml-0"
                            >
                              <span>Buka Pengaturan Config</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer & Progress Controls */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {hasExecuted && (
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  {successCount} Berhasil
                </span>
                {failCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                    <XCircle className="size-3.5" />
                    {failCount} Gagal
                  </span>
                )}
                <span className="text-slate-400 font-mono">
                  {progressPercent}% Selesai
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {activeView === 'report' ? (
              <button
                onClick={() => setActiveView('visual')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Zap className="size-3.5 text-brand-400" />
                <span>Lihat Animasi Sinar</span>
              </button>
            ) : hasExecuted ? (
              <button
                onClick={() => setActiveView('report')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="size-3.5 text-brand-400" />
                <span>Buka Ringkasan Laporan</span>
              </button>
            ) : null}

            <button
              onClick={handleManualClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Tutup
            </button>

            <button
              onClick={() => handleStartPingAll()}
              disabled={isPingingAll || configs.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isPingingAll ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Mengirim Heartbeat Serentak...</span>
                </>
              ) : hasExecuted ? (
                <>
                  <RefreshCw className="size-3.5" />
                  <span>Ulangi Semua Ping</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Mulai Ping Serentak ({configs.length} Project)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PingAllModal;
