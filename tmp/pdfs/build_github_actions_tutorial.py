from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether, Flowable, HRFlowable, XPreformatted
)
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
from pathlib import Path

ROOT = Path(r"D:\projects\pindari-coders")
OUT = ROOT / "output" / "pdf" / "pindaricoders-github-actions-opportunity-sync-tutorial.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
INK = colors.HexColor("#183125")
MUTED = colors.HexColor("#5F6F61")
CREAM = colors.HexColor("#F7F8F1")
PAPER = colors.HexColor("#FFFDF7")
LIME = colors.HexColor("#D4FF64")
PALE = colors.HexColor("#EAF1DE")
LINE = colors.HexColor("#CAD5C3")
WHITE = colors.white

fonts = [
    ("Inter", Path(r"C:\Windows\Fonts\arial.ttf")),
    ("InterBold", Path(r"C:\Windows\Fonts\arialbd.ttf")),
    ("Mono", Path(r"C:\Windows\Fonts\consola.ttf")),
    ("MonoBold", Path(r"C:\Windows\Fonts\consolab.ttf")),
]
for name, path in fonts:
    if path.exists():
        pdfmetrics.registerFont(TTFont(name, str(path)))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Kicker", fontName="MonoBold", fontSize=8.5, leading=11, textColor=MUTED, spaceAfter=6, uppercase=True))
