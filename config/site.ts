/**
 * Centralized Site & Branding Configuration
 *
 * Single source of truth for site name, titles, descriptions, and page titles.
 * Modify values here to safely update the entire application.
 * Visual branding (logo/favicon URLs) is managed by Cloudinary via config/brandTheme.ts.
 */

export const SiteConfig = {
  site: {
    name: "ইউনিক টিচিং মেথড",
    title: "ইউনিক টিচিং মেথড - Unique Teaching Method",
    company: "ইউনিক টিচিং মেথড",
    tagline: "Unique Teaching Method",
    description: "ইউনিক টিচিং মেথড - আধুনিক ও সহজ পদ্ধতিতে পাঠদান ও বিশ্বমানের অনলাইন শিক্ষা প্ল্যাটফর্ম।",
    url: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
    logoText: "UTM",
  },

  pages: {
    dashboard: "ড্যাশবোর্ড",
    profile: "প্রোফাইল ও সেটিংস",
    settings: "সেটিংস",
    activity: "কার্যক্রম লগ",
    notifications: "নোটিফিকেশনসমূহ",
    files: "ফাইল ও মিডিয়া",
    support: "সহায়তা ও যোগাযোগ",
    login: "লগইন",
    signup: "রেজিস্ট্রেশন",
    forget: "পাসওয়ার্ড রিসেট",
    teachers: "আমাদের শিক্ষকবৃন্দ",
    coordinators: "আমাদের কো-অর্ডিনেটরবৃন্দ",
    about: "আমাদের সম্পর্কে",
  },

  seo: {
    title: {
      default: "ইউনিক টিচিং মেথড - Unique Teaching Method",
      template: "%s | ইউনিক টিচিং মেথড",
    },
    description: "ইউনিক টিচিং মেথড - আধুনিক ও মানসম্মত পাঠদান, আকর্ষণীয় ভিডিও ক্লাস এবং সম্পূর্ণ শিক্ষামূলক রিসোর্স প্ল্যাটফর্ম।",
    keywords: ["ইউনিক টিচিং মেথড", "Unique Teaching Method", "UTM", "অনলাইন ক্লাস", "শিক্ষা", "কোর্স", "টিচিং মেথড", "এডুকেশন"],
    image: "/og-image.png",
  },
}

/**
 * Type-safe helper to format a page title with the site name.
 * @param pageKey The key from SiteConfig.pages or a custom title string
 */
export function getPageTitle(pageKeyOrTitle: keyof typeof SiteConfig.pages | string): string {
  const pageTitle = (SiteConfig.pages as Record<string, string>)[pageKeyOrTitle] || pageKeyOrTitle
  return `${pageTitle} | ${SiteConfig.site.name}`
}

export default SiteConfig