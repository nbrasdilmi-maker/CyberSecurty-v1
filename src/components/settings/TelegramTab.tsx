"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { csrfFetch } from "@/lib/csrfClient";

const BOT_USERNAME = "@cyber_security_cloud_bot";

interface TelegramBinding {
  id: string;
  telegramId: string;
  telegramUsername: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}

interface Props {
  onUpdate?: () => void;
}

export default function TelegramTab({ onUpdate }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);
  const [bound, setBound] = useState(false);
  const [binding, setBinding] = useState<TelegramBinding | null>(null);
  const [showUnbindConfirm, setShowUnbindConfirm] = useState(false);
  const [bindCode, setBindCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (polling && !bound) {
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [polling, bound]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/tig/bind/status");
      const data = await res.json();
      if (data.success) {
        setBound(data.bound);
        setBinding(data.binding);
        if (data.bound) {
          setPolling(false);
          setBindCode(null);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBind = async () => {
    setOperating(true);
    setBindCode(null);
    try {
      const res = await csrfFetch("/api/tig/bind/initiate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBindCode(data.code);
        setPolling(true);
        showToast("تم إنشاء كود الربط. أرسله إلى البوت.", "success");
      } else {
        showToast(data.message || "فشل إنشاء كود الربط", "error");
      }
    } catch {
      showToast("حدث خطأ في الاتصال", "error");
    } finally {
      setOperating(false);
    }
  };

  const handleUnbind = async () => {
    setOperating(true);
    try {
      const res = await csrfFetch("/api/tig/bind/unbind", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("✅ تم إلغاء الربط بنجاح", "success");
        setBound(false);
        setBinding(null);
        setShowUnbindConfirm(false);
        onUpdate?.();
      } else {
        showToast(data.message || "فشل إلغاء الربط", "error");
      }
    } catch {
      showToast("حدث خطأ في الاتصال", "error");
    } finally {
      setOperating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("✅ تم نسخ الكود", "success");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast("فشل النسخ", "error");
    }
  };

  const containerStyle: React.CSSProperties = {
    background: "rgba(10, 20, 40, 0.6)",
    border: "1px solid rgba(0, 229, 255, 0.15)",
    borderRadius: "20px",
    padding: "clamp(20px, 3vw, 35px)",
    maxWidth: "560px",
  };

  const labelStyle: React.CSSProperties = {
    color: "#8b949e",
    fontSize: "0.85rem",
    marginBottom: 4,
  };

  const valueStyle: React.CSSProperties = {
    color: "#e6edf3",
    fontSize: "1rem",
    fontWeight: 600,
    direction: "ltr",
  };

  const btnBase: React.CSSProperties = {
    padding: "12px 24px",
    borderRadius: "14px",
    border: "none",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: operating ? "not-allowed" : "pointer",
    opacity: operating ? 0.6 : 1,
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.3s ease",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#8b949e", textAlign: "center" }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={containerStyle}>
        <h3
          style={{
            color: "#00e5ff",
            fontSize: "1.2rem",
            marginBottom: 8,
          }}
        >
          🤖 ربط حساب Telegram
        </h3>
        <p
          style={{
            color: "#8b949e",
            fontSize: "0.85rem",
            marginBottom: 24,
          }}
        >
          اربط حسابك في المنصة بحساب Telegram لاستعادة كلمة المرور وتلقي الإشعارات
        </p>

        {/* Bot username */}
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            background: "rgba(0, 229, 255, 0.06)",
            border: "1px solid rgba(0, 229, 255, 0.15)",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#8b949e", fontSize: "0.8rem", margin: "0 0 4px" }}>
            اسم المستخدم الخاص بالبوت
          </p>
          <p
            style={{
              color: "#00e5ff",
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0,
              direction: "ltr",
            }}
          >
            {BOT_USERNAME}
          </p>
        </div>

        {bound && binding ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
                padding: "14px 18px",
                background: "rgba(46, 160, 67, 0.1)",
                border: "1px solid rgba(46, 160, 67, 0.3)",
                borderRadius: "14px",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>✅</span>
              <div>
                <p style={{ color: "#2ea043", fontWeight: 700, margin: 0 }}>
                  الحساب مرتبط
                </p>
                <p style={{ color: "#8b949e", fontSize: "0.8rem", margin: 0 }}>
                  {binding.firstName || binding.telegramUsername || "Telegram User"}
                  {binding.telegramUsername ? ` (@${binding.telegramUsername})` : ""}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <p style={labelStyle}>معرف Telegram</p>
                <p style={valueStyle}>{binding.telegramId}</p>
              </div>
              {binding.verifiedAt && (
                <div style={{ marginBottom: 12 }}>
                  <p style={labelStyle}>تاريخ الربط</p>
                  <p style={valueStyle}>
                    {new Date(binding.verifiedAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              )}
              <div>
                <p style={labelStyle}>الحالة</p>
                <p style={{ ...valueStyle, color: "#2ea043" }}>نشط</p>
              </div>
            </div>

            {showUnbindConfirm ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={handleUnbind}
                  disabled={operating}
                  style={{
                    ...btnBase,
                    background: "linear-gradient(135deg, #f85149, #da3633)",
                    color: "#fff",
                    flex: 1,
                    minWidth: 120,
                  }}
                >
                  {operating ? "⏳ جاري..." : "✅ تأكيد إلغاء الربط"}
                </button>
                <button
                  onClick={() => setShowUnbindConfirm(false)}
                  disabled={operating}
                  style={{
                    ...btnBase,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#8b949e",
                    flex: 1,
                    minWidth: 120,
                  }}
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowUnbindConfirm(true)}
                disabled={operating}
                style={{
                  ...btnBase,
                  background: "transparent",
                  border: "1px solid rgba(248, 81, 73, 0.3)",
                  color: "#f85149",
                  width: "100%",
                }}
              >
                إلغاء الربط
              </button>
            )}
          </div>
        ) : (
          <div>
            <div
              style={{
                padding: "14px 18px",
                marginBottom: 20,
                background: "rgba(255, 202, 40, 0.08)",
                border: "1px solid rgba(255, 202, 40, 0.2)",
                borderRadius: "14px",
              }}
            >
              <p style={{ color: "#ffca28", fontWeight: 600, margin: "0 0 4px" }}>
                ⚠️ الحساب غير مرتبط
              </p>
              <p style={{ color: "#8b949e", fontSize: "0.85rem", margin: 0 }}>
                قم بربط حسابك لتفعيل ميزة استعادة كلمة المرور عبر Telegram
              </p>
            </div>

            {bindCode ? (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(0, 229, 255, 0.05)",
                  border: "1px solid rgba(0, 229, 255, 0.2)",
                  borderRadius: "14px",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    color: "#00e5ff",
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: "0.9rem",
                  }}
                >
                  📋 كود الربط (صالح لمدة 10 دقائق):
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <code
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      background: "rgba(0,0,0,0.4)",
                      borderRadius: "10px",
                      color: "#39ff14",
                      fontSize: "1.1rem",
                      direction: "ltr",
                      textAlign: "center",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {bindCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(bindCode)}
                    style={{
                      ...btnBase,
                      padding: "12px 16px",
                      background: "rgba(0, 229, 255, 0.1)",
                      border: "1px solid rgba(0, 229, 255, 0.3)",
                      color: "#00e5ff",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copied ? "✅" : "📋 نسخ"}
                  </button>
                </div>
                <p
                  style={{
                    color: "#8b949e",
                    fontSize: "0.8rem",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  1️⃣ انسخ الكود أعلاه
                </p>
                <p
                  style={{
                    color: "#8b949e",
                    fontSize: "0.8rem",
                    textAlign: "center",
                    margin: "2px 0",
                  }}
                >
                  2️⃣ افتح {BOT_USERNAME} في Telegram
                </p>
                <p
                  style={{
                    color: "#8b949e",
                    fontSize: "0.8rem",
                    textAlign: "center",
                    margin: "2px 0 0",
                  }}
                >
                  3️⃣ أرسل الكود في المحادثة
                </p>
                {polling && (
                  <p
                    style={{
                      color: "#ffca28",
                      fontSize: "0.8rem",
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    ⏳ في انتظار تأكيد الربط من البوت...
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={handleBind}
                disabled={operating}
                style={{
                  ...btnBase,
                  background: "linear-gradient(135deg, #2188ff, #0066cc)",
                  color: "#fff",
                  width: "100%",
                  marginBottom: 16,
                  boxShadow: "0 6px 25px rgba(33,136,255,0.3)",
                }}
              >
                {operating ? "⏳ جاري..." : "🔗 ربط حساب Telegram"}
              </button>
            )}

            {bindCode && (
              <button
                onClick={handleBind}
                disabled={operating}
                style={{
                  ...btnBase,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#8b949e",
                  width: "100%",
                  fontSize: "0.8rem",
                }}
              >
                🔄 إنشاء كود جديد
              </button>
            )}
          </div>
        )}

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            margin: "20px 0",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={fetchStatus}
            style={{
              ...btnBase,
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#8b949e",
              fontSize: "0.8rem",
            }}
          >
            🔄 تحديث الحالة
          </button>
        </div>
      </div>
    </motion.div>
  );
}