styles.add(ParagraphStyle(name="Hero", fontName="InterBold", fontSize=32, leading=34, textColor=INK, spaceAfter=14))
styles.add(ParagraphStyle(name="Deck", fontName="Inter", fontSize=13, leading=19, textColor=MUTED, spaceAfter=12))
styles.add(ParagraphStyle(name="H1x", fontName="InterBold", fontSize=22, leading=25, textColor=INK, spaceBefore=3, spaceAfter=10))
styles.add(ParagraphStyle(name="H2x", fontName="InterBold", fontSize=13, leading=16, textColor=INK, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", fontName="Inter", fontSize=9.5, leading=14.3, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="Smallx", fontName="Inter", fontSize=8, leading=11.5, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="Codex", fontName="Mono", fontSize=7.4, leading=10.8, textColor=INK, leftIndent=7, rightIndent=7, borderColor=LINE, borderWidth=.6, borderPadding=7, backColor=CREAM, spaceBefore=4, spaceAfter=8))
styles.add(ParagraphStyle(name="Calloutx", fontName="InterBold", fontSize=11, leading=16, textColor=INK, leftIndent=10, rightIndent=10, borderColor=INK, borderWidth=1, borderPadding=10, backColor=LIME, spaceBefore=7, spaceAfter=10))
styles.add(ParagraphStyle(name="CenterSmall", fontName="Inter", fontSize=7.5, leading=9.5, alignment=TA_CENTER, textColor=INK))
styles.add(ParagraphStyle(name="TableHead", fontName="MonoBold", fontSize=7.5, leading=9, textColor=INK))
styles.add(ParagraphStyle(name="TableBody", fontName="Inter", fontSize=7.6, leading=10.2, textColor=INK))


def P(text, style="Bodyx"):
    if style == "Codex":
        return XPreformatted(text, styles[style])
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph(text, ParagraphStyle(
        name="bullet-temp", parent=styles["Bodyx"], leftIndent=13,
        firstLineIndent=-8, bulletIndent=0, spaceAfter=4
    ), bulletText="+")


def section(number, title):
    return [P(f"CHAPTER {number:02d}", "Kicker"), P(title, "H1x")]


class FlowDiagram(Flowable):
    def __init__(self, width=170*mm, height=49*mm):
        super().__init__()
        self.width, self.height = width, height

    def draw(self):
        c = self.canv
        labels = [
            ("GitHub", "timer"), ("Runner", "private job"),
            ("3 APIs", "fetch"), ("Sanity", "store"), ("Website", "display")
        ]
        gap = 5*mm
        box_w = (self.width - gap*4) / 5
        box_h = 23*mm
        y = 12*mm
        for i, (top, bottom) in enumerate(labels):
            x = i * (box_w + gap)
            c.setFillColor(LIME if i in (0, 3) else PAPER)
            c.setStrokeColor(INK)
            c.setLineWidth(1)
            c.roundRect(x, y, box_w, box_h, 3*mm, fill=1, stroke=1)
            c.setFillColor(INK)
            c.setFont("InterBold", 8.5)
            c.drawCentredString(x + box_w/2, y + 13.5*mm, top)
            c.setFont("Mono", 6.3)
            c.drawCentredString(x + box_w/2, y + 7*mm, bottom)
            if i < 4:
                ax = x + box_w
                c.setStrokeColor(INK)
                c.line(ax + 1*mm, y + box_h/2, ax + gap - 1*mm, y + box_h/2)
                c.line(ax + gap - 2.5*mm, y + box_h/2 + 1.5*mm, ax + gap - 1*mm, y + box_h/2)
                c.line(ax + gap - 2.5*mm, y + box_h/2 - 1.5*mm, ax + gap - 1*mm, y + box_h/2)
        c.setFillColor(MUTED)
        c.setFont("Inter", 7)
        c.drawString(0, 3*mm, "Private write path")
        c.drawRightString(self.width, 3*mm, "Public read path")


def footer(canvas: Canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(.5)
    canvas.line(18*mm, 15*mm, PAGE_W-18*mm, 15*mm)
    canvas.setFillColor(INK)
    canvas.setFont("InterBold", 7.2)
    canvas.drawString(18*mm, 9.5*mm, "*  pindaricoders.")
    canvas.setFont("Mono", 6.7)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W-18*mm, 9.5*mm, f"OPPORTUNITY SYNC  /  {doc.page:02d}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
    topMargin=18*mm, bottomMargin=21*mm, title="PindariCoders GitHub Actions Opportunity Sync Tutorial",
    author="PindariCoders"
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates(PageTemplate(id="main", frames=[frame], onPage=footer))

story = []
story += [Spacer(1, 16*mm), P("PINDARICODERS FIELD GUIDE / 01", "Kicker")]
story += [P("How the opportunity radar updates itself", "Hero")]
story += [P("A practical tutorial on using GitHub Actions as a scheduled data worker, keeping API keys private, cleaning jobs from multiple providers, and publishing safe data through Sanity.", "Deck")]
story += [Spacer(1, 7*mm), FlowDiagram(), Spacer(1, 7*mm)]
story += [P("THE CENTRAL IDEA", "Kicker"), P("GitHub Actions collects. Sanity stores. PindariCoders presents.", "Calloutx")]
story += [P("Built for Abou Bakar and Muhammad Abdullah", "Smallx"), P("September 2026  |  PindariCoders", "Smallx"), PageBreak()]

story += section(1, "The problem we had to solve")
story += [P("The Opportunities page needed current Pakistan and worldwide remote jobs without asking you to enter every listing manually. The data came from Jooble, Himalayas, and Remote OK, but the site itself is a static Next.js export.")]
problem_rows = [
    [P("PROBLEM", "TableHead"), P("WHY IT MATTERS", "TableHead")],
    [P("Private API keys", "TableBody"), P("Anything shipped to browser JavaScript can be inspected and copied.", "TableBody")],
    [P("Requests per visitor", "TableBody"), P("Every page visit would call three providers, consuming quotas and slowing the page.", "TableBody")],
    [P("Different data shapes", "TableBody"), P("Each provider names titles, companies, dates, and links differently.", "TableBody")],
    [P("No permanent server", "TableBody"), P("A static site has no always-running process that can wake itself every morning.", "TableBody")],
    [P("Unreliable sources", "TableBody"), P("A provider may time out or change its response while the other sources remain healthy.", "TableBody")],
]
t = Table(problem_rows, colWidths=[48*mm, 118*mm], repeatRows=1)
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), PALE), ("BOX", (0,0), (-1,-1), .6, LINE),
    ("INNERGRID", (0,0), (-1,-1), .35, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
    ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7),
]))
story += [t, Spacer(1, 6*mm), P("Why GitHub Actions", "H2x")]
story += [P("A GitHub runner is a temporary server. GitHub starts it on a schedule, downloads the repository, runs the Node.js script with protected secrets, and destroys the runner when the job finishes. No permanent server needs to be maintained.")]
story += [P("GitHub Actions is the timer and worker for this feature. It is not the website host.", "Calloutx"), PageBreak()]

