"""
Generate visual concept images for Phase 1C UI Visualization Package.
Creates SVGs and PNGs for all 7 parts of the visual blueprint.
"""
import os
import subprocess
import tempfile
import sys
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

OUTPUT_DIR = os.path.join("D:\\vn2\\CyberSecurty v11", "التقارير", "vision")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# COLOR PALETTE
# ============================================================
COLORS = {
    "bg": "#010204",
    "bgPanel": "#0A1128",
    "bgCard": "rgba(22,27,34,0.85)",
    "bgGlass": "rgba(10,18,30,0.7)",
    "border": "rgba(0,229,255,0.15)",
    "borderLight": "rgba(255,255,255,0.08)",
    "cyan": "#00e5ff",
    "purple": "#bf5af2",
    "green": "#39ff14",
    "gold": "#ffca28",
    "red": "#f85149",
    "redBright": "#ff3131",
    "text": "#e6edf3",
    "textMuted": "#8b949e",
    "textDark": "#6e7681",
    "success": "#2ea043",
    "warning": "#ffca28",
    "danger": "#f85149",
    "white": "#ffffff",
}

ROLE_COLORS = {
    "ADMIN": "#ff3131",
    "MANAGEMENT": "#ffca28",
    "TEACHER": "#bf5af2",
    "STUDENT": "#00e5ff",
}

ROLE_NAMES = {
    "ADMIN": "الأدمن",
    "MANAGEMENT": "الإدارة",
    "TEACHER": "معلم",
    "STUDENT": "طالب",
}

ROLE_BADGES = {
    "ADMIN": "👑 الأدمن",
    "MANAGEMENT": "🏢 الإدارة",
    "TEACHER": "👨‍🏫 معلم",
    "STUDENT": "🎓 طالب",
}

ROLE_DASHBOARD_TITLES = {
    "ADMIN": "SOC Dashboard - مركز عمليات الأمن السيبراني",
    "MANAGEMENT": "Operational Command Center - مركز القيادة التشغيلية",
    "TEACHER": "Teacher Control Center - مركز التحكم التعليمي",
    "STUDENT": "Learning Hub - مركز التعلم",
}

ROLE_MENU_ITEMS = {
    "ADMIN": ["🏠 الرئيسية", "🔔 الإشعارات", "📚 المكتبة", "💻 محرر الأكواد", "💬 المحادثة", "🏗️ إدارة التوليد", "📜 سجل العمليات", "⬆️ ترقية المستخدمين", "💻 استهلاك السيرفر", "✅ حسابات مفعلة", "🛡️ رادار الأخطاء", "🤖 التحكم بالبوت", "📅 إدارة الترم", "🎛️ كنترول المنصة", "📢 نشر تعميم", "⚙️ الإعدادات"],
    "MANAGEMENT": ["🏠 الرئيسية", "🔔 الإشعارات", "📚 المكتبة", "💻 محرر الأكواد", "💬 المحادثة", "🏗️ إدارة التوليد", "📜 سجل العمليات", "⬆️ ترقية المستخدمين", "💻 استهلاك السيرفر", "✅ حسابات مفعلة", "📅 إدارة الترم", "📢 نشر تعميم", "⚙️ الإعدادات"],
    "TEACHER": ["🏠 الرئيسية", "🔔 الإشعارات", "📚 المكتبة", "💻 محرر الأكواد", "💬 المحادثة", "📋 المهام المنجزة", "📢 نشر تعميم", "📝 توزيع الدرجات", "⚙️ الإعدادات"],
    "STUDENT": ["🏠 الرئيسية", "🔔 الإشعارات", "📚 المكتبة", "💻 محرر الأكواد", "💬 المحادثة", "⚙️ الإعدادات"],
}


def svg_rect(x, y, w, h, fill, rx=0, ry=0, stroke="none", sw=0, opacity=1, dash=""):
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}"{dash_attr} />'


def xml_escape(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def svg_text(x, y, text, fill, size=14, bold=False, align="right", font="Cairo"):
    weight = "bold" if bold else "normal"
    anchor = "end" if align == "right" else "start"
    safe = xml_escape(text)
    if font == "Orbitron":
        return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" font-family="Orbitron, monospace" direction="rtl">{safe}</text>'
    return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" font-family="Cairo, Arial, sans-serif" direction="rtl">{safe}</text>'


def svg_circle(cx, cy, r, fill, stroke="none", sw=0, opacity=1):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}" />'


def svg_gradient(id_name, x1=0, y1=0, x2=0, y2=1, colors=None):
    if colors is None:
        colors = [("rgba(0,229,255,0.3)", "0%"), ("rgba(0,229,255,0)", "100%")]
    stops = "\n".join([f'<stop offset="{p}" stop-color="{c}" />' for c, p in colors])
    return f'<linearGradient id="{id_name}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{stops}</linearGradient>'


def svg_filter(id_name, blur=20):
    return f'<filter id="{id_name}"><feGaussianBlur stdDeviation="{blur}" /></filter>'


def svg_line(x1, y1, x2, y2, stroke, sw=1, opacity=1, dash=""):
    dash_attr = f'stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}" {dash_attr} />'


# ============================================================
# PART 1: Role-Based AppShell Concepts
# ============================================================
def generate_appshell_concept(role):
    """Generate SVG for a role-based AppShell concept."""
    accent = ROLE_COLORS[role]
    name = ROLE_NAMES[role]
    badge = ROLE_BADGES[role]
    menu = ROLE_MENU_ITEMS[role]
    
    # Layout: 1200x800
    W, H = 1200, 800
    sidebar_w = 240
    header_h = 56
    footer_h = 40
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="100%" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("headerGrad", colors=[("rgba(10,17,40,0.95)", "0%"), ("rgba(5,8,20,0.95)", "100%")])}
        {svg_gradient("sidebarGrad", x2=1, colors=[("rgba(8,14,30,0.98)", "0%"), ("rgba(5,8,18,0.98)", "100%")])}
        {svg_gradient("accentGrad", colors=[("rgba(0,229,255,0.4)", "0%"), ("rgba(0,229,255,0)", "100%")])}
        {svg_gradient("glowGrad", colors=[("rgba(0,229,255,0.15)", "0%"), ("rgba(0,229,255,0)", "100%")])}
        {svg_filter("glow", 8)}
        {svg_filter("blurBg", 30)}
    </defs>
