import React from 'react';
import Head from 'next/head';
import { WifiOffIcon } from '@heroicons/react/24/outline';

export default function OfflinePage() {
  return (
    <>
      <Head>
        <title>Offline - JustMaily</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <WifiOffIcon className="h-24 w-24 text-gray-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            You're Offline
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please check your internet connection and try again.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 