story += section(2, "The complete journey of one job")
story += [FlowDiagram(), Spacer(1, 4*mm)]
steps = [
    ("01", "Wake", "At 01:15 UTC each day, GitHub creates an Ubuntu runner."),
    ("02", "Authorize", "The runner receives JOOBLE_API_KEY and SANITY_WRITE_TOKEN as environment variables."),
    ("03", "Fetch", "The Node script calls Jooble, Himalayas, and Remote OK."),
    ("04", "Normalize", "Provider-specific responses become one PindariCoders opportunity shape."),
    ("05", "Curate", "The script validates URLs, infers domains and experience, removes duplicates, and rejects stale jobs."),
    ("06", "Store", "Authenticated createOrReplace mutations publish the normalized documents to Sanity."),
    ("07", "Read", "The website requests published, unexpired documents from the public Sanity CDN."),
    ("08", "Explore", "Visitors search, filter, paginate, and open the original source link."),
]
cards = []
for num, title, desc in steps:
    cards.append([
        P(num, "Kicker"),
        P(f"<b>{title}</b><br/>{desc}", "Bodyx")
    ])
t = Table(cards, colWidths=[17*mm, 149*mm])
t.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"), ("LINEBELOW", (0,0), (-1,-2), .45, LINE),
    ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 5),
]))
story += [t, PageBreak()]

story += section(3, "Reading the workflow file")
story += [P("The automation lives in <b>.github/workflows/sync-opportunities.yml</b>. GitHub automatically recognizes YAML files in this directory.")]
story += [P("""on:
  schedule:
    - cron: '15 1 * * *'
  workflow_dispatch:""", "Codex")]
story += [P("The cron expression means minute 15, hour 1, every day, every month, every weekday. GitHub schedules default to UTC, so this is approximately 6:15 AM in Pakistan. <b>workflow_dispatch</b> adds the manual Run workflow button.")]
cron_rows = [
    [P("FIELD", "TableHead"), P("VALUE", "TableHead"), P("MEANING", "TableHead")],
    [P("Minute", "TableBody"), P("15", "TableBody"), P("At minute 15", "TableBody")],
    [P("Hour", "TableBody"), P("1", "TableBody"), P("At 01:00 UTC", "TableBody")],
    [P("Day", "TableBody"), P("*", "TableBody"), P("Every day", "TableBody")],
    [P("Month", "TableBody"), P("*", "TableBody"), P("Every month", "TableBody")],
    [P("Weekday", "TableBody"), P("*", "TableBody"), P("Every weekday", "TableBody")],
]
t = Table(cron_rows, colWidths=[40*mm, 25*mm, 101*mm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), PALE), ("BOX", (0,0), (-1,-1), .6, LINE),
    ("INNERGRID", (0,0), (-1,-1), .35, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
    ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story += [t, Spacer(1, 5*mm)]
story += [P("What the runner executes", "H2x"), P("""steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
  - run: node scripts/sync-opportunities.mjs""", "Codex")]
story += [bullet("checkout copies the repository onto the temporary runner."), bullet("setup-node installs the required Node.js runtime."), bullet("run launches the synchronization script from the repository root."), PageBreak()]

story += section(4, "Keeping credentials private")
story += [P("The GitHub repository stores two Actions secrets: <b>JOOBLE_API_KEY</b> and <b>SANITY_WRITE_TOKEN</b>. Their values never appear in the committed workflow file.")]
story += [P("""env:
  JOOBLE_API_KEY: ${{ secrets.JOOBLE_API_KEY }}
  SANITY_WRITE_TOKEN: ${{ secrets.SANITY_WRITE_TOKEN }}""", "Codex")]
story += [P("The runner exposes these values as temporary environment variables. The Node script reads them with <b>process.env</b>. The website bundle never receives them.")]
story += [P("SECURITY RULE", "Kicker"), P("Never put a private write token or paid API key in NEXT_PUBLIC_* variables. That prefix intentionally exposes values to browser code.", "Calloutx")]
story += [P("Secret setup checklist", "H2x")]
story += [bullet("Open repository Settings."), bullet("Choose Secrets and variables, then Actions."), bullet("Create the secret using exactly the name expected by the workflow."), bullet("Give the Sanity token only the permissions required to write opportunity documents."), bullet("Do not print token values in workflow logs."), PageBreak()]

story += section(5, "Inside the synchronization script")
story += [P("The script <b>scripts/sync-opportunities.mjs</b> follows the common ETL pattern: Extract, Transform, Load.")]
etl = [
    [P("EXTRACT", "TableHead"), P("TRANSFORM", "TableHead"), P("LOAD", "TableHead")],
    [P("Download provider responses", "TableBody"), P("Create one consistent schema", "TableBody"), P("Send documents to Sanity", "TableBody")],
    [P("Continue if one source fails", "TableBody"), P("Validate, classify, and deduplicate", "TableBody"), P("Use stable IDs to update records", "TableBody")],
]
t = Table(etl, colWidths=[55.3*mm]*3)
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), LIME), ("BOX", (0,0), (-1,-1), .7, INK),
    ("INNERGRID", (0,0), (-1,-1), .35, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
    ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7),
]))
story += [t, Spacer(1, 5*mm)]
story += [P("Resilient fetching", "H2x"), P("""const results = await Promise.allSettled([
  jooble(joobleKey),
  himalayas(),
  remoteOk()
]);""", "Codex")]
story += [P("Promise.allSettled lets healthy providers finish even when another provider fails. Every request also has a 20-second timeout, and the timer is cleared in a finally block.")]
story += [P("One internal opportunity shape", "H2x")]
story += [P("Every job is converted into title, company, description, URL, location, work mode, type, experience, domain, skills, salary, source, published time, and expiration time. This keeps UI code independent of provider-specific field names."), PageBreak()]