'''
    
    # Subtle grid background
    svg += f'<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,229,255,0.03)" stroke-width="0.5"/></pattern>'
    svg += f'<rect width="{W}" height="{H}" fill="url(#grid)" />'
    
    # === HEADER (full width, fixed top) ===
    svg += f'<!-- HEADER -->'
    svg += svg_rect(0, 0, W, header_h, "url(#headerGrad)", stroke=f"rgba(0,229,255,0.2)", sw=1)
    svg += svg_rect(0, header_h-1, W, 1, f"rgba({','.join(str(int(accent[i:i+2],16)) for i in (1,3,5) if accent.startswith('#'))},0.3)", opacity=0.5)
    
    # Header left: clock
    svg += svg_text(1170, 34, "10:45:30 AM", COLORS['cyan'], 13, font="Orbitron", align="right")
    
    # Header center: title
    svg += svg_text(600, 28, "سحابة الأمن السيبراني", COLORS['white'], 16, bold=True, align="right")
    svg += svg_text(600, 44, "CYBER SECURITY CLOUD", COLORS['cyan'], 9, font="Orbitron", align="right")
    
    # Header right: hamburger + search + bell + avatar
    # Hamburger
    svg += svg_circle(80, 28, 16, "rgba(255,255,255,0.05)", stroke="rgba(255,255,255,0.1)", sw=1)
    svg += svg_rect(72, 22, 16, 2, COLORS['text'], rx=1)
    svg += svg_rect(72, 27, 16, 2, COLORS['text'], rx=1)
    svg += svg_rect(72, 32, 16, 2, COLORS['text'], rx=1)
    
    # Search
    svg += svg_circle(130, 28, 16, "rgba(255,255,255,0.05)", stroke="rgba(255,255,255,0.1)", sw=1)
    svg += svg_text(142, 34, "🔍", COLORS['textMuted'], 12, align="right")
    
    # Bell
    svg += svg_circle(175, 28, 16, "rgba(255,255,255,0.05)", stroke="rgba(255,255,255,0.1)", sw=1)
    svg += svg_text(187, 34, "🔔", COLORS['text'], 12, align="right")
    svg += svg_circle(195, 18, 6, COLORS['danger'])
    svg += svg_text(195, 22, "3", COLORS['white'], 8, bold=True, align="right")
    
    # Avatar
    avatar_x = 225
    svg += svg_circle(avatar_x, 28, 16, accent+ "33", stroke=accent, sw=1.5)
    svg += svg_text(avatar_x, 34, "م", COLORS['white'], 14, bold=True, align="right")
    
    # === SIDEBAR ===
    svg += f'<!-- SIDEBAR -->'
    svg += svg_rect(0, header_h, sidebar_w, H-header_h-footer_h, "url(#sidebarGrad)", stroke="rgba(255,255,255,0.05)", sw=1)
    
    # User card
    card_y = header_h + 15
    svg += svg_circle(180, card_y+20, 24, accent+ "33", stroke=accent, sw=2)
    svg += svg_text(180, card_y+26, "م", COLORS['white'], 20, bold=True, align="right")
    svg += svg_text(168, card_y+18, "محمد الأحمدي", COLORS['text'], 12, bold=True, align="right")
    svg += svg_text(175, card_y+34, badge, COLORS['textMuted'], 10, align="right")
    
    # Divider
    div_y = card_y + 55
    svg += svg_rect(10, div_y, sidebar_w-20, 1, "rgba(255,255,255,0.06)")
    
    # Menu items
    item_y = div_y + 12
    for i, item in enumerate(menu):
        active = i == 0
        bg = f"rgba({','.join(str(int(accent[i:i+2],16)) for i in (1,3,5) if accent.startswith('#'))},0.1)" if active else "transparent"
        border = accent if active else "transparent"
        text_color = COLORS['white'] if active else COLORS['textMuted']
        svg += svg_rect(5, item_y, sidebar_w-10, 32, bg, rx=6, stroke=border, sw=1 if active else 0)
        svg += svg_text(sidebar_w-15, item_y+21, item, text_color, 11, bold=active, align="right")
        if active:
            svg += svg_rect(5, item_y, 3, 32, accent, rx=2)
        item_y += 36
    
    # Management badge
    if role == "MANAGEMENT":
        item_y += 5
        svg += svg_rect(15, item_y, sidebar_w-30, 28, "rgba(255,202,40,0.1)", rx=12, stroke="rgba(255,202,40,0.3)", sw=1)
        svg += svg_text(sidebar_w-25, item_y+19, "⭐ إدارة المستوى الثالث", COLORS['gold'], 10, bold=True, align="right")
    
    # Logout button
    logout_y = H - footer_h - 50
    svg += svg_rect(10, logout_y, sidebar_w-20, 36, "rgba(248,81,73,0.08)", rx=8, stroke="rgba(248,81,73,0.2)", sw=1)
    svg += svg_text(sidebar_w-20, logout_y+23, "🚪 تسجيل الخروج", COLORS['danger'], 12, align="right")
    
    # === MAIN CONTENT ===
    content_x = sidebar_w
    content_y = header_h
    content_w = W - sidebar_w
    content_h = H - header_h - footer_h
    
    svg += f'<clipPath id="contentClip"><rect x="{content_x}" y="{content_y}" width="{content_w}" height="{content_h}" /></clipPath>'
    svg += f'<g clip-path="url(#contentClip)">'
    svg += svg_rect(content_x, content_y, content_w, content_h, COLORS['bg'])
    
    # Content title
    cx = content_x + content_w - 30
    svg += svg_text(cx, content_y + 35, f"لوحة تحكم {name}", COLORS['white'], 22, bold=True, align="right")
    
    # Role description
    descs = {
        "ADMIN": "مركز عمليات الأمن — تحكم كامل بالمنصة والمراقبة الفورية",
        "MANAGEMENT": "مركز القيادة — إدارة المستخدمين والتقارير التشغيلية",
        "TEACHER": "المركز التعليمي — تقييم التكاليف ومتابعة الطلاب",
        "STUDENT": "مركز التعلم — رفع التكاليف ومتابعة الدرجات",
    }
    svg += svg_text(cx, content_y + 58, descs[role], COLORS['textMuted'], 13, align="right")
    
    # Stats cards row
    card_w = (content_w - 90) / 4
    stats = {
        "ADMIN": [("المستخدمين النشطين", "1,247"), ("المنصة", "99.9%"), ("إنذارات اليوم", "23"), ("طلبات الدعم", "7")],
        "MANAGEMENT": [("إجمالي المستخدمين", "2,350"), ("الحسابات المفعلة", "1,890"), ("التكاليف", "456"), ("المواد", "24")],
        "TEACHER": [("تكاليف واردة", "38"), ("تم تقييمها", "124"), ("الطلاب", "180"), ("المواد", "6")],
        "STUDENT": [("تكاليفي", "12"), ("تم تقييمها", "8"), ("المواد", "5"), ("المعدل", "85%")],
    }
    stat_items = stats[role]
    
    for i, (label, value) in enumerate(stat_items):
        sx = content_x + 20 + i * (card_w + 15)
        sy = content_y + 85
        svg += svg_rect(sx, sy, card_w, 80, "rgba(22,27,34,0.7)", rx=10, stroke="rgba(255,255,255,0.06)", sw=1)
        svg += svg_text(sx + card_w - 15, sy + 30, value, accent, 28, bold=True, align="right")
        svg += svg_text(sx + card_w - 15, sy + 55, label, COLORS['textMuted'], 11, align="right")
    
    # Content area with role-specific panels
    panel_y = content_y + 190
    
    if role == "ADMIN":
        # SOC Dashboard - Threat Radar + Activity
        svg += svg_rect(content_x+15, panel_y, content_w/2-20, 280, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(248,81,73,0.15)", sw=1)
        svg += svg_text(content_x+content_w/2-30, panel_y+25, "🛡️ رادار الأخطاء - Threat Radar", COLORS['red'], 13, bold=True, align="right")
        # Radar visualization
        radar_cx = content_x + content_w/4
        radar_cy = panel_y + 150
        for r in [80, 55, 30]:
            svg += svg_circle(radar_cx, radar_cy, r, "none", stroke="rgba(248,81,73,0.15)", sw=1)
        # Threat dots
        svg += svg_circle(radar_cx-40, radar_cy-30, 6, COLORS['red'], opacity=0.8)
        svg += svg_circle(radar_cx+20, radar_cy-50, 4, COLORS['warning'], opacity=0.9)
        svg += svg_circle(radar_cx+50, radar_cy+20, 5, COLORS['red'], opacity=0.6)
        svg += svg_circle(radar_cx-20, radar_cy+40, 3, COLORS['warning'], opacity=0.7)
        svg += svg_circle(radar_cx-55, radar_cy+15, 4, COLORS['green'], opacity=0.8)
        
        # Right panel: Activity
        svg += svg_rect(content_x+content_w/2+10, panel_y, content_w/2-25, 280, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(0,229,255,0.1)", sw=1)
        svg += svg_text(content_x+content_w-30, panel_y+25, "⚡ النشاط الفوري - Realtime Activity", COLORS['cyan'], 13, bold=True, align="right")
        activities = ["🔐 تسجيل دخول جديد - أحمد الهيدمة", "📤 رفع تكليف - طالب المستوى الثاني", "✅ تقييم تكليف - معلم الترم الأول", "📢 تعميم جديد - إدارة المنصة", "🛡️ اكتشاف تهديد - محاولة اختراق"]
        for i, act in enumerate(activities):
            ay = panel_y + 55 + i * 40
            svg += svg_rect(content_x+content_w/2+25, ay, content_w/2-55, 32, "rgba(255,255,255,0.02)", rx=6)
            svg += svg_text(content_x+content_w-30, ay+21, act, COLORS['text'], 10, align="right")
            svg += svg_text(content_x+content_w-30, ay+21, f"منذ {i+1} د", COLORS['textMuted'], 8, align="left")
        
        # Bottom: Security grid
        grid_y = panel_y + 295
        svg += svg_rect(content_x+15, grid_y, content_w-30, 80, "rgba(22,27,34,0.5)", rx=10, stroke="rgba(0,229,255,0.05)", sw=1)
        metrics = [("تهديدات حرجة", "3", COLORS['red']), ("متوسطة", "12", COLORS['warning']), ("منخفضة", "47", COLORS['textMuted']), ("الكل", "62", COLORS['cyan'])]
        for i, (mlabel, mval, mcolor) in enumerate(metrics):
            mx = content_x + 30 + i * ((content_w-60)/4)
            svg += svg_text(mx+((content_w-60)/4)-15, grid_y+40, mval, mcolor, 24, bold=True, align="right")
            svg += svg_text(mx+((content_w-60)/4)-15, grid_y+65, mlabel, COLORS['textMuted'], 10, align="right")
    
    elif role == "MANAGEMENT":
        # Management dashboard
        svg += svg_rect(content_x+15, panel_y, content_w/2-20, 180, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(255,202,40,0.1)", sw=1)
        svg += svg_text(content_x+content_w/2-30, panel_y+25, "📊 مؤشرات الأداء KPIs", COLORS['gold'], 13, bold=True, align="right")
        kpi_data = [("نسبة النشاط", "78%"), ("الطلاب الجدد", "+45"), ("التقييمات", "89%"), ("حالة المنصة", "ممتاز")]
        for i, (klabel, kval) in enumerate(kpi_data):
            kx = content_x+25+i*((content_w/2-50)/4)
            svg += svg_rect(kx, panel_y+45, (content_w/2-50)/4-8, 50, "rgba(255,202,40,0.05)", rx=8, stroke="rgba(255,202,40,0.1)", sw=1)
            svg += svg_text(kx+(content_w/2-50)/4-20, panel_y+70, kval, COLORS['gold'], 18, bold=True, align="right")
            svg += svg_text(kx+(content_w/2-50)/4-20, panel_y+88, klabel, COLORS['textMuted'], 9, align="right")
        
        # Right: Recent activity
        svg += svg_rect(content_x+content_w/2+10, panel_y, content_w/2-25, 180, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(0,229,255,0.1)", sw=1)
        svg += svg_text(content_x+content_w-30, panel_y+25, "📋 الموافقات المعلقة", COLORS['cyan'], 13, bold=True, align="right")
        approvals = ["ترقية طالب: م1→م2", "تفعيل حساب جديد", "طلب رفع سعة تخزين"]
        for i, app in enumerate(approvals):
            ay = panel_y + 55 + i * 40
            svg += svg_rect(content_x+content_w/2+25, ay, content_w/2-55, 32, "rgba(255,255,255,0.02)", rx=6)
            svg += svg_text(content_x+content_w-30, ay+21, "📋 " + app, COLORS['text'], 10, align="right")
        
        # Bottom: Stats
        grid_y = panel_y + 195
        svg += svg_rect(content_x+15, grid_y, content_w-30, 100, "rgba(22,27,34,0.5)", rx=10, stroke="rgba(255,202,40,0.05)", sw=1)
        svg += svg_text(content_x+content_w-30, grid_y+25, "إحصائيات المنصة", COLORS['white'], 14, bold=True, align="right")
        stat_data = [("👥", "2,350", "إجمالي المستخدمين"), ("✅", "1,890", "مفعلين"), ("📤", "456", "التكاليف"), ("📚", "24", "المواد")]
        for i, (icon, val, label) in enumerate(stat_data):
            sx = content_x + 30 + i * ((content_w-60)/4)
            svg += svg_text(sx+((content_w-60)/4)-15, grid_y+55, icon + " " + val, COLORS['white'], 16, bold=True, align="right")
            svg += svg_text(sx+((content_w-60)/4)-15, grid_y+78, label, COLORS['textMuted'], 10, align="right")
    
    elif role == "TEACHER":
        # Teacher dashboard
        svg += svg_rect(content_x+15, panel_y, content_w/2-20, 250, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(191,90,242,0.15)", sw=1)
        svg += svg_text(content_x+content_w/2-30, panel_y+25, "📥 التكاليف الواردة", COLORS['purple'], 13, bold=True, align="right")
        svg += svg_rect(content_x+25, panel_y+40, content_w/2-40, 40, "rgba(191,90,242,0.08)", rx=8, stroke="rgba(191,90,242,0.15)", sw=1)
        svg += svg_text(content_x+content_w/2-40, panel_y+65, "📥 تحميل جميع الملفات دفعة واحدة", COLORS['purple'], 11, align="right")
        assignments = ["أحمد - تكليف الشبكات", "سارة - تكليف الأمن", "محمد - تكليف البرمجة", "نورة - تكليف قواعد"]
        for i, asg in enumerate(assignments):
            ay = panel_y + 95 + i * 36
            svg += svg_rect(content_x+25, ay, content_w/2-40, 28, "rgba(255,255,255,0.02)", rx=6)
            svg += svg_text(content_x+content_w/2-40, ay+20, asg, COLORS['text'], 10, align="right")
            svg += svg_text(content_x+28, ay+20, "📎", COLORS['textMuted'], 10, align="left")
        
        # Right panel
        svg += svg_rect(content_x+content_w/2+10, panel_y, content_w/2-25, 250, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(0,229,255,0.1)", sw=1)
        svg += svg_text(content_x+content_w-30, panel_y+25, "📊 التقييمات السابقة", COLORS['cyan'], 13, bold=True, align="right")
        evals = [("أحمد", 88), ("سارة", 95), ("محمد", 72), ("نورة", 91)]
        for i, (sname, grade) in enumerate(evals):
            ey = panel_y + 55 + i * 46
            svg += svg_rect(content_x+content_w/2+25, ey, content_w/2-55, 38, "rgba(255,255,255,0.02)", rx=6)
            svg += svg_text(content_x+content_w-35, ey+15, sname, COLORS['text'], 11, align="right")
            grade_color = COLORS['success'] if grade >= 80 else COLORS['warning'] if grade >= 50 else COLORS['danger']
            svg += svg_text(content_x+content_w-35, ey+32, f"الدرجة: {grade}", grade_color, 10, bold=True, align="right")
            # Progress bar
            svg += svg_rect(content_x+content_w/2+25, ey+30, content_w/2-130, 4, "rgba(255,255,255,0.05)", rx=2)
            svg += svg_rect(content_x+content_w/2+25, ey+30, (content_w/2-130)*grade/100, 4, grade_color, rx=2)
        
        # Bottom: quick actions
        grid_y = panel_y + 265
        svg += svg_rect(content_x+15, grid_y, content_w-30, 60, "rgba(22,27,34,0.5)", rx=10, stroke="rgba(191,90,242,0.05)", sw=1)
        actions = ["📝 توزيع الدرجات", "📢 نشر تعميم", "📚 المكتبة", "💬 المحادثة"]
        for i, act in enumerate(actions):
            ax = content_x + 25 + i * ((content_w-50)/4)
            svg += svg_rect(ax, grid_y+10, (content_w-50)/4-8, 40, "rgba(191,90,242,0.05)", rx=8, stroke="rgba(191,90,242,0.1)", sw=1)
            svg += svg_text(ax+(content_w-50)/4-20, grid_y+35, act, COLORS['text'], 10, align="right")
    
    elif role == "STUDENT":
        # Student dashboard
        svg += svg_rect(content_x+15, panel_y, content_w/2-20, 200, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(0,229,255,0.12)", sw=1)
        svg += svg_text(content_x+content_w/2-30, panel_y+25, "📤 رفع تكليف جديد", COLORS['cyan'], 13, bold=True, align="right")
        # Upload area
        svg += svg_rect(content_x+30, panel_y+45, content_w/2-50, 70, "rgba(0,229,255,0.03)", rx=10, stroke="rgba(0,229,255,0.15)", sw=1.5, dash="5,5")
        svg += svg_text(content_x+content_w/2-40, panel_y+78, "📂 اختر ملف التكليف", COLORS['cyan'], 13, align="right")
        svg += svg_text(content_x+content_w/2-40, panel_y+98, "PDF, DOCX, XLSX, PNG, JPG — حد أقصى 20MB", COLORS['textMuted'], 9, align="right")
        svg += svg_rect(content_x+35, panel_y+130, content_w/2-60, 36, "rgba(0,229,255,0.15)", rx=8)
        svg += svg_text(content_x+content_w/2-45, panel_y+154, "🚀 رفع التكليف", COLORS['cyan'], 12, bold=True, align="right")
        
        # Right: recent grades
        svg += svg_rect(content_x+content_w/2+10, panel_y, content_w/2-25, 200, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(57,255,20,0.1)", sw=1)
        svg += svg_text(content_x+content_w-30, panel_y+25, "📊 آخر الدرجات", COLORS['green'], 13, bold=True, align="right")
        grades = [("الشبكات", 88), ("الأمن السيبراني", 95), ("البرمجة", 72), ("قواعد البيانات", 91)]
        for i, (gsubj, ggrade) in enumerate(grades):
            gy = panel_y + 50 + i * 36
            svg += svg_rect(content_x+content_w/2+25, gy, content_w/2-55, 28, "rgba(255,255,255,0.02)", rx=6)
            svg += svg_text(content_x+content_w-35, gy+19, gsubj, COLORS['text'], 10, align="right")
            gcolor = COLORS['success'] if ggrade >= 80 else COLORS['warning'] if ggrade >= 50 else COLORS['danger']
            svg += svg_text(content_x+content_w-35, gy+19, f"{ggrade}%", gcolor, 10, bold=True, align="left")
        
        # Bottom: quick links
        grid_y = panel_y + 215
        svg += svg_rect(content_x+15, grid_y, content_w-30, 70, "rgba(22,27,34,0.5)", rx=10, stroke="rgba(0,229,255,0.05)", sw=1)
        quick_items = [("🔔 الإشعارات", "3"), ("📚 المكتبة", "15"), ("💬 المحادثة", "7"), ("⚙️ الإعدادات", "")]
        for i, (qlabel, qbadge) in enumerate(quick_items):
            qx = content_x + 25 + i * ((content_w-50)/4)
            svg += svg_rect(qx, grid_y+10, (content_w-50)/4-8, 50, "rgba(0,229,255,0.03)", rx=8, stroke="rgba(0,229,255,0.08)", sw=1)
            svg += svg_text(qx+(content_w-50)/4-20, grid_y+40, qlabel, COLORS['text'], 11, align="right")
            if qbadge:
                svg += svg_circle(qx+(content_w-50)/4-25, grid_y+18, 8, COLORS['danger'])
                svg += svg_text(qx+(content_w-50)/4-25, grid_y+22, qbadge, COLORS['white'], 7, bold=True, align="right")
    
    svg += f'</g>'
    
    # === FOOTER ===
    svg += f'<!-- FOOTER -->'
    svg += svg_rect(0, H-footer_h, W, footer_h, "rgba(2,4,8,0.85)", stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(600, H-16, "تطوير وإشراف: محمد إبراهيم الديلمي | أحمد الهيدمة", COLORS['textMuted'], 10, align="right")
    svg += svg_text(600, H-6, "OFFICIAL CYBER SECURITY PLATFORM — DHAMAR UNIVERSITY © 2026", "rgba(255,255,255,0.3)", 7, font="Orbitron", align="right")
    
    svg += '</svg>'
    return svg


# ============================================================
# PART 2: Public Pages
# ============================================================
def generate_landing_page():
    """Landing page vision SVG."""
    W, H = 1200, 800
    
    html = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("heroGrad", colors=[("rgba(0,229,255,0.08)", "0%"), ("rgba(191,90,242,0.05)", "50%"), ("rgba(0,229,255,0)", "100%")])}
        {svg_gradient("heroGlow", colors=[("rgba(0,229,255,0.2)", "0%"), ("rgba(0,229,255,0)", "100%")])}
        {svg_filter("glowBig", 40)}
        {svg_filter("blurBg", 30)}
    </defs>
'''
    # Background grid
    html += f'<pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,229,255,0.03)" stroke-width="0.5"/></pattern>'
    html += f'<rect width="{W}" height="{H}" fill="url(#grid)" />'
    html += f'<rect width="{W}" height="{H}" fill="url(#heroGrad)" />'
    
    # Glowing circles
    html += svg_circle(900, 200, 250, "none", stroke="rgba(0,229,255,0.05)", sw=1)
    html += svg_circle(900, 200, 180, "none", stroke="rgba(0,229,255,0.03)", sw=1)
    html += svg_circle(300, 500, 200, "none", stroke="rgba(191,90,242,0.04)", sw=1)
    
    # Nav bar
    html += svg_rect(0, 0, W, 64, "rgba(2,4,8,0.85)", stroke="rgba(0,229,255,0.1)", sw=1)
    html += svg_rect(1150, 18, 32, 28, "rgba(0,229,255,0.15)", rx=6)
    html += svg_text(1166, 37, "CS", COLORS['cyan'], 12, bold=True, font="Orbitron", align="right")
    html += svg_text(1100, 37, "CYBER CLOUD", COLORS['white'], 11, font="Orbitron", align="right")
    nav_items = ["الرئيسية", "إحصائيات", "الأدوار", "المميزات", "كيفية العمل", "المطورون"]
    for i, item in enumerate(nav_items):
        nx = 1000 - i * 80
        html += svg_text(nx, 37, item, COLORS['textMuted'], 11, align="right")
    html += svg_rect(10, 14, 100, 36, "rgba(0,229,255,0.12)", rx=8, stroke=COLORS['cyan'], sw=1)
    html += svg_text(60, 37, "تسجيل الدخول", COLORS['cyan'], 11, bold=True, align="right")
    
    # Hero section
    html += svg_text(600, 160, "سحابة الأمن السيبراني", COLORS['white'], 38, bold=True, align="right")
    html += svg_text(600, 200, "CYBER SECURITY CLOUD", COLORS['cyan'], 16, font="Orbitron", align="right")
    html += svg_text(600, 240, "منصة متكاملة لإدارة العملية التعليمية في مجال الأمن السيبراني", COLORS['text'], 14, align="right")
    html += svg_text(600, 265, "مع أنظمة مراقبة فورية، وتقييم ذكي، وتواصل لحظي", COLORS['textMuted'], 12, align="right")
    
    # CTA Buttons
    html += svg_rect(750, 295, 130, 44, "rgba(0,229,255,0.2)", rx=10, stroke=COLORS['cyan'], sw=2)
    html += svg_text(815, 322, "ابدأ الآن", COLORS['cyan'], 16, bold=True, align="right")
    html += svg_rect(600, 295, 130, 44, "rgba(255,255,255,0.05)", rx=10, stroke="rgba(255,255,255,0.15)", sw=1)
    html += svg_text(665, 322, "اعرف المزيد", COLORS['text'], 14, align="right")
    
    # Stats row
    stats_data = [("٢٬٣٥٠+", "مستخدم نشط"), ("١٢٬٤٥٠+", "تقييم"), ("٩٩٫٩٪", "نسبة تشغيل"), ("٤ أدوار", "مستخدم")]
    for i, (val, label) in enumerate(stats_data):
        sx = 900 + i * 130
        html += svg_rect(sx-60, 370, 120, 80, "rgba(22,27,34,0.5)", rx=12, stroke="rgba(255,255,255,0.05)", sw=1)
        html += svg_text(sx, 405, val, COLORS['cyan'], 22, bold=True, align="right")
        html += svg_text(sx, 432, label, COLORS['textMuted'], 11, align="right")
    
    # Features grid
    html += svg_text(600, 510, "مميزات المنصة", COLORS['white'], 26, bold=True, align="right")
    features = [
        ("🛡️", "مراقبة فورية", "نظام رادار للأخطاء والتهديدات"),
        ("📚", "مكتبة تعليمية", "محتوى شامل للأمن السيبراني"),
        ("🤖", "بوت تيليجرام", "تواصل واستعادة كلمة المرور"),
        ("📊", "تحليلات متقدمة", "تقارير وإحصائيات دقيقة"),
    ]
    for i, (icon, ftitle, fdesc) in enumerate(features):
        fx = 900 - (i % 2) * 280
        fy = 555 + (i // 2) * 110
        html += svg_rect(fx-130, fy, 260, 95, "rgba(22,27,34,0.6)", rx=12, stroke="rgba(0,229,255,0.06)", sw=1)
        html += svg_text(fx, fy+30, icon, COLORS['cyan'], 24, align="right")
        html += svg_text(fx-10, fy+55, ftitle, COLORS['white'], 14, bold=True, align="right")
        html += svg_text(fx-10, fy+78, fdesc, COLORS['textMuted'], 11, align="right")
    
    # Footer
    html += svg_rect(0, H-40, W, 40, "rgba(2,4,8,0.95)", stroke="rgba(0,229,255,0.1)", sw=1)
    html += svg_text(600, H-16, "سحابة الأمن السيبراني © 2026 — جامعة ذمار - كلية الحاسبات", COLORS['textMuted'], 10, align="right")
    
    html += '</svg>'
    return html


def generate_login_page():
    """Login page vision SVG."""
    W, H = 1200, 800
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("panelGrad", colors=[("rgba(10,20,40,0.95)", "0%"), ("rgba(5,10,20,0.95)", "100%")])}
        {svg_filter("glow", 15)}
        {svg_filter("blurBg", 40)}
    </defs>
