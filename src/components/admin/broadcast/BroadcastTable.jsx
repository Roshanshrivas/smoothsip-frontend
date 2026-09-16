// src/components/admin/broadcast/BroadcastTable.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Mail,
  MessageCircle,
  Smartphone,
  Bell,
  Send,
} from "lucide-react";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { ChannelBadge } from "./ChannelBadge";
import CampaignDetailModal from "./CampaignDetailModal";

const channelIcons = {
  email: Mail,
  whatsapp: MessageCircle,
  sms: Smartphone,
  push: Bell,
};

export const BroadcastTable = ({ campaigns, onAction }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (campaign) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleAction = (action, campaign) => {
    if (action === "view") {
      openModal(campaign);
      return;
    }
    onAction(action, campaign);
  };

  const handleRowClick = (campaign) => {
    openModal(campaign);
  };

  // Compute delivered percentage
  const getDeliveredPercent = (delivered, audienceCount) => {
    if (!audienceCount || audienceCount === 0) return "—";
    return `${Math.round((delivered / audienceCount) * 100)}%`;
  };

  // Format audience with count
  const getAudienceDisplay = (campaign) => {
    const count = campaign.audienceCount || 0;
    return `${campaign.audience} (${count.toLocaleString()})`;
  };

  return (
    <>
      <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="w-[28%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Channel
                </th>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Audience
                </th>
                <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Sent
                </th>
                <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                  Delivered
                </th>
                <th className="w-[12%] px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {campaigns.map((campaign) => {
                const Icon = channelIcons[campaign.channel] || Mail;
                const deliveredPercent = getDeliveredPercent(
                  campaign.delivered,
                  campaign.audienceCount
                );

                return (
                  <motion.tr
                    key={campaign.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleRowClick(campaign)}
                  >
                    {/* Campaign Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {campaign.thumbnailImage ? (
                          <img
                            src={campaign.thumbnailImage}
                            alt={campaign.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                            <Icon size={18} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {campaign.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {campaign.created}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Channel Column */}
                    <td className="px-4 py-3">
                      <ChannelBadge channel={campaign.channel} />
                    </td>

                    {/* Audience Column – no icon */}
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs hidden sm:table-cell truncate">
                      {getAudienceDisplay(campaign)}
                    </td>

                    {/* Status Column – no icon, just badge */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>

                    {/* Sent Column */}
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs hidden lg:table-cell">
                      {campaign.sentCount?.toLocaleString() || "—"}
                    </td>

                    {/* Delivered Column */}
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs hidden xl:table-cell">
                      <div className="flex flex-col">
                        <span>
                          {campaign.delivered > 0
                            ? campaign.delivered.toLocaleString()
                            : "—"}
                        </span>
                        {deliveredPercent !== "—" && (
                          <span className="text-[10px] text-gray-400">
                            {deliveredPercent}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleAction("edit", campaign)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleAction("delete", campaign)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {campaigns.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <Send size={32} className="text-gray-300 dark:text-gray-600" />
              <p>No campaigns found</p>
              <p className="text-xs">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>

      <CampaignDetailModal
        isOpen={modalOpen}
        onClose={closeModal}
        campaign={selectedCampaign}
        onAction={onAction}
      />
    </>
  );
};

export default BroadcastTable;