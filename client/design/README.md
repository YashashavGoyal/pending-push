# Pending Push — Design System & Layout Prototypes

Welcome to the new working design suite for **Pending Push**, engineered with a high-craft developer aesthetic, crisp 1px borders, precision typography, zero cheesy emojis, and native vector SVGs.

---

## 🗂️ Distinct Spaces Architecture

Instead of clustering different post formats into tabs on a single feed, **Pending Push** organizes developer content into **four dedicated spaces**, each with its own focused atmosphere and layout:

```text
Blogs-frontend/client/design/
├── index.html            # Main Overview: Entry gateway highlighting the 4 distinct spaces
│
├── articles.html         # 01 / Articles Space: Long-form engineering essays and leadership
├── dev-logs.html         # 02 / Dev Logs Space: Architecture RFCs, code logs, and git diffs
├── tutorials.html        # 03 / Tutorials Space: Curated learning tracks with progress badges
├── tutorial.html         # Tutorial Runner: Sticky step checklist, progress %, and code runners
├── confessions.html      # 04 / Confessions Space ("The Uncommitted"): 100% anonymous stream
│
├── random.html           # Surprise Me: Serendipitous random push explorer
├── post-simple.html      # Editorial Reader: Clean serif typography with claps & responses
├── post-dev.html         # Dev Reader: Code blocks with copy actions, diffs, and sticky ToC
│
├── dashboard.html        # Author Dashboard: Reads/views analytics and push management
├── profile.html          # Public Profile & Insights: 52-week activity heatmap and metrics
├── settings.html         # Account Settings: Profile, security, and public insights toggle
├── preferences.html      # Display Preferences: Theme, font scales, code ligatures, curation
│
├── css/
│   ├── design-system.css # Clean color tokens, typography scales, buttons, badges, cards
│   ├── navbar-footer.css # Unclustered top navigation, mobile drawer, and minimal footer
│   ├── pages.css         # Space-specific streams, heatmap grids, and tutorial runners
│   └── syntax-theme.css  # Dark/Light code highlighting, diffs, and callout blocks
└── js/
    ├── main.js           # Theme controller, mobile drawer, dropdown menus
    ├── interactions.js   # Copy actions, tutorial checklist progress, and relate toggles
    └── mock-data.js      # Datasets aligned with Fastify backend schemas
```

---

## 💎 Design Highlights

1. **Brand Identity: Pending Push**:
   - Clean git branch/commit node SVG logo.
   - Minimalist aesthetic inspired by modern tools like Linear, GitHub, and Vercel.
2. **Zero Emojis**:
   - Replaced all emojis with crisp, lightweight, accessible inline SVGs.
3. **Four Dedicated Spaces**:
   - **Articles**: Focused reading layout for essays and culture.
   - **Dev Logs**: High-density technical feed with code diffs and latency benchmarks.
   - **Tutorials**: Interactive learning tracks with step counts and completion statistics.
   - **Confessions**: Ephemeral, anonymous thoughts with privacy disclaimers and relate counters.
4. **Public Developer Insights**:
   - If a developer profile is public, it displays an authentic 52-week activity heatmap (CSS Grid) alongside read time and audience retention metrics.
5. **Theme Support**:
   - Pure Clean Light mode and Midnight Slate dark mode, fully persisted in `localStorage`.

---

## 💻 How to Preview

Open any `.html` file directly in your browser or run:

```powershell
cd Blogs-frontend\client\design
python -m http.server 3000
```