story += section(6, "Deduplication and safe writes")
story += [P("A daily import must be repeatable. Running it twice should update existing records instead of doubling them.")]
story += [P("""function makeId(source, externalId) {
  return `opportunity-${source}-${sha256(externalId)}`;
}""", "Codex")]
story += [P("The real implementation normalizes the source name and keeps the first 20 characters of a SHA-256 hash. A provider job therefore receives the same Sanity document ID on every run.")]
story += [P("""mutations = items.map(item => ({
  createOrReplace: item
}));""", "Codex")]
story += [P("Sanity's createOrReplace operation creates a missing document and replaces the existing document when the same ID already exists. Mutations are sent in batches of 50.")]
story += [P("Two duplicate protections", "H2x")]
story += [bullet("Within one run, normalized company plus title prevents repeated cards from different responses."), bullet("Across multiple days, stable document IDs prevent the same source listing from multiplying in Sanity.")]
story += [P("If no usable records are returned, the script throws an error before writing. Sanity remains unchanged, so the public page can continue showing the last successful data.", "Calloutx"), PageBreak()]

story += section(7, "Sanity and the public website")
story += [P("Sanity separates the privileged write path from the public read path.")]
split_rows = [
    [P("PRIVATE WRITE PATH", "TableHead"), P("PUBLIC READ PATH", "TableHead")],
    [P("Runs inside GitHub Actions", "TableBody"), P("Runs in each visitor's browser", "TableBody")],
    [P("Uses SANITY_WRITE_TOKEN", "TableBody"), P("Uses no write token", "TableBody")],
    [P("Creates or replaces documents", "TableBody"), P("Queries published documents", "TableBody")],
    [P("Executes once each day", "TableBody"), P("Executes when the page is opened", "TableBody")],
]
t = Table(split_rows, colWidths=[83*mm, 83*mm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,0), LIME), ("BACKGROUND", (1,0), (1,0), PALE),
    ("BOX", (0,0), (-1,-1), .6, LINE), ("INNERGRID", (0,0), (-1,-1), .35, LINE),
    ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 7),
    ("RIGHTPADDING", (0,0), (-1,-1), 7), ("TOPPADDING", (0,0), (-1,-1), 7),
    ("BOTTOMPADDING", (0,0), (-1,-1), 7),
]))
story += [t, Spacer(1, 5*mm)]
story += [P("The GROQ query", "H2x"), P("The website asks for opportunity documents that are published and whose expiresAt value is missing or still in the future. Results are ordered newest first.")]
story += [P("The React component then provides search, location, type, domain, experience filters, and pagination. This work happens on safe, normalized records rather than three unrelated provider payloads.")]
story += [P("Current retention behavior", "H2x"), P("Expired records remain in Sanity for now, but the public query hides them. A cleanup job can delete older documents later if storage growth becomes meaningful."), PageBreak()]

