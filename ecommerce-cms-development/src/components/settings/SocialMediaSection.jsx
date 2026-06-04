import SectionWrapper from "./SectionWrapper";
import FieldRow from "./FieldRow";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import Error from "@/components/form/others/Error";
import { FiFacebook, FiInstagram, FiYoutube, FiGlobe } from "react-icons/fi";
import { FaTiktok, FaPinterestP, FaWhatsapp, FaLink } from "react-icons/fa";

// Must match SOCIAL_CONFIG keys in web/components/Themes/KidsTheme/Footer.jsx
const SOCIALS = [
  {
    name: "social_facebook",
    label: "Facebook",
    icon: FiFacebook,
    placeholder: "https://facebook.com/yourpage",
  },
  {
    name: "social_instagram",
    label: "Instagram",
    icon: FiInstagram,
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    name: "social_tiktok",
    label: "TikTok",
    icon: FaTiktok,
    placeholder: "https://tiktok.com/@yourhandle",
  },
  {
    name: "social_pinterest",
    label: "Pinterest",
    icon: FaPinterestP,
    placeholder: "https://pinterest.com/yourprofile",
  },
  {
    name: "social_youtube",
    label: "YouTube",
    icon: FiYoutube,
    placeholder: "https://youtube.com/@yourchannel",
  },
  {
    name: "social_linktree",
    label: "Linktree",
    icon: FaLink,
    placeholder: "https://linktr.ee/yourhandle",
  },
  {
    name: "social_website",
    label: "Website",
    icon: FiGlobe,
    placeholder: "https://yourwebsite.com",
  },
  {
    name: "social_whatsapp",
    label: "WhatsApp (social link)",
    icon: FaWhatsapp,
    placeholder: "https://wa.me/923000000000",
  },
];

const SocialMediaSection = ({ hook }) => {
  const { isSubmitting, register, errors } = hook;

  return (
    <SectionWrapper
      title="Social Media Links"
      description="Add your social media profile URLs. Leave blank to hide a platform in the footer."
      isSubmitting={isSubmitting}
    >
      {SOCIALS.map(({ name, label, icon: Icon, placeholder }) => (
        <FieldRow key={name} label={label}>
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-customGray-500 shrink-0" />
            <InputAreaTwo
              register={register}
              name={name}
              type="url"
              placeholder={placeholder}
              label={label}
            />
          </div>
          <Error errorName={errors[name]} />
        </FieldRow>
      ))}
    </SectionWrapper>
  );
};

export default SocialMediaSection;
