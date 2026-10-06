// src/components/PersonalizedOrderPolicy.jsx
import React, { useState } from 'react';
import {
  FiAlertTriangle, FiCreditCard, FiXCircle, FiCheckCircle,
  FiChevronDown, FiChevronUp, FiInfo,
} from 'react-icons/fi';

// ─────────────────────────────────────────────
// FULL VERSION — big warning card (top of page)
// ─────────────────────────────────────────────
export const PersonalizedOrderPolicy = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Policy Warning */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        {/* Accent stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />

        <div className="flex items-start gap-3 mb-4 pl-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
            <FiAlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-base sm:text-lg">
              Personalized Order Policy
            </h3>
            <p className="text-sm text-amber-800/80 mt-1">
              Please read carefully before placing your personalized order.
            </p>
          </div>
        </div>

        <ul className="space-y-3 pl-2">
          <li className="flex items-start gap-3 bg-white/60 rounded-xl p-3 border border-amber-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <FiCreditCard size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                💳 Prepaid Only
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                COD is not available for personalized orders.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3 bg-white/60 rounded-xl p-3 border border-amber-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <FiXCircle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                🔄 No Return / Replacement
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Personalized tumblers cannot be returned or replaced once the
                order is confirmed.
              </p>
            </div>
          </li>
        </ul>

        <div className="mt-4 pt-4 border-t border-amber-200 pl-2">
          <p className="text-xs text-amber-900 font-semibold flex items-center gap-2">
            <FiInfo size={14} />
            Please check your personalization details carefully before ordering.
          </p>
        </div>
      </div>

      {/* Free customization badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#00C2D6] font-semibold">
        <FiCheckCircle size={14} />
        Free customization — no extra charges
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// COMPACT VERSION — sidebar warning (always visible)
// ─────────────────────────────────────────────
export const PersonalizedOrderPolicyCompact = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4 rounded-xl overflow-hidden border-2 border-amber-300 bg-amber-50 shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-2.5 p-3 text-left hover:bg-amber-100/50 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <FiAlertTriangle size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-amber-900 leading-tight">
            Personalized Order Policy
          </p>
          <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
            Prepaid only · No returns
          </p>
        </div>
        <span className="text-amber-700 flex-shrink-0 mt-1">
          {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-amber-200 space-y-2">
          <div className="flex items-start gap-2 pt-2.5">
            <FiCreditCard size={13} className="text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-amber-900">
                Prepaid Only
              </p>
              <p className="text-[10px] text-amber-800 leading-snug mt-0.5">
                COD is not available for personalized orders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <FiXCircle size={13} className="text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-amber-900">
                No Return / Replacement
              </p>
              <p className="text-[10px] text-amber-800 leading-snug mt-0.5">
                Personalized tumblers cannot be returned or replaced once the
                order is confirmed.
              </p>
            </div>
          </div>

          <div className="pt-2 mt-1 border-t border-amber-200">
            <p className="text-[10px] text-amber-900 font-semibold flex items-start gap-1.5 leading-snug">
              <FiInfo size={11} className="mt-0.5 flex-shrink-0" />
              Check your personalization details carefully before ordering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Default export = full version (backwards compatible)
export default PersonalizedOrderPolicy;