'''
    # Background: CyberGlobe inspired
    svg += f'<rect width="{W}" height="{H}" fill="{COLORS['bg']}" />'
    svg += svg_circle(900, 400, 300, "none", stroke="rgba(0,229,255,0.04)", sw=1)
    svg += svg_circle(900, 400, 220, "none", stroke="rgba(0,229,255,0.03)", sw=1)
    svg += svg_circle(900, 400, 140, "none", stroke="rgba(191,90,242,0.03)", sw=1)
    
    # Orbiting rings
    svg += f'<ellipse cx="900" cy="400" rx="350" ry="80" fill="none" stroke="rgba(0,229,255,0.06)" stroke-width="1" transform="rotate(-30 900 400)" />'
    svg += f'<ellipse cx="900" cy="400" rx="280" ry="60" fill="none" stroke="rgba(191,90,242,0.04)" stroke-width="1" transform="rotate(20 900 400)" />'
    
    # Globe dots
    for i in range(30):
        import math, random
        angle = random.random() * 360
        dist = 200 + random.random() * 100
        dx = 900 + math.cos(angle * math.pi / 180) * dist
        dy = 400 + math.sin(angle * math.pi / 180) * dist
        svg += svg_circle(dx, dy, random.randint(1, 3), f"rgba(0,229,255,{0.1 + random.random()*0.2})")
    
    # Login panel
    panel_w, panel_h = 380, 480
    px, py = 60, 160
    svg += svg_rect(px, py, panel_w, panel_h, "url(#panelGrad)", rx=16, stroke="rgba(0,229,255,0.15)", sw=1)
    svg += svg_rect(px+1, py+1, panel_w-2, 4, COLORS['cyan'], rx=2)
    
    # Panel content
    svg += svg_text(px+panel_w-30, py+45, "تسجيل الدخول", COLORS['white'], 22, bold=True, align="right")
    svg += svg_text(px+panel_w-30, py+68, "مرحباً بعودتك إلى المنصة", COLORS['textMuted'], 12, align="right")
    
    # Form fields
    svg += svg_text(px+panel_w-30, py+105, "البريد الإلكتروني أو اسم المستخدم", COLORS['text'], 11, bold=True, align="right")
    svg += svg_rect(px+20, py+115, panel_w-40, 42, COLORS['bgPanel'], rx=8, stroke="rgba(255,255,255,0.08)", sw=1)
    svg += svg_text(px+panel_w-40, py+141, "أدخل بريدك الإلكتروني", COLORS['textMuted'], 11, align="right")
    
    svg += svg_text(px+panel_w-30, py+175, "كلمة المرور", COLORS['text'], 11, bold=True, align="right")
    svg += svg_rect(px+20, py+185, panel_w-40, 42, COLORS['bgPanel'], rx=8, stroke="rgba(255,255,255,0.08)", sw=1)
    svg += svg_text(px+panel_w-40, py+211, "••••••••", COLORS['textMuted'], 14, align="right")
    svg += svg_text(px+30, py+211, "👁️", COLORS['textMuted'], 12, align="left")
    
    # Login button
    svg += svg_rect(px+20, py+245, panel_w-40, 44, "rgba(0,229,255,0.2)", rx=10, stroke=COLORS['cyan'], sw=2)
    svg += svg_text(px+panel_w/2, py+273, "🔐 تسجيل الدخول", COLORS['cyan'], 14, bold=True, align="right")
    
    # Alternative: WebAuthn
    svg += svg_rect(px+20, py+300, panel_w-40, 44, "rgba(191,90,242,0.1)", rx=10, stroke="rgba(191,90,242,0.3)", sw=1)
    svg += svg_text(px+panel_w/2, py+328, "🖐️ دخول بالبصمة", COLORS['purple'], 13, align="right")
    
    # Links
    svg += svg_text(px+panel_w-30, py+365, "نسيت كلمة المرور؟", COLORS['cyan'], 11, align="right")
    svg += svg_text(px+panel_w-30, py+390, "تفعيل الحساب", COLORS['textMuted'], 11, align="right")
    
    # 2FA section hint
    svg += svg_rect(px+20, py+410, panel_w-40, 50, "rgba(255,202,40,0.05)", rx=8, stroke="rgba(255,202,40,0.12)", sw=1)
    svg += svg_text(px+panel_w-40, py+440, "🔐 المصادقة الثنائية (Google Authenticator)", COLORS['gold'], 10, align="right")
    
    # Right side: welcome text
    svg += svg_text(700, 300, "نظام متكامل", COLORS['white'], 32, bold=True, align="right")
    svg += svg_text(700, 340, "لإدارة العملية التعليمية", COLORS['white'], 32, bold=True, align="right")
    svg += svg_text(700, 380, "في الأمن السيبراني", COLORS['cyan'], 32, bold=True, align="right")
    features_list = ["🛡️  مراقبة فورية ورادار أخطاء", "📚  مكتبة تعليمية متكاملة", "🤖  بوت تيليجرام للتواصل", "📊  تحليلات وتقارير دقيقة"]
    for i, f in enumerate(features_list):
        svg += svg_text(700, 430 + i*35, f, COLORS['text'], 13, align="right")
    
    # Footer
    svg += svg_rect(0, H-40, W, 40, "rgba(2,4,8,0.95)", stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(600, H-16, "تطوير وإشراف: محمد إبراهيم الديلمي | أحمد الهيدمة", COLORS['textMuted'], 10, align="right")
    
    svg += '</svg>'
    return svg


def generate_register_page():
    """Register page vision - show the activation flow."""
    W, H = 1200, 800
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("panelGrad", colors=[("rgba(10,20,40,0.95)", "0%"), ("rgba(5,10,20,0.95)", "100%")])}
        {svg_filter("glow", 12)}
    </defs>
'''
    # Background
    svg += f'<rect width="{W}" height="{H}" fill="{COLORS['bg']}" />'
    svg += f'<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,229,255,0.02)" stroke-width="0.5"/></pattern>'
    svg += f'<rect width="{W}" height="{H}" fill="url(#grid)" />'
    
    # Left: 3D globe visual
    svg += svg_circle(900, 400, 280, "none", stroke="rgba(0,229,255,0.04)", sw=1)
    svg += svg_circle(900, 400, 200, "none", stroke="rgba(191,90,242,0.03)", sw=1)
    svg += f'<ellipse cx="900" cy="400" rx="320" ry="60" fill="none" stroke="rgba(0,229,255,0.04)" stroke-width="1" transform="rotate(-20 900 400)" />'
    
    # Right: Activation panel
    panel_w, panel_h = 420, 520
    px, py = 50, 140
    svg += svg_rect(px, py, panel_w, panel_h, "url(#panelGrad)", rx=16, stroke="rgba(0,229,255,0.12)", sw=1)
    svg += svg_rect(px+1, py+1, panel_w-2, 4, COLORS['cyan'], rx=2)
    
    # Progress steps
    steps = ["✔️", "2", "3", "4"]
    for i, step in enumerate(steps):
        sx = px + 30 + i * 95
        sc = COLORS['cyan'] if i == 0 else COLORS['textMuted']
        sbg = "rgba(0,229,255,0.15)" if i == 0 else "rgba(255,255,255,0.05)"
        svg += svg_circle(sx+30, py+40, 14, sbg, stroke=sc, sw=1.5)
        svg += svg_text(sx+30, py+45, step, sc, 12, bold=True, align="right")
        if i < 3:
            svg += svg_rect(sx+47, py+37, 65, 3, "rgba(255,255,255,0.08)", rx=1.5)
    svg += svg_text(px+panel_w-30, py+80, "تفعيل الحساب - الخطوة 1 من 4", COLORS['white'], 18, bold=True, align="right")
    svg += svg_text(px+panel_w-30, py+105, "أدخل رمز التفعيل المرسل إلى بريدك الإلكتروني", COLORS['textMuted'], 11, align="right")
    
    # Activation code input
    svg += svg_text(px+panel_w-30, py+140, "رمز التفعيل", COLORS['text'], 11, bold=True, align="right")
    svg += svg_rect(px+20, py+152, panel_w-40, 50, COLORS['bgPanel'], rx=10, stroke="rgba(0,229,255,0.15)", sw=1)
    code_x = px+panel_w-50
    for i in range(6):
        svg += svg_rect(code_x - i*42, py+160, 34, 34, "rgba(0,229,255,0.05)", rx=6, stroke="rgba(0,229,255,0.2)", sw=1)
        svg += svg_text(code_x - i*42+17, py+183, str(i+1), COLORS['cyan'], 14, bold=True, align="right")
    
    # Verify button
    svg += svg_rect(px+20, py+220, panel_w-40, 44, "rgba(0,229,255,0.2)", rx=10, stroke=COLORS['cyan'], sw=2)
    svg += svg_text(px+panel_w/2, py+248, "✅ تحقق من الرمز", COLORS['cyan'], 14, bold=True, align="right")
    
    # Info: stage 2 preview
    svg += svg_rect(px+20, py+280, panel_w-40, 120, "rgba(255,255,255,0.02)", rx=10, stroke="rgba(255,255,255,0.05)", sw=1)
    svg += svg_text(px+panel_w-40, py+305, "معلومات المستخدم (بعد التحقق)", COLORS['textMuted'], 11, bold=True, align="right")
    svg += svg_text(px+panel_w-40, py+330, "الاسم: محمد الأحمدي", COLORS['text'], 11, align="right")
    svg += svg_text(px+panel_w-40, py+352, "الدور: 🎓 طالب", COLORS['text'], 11, align="right")
    svg += svg_text(px+panel_w-40, py+374, "المستوى: المستوى الأول", COLORS['text'], 11, align="right")
    svg += svg_text(px+40, py+374, "📋 نسخ", COLORS['cyan'], 10, align="left")
    
    # Stage 3 & 4 preview
    svg += svg_rect(px+20, py+415, (panel_w-50)/2, 80, "rgba(255,255,255,0.02)", rx=8, stroke="rgba(255,255,255,0.05)", sw=1)
    svg += svg_text(px+panel_w/2-35, py+445, "🔐", COLORS['cyan'], 20, align="right")
    svg += svg_text(px+panel_w/2-35, py+465, "تعيين كلمة المرور", COLORS['textMuted'], 10, align="right")
    
    svg += svg_rect(px+panel_w/2+20, py+415, (panel_w-50)/2, 80, "rgba(255,255,255,0.02)", rx=8, stroke="rgba(255,255,255,0.05)", sw=1)
    svg += svg_text(px+panel_w-35, py+445, "🤖", COLORS['cyan'], 20, align="right")
    svg += svg_text(px+panel_w-35, py+465, "ربط بوت تيليجرام", COLORS['textMuted'], 10, align="right")
    
    # Footer
    svg += svg_rect(0, H-40, W, 40, "rgba(2,4,8,0.95)", stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(600, H-16, "جامعة ذمار — كلية الأمن السيبراني", COLORS['textMuted'], 10, align="right")
    
    svg += '</svg>'
    return svg


def generate_forgot_password():
    """Forgot password page vision."""
    W, H = 1200, 800
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("panelGrad", colors=[("rgba(10,20,40,0.95)", "0%"), ("rgba(5,10,20,0.95)", "100%")])}
        {svg_filter("glow", 12)}
    </defs>
