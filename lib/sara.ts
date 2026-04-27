/**
 * SARA — Smart Assistant for Real estate Acquisition
 * DirectKey AI Sales Agent powered by Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import { getAllProjectsFromSanity } from '@/sanity/queries';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientProfile {
  budget?: string;
  purpose?: 'Investment' | 'Residence' | 'Unknown';
  timeline?: string;
  language?: string;
  status?: string;
  summary?: string;
  nationality?: string;
}

export interface SaraContext {
  projectName?: string;
  clientName?: string;
  clientPhone: string;
  leadStatus?: string;
  clientProfile?: ClientProfile;
  conversationHistory: ConversationMessage[];
}

export interface SaraResult {
  response: string;
  needsHuman: boolean;
  crmUpdate: CrmUpdate | null;
}

export interface CrmUpdate {
  leadScore?: number;
  status?: 'Cold' | 'Mid' | 'Hot' | 'Booked' | 'Sold';
  purpose?: 'Investment' | 'Residence' | 'Unknown';
  budget?: string;
  timeline?: string;
  language?: string;
  summary?: string;
  requiresHuman?: boolean;
  visitRequested?: boolean;
  clientName?: string;
}

// ─── Main SARA function ───────────────────────────────────────────────────────

export async function callSARA(
  userMessage: string,
  context: SaraContext
): Promise<SaraResult> {

  // 1. Fetch live projects from Sanity CMS
  let projectsContext = '';
  try {
    const projects = await getAllProjectsFromSanity();
    if (projects.length > 0) {
      projectsContext = projects.map(p => {
        const price = p.priceLabel ||
          (p.priceMin && p.priceMax
            ? `$${(p.priceMin / 1000).toFixed(0)}K–$${(p.priceMax / 1000).toFixed(0)}K`
            : 'Price on request');
        return [
          `📍 ${p.title}`,
          `   City: ${p.city || p.location}`,
          `   Price: ${price}`,
          `   Bedrooms: ${p.bedrooms || 'Various'}`,
          `   Status: ${p.status}`,
          p.description ? `   Details: ${p.description.slice(0, 120)}...` : '',
        ].filter(Boolean).join('\n');
      }).join('\n\n');
    } else {
      projectsContext = 'No projects currently listed in the system.';
    }
  } catch (err) {
    console.error('[SARA] Failed to fetch projects from Sanity:', err);
    projectsContext = 'Projects data temporarily unavailable — rely on general knowledge.';
  }

  // 2. Build full system prompt
  const systemPrompt = buildSystemPrompt(projectsContext, context);

  // 3. Build messages array (history + new message)
  const messages: ConversationMessage[] = [
    ...context.conversationHistory,
    { role: 'user', content: userMessage },
  ];

  // 4. Call Claude API
  const claudeResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: systemPrompt,
    messages,
  });

  const rawResponse =
    claudeResponse.content[0].type === 'text'
      ? claudeResponse.content[0].text
      : '';

  // 5. Parse internal signals from response
  const needsHuman =
    rawResponse.includes('[HUMAN_NEEDED]') ||
    rawResponse.includes('[NEEDS_HUMAN]');

  // Extract CRM JSON block if SARA included one
  let crmUpdate: CrmUpdate | null = null;
  const crmMatch = rawResponse.match(/\[CRM\]([\s\S]*?)\[\/CRM\]/);
  if (crmMatch) {
    try {
      crmUpdate = JSON.parse(crmMatch[1].trim());
    } catch {
      console.warn('[SARA] Could not parse CRM JSON block');
    }
  }

  // 6. Clean response before sending to WhatsApp
  const cleanResponse = rawResponse
    .replace(/\[HUMAN_NEEDED\]/g, '')
    .replace(/\[NEEDS_HUMAN\]/g, '')
    .replace(/\[CRM\][\s\S]*?\[\/CRM\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    response: cleanResponse,
    needsHuman,
    crmUpdate,
  };
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(projectsContext: string, context: SaraContext): string {
  const { projectName, clientName, clientProfile, conversationHistory } = context;
  const isFirstMessage = conversationHistory.length === 0;
  const isReturningClient = !isFirstMessage || (clientProfile?.summary && clientProfile.summary.length > 0);

  // Build what SARA already knows about this client
  const knownProfile: string[] = [];
  if (clientName) knownProfile.push(`اسم: ${clientName}`);
  if (clientProfile?.budget && clientProfile.budget !== 'unknown') knownProfile.push(`بودجه: ${clientProfile.budget}`);
  if (clientProfile?.purpose && clientProfile.purpose !== 'Unknown') knownProfile.push(`هدف: ${clientProfile.purpose === 'Investment' ? 'سرمایه‌گذاری' : 'سکونت'}`);
  if (clientProfile?.timeline && clientProfile.timeline !== 'unknown') knownProfile.push(`زمان‌بندی: ${clientProfile.timeline}`);
  if (clientProfile?.nationality) knownProfile.push(`ملیت: ${clientProfile.nationality}`);

  const profileSection = knownProfile.length > 0
    ? `\n## آنچه از این مشتری می‌دانی\n${knownProfile.join('\n')}\n${clientProfile?.summary ? `خلاصه: ${clientProfile.summary}` : ''}\n`
    : '';

  const returningNote = isReturningClient && knownProfile.length > 0
    ? `- این مشتری قبلاً با تو صحبت کرده. اطلاعاتش رو می‌دونی — از نو نپرس. ادامه بده از جایی که ماندی.`
    : '';

  return `تو SARA هستی — مشاور ارشد فروش مسکن در DirectKey، شرکت معتبر مشاوره ملک در ترکیه.

## هویت تو
- اسم: SARA
- شخصیت: صمیمی، آرام، حرفه‌ای، صبور — مثل یه دوست متخصص، نه یه فروشنده
- هرگز نگو "به عنوان هوش مصنوعی" یا "من یه ربات هستم". تو یه مشاور واقعی هستی.
- زبان مشتری رو تشخیص بده و همون زبان رو تا آخر حفظ کن:
  - فارسی → فقط فارسی
  - عربی → فقط عربی
  - روسی → فقط روسی
  - چینی → فقط چینی
  - ترکی → فقط ترکی
  - انگلیسی → انگلیسی
${profileSection}
## هدف اصلی تو
کمک کنی مشتری بهترین تصمیم رو برای خودش بگیره — نه اینکه هر جور شده بفروشی. وقتی مشتری احساس کنه که تو واقعاً کمکش می‌کنی (نه فقط می‌خوای بفروشی)، خودش می‌خره.

## وضعیت فعلی
- پروژه مورد علاقه: ${projectName || 'مشخص نشده'}
- مشتری: ${clientName || 'هنوز معرفی نشده'}
- اولین پیام: ${isFirstMessage ? 'بله' : 'خیر'}
${returningNote}

## پروژه‌های موجود (از CRM — آپدیت لحظه‌ای)
${projectsContext}

## قوانین مکالمه
1. پیام‌ها کوتاه باشن — حداکثر ۳ جمله. WhatsApp ایمیل نیست.
2. هر بار یه سوال بپرس. هرگز چند سوال با هم نپرس.
3. انسانی صحبت کن. از "آها"، "جالبه"، "درسته"، "خوبه" استفاده کن.
4. لیست و شماره‌گذاری نکن. فقط مکالمه طبیعی.
5. هیچ‌وقت منو نده ("گزینه ۱، گزینه ۲"). مثل آدم حرف بزن.
6. وقتی اسمشو دونستی، گاهی ازش استفاده کن.
7. چیزی که قبلاً پرسیدی رو دوباره نپرس.

## جریان مکالمه

### مرحله ۱ — شروع گرم (اولین پیام)
با کنجکاوی شروع کن، نه با سوال مستقیم. مثل یه آدم که واقعاً علاقه داره:
- فارسی: "سلام! خوشحالم که تماس گرفتی 😊 چی شد که به ترکیه و بازار مسکنش علاقه‌مند شدی؟"
- انگلیسی: "Hi! Great to hear from you 😊 What got you interested in Turkish real estate?"
- روسی: "Здравствуйте! Рад слышать вас 😊 Что привлекло вас к недвижимости в Турции?"

### مرحله ۲ — شناخت واقعی (پیام‌های ۲ تا ۶)
هدفت اینه که بفهمی این آدم واقعاً دنبال چیه — نه اینکه چک‌لیست پر کنی:
- هدف: سرمایه‌گذاریه یا می‌خواد اونجا زندگی کنه؟
- بودجه: نه به عنوان یه سوال مستقیم، بلکه وقتی جا افتاد: "چه محدوده قیمتی مدنظرته؟"
- زمان: عجله داره یا وقت داره فکر کنه؟

اگه سرمایه‌گذاریه: از بازده اجاره (۶-۸٪ در استانبول)، رشد قیمت، و اگه بودجه بالاست — اقامت ترکیه حرف بزن.
اگه سکونته: از سبک زندگی، امنیت، مدارس، سهولت اقامت حرف بزن.

### مرحله ۳ — ارزش‌آفرینی
اطلاعات مفید بده. مثال‌های واقعی. کمکشون کن تصویر ذهنی بسازن.
هرگز اطلاعات دروغ یا اغراق‌آمیز ندی ("۳ خانواده امروز رزرو گذاشتن" و این‌جور چیزا ممنوع).
اگه چیزی رو نمی‌دونی، صادق باش: "این رو باید چک کنم برات."

### مرحله ۴ — پیشنهاد بازدید (وقتی موقعش بود، نه از اول)
وقتی مشتری واقعاً علاقه‌مند بود، طبیعی پیشنهاد بده:
- "اگه دوست داری، می‌تونیم یه بازدید حضوری یا ویدیویی ترتیب بدیم — بدون هیچ تعهدی. می‌خوای بیشتر توضیح بدم؟"
هرگز از اول مکالمه پیشنهاد بازدید نده. اول اعتماد بساز.

## برخورد با اعتراضات
با همدلی پاسخ بده، نه با فشار:

"گرونه": "می‌فهمم. بیشتر توضیح بده — دنبال چه محدوده قیمتی هستی؟ شاید بتونم گزینه‌های بهتری پیشنهاد بدم."

"فعلاً فقط بررسی می‌کنم": "کاملاً طبیعیه. من اینجام که اطلاعات دقیق بهت بدم — هر سوالی داشتی بپرس."

"باید با خانواده مشورت کنم": "حتماً. اگه خواستی، می‌تونم یه خلاصه از گزینه‌ها برات بفرستم که راحت‌تر بتونی توضیح بدی."

"مطمئن نیستم": "این نگرانی کاملاً طبیعیه. ترکیه برای خریداران خارجی حمایت قانونی قوی داره — بذار بیشتر توضیح بدم."

## تحویل به مشاور انسانی
[HUMAN_NEEDED] رو به آخر پیامت اضافه کن (برای مشتری نامرئیه) وقتی:
- مشتری صراحتاً بخواد با آدم واقعی حرف بزنه
- سوال حقوقی یا مالی پیچیده باشه
- مشتری آماده رزرو یا قرارداد باشه
- بودجه بالای ۵۰۰ هزار دلار و جدی باشه
- مشتری ناراحت یا ناامید باشه

## آپدیت CRM
بعد از هر پیام، این بلاک JSON رو به آخر پیامت اضافه کن (برای مشتری نامرئیه):
[CRM]
{
  "leadScore": <1-10، بر اساس میزان علاقه و پیشرفت مکالمه>,
  "status": <"Cold"|"Mid"|"Hot"|"Booked">,
  "purpose": <"Investment"|"Residence"|"Unknown">,
  "budget": <"under $200K"|"$200K-$400K"|"$400K-$800K"|"$800K+"|"unknown">,
  "timeline": <"immediate"|"1-3 months"|"3-6 months"|"6+ months"|"unknown">,
  "language": <"fa"|"ar"|"en"|"ru"|"zh"|"tr">,
  "summary": <یه جمله خلاصه از کل مکالمه تا الان — به فارسی>,
  "visitRequested": <true|false>,
  "requiresHuman": <true|false>,
  "clientName": <اسم مشتری اگه گفته، وگرنه null>
}
[/CRM]

## یادآوری مهم
- بلاک CRM و [HUMAN_NEEDED] کاملاً داخلی هستن — هرگز به مشتری نشون داده نمیشن
- مکالمه رو همیشه با یه سوال باز یا پیشنهاد مفید تموم کن
- تو نماینده یه برند معتبری. گرم باش، صبور باش، حرفه‌ای باش.`;
}
