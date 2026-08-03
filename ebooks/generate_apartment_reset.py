#!/usr/bin/env python3
"""Generate The 1-Hour Apartment Reset Interactive PDF for SmallSpaceHome.ca"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch, cm
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import os

# Brand colors
CREAM = HexColor("#FCFAF7")
SAGE = HexColor("#5E8259")
SAGE_LIGHT = HexColor("#8FAF8A")
BEIGE = HexColor("#C4A882")
BEIGE_DARK = HexColor("#8B6F47")
DUSTY_BLUE = HexColor("#7B9EB0")
TERRACOTTA = HexColor("#C47A5A")
CHARCOAL = HexColor("#1C1917")
WHITE = HexColor("#FFFFFF")

W, H = letter  # 612 x 792
MARGIN = 0.75 * inch
CONTENT_W = W - 2 * MARGIN

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "The_1Hour_Apartment_Reset_Interactive.pdf")


def draw_cream_bg(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def draw_header(c, text, y, size=24, color=SAGE):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", size)
    c.drawString(MARGIN, y, text)
    return y - size - 6


def draw_body(c, text, y, size=11, color=CHARCOAL, font="Helvetica", max_width=None, leading=15):
    if max_width is None:
        max_width = CONTENT_W
    style = ParagraphStyle(
        'body', fontName=font, fontSize=size, textColor=color,
        leading=leading, alignment=TA_LEFT
    )
    p = Paragraph(text, style)
    pw, ph = p.wrap(max_width, 500)
    if y - ph < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN
    p.drawOn(c, MARGIN, y - ph)
    return y - ph - 4


def draw_body_at(c, text, x, y, size=11, color=CHARCOAL, font="Helvetica", max_width=None, leading=15):
    if max_width is None:
        max_width = CONTENT_W
    style = ParagraphStyle(
        'body', fontName=font, fontSize=size, textColor=color,
        leading=leading, alignment=TA_LEFT
    )
    p = Paragraph(text, style)
    pw, ph = p.wrap(max_width, 500)
    p.drawOn(c, x, y - ph)
    return y - ph - 4


def draw_divider(c, y, color=BEIGE):
    c.setStrokeColor(color)
    c.setLineWidth(1)
    c.line(MARGIN, y, W - MARGIN, y)
    return y - 10


def draw_callout_box(c, title, text, y, bg_color, accent_color, title_color=WHITE):
    """Draw a colored callout box."""
    style = ParagraphStyle('cb', fontName="Helvetica", fontSize=10, textColor=CHARCOAL, leading=14)
    p = Paragraph(text, style)
    pw, ph = p.wrap(CONTENT_W - 30, 400)
    box_h = ph + 40
    if y - box_h < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN
    # Box background
    c.setFillColor(bg_color)
    c.roundRect(MARGIN, y - box_h, CONTENT_W, box_h, 6, fill=1, stroke=0)
    # Accent bar
    c.setFillColor(accent_color)
    c.roundRect(MARGIN, y - box_h, 6, box_h, 3, fill=1, stroke=0)
    # Title
    c.setFillColor(accent_color)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN + 15, y - 18, title)
    # Body
    p.drawOn(c, MARGIN + 15, y - box_h + 8)
    return y - box_h - 10


def add_checkbox(c, x, y, name, sz=12):
    """Add an AcroForm checkbox."""
    c.acroForm.checkbox(
        name=name, x=x, y=y - sz, size=sz,
        buttonStyle='check', borderColor=SAGE, fillColor=CREAM,
        textColor=SAGE, borderWidth=1
    )


def add_text_field(c, x, y, name, width=300, height=18):
    """Add an AcroForm text field."""
    c.acroForm.textfield(
        name=name, x=x, y=y, width=width, height=height,
        borderColor=BEIGE, fillColor=WHITE, textColor=CHARCOAL,
        borderWidth=1, fontSize=10, fontName="Helvetica"
    )


def add_radio(c, x, y, name, value, sz=12):
    c.acroForm.radio(
        name=name, value=value, x=x, y=y - sz, size=sz,
        buttonStyle='circle', borderColor=SAGE, fillColor=CREAM,
        textColor=SAGE, borderWidth=1
    )


def draw_task_block(c, y, task_name, time_str, steps, checkbox_name):
    """Draw a timed micro-action block with checkbox."""
    if y - 80 < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN
    add_checkbox(c, MARGIN, y, checkbox_name)
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN + 20, y - 11, task_name)
    c.setFillColor(TERRACOTTA)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN + 20 + c.stringWidth(task_name, "Helvetica-Bold", 11) + 10, y - 11, time_str)
    y -= 20
    for step in steps:
        y = draw_body(c, "  - " + step, y, size=10, leading=13)
    return y - 6


def draw_chapter_title_page(c, ch_num, title, time_est, subtitle=""):
    c.showPage()
    draw_cream_bg(c)
    # Chapter number
    c.setFillColor(SAGE_LIGHT)
    c.setFont("Helvetica", 14)
    c.drawCentredString(W / 2, H - 2.5 * inch, f"Chapter {ch_num}")
    # Decorative line
    c.setStrokeColor(SAGE)
    c.setLineWidth(2)
    c.line(W / 2 - 60, H - 2.7 * inch, W / 2 + 60, H - 2.7 * inch)
    # Title
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(W / 2, H - 3.3 * inch, title)
    # Time
    c.setFillColor(TERRACOTTA)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(W / 2, H - 3.8 * inch, time_est)
    if subtitle:
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 12)
        c.drawCentredString(W / 2, H - 4.3 * inch, subtitle)


def draw_before_start(c, chapter_label):
    """Before You Start self-assessment with radio buttons."""
    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "Before You Start", y, size=18)
    y = draw_body(c, f"Rate the current state of your {chapter_label} on a scale of 1 to 5:", y)
    y -= 5
    labels = ["1 - Total chaos", "2 - Pretty messy", "3 - Okay-ish", "4 - Mostly tidy", "5 - Already great"]
    for i, label in enumerate(labels):
        add_radio(c, MARGIN + 10, y, f"before_{chapter_label.replace(' ', '_')}", str(i + 1))
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 10)
        c.drawString(MARGIN + 28, y - 10, label)
        y -= 22
    y -= 10
    y = draw_body(c, f"My {chapter_label}'s biggest problem is:", y, font="Helvetica-Bold", size=11)
    add_text_field(c, MARGIN, y - 18, f"problem_{chapter_label.replace(' ', '_')}", width=CONTENT_W, height=40)
    y -= 65
    return y


def draw_end_checklist(c, y, items, prefix):
    """End-of-chapter checklist."""
    if y - (len(items) * 22 + 40) < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN
    y = draw_header(c, "Chapter Checklist", y, size=16, color=SAGE)
    y -= 5
    for i, item in enumerate(items):
        add_checkbox(c, MARGIN + 10, y, f"{prefix}_check_{i}")
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 10)
        c.drawString(MARGIN + 28, y - 10, item)
        y -= 22
    return y


def generate_pdf():
    c = canvas.Canvas(OUTPUT_FILE, pagesize=letter)
    c.setTitle("The 1-Hour Apartment Reset")
    c.setAuthor("SmallSpaceHome.ca")

    # ===================== COVER PAGE =====================
    draw_cream_bg(c)
    # Top accent bar
    c.setFillColor(SAGE)
    c.rect(0, H - 8, W, 8, fill=1, stroke=0)
    # Brand
    c.setFillColor(SAGE_LIGHT)
    c.setFont("Helvetica", 12)
    c.drawCentredString(W / 2, H - 1.5 * inch, "SmallSpaceHome.ca")
    # Title
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 34)
    c.drawCentredString(W / 2, H - 2.8 * inch, "The 1-Hour")
    c.drawCentredString(W / 2, H - 3.3 * inch, "Apartment Reset")
    # Decorative line
    c.setStrokeColor(BEIGE)
    c.setLineWidth(2)
    c.line(W / 2 - 80, H - 3.6 * inch, W / 2 + 80, H - 3.6 * inch)
    # Subtitle
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 13)
    c.drawCentredString(W / 2, H - 4.1 * inch, "A Guided, Hands-On System")
    c.drawCentredString(W / 2, H - 4.35 * inch, "for Resetting Your Space")
    # Price
    c.setFillColor(TERRACOTTA)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(W / 2, H - 5.2 * inch, "$9 CAD")
    # Bottom bar
    c.setFillColor(SAGE)
    c.rect(0, 0, W, 8, fill=1, stroke=0)

    # ===================== QUIZ PAGES =====================
    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "What's Your Reset Style?", y, size=22)
    y = draw_body(c, "Answer these 5 questions to discover your ideal reset approach. "
                     "Check the option that sounds most like you.", y)
    y -= 10

    quiz_questions = [
        ("1. When your space is messy, you usually...",
         ["A) Feel overwhelmed and want to tackle it all at once",
          "B) Pick one room and focus there until it's done",
          "C) Do a quick tidy-up every day so it never gets bad"]),
        ("2. Your ideal Saturday morning involves...",
         ["A) A big cleaning blitz with music blasting",
          "B) Methodically working through your to-do list",
          "C) A calm morning because everything's already tidy"]),
        ("3. When you buy something new, you...",
         ["A) Find a spot for it later (or never)",
          "B) Immediately designate a specific home for it",
          "C) Already have a system - one in, one out"]),
        ("4. Your junk drawer is...",
         ["A) Overflowing - what junk drawer isn't?",
          "B) Organized by category with dividers",
          "C) Barely a thing - you deal with items as they come"]),
        ("5. How do you feel about timers?",
         ["A) Love them! They create urgency",
          "B) Helpful for staying on track in each zone",
          "C) Don't need them - I do a little every day"]),
    ]

    for qi, (question, options) in enumerate(quiz_questions):
        if y < 1.5 * inch:
            c.showPage()
            draw_cream_bg(c)
            y = H - MARGIN
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN, y - 11, question)
        y -= 24
        for oi, opt in enumerate(options):
            add_checkbox(c, MARGIN + 15, y, f"quiz_q{qi}_o{oi}")
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica", 10)
            c.drawString(MARGIN + 33, y - 10, opt)
            y -= 20
        y -= 8

    # Scoring guide
    y = draw_divider(c, y)
    y = draw_header(c, "Your Reset Type", y, size=16)
    types = [
        ("Mostly A's - The Sprinter", "You love a big, energetic reset. Use the full 1-hour plan and blast through it with a timer and your favourite playlist."),
        ("Mostly B's - The Zoner", "You work best room by room. Follow the chapters in order, completing each zone fully before moving on."),
        ("Mostly C's - The Maintainer", "You prefer small daily habits. Focus on Chapter 7's daily and weekly routines to keep things consistently tidy."),
    ]
    for title, desc in types:
        c.setFillColor(SAGE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN, y - 11, title)
        y -= 16
        y = draw_body(c, desc, y, size=10)
        y -= 4

    # ===================== CHAPTER 1: INTRODUCTION =====================
    draw_chapter_title_page(c, 1, "Introduction", "The 1-Hour Reset Concept")

    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "Your Apartment Isn't Messy", y, size=20)
    y = draw_body(c, "It's just unfinished.", y, size=14, font="Helvetica-BoldOblique", color=SAGE)
    y -= 10
    y = draw_body(c, "A reset isn't about deep cleaning. It isn't about perfection. A reset is the intentional "
                     "completion of your spaces - bringing each room back to its baseline state so you can breathe, "
                     "think, and actually enjoy being home.", y)
    y -= 6
    y = draw_body(c, "In the next hour, you'll move through your apartment zone by zone, spending just the right "
                     "amount of time in each space. Every task is timed, every action is specific, and every step "
                     "brings you closer to that satisfying feeling of completion.", y)
    y -= 10

    y = draw_callout_box(c, "Do This Now", "Set a timer on your phone for 60 minutes. Put on comfortable shoes "
                            "and your favourite playlist. Grab a garbage bag and a laundry basket. You're ready.",
                         y, HexColor("#FDF0EB"), TERRACOTTA)

    y = draw_body(c, "Here's your schedule:", y, font="Helvetica-Bold", size=12)
    y -= 4
    schedule = [
        "Entryway: 15 minutes",
        "Kitchen: 20 minutes",
        "Living Room: 15 minutes",
        "Bathroom: 10 minutes",
    ]
    for s in schedule:
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 11)
        c.drawString(MARGIN + 15, y - 11, "- " + s)
        y -= 18

    y -= 10
    y = draw_callout_box(c, "Designer Tip", "The secret to a great reset is momentum. Don't stop to organize "
                            "a drawer or rearrange furniture. Just complete each task and move on. "
                            "You can always come back for the details.",
                         y, HexColor("#EDF3F6"), DUSTY_BLUE)

    # ===================== CHAPTER 2: ENTRYWAY =====================
    draw_chapter_title_page(c, 2, "Entryway", "15 Minutes", "Threshold Psychology - First Impressions Matter")

    y = draw_before_start(c, "entryway")

    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "Entryway Tasks", y, size=20)
    y = draw_body(c, "Your entryway sets the emotional tone for your entire home. In environmental psychology, this "
                     "is called threshold psychology - the first space you see when you walk in affects your mood "
                     "for the rest of the evening.", y)
    y -= 8

    y = draw_task_block(c, y, "Shoes", "(3 min)", [
        "Line up all shoes neatly or store in a shoe rack",
        "Maximum 3 pairs visible - store the rest in a closet",
        "Toss any shoes that are worn out or you haven't worn in 6 months"
    ], "entry_shoes")

    y = draw_task_block(c, y, "Coats & Bags", "(4 min)", [
        "Hang coats on hooks at 150cm (5 ft) height",
        "One coat per hook - no doubling up",
        "Move out-of-season coats to a closet"
    ], "entry_coats")

    y = draw_task_block(c, y, "Mail & Keys", "(4 min)", [
        "Create a 'landing strip' - a narrow shelf, hooks, and tray by the door",
        "Place keys in the tray immediately when you walk in",
        "Sort mail: recycle junk, file important items, action items in a stack"
    ], "entry_mail")

    y = draw_task_block(c, y, "Wipe & Sweep", "(4 min)", [
        "Wipe down any surfaces (shelf, table, mirror)",
        "Quick sweep or vacuum the entryway floor",
        "Shake out the doormat if you have one"
    ], "entry_wipe")

    y -= 6
    y = draw_callout_box(c, "Designer Tip", "The 'landing strip' concept: a narrow shelf (30-45cm deep) with "
                            "hooks above and a small tray for keys and change. This single addition can transform "
                            "a chaotic entryway into a calm transition zone.",
                         y, HexColor("#EDF3F6"), DUSTY_BLUE)

    # Before/After box
    if y - 80 < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN
    c.setFillColor(HexColor("#F0F5EE"))
    c.roundRect(MARGIN, y - 70, CONTENT_W, 70, 6, fill=1, stroke=0)
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN + 10, y - 18, "Before:")
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN + 65, y - 18, "Shoes scattered, coats piled, keys missing")
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN + 10, y - 40, "After:")
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN + 65, y - 40, "3 pairs lined up, coats hung, keys in tray, floor swept")
    y -= 80

    y = draw_end_checklist(c, y, [
        "Shoes lined up (max 3 pairs visible)",
        "Coats hung on hooks (one per hook)",
        "Landing strip set up with key tray",
        "Surfaces wiped, floor swept",
    ], "ch2")

    # ===================== CHAPTER 3: KITCHEN =====================
    draw_chapter_title_page(c, 3, "Kitchen", "20 Minutes", "The Working Triangle")

    y = draw_before_start(c, "kitchen")

    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "Kitchen Tasks", y, size=20)
    y = draw_body(c, "The kitchen is the heart of your home and usually the first place that shows clutter. "
                     "The 'working triangle' concept (sink, stove, fridge) means keeping the paths between these "
                     "three points clear and functional.", y)
    y -= 8

    y = draw_task_block(c, y, "Dishes", "(5 min)", [
        "Load dishwasher or hand-wash everything in the sink",
        "Don't let 'just a few' sit there - do them all now",
        "Dry and put away anything on the drying rack"
    ], "kitchen_dishes")

    y = draw_task_block(c, y, "Clear Paper & Mail", "(3 min)", [
        "Remove all paper, mail, and flyers from counters",
        "Recycle what you can, file the rest",
        "Counters are for cooking, not collecting"
    ], "kitchen_paper")

    y = draw_task_block(c, y, "Appliances", "(5 min)", [
        "Only daily-use items stay on the counter (kettle, coffee maker)",
        "Store everything else: toaster, blender, stand mixer",
        "If you haven't used it this week, it goes in a cabinet"
    ], "kitchen_appliances")

    if y < 2 * inch:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN

    y = draw_task_block(c, y, "Wipe Surfaces", "(4 min)", [
        "Wipe all countertops with a damp cloth",
        "Wipe stovetop and any splatter zones",
        "Quick wipe of cabinet fronts if needed"
    ], "kitchen_wipe")

    y = draw_task_block(c, y, "Quick Floor", "(3 min)", [
        "Sweep or Swiffer the main traffic areas",
        "Focus on around the stove and under the table",
        "Don't move furniture - just get the visible areas"
    ], "kitchen_floor")

    y -= 6
    y = draw_callout_box(c, "Do This Now", "Look at your kitchen counter right now. Count the items. If there are "
                            "more than 5 items that aren't daily-use, grab a box and clear them off. You can decide "
                            "where they live later.",
                         y, HexColor("#FDF0EB"), TERRACOTTA)

    y = draw_callout_box(c, "Designer Tip", "The 2-minute daily kitchen habit: After your last meal of the day, "
                            "wipe the counters and put away any items that migrated to the surfaces. "
                            "Two minutes prevents two hours of weekend cleaning.",
                         y, HexColor("#EDF3F6"), DUSTY_BLUE)

    # Before/After
    if y - 70 < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN
    c.setFillColor(HexColor("#F0F5EE"))
    c.roundRect(MARGIN, y - 70, CONTENT_W, 70, 6, fill=1, stroke=0)
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN + 10, y - 18, "Before:")
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN + 65, y - 18, "Dishes in sink, cluttered counters, crumbs on floor")
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN + 10, y - 40, "After:")
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN + 65, y - 40, "Clean sink, clear counters, swept floor, only essentials visible")
    y -= 80

    y = draw_end_checklist(c, y, [
        "All dishes washed and put away",
        "Paper and mail cleared from counters",
        "Only daily-use appliances on counter",
        "All surfaces wiped clean",
        "Floor swept in main areas",
    ], "ch3")

    # ===================== CHAPTER 4: LIVING ROOM =====================
    draw_chapter_title_page(c, 4, "Living Room", "15 Minutes", "Focal Point Hierarchy")

    y = draw_before_start(c, "living room")

    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "Living Room Tasks", y, size=20)
    y = draw_body(c, "Every room needs a focal point - the first thing your eye is drawn to when you enter. "
                     "In your living room, this might be a piece of art, a bookshelf, or a window view. "
                     "A reset clears the visual noise so your focal point can shine.", y)
    y -= 8

    y = draw_task_block(c, y, "Clear Surfaces", "(4 min)", [
        "Maximum 3 items per surface (coffee table, side tables, shelves)",
        "Remove cups, plates, wrappers, random objects",
        "The '3-item rule' creates visual calm without feeling empty"
    ], "living_surfaces")

    y = draw_task_block(c, y, "Cushions & Throws", "(3 min)", [
        "Fluff and arrange sofa cushions",
        "'Karate chop' decorative pillows for that designer look",
        "Fold throws neatly over the arm or back of the sofa"
    ], "living_cushions")

    y = draw_task_block(c, y, "Remotes & Cables", "(3 min)", [
        "Gather all remotes into one basket or tray",
        "Tuck visible cables behind furniture",
        "If you have a charging station, use it"
    ], "living_remotes")

    y = draw_task_block(c, y, "Anchor Item", "(5 min)", [
        "Identify your room's focal point / anchor piece",
        "Clear the area around it so it stands out",
        "Straighten art, adjust lighting to highlight it"
    ], "living_anchor")

    y -= 6
    y = draw_callout_box(c, "Do This Now", "Stand in your living room doorway. What's the first thing you see? "
                            "If it's clutter, you need to redefine your focal point. Clear the area around your "
                            "best piece and make it the star.",
                         y, HexColor("#FDF0EB"), TERRACOTTA)

    y = draw_callout_box(c, "Designer Tip", "The 'karate chop' pillow technique: hold the pillow upright and "
                            "give the top center a firm chop with the side of your hand. This creates a professional "
                            "indent that says 'this was placed with intention.'",
                         y, HexColor("#EDF3F6"), DUSTY_BLUE)

    if y - 70 < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN

    y = draw_end_checklist(c, y, [
        "All surfaces have 3 items or fewer",
        "Cushions fluffed, throws folded",
        "Remotes corralled, cables tucked",
        "Anchor item visible and highlighted",
    ], "ch4")

    # ===================== CHAPTER 5: BATHROOM =====================
    draw_chapter_title_page(c, 5, "Bathroom", "10 Minutes", "Minimal Counter Syndrome")

    y = draw_before_start(c, "bathroom")

    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "Bathroom Tasks", y, size=20)
    y = draw_body(c, "Bathrooms are small spaces with big visual impact. 'Minimal counter syndrome' is the idea "
                     "that fewer items on the counter makes the entire room feel cleaner and more spacious, "
                     "even if nothing else changes.", y)
    y -= 8

    y = draw_task_block(c, y, "Counter Items", "(3 min)", [
        "Maximum 3 items on the counter (soap, toothbrush holder, one more)",
        "Everything else goes in a cabinet or under the sink",
        "Wipe the counter after clearing it"
    ], "bath_counter")

    y = draw_task_block(c, y, "Under-Sink Sort", "(3 min)", [
        "Quick sort: toss expired products, empty bottles",
        "Group like items together (cleaning, hair, skin)",
        "No need to organize perfectly - just visible categories"
    ], "bath_undersink")

    y = draw_task_block(c, y, "Shower/Tub Edge", "(2 min)", [
        "Remove bottles you don't use regularly",
        "Rinse the edges and wipe away soap residue",
        "Aim for 3-4 bottles max on the shower edge"
    ], "bath_shower")

    y = draw_task_block(c, y, "Mirror & Faucet Wipe", "(2 min)", [
        "Wipe the mirror with a dry cloth or glass cleaner",
        "Polish the faucet - this one detail makes everything look cleaner",
        "Quick wipe of the toilet exterior"
    ], "bath_mirror")

    y -= 6
    y = draw_callout_box(c, "Designer Tip", "A shiny faucet is the bathroom equivalent of a made bed. "
                            "It's one small detail that tricks your brain into thinking the whole room is clean. "
                            "Always end your bathroom reset with the faucet.",
                         y, HexColor("#EDF3F6"), DUSTY_BLUE)

    if y - 80 < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN

    y = draw_end_checklist(c, y, [
        "Counter has 3 items or fewer",
        "Under-sink area sorted, expired items tossed",
        "Shower edge cleared to 3-4 bottles",
        "Mirror and faucet sparkling",
    ], "ch5")

    # ===================== CHAPTER 6: WHAT NOT TO BUY =====================
    draw_chapter_title_page(c, 6, "What Not to Buy", "Saving Money & Space")

    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "The Two-Week Wait Rule", y, size=20)
    y = draw_body(c, "Before you buy anything for your home, wait two weeks. If you still want it after 14 days, "
                     "it's probably a genuine need. Most impulse purchases fade in importance within a few days.", y)
    y -= 6
    y = draw_body(c, "Remember: 'Measure twice, buy once.' Every item you bring into your home needs a place to "
                     "live. If you can't identify that place before you buy, you don't need it yet.", y)
    y -= 10

    y = draw_callout_box(c, "Do This Now", "Think of the last thing you bought for your home. Ask yourself "
                            "the 4 questions below. Would it pass?",
                         y, HexColor("#FDF0EB"), TERRACOTTA)

    y = draw_header(c, "4 Questions Before Buying", y, size=16)
    y -= 4
    questions = [
        "1. Do I actually need this, or do I just want it right now?",
        "2. Where exactly will this live in my home?",
        "3. Do I already own something that does the same thing?",
        "4. Will I still want this in 6 months?",
    ]
    for q in questions:
        add_checkbox(c, MARGIN + 10, y, f"buy_q_{questions.index(q)}")
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 11)
        c.drawString(MARGIN + 28, y - 11, q)
        y -= 26

    y -= 10
    y = draw_body(c, "My most recent impulse purchase was:", y, font="Helvetica-Bold")
    add_text_field(c, MARGIN, y - 18, "impulse_purchase", width=CONTENT_W, height=20)
    y -= 45
    y = draw_body(c, "Did it pass all 4 questions?", y, font="Helvetica-Bold")
    add_text_field(c, MARGIN, y - 18, "impulse_verdict", width=CONTENT_W, height=20)
    y -= 45

    y = draw_callout_box(c, "Designer Tip", "The best-designed small spaces have fewer, better things. "
                            "Instead of buying 5 cheap organizers, invest in one beautiful piece that "
                            "serves multiple purposes. Quality over quantity, always.",
                         y, HexColor("#EDF3F6"), DUSTY_BLUE)

    # ===================== CHAPTER 7: KEEPING IT RESET =====================
    draw_chapter_title_page(c, 7, "Keeping It Reset", "Building Lasting Habits")

    c.showPage()
    draw_cream_bg(c)
    y = H - MARGIN
    y = draw_header(c, "The Maintenance System", y, size=20)
    y = draw_body(c, "A reset is powerful, but it's temporary. The real magic happens when you build tiny habits "
                     "that keep your space consistently reset. Here are four levels of maintenance:", y)
    y -= 10

    # Daily
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, y - 14, "Daily: The 2-Minute Habit")
    y -= 24
    y = draw_body(c, "After your last meal or task of the day, spend 2 minutes doing a quick wipe-and-clear. "
                     "Wipe kitchen counters, put away anything that migrated from its home, and do a visual scan "
                     "of each room. That's it. Two minutes.", y)
    y -= 10

    # Weekly
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, y - 14, "Weekly: The 10-Minute Tune-Up")
    y -= 24
    y = draw_body(c, "Pick one day a week (Sunday evening works well). Set a 10-minute timer and do a quick pass "
                     "through your entire apartment. Hit any area that's drifted from its reset state. "
                     "This prevents the slow creep of clutter.", y)
    y -= 10

    # Seasonal
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, y - 14, "Seasonal: The Deep Reset")
    y -= 24
    y = draw_body(c, "Four times a year, do a deeper version of the 1-hour reset. This time, open drawers, "
                     "sort through cabinets, and reassess what you own. Donate, recycle, or discard anything "
                     "that no longer serves you.", y)
    y -= 10

    # Trigger
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, y - 14, "Trigger Reset: When Stress Hits")
    y -= 24
    y = draw_body(c, "Feeling overwhelmed? Reset one zone. Just one. The act of completing a small space can "
                     "shift your entire mental state. Your entryway or bathroom are great trigger-reset zones "
                     "because they're small and quick.", y)
    y -= 10

    y = draw_callout_box(c, "Do This Now", "Choose your daily reset time. Write it here and set a recurring "
                            "reminder on your phone.",
                         y, HexColor("#FDF0EB"), TERRACOTTA)

    y = draw_body(c, "My daily 2-minute reset time:", y, font="Helvetica-Bold")
    add_text_field(c, MARGIN, y - 18, "daily_reset_time", width=200, height=20)
    y -= 45

    y = draw_body(c, "My weekly tune-up day:", y, font="Helvetica-Bold")
    add_text_field(c, MARGIN, y - 18, "weekly_day", width=200, height=20)
    y -= 45

    if y - 120 < MARGIN:
        c.showPage()
        draw_cream_bg(c)
        y = H - MARGIN

    y = draw_end_checklist(c, y, [
        "Daily 2-minute habit time chosen and reminder set",
        "Weekly tune-up day selected",
        "Seasonal deep reset dates planned",
        "Trigger reset zone identified",
    ], "ch7")

    # ===================== COMPLETION PAGE =====================
    c.showPage()
    draw_cream_bg(c)

    # Celebration header
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(W / 2, H - 2 * inch, "You Did It!")
    c.setStrokeColor(TERRACOTTA)
    c.setLineWidth(2)
    c.line(W / 2 - 60, H - 2.2 * inch, W / 2 + 60, H - 2.2 * inch)

    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 13)
    c.drawCentredString(W / 2, H - 2.6 * inch, "Your apartment is reset. Take a breath. Look around.")
    c.drawCentredString(W / 2, H - 2.85 * inch, "You earned this moment of calm.")

    y = H - 3.3 * inch

    # Total time tracker
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, y, "Total time it took me:")
    add_text_field(c, MARGIN + 170, y - 3, "total_time", width=150, height=20)
    y -= 40

    # Before vs After
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, y, "My Reset Score")
    y -= 25
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN, y, "Before (1-10):")
    add_text_field(c, MARGIN + 100, y - 3, "score_before", width=60, height=20)
    c.drawString(MARGIN + 200, y, "After (1-10):")
    add_text_field(c, MARGIN + 290, y - 3, "score_after", width=60, height=20)
    y -= 40

    # Next reset date
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, y, "My Next Reset Date:")
    add_text_field(c, MARGIN + 160, y - 3, "next_reset_date", width=200, height=20)
    y -= 50

    # Share
    c.setFillColor(HexColor("#F0F5EE"))
    c.roundRect(MARGIN, y - 60, CONTENT_W, 60, 8, fill=1, stroke=0)
    c.setFillColor(SAGE)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(W / 2, y - 25, "Share your reset with #SmallSpaceReset")
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    c.drawCentredString(W / 2, y - 45, "Tag @SmallSpaceHome on social media - we'd love to see your space!")

    y -= 90
    # Brand footer
    c.setFillColor(BEIGE_DARK)
    c.setFont("Helvetica", 10)
    c.drawCentredString(W / 2, y, "SmallSpaceHome.ca")
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, y - 16, "Thank you for choosing to live intentionally in your small space.")

    # Bottom accent bar
    c.setFillColor(SAGE)
    c.rect(0, 0, W, 8, fill=1, stroke=0)

    c.save()
    print(f"PDF generated: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_pdf()
