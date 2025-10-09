import type { NodeDefinition } from './types/nodes';
import {
  Send,
  AtSign,
  Instagram,
  MessageSquare,
  Clock,
  BrainCircuit,
  Image,
  Languages,
  Smile,
  Tags,
  Filter,
  ShieldCheck,
  Twitter,
  FileEdit,
  Fingerprint,
} from 'lucide-react';

export const AllNodeDefinitions: NodeDefinition[] = [
  // Triggers
  {
    id: 'new-telegram-message',
    type: 'new-telegram-message',
    name: 'הודעת טלגרם חדשה',
    category: 'טריגרים',
    icon: Send,
    description: 'מתחיל את התהליך כאשר מופיעה הודעה חדשה בערוץ או קבוצת טלגרם ספציפית.',
    inputs: [],
    outputs: [{ name: 'message', label: 'הודעה', type: 'string' }],
    parameters: [
      { name: 'channelId', label: 'מזהה ערוץ/קבוצה', type: 'string', description: 'המזהה של ערוץ או קבוצת הטלגרם למעקב.' },
    ],
  },
  {
    id: 'new-twitter-mention',
    type: 'new-twitter-mention',
    name: 'אזכור חדש ב-X (טוויטר)',
    category: 'טריגרים',
    icon: AtSign,
    description: 'מתחיל כאשר ידית ה-X (טוויטר) שלך מוזכרת בציוץ.',
    inputs: [],
    outputs: [{ name: 'tweet', label: 'ציוץ', type: 'object' }],
    parameters: [
       { name: 'handle', label: 'ידית X', type: 'string', description: 'ידית ה-X שלך (לדוגמה, @username).' },
    ],
  },
  {
    id: 'new-instagram-post',
    type: 'new-instagram-post',
    name: 'פוסט חדש באינסטגרם',
    category: 'טריגרים',
    icon: Instagram,
    description: 'מתחיל כאשר אתה מפרסם מדיה חדשה לחשבון האינסטגרם שלך.',
    inputs: [],
    outputs: [{ name: 'post', label: 'פוסט', type: 'object' }],
    parameters: [],
  },
  {
    id: 'new-discord-message',
    type: 'new-discord-message',
    name: 'הודעה חדשה בדיסקורד',
    category: 'טריגרים',
    icon: MessageSquare,
    description: 'מאזין לערוץ ספציפי בשרת דיסקורד.',
    inputs: [],
    outputs: [{ name: 'message', label: 'הודעה', type: 'object' }],
    parameters: [
      { name: 'serverId', label: 'מזהה שרת', type: 'string' },
      { name: 'channelId', label: 'מזהה ערוץ', type: 'string' },
    ],
  },
  {
    id: 'scheduled-trigger',
    type: 'scheduled-trigger',
    name: 'טריגר מתוזמן',
    category: 'טריגרים',
    icon: Clock,
    description: 'מפעיל את התהליך בזמן או במרווח זמן ספציפי (למשל, כל יום ב-9 בבוקר).',
    inputs: [],
    outputs: [{ name: 'timestamp', label: 'חותמת זמן', type: 'string' }],
    parameters: [
      { name: 'cron', label: 'ביטוי Cron', type: 'string', defaultValue: '0 9 * * *' },
    ],
  },
  
  // AI & Generative
  {
    id: 'chat-with-gemini',
    type: 'chat-with-gemini',
    name: 'צ\'אט עם Gemini',
    category: 'בינה מלאכותית וגנרטיבית',
    icon: BrainCircuit,
    description: 'השתמש ב-Google Gemini לחשיבה מתקדמת, יצירת טקסט וסיכום.',
    inputs: [{ name: 'prompt', label: 'הנחיה', type: 'string' }],
    outputs: [{ name: 'result', label: 'תוצאה', type: 'string' }],
    parameters: [
      { name: 'model', label: 'מודל', type: 'select', defaultValue: 'gemini-2.5-flash', options: [{value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash'}]},
      { name: 'prompt', label: 'הנחיית מערכת', type: 'textarea', description: 'הוראות ל-AI למלא.' },
    ],
  },
  {
    id: 'generate-image',
    type: 'generate-image',
    name: 'יצירת תמונה (Imagen)',
    category: 'בינה מלאכותית וגנרטיבית',
    icon: Image,
    description: 'יוצר תמונה מהנחיית טקסט באמצעות Imagen 2 של גוגל.',
    inputs: [{ name: 'prompt', label: 'הנחיה', type: 'string' }],
    outputs: [{ name: 'imageUrl', label: 'כתובת תמונה', type: 'string' }],
    parameters: [],
  },
  
  // Processing
  {
    id: 'translate-text',
    type: 'translate-text',
    name: 'תרגום טקסט',
    category: 'עיבוד',
    icon: Languages,
    description: 'מתרגם טקסט משפה אחת לאחרת.',
    inputs: [{ name: 'text', label: 'טקסט', type: 'string' }],
    outputs: [{ name: 'translatedText', label: 'טקסט מתורגם', type: 'string' }],
    parameters: [
      { name: 'targetLanguage', label: 'שפת יעד', type: 'string', defaultValue: 'he', description: 'למשל, "he" לעברית, "en" לאנגלית' },
    ],
  },
  {
    id: 'analyze-sentiment',
    type: 'analyze-sentiment',
    name: 'ניתוח סנטימנט',
    category: 'עיבוד',
    icon: Smile,
    description: 'קובע אם הטקסט חיובי, שלילי או ניטרלי.',
    inputs: [{ name: 'text', label: 'טקסט', type: 'string' }],
    outputs: [{ name: 'sentiment', label: 'סנטימנט', type: 'string' }],
    parameters: [],
  },
  {
    id: 'extract-entities',
    type: 'extract-entities',
    name: 'חילוץ ישויות',
    category: 'עיבוד',
    icon: Tags,
    description: 'מוציא שמות, קישורים, האשטאגים וכו\', מתוך קטע טקסט.',
    inputs: [{ name: 'text', label: 'טקסט', type: 'string' }],
    outputs: [{ name: 'entities', label: 'ישויות', type: 'object' }],
    parameters: [],
  },

  // Logic
  {
    id: 'filter',
    type: 'filter',
    name: 'מסנן',
    category: 'לוגיקה',
    icon: Filter,
    description: 'ממשיך את התהליך רק אם מתקיימים תנאים מסוימים.',
    inputs: [{ name: 'input', label: 'קלט', type: 'any' }],
    outputs: [{ name: 'passed', label: 'עבר', type: 'any' }],
    parameters: [
      { name: 'condition', label: 'תנאי', type: 'string', description: 'למשל, input.includes("חשוב")' },
    ],
  },
  {
    id: 'send-for-moderation',
    type: 'send-for-moderation',
    name: 'שלח למיתון',
    category: 'לוגיקה',
    icon: ShieldCheck,
    description: 'עוצר את התהליך ומציב תוכן בתור לאישור ידני.',
    inputs: [{ name: 'content', label: 'תוכן', type: 'any' }],
    outputs: [{ name: 'approvedContent', label: 'תוכן מאושר', type: 'any' }],
    parameters: [],
  },
  
  // Actions
  {
    id: 'publish-to-telegram',
    type: 'publish-to-telegram',
    name: 'פרסם בטלגרם',
    category: 'פעולות',
    icon: Send,
    description: 'שולח הודעה לערוץ או קבוצת טלגרם.',
    inputs: [{ name: 'message', label: 'הודעה', type: 'string' }],
    outputs: [],
    parameters: [
      { name: 'channelId', label: 'מזהה ערוץ/קבוצה', type: 'string' },
    ],
  },
  {
    id: 'post-to-twitter',
    type: 'post-to-twitter',
    name: 'פרסם ב-X (טוויטר)',
    category: 'פעולות',
    icon: Twitter,
    description: 'מפרסם ציוץ או תגובה.',
    inputs: [{ name: 'text', label: 'טקסט', type: 'string' }],
    outputs: [],
    parameters: [
      { name: 'replyToId', label: 'בתגובה למזהה ציוץ (אופציונלי)', type: 'string' },
    ],
  },
  {
    id: 'post-to-discord',
    type: 'post-to-discord',
    name: 'פרסם בדיסקורד',
    category: 'פעולות',
    icon: MessageSquare,
    description: 'שולח הודעה לערוץ דיסקורד.',
    inputs: [{ name: 'message', label: 'הודעה', type: 'string' }],
    outputs: [],
    parameters: [
      { name: 'channelId', label: 'מזהה ערוץ', type: 'string' },
    ],
  },
  {
    id: 'update-instagram-caption',
    type: 'update-instagram-caption',
    name: 'עדכן כיתוב באינסטגרם',
    category: 'פעולות',
    icon: FileEdit,
    description: 'משנה את הכיתוב של פוסט קיים באינסטגרם.',
    inputs: [
        { name: 'postId', label: 'מזהה פוסט', type: 'string' },
        { name: 'newCaption', label: 'כיתוב חדש', type: 'string' }
    ],
    outputs: [],
    parameters: [],
  },

  // GCP
  {
    id: 'gcp-get-iam-policy',
    type: 'gcp-get-iam-policy',
    name: 'קבל מדיניות IAM של GCP',
    category: 'GCP',
    icon: Fingerprint,
    description: 'מאחזר את מדיניות ה-IAM עבור משאב GCP נתון.',
    inputs: [{ name: 'resourceName', label: 'שם משאב', type: 'string' }],
    outputs: [{ name: 'policy', label: 'מדיניות (JSON)', type: 'string' }],
    parameters: [
      { name: 'resourceName', label: 'שם משאב מלא', type: 'string', description: 'לדוגמה: //cloudresourcemanager.googleapis.com/projects/my-project' },
    ],
  },
];

    