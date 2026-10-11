# Accessibility

Target: WCAG 2.2 AA.

| Need | How ORBIT meets it |
| --- | --- |
| Keyboard | Every control is a real button, link, input or select. Visible 3px focus ring. Skip link to main content. |
| Screen readers | Landmarks, `aria-current="page"`, one `h1` per page that receives focus on navigation, labelled inputs, errors tied with `aria-describedby`, polite live region for confirmations. |
| Colour | Risk uses a label and a shape as well as colour. Text and background pairs are at least 4.5:1 in both themes. |
| Charts | Each chart has a text summary (`role="img"` with `aria-label`) and a "View chart data as a table" disclosure. |
| Touch | Targets are at least 44px. Layout works from 320px wide with no horizontal scroll. |
| Motion | The only animation is a short fade of the runway ring. `prefers-reduced-motion` turns it off. |
| Contrast modes | Light and dark themes, plus `forced-colors` rules. |
| Language | `lang="en"`, descriptive `<title>`, `<noscript>` message. |

Static checks: `npm run lint` runs `eslint-plugin-jsx-a11y`.
