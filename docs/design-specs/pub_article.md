# FNFE PublicationArticle Experience Spec
Working source of truth • September 2026
Purpose. Define the shared experience and publishing structure for individual articles in the Field Notes From Everywhere Publication. This document covers the article system itself, including what is shared across categories and what may vary by category. Hub pages and other website experiences are specified separately.
## 1. Core Article Principle
Publication articles are not designed one page at a time. They use a structured, reusable article template populated with article-specific content and data through the CMS.
All three editorial categories share the same underlying article architecture and core interaction system. The Shortlist, What to Read When and Book Club Book Picks are not three different page structures: they are three category templates applied to the same Publication article system. The main structural exception is that The Shortlist is ranked and visibly numbered, while the other two categories are unranked. Each category template is an extension of that category's hub identity and is reused across every article in the category.
## 2. Article Experience Goals
Keep the reader exploring the Publication. A standard "What to Read Next" module appears after the article and shows contextually relevant FNFE pieces.
Introduce The Reading Room. Treat The Reading Room almost like an advertiser or sponsor: one in-article banner placement and a separate floating right-side placement on desktop. The two placements should use different formats/content rather than duplicate the same creative.
Grow the free Publication email list. Use a utility-led email capture: "Want us to send this list to you?" The reader receives the list by email and is also subscribed to the free Publication email list, with that relationship clearly disclosed.
Make the article easy to share. Provide a persistent floating share/link icon on the left side of the article on desktop. Its core action is to copy the article URL, with brief confirmation such as "Link copied!"
Build recognition and trust in FNFE. Make methodology a standing, recognizable article component rather than relying on the writer to weave it into the introduction. Consistent FNFE presentation and careful claims reinforce this over time.
Make moving through a book list enjoyable. Use restrained, category-specific motion and scroll response to give the article a sense of life without competing with the recommendations. The governing principle is: animate transitions, not reading.
## 3. Shared Article Structure
The following is the standard content order for Publication articles. The page uses a centered overall content container with generous surrounding whitespace; text and article content inside the container remain left-aligned.
Element
Role
Article title
The primary headline. Category-specific editorial/headline rules are defined in the relevant category section.
Category tag
A small clickable category treatment directly under the title, linking to that category's hub.
Methodology box
A standing "How we made this list" component containing one concise sentence with article-specific research/data context and one link to the methodology section on the About page.
Byline
Displayed as "By [author]".
Publication date
Date the article was published.
Article image
The primary editorial image for the piece.
Introductory text
The editorial opening. It can establish the reader interest, mood, premise or framing without needing to carry the methodology explanation.
Book list / article body
Structured, repeatable recommendation entries populated from CMS data. Category-specific content rules may change how the list is framed, but the underlying rendering system is templated.
What to Read Next
A standard end-of-article recirculation module populated with different relevant FNFE articles for each piece.
## 4. Methodology Box
Methodology is part of the standing article architecture. It should be visible enough to establish why an FNFE list is different, but visually quiet enough that it does not turn the article into a research product.
Component anatomy
Heading: "How we made this list"
One concise, article-specific sentence giving the relevant research/data context.
One link to the methodology section on the FNFE About page.
The methodology component should use the actual evidence available for the piece and avoid claims that exceed what the research supports.
## 5. Book Entry Template
Book recommendations are structured data, not manually designed blocks inside each article. The frontend renders each entry consistently from CMS fields.
Cover
Title
Author
Blurb
Optional associated tags
Associated tags are optional. They should not receive a formal visible field label that makes an entry look incomplete when no additional tags exist. When present, they can appear as quiet tag/chip treatments beneath the blurb.
Do not add recommendation counts, badges or other database-like metadata to the standard public book entry unless a later editorial decision explicitly introduces them. Category-specific structural information can still be added where meaningful; for The Shortlist, this includes the visible ranking number.
List length. Publication recommendation lists should remain under 20 books.
## 6. Standard Article-Level Components
### 6.1 Reading Room Banner
One banner-style Reading Room placement appears within the article body. It is intentionally treated like a sponsorship/advertising placement rather than making the Publication article feel like a funnel for The Reading Room.
### 6.2 Floating Reading Room Placement
On desktop, a separate Reading Room promotion can occupy the whitespace to the right of the central article container and remain available as the reader scrolls. It should use a different format and/or message from the in-article banner. Because the scroll-driven progress line also uses the outer margin during the recommendation list, the final desktop layout must prevent the two from competing for the same space; the progress experience should remain unobstructed while the list is in view. Mobile requires a separate treatment rather than forcing a desktop sidebar into the viewport.
### 6.3 Floating Share Control
On desktop, a small share/link icon floats to the left of the article container and remains accessible throughout the reading experience. The core action is copying the current article URL. Keep the control minimal; do not introduce a permanent row of social-network buttons.
### 6.4 "Send This List to Me" Email Capture
At an appropriate point in the reading experience, show a popup offering to send the current list to the reader by email. This replaces a separate save/download-list feature.
The value proposition should be the immediate utility of receiving this specific list, rather than a generic advertisement for the Publication newsletter. The submission also joins the reader to the free Publication email list, which must be clearly disclosed in the accompanying microcopy.
### 6.5 What to Read Next
Every article ends with the same recirculation component, but its recommended content changes by article. Its purpose is to prevent the article from becoming a dead end and give the reader a natural next FNFE piece to open.
The module should surface genuinely relevant Publication pieces rather than simply defaulting to the latest posts. Initial selections can be controlled manually in the CMS.
## 7. Motion and Scroll Experience
Motion is part of the reusable Publication article system, not decoration invented for individual pieces. Each category has its own motion template, inherited by every article in that category and designed as part of the same visual world as its hub.
Core principle: animate transitions, not reading. Motion should respond when the reader moves through the page and then become quiet when the reader stops to read. The books, titles and blurbs remain the focus.
### 7.1 Scroll-Driven Progress Line
During the recommendation-list portion of the article, a visual progress line occupies the outer margin beside the centered article column on desktop. The line draws forward continuously as the reader scrolls through the list and retracts as the reader scrolls back upward.
The underlying interaction is shared across all three categories, but each category has its own line design, path, form and scroll behavior as part of its category template. The line should feel like a designed kinetic element rather than a conventional progress bar.
The progress treatment should live within a contained, sticky viewport-level area rather than physically tracing the full height of a long article. This allows the composition to remain visible and expressive without cluttering the book list. Exact mobile adaptation remains to be defined.
### 7.2 Ambient Motion
Each category may use its own subtle ambient motion in the whitespace surrounding the article. This motion exists to make the editorial world feel alive; it does not communicate ranking, progress or importance. It should remain peripheral, avoid crossing or competing with core reading content, and settle into the background of the experience.
### 7.3 Content and Transition Motion
Selected article elements and transitions may animate as the reader reaches them: for example, an article image entering the viewport, a divider drawing into place, a book entry easing into position, or associated tags appearing. These behaviors are defined at category-template level rather than chosen article by article.
Motion should be most noticeable during movement and transitions. When the reader stops on a recommendation, the page should largely settle so the animation never becomes a tax on reading. Reduced-motion behavior should preserve the experience without requiring animation.
## 8. CMS and Templating Model
The CMS supplies variable content; the frontend code owns page structure, visual layout, placement logic and behavior.
Controlled by
Examples
Frontend / template controlled
Page order and spacing; centered container; typography/layout; category styling; methodology-box design; book-entry rendering; category motion template and progress-line behavior; Reading Room ad positions; floating share control; popup behavior; What to Read Next component design; responsive and reduced-motion behavior.
CMS controlled
Title; category; methodology data/sentence; author; publication date; article image; introductory copy; books and their order; optional associated tags; article-specific What to Read Next selections; other article-specific content fields introduced by a category.
A new article should therefore be publishable primarily by filling/selecting structured content in the CMS. Editors should not need to recreate the webpage layout, manually place standard promotions, or format each book block.
## 9. Shared Structure, Category-Specific Identity
The Shortlist, What to Read When and Book Club Book Picks all use the same article structure and core interaction system. What changes is the category template applied to that structure. Each category has one cohesive visual and motion system governing both its hub page and every article within that category. The article template is an extension of the hub's identity, not a separate design that merely borrows a few colours, type treatments or motifs. Moving from a category hub into one of its articles should feel like entering deeper into the same editorial world.
The category field tells the frontend which category-wide template to apply. That template can control accent treatment, typography accents, category-tag styling, methodology-box treatment, image framing, dividers, decorative motifs, progress-line design, ambient motion, content transitions and other recurring editorial details. These choices are systematic and repeat across the category; they are not redesigned for individual articles.
The wider FNFE visual world can be playful; the actual reading experience should remain spacious, calm and clean. Spaciousness is a feature. Avoid filling available space merely because more metadata or UI could be shown.
## 10. Category Template Rules
Because the underlying article experience is shared, the sections below record only meaningful category-level differences. The detailed visual and motion identity for each category will be designed holistically with its corresponding hub and then applied consistently to every article in that category.
### 10.1 The Shortlist
The Shortlist is FNFE's main ranked recommendation series. For a researched Tag, it presents the top recommendations that rose to the top of the analysed reader recommendation evidence.
Headline principle. The headline itself should make the top-recommendation premise clear, while retaining natural editorial language. Avoid generic list headlines that could be indistinguishable from an arbitrary book roundup.
Template rule. Every Shortlist article inherits the same Shortlist category template, including its hub-connected visual identity, progress-line design, ambient motion and content-transition behavior.
Ranking and numbering. Shortlist recommendations appear in ranked order and are visibly numbered. The numbering communicates the ranking and helps readers orient themselves as they move through the page.
Editorial introduction. The introduction remains a genuinely freeform editorial field. It is the primary space for the writer's voice and should not be forced into a rigid formula.
### 10.2 What to Read When
What to Read When uses the shared Publication article structure for an unranked recommendation list framed around the reader moment, mood, situation, occasion or desire that produced the researched Tag. It is not The Shortlist with a different headline. Book entries are not numbered or otherwise presented as a ranking. Every article inherits the same What to Read When category template and its hub-connected visual and motion identity.
### 10.3 Book Club Book Picks
Book Club Book Picks uses the shared Publication article structure for an unranked selection drawn from the researched recommendation pool and presented through the Book Club Book Picks editorial format. It is not simply the underlying Tag ranking repackaged under a book-club headline, and the template does not introduce a separate book-club-suitability scoring or ranking system. Book entries are not numbered. Every article inherits the same Book Club Book Picks category template and its hub-connected visual and motion identity.
## 11. Boundaries and Open Decisions
This document covers individual Publication articles only. Category hub experiences belong in a separate Publication Hub Experience Spec.
The Reading Room product experience is specified separately; only its promotional placements inside Publication articles are covered here.
Exact popup trigger/timing remains to be decided.
Exact mobile treatment for the floating share and Reading Room placements remains to be decided.
Exact Reading Room banner and floating-ad creative/copy remain to be decided.
Exact category-wide visual and motion identities, including the specific progress-line designs and ambient/content motion for each category, remain to be defined in conjunction with their hub experiences; article pages will inherit those systems.
Exact mobile adaptation of the scroll-driven progress line and category motion systems remains to be defined.
