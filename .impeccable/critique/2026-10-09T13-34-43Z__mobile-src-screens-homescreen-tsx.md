---
target: Home (HomeScreen.tsx)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Paula\\IdeaProjects\\mesa-app\\mobile\\src\\screens\\HomeScreen.tsx"
target_fingerprint: "sha256:a841adf56107e7e3a0373ba99794525f89f6324a80ccf54896eed4eb3dc7c75d"
target_path: "C:\\Users\\Paula\\IdeaProjects\\mesa-app\\mobile\\src\\screens\\HomeScreen.tsx"
timestamp: 2026-10-09T13-34-43Z
slug: mobile-src-screens-homescreen-tsx
---
# Critique: Home (mobile/src/screens/HomeScreen.tsx), 2026-10-09
Method: dual-agent (A design review, B detector + browser). Evidence: web 390pt light/dark, account topo.

## Heuristics: 26/40 (Acceptable)
1 Status 3 · 2 Real world 3 · 3 Control 3 · 4 Consistency 2 · 5 Error prevention 3 · 6 Recognition 2 · 7 Efficiency 2 · 8 Minimalist 3 · 9 Recovery 3 · 10 Help 2

## Specificity
Mostly designed for Mesa (copy, typographic cover, wordmark) but a generic stack; with real data the visible groups (empty) are not the one powering the city, recommendation and activity (Foddie, hidden). Detector: 0 CLI findings; overlay 1 text-occlusion = false positive (tab bar over below-fold card).

## Priority issues
- [P1] Groups hide the active group; "Todo al día" with 0 restaurants. HomeScreen.tsx:39 sortGroups by updatedAt; HomeGroupCard.tsx:28. Fix: rank by activity/content, always include the recommendation group, "Sin sitios aún" + action. clarify → layout
- [P1] Recommendation card breaks with sparse data: "I" monogram as a bar (RestaurantCover.tsx:63), duplicated "Restaurante", ~132pt empty cover, "Otro sitio" disabled at 1.9:1 (HomeDashboardContent.tsx:112), body not tappable (HomeRecommendationCard.tsx:46). harden → polish
- [P1] Dark mode not on device: app.json userInterfaceStyle "light"; dark accent #E27A5F too loud. colorize
- [P2] Decision below the fold: 5 header tiers; "Buscar restaurantes" opens the Map (HomeHeader.tsx:69). layout → distill
- [P2] Old, anonymous activity: 2 months, "Un miembro" (actorName null), "Topo valoró" shown to Topo. clarify

## Persona red flags
Casey: decision below the fold, card does nothing, "Otro sitio" far from thumb. Jordan: "Todo al día" on empty groups; city never chosen. Sam: card with no action, unlabelled activity rows, "5,0" without "de 5", tabs role=button (AppTabsLayout.tsx:139). Marta (follower): followed groups filtered out of Home (HomeScreen.tsx:101).

## Minor
Invitation border separator vs border; HomeFirstTable without border, radius xl-2; tab bar hidden on sub-routes; tab press with Animated, no Reduce Motion; outlined vs filled star; skeleton without invitation slot; redundant caption.
