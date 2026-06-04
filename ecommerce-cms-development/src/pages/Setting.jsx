import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiImage, FiDroplet, FiMapPin, FiPhone, FiMail,
  FiPackage, FiShare2, FiTag, FiSearch, FiSettings,
} from 'react-icons/fi';

import PageTitle from '@/components/Typography/PageTitle';
import AnimatedContent from '@/components/common/AnimatedContent';
import useSettingSubmit from '@/hooks/useSettingSubmit';
import useBrandSettingSubmit from '@/hooks/useBrandSettingSubmit';

// ─── section wrappers ────────────────────────────────────────────────────────
import BrandIdentitySection from '@/components/settings/BrandIdentitySection';
import BrandColorsSection from '@/components/settings/BrandColorsSection';
import BusinessInfoSection from '@/components/settings/BusinessInfoSection';
import MaxQtySection from '@/components/settings/MaxQtySection';
import SocialMediaSection from '@/components/settings/SocialMediaSection';
import GlobalDiscountSection from '@/components/settings/GlobalDiscountSection';
import SeoMetaSection from '@/components/settings/SeoMetaSection';

// ─── generic setting (store/global) kept in a separate tab ──────────────────
import GeneralSettingsTab from '@/components/settings/GeneralSettingsTab';

const TABS = [
//   { id: 'general',  label: 'General',        icon: FiSettings },
  { id: 'brand',    label: 'Brand & Logos',   icon: FiImage },
  { id: 'colors',   label: 'Brand Colors',    icon: FiDroplet },
  { id: 'contact',  label: 'Contact & Address', icon: FiMapPin },
  { id: 'social',   label: 'Social Media',    icon: FiShare2 },
  { id: 'orders',   label: 'Orders',          icon: FiPackage },
  { id: 'discount', label: 'Discount & Sale', icon: FiTag },
  { id: 'seo',      label: 'SEO & Meta',      icon: FiSearch },
];

const Setting = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("brand");

  const generalHook = useSettingSubmit();
  const brandHook   = useBrandSettingSubmit();

  return (
	<>
	  <PageTitle>{t('Setting')}</PageTitle>
	  <AnimatedContent>
		<div className="sm:container w-full md:p-6 p-4 mx-auto bg-customWhite dark:bg-customGray-800 dark:text-customGray-200 rounded-lg">
		  {/* Tab Nav */}
		  <div className="flex flex-wrap gap-1 border-b border-customGray-200 dark:border-customGray-700 mb-8">
			{TABS.map((tab) => {
			  const Icon = tab.icon;
			  return (
				<button
				  key={tab.id}
				  onClick={() => setActiveTab(tab.id)}
				  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-md transition-colors
					${activeTab === tab.id
					  ? 'bg-customBlue-600 text-white'
					  : 'text-customGray-600 dark:text-customGray-300 hover:bg-customGray-100 dark:hover:bg-customGray-700'
					}`}
				>
				  <Icon size={14} />
				  {tab.label}
				</button>
			  );
			})}
		  </div>

		  {/* Tab Panels */}
		  {activeTab === 'general' && <GeneralSettingsTab hook={generalHook} />}

		  {activeTab === 'brand' && (
			<form onSubmit={brandHook.handleSubmit(brandHook.onSubmit)}>
			  <BrandIdentitySection hook={brandHook} />
			</form>
		  )}

		  {activeTab === 'colors' && (
			<form onSubmit={brandHook.handleSubmit(brandHook.onSubmit)}>
			  <BrandColorsSection hook={brandHook} />
			</form>
		  )}

		  {activeTab === 'contact' && (
			<form onSubmit={brandHook.handleSubmit(brandHook.onSubmit)}>
			  <BusinessInfoSection hook={brandHook} />
			</form>
		  )}

		  {activeTab === 'social' && (
			<form onSubmit={brandHook.handleSubmit(brandHook.onSubmit)}>
			  <SocialMediaSection hook={brandHook} />
			</form>
		  )}

		  {activeTab === 'orders' && (
			<form onSubmit={brandHook.handleSubmit(brandHook.onSubmit)}>
			  <MaxQtySection hook={brandHook} />
			</form>
		  )}

		  {activeTab === 'discount' && (
			<form onSubmit={brandHook.handleSubmit(brandHook.onSubmit)}>
			  <GlobalDiscountSection hook={brandHook} />
			</form>
		  )}

		  {activeTab === 'seo' && (
			<form onSubmit={brandHook.handleSubmit(brandHook.onSubmit)}>
			  <SeoMetaSection hook={brandHook} />
			</form>
		  )}
		</div>
	  </AnimatedContent>
	</>
  );
};

export default Setting;
