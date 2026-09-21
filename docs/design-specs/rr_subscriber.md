THE READING ROOM
# Subscriber Experience Spec
Working source of truth • September 2026

> **Status note (added during production initialization, 2026-09-21):** Per the design
> project's own build notes (`DESIGN_PROJECT_BUILD_NOTES.md`), none of the experience
> described in this document was built for V1 — the Reading Room ships in V1 as a public
> landing page and paid-trial checkout only. This document is preserved as the documented
> backlog for a future logged-in Reading Room product, not as a current V1 requirement.

## Purpose
Define the subscriber-facing website experience for The Reading Room, beginning with access and continuing through the logged-in product. This document will be expanded iteratively as each part of the subscriber experience is decided.
The Reading Room is a paid Field Notes From Everywhere product. It delivers themed book catalogues Monday through Saturday, a Sunday recap, and subscriber access to Past Issues and Books. This specification covers the website experience of accessing and using that product.
## 1. Reading Room Access
The public Reading Room landing page provides two routes into the product: Log in for an existing user and Try it for free for someone beginning the 7-day free trial. Both routes use email-based passwordless access. Users are not asked to create or remember a password.
### 1.1 Log In
Heading
Log in to The Reading Room
Email Field
Email address
CTA
Send me a login link
Secondary Action
A route for someone who does not yet have Reading Room access to start the free trial.
Confirmation State
After the user submits their email address, the screen changes to a simple confirmation state telling them to check their email for the link that will take them into The Reading Room.
### 1.2 Sign Up / Free Trial
Heading
Try The Reading Room free for 7 days
Subheading
7 days of full access. No credit card required.
Email Field
Email address
CTA
Start my free trial
Secondary Action
Already have an account? Log in
Confirmation State
After the user submits their email address, the screen changes to a simple confirmation state telling them to check their email and use the link there to continue into The Reading Room.
### 1.3 Experience / Behaviour Requirements
The Reading Room uses passwordless email access. Login and signup screens do not contain password fields.
A returning reader who remains authenticated should not routinely encounter the login screen.
Access to subscriber-only Reading Room content is limited to users with current Reading Room access, such as an active free trial or active subscription.
The access experience should not introduce onboarding questions, account configuration or other functionality that is not required to enter The Reading Room.
### 1.4 Design Direction
The login, signup and email-confirmation states should visually belong to The Reading Room rather than appearing as generic site authentication utilities. They are transitional experiences, however, so they should remain simple and focused.
The Reading Room identity can come through the product's typography, branding, restrained book-related visual material, motion or other elements of the wider Reading Room visual system. The form and its immediate action should remain the clear focus.
## 2. Logged-In Reading Room
The logged-in Reading Room is a single subscriber home with two primary screens: Books and Past Issues. Subscribers move between these two screens within The Reading Room rather than entering separate product areas.
### 2.1 Primary Screens
Books
The book-first catalogue. This is the default screen shown when a subscriber enters The Reading Room after logging in.
Past Issues
The theme/issue-first catalogue. Subscribers can move from Books to Past Issues and back again within the same Reading Room home.
### 2.2 Entry and Navigation Behaviour
After successfully entering The Reading Room, the subscriber lands on the Books screen by default.
Books and Past Issues are the two primary screens of the logged-in Reading Room.
The interface must provide a clear way to move between Books and Past Issues without making them feel like separate products or separate areas of the wider FNFE website.
There is no separate subscriber dashboard or additional Reading Room Home screen before these two catalogue views.
### 2.3 Reading Room Header
The logged-in Reading Room does not inherit the universal Field Notes From Everywhere website header or footer. Once a subscriber enters The Reading Room, they are in a distinct product environment with its own minimal header.
Product IdentityThe Reading Room. This is a non-clickable identity element; it does not link to another Reading Room home because no separate home screen exists.
Primary NavigationBooks and Past Issues. These are the two views within the Reading Room and should be clearly available from the header. The active view should be visually apparent.
Exit ActionsBack to FNFE Publication and Log out.
The header should remain minimal. It should not recreate the public FNFE website navigation or introduce account, profile, settings or other product areas that are not part of The Reading Room.
The logged-in Reading Room does not use the universal FNFE website footer.
## 3. Books Screen
Books is the default Reading Room screen after entry. It is a book-first browsing experience: subscribers arrive directly at the catalogue rather than passing through introductory content, a dashboard or a separate landing state.
### 3.1 Page Structure
The page is intentionally direct. At the top right of the Books content area is the Tags control. The book catalogue begins immediately below this control and continues vertically down the page.
### 3.2 Tags Control
ControlA button labelled "Tags" positioned at the top right of the Books content area.
Open StateClicking Tags opens a dropdown containing the A–Z list of Tags/themes that have already had a published Reading Room issue.
Dropdown BehaviourThe dropdown has a limited visible height. When the list is longer than the available height, the list scrolls vertically within the dropdown rather than expanding indefinitely down the page.
Tag Search
The open Tags dropdown includes a text field that allows the subscriber to type and narrow the displayed list of published Tags. The results update as they type. This searches only the available published Tag names; it is not a semantic search or a search across books or issue content.
FilteringOnly one Tag is selected at a time. Selecting a Tag filters the catalogue below so that it shows books associated with that published Tag.
Associated Tags shown on individual book rows do not automatically become filter options. A Tag appears in this dropdown when it has itself been the subject of a published Reading Room issue.
### 3.3 Book Catalogue
The catalogue is a full-width, vertically stacked list of books. It should take structural inspiration from an Amazon Kindle book search: each book is presented as a substantial horizontal result row rather than as a compact cover grid.
The catalogue uses endless scrolling rather than pagination. In the unfiltered view, each unique book that has appeared in at least one published Reading Room issue appears once.
### 3.4 Book Row Template
Every book uses the same row template so the catalogue feels consistent and easy to scan.
Left SideBook cover.
Right SideBook information stacked vertically in this order: Title, Author, Blurb, Associated Tags.
The cover and text sit side by side within one full-width row. The text area should have enough room for the blurb to be genuinely readable; this should not be treated as a dense metadata table or a cover-first gallery.
Associated Tags sit beneath the blurb as part of the book row. They provide additional context about the book even when those Tags are not available as catalogue filters.
No separate book-detail page is required for this experience. The catalogue row itself carries the subscriber-facing book information defined for the Books screen.
### 3.5 Books Screen Design Direction
The Books screen should feel like browsing a large, useful catalogue rather than using a conventional SaaS dashboard. The visual hierarchy should prioritize the books themselves: the Tags control is easy to find but does not dominate the page, and the repeated book rows create the main visual rhythm.
Do not introduce additional page sections, promotional modules, introductory copy, ratings, reviews, personalized recommendations, shelves/TBR mechanics, retailer links or other features that are not part of the defined Reading Room Books experience.
### 3.6 Visual Identity and Browsing Focus
Anchor PrincipleThe Books screen should feel visually rich because it contains a large collection of books, not because the interface surrounding those books is visually busy.
Books Are the Visual FocusThe book catalogue is the main visual experience. Book covers provide the strongest colour, variation and visual interest on the page. The surrounding interface should therefore remain comparatively quiet so it does not repeatedly pull attention away from the books.
Calm, Predictable Browsing RhythmEvery book row should follow the same clear visual structure: cover on the left; title, author, blurb and associated Tags stacked on the right. This repetition is intentional. A subscriber should quickly learn where each piece of information appears and then be able to scan from one book to the next without having to visually reorient themselves.
Catalogue DensityThe page should balance readability with catalogue density. Covers should be large enough to recognize without becoming oversized; blurbs should have comfortable reading width; and spacing should clearly separate one book from the next without creating large empty gaps. The screen should feel abundant and browsable rather than sparse or compressed.
Row TreatmentBook rows should read as parts of one continuous catalogue rather than as a stack of heavily styled standalone cards. Claude Design may use spacing, subtle separators or other restrained treatments to establish the boundary between books, but each row should not become a decorative component competing for attention.
Interface ChromeThe Reading Room header and Tags control should be easy to locate when needed but visually restrained while the subscriber is browsing. Opening the Tags dropdown is a functional interaction: the reader should be able to find a published issue Tag, select it and return their attention to the catalogue.
Associated TagsAssociated Tags should remain readable and visually identifiable beneath the blurb, but they are secondary to the title, author and blurb. Their treatment should fit the Reading Room visual system without becoming a dominant visual element in each row.
Amazon Kindle ReferenceThe Amazon Kindle search reference is structural, not aesthetic. It communicates the useful horizontal result format and information density: cover to the left and substantial book information to the right. The Books screen should still look and feel like The Reading Room rather than like Amazon.
Avoid Visual InterruptionOnce the book catalogue begins, do not interrupt it with promotional modules, decorative sections, editorial callouts, banners, featured-book treatments, oversized headings or other content inserted between book rows. The subscriber's attention should remain on browsing the books.
Reading Room IdentityThe Reading Room identity should come through subtly in typography, background, spacing, Tag treatment and other restrained interface details. The interface should not rely on decorative illustrations, elaborate backgrounds or other expressive elements that compete with the catalogue.
## 4. Past Issues Screen
The Past Issues screen is the subscriber's issue-first way of exploring The Reading Room. It should allow someone to move naturally between the newest Reading Room issues, browse older issues according to broad types of recommendation themes, or work backwards through the complete archive.
The page is a single vertically scrolling experience. Its sections stack on top of one another in the order described below.
The issue cards provide most of the colour and visual character of the screen. The interface surrounding those cards should remain comparatively restrained so that, as the subscriber moves down the page, their attention continues to fall primarily on the Reading Room issues themselves.
### 4.1 Top of the Past Issues Screen
The screen begins immediately beneath the persistent Reading Room header defined earlier in this document.
There is no introductory hero, description of Past Issues, or other promotional content before the archive begins.
At the top right of the Past Issues content area is the Tag control.
Control Label: "Tags"
Clicking Tags opens a dropdown containing an alphabetically ordered A–Z list of the Tags/themes that have already had a published Reading Room issue.
The dropdown has a limited visible height. If the complete list is longer than the available dropdown space, the list scrolls vertically within the dropdown rather than continuing down the page.
Tag Search
The open Tags dropdown includes a text field that allows the subscriber to type and narrow the displayed list of published Tags. The results update as they type. This searches only the available published Tag names; it is not a semantic search or a search across books or issue content.
Only one Tag is selected at a time. Selecting a Tag allows the subscriber to retrieve the Reading Room issue published for that Tag/theme.
The Tags control is a functional browsing tool and should remain visually restrained. It should be easy to locate when needed without becoming a dominant element at the top of the screen.
Immediately beneath this control area, the issue content begins.
### 4.2 Section 1 — Latest Issue
The first content on the page is the most recently published Reading Room issue.
There is no required on-page section heading above this card. "Latest Issue" is the name of this section within this specification, not literal text that Claude Design should automatically place on the page.
The latest issue is represented by a single full-width issue card spanning the available width of the Past Issues content area. It is the largest issue card treatment on the screen and acts as the opening visual anchor for the archive.
#### Content inside the card
Primary Text: The title of the Reading Room issue.
The title should be the most prominent element inside the card and carry most of its textual hierarchy.
Metadata: [number of books] · [publication date]
The book count and publication date appear beneath the issue title. They are clearly secondary to the title but remain immediately legible.
For example, the hierarchy might represent information equivalent to:
Books That Will Emotionally Destroy You42 books · September 5, 2026
That example demonstrates information hierarchy only; it is not fixed page copy.
#### Card behaviour
The entire card is clickable and opens the complete Reading Room issue represented by it.
The card should not contain an excerpt, description, featured book, book-cover collage, CTA button or other additional information. Its job is to identify the issue clearly and provide a direct route into it.
#### Visual treatment
The card uses a background shade from The Reading Room colour palette. Its text colour should contrast sufficiently with that background to remain comfortably legible.
Its prominence should come primarily from its full-width scale, position and typography, rather than from surrounding decorative elements.
Once this full-width card ends, the page moves into the Recent Issues section.
### 4.3 Section 2 — Recent Issues
Section Heading: "Recent Issues"
This is literal on-page text. It appears above the Recent Issues content.
Beneath the heading is a horizontal carousel containing a capped selection of the Reading Room issues published immediately before the current latest issue.
The carousel should not expand vertically into multiple rows. It remains one horizontally browsable sequence.
#### Issue cards
Every card contains:
Primary Text: Issue title
Metadata: [number of books] · [publication date]
The title remains the dominant text on the card, with the metadata directly beneath it.
These cards are smaller than the full-width lead card above because they belong to a multi-item browsing sequence rather than serving as the page's lead issue.
#### Carousel behaviour
The issues are ordered by publication date, beginning with the most recent issue after the lead issue and moving backwards.
Only a capped number of recent issues belong in this section. As new issues are published, the section continues to represent the recent portion of the archive rather than growing indefinitely.
The carousel must genuinely support horizontal browsing. Its composition should also communicate that additional cards continue beyond the initially visible portion of the row, rather than looking like a static row that happens to contain several cards.
Subscribers can move horizontally through the carousel using the interaction appropriate to their device.
Selecting any issue card opens that complete Reading Room issue.
After the Recent Issues carousel, the chronological opening of the page ends and the screen transitions into broader archive exploration.
### 4.4 Transition — Browse Our Collections
Transition Heading: "Browse Our Collections"
This is literal on-page text.
It appears after Recent Issues and before the first collection section.
The heading should act as a clear but relatively simple transition. Its purpose is to signal that the subscriber is moving from browsing recently published issues into exploring the wider archive according to different types of recommendation themes.
This is not a large promotional section and does not require explanatory body copy.
The first collection begins beneath this transition.
### 4.5 Sections 3–10 — Collection Browsing
The next portion of the page contains eight collection sections stacked vertically in this order: Genre, Character, Relationship, Trope, Mood, Theme, Setting, Experience.
Each is an actual section of the Past Issues page.
The words Genre, Character, Relationship, Trope, Mood, Theme, Setting, and Experience are literal section headings displayed to the subscriber, not internal descriptors for Claude Design.
Each section surfaces a fixed-size selection of Reading Room issues relevant to that collection. These sections are intended to encourage exploration rather than reproduce the entire archive eight times.
The issue cards continue to use the same underlying content system throughout these sections:
Primary Text: Issue title
Metadata: [number of books] · [publication date]
Selecting a card opens the corresponding complete Reading Room issue.
#### Presentation across the eight sections
These eight sections perform the same basic job, but they should not become eight identical carousels or eight identical grids stacked one after another.
Claude Design has freedom to vary the presentation and movement treatment of the issue-card showcases across the eight sections so that moving down this long portion of the page continues to feel exploratory.
That freedom applies to the presentation of the cards as a group, not to their underlying meaning. Subscribers should continue to recognize the coloured objects throughout the page as Reading Room issue cards containing a title, book count and publication date.
The sections should also remain part of one coherent Reading Room visual system. Variation should not become eight unrelated design concepts.
The issue cards themselves should provide most of the visual energy through their colour, scale and arrangement. Avoid adding elaborate decorative environments around individual collection sections simply to differentiate them.
#### Section 3 — Genre
Section Heading: "Genre"
The heading appears above a fixed-size showcase of Reading Room issues whose recommendation themes belong to the Genre grouping.
The showcase should provide enough issues to make the section useful for discovery while remaining deliberately selective. It should not expand into a complete Genre archive.
Once the Genre showcase ends, the Character section follows beneath it.
#### Section 4 — Character
Section Heading: "Character"
The heading appears above a fixed-size showcase of Reading Room issues organized around character-related recommendation themes.
This is a separate vertical section from Genre. Its issue-card presentation may use a different composition or movement treatment from the preceding section, while remaining recognizably part of the same Past Issues experience.
Once the Character showcase ends, the Relationship section follows.
#### Section 5 — Relationship
Section Heading: "Relationship"
The heading appears above a fixed-size showcase of Reading Room issues organized around relationship-focused recommendation themes.
The section should remain selective rather than becoming a complete archive of every qualifying issue.
Once this showcase ends, the page continues into Trope.
#### Section 6 — Trope
Section Heading: "Trope"
The heading appears above a fixed-size showcase of Reading Room issues organized around trope-based recommendation themes.
The issue cards follow the established title-and-metadata content hierarchy while the presentation of the showcase can contribute to the changing browsing rhythm across the collection portion of the page.
Mood follows beneath it.
#### Section 7 — Mood
Section Heading: "Mood"
The heading appears above a fixed-size showcase of Reading Room issues organized around mood-based recommendation themes.
The section remains visually connected to the collection sequence around it while having enough compositional distinction that the subscriber does not feel as though they are scrolling through repeated copies of the same module.
Theme follows beneath it.
#### Section 8 — Theme
Section Heading: "Theme"
The heading appears above a fixed-size showcase of Reading Room issues organized around thematic recommendation interests.
The showcase remains selective and uses the established Reading Room issue-card system.
Setting follows beneath it.
#### Section 9 — Setting
Section Heading: "Setting"
The heading appears above a fixed-size showcase of Reading Room issues whose recommendation themes are organized around setting.
As elsewhere in the collection sequence, the section should be clearly identifiable by its heading without requiring additional explanatory copy.
Experience follows beneath it.
#### Section 10 — Experience
Section Heading: "Experience"
The heading appears above a fixed-size showcase of Reading Room issues organized around the kind of reading experience someone is looking for.
This is the final exploratory collection section.
Once the Experience showcase ends, the page transitions into the complete chronological archive.
### 4.6 Section 11 — All Past Issues
Section Heading: "All Past Issues"
This is literal on-page text.
This final section gives the subscriber access to the complete history of published Reading Room issues rather than a selective showcase.
Issues are presented in reverse chronological order, beginning with the newest and moving backwards through the archive.
#### Issue cards
Every issue uses the established card content:
Primary Text: Issue title
Metadata: [number of books] · [publication date]
The title remains dominant and the metadata remains secondary.
The cards continue using background shades drawn from The Reading Room colour palette, with text colours selected for sufficient contrast.
The card arrangement here should be suitable for browsing a potentially large and continually growing archive. Unlike the collection sections above, this section prioritizes straightforward chronological retrieval over showcase-style presentation.
#### Initial state
The section initially displays a limited number of issues rather than rendering the entire historical archive at once.
Beneath the currently visible cards is:
Action Label: "See more"
This is literal on-page text.
#### See more behaviour
Selecting See more reveals the next group of older Reading Room issues within the existing All Past Issues section.
It does not navigate to another page.
The subscriber can continue using See more to work backwards through the archive until all published issues have been revealed.
### 4.7 Issue Card Visual System Across the Screen
All issue cards on Past Issues belong to one recognizable visual family, whether they appear as the full-width lead card, inside Recent Issues, within one of the eight collection showcases, or in All Past Issues.
The cards use multiple background shades from The Reading Room colour palette. This changing colour treatment should create variety and rhythm as the subscriber moves through a page containing many issues.
Text colour must always be selected in response to the background shade so that the title and metadata maintain strong legibility.
The information hierarchy remains consistent:
Issue titleNumber of books · Publication date
Different sections can change the scale, arrangement and movement of the cards without changing that basic information hierarchy.
The full-width lead card is the largest expression of the system. Cards appearing in multi-item sections can be smaller as required by their composition.
### 4.8 Overall Visual Direction
The Past Issues screen can be more visually expressive than the Books screen, but that expression should primarily come from the issue cards themselves.
The cards are already providing changing colour, typography and visual rhythm throughout a long page. The interface around them therefore needs to be comparatively calm.
The page background, section headings, Tags control, spacing and other surrounding elements should organize and support the cards rather than compete with them.
In particular, avoid surrounding the archive with decorative graphics, strong background treatments, oversized interface elements or repeated visual devices that pull attention away from the issue cards.
The eight collection sections create a long exploratory middle to the page. Their layouts can vary enough to keep scrolling interesting, but the page should never feel as though the subscriber is moving through eight unrelated visual environments.
The overall effect should be a colourful, browsable archive in which the Reading Room issues remain the dominant visual objects from the top of the page to the bottom.
## 5. Individual Reading Room Issue
An individual Reading Room issue is the web view of a complete Reading Room newsletter. It is reached when a subscriber selects an issue from Past Issues and should feel like opening that newsletter inside The Reading Room rather than navigating to a conventional editorial article page.
The page uses the standard Reading Room-specific header defined earlier in this document. It does not inherit the universal FNFE website header or footer.
### 5.1 Issue Container
Immediately beneath the Reading Room header is a consistent issue container that provides the web framing for every Reading Room issue. The container should visually evoke the experience of viewing a Reading Room newsletter while remaining a web page rather than attempting to reproduce an email client.
The container is templated and remains consistent from issue to issue. The content inside it is populated from the corresponding issue's CMS fields.
### 5.2 Issue Content
Subject
The issue's Subject field is populated by copying and pasting the complete subject line used for the corresponding newsletter email.
Body
The issue's Body field is populated by copying and pasting the complete body of the corresponding newsletter email into the CMS. The body consists primarily of text and images and should be rendered inside the issue container as the issue's main content.
The website does not require the editor to rebuild the newsletter by entering each book recommendation into separate CMS fields. The complete newsletter body is the editorial content supplied to the issue template.
### 5.3 Relationship Between Template and Content
The frontend owns the fixed structure and presentation of the issue page, including the Reading Room header, issue container, responsive behaviour and surrounding page experience. The CMS supplies the issue Subject and Body content.
Claude Design should therefore design a consistent container and reading environment capable of accommodating the complete pasted newsletter body. It should not design a different page layout for each individual issue or require the designer/editor to manually arrange individual books within the issue.
### 5.4 Content and Reading Experience
The complete newsletter body should remain the focus of the page. The surrounding Reading Room interface should be restrained enough that subscribers can read through the issue without unnecessary interface elements competing with the content.
Because the body may contain both text and images, the issue container must accommodate both naturally and remain comfortable to read on different screen sizes. The exact visual treatment of the container, typography, spacing, image sizing and responsive behaviour should be resolved through design while preserving the complete newsletter content.
## 6. Responsive Design Notes
All Reading Room subscriber experiences should work comfortably across desktop, tablet and mobile screen sizes. Responsive design should preserve the established content hierarchy, functionality and browsing experience rather than treating mobile as a separate product.
Claude Design should determine the specific responsive solutions for each screen, including changes to layout, scale, spacing, typography, card proportions, carousel behaviour, dropdown presentation and other interaction details where the available viewport requires them.
The Books screen should remain comfortable to scan as a catalogue on smaller screens. The Past Issues screen should remain easy to browse as its sections and issue showcases adapt to narrower widths. The individual Reading Room issue should remain comfortable to read, with newsletter text and images adapting appropriately to the available space.
Specific mobile layouts, breakpoints, animation behaviour and interaction mechanics are intentionally left to Claude Design unless a requirement is explicitly established elsewhere in this specification.
