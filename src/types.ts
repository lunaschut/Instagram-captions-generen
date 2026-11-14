export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'pinterest';

export type TargetAudienceType =
  | 'auto'
  | 'newborn'
  | 'family'
  | 'teens'
  | 'adults'
  | 'seniors'
  | 'couples'
  | 'wedding'
  | 'maternity'
  | 'business'
  | 'pets'
  | 'custom';

export interface PhotoAnalysis {
  summary: string;
  detectedElements: string[];
  locationGuess: string;
  activity: string;
  mood: string;
  colors: string[];
  timeOfDayOrSeason: string;
  category: string;
  detectedAudience?: string;
}

export interface CaptionOption {
  id: string;
  platform?: SocialPlatform;
  styleName: string;
  hook: string;
  captionBody: string;
  callToAction: string;
  suggestedLocation: string;
  hashtags: string[];
}

export interface PlatformCaptionsGroup {
  platform: SocialPlatform;
  platformName: string;
  description?: string;
  captions: CaptionOption[];
}

export interface GenerationSettings {
  platforms: SocialPlatform[];
  targetAudience: TargetAudienceType;
  customAudience?: string;
  language: 'nl' | 'en' | 'bilingual';
  vibePreference: string;
  emojiPreference: 'lots' | 'subtle' | 'none';
  hashtagCount: '1-3' | '3-5' | 'none';
}

export interface SavedCaption {
  id: string;
  imageUrl: string;
  platform?: SocialPlatform;
  caption: string;
  hashtags: string[];
  location: string;
  styleName: string;
  timestamp: number;
}

export interface SamplePhoto {
  id: string;
  title: string;
  description: string;
  contextHint: string;
  imagePath: string;
  suggestedAudience?: TargetAudienceType;
}
