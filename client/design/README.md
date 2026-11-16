# Pending Push — Friendly Developer Publishing Platform

A warm, human-centric, and approachable publishing workspace designed for developers. Built with accessible HTML5, soft geometry, warm organic color tokens, and native vector SVGs.

---

## 🎨 UI Design Philosophy & Research

Traditional developer sites often fall into the trap of being cold, stark, and intimidating—raw pitch-black backgrounds, neon colors, and rigid 1px box borders.

**Pending Push** is engineered around research-backed best practices for approachable content design:
1. **Warm Palette (Paper & Coffee undertones)**:
   - Light mode uses a warm, cozy parchment base (`#FBF9F5`) with soft charcoal typography (`#23272F`), completely eliminating harsh glare.
   - Dark mode uses midnight slate with warm undertones (`#12151C` / `#1A1E28`) with soft cream text (`#F3F1EC`).
   - Friendly accents: Terracotta orange (`#E06341`), soft sage emerald (`#388A6D`), warm honey amber (`#D97706`), and soft berry rose (`#E11D48`).
2. **Comfortable Typography**:
   - UI & Headlines: **Plus Jakarta Sans** (friendly geometric curves).
   - Long-form prose: **Lora** (warm literary serif).
   - Code & metadata: **JetBrains Mono** (rounded, clear ligatures).
3. **Soft Geometry**:
   - Cards use soft rounded corners (`18px` to `24px`) with diffuse, gentle shadows.
   - Navigation links are soft pills (`border-radius: 9999px`) with gentle hover feedback.
4. **Zero Emojis**:
   - Replaced all emojis with crisp, accessible inline vector SVGs.

---

## 🗂️ 4 Dedicated Spaces (Unclustered Layout)

Instead of shoving different post types into tabs on a single feed, each format has its own dedicated space:

| Dedicated Space | Page File | Experience & Purpose |
|---|---|---|
| **Home Overview** | [index.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/index.html) | Welcoming gateway introducing the 4 spaces and featuring fresh community activity. |
| **01 / Articles Space** | [articles.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/articles.html) | Warm reading layout for long-form essays, engineering culture, and leadership reflections. |
| **02 / Dev Logs Space** | [dev-logs.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/dev-logs.html) | High-density technical space for architecture RFCs, code logs, and git diffs. |
| **03 / Tutorials Space** | [tutorials.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/tutorials.html) | Motivating learning hub organized into structured tracks with progress meters and difficulty pills. |
| **Tutorial Step Runner** | [tutorial.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/tutorial.html) | 2-column interactive runner: sticky sidebar steps + live progress bar + copyable code snippets. |
| **04 / Confessions Space** | [confessions.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/confessions.html) | *"The Uncommitted Corner"*: an empathetic, 100% anonymous space for incident talk and honest dev reflections. |
| **Surprise Me** | [random.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/random.html) | Serendipity reader with a shuffle action. |
| **Public Profile** | [profile.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/profile.html) | Developer profile with **Public Insights**: 52-week activity heatmap (soft sage rounded dots) and retention metrics. |
| **Author Dashboard** | [dashboard.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/dashboard.html) | Creator studio with KPI metric cards, published articles, and pending draft pushes. |
| **Settings & Preferences** | [settings.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/settings.html) & [preferences.html](file:///c:/Users/yashav/Desktop/proj/Blogs-frontend/client/design/preferences.html) | Display preferences, typography scaling, code ligatures, and public insights visibility toggle. |

---

## 🚀 Next.js 15 Migration Map

| Prototype File | Next.js 15 Target Route | Role |
|---|---|---|
| `index.html` | `app/page.tsx` | Gateway overview |
| `articles.html` | `app/articles/page.tsx` | Articles space stream |
| `post-simple.html` | `app/articles/[slug]/page.tsx` | Editorial article reader |
| `dev-logs.html` | `app/dev-logs/page.tsx` | Dev logs stream |
| `post-dev.html` | `app/dev-logs/[slug]/page.tsx` | Technical reader with syntax & diffs |
| `tutorials.html` | `app/tutorials/page.tsx` | Tutorials tracks hub |
| `tutorial.html` | `app/tutorials/[slug]/page.tsx` | Step runner with interactive state |
| `confessions.html` | `app/confessions/page.tsx` | Anonymous stream & compose modal |
| `profile.html` | `app/[username]/page.tsx` | Public profile & insights heatmap |
| `dashboard.html` | `app/dashboard/page.tsx` | Protected author studio |
| `settings.html` | `app/settings/page.tsx` | Protected user settings |
| `preferences.html` | `app/preferences/page.tsx` | Client theme & reading preferences |

---

## 💻 How to Preview

Preview any page directly by opening the `.html` file in your browser, or start a local static server:

```powershell
cd Blogs-frontend\client\design
python -m http.server 3000
```