story += section(8, "Operating and troubleshooting it")
story += [P("Manual run", "H2x")]
story += [bullet("Open the GitHub repository and select Actions."), bullet("Choose Sync opportunities."), bullet("Click Run workflow and select the default branch."), bullet("Open the new run and inspect the Sync step."), bullet("Confirm the log reports how many current opportunities were synced.")]
story += [P("The first production run completed successfully and published 27 opportunity documents.", "Calloutx")]
trouble = [
    [P("SYMPTOM", "TableHead"), P("LIKELY CAUSE", "TableHead"), P("FIRST CHECK", "TableHead")],
    [P("Required secrets error", "TableBody"), P("Missing or renamed secret", "TableBody"), P("Repository Actions secrets", "TableBody")],
    [P("Jooble HTTP error", "TableBody"), P("Invalid key or request limit", "TableBody"), P("Jooble account and key", "TableBody")],
    [P("Sanity 401/403", "TableBody"), P("Expired token or insufficient role", "TableBody"), P("Sanity project token permissions", "TableBody")],
    [P("Unexpected response", "TableBody"), P("Provider changed its API shape", "TableBody"), P("Provider docs and adapter function", "TableBody")],
    [P("Scheduled run missing", "TableBody"), P("Workflow absent from default branch or inactive", "TableBody"), P("Default branch and Actions tab", "TableBody")],
]
t = Table(trouble, colWidths=[43*mm, 63*mm, 60*mm], repeatRows=1)
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), PALE), ("BOX", (0,0), (-1,-1), .6, LINE),
    ("INNERGRID", (0,0), (-1,-1), .35, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story += [t, PageBreak()]

story += section(9, "Reuse this pattern for another feature")
story += [P("The same architecture works for scholarships, hackathons, coding contests, developer events, free courses, open-source issues, or technology news.")]
reuse = [
    ("1", "Choose the source", "Find an API with clear terms, stable identifiers, and acceptable usage limits."),
    ("2", "Protect access", "Store private keys as repository Actions secrets."),
    ("3", "Create an adapter", "Fetch the provider and convert its response into your schema."),
    ("4", "Validate", "Reject missing fields, invalid URLs, stale dates, and unsuitable records."),
    ("5", "Make stable IDs", "Combine source identity with a provider ID or deterministic hash."),
    ("6", "Write safely", "Create or replace documents in batches and leave existing data untouched on total failure."),
    ("7", "Schedule", "Add schedule for automation and workflow_dispatch for manual testing."),
    ("8", "Publish", "Read only safe, published records from the frontend."),
]
rows = []
for n, title, desc in reuse:
    rows.append([P(n, "Kicker"), P(f"<b>{title}</b><br/>{desc}", "Bodyx")])
t = Table(rows, colWidths=[14*mm, 152*mm])
t.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"), ("LINEBELOW", (0,0), (-1,-2), .45, LINE),
    ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 4),
]))
story += [t, Spacer(1, 5*mm), P("Remember the pattern", "H2x"), P("Scheduler -> private worker -> external APIs -> normalization -> content database -> public website", "Calloutx"), PageBreak()]

story += section(10, "Project map and references")
story += [P("Project files", "H2x")]
files = [
    (".github/workflows/sync-opportunities.yml", "Schedule, runner, permissions, secrets, and command."),
    ("scripts/sync-opportunities.mjs", "Fetch, normalize, classify, deduplicate, and save."),
    ("studio/schemaTypes/opportunity.ts", "Editable Sanity document structure."),
    ("studio/sanity.config.ts", "Registers the opportunity schema in Studio."),
    ("lib/opportunities.js", "Public GROQ query, validation, filtering, and pagination helpers."),
    ("components/opportunity-radar.jsx", "Interactive Opportunities browser UI."),
    ("app/opportunities/page.jsx", "Route and page metadata."),
]
for path, purpose in files:
    story += [P(f"<font name='MonoBold'>{path}</font><br/><font color='#5F6F61'>{purpose}</font>", "Bodyx")]
story += [Spacer(1, 3*mm), HRFlowable(width="100%", thickness=.5, color=LINE), Spacer(1, 4*mm)]
story += [P("Official references", "H2x")]
refs = [
    ("GitHub workflow triggers", "https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows"),
    ("GitHub Actions secrets", "https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets"),
    ("Sanity Mutation API", "https://www.sanity.io/docs/http-reference/mutation"),
    ("Himalayas remote jobs API", "https://himalayas.app/docs/remote-jobs-api"),
    ("Remote OK API information", "https://remoteok.com/faq"),
    ("Jooble REST API documentation", "https://jooblehelpcenter.freshdesk.com/en/support/solutions/articles/60001448238-rest-api-documentation"),
]
for label, href in refs:
    story += [P(f"<link href='{href}' color='#183125'><u>{label}</u></link>", "Bodyx")]
story += [Spacer(1, 7*mm), P("PINDARICODERS", "Kicker"), P("A useful platform is a system that keeps helping even when its founders are busy.", "Calloutx")]

doc.build(story)
print(OUT)
