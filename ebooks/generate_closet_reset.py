#!/usr/bin/env python3
"""Generate The Closet & Wardrobe Reset Interactive PDF for SmallSpaceHome.ca"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

# Brand colors
CREAM = HexColor("#FCFAF7")
SAGE = HexColor("#8FAF8A")
SAGE_DARK = HexColor("#5E8259")
BEIGE = HexColor("#C4A882")
BEIGE_DARK = HexColor("#8B6F47")
DUSTY_BLUE = HexColor("#7B9EB0")
TERRACOTTA = HexColor("#C47A5A")
CHARCOAL = HexColor("#1C1917")
WHITE = HexColor("#FFFFFF")

W, H = letter
MARGIN = 0.75 * inch
CONTENT_W = W - 2 * MARGIN


def new_page(c):
    c.showPage()
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)


class PDFBuilder:
    def __init__(self, filename):
        self.c = canvas.Canvas(filename, pagesize=letter)
        self.c.setTitle("The Closet & Wardrobe Reset")
        self.c.setAuthor("SmallSpaceHome.ca")
        self.y = H - MARGIN
        self.page_num = 0
        self.form = self.c.acroForm
        self._field_counter = 0
        # Init first page bg
        self.c.setFillColor(CREAM)
        self.c.rect(0, 0, W, H, fill=1, stroke=0)

    def _field_name(self, prefix="field"):
        self._field_counter += 1
        return f"{prefix}_{self._field_counter}"

    def check_space(self, needed=100):
        if self.y < MARGIN + needed:
            self.next_page()

    def next_page(self):
        self.page_num += 1
        # Footer on current page
        self.c.setFillColor(SAGE)
        self.c.setFont("Helvetica", 8)
        self.c.drawCentredString(W / 2, 0.4 * inch, f"SmallSpaceHome.ca  |  The Closet & Wardrobe Reset  |  Page {self.page_num}")
        new_page(self.c)
        self.y = H - MARGIN

    def title_text(self, text, size=24, color=SAGE_DARK, font="Helvetica-Bold"):
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        self.c.drawString(MARGIN, self.y, text)
        self.y -= size + 8

    def body_text(self, text, size=11, color=CHARCOAL, font="Helvetica", max_width=None, indent=0):
        if max_width is None:
            max_width = CONTENT_W - indent
        style = ParagraphStyle("body", fontName=font, fontSize=size, leading=size + 4,
                               textColor=color, alignment=TA_LEFT)
        p = Paragraph(text, style)
        pw, ph = p.wrap(max_width, 999)
        if self.y - ph < MARGIN:
            self.next_page()
        p.drawOn(self.c, MARGIN + indent, self.y - ph)
        self.y -= ph + 4
        return ph

    def spacer(self, h=12):
        self.y -= h

    def h_line(self, color=BEIGE, thickness=1):
        self.c.setStrokeColor(color)
        self.c.setLineWidth(thickness)
        self.c.line(MARGIN, self.y, W - MARGIN, self.y)
        self.y -= 8

    def checkbox(self, label, size=11):
        self.check_space(20)
        self.form.checkbox(
            name=self._field_name("cb"),
            x=MARGIN, y=self.y - 3,
            size=12,
            borderColor=SAGE_DARK, fillColor=CREAM,
            buttonStyle="check", relative=False
        )
        self.c.setFont("Helvetica", size)
        self.c.setFillColor(CHARCOAL)
        self.c.drawString(MARGIN + 20, self.y, label)
        self.y -= size + 8

    def radio_group(self, group_name, options):
        for i, opt in enumerate(options):
            self.check_space(20)
            self.form.radio(
                name=group_name,
                value=f"opt{i}",
                x=MARGIN + 10, y=self.y - 3,
                size=12,
                borderColor=SAGE_DARK, fillColor=CREAM,
                buttonStyle="circle", relative=False
            )
            self.c.setFont("Helvetica", 11)
            self.c.setFillColor(CHARCOAL)
            self.c.drawString(MARGIN + 28, self.y, opt)
            self.y -= 19

    def text_field(self, label, width=None, height=20):
        self.check_space(40)
        if width is None:
            width = CONTENT_W
        self.c.setFont("Helvetica", 10)
        self.c.setFillColor(CHARCOAL)
        self.c.drawString(MARGIN, self.y, label)
        self.y -= 16
        self.form.textfield(
            name=self._field_name("tf"),
            x=MARGIN, y=self.y - height + 4,
            width=width, height=height,
            borderColor=BEIGE_DARK, fillColor=WHITE,
            fontSize=10, relative=False
        )
        self.y -= height + 8

    def action_block(self, title, steps):
        """Terracotta 'Do This Now' block."""
        # Calculate height needed
        line_h = 18
        block_h = 36 + len(steps) * line_h + 12
        self.check_space(block_h + 10)

        self.c.setFillColor(TERRACOTTA)
        self.c.roundRect(MARGIN, self.y - block_h, CONTENT_W, block_h, 6, fill=1, stroke=0)

        self.c.setFont("Helvetica-Bold", 13)
        self.c.setFillColor(WHITE)
        self.c.drawString(MARGIN + 14, self.y - 22, "DO THIS NOW: " + title)

        ty = self.y - 42
        self.c.setFont("Helvetica", 10)
        for step in steps:
            self.c.drawString(MARGIN + 14, ty, step)
            ty -= line_h

        self.y -= block_h + 10

    def tip_box(self, text):
        """Sage green tip callout."""
        style = ParagraphStyle("tip", fontName="Helvetica-Oblique", fontSize=10,
                               leading=14, textColor=SAGE_DARK)
        p = Paragraph(text, style)
        pw, ph = p.wrap(CONTENT_W - 30, 999)
        box_h = ph + 20
        self.check_space(box_h + 10)

        self.c.setFillColor(HexColor("#E8F0E6"))
        self.c.roundRect(MARGIN, self.y - box_h, CONTENT_W, box_h, 6, fill=1, stroke=0)
        self.c.setStrokeColor(SAGE)
        self.c.setLineWidth(2)
        self.c.line(MARGIN + 4, self.y - 4, MARGIN + 4, self.y - box_h + 4)

        p.drawOn(self.c, MARGIN + 16, self.y - box_h + 10)
        self.y -= box_h + 10

    def rating_scale(self, label):
        self.check_space(30)
        self.c.setFont("Helvetica", 10)
        self.c.setFillColor(CHARCOAL)
        self.c.drawString(MARGIN, self.y, label)
        self.y -= 16
        group = self._field_name("rating")
        for i in range(1, 6):
            x = MARGIN + (i - 1) * 50
            self.form.radio(
                name=group, value=str(i),
                x=x, y=self.y - 2,
                size=12, borderColor=SAGE_DARK, fillColor=CREAM,
                buttonStyle="circle", relative=False
            )
            self.c.drawString(x + 16, self.y, str(i))
        self.y -= 22

    def chapter_header(self, num, title, time_est):
        self.next_page()
        # Sage banner
        self.c.setFillColor(SAGE_DARK)
        self.c.roundRect(MARGIN, self.y - 50, CONTENT_W, 50, 8, fill=1, stroke=0)
        self.c.setFont("Helvetica-Bold", 20)
        self.c.setFillColor(WHITE)
        self.c.drawString(MARGIN + 16, self.y - 34, f"Chapter {num}: {title}")
        self.c.setFont("Helvetica", 10)
        self.c.drawRightString(W - MARGIN - 14, self.y - 34, f"Est. {time_est}")
        self.y -= 70

    def before_after(self, before_items, after_items):
        self.check_space(80)
        col_w = CONTENT_W / 2 - 6
        # Before col
        self.c.setFillColor(HexColor("#F0E6E0"))
        self.c.roundRect(MARGIN, self.y - 70, col_w, 70, 4, fill=1, stroke=0)
        self.c.setFont("Helvetica-Bold", 11)
        self.c.setFillColor(TERRACOTTA)
        self.c.drawString(MARGIN + 8, self.y - 16, "BEFORE")
        self.c.setFont("Helvetica", 9)
        self.c.setFillColor(CHARCOAL)
        ty = self.y - 32
        for item in before_items[:3]:
            self.c.drawString(MARGIN + 8, ty, "- " + item)
            ty -= 13

        # After col
        ax = MARGIN + col_w + 12
        self.c.setFillColor(HexColor("#E8F0E6"))
        self.c.roundRect(ax, self.y - 70, col_w, 70, 4, fill=1, stroke=0)
        self.c.setFont("Helvetica-Bold", 11)
        self.c.setFillColor(SAGE_DARK)
        self.c.drawString(ax + 8, self.y - 16, "AFTER")
        self.c.setFont("Helvetica", 9)
        self.c.setFillColor(CHARCOAL)
        ty = self.y - 32
        for item in after_items[:3]:
            self.c.drawString(ax + 8, ty, "- " + item)
            ty -= 13

        self.y -= 80

    def end_of_chapter_checklist(self, items):
        self.check_space(30 + len(items) * 20)
        self.spacer(6)
        self.h_line(SAGE)
        self.c.setFont("Helvetica-Bold", 12)
        self.c.setFillColor(SAGE_DARK)
        self.c.drawString(MARGIN, self.y, "End-of-Chapter Checklist")
        self.y -= 20
        for item in items:
            self.checkbox(item, size=10)

    def save(self):
        # Final footer
        self.page_num += 1
        self.c.setFillColor(SAGE)
        self.c.setFont("Helvetica", 8)
        self.c.drawCentredString(W / 2, 0.4 * inch, f"SmallSpaceHome.ca  |  The Closet & Wardrobe Reset  |  Page {self.page_num}")
        self.c.save()


def build_pdf(path):
    b = PDFBuilder(path)

    # ── COVER PAGE ──
    b.c.setFillColor(SAGE_DARK)
    b.c.rect(0, H / 2, W, H / 2, fill=1, stroke=0)
    b.c.setFillColor(CREAM)
    b.c.rect(0, 0, W, H / 2, fill=1, stroke=0)

    # Decorative line
    b.c.setStrokeColor(BEIGE)
    b.c.setLineWidth(3)
    b.c.line(MARGIN, H / 2, W - MARGIN, H / 2)

    b.c.setFont("Helvetica-Bold", 36)
    b.c.setFillColor(WHITE)
    b.c.drawCentredString(W / 2, H - 2.2 * inch, "The Closet &")
    b.c.drawCentredString(W / 2, H - 2.8 * inch, "Wardrobe Reset")

    b.c.setFont("Helvetica", 16)
    b.c.setFillColor(BEIGE)
    b.c.drawCentredString(W / 2, H - 3.4 * inch, "Your Complete Interactive Guide")

    b.c.setFont("Helvetica-Bold", 14)
    b.c.setFillColor(SAGE_DARK)
    b.c.drawCentredString(W / 2, 2.8 * inch, "SmallSpaceHome.ca")

    b.c.setFont("Helvetica", 12)
    b.c.setFillColor(BEIGE_DARK)
    b.c.drawCentredString(W / 2, 2.4 * inch, "$9 CAD")

    b.c.setFont("Helvetica", 10)
    b.c.setFillColor(CHARCOAL)
    b.c.drawCentredString(W / 2, 1.6 * inch, "12 Chapters  |  Interactive Worksheets  |  Checklists & Trackers")

    # ── TABLE OF CONTENTS ──
    b.next_page()
    b.title_text("Table of Contents", 22)
    b.spacer(8)
    chapters = [
        ("1", "The Full Empty - Part 1: Clear It All Out", "30 min"),
        ("2", "The Full Empty - Part 2: Sort & Decide", "45 min"),
        ("3", "The Fold", "20 min"),
        ("4", "The Hanger System", "25 min"),
        ("5", "Color Organization", "20 min"),
        ("6", "Shoe Storage", "25 min"),
        ("7", "Accessories", "20 min"),
        ("8", "Seasonal Swap", "45 min"),
        ("9", "Laundry System", "15 min"),
        ("10", "Drawer System", "25 min"),
        ("11", "Maintenance Habit", "10 min"),
        ("12", "The Mindful Wardrobe", "15 min"),
    ]
    for num, title, time in chapters:
        b.c.setFont("Helvetica", 11)
        b.c.setFillColor(CHARCOAL)
        b.c.drawString(MARGIN, b.y, f"Chapter {num}")
        b.c.drawString(MARGIN + 70, b.y, title)
        b.c.setFillColor(SAGE)
        b.c.drawRightString(W - MARGIN, b.y, time)
        b.y -= 20

    b.spacer(10)
    b.c.setFont("Helvetica", 11)
    b.c.setFillColor(CHARCOAL)
    b.c.drawString(MARGIN, b.y, "Closet Personality Quiz")
    b.y -= 20
    b.c.drawString(MARGIN, b.y, "Wardrobe Inventory Worksheet")
    b.y -= 20
    b.c.drawString(MARGIN, b.y, "Completion & Celebration Page")
    b.y -= 20

    # ── CLOSET PERSONALITY QUIZ ──
    b.next_page()
    b.title_text("What's Your Closet Personality?", 20, DUSTY_BLUE)
    b.body_text("Answer these 5 questions to discover your organizing style. Check the answer that best describes you.")
    b.spacer(8)

    quiz = [
        ("1. When you open your closet, you usually feel...",
         ["Overwhelmed - there's so much stuff!", "Calm - I know where everything is",
          "Excited - so many outfit options for the season"]),
        ("2. How often do you shop for new clothes?",
         ["Weekly or more - I love a good deal", "A few times a year - only what I need",
          "Seasonally - I plan my wardrobe by season"]),
        ("3. How many items are in your closet right now?",
         ["100+ (honestly, I've lost count)", "Under 40 - I keep it lean",
          "50-80, rotated by season"]),
        ("4. What does your 'donate' pile look like?",
         ["What donate pile? I might need it someday!", "I donate regularly - minimalism is key",
          "I swap items in and out with the seasons"]),
        ("5. Your ideal closet looks like...",
         ["Full and colorful - options for every occasion", "Streamlined - a curated capsule wardrobe",
          "Organized by season with off-season items stored away"]),
    ]

    for q, opts in quiz:
        b.check_space(100)
        b.body_text(f"<b>{q}</b>", size=11)
        b.spacer(2)
        for opt in opts:
            b.checkbox(opt, size=10)
        b.spacer(6)

    b.check_space(100)
    b.h_line(DUSTY_BLUE)
    b.title_text("Your Results", 14, DUSTY_BLUE)
    b.body_text("<b>Mostly first answers:</b> You're <b>The Collector</b> - you keep everything 'just in case.' This book will help you let go with confidence.")
    b.body_text("<b>Mostly second answers:</b> You're <b>The Capsule Convert</b> - you love minimalism. This book will refine your system further.")
    b.body_text("<b>Mostly third answers:</b> You're <b>The Seasonal Rotator</b> - you're organized by season. This book will optimize your rotation process.")
    b.spacer(8)
    b.text_field("My closet personality type:")

    # ── CHAPTER 1 ──
    b.chapter_header(1, "The Full Empty - Part 1", "30 min")
    b.rating_scale("Rate your current closet chaos (1=zen, 5=disaster):")
    b.spacer(6)
    b.body_text("It starts with nothing. Before you can build the closet you want, you need to see the closet you have - and that means taking <b>everything</b> out.")
    b.spacer(4)

    b.action_block("Empty Your Closet", [
        "1. Clear your bed or a large floor area (5 min)",
        "2. Remove EVERY item from your closet - shelves, floor, all of it (15 min)",
        "3. Wipe down all shelves and vacuum the floor (5 min)",
        "4. Stand back and look at the empty space. This is your blank canvas.",
    ])

    b.tip_box("TIP: Take a photo of your empty closet now. You'll want this 'before' shot later!")

    b.text_field("How many items did you pull out? (estimate):")
    b.text_field("How does it feel seeing your closet empty?")

    b.before_after(
        ["Overflowing, can't find anything", "Items falling off hangers", "Floor covered in shoes"],
        ["Completely empty and clean", "Fresh start feeling", "Can see full space potential"]
    )

    b.end_of_chapter_checklist([
        "Removed every item from closet",
        "Cleaned shelves, rod, and floor",
        "Took a 'before' photo",
        "Counted approximate items",
    ])

    # ── CHAPTER 2 ──
    b.chapter_header(2, "The Full Empty - Part 2: Sort", "45 min")
    b.rating_scale("How confident are you about letting go of items? (1=hard, 5=easy):")
    b.spacer(4)
    b.body_text("Now that everything is out, it's time to sort. You need <b>four</b> piles (or bags): <b>Keep, Donate, Trash, and Maybe</b>.")
    b.spacer(4)

    b.action_block("The Four-Pile Sort", [
        "1. Set up 4 clearly labeled bags or zones (2 min)",
        "2. Pick up each item ONE at a time (no skipping!)",
        "3. KEEP: fits, worn in last 6 months, makes you feel good",
        "4. DONATE: doesn't fit, hasn't been worn, not your style",
        "5. TRASH: stained, torn, worn out beyond repair",
        "6. MAYBE: can't decide - into the Maybe Box (30 min)",
    ])

    b.tip_box("THE MAYBE BOX RULE: Seal your Maybe box and store it somewhere out of sight. Set a reminder for 30 days. If you haven't opened it, donate everything inside - unopened.")

    b.text_field("Items I'm letting go of (write them to commit):")
    b.text_field("Items in my Maybe box:")

    b.check_space(60)
    b.body_text("<b>Sort Results:</b>", size=12)
    b.text_field("Keep count:", width=200)
    b.text_field("Donate count:", width=200)
    b.text_field("Trash count:", width=200)
    b.text_field("Maybe count:", width=200)

    b.end_of_chapter_checklist([
        "Sorted all items into 4 piles",
        "Made decisions without overthinking",
        "Sealed the Maybe box with a date",
        "Bagged donations for drop-off",
        "Trashed worn-out items immediately",
    ])

    # ── CHAPTER 3 ──
    b.chapter_header(3, "The Fold", "20 min")
    b.rating_scale("How would you rate your current folding skills? (1=pile, 5=pro):")
    b.spacer(4)
    b.body_text("File folding transforms your drawers from messy piles into organized, visible rows. Every item stands upright so you can see it at a glance.")

    b.spacer(4)
    b.body_text("<b>The 4-Step File Fold Method:</b>", size=12)
    b.checkbox("Step 1: Fold in half lengthwise (left side over right)")
    b.checkbox("Step 2: Fold sleeves back (tuck behind the body)")
    b.checkbox("Step 3: Fold bottom up (hem meets collar)")
    b.checkbox("Step 4: Fold in thirds (creates a compact rectangle)")
    b.spacer(4)

    b.action_block("Practice File Folding", [
        "1. Grab 5 t-shirts from your Keep pile (2 min)",
        "2. Practice the 4-step fold on each one (5 min)",
        "3. Stand them upright in a drawer - can you see each one? (3 min)",
        "4. Now fold all your Keep tops this way (10 min)",
    ])

    b.tip_box("VERTICAL STACKING is the key: items stand upright like files in a filing cabinet. No more digging through piles to find what you need.")

    b.before_after(
        ["Stacked horizontally in piles", "Can only see top item", "Wrinkled from digging"],
        ["Filed vertically like books", "Every item visible at once", "Stays neat between uses"]
    )

    b.end_of_chapter_checklist([
        "Learned the 4-step file fold",
        "Practiced on 5 items",
        "Re-folded all Keep items using file fold",
        "Stored items vertically in drawers",
    ])

    # ── CHAPTER 4 ──
    b.chapter_header(4, "The Hanger System", "25 min")
    b.rating_scale("Rate your current hanger situation (1=chaos, 5=uniform):")
    b.spacer(4)
    b.body_text("Switching to <b>slim velvet hangers</b> ($15-25 for a 50-pack) can save up to <b>50% of your hanging space</b>. They grip fabric so nothing slips off.")

    b.action_block("Upgrade Your Hangers", [
        "1. Count your current hanging items",
        "2. Order slim velvet hangers (1 pack of 50 covers most closets)",
        "3. Transfer all items to new hangers",
        "4. Recycle or donate old hangers",
    ])

    b.spacer(4)
    b.body_text("<b>The Reverse Hanger Trick:</b>", size=12)
    b.body_text("Hang all clothes with the hanger hook facing <b>backwards</b> (away from you). Each time you wear something, turn the hanger the normal way. After <b>6 months</b>, any item still on a backwards hanger hasn't been worn - donate it.")

    b.tip_box("Set a calendar reminder 6 months from today for your Reverse Hanger Check. Write the start date below!")

    b.text_field("Reverse hanger trick start date:")
    b.text_field("6-month check date:")
    b.text_field("Number of hanging items:")

    b.end_of_chapter_checklist([
        "Switched to slim velvet hangers",
        "Reversed all hangers to face backwards",
        "Set 6-month reminder",
        "Recycled old hangers",
    ])

    # ── CHAPTER 5 ──
    b.chapter_header(5, "Color Organization", "20 min")
    b.rating_scale("How visually organized is your closet? (1=random, 5=curated):")
    b.spacer(4)
    b.body_text("Organize by <b>category first</b>, then by <b>color within each category</b> using rainbow order: whites, creams, pastels, brights, darks.")

    b.action_block("Color Sort Your Closet", [
        "1. Group hanging items by category (tops, pants, dresses) (5 min)",
        "2. Within each group, arrange: whites > creams > pastels > brights > darks (10 min)",
        "3. Step back and admire - it should look like a gradient (1 min)",
        "4. Take an 'after' photo! (1 min)",
    ])

    b.tip_box("Monthly reorder takes only 5 minutes. Add it to your calendar on the 1st of each month.")

    b.text_field("My dominant closet colors:")
    b.text_field("Colors I'm missing / want to add:")

    b.end_of_chapter_checklist([
        "Grouped items by category",
        "Arranged each category in rainbow order",
        "Set monthly reorder reminder",
        "Took an 'after' photo",
    ])

    # ── CHAPTER 6 ──
    b.chapter_header(6, "Shoe Storage", "25 min")
    b.rating_scale("Rate your shoe situation (1=piled up, 5=organized):")
    b.spacer(4)
    b.body_text("The rule: <b>15 pairs maximum</b>. That covers all your needs - everyday, work, athletic, dressy, seasonal. Apply the <b>one-in-one-out</b> rule for every new purchase.")

    b.text_field("Current shoe count:")
    b.text_field("Shoes to donate/trash:")

    b.action_block("Organize Your Shoes", [
        "1. Pull out all shoes and count them (5 min)",
        "2. Edit down to 15 pairs max (10 min)",
        "3. Choose your storage: clear boxes, over-door rack, or shelf (5 min)",
        "4. Arrange by frequency of use - most worn = most accessible (5 min)",
    ])

    b.tip_box("HEEL TRICK: Add a tension rod to a shelf and hang heels from it by hooking the heel over the rod. Doubles your shelf space!")

    b.before_after(
        ["Shoes piled on floor", "Can't find matching pairs", "30+ pairs, half unworn"],
        ["15 pairs in clear boxes or rack", "Every pair visible and matched", "One-in-one-out maintained"]
    )

    b.end_of_chapter_checklist([
        "Counted all shoes",
        "Edited down to 15 pairs or fewer",
        "Chose and set up storage solution",
        "Committed to one-in-one-out rule",
    ])

    # ── CHAPTER 7 ──
    b.chapter_header(7, "Accessories", "20 min")
    b.rating_scale("How organized are your accessories? (1=tangled mess, 5=tidy):")
    b.spacer(4)
    b.body_text("Accessories need designated homes. Here's the system:")
    b.spacer(2)
    b.body_text("- <b>Belts & scarves:</b> Hooks on inside of closet door")
    b.body_text("- <b>Jewelry:</b> Tray on dresser top (not tangled in a box)")
    b.body_text("- <b>Bags:</b> Stored upright on a shelf (stuff with tissue to hold shape)")
    b.spacer(4)

    b.action_block("Accessory Audit", [
        "1. Gather ALL accessories from everywhere in your home (5 min)",
        "2. Sort: keep only items worn in the last 3 months (5 min)",
        "3. Install hooks, set up tray, arrange bags (10 min)",
    ])

    b.tip_box("QUARTERLY DECLUTTER: Set reminders for Jan, Apr, Jul, Oct to edit accessories. They multiply quietly!")

    b.text_field("Accessories I'm donating:")

    b.end_of_chapter_checklist([
        "Gathered all accessories",
        "Set up hooks for belts/scarves",
        "Created jewelry tray system",
        "Stored bags upright",
        "Set quarterly declutter reminders",
    ])

    # ── CHAPTER 8 ──
    b.chapter_header(8, "Seasonal Swap", "45 min")
    b.rating_scale("How smooth is your seasonal transition? (1=chaotic, 5=seamless):")
    b.spacer(4)
    b.body_text("Twice a year (spring and fall), do a full seasonal swap. Follow this 6-step checklist:")

    b.spacer(4)
    b.body_text("<b>The 6-Step Seasonal Swap:</b>", size=12)
    b.checkbox("1. Assess: What worked this season? What went unworn?")
    b.checkbox("2. Wash everything before storing (prevents stains setting)")
    b.checkbox("3. Fold and store off-season items in labeled bins")
    b.checkbox("4. Bring forward next season's items")
    b.checkbox("5. Edit the new season - does everything still fit and feel good?")
    b.checkbox("6. Donate anything that didn't pass the edit")

    b.action_block("Plan Your Next Swap", [
        "1. Check today's date - when is your next swap? (1 min)",
        "2. Block 2 hours on your calendar for the swap (1 min)",
        "3. Get storage bins ready (labeled!) (5 min)",
    ])

    b.text_field("Next seasonal swap date:")
    b.text_field("Items going into off-season storage:")

    b.end_of_chapter_checklist([
        "Identified next swap date",
        "Blocked calendar time",
        "Have labeled storage bins",
        "Completed 6-step swap (or planned it)",
    ])

    # ── CHAPTER 9 ──
    b.chapter_header(9, "Laundry System", "15 min")
    b.rating_scale("Rate your laundry routine (1=mountain, 5=on top of it):")
    b.spacer(4)
    b.body_text("A good closet system falls apart without a good laundry system. Here are the essentials:")

    b.spacer(2)
    b.body_text("- <b>'Wear again' hook:</b> Items worn once that don't need washing yet. Keeps them off the floor and out of the hamper.")
    b.body_text("- <b>Two hampers:</b> One for lights, one for darks. Pre-sorted = faster laundry day.")
    b.body_text("- <b>One load per week:</b> Don't let it pile up. Schedule a specific day.")
    b.body_text("- <b>Fold immediately:</b> As soon as the dryer stops. No 'chair pile.'")

    b.action_block("Set Up Your Laundry System", [
        "1. Install a 'wear again' hook near your closet (5 min)",
        "2. Set up two hampers - label them lights/darks (3 min)",
        "3. Pick your laundry day and add it to your calendar (2 min)",
        "4. Commit: fold within 10 minutes of the dryer stopping",
    ])

    b.text_field("My laundry day:")
    b.tip_box("The 'wear again' hook is a game-changer. Jeans, sweaters, and jackets often don't need washing after one wear. This also extends the life of your clothes.")

    b.end_of_chapter_checklist([
        "Installed wear-again hook",
        "Set up two hampers (lights/darks)",
        "Chose a weekly laundry day",
        "Committed to fold-immediately rule",
    ])

    # ── CHAPTER 10 ──
    b.chapter_header(10, "Drawer System", "25 min")
    b.rating_scale("How functional are your drawers? (1=junk drawers, 5=organized):")
    b.spacer(4)
    b.body_text("Organize drawers <b>top-to-bottom by frequency</b>: items you use daily go in the top drawer, less-used items lower.")

    b.spacer(2)
    b.body_text("<b>Zone System:</b>", size=12)
    b.body_text("- <b>Top drawer:</b> Underwear, socks (daily essentials)")
    b.body_text("- <b>Second drawer:</b> T-shirts, casual tops")
    b.body_text("- <b>Third drawer:</b> Pants, shorts, loungewear")
    b.body_text("- <b>Bottom drawer:</b> Workout gear, seasonal items")

    b.action_block("Reorganize Your Drawers", [
        "1. Empty all drawers (5 min)",
        "2. Sort by frequency of use (5 min)",
        "3. Make dividers from cardboard boxes (free!) (5 min)",
        "4. File-fold everything and place by zone (10 min)",
    ])

    b.tip_box("FREE DIVIDER HACK: Cut cereal boxes, shoe boxes, or shipping boxes to create custom drawer dividers. Measure your drawer depth first!")

    b.text_field("My drawer zone plan:")

    b.end_of_chapter_checklist([
        "Emptied and cleaned all drawers",
        "Assigned zones by frequency",
        "Created dividers (cardboard or purchased)",
        "File-folded all items into zones",
    ])

    # ── CHAPTER 11 ──
    b.chapter_header(11, "Maintenance Habit", "10 min")
    b.rating_scale("How consistent are your maintenance habits? (1=none, 5=routine):")
    b.spacer(4)
    b.body_text("All of your hard work means nothing without maintenance. Here's how to keep it going:")

    b.spacer(2)
    b.body_text("<b>The One-In-One-Out Rule:</b> Every time you bring a new item in, one item must leave. No exceptions.", size=11)
    b.spacer(4)
    b.body_text("<b>Weekly 10-Minute Reset (4 Steps):</b>", size=12)
    b.checkbox("1. Quick scan: anything out of place?")
    b.checkbox("2. Rehang anything that slipped off hangers")
    b.checkbox("3. Refold any items that came unfolded")
    b.checkbox("4. Floor check: nothing on the closet floor that shouldn't be")

    b.action_block("Schedule Your Reset", [
        "1. Pick a day and time for your weekly 10-min reset",
        "2. Set a recurring calendar reminder",
        "3. Do your first reset right now!",
    ])

    b.text_field("My weekly reset day and time:")
    b.tip_box("Pair your reset with something you already do - like Sunday evening TV time. Habit stacking makes it automatic.")

    b.end_of_chapter_checklist([
        "Committed to one-in-one-out rule",
        "Learned the 4-step weekly reset",
        "Scheduled recurring reset reminder",
        "Completed first reset",
    ])

    # ── CHAPTER 12 ──
    b.chapter_header(12, "The Mindful Wardrobe", "15 min")
    b.rating_scale("How mindful are your clothing purchases? (1=impulse, 5=intentional):")
    b.spacer(4)
    b.body_text("Before buying anything new, apply these two tests:")

    b.spacer(4)
    b.body_text("<b>The 30-Wear Test:</b> Ask yourself: 'Will I wear this at least 30 times?' If the answer is no, put it back.", size=11)
    b.spacer(4)
    b.body_text("<b>Cost Per Wear:</b> Price divided by number of wears. A $90 jacket worn 90 times = $1/wear (great!). A $30 top worn twice = $15/wear (bad!).", size=11)

    b.spacer(6)
    b.body_text("<b>Calculate Your Cost Per Wear:</b>", size=12)
    b.text_field("Item:", width=300)
    b.text_field("Purchase price ($):", width=200)
    b.text_field("Estimated number of wears:", width=200)
    b.text_field("Cost per wear (price / wears):", width=200)

    b.action_block("Mindful Wardrobe Pledge", [
        "1. Apply the 30-wear test to your next 3 purchases",
        "2. Calculate cost-per-wear for your 5 most expensive items",
        "3. Choose quality over quantity going forward",
    ])

    b.tip_box("A mindful wardrobe is not about deprivation - it's about loving everything you own. Every item earns its place.")

    b.text_field("My wardrobe philosophy in one sentence:")

    b.end_of_chapter_checklist([
        "Understand the 30-wear test",
        "Calculated cost-per-wear for key items",
        "Committed to quality over quantity",
        "Written my wardrobe philosophy",
    ])

    # ── WARDROBE INVENTORY PAGE ──
    b.next_page()
    b.title_text("Wardrobe Inventory Worksheet", 20, DUSTY_BLUE)
    b.body_text("Count your items by category. Fill in the 'Before' column now and the 'After' column when you've completed the book.")
    b.spacer(8)

    categories = ["Tops (t-shirts, blouses, shirts)", "Bottoms (pants, skirts, shorts)",
                  "Dresses / Jumpsuits", "Outerwear (jackets, coats)",
                  "Shoes", "Accessories (bags, belts, scarves, jewelry)",
                  "Activewear / Loungewear", "Underwear / Socks"]

    # Table header
    b.c.setFont("Helvetica-Bold", 11)
    b.c.setFillColor(SAGE_DARK)
    b.c.drawString(MARGIN, b.y, "Category")
    b.c.drawString(MARGIN + 300, b.y, "Before")
    b.c.drawString(MARGIN + 410, b.y, "After")
    b.y -= 6
    b.h_line(SAGE)

    for cat in categories:
        b.check_space(35)
        b.c.setFont("Helvetica", 10)
        b.c.setFillColor(CHARCOAL)
        b.c.drawString(MARGIN, b.y, cat)
        b.form.textfield(
            name=b._field_name("inv_before"),
            x=MARGIN + 300, y=b.y - 6,
            width=80, height=18,
            borderColor=BEIGE_DARK, fillColor=WHITE, fontSize=10, relative=False
        )
        b.form.textfield(
            name=b._field_name("inv_after"),
            x=MARGIN + 410, y=b.y - 6,
            width=80, height=18,
            borderColor=BEIGE_DARK, fillColor=WHITE, fontSize=10, relative=False
        )
        b.y -= 30

    b.spacer(8)
    b.h_line(SAGE_DARK, 2)
    b.c.setFont("Helvetica-Bold", 11)
    b.c.setFillColor(SAGE_DARK)
    b.c.drawString(MARGIN, b.y, "TOTAL")
    b.form.textfield(
        name=b._field_name("total_before"),
        x=MARGIN + 300, y=b.y - 6,
        width=80, height=18,
        borderColor=SAGE_DARK, fillColor=HexColor("#E8F0E6"), fontSize=10, relative=False
    )
    b.form.textfield(
        name=b._field_name("total_after"),
        x=MARGIN + 410, y=b.y - 6,
        width=80, height=18,
        borderColor=SAGE_DARK, fillColor=HexColor("#E8F0E6"), fontSize=10, relative=False
    )
    b.y -= 30

    b.spacer(12)
    b.text_field("Items donated:")
    b.text_field("Items trashed:")
    b.text_field("Percentage reduced:")

    # ── COMPLETION PAGE ──
    b.next_page()

    # Celebration header
    b.c.setFillColor(SAGE_DARK)
    b.c.roundRect(MARGIN, b.y - 80, CONTENT_W, 80, 10, fill=1, stroke=0)
    b.c.setFont("Helvetica-Bold", 28)
    b.c.setFillColor(WHITE)
    b.c.drawCentredString(W / 2, b.y - 40, "Congratulations!")
    b.c.setFont("Helvetica", 14)
    b.c.drawCentredString(W / 2, b.y - 62, "You've completed The Closet & Wardrobe Reset")
    b.y -= 100

    b.spacer(10)
    b.body_text("You did the hard work. Take a moment to celebrate your transformation and record your results.", size=12)
    b.spacer(10)

    b.body_text("<b>My Closet Score</b>", size=14, color=SAGE_DARK)
    b.spacer(4)
    b.rating_scale("BEFORE - Overall closet score (1=disaster, 5=dream closet):")
    b.rating_scale("AFTER - Overall closet score (1=disaster, 5=dream closet):")

    b.spacer(8)
    b.text_field("Total items donated:")
    b.text_field("Total items trashed:")
    b.text_field("My closet in 3 words (after):")
    b.text_field("Next seasonal swap date:")
    b.text_field("What I'm most proud of:")

    b.spacer(8)
    b.tip_box("You've built a system. Now trust the system. Your weekly 10-minute reset and one-in-one-out rule will keep your closet peaceful for years to come. You've got this!")

    b.spacer(12)
    b.h_line(BEIGE)
    b.spacer(4)
    b.c.setFont("Helvetica-Bold", 12)
    b.c.setFillColor(SAGE_DARK)
    b.c.drawCentredString(W / 2, b.y, "SmallSpaceHome.ca")
    b.y -= 18
    b.c.setFont("Helvetica", 10)
    b.c.setFillColor(CHARCOAL)
    b.c.drawCentredString(W / 2, b.y, "Thank you for investing in your space and yourself.")
    b.y -= 14
    b.c.setFillColor(BEIGE_DARK)
    b.c.drawCentredString(W / 2, b.y, "Share your results @SmallSpaceHome on social media!")

    b.save()


if __name__ == "__main__":
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "The_Closet_Wardrobe_Reset_Interactive.pdf")
    build_pdf(output_path)
    print(f"Generated: {output_path}")
