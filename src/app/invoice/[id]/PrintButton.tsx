"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-xl  text-black text-xs font-bold tracking-wide hover:bg-gray-700 active:scale-95 transition-all duration-150 shadow-sm"
    >
      <Printer size={13} />
      Download PDF
    </button>
  );
}
