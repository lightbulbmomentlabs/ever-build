# 🎨 EverBuild Brand Color Guide

## 🧱 Primary Palette – Trust & Strength
These form the core of EverBuild’s visual identity — grounded, reliable, and professional.

| Color Name | HEX | Description |
|-------------|------|-------------|
| **Charcoal Blue** | `#2C3E50` | Conveys stability, professionalism, and construction-grade seriousness. |
| **Steel Gray** | `#95A5A6` | Neutral balance, evoking metal and modern building materials. |
| **EverBuild Orange** | `#E67E22` | Energetic and action-oriented — symbolizes progress and productivity. |
| **Concrete White** | `#F4F4F4` | Clean, architectural background tone for dashboards and plans. |

---

## 🌲 Secondary Palette – Modern Construction
Complementary colors for accents, charts, and project phase visualization.

| Color Name | HEX | Description |
|-------------|------|-------------|
| **Blueprint Teal** | `#1ABC9C` | Inspired by blueprints and digital planning tools. |
| **Sandstone Tan** | `#D7BFAE` | Warm neutral tone, adds approachability to the industrial aesthetic. |
| **Olive Green** | `#7F8C6B` | Earthy and grounded, reminiscent of craftsmanship and outdoor work. |

---

## ⚙️ Highlight & Feedback Colors
Used sparingly for status updates and visual feedback cues.

| Color Name | HEX | Description |
|-------------|------|-------------|
| **Success Green** | `#27AE60` | Indicates a completed or “on-time” status. |
| **Warning Amber** | `#F39C12` | Signals delay alerts or requires attention. |
| **Error Red** | `#C0392B` | Highlights critical errors or missed deadlines. |

---

## 🌗 Theme System

EverBuild supports both **Light** and **Dark** modes using the user's OS/system preference via CSS media queries (`prefers-color-scheme`).

### **Light Theme**
| Element | Color | HEX |
|----------|--------|------|
| **Background** | Concrete White | `#F4F4F4` |
| **Primary Text** | Charcoal Blue | `#2C3E50` |
| **Secondary Text** | Steel Gray | `#95A5A6` |
| **Primary Accent** | EverBuild Orange | `#E67E22` |
| **Interactive Elements** | Blueprint Teal | `#1ABC9C` |
| **Borders / Lines** | `#E0E0E0` | Subtle dividers between components. |

### **Dark Theme**
| Element | Color | HEX |
|----------|--------|------|
| **Background** | Charcoal Blue | `#2C3E50` |
| **Primary Text** | Concrete White | `#F4F4F4` |
| **Secondary Text** | Steel Gray | `#95A5A6` |
| **Primary Accent** | EverBuild Orange | `#E67E22` |
| **Interactive Elements** | Blueprint Teal | `#1ABC9C` |
| **Borders / Lines** | `#3E4C59` | For low-contrast UI edges and cards. |

---

### 🧩 CSS Example

```css
:root {
  /* Base (Light Theme) */
  --color-bg: #F4F4F4;
  --color-text: #2C3E50;
  --color-secondary: #95A5A6;
  --color-accent: #E67E22;
  --color-link: #1ABC9C;
  --color-border: #E0E0E0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #2C3E50;
    --color-text: #F4F4F4;
    --color-secondary: #95A5A6;
    --color-accent: #E67E22;
    --color-link: #1ABC9C;
    --color-border: #3E4C59;
  }
}