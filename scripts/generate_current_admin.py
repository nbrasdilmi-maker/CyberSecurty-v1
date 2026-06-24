"""
Create accurate SVG image of the CURRENT Admin Dashboard layout.
Based on actual code from AdminNavbar.tsx, AdminSidebar.tsx, and admin/page.tsx
"""
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "التقارير", "vision")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Dimensions (accurate scale)
W, H = 1200, 800
NAV_H = 56          # AdminNavbar height desktop
SIDEBAR_W = 230     # AdminSidebar width desktop
FOOTER_H = 36       # Footer height

def svg_rect(x, y, w, h, fill, rx=0, stroke="none", sw=0, opacity=1, dash=""):
    dash_attr = f'stroke-dasharray="{dash}"' if dash else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}" {dash_attr}/>'

def svg_text(x, y, text, fill, size, font="Cairo", weight="normal", align="start", family=""):
    fam = f' font-family="{family}"' if family else (f' font-family="{font}, sans-serif"' if font else "")
    return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-weight="{weight}" text-anchor="{align}" {fam}>{text}</text>'

def svg_circle(cx, cy, r, fill, stroke="none", sw=0, opacity=1):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}"/>'

def generate_current_admin_page():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
    
    # Define gradients and filters
    svg += '<defs>'
    svg += '<linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(8,12,20,0.6)"/><stop offset="100%" stop-color="rgba(8,12,20,0.45)"/></linearGradient>'
    svg += '<linearGradient id="sidebarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(10,14,23,0.55)"/><stop offset="100%" stop-color="rgba(10,14,23,0.45)"/></linearGradient>'
    svg += '<linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00e5ff"/><stop offset="100%" stop-color="#a855f7"/></linearGradient>'
    svg += '<filter id="blurNav"><feGaussianBlur stdDeviation="20"/></filter>'
    svg += '<filter id="blurSide"><feGaussianBlur stdDeviation="20"/></filter>'
    svg += '<filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    svg += '</defs>'
    
    # === BACKGROUND ===
    svg += svg_rect(0, 0, W, H, "#010204")
    
    # Grid pattern on background (matching the site's quantum grid)
    svg += f'<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,229,255,0.02)" stroke-width="0.5"/></pattern>'
    svg += svg_rect(0, 0, W, H, "url(#grid)")
    
    # Subtle ambient circles
    svg += svg_circle(900, 200, 250, "none", "rgba(0,229,255,0.03)", 1)
    svg += svg_circle(200, 500, 180, "none", "rgba(191,90,242,0.02)", 1)
    
    # === CONTENT AREA (main dashboard content preview) ===
    content_x = 0
    content_y = NAV_H
    content_w = W - SIDEBAR_W
    content_h = H - NAV_H - FOOTER_H
    
    # Content background
    svg += svg_rect(content_x, content_y, content_w, content_h, "rgba(1,2,4,0.3)")
    
    # Simplified dashboard content preview — matches current layout structure
    
    # Row 1: WelcomeCard + ThreatRadar + SystemStatus grid
    y_row1 = content_y + 20
    svg += svg_rect(20, y_row1, content_w - 40, 90, "rgba(10,20,40,0.08)", 16, "rgba(255,255,255,0.04)", 1)
    # WelcomeCard
    svg += f'<text x="44" y="{y_row1 + 32}" fill="#e6edf3" font-size="16" font-weight="700" font-family="Cairo, sans-serif">👋 صباح الخير، محمد</text>'
    svg += f'<text x="44" y="{y_row1 + 55}" fill="#8b949e" font-size="11" font-weight="500" font-family="Cairo, sans-serif">🟢 حالة النظام: جميع الأنظمة تعمل بكفاءة</text>'
    
    # ThreatRadar (centered area)
    radar_x = content_w // 2 - 90
    svg += svg_rect(radar_x, y_row1 + 15, 180, 60, "transparent")
    # Simple radar representation
    radar_cx, radar_cy = radar_x + 90, y_row1 + 45
    for r in [25, 18, 10]:
        svg += svg_circle(radar_cx, radar_cy, r, "none", "rgba(248,81,73,0.2)", 1)
    svg += f'<line x1="{radar_cx}" y1="{radar_cy-25}" x2="{radar_cx}" y2="{radar_cy+25}" stroke="rgba(248,81,73,0.12)" stroke-width="1"/>'
    svg += f'<line x1="{radar_cx-25}" y1="{radar_cy}" x2="{radar_cx+25}" y2="{radar_cy}" stroke="rgba(248,81,73,0.12)" stroke-width="1"/>'
    # Data points
    import math
    for i in range(6):
        a = i * 60 - 90
        rad = math.radians(a)
        val = 5 + (i * 3) % 15
        px = radar_cx + val * math.cos(rad)
        py = radar_cy + val * math.sin(rad)
        svg += svg_circle(px, py, 3, "rgba(248,81,73,0.7)")
    
    # SystemStatus
    sys_x = content_w - 190
    svg += f'<text x="{sys_x}" y="{y_row1 + 22}" fill="#8b949e" font-size="10" font-weight="700" font-family="Cairo, sans-serif">🖥️ حالة الأنظمة</text>'
    services = [("الخادم الرئيسي", "🖥️"), ("قاعدة البيانات", "🗄️"), ("جدار الحماية", "🛡️"), ("نظام النسخ الاحتياطي", "💾")]
    for i, (name, icon) in enumerate(services):
        sy = y_row1 + 38 + i * 13
        svg += svg_circle(sys_x + 5, sy - 2, 3, "#2ea043", "none", 0, 1)
        svg += f'<text x="{sys_x + 14}" y="{sy}" fill="#e6edf3" font-size="9" font-weight="500" font-family="Cairo, sans-serif">{icon} {name}</text>'
        svg += f'<text x="{sys_x + 140}" y="{sy}" fill="#2ea043" font-size="8" font-weight="600" font-family="Cairo, sans-serif">Online</text>'
    
    # Row 2: Stat cards (5 items)
    y_row2 = y_row1 + 110
    card_w = (content_w - 40 - 40) // 5
    for i in range(5):
        cx = 20 + i * (card_w + 10)
        colors = ["#00e5ff", "#2ea043", "#ffca28", "#bf5af2", "#39ff14"]
        icons = ["👥", "✅", "⏳", "📤", "📝"]
        labels = ["إجمالي المستخدمين", "الحسابات المفعلة", "الحسابات المعلقة", "إجمالي التكاليف", "التكاليف المقيمة"]
        vals = ["1,247", "892", "38", "456", "321"]
        trends = ["+12.5%", "+8.3%", "-4.2%", "+15.7%", "+11.4%"]
        
        svg += svg_rect(cx, y_row2, card_w, 75, "rgba(10,20,40,0.08)", 12, "rgba(255,255,255,0.03)", 1)
        svg += f'<text x="{cx + 12}" y="{y_row2 + 22}" fill="{colors[i]}" font-size="16">{icons[i]}</text>'
        svg += f'<text x="{cx + 12}" y="{y_row2 + 42}" fill="#e6edf3" font-size="18" font-weight="800" font-family="Cairo, sans-serif">{vals[i]}</text>'
        svg += f'<text x="{cx + 12}" y="{y_row2 + 60}" fill="#8b949e" font-size="8" font-weight="500" font-family="Cairo, sans-serif">{labels[i]}</text>'
        # Trend
        trend_up = i != 2
        trend_color = "#2ea043" if trend_up else "#f85149"
        trend_arrow = "▲" if trend_up else "▼"
        svg += f'<text x="{cx + card_w - 10}" y="{y_row2 + 22}" fill="{trend_color}" font-size="8" font-weight="700" font-family="Cairo, sans-serif" text-anchor="end">{trend_arrow} {trends[i]}</text>'
    
    # Row 3: More stats + AlertPanel
    y_row3 = y_row2 + 95
    col_w = (content_w - 40 - 30) // 4
    # 3 more stat cards
    colors3 = ["#ff6b6b", "#ffca28", "#f85149"]
    icons3 = ["📚", "📘", "🚨"]
    labels3 = ["محتوى المكتبة", "المواد الدراسية", "التنبيهات الحرجة"]
    vals3 = ["2,834", "42", "0"]
    trends3 = ["+9.8%", "+3.1%", "0%"]
    for i in range(3):
        cx = 20 + i * (col_w + 10)
        svg += svg_rect(cx, y_row3, col_w, 65, "rgba(10,20,40,0.08)", 12, "rgba(255,255,255,0.03)", 1)
        svg += f'<text x="{cx + 12}" y="{y_row3 + 22}" fill="{colors3[i]}" font-size="14">{icons3[i]}</text>'
        svg += f'<text x="{cx + 12}" y="{y_row3 + 40}" fill="#e6edf3" font-size="16" font-weight="800" font-family="Cairo, sans-serif">{vals3[i]}</text>'
        svg += f'<text x="{cx + 12}" y="{y_row3 + 56}" fill="#8b949e" font-size="7.5" font-weight="500" font-family="Cairo, sans-serif">{labels3[i]}</text>'
        tr = trends3[i]
        tu = i != 2
        tc = "#2ea043" if tu else "#8b949e"
        ta = "▲" if tu else "—"
        svg += f'<text x="{cx + col_w - 10}" y="{y_row3 + 22}" fill="{tc}" font-size="8" font-weight="600" font-family="Cairo, sans-serif" text-anchor="end">{ta} {tr}</text>'
    
    # AlertPanel
    alert_x = 20 + 3 * (col_w + 10)
    svg += svg_rect(alert_x, y_row3, col_w, 65, "rgba(10,20,40,0.08)", 12, "rgba(255,255,255,0.03)", 1)
    svg += f'<text x="{alert_x + 12}" y="{y_row3 + 20}" fill="#00e5ff" font-size="9" font-weight="700" font-family="Cairo, sans-serif">🔔 التنبيهات</text>'
    svg += f'<text x="{alert_x + 12}" y="{y_row3 + 42}" fill="#2ea043" font-size="9" font-weight="600" font-family="Cairo, sans-serif">✅ جميع الأنظمة تعمل بشكل طبيعي</text>'
    svg += f'<text x="{alert_x + 12}" y="{y_row3 + 56}" fill="#5a6a7a" font-size="7" font-family="Cairo, sans-serif">الآن</text>'
    
    # Row 4: Quick Actions
    y_row4 = y_row3 + 85
    svg += svg_rect(20, y_row4, content_w - 40, 60, "rgba(10,20,40,0.08)", 16, "rgba(255,255,255,0.04)", 1)
    svg += f'<text x="40" y="{y_row4 + 22}" fill="#00e5ff" font-size="11" font-weight="700" font-family="Cairo, sans-serif">⚡ اختصارات سريعة</text>'
    actions = ["🏗️ توليد", "👥 معلقة", "📜 سجل", "🤖 بوت", "🛡️ رادار", "📅 ترم", "🎛️ كنترول", "📢 تعميم"]
    for i, act in enumerate(actions):
        ax = 40 + i * 80
        svg += svg_rect(ax, y_row4 + 30, 72, 22, "rgba(255,255,255,0.03)", 8, "rgba(255,255,255,0.05)", 1)
        svg += f'<text x="{ax + 36}" y="{y_row4 + 45}" fill="#8b949e" font-size="8" font-family="Cairo, sans-serif" text-anchor="middle">{act}</text>'
    
    # Row 5: ServerUsageChart + ActivityTimeline
    y_row5 = y_row4 + 80
    chart_w = int((content_w - 40) * 0.6)
    timeline_w = content_w - 40 - chart_w - 10
    
    # ServerUsageChart
    svg += svg_rect(20, y_row5, chart_w, 120, "rgba(10,20,40,0.08)", 16, "rgba(255,255,255,0.04)", 1)
    svg += f'<text x="40" y="{y_row5 + 22}" fill="#e6edf3" font-size="11" font-weight="700" font-family="Cairo, sans-serif">📊 استخدام الخادم</text>'
    # Chart lines
    days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
    chart_left = 40
    chart_top = y_row5 + 35
    chart_w_inner = chart_w - 80
    chart_h_inner = 70
    # Grid
    for i in range(5):
        gy = chart_top + i * (chart_h_inner // 4)
        svg += f'<line x1="{chart_left}" y1="{gy}" x2="{chart_left + chart_w_inner}" y2="{gy}" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>'
    # CPU line (cyan)
    cpu_data = [45, 52, 38, 65, 55, 48, 42]
    points = []
    for i, c in enumerate(cpu_data):
        px = chart_left + (i / 6) * chart_w_inner
        py = chart_top + chart_h_inner - (c / 80) * chart_h_inner
        points.append(f"{px},{py}")
    cpu_path = " ".join(points)
    svg += f'<polyline points="{cpu_path}" fill="none" stroke="#00e5ff" stroke-width="1.5" opacity="0.8"/>'
    # RAM line (purple)
    ram_data = [62, 58, 71, 68, 73, 59, 64]
    points = []
    for i, c in enumerate(ram_data):
        px = chart_left + (i / 6) * chart_w_inner
        py = chart_top + chart_h_inner - (c / 80) * chart_h_inner
        points.append(f"{px},{py}")
    ram_path = " ".join(points)
    svg += f'<polyline points="{ram_path}" fill="none" stroke="#bf5af2" stroke-width="1.5" opacity="0.8"/>'
    # Storage line (green)
    stg_data = [34, 36, 35, 37, 36, 38, 37]
    points = []
    for i, c in enumerate(stg_data):
        px = chart_left + (i / 6) * chart_w_inner
        py = chart_top + chart_h_inner - (c / 80) * chart_h_inner
        points.append(f"{px},{py}")
    stg_path = " ".join(points)
    svg += f'<polyline points="{stg_path}" fill="none" stroke="#39ff14" stroke-width="1.5" opacity="0.8"/>'
    # X-axis labels
    for i, d in enumerate(days):
        dx = chart_left + (i / 6) * chart_w_inner
        svg += f'<text x="{dx}" y="{chart_top + chart_h_inner + 12}" fill="#5a6a7a" font-size="6" font-family="Cairo, sans-serif" text-anchor="middle">{d}</text>'
    # Legend
    svg += f'<text x="{chart_left + chart_w_inner + 15}" y="{chart_top + 5}" fill="#00e5ff" font-size="6.5" font-family="Cairo, sans-serif">— CPU</text>'
    svg += f'<text x="{chart_left + chart_w_inner + 15}" y="{chart_top + 18}" fill="#bf5af2" font-size="6.5" font-family="Cairo, sans-serif">— RAM</text>'
    svg += f'<text x="{chart_left + chart_w_inner + 15}" y="{chart_top + 31}" fill="#39ff14" font-size="6.5" font-family="Cairo, sans-serif">— Storage</text>'
    
    # ActivityTimeline
    svg += svg_rect(20 + chart_w + 10, y_row5, timeline_w, 120, "rgba(10,20,40,0.08)", 16, "rgba(255,255,255,0.04)", 1)
    svg += f'<text x="{20 + chart_w + 30}" y="{y_row5 + 22}" fill="#e6edf3" font-size="11" font-weight="700" font-family="Cairo, sans-serif">🕐 النشاطات</text>'
    activities = [
        "🔐 تسجيل دخول جديد", "📤 رفع تكليف", "✅ تقييم تكليف", 
        "🔄 تحديث بيانات", "📝 إضافة محتوى", "🔔 إشعار نظام"
    ]
    for i, act in enumerate(activities):
        ay = y_row5 + 38 + i * 13
        svg += svg_circle(20 + chart_w + 35, ay - 2, 2.5, "#00e5ff")
        svg += f'<text x="{20 + chart_w + 44}" y="{ay}" fill="#e6edf3" font-size="8" font-family="Cairo, sans-serif">{act}</text>'
        svg += f'<text x="{20 + chart_w + timeline_w - 10}" y="{ay}" fill="#5a6a7a" font-size="6" font-family="Cairo, sans-serif" text-anchor="end">منذ {i+1} د</text>'
    
    # Row 6: Gauges + Active Users
    y_row6 = y_row5 + 140
    gauge_w = int((content_w - 40) * 0.6)
    active_w = content_w - 40 - gauge_w - 10
    
    svg += svg_rect(20, y_row6, gauge_w, 90, "rgba(10,20,40,0.08)", 16, "rgba(255,255,255,0.04)", 1)
    svg += f'<text x="40" y="{y_row6 + 22}" fill="#00e5ff" font-size="11" font-weight="700" font-family="Cairo, sans-serif">📊 مؤشرات الخادم</text>'
    # Simple gauge indicators
    gauge_labels = ["CPU", "RAM", "STORAGE"]
    gauge_vals = [47, 64, 36]
    gauge_colors = ["#00e5ff", "#bf5af2", "#39ff14"]
    for i in range(3):
        gx = 40 + i * 110
        svg += svg_circle(gx + 35, y_row6 + 55, 25, "none", "rgba(255,255,255,0.05)", 4)
        # Arc fill simulation
        svg += f'<text x="{gx + 35}" y="{y_row6 + 60}" fill="{gauge_colors[i]}" font-size="14" font-weight="800" font-family="Cairo, sans-serif" text-anchor="middle">{gauge_vals[i]}%</text>'
        svg += f'<text x="{gx + 35}" y="{y_row6 + 78}" fill="#8b949e" font-size="7" font-family="Cairo, sans-serif" text-anchor="middle">{gauge_labels[i]}</text>'
    
    # Active Users
    svg += svg_rect(20 + gauge_w + 10, y_row6, active_w, 90, "rgba(10,20,40,0.08)", 16, "rgba(255,255,255,0.04)", 1)
    svg += f'<text x="{20 + gauge_w + 30}" y="{y_row6 + 35}" fill="#8b949e" font-size="10" font-family="Cairo, sans-serif">🌐</text>'
    svg += f'<text x="{20 + gauge_w + 30}" y="{y_row6 + 52}" fill="#8b949e" font-size="10" font-weight="600" font-family="Cairo, sans-serif">المستخدمون النشطون</text>'
    svg += f'<text x="{20 + gauge_w + 80}" y="{y_row6 + 52}" fill="#39ff14" font-size="28" font-weight="800" font-family="Cairo, sans-serif">7</text>'
    svg += f'<text x="{20 + gauge_w + 30}" y="{y_row6 + 75}" fill="#5a6a7a" font-size="8" font-family="Cairo, sans-serif">متصل الآن</text>'
    
    # === NAVBAR (AdminNavbar) ===
    navbar_y = 0
    # Navbar background with blur effect
    svg += svg_rect(0, navbar_y, W, NAV_H, "url(#navGrad)")
    svg += svg_rect(0, navbar_y, W, NAV_H, "none", "rgba(0,229,255,0.04)", 1)  # Border bottom
    
    # Left side (RTL) — hamburger + search
    # Hamburger button
    svg += svg_rect(14, 10, 36, 36, "rgba(0,229,255,0.08)", 10, "rgba(0,229,255,0.12)", 1)
    svg += f'<text x="32" y="34" fill="#8b949e" font-size="18" font-weight="700" text-anchor="middle">☰</text>'
    
    # Search button
    svg += svg_rect(60, 12, 140, 32, "rgba(255,255,255,0.03)", 10, "rgba(255,255,255,0.06)", 1)
    svg += f'<text x="74" y="33" fill="#5a6a7a" font-size="12">🔍</text>'
    svg += f'<text x="92" y="33" fill="#5a6a7a" font-size="10" font-family="Cairo, sans-serif">بحث سريع...</text>'
    # ⌘K badge
    svg += svg_rect(165, 18, 25, 16, "rgba(255,255,255,0.04)", 4, "rgba(255,255,255,0.06)", 1)
    svg += f'<text x="177" y="29" fill="#5a6a7a" font-size="7" font-family="monospace" text-anchor="middle">⌘K</text>'
    
    # Right side (RTL) — bell + avatar
    # Notification bell
    svg += svg_rect(W - SIDEBAR_W - 110, 10, 36, 36, "rgba(0,229,255,0.08)", 10, "rgba(0,229,255,0.12)", 1)
    svg += f'<text x="{W - SIDEBAR_W - 92}" y="34" fill="#8b949e" font-size="18" text-anchor="middle">🔔</text>'
    # Badge
    svg += svg_circle(W - SIDEBAR_W - 75, 10, 8, "#f85149")
    svg += f'<text x="{W - SIDEBAR_W - 75}" y="14" fill="#fff" font-size="7" font-weight="800" text-anchor="middle" font-family="Cairo, sans-serif">3</text>'
    
    # User avatar + name
    avatar_x = W - SIDEBAR_W - 50
    svg += svg_circle(avatar_x + 17, 28, 17, "url(#avatarGrad)")
    svg += f'<text x="{avatar_x + 17}" y="33" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">م</text>'
    # User name + role
    svg += f'<text x="{avatar_x - 5}" y="24" fill="#e6edf3" font-size="10" font-weight="700" font-family="Cairo, sans-serif" text-anchor="end">محمد أحمد</text>'
    svg += f'<text x="{avatar_x - 5}" y="38" fill="#8b949e" font-size="7.5" font-family="Cairo, sans-serif" text-anchor="end">مدير النظام</text>'
    
    # === SIDEBAR (AdminSidebar) ===
    side_x = W - SIDEBAR_W
    # Sidebar background
    svg += svg_rect(side_x, 0, SIDEBAR_W, H, "url(#sidebarGrad)")
    svg += svg_rect(side_x, 0, 1, H, "rgba(0,229,255,0.04)")  # Border left (RTL)
    
    # Top brand section
    svg += f'<text x="{side_x + 115}" y="38" fill="#fff" font-size="30" text-anchor="middle">🛡️</text>'
    svg += f'<text x="{side_x + 115}" y="72" fill="#fff" font-size="12" font-weight="800" font-family="Cairo, sans-serif" text-anchor="middle">سحابة الأمن السيبراني</text>'
    svg += f'<text x="{side_x + 115}" y="84" fill="#00e5ff" font-size="7" font-family="Orbitron, monospace" text-anchor="middle" opacity="0.7" letter-spacing="1">CYBER SECURITY CLOUD</text>'
    
    # Divider line
    svg += f'<line x1="{side_x + 15}" y1="96" x2="{side_x + SIDEBAR_W - 15}" y2="96" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>'
    
    # Menu items (16 items)
    menu_items = [
        ("🏠", "الرئيسية", "#00e5ff", True),
        ("🔔", "سجل الإشعارات", "#ffca28", False),
        ("📚", "المكتبة التعليمية", "#00e5ff", False),
        ("💻", "محرر الأكواد", "#00e5ff", False),
        ("💬", "المحادثة", "#39ff14", False),
        ("🏗️", "إدارة التوليد", "#bf5af2", False),
        ("📜", "سجل العمليات", "#ffca28", False),
        ("⬆️", "ترقية المستخدمين", "#ff6b6b", False),
        ("💻", "استهلاك السيرفر", "#39ff14", False),
        ("📋", "حسابات مفعلة", "#2ea043", False),
        ("🛡️", "رادار الأخطاء", "#f85149", False),
        ("🤖", "التحكم بالبوت", "#a855f7", False),
        ("📅", "إدارة الترم", "#bf5af2", False),
        ("🎛️", "كنترول المنصة", "#00e5ff", False),
        ("📢", "نشر تعميم", "#ffca28", False),
        ("⚙️", "إعدادات الحساب", "#8b949e", False),
    ]
    
    menu_start_y = 108
    for i, (icon, label, color, active) in enumerate(menu_items):
        item_y = menu_start_y + i * 34
        if active:
            svg += svg_rect(side_x + 10, item_y, SIDEBAR_W - 20, 30, f"{color}12", 10, f"{color}25", 1)
        svg += f'<text x="{side_x + 28}" y="{item_y + 20}" fill="{color if active else "#8b949e"}" font-size="13" text-anchor="middle">{icon}</text>'
        svg += f'<text x="{side_x + 48}" y="{item_y + 20}" fill="{color if active else "#8b949e"}" font-size="11" font-weight="{"800" if active else "500"}" font-family="Cairo, sans-serif">{label}</text>'
    
    # ONLINE status at bottom
    online_y = H - FOOTER_H - 70
    svg += f'<line x1="{side_x + 15}" y1="{online_y - 10}" x2="{side_x + SIDEBAR_W - 15}" y2="{online_y - 10}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>'
    svg += svg_rect(side_x + 14, online_y + 2, SIDEBAR_W - 28, 52, "rgba(57,255,20,0.06)", 10, "rgba(57,255,20,0.12)", 1)
    # Pulsing green dot
    svg += svg_circle(side_x + 34, online_y + 22, 4, "#39ff14")
    svg += f'<text x="{side_x + 48}" y="{online_y + 20}" fill="#39ff14" font-size="9" font-weight="700" font-family="Cairo, sans-serif">ONLINE</text>'
    svg += f'<text x="{side_x + 48}" y="{online_y + 37}" fill="#8b949e" font-size="7.5" font-family="Cairo, sans-serif">حالة النظام · 27 يوماً</text>'
    
    # === FOOTER (inline in admin/page.tsx) ===
    footer_y = H - FOOTER_H
    svg += svg_rect(0, footer_y, W, FOOTER_H, "rgba(2,4,8,0.35)")
    svg += svg_rect(0, footer_y, W, FOOTER_H, "none", "rgba(0,229,255,0.04)", 1)
    
    svg += f'<text x="{W//2}" y="{footer_y+20}" fill="#8b949e" font-size="9" font-family="Cairo,sans-serif" text-anchor="middle">تطوير وإشراف: <tspan fill="#00e5ff" font-weight="600">محمد إبراهيم الديلمي | أحمد الهيدمة</tspan></text>'
    svg += f'<text x="{W//2}" y="{footer_y+33}" fill="#8b949e" font-size="7" font-family="Orbitron,monospace" text-anchor="middle" opacity="0.5">- CYBER SECURITY CLOUD - DHAMAR UNIVERSITY \u00a9 2026 -</text>'
    
    svg += '</svg>'
    
    # Save SVG
    path = os.path.join(OUTPUT_DIR, "Current_Admin_Page.svg")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print("  [OK] Current_Admin_Page.svg")
    return path

def try_convert_to_png(svg_path, png_filename):
    """Convert SVG to PNG if possible."""
    import os
    png_path = os.path.join(OUTPUT_DIR, png_filename)
    # Try cairosvg
    try:
        import cairosvg
        cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=1200, output_height=800)
        print(f"  [OK] {png_filename} (cairosvg)")
        return png_path
    except ImportError:
        pass
    # Try svglib
    try:
        from svglib.svglib import svg2rlg
        from reportlab.graphics import renderPM
        drawing = svg2rlg(svg_path)
        renderPM.drawToFile(drawing, png_path, fmt='PNG')
        print(f"  [OK] {png_filename} (svglib)")
        return png_path
    except ImportError:
        pass
    print("  [!] PNG conversion skipped (no converter)")
    return None

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print("[START] Generating CURRENT Admin Page Image...")
    svg_path = generate_current_admin_page()
    try_convert_to_png(svg_path, "Current_Admin_Page.png")
    print("[DONE]")
