"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4">
      <div className="text-center max-w-xl mx-auto">
        <div className="mb-6 flex justify-center">
          <Image
            src="/Wire2WebLogo.png"
            alt="Wire2Web Logo"
            width={80}
            height={80}
            className="w-20 h-20"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          We're working hard to bring you amazing new features. Please check back later!
        </p>
        <Link
          href="/"
          className="inline-flex justify-center items-center gap-x-2 rounded-md bg-blue-600 hover:bg-blue-700 py-3 px-6 text-white font-medium transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 