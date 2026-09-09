import React from 'react';
import { AlertCircle, WifiOff, RotateCcw } from 'lucide-react';
import axios from 'axios';

interface NetworkErrorBannerProps {
  error: unknown;
  onRetry: () => void;
  className?: string;
}

export const NetworkErrorBanner: React.FC<NetworkErrorBannerProps> = ({
  error,
  onRetry,
  className = ''
}) => {
  if (!error) return null;

  let isOffline = false;
  let title = 'Something went wrong while loading data.';
  let description = 'The server encountered an error processing your request.';

  if (axios.isAxiosError(error)) {
    // Case 1: Backend Offline / Network Error / Connection Refused / Timeout
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('refused')
    ) {
      isOffline = true;
      title = 'Unable to connect to Self Print server.';
      description = 'Please check your internet connection or ensure the backend server is running.';
    } else if (error.response.status === 401 || error.response.status === 403) {
      title = 'Session authentication required.';
      description = (error.response.data as any)?.message || 'Please log in to access this data.';
    } else if (error.response.status >= 500) {
      // Case 2: API / Server Error (500)
      title = 'Something went wrong while loading data.';
      description = (error.response.data as any)?.message || `Internal server error (${error.response.status}).`;
    } else {
      title = 'Request could not be completed.';
      description = (error.response.data as any)?.message || error.message;
    }
  } else if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Network')) {
      isOffline = true;
      title = 'Unable to connect to Self Print server.';
      description = 'Please check your connection and ensure the backend is reachable.';
    } else {
      title = 'Something went wrong while loading data.';
      description = error.message;
    }
  }

  return (
    <div
      className={`p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200 ${className}`}
    >
      <div className="flex items-center gap-3">
        {isOffline ? (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        <div>
          <p className="text-xs font-bold text-rose-900">{title}</p>
          <p className="text-xs text-rose-600 mt-0.5">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );
};

export default NetworkErrorBanner;
