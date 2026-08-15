import { Resend } from "resend";
import type { Lead } from "./db";

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const isConfigured = !!resendApiKey && resendApiKey.startsWith("re_");

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendNewLeadNotification(lead: Lead) {
  if (!isConfigured || !adminEmail) {
    console.warn(
      "[notify] RESEND_API_KEY 또는 ADMIN_NOTIFICATION_EMAIL이 설정되지 않아 알림 이메일을 건너뜁니다."
    );
    return;
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[새 문의] ${lead.name}님으로부터 문의가 접수되었습니다`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="margin: 0 0 16px;">새 문의가 접수되었습니다</h2>

          <p style="margin: 6px 0;">&#9658; <strong>이름</strong> &nbsp;: ${escapeHtml(lead.name)}</p>
          <p style="margin: 6px 0;">&#9658; <strong>이메일</strong> : ${escapeHtml(lead.email)}</p>
          <p style="margin: 6px 0;">&#9658; <strong>전화번호</strong> : ${escapeHtml(lead.phone ?? "-")}</p>

          <p style="margin: 20px 0 4px;"><strong>메시지</strong></p>
          <p style="margin: 0 0 20px; padding: 10px 12px; border-left: 3px solid #ccc; background: #fafafa;">
            ${escapeHtml(lead.message ?? "-").replace(/\n/g, "<br/>")}
          </p>

          <p style="margin: 0; color: #666;">&#10148; 접수 시각 : ${escapeHtml(lead.created_at)}</p>
        </div>
      `,
    });

    if (error) {
      console.error("[notify] Resend 이메일 발송 실패:", error);
    }
  } catch (err) {
    console.error("[notify] Resend 이메일 발송 중 오류:", err);
  }
}