'''
    svg += f'<rect width="{W}" height="{H}" fill="{COLORS['bg']}" />'
    
    # Background effects (Matrix rain style)
    for i in range(20):
        import random
        mx = random.random() * W
        my = random.random() * H
        svg += svg_text(mx, my, random.choice(["01", "10", "$", "#"]), f"rgba(0,229,255,{0.02+random.random()*0.04})", 8, font="Orbitron", align="right")
    
    # Center panel
    panel_w, panel_h = 420, 450
    px, py = (W-panel_w)//2, (H-panel_h)//2
    svg += svg_rect(px, py, panel_w, panel_h, "url(#panelGrad)", rx=16, stroke="rgba(0,229,255,0.12)", sw=1)
    svg += svg_rect(px+1, py+1, panel_w-2, 4, COLORS['cyan'], rx=2)
    
    # Lock icon
    svg += svg_circle(W//2, py+55, 30, "rgba(0,229,255,0.1)", stroke=COLORS['cyan'], sw=2)
    svg += svg_text(W//2, py+62, "🔒", COLORS['cyan'], 22, align="right")
    
    svg += svg_text(W//2, py+110, "نسيت كلمة المرور", COLORS['white'], 22, bold=True, align="right")
    svg += svg_text(W//2, py+138, "أدخل بريدك الإلكتروني لاستعادة كلمة المرور", COLORS['textMuted'], 12, align="right")
    
    # Email input
    svg += svg_rect(px+30, py+170, panel_w-60, 46, COLORS['bgPanel'], rx=10, stroke="rgba(255,255,255,0.08)", sw=1)
    svg += svg_text(px+panel_w-50, py+198, "أدخل بريدك الإلكتروني", COLORS['textMuted'], 11, align="right")
    
    # Send button
    svg += svg_rect(px+30, py+235, panel_w-60, 44, "rgba(0,229,255,0.2)", rx=10, stroke=COLORS['cyan'], sw=2)
    svg += svg_text(W//2, py+263, "📧 إرسال رمز التحقق", COLORS['cyan'], 14, bold=True, align="right")
    
    # Or section
    svg += svg_rect(px+50, py+295, panel_w-100, 1, "rgba(255,255,255,0.08)")
    svg += svg_text(W//2, py+295, "أو", COLORS['textMuted'], 11, align="right")
    
    # Telegram OTP
    svg += svg_rect(px+30, py+315, panel_w-60, 50, "rgba(0,229,255,0.03)", rx=10, stroke="rgba(0,229,255,0.08)", sw=1)
    svg += svg_text(W//2, py+347, "🤖 التحقق عبر بوت تيليجرام", COLORS['cyan'], 12, align="right")
    
    # Stages preview
    svg += svg_text(W//2, py+390, "الخطوات:", COLORS['textMuted'], 11, bold=True, align="right")
    stages = ["① إدخال البريد", "② رمز التحقق (بوت تيليجرام)", "③ تعيين كلمة مرور جديدة"]
    for i, stage in enumerate(stages):
        svg += svg_text(W//2, py+415+i*25, stage, COLORS['text'], 10, align="right")
    
    # Footer
    svg += svg_rect(0, H-40, W, 40, "rgba(2,4,8,0.95)", stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(600, H-16, "Cyber Security Cloud — استعادة كلمة المرور", COLORS['textMuted'], 10, align="right")
    
    svg += '</svg>'
    return svg


def generate_activation_page():
    """Account activation page vision."""
    W, H = 1200, 800
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("panelGrad", colors=[("rgba(10,20,40,0.95)", "0%"), ("rgba(5,10,20,0.95)", "100%")])}
        {svg_filter("glow", 12)}
    </defs>
'''
    svg += f'<rect width="{W}" height="{H}" fill="{COLORS['bg']}" />'
    
    # Animated background patterns
    svg += svg_circle(250, 200, 200, "none", stroke="rgba(0,229,255,0.03)", sw=1)
    svg += svg_circle(950, 600, 180, "none", stroke="rgba(191,90,242,0.03)", sw=1)
    
    # Center panel - Activation Complete (Stage 4)
    panel_w, panel_h = 500, 420
    px, py = (W-panel_w)//2, (H-panel_h)//2
    svg += svg_rect(px, py, panel_w, panel_h, "url(#panelGrad)", rx=16, stroke="rgba(0,229,255,0.12)", sw=1)
    svg += svg_rect(px+1, py+1, panel_w-2, 4, COLORS['cyan'], rx=2)
    
    # Success checkmark
    svg += svg_circle(W//2, py+55, 35, "rgba(46,160,67,0.15)", stroke=COLORS['success'], sw=2.5)
    svg += svg_text(W//2, py+63, "✅", COLORS['success'], 28, align="right")
    
    svg += svg_text(W//2, py+115, "تم التفعيل بنجاح!", COLORS['white'], 24, bold=True, align="right")
    svg += svg_text(W//2, py+140, "حسابك جاهز للاستخدام. مرحباً بك في سحابة الأمن السيبراني", COLORS['textMuted'], 12, align="right")
    
    # User info card
    svg += svg_rect(px+60, py+165, panel_w-120, 90, "rgba(0,229,255,0.03)", rx=10, stroke="rgba(0,229,255,0.08)", sw=1)
    svg += svg_circle(px+panel_w-90, py+210, 25, COLORS['cyan']+"22", stroke=COLORS['cyan'], sw=1.5)
    svg += svg_text(px+panel_w-90, py+217, "م", COLORS['cyan'], 18, bold=True, align="right")
    svg += svg_text(px+panel_w-130, py+195, "محمد الأحمدي", COLORS['white'], 14, bold=True, align="right")
    svg += svg_text(px+panel_w-130, py+215, "🎓 طالب - المستوى الأول", COLORS['textMuted'], 11, align="right")
    svg += svg_text(px+panel_w-130, py+235, "اسم المستخدم: mohammed_a", COLORS['cyan'], 10, align="right")
    
    # Telegram binding
    svg += svg_rect(px+60, py+275, panel_w-120, 55, "rgba(0,229,255,0.02)", rx=10, stroke="rgba(0,229,255,0.06)", sw=1)
    svg += svg_text(px+panel_w-80, py+300, "🤖  ربط بوت تيليجرام للتواصل واستعادة كلمة المرور", COLORS['text'], 11, align="right")
    svg += svg_text(px+panel_w-80, py+318, "رمز الربط: CYBER-1234-ABCD", COLORS['cyan'], 10, font="Orbitron", align="right")
    
    # Start button
    svg += svg_rect(px+60, py+350, panel_w-120, 44, "rgba(0,229,255,0.2)", rx=10, stroke=COLORS['cyan'], sw=2)
    svg += svg_text(W//2, py+378, "🚀 ابدأ رحلتك التعليمية", COLORS['cyan'], 15, bold=True, align="right")
    
    # Footer
    svg += svg_rect(0, H-40, W, 40, "rgba(2,4,8,0.95)", stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(600, H-16, "Cyber Security Cloud — تفعيل الحساب", COLORS['textMuted'], 10, align="right")
    
    svg += '</svg>'
    return svg


# ============================================================
# PART 4: CyberGlobe Architecture
# ============================================================
def generate_cyberglobe_architecture():
    """CyberGlobe architecture with responsive variants."""
    W, H = 1000, 700
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("globeGrad", colors=[("rgba(0,229,255,0.08)", "0%"), ("rgba(0,229,255,0)", "100%")])}
        {svg_filter("glow", 20)}
        {svg_filter("shadow", 4)}
    </defs>
'''
    svg += f'<rect width="{W}" height="{H}" fill="{COLORS['bg']}" />'
    svg += f'<pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,229,255,0.03)" stroke-width="0.5"/></pattern>'
    svg += f'<rect width="{W}" height="{H}" fill="url(#grid)" />'
    
    # Title
    svg += svg_text(W-30, 35, "🎯 CyberGlobe — الهيكل المعماري والتكيف مع الأجهزة", COLORS['white'], 20, bold=True, align="right")
    svg += svg_text(W-30, 58, "Desktop · Tablet · Mobile — Dynamic Loading · Device Detection · Performance Scaling", COLORS['cyan'], 11, font="Orbitron", align="right")
    
    # === DESKTOP (Large) ===
    svg += svg_rect(20, 80, 460, 280, "rgba(10,18,30,0.7)", rx=14, stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(460, 105, "🖥️  Desktop — Full 3D Globe", COLORS['white'], 14, bold=True, align="right")
    
    # Desktop globe
    cx, cy = 150, 230
    svg += svg_circle(cx, cy, 85, "none", stroke="rgba(0,229,255,0.2)", sw=1)
    svg += svg_circle(cx, cy, 85, "rgba(0,229,255,0.03)")
    svg += svg_circle(cx, cy, 65, "none", stroke="rgba(0,229,255,0.12)", sw=0.5)
    # Dots
    for i in range(40):
        import math, random
        a = random.random() * 2 * math.pi
        r = 30 + random.random() * 50
        dx = cx + math.cos(a) * r
        dy = cy + math.sin(a) * r
        svg += svg_circle(dx, dy, random.randint(1, 3), f"rgba(0,229,255,{0.2+random.random()*0.4})")
    # Orbital rings
    svg += f'<ellipse cx="{cx}" cy="{cy}" rx="110" ry="30" fill="none" stroke="rgba(0,229,255,0.15)" stroke-width="0.8" transform="rotate(-25 {cx} {cy})" />'
    svg += f'<ellipse cx="{cx}" cy="{cy}" rx="95" ry="25" fill="none" stroke="rgba(191,90,242,0.1)" stroke-width="0.8" transform="rotate(15 {cx} {cy})" />'
    svg += f'<ellipse cx="{cx}" cy="{cy}" rx="105" ry="28" fill="none" stroke="rgba(57,255,20,0.08)" stroke-width="0.8" transform="rotate(-10 {cx} {cy})" />'
    # Floating particles
    for i in range(20):
        import math, random
        a = random.random() * 2 * math.pi
        r = 120 + random.random() * 60
        dx = cx + math.cos(a) * r
        dy = cy + math.sin(a) * r
        svg += svg_circle(dx, dy, 1, f"rgba(0,229,255,{0.05+random.random()*0.1})")
    
    # Desktop details
    details = ["· 3000 glowing points on sphere surface", "· 4 orbiting torus rings (cyan, purple, green, gold)", "· 700 floating outer-space particles", "· Dynamic point lights (cyan + purple)", "· Auto-rotate with OrbitControls", "· Wireframe sphere (8% opacity)", "· Connecting lines between nearby points"]
    for i, d in enumerate(details):
        svg += svg_text(450, 135+i*24, d, COLORS['text'], 10, align="right")
    
    # === TABLET ===
    svg += svg_rect(20, 380, 460, 280, "rgba(10,18,30,0.7)", rx=14, stroke="rgba(191,90,242,0.1)", sw=1)
    svg += svg_text(460, 405, "📱  Tablet — Medium Globe", COLORS['white'], 14, bold=True, align="right")
    
    # Tablet globe - smaller
    cx2, cy2 = 150, 530
    svg += svg_circle(cx2, cy2, 60, "none", stroke="rgba(191,90,242,0.2)", sw=1)
    svg += svg_circle(cx2, cy2, 60, "rgba(191,90,242,0.03)")
    for i in range(25):
        import math, random
        a = random.random() * 2 * math.pi
        r = 15 + random.random() * 40
        dx = cx2 + math.cos(a) * r
        dy = cy2 + math.sin(a) * r
        svg += svg_circle(dx, dy, random.randint(1, 2), f"rgba(191,90,242,{0.15+random.random()*0.3})")
    svg += f'<ellipse cx="{cx2}" cy="{cy2}" rx="75" ry="20" fill="none" stroke="rgba(191,90,242,0.12)" stroke-width="0.8" transform="rotate(-20 {cx2} {cy2})" />'
    
    details2 = ["· Reduced: 1500 points", "· 2 orbital rings (purple + cyan)", "· 300 particles", "· Simplified lighting", "· Smaller canvas (500x500)"]
    for i, d in enumerate(details2):
        svg += svg_text(450, 435+i*24, d, COLORS['text'], 10, align="right")
    
    # === MOBILE ===
    svg += svg_rect(520, 80, 460, 280, "rgba(10,18,30,0.7)", rx=14, stroke="rgba(57,255,20,0.1)", sw=1)
    svg += svg_text(960, 105, "📱  Mobile — Lightweight Globe", COLORS['white'], 14, bold=True, align="right")
    
    # Mobile globe - smallest
    cx3, cy3 = 650, 230
    svg += svg_circle(cx3, cy3, 40, "none", stroke="rgba(57,255,20,0.2)", sw=1)
    svg += svg_circle(cx3, cy3, 40, "rgba(57,255,20,0.03)")
    for i in range(12):
        import math, random
        a = random.random() * 2 * math.pi
        r = 10 + random.random() * 25
        dx = cx3 + math.cos(a) * r
        dy = cy3 + math.sin(a) * r
        svg += svg_circle(dx, dy, random.randint(1, 2), f"rgba(57,255,20,{0.15+random.random()*0.3})")
    svg += f'<ellipse cx="{cx3}" cy="{cy3}" rx="55" ry="14" fill="none" stroke="rgba(57,255,20,0.1)" stroke-width="0.8" transform="rotate(-15 {cx3} {cy3})" />'
    
    details3 = ["· Minimal: 500 points", "· 1 orbital ring (green)", "· 100 particles", "· No wireframe or connecting lines", "· Lower resolution rendering", "· Disabled on low-end devices"]
    for i, d in enumerate(details3):
        svg += svg_text(960, 135+i*24, d, COLORS['text'], 10, align="right")
    
    # === ARCHITECTURE NOTES ===
    svg += svg_rect(520, 380, 460, 120, "rgba(10,18,30,0.7)", rx=14, stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(960, 405, "⚙️  Performance Architecture", COLORS['white'], 14, bold=True, align="right")
    perf_items = [
        "· Dynamic Loading: مكون lazy (next/dynamic) مع ssr: false",
        "· Device Detection: useMediaQuery + useResponsive",
        "· Visibility Pause: توقف auto-rotate عند إخفاء الصفحة",
        "· Progressive Enhancement: من سطح المكتب إلى الجوال",
    ]
    for i, d in enumerate(perf_items):
        svg += svg_text(960, 430+i*22, d, COLORS['text'], 10, align="right")
    
    # === TECH SPECS ===
    svg += svg_rect(520, 520, 460, 140, "rgba(10,18,30,0.7)", rx=14, stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(960, 545, "🔧  Technical Stack", COLORS['white'], 14, bold=True, align="right")
    tech = [
        "· Three.js via @react-three/fiber + @react-three/drei",
        "· 750x750 canvas (desktop) → responsive via parent container",
        "· PointsMaterial for stars + connecting lines geometry",
        "· OrbitControls with auto-rotate + damping",
        "· Paused when document.hidden = true (Page Visibility API)",
    ]
    for i, d in enumerate(tech):
        svg += svg_text(960, 570+i*22, d, COLORS['text'], 10, align="right")
    
    svg += '</svg>'
    return svg


# ============================================================
# PART 5: Unified AppShell Blueprint
# ============================================================
def generate_appshell_blueprint():
    """Unified AppShell blueprint with responsive variants."""
    W, H = 1200, 800
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="background:{COLORS['bg']};direction:rtl">
    <defs>
        {svg_gradient("shellGrad", colors=[("rgba(0,229,255,0.05)", "0%"), ("rgba(0,229,255,0)", "100%")])}
        {svg_filter("glow", 8)}
    </defs>
'''
    svg += f'<rect width="{W}" height="{H}" fill="{COLORS['bg']}" />'
    svg += f'<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,229,255,0.02)" stroke-width="0.5"/></pattern>'
    svg += f'<rect width="{W}" height="{H}" fill="url(#grid)" />'
    
    # Title
    svg += svg_text(W-30, 35, "🏗️  Unified AppShell Blueprint — المخطط الهيكلي الموحد", COLORS['white'], 20, bold=True, align="right")
    svg += svg_text(W-30, 58, "Desktop · Tablet · Mobile — مع طبقات الإشعارات والمحادثة", COLORS['cyan'], 11, font="Orbitron", align="right")
    
    # === DESKTOP BLUEPRINT ===
    # Outer frame
    ax, ay, aw, ah = 20, 80, 560, 380
    svg += svg_rect(ax, ay, aw, ah, "rgba(10,18,30,0.5)", rx=8, stroke="rgba(0,229,255,0.15)", sw=1.5)
    svg += svg_text(ax+aw-15, ay+22, "🖥️  Desktop AppShell", COLORS['white'], 12, bold=True, align="right")
    
    # Header
    hx, hy, hw, hh = ax+1, ay+30, aw-2, 40
    svg += svg_rect(hx, hy, hw, hh, "rgba(0,229,255,0.08)", rx=4, stroke="rgba(0,229,255,0.2)", sw=1.5)
    svg += svg_text(hx+hw-10, hy+25, "[ ⏰ CYBER SECURITY CLOUD ] 🔍 🔔 👤", COLORS['cyan'], 9, font="Orbitron", align="right")
    
    # Main area: Sidebar + Content
    main_y = hy + hh + 1
    main_h = ah - (main_y - ay) - 45
    
    # Sidebar
    sx, sy, sw, sh = ax+1, main_y, 120, main_h
    svg += svg_rect(sx, sy, sw, sh, "rgba(0,229,255,0.03)", rx=4, stroke="rgba(0,229,255,0.12)", sw=1.5)
    svg += svg_text(sx+sw-8, sy+18, "🔷", COLORS['cyan'], 14, align="right")
    svg += svg_text(sx+sw-8, sy+40, "MENU", COLORS['textMuted'], 7, font="Orbitron", align="right")
    # Mini menu items
    for i in range(6):
        svg += svg_rect(sx+5, sy+55+i*18, sw-10, 12, "rgba(0,229,255,0.05)", rx=3)
    
    # Content area
    content_x = sx + sw + 1
    content_w = aw - sw - 4
    svg += svg_rect(content_x, sy, content_w, sh, "rgba(255,255,255,0.02)", rx=4, stroke="rgba(255,255,255,0.06)", sw=1.5)
    svg += svg_text(content_x+content_w-8, sy+18, "📍", COLORS['textMuted'], 12, align="right")
    svg += svg_text(content_x+content_w-8, sy+40, "MAIN CONTENT", COLORS['textMuted'], 7, font="Orbitron", align="right")
    # Content blocks
    for i in range(3):
        svg += svg_rect(content_x+5, sy+55+i*25, content_w-10, 18, "rgba(255,255,255,0.03)", rx=4)
    
    # Footer
    footer_y = ay + ah - 40
    svg += svg_rect(ax+1, footer_y, aw-2, 38, "rgba(0,229,255,0.04)", rx=4, stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(ax+aw-15, footer_y+24, "Footer: المطورون + حقوق النشر", COLORS['textMuted'], 8, align="right")
    
    # === TABLET BLUEPRINT ===
    bx, by, bw, bh = 20, 480, 560, 280
    svg += svg_rect(bx, by, bw, bh, "rgba(10,18,30,0.5)", rx=8, stroke="rgba(191,90,242,0.15)", sw=1.5)
    svg += svg_text(bx+bw-15, by+22, "📱  Tablet AppShell (Collapsed Sidebar)", COLORS['white'], 12, bold=True, align="right")
    
    # Tablet header
    thx, thy, thw, thh = bx+1, by+30, bw-2, 35
    svg += svg_rect(thx, thy, thw, thh, "rgba(191,90,242,0.06)", rx=4, stroke="rgba(191,90,242,0.15)", sw=1.5)
    svg += svg_text(thx+thw-10, thy+22, "☰ ⏰ CS CLOUD 🔔 👤", COLORS['purple'], 8, font="Orbitron", align="right")
    
    # Tablet main - sidebar is overlay (shown with hamburger)
    tm_y = thy + thh + 1
    tm_h = bh - (tm_y - by) - 40
    
    # Content (full width)
    svg += svg_rect(bx+1, tm_y, bw-2, tm_h, "rgba(255,255,255,0.02)", rx=4, stroke="rgba(255,255,255,0.06)", sw=1.5)
    svg += svg_text(bx+bw-10, tm_y+18, "📍 Main Content (Full Width)", COLORS['textMuted'], 8, align="right")
    for i in range(4):
        svg += svg_rect(bx+8, tm_y+35+i*22, bw-18, 15, "rgba(255,255,255,0.03)", rx=3)
    
    # Sidebar overlay (shown on top)
    svg += svg_rect(bx+1, tm_y, 150, tm_h, "rgba(8,12,25,0.95)", rx=4, stroke="rgba(191,90,242,0.2)", sw=2)
    svg += svg_text(bx+145, tm_y+18, "☰", COLORS['purple'], 14, align="right")
    svg += svg_text(bx+145, tm_y+40, "MENU (overlay)", COLORS['textMuted'], 7, font="Orbitron", align="right")
    for i in range(6):
        svg += svg_rect(bx+8, tm_y+55+i*18, 130, 12, "rgba(191,90,242,0.06)", rx=3)
    
    # Tablet footer
    tfooter_y = by + bh - 38
    svg += svg_rect(bx+1, tfooter_y, bw-2, 36, "rgba(191,90,242,0.03)", rx=4, stroke="rgba(191,90,242,0.08)", sw=1)
    svg += svg_text(bx+bw-15, tfooter_y+22, "Footer", COLORS['textMuted'], 8, align="right")
    
    # === MOBILE BLUEPRINT (Right side) ===
    mx, my, mw, mh = 620, 80, 320, 400
    svg += svg_rect(mx, my, mw, mh, "rgba(10,18,30,0.5)", rx=8, stroke="rgba(57,255,20,0.15)", sw=1.5)
    svg += svg_text(mx+mw-15, my+22, "📱  Mobile AppShell", COLORS['white'], 12, bold=True, align="right")
    
    # Mobile header
    mhx, mhy, mhw, mhh = mx+1, my+30, mw-2, 32
    svg += svg_rect(mhx, mhy, mhw, mhh, "rgba(57,255,20,0.06)", rx=4, stroke="rgba(57,255,20,0.12)", sw=1.5)
    svg += svg_text(mhx+mhw-8, mhy+20, "☰ 10:30 🔔", COLORS['green'], 7, font="Orbitron", align="right")
    
    # Mobile main (full width)
    mm_y = mhy + mhh + 1
    mm_h = mh - (mm_y - my) - 36
    svg += svg_rect(mx+1, mm_y, mw-2, mm_h, "rgba(255,255,255,0.02)", rx=4, stroke="rgba(255,255,255,0.06)", sw=1)
    svg += svg_text(mx+mw-8, mm_y+18, "📍 Content", COLORS['textMuted'], 8, align="right")
    for i in range(5):
        svg += svg_rect(mx+8, mm_y+32+i*18, mw-18, 12, "rgba(255,255,255,0.03)", rx=3)
    
    # Mobile footer
    mfooter_y = my + mh - 34
    svg += svg_rect(mx+1, mfooter_y, mw-2, 32, "rgba(57,255,20,0.03)", rx=4, stroke="rgba(57,255,20,0.06)", sw=1)
    
    # === LAYER NOTES (Right side) ===
    lx, ly, lw, lh = 620, 500, 560, 260
    svg += svg_rect(lx, ly, lw, lh, "rgba(10,18,30,0.7)", rx=14, stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(lx+lw-15, ly+25, "📐  Layer Architecture", COLORS['white'], 16, bold=True, align="right")
    
    layers = [
        ("🔝  z-index: 60", "BellNotifications Popup — قائمة الإشعارات", COLORS['cyan']),
        ("🔝  z-index: 50", "UnifiedHeader — الهيدر الموحد (ثابت)", COLORS['purple']),
        ("🔝  z-index: 40", "UnifiedSidebar — القائمة الجانبية", COLORS['gold']),
        ("📄  z-index: 30", "Main Content — المحتوى الرئيسي", COLORS['green']),
        ("🔝  z-index: 50", "Footer — التذييل (أسفل الصفحة)", COLORS['textMuted']),
        ("💬  z-index: 100", "Chat Layer — نافذة المحادثة", COLORS['redBright']),
    ]
    for i, (zindex, desc, color) in enumerate(layers):
        svg += svg_rect(lx+15, ly+50+i*32, lw-30, 26, "rgba(255,255,255,0.02)", rx=6, stroke="rgba(255,255,255,0.05)", sw=0.5)
        svg += svg_text(lx+lw-25, ly+67+i*32, f"{zindex} — {desc}", color, 10, align="right")
    
    # Responsive breakpoints note
    svg += svg_rect(lx+15, ly+50+6*32+10, lw-30, 50, "rgba(0,229,255,0.03)", rx=8, stroke="rgba(0,229,255,0.1)", sw=1)
    svg += svg_text(lx+lw-25, ly+50+6*32+32, "📊  Breakpoints: Mobile < 640px | Tablet 640-1023 | Desktop ≥ 1024px", COLORS['cyan'], 10, font="Orbitron", align="right")
    svg += svg_text(lx+lw-25, ly+50+6*32+50, "🔄  Sidebar: Desktop (ثابت) | Tablet/Mobile (overlay مع backdrop)", COLORS['text'], 10, align="right")
    
    svg += '</svg>'
    return svg


# ============================================================
# PART 6: Navigation Flow Diagram
# ============================================================
def generate_navigation_flow():
    """Navigation flow diagram using matplotlib."""
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
    import numpy as np
    
    plt.rcParams['text.color'] = '#e6edf3'
    plt.rcParams['axes.facecolor'] = '#010204'
    plt.rcParams['figure.facecolor'] = '#010204'
    
    fig, ax = plt.subplots(1, 1, figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor('#010204')
    
    # Title
    ax.text(8, 9.6, "Navigation Flow Architecture — رسم تدفق التنقل", 
            fontsize=18, fontweight='bold', color='#00e5ff', ha='center', fontfamily='sans-serif')
    ax.text(8, 9.25, "Login Flow · Student · Teacher · Management · Admin", 
            fontsize=11, color='#8b949e', ha='center')
    
    # Node styles
    def add_node(ax, x, y, text, color='#0a1128', text_color='#e6edf3', border='#00e5ff', size=(1.8, 0.5), fontsize=9):
        rect = FancyBboxPatch((x-size[0]/2, y-size[1]/2), size[0], size[1],
                              boxstyle="round,pad=0.1", facecolor=color, edgecolor=border, linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x, y, text, fontsize=fontsize, color=text_color, ha='center', va='center', fontfamily='sans-serif')
    
    def add_arrow(ax, x1, y1, x2, y2, color=(0, 0.9, 1, 0.3), style='->'):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle=style, color=color, lw=1.5, connectionstyle='arc3,rad=0.1'))
    
    # === LOGIN FLOW (center right) ===
    add_node(ax, 8, 8.5, "🔐 Login", '#0d1117', '#ffffff', '#00e5ff', (1.6, 0.5), 10)
    add_node(ax, 6, 7.3, "📧 2FA Required", '#0d1117', '#ffca28', '#ffca28', (1.6, 0.45), 9)
    add_node(ax, 10, 7.3, "🖐️ WebAuthn", '#0d1117', '#bf5af2', '#bf5af2', (1.6, 0.45), 9)
    add_node(ax, 8, 6.0, "✅ Authenticated", '#0d1117', '#2ea043', '#2ea043', (1.8, 0.45), 10)
    add_node(ax, 8, 4.8, "🔀 Role Redirect", '#0d1117', '#00e5ff', '#00e5ff', (1.8, 0.45), 10)
    
    # Login arrows
    add_arrow(ax, 8, 8.25, 7, 7.55)
    add_arrow(ax, 8, 8.25, 9, 7.55)
    add_arrow(ax, 7, 7.05, 8, 6.25)
    add_arrow(ax, 9, 7.05, 8, 6.25)
    add_arrow(ax, 8, 5.75, 8, 5.05)
    
    # === ROLE DASHBOARDS ===
    # Admin
    add_node(ax, 2.5, 3.8, "👑 ADMIN", '#ff3131' + '22', '#ff3131', '#ff3131', (1.6, 0.5), 11)
    add_node(ax, 2.5, 2.8, "SOC Dashboard", '#0d1117', '#e6edf3', '#ff3131', (1.8, 0.45), 9)
    add_node(ax, 2.5, 1.8, "Full Admin Panel\n+ Page Control", '#0d1117', '#e6edf3', '#ff3131', (1.8, 0.55), 8)
    add_arrow(ax, 2.5, 3.55, 2.5, 3.1)
    add_arrow(ax, 2.5, 2.55, 2.5, 2.15)
    
    # Management
    add_node(ax, 5.5, 3.8, "🏢 MANAGEMENT", '#ffca28' + '22', '#ffca28', '#ffca28', (1.8, 0.5), 11)
    add_node(ax, 5.5, 2.8, "Command Center", '#0d1117', '#e6edf3', '#ffca28', (1.8, 0.45), 9)
    add_node(ax, 5.5, 1.8, "KPIs + Approvals\n+ Reports", '#0d1117', '#e6edf3', '#ffca28', (1.8, 0.55), 8)
    add_arrow(ax, 5.5, 3.55, 5.5, 3.1)
    add_arrow(ax, 5.5, 2.55, 5.5, 2.15)
    
    # Teacher
    add_node(ax, 8.5, 3.8, "👨‍🏫 TEACHER", '#bf5af2' + '22', '#bf5af2', '#bf5af2', (1.8, 0.5), 11)
    add_node(ax, 8.5, 2.8, "Control Center", '#0d1117', '#e6edf3', '#bf5af2', (1.8, 0.45), 9)
    add_node(ax, 8.5, 1.8, "Evaluations + Grades\n+ Assignments", '#0d1117', '#e6edf3', '#bf5af2', (1.8, 0.55), 8)
    add_arrow(ax, 8.5, 3.55, 8.5, 3.1)
    add_arrow(ax, 8.5, 2.55, 8.5, 2.15)
    
    # Student
    add_node(ax, 11.5, 3.8, "🎓 STUDENT", '#00e5ff' + '22', '#00e5ff', '#00e5ff', (1.8, 0.5), 11)
    add_node(ax, 11.5, 2.8, "Learning Hub", '#0d1117', '#e6edf3', '#00e5ff', (1.8, 0.45), 9)
    add_node(ax, 11.5, 1.8, "Upload + Grades\n+ Progress", '#0d1117', '#e6edf3', '#00e5ff', (1.8, 0.55), 8)
    add_arrow(ax, 11.5, 3.55, 11.5, 3.1)
    add_arrow(ax, 11.5, 2.55, 11.5, 2.15)
    
    # Redirect arrows
    arrow_color = '#00e5ff'
    add_arrow(ax, 7.2, 4.55, 3.3, 4.1)
    add_arrow(ax, 8.8, 4.55, 6.3, 4.1)
    add_arrow(ax, 8, 4.55, 8.5, 4.1)
    add_arrow(ax, 8.8, 4.55, 10.7, 4.1)
    
    # === SIDEBAR NAVIGATION ===
    ax.text(8, 1.2, "│", fontsize=30, color=(0, 0.898, 1.0, 0.2), ha='center')
    add_node(ax, 8, 0.7, "🔙 Unified Sidebar (ALL PAGES)", '#0d1117', '#8b949e', (1, 1, 1, 0.15), (2.8, 0.5), 9)
    add_arrow(ax, 8, 1.5, 8, 1.0)
    
    # === EXCLUDED PAGES ===
    ax.text(8, 0.2, "🚫 Landing Page (/) + Login Page (/login) — بدون Sidebar/Header/Footer", 
            fontsize=9, color='#8b949e', ha='center', style='italic')
    
    # === SHARED COMPONENTS NOTE ===
    add_node(ax, 14, 5.5, "🔄 Shared\nComponents", '#0a1128', '#00e5ff', (0, 0.898, 1.0, 0.3), (1.6, 0.6), 8)
    shared = ["⚡ FloatingBell", "🔔 Notifications", "💬 Chat", "📚 Library", "⚙️ Settings"]
    for i, item in enumerate(shared):
        add_node(ax, 14, 4.5-i*0.5, item, '#0a1128', '#8b949e', (1, 1, 1, 0.1), (1.6, 0.35), 7)
        add_arrow(ax, 14, 5.2, 14, 4.8-i*0.5)
    
    # Legend
    ax.text(1.5, 9.0, "Legend:", fontsize=10, color='#00e5ff', fontweight='bold')
    add_node(ax, 1.5, 8.3, "Login Flow", '#0d1117', '#ffffff', '#00e5ff', (1.3, 0.35), 7)
    add_node(ax, 1.5, 7.6, "Auth Step", '#0d1117', '#ffca28', '#ffca28', (1.3, 0.35), 7)
    add_node(ax, 1.5, 6.9, "Dashboard", '#0d1117', '#e6edf3', '#30363d', (1.3, 0.35), 7)
    
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'Navigation_Flow_Diagram.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor='#010204')
    plt.close()
    print(f"  ✅ Navigation_Flow_Diagram.png")
    return path


# ============================================================
# SAVE SVG AND CONVERT
# ============================================================
def save_svg(svg_content, filename):
    """Save SVG content to a file."""
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"  ✅ {filename}")
    return path

def try_convert_to_png(svg_path, png_filename):
    """Try to convert SVG to PNG using available tools."""
    # Try cairosvg first
    try:
        import cairosvg
        png_path = os.path.join(OUTPUT_DIR, png_filename)
        cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=1200, output_height=800)
        print(f"  ✅ {png_filename} (cairosvg)")
        return png_path
    except ImportError:
        pass
    
    # Try svg2rlg + reportlab
    try:
        from svglib.svglib import svg2rlg
        from reportlab.graphics import renderPM
        png_path = os.path.join(OUTPUT_DIR, png_filename)
        drawing = svg2rlg(svg_path)
        renderPM.drawToFile(drawing, png_path, fmt='PNG')
        print(f"  ✅ {png_filename} (svglib)")
        return png_path
    except ImportError:
        pass
    
    print(f"  ⚠️  PNG conversion skipped for {png_filename} (no converter available)")
    return None

def generate_all():
    """Generate all visual concept images."""
    print("🚀 Generating Phase 1C Visual Concept Images...")
    print(f"   Output: {OUTPUT_DIR}\n")
    
    # --- PART 1: Role-based AppShell Concepts ---
    print("📁 PART 1: Role-Based AppShell Concepts")
    roles = ["Admin", "Management", "Teacher", "Student"]
    role_key = {"Admin": "ADMIN", "Management": "MANAGEMENT", "Teacher": "TEACHER", "Student": "STUDENT"}
    
    for role in roles:
        svg = generate_appshell_concept(role_key[role])
        svg_path = save_svg(svg, f"{role}_AppShell_Concept.svg")
        try_convert_to_png(svg_path, f"{role}_AppShell_Concept.png")
    print()
    
    # --- PART 2: Public Pages ---
    print("📁 PART 2: Public Page Concepts")
    pages = [
        ("Landing_Page_Vision", generate_landing_page),
        ("Login_Page_Vision", generate_login_page),
        ("Register_Page_Vision", generate_register_page),
        ("ForgotPassword_Vision", generate_forgot_password),
        ("Activation_Vision", generate_activation_page),
    ]
    for name, func in pages:
        svg = func()
        svg_path = save_svg(svg, f"{name}.svg")
        try_convert_to_png(svg_path, f"{name}.png")
    print()
    
    # --- PART 3: Dashboard Visions (reuse from Part 1) ---
    print("📁 PART 3: Dashboard Visions")
    for role in roles:
        # Copy the AppShell concept as dashboard vision (it already contains the dashboard content)
        src = os.path.join(OUTPUT_DIR, f"{role}_AppShell_Concept.svg")
        if os.path.exists(src):
            save_svg(open(src, 'r', encoding='utf-8').read(), f"{role}_Dashboard_Vision.svg")
            try_convert_to_png(src, f"{role}_Dashboard_Vision.png")
    print()
    
    # --- PART 4: CyberGlobe Architecture ---
    print("📁 PART 4: CyberGlobe Architecture")
    svg = generate_cyberglobe_architecture()
    svg_path = save_svg(svg, "CyberGlobe_Future_Architecture.svg")
    try_convert_to_png(svg_path, "CyberGlobe_Future_Architecture.png")
    print()
    
    # --- PART 5: AppShell Blueprint ---
    print("📁 PART 5: Unified AppShell Blueprint")
    svg = generate_appshell_blueprint()
    svg_path = save_svg(svg, "Unified_AppShell_Blueprint.svg")
    try_convert_to_png(svg_path, "Unified_AppShell_Blueprint.png")
    print()
    
    # --- PART 6: Navigation Flow Diagram ---
    print("📁 PART 6: Navigation Flow Diagram")
    generate_navigation_flow()
    print()
    
    print("✅ All images generated!")
    return True


if __name__ == "__main__":
    generate_all()
