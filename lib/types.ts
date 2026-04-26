export type Language = "zh" | "en" | "ja";
export type InputTab = "upload" | "record" | "url";
export type AppStage = "input" | "processing" | "result";

export interface TranscriptSegment {
  id: number;
  start: number; // seconds
  end: number;
  text: string;
  speaker: string;
  speakerIndex: number;
}

export interface AppResult {
  fileName: string;
  fileSize: number; // bytes
  duration: number; // seconds
  language: string;
  speakerCount: number;
  segments: TranscriptSegment[];
  fullText: string;
  keyPoints: string[];
  actionItems: string[];
  suggestions: string[];
}

export const SPEAKER_STYLES: { name: string; dot: string; bubble: string }[] = [
  { name: "text-[#C4522A]", dot: "bg-[#C4522A]", bubble: "bg-[#FAD9CB]" },
  { name: "text-[#2A7C6F]", dot: "bg-[#2A7C6F]", bubble: "bg-[#CCFBF1]" },
  { name: "text-[#6B3FA0]", dot: "bg-[#6B3FA0]", bubble: "bg-[#EDE9FE]" },
  { name: "text-[#2563EB]", dot: "bg-[#2563EB]", bubble: "bg-[#DBEAFE]" },
  { name: "text-[#0F766E]", dot: "bg-[#0F766E]", bubble: "bg-[#CCFBF1]" },
];

export const LANG_OPTIONS = [
  { value: "zh" as Language, label: "繁體中文", flag: "🇹🇼", whisper: "zh" },
  { value: "en" as Language, label: "English", flag: "🇺🇸", whisper: "en" },
  { value: "ja" as Language, label: "日本語", flag: "🇯🇵", whisper: "ja" },
];
