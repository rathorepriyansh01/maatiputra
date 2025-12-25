import { NewsArticle, Language } from '../types';

const MOCK_NEWS_EN: NewsArticle[] = [
  {
    id: '1',
    title: "PM-Kisan 17th Installment Released: Check Your Status",
    description: "The government has released the latest installment of PM-Kisan Samman Nidhi. Over 9 crore farmers to benefit.",
    imageUrl: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=400",
    source: "AgriNews India",
    publishedAt: "2 hours ago",
    url: "https://pmkisan.gov.in/",
    category: 'Scheme'
  },
  {
    id: '2',
    title: "Soybean Prices Surge in MP Mandis as Demand Increases",
    description: "Market experts predict a 15% rise in soybean prices over the next month due to export demands.",
    imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400",
    source: "Market Pulse",
    publishedAt: "5 hours ago",
    url: "#",
    category: 'Market'
  },
  {
    id: '3',
    title: "New Drone Technology for Precision Fertilizer Spraying",
    description: "How Indian startups are helping farmers reduce fertilizer waste using AI-powered drones.",
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400",
    source: "Tech Farmer",
    publishedAt: "1 day ago",
    url: "#",
    category: 'Tech'
  }
];

const MOCK_NEWS_HI: NewsArticle[] = [
  {
    id: '1',
    title: "पीएम-किसान 17वीं किस्त जारी: अपना स्टेटस चेक करें",
    description: "सरकार ने पीएम-किसान सम्मान निधि की ताजा किस्त जारी कर दी है। 9 करोड़ से अधिक किसानों को लाभ होगा।",
    imageUrl: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=400",
    source: "एग्रीन्यूज इंडिया",
    publishedAt: "2 घंटे पहले",
    url: "https://pmkisan.gov.in/",
    category: 'Scheme'
  },
  {
    id: '2',
    title: "मांग बढ़ने से एमपी की मंडियों में सोयाबीन की कीमतों में उछाल",
    description: "बाजार विशेषज्ञों का अनुमान है कि निर्यात मांग के कारण अगले महीने सोयाबीन की कीमतों में 15% की वृद्धि होगी।",
    imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400",
    source: "मार्केट पल्स",
    publishedAt: "5 घंटे पहले",
    url: "#",
    category: 'Market'
  },
  {
    id: '3',
    title: "सटीक उर्वरक छिड़काव के लिए नई ड्रोन तकनीक",
    description: "भारतीय स्टार्टअप एआई-संचालित ड्रोन का उपयोग करके किसानों को उर्वरक बर्बादी कम करने में कैसे मदद कर रहे हैं।",
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400",
    source: "टेक फार्मर",
    publishedAt: "1 दिन पहले",
    url: "#",
    category: 'Tech'
  }
];

export const fetchAgriNews = async (lang: Language): Promise<NewsArticle[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return lang === 'hi' ? MOCK_NEWS_HI : MOCK_NEWS_EN;
};