import { logger } from "@/lib/logger";
import { sendAdminNotification } from "@/lib/email";
import type { AdminNotificationEvent, AdminNotificationPayload, AdminNotificationResult } from "@/lib/types/admin-notification";

export class AdminNotificationService {
  private static readonly APP_NAME = "سحابة الأمن السيبراني";

  static async notify(payload: AdminNotificationPayload): Promise<AdminNotificationResult> {
    const timestamp = new Date().toISOString();

    try {
      this.validatePayload(payload);

      const subject = this.getSubject(payload.event);
      const html = this.generateTemplate(payload.event, payload);

      const sent = await sendAdminNotification({ subject, html });

      if (!sent) {
        logger.warn("Notification Failed", {
          event: payload.event,
          userId: payload.userId,
          error: "sendAdminNotification returned false",
        });
        return {
          success: false,
          event: payload.event,
          message: "فشل إرسال إشعار الأدمن",
          timestamp,
          error: "sendAdminNotification returned false",
        };
      }

      logger.info("Notification Sent", {
        event: payload.event,
        userId: payload.userId,
        email: payload.email,
      });

      return {
        success: true,
        event: payload.event,
        message: "تم إرسال إشعار الأدمن بنجاح",
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
      logger.error("Notification Failed", {
        event: payload.event,
        userId: payload.userId,
        error: errorMessage,
      });
      return {
        success: false,
        event: payload.event,
        message: "فشل إرسال إشعار الأدمن",
        timestamp,
        error: errorMessage,
      };
    }
  }

  private static validatePayload(payload: AdminNotificationPayload): void {
    const missing: string[] = [];

    if (!payload.userId) missing.push("userId");
    if (!payload.userName) missing.push("userName");
    if (!payload.userUsername) missing.push("userUsername");
    if (!payload.role) missing.push("role");
    if (!payload.email) missing.push("email");
    if (!payload.operationTime) missing.push("operationTime");
    if (!payload.event) missing.push("event");

    if (!this.isValidEvent(payload.event)) {
      logger.warn("Validation Failed", {
        reason: "Invalid event type",
        event: payload.event,
      });
      throw new Error(`نوع الحدث غير صالح: ${payload.event}`);
    }

    if (missing.length > 0) {
      logger.warn("Validation Failed", {
        reason: "Missing required fields",
        missing,
      });
      throw new Error(`الحقول المطلوبة مفقودة: ${missing.join("، ")}`);
    }
  }

  private static isValidEvent(event: string): event is AdminNotificationEvent {
    const validEvents: AdminNotificationEvent[] = [
      "ACCOUNT_ACTIVATED",
      "TELEGRAM_BOUND",
      "PASSWORD_RESET_COMPLETED",
      "PASSWORD_RESET_ASSISTANCE_REQUEST",
    ];
    return validEvents.includes(event as AdminNotificationEvent);
  }

  private static getSubject(event: AdminNotificationEvent): string {
    const subjects: Record<AdminNotificationEvent, string> = {
      ACCOUNT_ACTIVATED: "🔔 إشعار: تم تفعيل حساب جديد",
      TELEGRAM_BOUND: "🔔 إشعار: تم ربط حساب Telegram",
      PASSWORD_RESET_COMPLETED: "🔔 إشعار: تم إعادة تعيين كلمة المرور",
      PASSWORD_RESET_ASSISTANCE_REQUEST: "🔔 إشعار: طلب مساعدة في استعادة كلمة المرور",
    };
    return subjects[event];
  }

  private static generateTemplate(event: AdminNotificationEvent, payload: AdminNotificationPayload): string {
    const eventTitle = this.getEventTitle(event);
    const eventDescription = this.getEventDescription(event);
    const levelDisplay = payload.level ? this.mapLevel(payload.level) : "—";
    const roleDisplay = this.mapRole(payload.role);
    const telegramDisplay = payload.telegramUsername
      ? `@${payload.telegramUsername}`
      : payload.telegramId
        ? payload.telegramId.toString()
        : "—";
    const telegramIdDisplay = payload.telegramId || "—";
    const formattedTime = new Date(payload.operationTime).toLocaleString("ar-SA", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0a1128; color: #e6edf3; padding: 0; border-radius: 12px; border: 1px solid #00e5ff; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a1128 0%, #162044 100%); padding: 28px 30px; text-align: center; border-bottom: 2px solid #00e5ff;">
          <h1 style="margin: 0; color: #00e5ff; font-size: 22px; font-weight: 700;">${this.APP_NAME}</h1>
          <p style="margin: 6px 0 0; color: #8b949e; font-size: 13px;">جامعة ذمار - كلية الحاسبات</p>
        </div>

        <!-- Event Badge -->
        <div style="padding: 24px 30px 0;">
          <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 8px; padding: 14px 18px; text-align: center;">
            <p style="margin: 0; color: #00e5ff; font-size: 15px; font-weight: 600;">${eventTitle}</p>
            <p style="margin: 4px 0 0; color: #8b949e; font-size: 12px;">${eventDescription}</p>
          </div>
        </div>

        <!-- User Info -->
        <div style="padding: 20px 30px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%; border-bottom: 1px solid #1c2440;">الاسم</td>
              <td style="padding: 8px 12px; color: #e6edf3; border-bottom: 1px solid #1c2440;">${payload.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%; border-bottom: 1px solid #1c2440;">اسم المستخدم</td>
              <td style="padding: 8px 12px; color: #e6edf3; border-bottom: 1px solid #1c2440;">${payload.userUsername}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%; border-bottom: 1px solid #1c2440;">المستوى</td>
              <td style="padding: 8px 12px; color: #e6edf3; border-bottom: 1px solid #1c2440;">${levelDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%; border-bottom: 1px solid #1c2440;">الدور</td>
              <td style="padding: 8px 12px; color: #e6edf3; border-bottom: 1px solid #1c2440;">${roleDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%; border-bottom: 1px solid #1c2440;">البريد الإلكتروني</td>
              <td style="padding: 8px 12px; color: #e6edf3; direction: ltr; text-align: right; border-bottom: 1px solid #1c2440;">${payload.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%; border-bottom: 1px solid #1c2440;">Telegram</td>
              <td style="padding: 8px 12px; color: #e6edf3; border-bottom: 1px solid #1c2440;">${telegramDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%; border-bottom: 1px solid #1c2440;">Telegram ID</td>
              <td style="padding: 8px 12px; color: #e6edf3; border-bottom: 1px solid #1c2440;">${telegramIdDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8b949e; width: 45%;">وقت العملية</td>
              <td style="padding: 8px 12px; color: #e6edf3;">${formattedTime}</td>
            </tr>
          </table>
        </div>

        <!-- Metadata -->
        ${payload.metadata ? `
        <div style="padding: 0 30px 20px;">
          <p style="margin: 0 0 8px; color: #8b949e; font-size: 12px;">بيانات إضافية:</p>
          <pre style="margin: 0; background: #0d152e; border: 1px solid #1c2440; border-radius: 6px; padding: 12px; color: #8b949e; font-size: 11px; direction: ltr; text-align: left; overflow-x: auto;">${JSON.stringify(payload.metadata, null, 2)}</pre>
        </div>
        ` : ""}

        <!-- Footer -->
        <div style="padding: 18px 30px; text-align: center; border-top: 1px solid #1c2440;">
          <p style="margin: 0; color: #484f6a; font-size: 11px;">
            هذه الرسالة مرسلة من نظام الإشعارات الأمنية<br>
            ${this.APP_NAME} &copy; ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    `;
  }

  private static getEventTitle(event: AdminNotificationEvent): string {
    const titles: Record<AdminNotificationEvent, string> = {
      ACCOUNT_ACTIVATED: "تفعيل حساب جديد",
      TELEGRAM_BOUND: "ربط حساب Telegram",
      PASSWORD_RESET_COMPLETED: "إعادة تعيين كلمة المرور",
      PASSWORD_RESET_ASSISTANCE_REQUEST: "طلب مساعدة في استعادة كلمة المرور",
    };
    return titles[event];
  }

  private static getEventDescription(event: AdminNotificationEvent): string {
    const descriptions: Record<AdminNotificationEvent, string> = {
      ACCOUNT_ACTIVATED: "تم تفعيل حساب مستخدم جديد في المنصة",
      TELEGRAM_BOUND: "قام المستخدم بربط حسابه مع Telegram بنجاح",
      PASSWORD_RESET_COMPLETED: "تم تغيير كلمة المرور للمستخدم بنجاح",
      PASSWORD_RESET_ASSISTANCE_REQUEST: "المستخدم بحاجة إلى مساعدة يدوية في استعادة كلمة المرور",
    };
    return descriptions[event];
  }

  private static mapRole(role: string): string {
    const map: Record<string, string> = {
      ADMIN: "أدمن",
      MANAGEMENT: "إدارة",
      TEACHER: "معلم",
      STUDENT: "طالب",
    };
    return map[role] || role;
  }

  private static mapLevel(level: string): string {
    const map: Record<string, string> = {
      LEVEL_1: "المستوى الأول",
      LEVEL_2: "المستوى الثاني",
      LEVEL_3: "المستوى الثالث",
      LEVEL_4: "المستوى الرابع",
    };
    return map[level] || level;
  }
}
