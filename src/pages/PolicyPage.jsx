// src/pages/PolicyPage.jsx
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiMail, FiGlobe, FiInstagram } from 'react-icons/fi';
import { policies, CONTACT_INFO } from '../utils/policies';
import SEO from '../components/SEO';

const PolicyPage = ({ slug: slugProp }) => {
   const { slug: slugParam } = useParams();
   const slug = slugProp || slugParam;
   const policy = policies[slug];

  if (!policy) return <Navigate to="/" replace />;

  return (
    <>
      <SEO
        title={`${policy.title} — Smooth Sip`}
        description={`Read the ${policy.title} for Smooth Sip.`}
        type="article"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F8FBFC] to-white">
        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 flex-wrap">
              <Link to="/" className="hover:text-[#00C2D6] transition">Home</Link>
              <FiChevronRight size={14} className="text-gray-300" />
              <span className="text-gray-700 font-medium">{policy.title}</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
            >
              {policy.title}
            </motion.h1>

            <p className="mt-3 text-xs sm:text-sm text-gray-500">
              Last Updated: {policy.lastUpdated}
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
            {policy.sections.map((section, idx) => (
              <section key={idx} className={idx > 0 ? 'mt-8 pt-8 border-t border-gray-100' : ''}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {section.heading}
                </h2>

                {section.body?.map((p, i) => (
                  <p key={i} className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-3">
                    {p}
                  </p>
                ))}

                {section.list && (
                  <ul className="mt-3 space-y-2 list-none">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm sm:text-[15px] text-gray-600 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00C2D6] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.after?.map((p, i) => (
                  <p key={i} className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mt-3">
                    {p}
                  </p>
                ))}

                {section.contact && (
                  <div className="mt-4 bg-[#F8FBFC] border border-[#E1EEF1] rounded-xl p-5 space-y-3">
                    <p className="text-sm font-semibold text-gray-900">{CONTACT_INFO.brand}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMail size={14} className="text-[#00C2D6]" />
                      <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-[#00C2D6] transition">
                        {CONTACT_INFO.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiGlobe size={14} className="text-[#00C2D6]" />
                      <a href={`https://${CONTACT_INFO.website}`} className="hover:text-[#00C2D6] transition">
                        {CONTACT_INFO.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiInstagram size={14} className="text-[#00C2D6]" />
                      <span>{CONTACT_INFO.instagram}</span>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-8">
            Questions? Email us at{' '}
            <a href={`mailto:${CONTACT_INFO.email}`} className="text-[#00C2D6] hover:underline">
              {CONTACT_INFO.email}
            </a>
          </p>
        </article>
      </div>
    </>
  );
};

export default PolicyPage;