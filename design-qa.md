# Design QA

## Comparison target

- Source visual truth path: `/tmp/blog-source-desktop.png`
- Implementation screenshot path: `/tmp/blog-revamp-desktop.png`
- Mobile source path: `/tmp/blog-source-mobile.png`
- Mobile implementation path: `/tmp/blog-revamp-mobile.png`
- Implementation route: `http://127.0.0.1:4000/`
- Viewport: desktop `1280 × 720` CSS px; mobile `390 × 844` CSS px
- Source pixels: desktop `1280 × 1018`; mobile `390 × 844`
- Implementation pixels: desktop `1280 × 1220`; mobile `390 × 844`
- Density normalization: all captures are browser screenshots at an effective 1:1 CSS-to-pixel density. Desktop full-page heights differ because the implementation intentionally adds the three-topic research index and English decks under selected work.
- State: homepage, light theme, default scroll position, Writing active, no open sidebar.

## Full-view comparison evidence

The source and implementation were captured at the same desktop viewport and reviewed together. A second paired comparison used the same `390 × 844` mobile viewport. The implementation preserves the source’s editorial system—warm paper, black rules, cobalt action color, serif display type, compact sans-serif metadata, split hero, text-only feature treatment, and restrained list rows—while introducing the structural content required by the revamp plan.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: the new Newsreader/Noto Serif SC pairing keeps the editorial hierarchy while improving mixed English-Chinese body copy. Inter remains limited to navigation, labels, metadata, and controls. Desktop and mobile headline wrapping remains deliberate and readable.
- Spacing and layout rhythm: the 40/60 desktop hero, vertical divider, CTA group, topic strip, selected-writing rows, and footer form one continuous rule-based grid. At `390px`, all grids collapse cleanly, text stays within the viewport, and no horizontal overflow is present.
- Colors and visual tokens: the original paper, ink, muted rule, and cobalt action palette is unchanged and remains tokenized. Active navigation, abstract labels, and topic indices use the same blue without introducing a new visual language.
- Image quality and asset fidelity: neither source nor implementation uses hero photography or illustration. No placeholder imagery, custom SVG art, CSS illustration, or substitute asset was introduced. Existing Font Awesome icons remain consistent.
- Copy and content: the broad “AI, Economics & Technology” positioning is replaced by the verified “Japan, Money & AI Industry” focus. English decks, `ZH` labels, the verified credential line, and category summaries work as an accessibility layer without replacing the Chinese essays.
- Responsiveness: paired mobile captures confirm a usable header, five-item navigation, multi-line hero, CTAs, and featured article. The page reports `390px` layout width and `390px` scroll width.
- Accessibility and behavior: headings, landmarks, navigation labels, link text, language attributes, `aria-current`, time elements, and native anchor behavior remain intact. A local click test confirmed the Japan navigation route.

## Focused region comparison

A separate crop was not needed because the paired full-width captures keep the header, hero typography, feature metadata, CTAs, topic strip, and selected-writing hierarchy legible. The article page was additionally checked at desktop and mobile widths to verify the English abstract, reading-time metadata, `ZH` tag, heading hierarchy, and lack of horizontal overflow.

## Comparison history

### Pass 1 — passed

- Evidence: `/tmp/blog-source-desktop.png` with `/tmp/blog-revamp-desktop.png`, plus the paired mobile captures.
- Result: no P0/P1/P2 mismatch. The longer implementation height and new topic strip are intentional consequences of the approved content architecture, not visual drift.
- No visual fixes were required after this comparison.

## Primary interactions tested

- The primary Japan navigation link resolved uniquely and opened `/categories/japan/`.
- Writing, Japan, Money, AI, and About routes are present in the semantic navigation.
- The featured article and three selected-writing links point to the new English permalinks.
- Category rendering completed with no browser console errors or warnings.
- Desktop and mobile layouts were checked at `1280 × 720` and `390 × 844`.

## Implementation checklist

- [x] Preserve the selected editorial visual system.
- [x] Narrow positioning to Japan, Money, and AI Industry.
- [x] Add verified background and study information without inventing credentials.
- [x] Add English abstracts and concise list descriptions to every post.
- [x] Add language labels and real reading-time metadata.
- [x] Add English permalinks and redirect pages for all prior URLs.
- [x] Verify desktop and mobile layouts and primary navigation.

## Follow-up polish

- [P3] Add a public email and LinkedIn only after the exact addresses are confirmed.
- [P3] Add Japanese abstracts in a later phase if Japanese recruiting becomes a primary audience.

final result: passed
