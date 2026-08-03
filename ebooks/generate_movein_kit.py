#!/usr/bin/env python3
"""Generate The Move-In Week Survival Kit Interactive PDF for SmallSpaceHome.ca"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfform
import os

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
CW = W - 2 * MARGIN  # content width

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      "The_MoveIn_Week_Survival_Kit_Interactive.pdf")


class PDFBuilder:
    def __init__(self):
        self.c = canvas.Canvas(OUTPUT, pagesize=letter)
        self.c.setTitle("The Move-In Week Survival Kit")
        self.c.setAuthor("SmallSpaceHome.ca")
        self.y = H - MARGIN
        self.page_num = 0
        self.field_idx = 0

    def _field_name(self, prefix="field"):
        self.field_idx += 1
        return f"{prefix}_{self.field_idx}"

    def new_page(self, bg=CREAM):
        if self.page_num > 0:
            self.c.showPage()
        self.page_num += 1
        self.c.setFillColor(bg)
        self.c.rect(0, 0, W, H, fill=1, stroke=0)
        self.y = H - MARGIN

    def need_space(self, needed):
        if self.y - needed < MARGIN + 30:
            self.new_page()
            return True
        return False

    def draw_text(self, text, size=11, color=CHARCOAL, bold=False, x=None, align="left", max_width=None):
        font = "Helvetica-Bold" if bold else "Helvetica"
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        if x is None:
            x = MARGIN
        if max_width is None:
            max_width = CW
        # Word wrap
        words = text.split()
        lines = []
        line = ""
        for w in words:
            test = f"{line} {w}".strip()
            if self.c.stringWidth(test, font, size) > max_width:
                if line:
                    lines.append(line)
                line = w
            else:
                line = test
        if line:
            lines.append(line)
        for ln in lines:
            self.need_space(size + 4)
            self.c.setFont(font, size)
            self.c.setFillColor(color)
            if align == "center":
                tx = W / 2 - self.c.stringWidth(ln, font, size) / 2
            elif align == "right":
                tx = W - MARGIN - self.c.stringWidth(ln, font, size)
            else:
                tx = x
            self.c.drawString(tx, self.y, ln)
            self.y -= size + 4
        return len(lines)

    def spacer(self, h=10):
        self.y -= h

    def draw_checkbox(self, label, size=11):
        self.need_space(20)
        form = self.c.acroForm
        name = self._field_name("cb")
        form.checkbox(name=name, x=MARGIN, y=self.y - 4,
                      size=14, borderColor=SAGE_DARK, fillColor=WHITE,
                      buttonStyle="check", checked=False)
        self.c.setFont("Helvetica", size)
        self.c.setFillColor(CHARCOAL)
        # word wrap the label after checkbox
        font = "Helvetica"
        words = label.split()
        lines = []
        line = ""
        lw = CW - 22
        for w in words:
            test = f"{line} {w}".strip()
            if self.c.stringWidth(test, font, size) > lw:
                if line:
                    lines.append(line)
                line = w
            else:
                line = test
        if line:
            lines.append(line)
        for i, ln in enumerate(lines):
            self.c.setFont(font, size)
            self.c.setFillColor(CHARCOAL)
            self.c.drawString(MARGIN + 20, self.y, ln)
            self.y -= size + 5
            if i < len(lines) - 1:
                self.need_space(size + 5)

    def draw_text_field(self, label, width=None, height=20):
        self.need_space(40)
        if width is None:
            width = CW
        self.c.setFont("Helvetica", 10)
        self.c.setFillColor(CHARCOAL)
        self.c.drawString(MARGIN, self.y, label)
        self.y -= 16
        self.need_space(height + 5)
        form = self.c.acroForm
        name = self._field_name("tf")
        form.textfield(name=name, x=MARGIN, y=self.y - height + 14,
                       width=width, height=height,
                       borderColor=BEIGE, fillColor=WHITE,
                       textColor=CHARCOAL, fontSize=10,
                       borderWidth=1)
        self.y -= height + 2

    def draw_action_block(self, title, items):
        """Terracotta 'Do This Now' block"""
        block_h = 30 + len(items) * 20
        self.need_space(block_h + 10)
        self.c.setFillColor(TERRACOTTA)
        self.c.roundRect(MARGIN, self.y - block_h + 10, CW, block_h, 6, fill=1, stroke=0)
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 12)
        self.c.drawString(MARGIN + 12, self.y - 2, title)
        self.y -= 22
        for item in items:
            self.c.setFont("Helvetica", 10)
            self.c.setFillColor(WHITE)
            self.c.drawString(MARGIN + 16, self.y - 2, ">> " + item)
            self.y -= 18
        self.y -= 5

    def draw_tip_box(self, text):
        """Sage green tip box"""
        font = "Helvetica-Oblique"
        size = 10
        words = text.split()
        lines = []
        line = ""
        for w in words:
            test = f"{line} {w}".strip()
            if self.c.stringWidth(test, font, size) > CW - 30:
                if line:
                    lines.append(line)
                line = w
            else:
                line = test
        if line:
            lines.append(line)
        box_h = 16 + len(lines) * 15
        self.need_space(box_h + 10)
        self.c.setFillColor(SAGE)
        self.c.setStrokeColor(SAGE_DARK)
        self.c.roundRect(MARGIN, self.y - box_h + 12, CW, box_h, 5, fill=1, stroke=1)
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 10)
        self.c.drawString(MARGIN + 10, self.y, "TIP")
        self.y -= 16
        self.c.setFont(font, size)
        for ln in lines:
            self.c.setFillColor(WHITE)
            self.c.drawString(MARGIN + 10, self.y, ln)
            self.y -= 15
        self.y -= 5

    def chapter_title(self, num, title, time_est=None):
        self.new_page()
        # accent bar
        self.c.setFillColor(SAGE_DARK)
        self.c.rect(MARGIN, self.y - 2, CW, 3, fill=1, stroke=0)
        self.y -= 18
        label = f"Chapter {num}" if num else ""
        if label:
            self.draw_text(label, size=13, color=SAGE_DARK, bold=True)
            self.spacer(2)
        self.draw_text(title, size=22, color=CHARCOAL, bold=True)
        if time_est:
            self.spacer(2)
            self.draw_text(time_est, size=10, color=BEIGE_DARK, bold=False)
        self.spacer(10)
        self.c.setFillColor(BEIGE)
        self.c.rect(MARGIN, self.y, CW, 1, fill=1, stroke=0)
        self.spacer(12)

    def section_heading(self, text):
        self.need_space(30)
        self.spacer(6)
        self.draw_text(text, size=14, color=SAGE_DARK, bold=True)
        self.spacer(4)

    def bullet(self, text, indent=0):
        self.need_space(18)
        x = MARGIN + indent
        self.c.setFont("Helvetica", 10)
        self.c.setFillColor(CHARCOAL)
        # word wrap
        words = text.split()
        lines = []
        line = ""
        lw = CW - indent - 12
        for w in words:
            test = f"{line} {w}".strip()
            if self.c.stringWidth(test, "Helvetica", 10) > lw:
                if line:
                    lines.append(line)
                line = w
            else:
                line = test
        if line:
            lines.append(line)
        for i, ln in enumerate(lines):
            self.need_space(15)
            self.c.setFont("Helvetica", 10)
            self.c.setFillColor(CHARCOAL)
            prefix = "- " if i == 0 else "  "
            self.c.drawString(x, self.y, prefix + ln)
            self.y -= 14

    def end_chapter_checklist(self, items):
        self.spacer(8)
        self.c.setFillColor(DUSTY_BLUE)
        self.c.roundRect(MARGIN, self.y - len(items) * 22 - 30, CW, len(items) * 22 + 30, 5, fill=1, stroke=0)
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 12)
        self.c.drawString(MARGIN + 10, self.y - 4, "End-of-Chapter Checklist")
        self.y -= 24
        for item in items:
            self.need_space(22)
            form = self.c.acroForm
            name = self._field_name("ecb")
            form.checkbox(name=name, x=MARGIN + 10, y=self.y - 4,
                          size=13, borderColor=WHITE, fillColor=HexColor("#FFFFFF"),
                          buttonStyle="check", checked=False)
            self.c.setFont("Helvetica", 10)
            self.c.setFillColor(WHITE)
            self.c.drawString(MARGIN + 28, self.y - 1, item)
            self.y -= 20
        self.y -= 10

    def build(self):
        self._cover()
        self._quiz()
        self._ch1()
        self._ch2()
        self._ch3()
        self._ch4()
        self._ch5()
        self._ch6()
        self._ch7()
        self._ch8()
        self._ch9()
        self._ch10()
        self._ch11()
        self._ch12()
        self._master_checklist()
        self._important_info()
        self._completion()
        self.c.save()
        print(f"PDF generated: {OUTPUT}")
        print(f"Pages: {self.page_num}")

    # ── COVER ──
    def _cover(self):
        self.new_page(bg=SAGE_DARK)
        self.y = H - 2 * inch
        self.draw_text("The Move-In Week", size=32, color=WHITE, bold=True, align="center")
        self.draw_text("Survival Kit", size=32, color=WHITE, bold=True, align="center")
        self.spacer(20)
        self.c.setFillColor(BEIGE)
        self.c.rect(W/2 - 60, self.y, 120, 2, fill=1, stroke=0)
        self.spacer(20)
        self.draw_text("Your complete guide to surviving (and thriving)", size=13, color=CREAM, align="center")
        self.draw_text("during your first week in a new apartment", size=13, color=CREAM, align="center")
        self.spacer(40)
        self.draw_text("Interactive Edition", size=14, color=BEIGE, bold=True, align="center")
        self.draw_text("Fill-in checklists, planners & trackers", size=11, color=CREAM, align="center")
        self.spacer(60)
        self.draw_text("SmallSpaceHome.ca", size=16, color=WHITE, bold=True, align="center")
        self.spacer(8)
        self.draw_text("$9 CAD", size=12, color=BEIGE, align="center")

    # ── QUIZ ──
    def _quiz(self):
        self.new_page()
        self.draw_text("What Kind of Mover Are You?", size=22, color=SAGE_DARK, bold=True, align="center")
        self.spacer(8)
        self.draw_text("Check the answer that sounds most like you for each question.", size=11, color=CHARCOAL, align="center")
        self.spacer(12)

        questions = [
            ("1. Your moving day is in two weeks. You:", [
                ("A", "Have a colour-coded spreadsheet, timeline, and labelling system ready"),
                ("B", "Throw stuff in bags the night before and figure it out"),
                ("C", "Text five friends asking who has a truck and is free"),
            ]),
            ("2. You arrive at the new place. First thing you do?", [
                ("A", "Walk through every room with a checklist documenting issues"),
                ("B", "Toss your mattress on the floor - sleep setup done"),
                ("C", "Call your most organized friend to come help direct traffic"),
            ]),
            ("3. The kitchen needs to be set up. Your approach?", [
                ("A", "Drawer organizers, labelled shelves, everything has a place"),
                ("B", "Pile dishes in cupboards, worry about it later"),
                ("C", "Order pizza and let someone else figure out the kitchen"),
            ]),
            ("4. You need to change your address everywhere. You:", [
                ("A", "Work through a master list of every account systematically"),
                ("B", "Change things as they come up when mail bounces back"),
                ("C", "Ask a friend or family member to help coordinate"),
            ]),
            ("5. By Day 7, your place looks:", [
                ("A", "Magazine-ready with everything unpacked and organized"),
                ("B", "Liveable-ish with a few mystery boxes in the corner"),
                ("C", "Great, thanks to the army of helpers who came through"),
            ]),
        ]

        for q_text, options in questions:
            self.need_space(90)
            self.draw_text(q_text, size=11, color=CHARCOAL, bold=True)
            self.spacer(4)
            for letter_label, opt_text in options:
                self.draw_checkbox(f"{letter_label}. {opt_text}", size=10)
            self.spacer(8)

        self.spacer(6)
        self.draw_tip_box("Mostly A's: The Planner - you thrive on spreadsheets and systems. "
                          "Mostly B's: The Wing-It - you figure it out as you go. "
                          "Mostly C's: The Delegator - you know your strength is enlisting help. "
                          "All types can nail move-in week - this book meets you where you are!")

    # ── CH1 ──
    def _ch1(self):
        self.chapter_title(1, "The First Hour", "Time estimate: 30-60 minutes")
        self.draw_text("The first hour sets the tone for everything. Before you unpack a single box, "
                       "do these critical tasks.", size=11, color=CHARCOAL)
        self.spacer(8)

        self.section_heading("Photo Walkthrough")
        self.draw_text("Document EVERYTHING for your deposit. Take photos and video of:", size=10)
        for item in ["Every wall, floor, and ceiling in each room", "Inside all cupboards and closets",
                      "All appliances (open fridge, oven, dishwasher)", "Windows, locks, and screens",
                      "Bathroom fixtures (taps, toilet, tub/shower)", "Any existing damage, marks, or stains"]:
            self.draw_checkbox(item, size=10)
        self.spacer(4)
        self.draw_action_block("DO THIS NOW", [
            "Open your phone camera right now",
            "Walk through every room systematically",
            "Email photos to yourself with date in subject line",
        ])
        self.spacer(6)

        self.section_heading("Test All Utilities")
        for item in ["Hot and cold water in kitchen and bathroom", "All light switches and outlets",
                      "Stove/oven burners", "Fridge is running and cold", "Heat/AC works",
                      "Toilet flushes properly", "Smoke detectors have batteries"]:
            self.draw_checkbox(item, size=10)

        self.section_heading("First Essentials to Buy")
        for item in ["Plunger ($8-10) - do not skip this", "Toilet paper (at least 4 rolls)",
                      "Sheets and a pillow for tonight", "Basic cleaning spray and paper towels",
                      "Box cutter / scissors", "Hand soap", "Garbage bags",
                      "Phone charger accessible (not buried in a box)"]:
            self.draw_checkbox(item, size=10)

        self.section_heading("Documents to Collect")
        self.draw_text_field("Lease location / copy stored at:")
        self.draw_text_field("Landlord name:")
        self.draw_text_field("Landlord phone:")
        self.draw_text_field("Landlord email:")
        self.draw_text_field("Building rules / tenant handbook location:")
        self.draw_text_field("Parking spot / rules:")

        self.draw_tip_box("Find parking FIRST. Nothing is worse than circling the block with a loaded moving truck.")

        self.end_chapter_checklist([
            "Photo walkthrough completed and emailed to self",
            "All utilities tested and working",
            "First essentials purchased",
            "Landlord contact info recorded",
            "Parking figured out",
        ])

    # ── CH2 ──
    def _ch2(self):
        self.chapter_title(2, "Unpack by Zone", "Time estimate: spread across Days 1-3")
        self.draw_text("Do NOT try to unpack everything at once. Work in zones, in this order.", size=11)
        self.spacer(8)

        self.section_heading("Zone 1: Bedroom (Priority #1)")
        self.draw_text("Sleep matters most. An exhausted you makes bad decisions about everything else.", size=10)
        for item in ["Make the bed with clean sheets", "Set up bedside table or surface",
                      "Plug in phone charger", "Hang or store 3 days of clothes",
                      "Set up lamp or light source"]:
            self.draw_checkbox(item, size=10)

        self.section_heading("Zone 2: Bathroom")
        for item in ["Hang towels", "Set out soap, shampoo, toothbrush",
                      "Place toilet paper on holder", "Put out bath mat",
                      "Stock basic medicine (pain relief, bandaids)"]:
            self.draw_checkbox(item, size=10)

        self.section_heading("Zone 3: Kitchen (Minimal)")
        for item in ["Unpack: 2 plates, 2 bowls, 2 mugs, basic cutlery",
                      "Set up coffee maker or kettle", "Put out dish soap and sponge",
                      "Stock paper towels", "One pot, one pan, one cutting board"]:
            self.draw_checkbox(item, size=10)

        self.section_heading("Zone 4: Everything Else")
        self.draw_text("This can wait. Seriously.", size=10)
        self.spacer(4)

        self.draw_tip_box("The First-Night Box: Pack one box last (load it on the truck last, unload first) with: "
                          "sheets, pillow, PJs, toiletries, phone charger, snacks, TP, towel, change of clothes. "
                          "Label it clearly.")

        self.section_heading("The One-Week Rule")
        self.draw_text("If a box sits untouched for 7 days after move-in, seriously reconsider whether "
                       "you need what is inside. This is a great decluttering signal.", size=10)
        self.spacer(4)
        self.section_heading("The Layering Principle")
        self.draw_text("Your space does not need to be finished on Day 1. Layer things in over time: "
                       "function first, then comfort, then style. Do not buy decor during move-in week.", size=10)

        self.end_chapter_checklist([
            "Bedroom set up and sleepable",
            "Bathroom functional",
            "Kitchen has minimal setup for meals",
            "First-night box concept understood",
        ])

    # ── CH3 ──
    def _ch3(self):
        self.chapter_title(3, "Address Registration", "Time estimate: 2-hour block")
        self.draw_text("Set aside one focused block to knock out all address changes. "
                       "Doing them piecemeal means you will forget something.", size=11)
        self.spacer(8)

        self.draw_action_block("DO THIS NOW", [
            "Block 2 hours in your calendar for address changes",
            "Have your new address written down beside you",
            "Open your browser with all account logins ready",
        ])
        self.spacer(6)

        self.section_heading("Master Address Change List")
        changes = [
            "Driver's license (provincial - do within 30 days)",
            "Health card (provincial)",
            "Bank accounts and credit cards",
            "Employer / payroll / HR",
            "CRA (Canada Revenue Agency) - online via My Account",
            "Auto insurance",
            "Tenant / renter's insurance",
            "Cell phone provider",
            "Streaming subscriptions (Netflix, Spotify, etc.)",
            "Online shopping accounts (Amazon, etc.)",
            "Gym membership",
            "Dentist and doctor",
            "Voter registration",
            "Vehicle registration",
            "Loyalty programs and rewards cards",
        ]
        for item in changes:
            self.draw_checkbox(item, size=10)

        self.spacer(6)
        self.section_heading("Canada Post Mail Forwarding")
        self.draw_text("Cost: approximately $75/year. Set up at canadapost.ca or in person. "
                       "Redirects mail from old address to new for 12 months.", size=10)
        self.draw_text_field("Mail forwarding start date:")
        self.draw_text_field("Confirmation number:")

        self.draw_tip_box("Do your address changes on a weekday when phone support lines are open, "
                          "in case any accounts need a call instead of an online change.")

        self.end_chapter_checklist([
            "All accounts on list updated",
            "Canada Post forwarding set up",
            "IDs updated within required timeframe",
        ])

    # ── CH4 ──
    def _ch4(self):
        self.chapter_title(4, "Utilities Setup", "Time estimate: 1-2 hours (plus lead time)")
        self.draw_text("Some utilities need to be booked weeks in advance. "
                       "Others can be set up on move-in day.", size=11)
        self.spacer(8)

        self.draw_action_block("DO THIS NOW", [
            "Book internet installation 2 weeks before move-in",
            "Confirm hydro/electricity transfer date with provider",
        ])
        self.spacer(6)

        self.section_heading("Internet")
        self.draw_text("Book at least 2 weeks early. Installation appointments fill up fast.", size=10)
        self.draw_text_field("Provider:")
        self.draw_text_field("Account number:")
        self.draw_text_field("Installation date:")
        self.draw_text_field("Wifi network name:")
        self.draw_text_field("Wifi password:")

        self.section_heading("Hydro / Electricity")
        self.draw_text_field("Provider:")
        self.draw_text_field("Account number:")
        self.draw_text_field("Transfer/start date:")

        self.section_heading("Other Utilities")
        self.draw_text_field("Gas provider / account (if applicable):")
        self.draw_text_field("Water (if separate from rent):")

        self.draw_tip_box("Check your lease: many apartments include water and sometimes heat in rent. "
                          "Know what you are responsible for before setting anything up.")

        self.end_chapter_checklist([
            "Internet booked and installed",
            "Hydro/electricity transferred to your name",
            "All utility account numbers recorded",
        ])

    # ── CH5 ──
    def _ch5(self):
        self.chapter_title(5, "Tenant Insurance", "Time estimate: 30 minutes")
        self.draw_text("This is NOT optional. Get tenant insurance before you move in. "
                       "It costs $15-30/month and protects everything you own.", size=11)
        self.spacer(8)

        self.section_heading("What It Covers")
        for item in ["Theft of your belongings", "Fire damage to your possessions",
                      "Liability (someone gets hurt in your unit)",
                      "Additional living expenses if your unit becomes unliveable"]:
            self.bullet(item)

        self.section_heading("What It Usually Does NOT Cover")
        for item in ["Flood / sewer backup (usually extra rider)",
                      "Earthquake (usually extra)", "Intentional damage",
                      "Wear and tear on the unit itself"]:
            self.bullet(item)

        self.spacer(4)
        self.draw_action_block("DO THIS NOW", [
            "Get 2-3 quotes online (takes 10 minutes each)",
            "Ask about sewer backup / flood coverage",
            "Set up policy BEFORE move-in day",
        ])
        self.spacer(6)

        self.draw_text_field("Insurance provider:")
        self.draw_text_field("Policy number:")
        self.draw_text_field("Monthly cost:")
        self.draw_text_field("Coverage amount:")
        self.draw_text_field("Start date:")

        self.draw_tip_box("Many landlords now REQUIRE tenant insurance. Even if yours does not, "
                          "the cost of replacing everything you own far exceeds $15-30/month.")

        self.end_chapter_checklist([
            "Tenant insurance quotes obtained",
            "Policy purchased and active",
            "Policy details recorded above",
        ])

    # ── CH6 ──
    def _ch6(self):
        self.chapter_title(6, "The Landlord Relationship", "Time estimate: ongoing")
        self.draw_text("A good landlord relationship makes your tenancy smooth. "
                       "A bad one makes it miserable. Set the tone early.", size=11)
        self.spacer(8)

        self.section_heading("Golden Rules")
        for item in ["Document EVERYTHING in writing (email, not just text)",
                      "Know your provincial tenant rights",
                      "Be professional - friendly, but not friends",
                      "Keep records of all communication",
                      "Pay rent on time, every time",
                      "Report maintenance issues promptly and in writing"]:
            self.bullet(item)

        self.section_heading("Know Your Rights")
        for item in ["Your landlord must give 24 hours notice before entering (in most provinces)",
                      "Maintenance requests have reasonable timelines",
                      "Rent increases are regulated (check your province)",
                      "You cannot be evicted without proper legal process"]:
            self.bullet(item)

        self.draw_tip_box("Start a dedicated email folder or label for all landlord communication. "
                          "If something ever goes to a tribunal, written records are everything.")

        self.draw_text_field("Landlord preferred contact method:")
        self.draw_text_field("Maintenance request process:")
        self.draw_text_field("Rent payment method and due date:")

        self.end_chapter_checklist([
            "Landlord contact info saved in phone",
            "Communication channel established",
            "Tenant rights reviewed for your province",
            "Rent payment method set up",
        ])

    # ── CH7 ──
    def _ch7(self):
        self.chapter_title(7, "The First Week Plan", "Day-by-day schedule")
        self.draw_text("Follow this day-by-day plan to stay sane. You do not have to do everything. "
                       "Check off what you complete each day.", size=11)
        self.spacer(8)

        days = [
            ("Day 1: Arrive & Sleep Setup", [
                "Complete first-hour checklist (Chapter 1)",
                "Set up bedroom (Zone 1)",
                "Set up bathroom (Zone 2)",
                "Order or buy dinner - do NOT try to cook tonight",
            ]),
            ("Day 2: Kitchen & Eating", [
                "Set up kitchen basics (Zone 3)",
                "First small grocery run (basics only)",
                "Cook or prep one simple meal",
                "Start unpacking living area",
            ]),
            ("Day 3: Living Areas", [
                "Arrange living room furniture",
                "Set up TV / entertainment if applicable",
                "Unpack remaining priority boxes",
                "Take out first round of recycling/garbage",
            ]),
            ("Day 4: Admin Day", [
                "Address changes (Chapter 3) - block 2 hours",
                "Utility confirmations (Chapter 4)",
                "Tenant insurance (Chapter 5)",
                "Set up mail forwarding if not done",
            ]),
            ("Day 5: Explore", [
                "Walk around your neighbourhood",
                "Find nearest grocery store",
                "Locate nearest pharmacy",
                "Test your commute to work/school",
                "Find a coffee shop you like",
            ]),
            ("Day 6: Organize", [
                "Tackle remaining boxes",
                "Apply the one-week rule to untouched boxes",
                "Do first load of laundry in new machines",
                "Buy any remaining household items",
            ]),
            ("Day 7: Rest & Enjoy", [
                "You made it - take it easy today",
                "Cook a real meal in your kitchen",
                "Sit on your couch and do nothing for 30 minutes",
                "Appreciate your new space",
            ]),
        ]

        for day_title, tasks in days:
            self.section_heading(day_title)
            for t in tasks:
                self.draw_checkbox(t, size=10)
            self.spacer(4)

        self.draw_text_field("Notes for the week:")
        self.draw_text_field("Things I still need to do:", height=40)

    # ── CH8 ──
    def _ch8(self):
        self.chapter_title(8, "First Grocery Shop", "Time estimate: 45 minutes")
        self.draw_text("Your first grocery run should be small and strategic. Do NOT stock a full pantry "
                       "on Day 1. You do not know what you need yet.", size=11)
        self.spacer(8)

        self.section_heading("Starter Pantry (Under $50)")
        items = [
            "Salt and pepper", "Cooking oil (olive or vegetable)", "Butter",
            "Rice or pasta (1 box/bag)", "Pasta sauce (1 jar)", "Eggs (1 dozen)",
            "Bread", "Peanut butter", "Coffee or tea",
            "Milk", "Cheese (block or shredded)", "Chicken breasts or ground meat",
            "Onions (bag of 3)", "Garlic", "Canned beans (2 cans)",
            "Canned tomatoes (1 can)", "Frozen vegetables (1 bag)", "Bananas",
            "Apples", "Dish soap and sponge",
        ]
        for item in items:
            self.draw_checkbox(item, size=10)

        self.spacer(4)
        self.draw_text_field("Budget for first grocery shop: $")
        self.draw_text_field("Actual spent: $")

        self.draw_tip_box("Kitchen setup priorities: kettle or coffee maker first, then one good pot, "
                          "one pan, one cutting board, and one sharp knife. Everything else can wait.")

        self.end_chapter_checklist([
            "First grocery run completed",
            "Budget tracked",
            "At least one meal cooked at home",
        ])

    # ── CH9 ──
    def _ch9(self):
        self.chapter_title(9, "The First Month", "Time estimate: ongoing")
        self.draw_text("Week one is survival. Month one is about building your life in your new space.", size=11)
        self.spacer(8)

        self.section_heading("Establish Routines")
        for item in ["Morning routine that works in this space",
                      "Meal prep or cooking schedule",
                      "Cleaning routine (even 15 min/day)",
                      "Garbage and recycling schedule memorized",
                      "Laundry schedule"]:
            self.draw_checkbox(item, size=10)

        self.section_heading("Get to Know Your Area")
        for item in ["Introduce yourself to at least one neighbour",
                      "Find your go-to grocery store",
                      "Find your go-to coffee shop",
                      "Locate nearest gym or fitness option",
                      "Test commute at actual commute time",
                      "Find nearest park or green space",
                      "Locate library"]:
            self.draw_checkbox(item, size=10)

        self.draw_text_field("Garbage day:")
        self.draw_text_field("Recycling day:")
        self.draw_text_field("My go-to grocery store:")
        self.draw_text_field("My go-to coffee shop:")
        self.draw_text_field("Nearest gym:")

        self.end_chapter_checklist([
            "Basic routines established",
            "Neighbourhood explored",
            "Garbage/recycling schedule known",
        ])

    # ── CH10 ──
    def _ch10(self):
        self.chapter_title(10, "First Repair", "Time estimate: varies")
        self.draw_text("Something will break or need fixing. Here is how to handle it.", size=11)
        self.spacer(8)

        self.section_heading("DIY vs Call Landlord")
        self.draw_text("CALL YOUR LANDLORD for:", size=10, bold=True)
        for item in ["Plumbing issues (leaks, clogs you cannot fix)",
                      "Electrical problems", "Appliance breakdowns",
                      "Heating/cooling failure", "Pest issues",
                      "Structural problems (windows, doors, locks)"]:
            self.bullet(item)
        self.spacer(4)
        self.draw_text("DIY (your responsibility):", size=10, bold=True)
        for item in ["Changing light bulbs", "Minor toilet clogs (hence the plunger)",
                      "Tightening loose screws on handles",
                      "Replacing batteries in smoke detectors",
                      "Hanging pictures (with approval)"]:
            self.bullet(item)

        self.section_heading("Basic Toolkit ($25-30)")
        for item in ["Screwdriver set (Phillips and flat)", "Hammer",
                      "Measuring tape", "Pliers", "Level",
                      "Picture hanging kit", "Flashlight"]:
            self.draw_checkbox(item, size=10)

        self.draw_action_block("DO THIS NOW", [
            "Save landlord emergency maintenance number in phone",
            "Know the difference: emergency vs non-emergency",
            "Emergency = flood, no heat in winter, gas smell, break-in",
        ])

        self.draw_text_field("Emergency maintenance number:")
        self.draw_text_field("Non-emergency maintenance process:")

        self.end_chapter_checklist([
            "Emergency number saved in phone",
            "Basic toolkit purchased",
            "Maintenance request process understood",
        ])

    # ── CH11 ──
    def _ch11(self):
        self.chapter_title(11, "First Guest", "Time estimate: 30 minutes to prep")
        self.draw_text("Having your first guest over is a milestone. It means your place "
                       "is starting to feel like home.", size=11)
        self.spacer(8)

        self.section_heading("Quick-Clean Routine (30 min)")
        for item in ["Wipe kitchen counters and sink",
                      "Clean bathroom (toilet, sink, mirror)",
                      "Vacuum or sweep main areas",
                      "Tidy living room - clear surfaces",
                      "Take out garbage",
                      "Light a candle or open a window for fresh air"]:
            self.draw_checkbox(item, size=10)

        self.section_heading("Guest Essentials")
        for item in ["Clean towel set aside for guest",
                      "Basic toiletries accessible (soap, toothpaste)",
                      "Wifi password written down or easy to share",
                      "Extra blanket and pillow if staying over",
                      "Drinks to offer (water, tea, coffee)"]:
            self.draw_checkbox(item, size=10)

        self.draw_tip_box("Make it feel like home for YOU first, then worry about guests. "
                          "Your first guest will not judge your boxes in the corner. They are happy for you.")

        self.draw_text_field("Wifi password to share with guests:")

        self.end_chapter_checklist([
            "Quick-clean routine practiced",
            "Guest essentials ready",
            "Wifi password easily shareable",
        ])

    # ── CH12 ──
    def _ch12(self):
        self.chapter_title(12, "You're Settled", "You made it!")
        self.draw_text("If you are reading this, you survived move-in week. "
                       "Take a moment to appreciate that.", size=11)
        self.spacer(8)

        self.section_heading("Signs You're Home")
        for item in ["You know where everything is (mostly)",
                      "You have a morning routine that works",
                      "You can cook a meal without searching for utensils",
                      "You have a favourite spot to sit",
                      "The space smells like you, not the last tenant",
                      "You stopped calling it 'the new place'"]:
            self.bullet(item)

        self.spacer(6)
        self.draw_text("Celebrate this milestone. Moving is one of the most stressful life events, "
                       "and you handled it.", size=11, color=SAGE_DARK, bold=True)
        self.spacer(8)

        self.section_heading("What's Next for Your Space")
        self.draw_text("Now that survival mode is over, you can start thinking about making this "
                       "space truly yours. But there is no rush.", size=10)
        self.draw_text_field("Three things I want to do with this space eventually:")
        self.draw_text_field("1.")
        self.draw_text_field("2.")
        self.draw_text_field("3.")

    # ── MASTER CHECKLIST ──
    def _master_checklist(self):
        self.chapter_title(None, "Master Move-In Checklist")
        self.draw_text("The complete list. Print this out and check items off as you go.", size=11)
        self.spacer(8)

        sections = [
            ("Before Move-In", [
                "Book internet installation (2 weeks early)",
                "Get tenant insurance quotes and purchase policy",
                "Set up Canada Post mail forwarding",
                "Pack first-night box",
                "Confirm move-in date and key pickup with landlord",
            ]),
            ("First Hour", [
                "Photo walkthrough of entire unit",
                "Test all utilities",
                "Find parking",
                "Buy essentials (plunger, TP, sheets, cleaning supplies)",
                "Collect lease and landlord contact info",
            ]),
            ("Day 1-2", [
                "Set up bedroom",
                "Set up bathroom",
                "Set up kitchen basics",
                "First grocery run",
            ]),
            ("Day 3-4", [
                "Arrange living areas",
                "Complete address changes (2-hour block)",
                "Confirm all utility accounts",
                "Set up internet",
            ]),
            ("Day 5-7", [
                "Explore neighbourhood",
                "Test commute",
                "Tackle remaining boxes",
                "Apply one-week rule",
                "Rest and enjoy your new space",
            ]),
            ("First Month", [
                "Establish cleaning routine",
                "Memorize garbage/recycling schedule",
                "Meet at least one neighbour",
                "Find go-to grocery store, pharmacy, coffee shop",
                "Purchase basic toolkit",
                "Save emergency maintenance number",
                "Host first guest",
            ]),
        ]

        for section_title, items in sections:
            self.section_heading(section_title)
            for item in items:
                self.draw_checkbox(item, size=10)
            self.spacer(4)

    # ── IMPORTANT INFO ──
    def _important_info(self):
        self.chapter_title(None, "Important Information")
        self.draw_text("Fill this in and keep it handy. This is your quick-reference page.", size=11)
        self.spacer(6)

        self.section_heading("Landlord & Building")
        self.draw_text_field("Landlord name:")
        self.draw_text_field("Landlord phone:")
        self.draw_text_field("Landlord email:")
        self.draw_text_field("Building manager name:")
        self.draw_text_field("Building manager phone:")
        self.draw_text_field("Emergency maintenance number:")

        self.section_heading("Utilities")
        self.draw_text_field("Internet provider / account #:")
        self.draw_text_field("Wifi network name:")
        self.draw_text_field("Wifi password:")
        self.draw_text_field("Hydro provider / account #:")
        self.draw_text_field("Gas provider / account # (if applicable):")
        self.draw_text_field("Tenant insurance provider / policy #:")

        self.section_heading("Schedule")
        self.draw_text_field("Garbage pickup day:")
        self.draw_text_field("Recycling pickup day:")
        self.draw_text_field("Rent due date:")
        self.draw_text_field("Rent payment method:")

        self.section_heading("Nearby Essentials")
        self.draw_text_field("Nearest hospital / urgent care:")
        self.draw_text_field("Nearest pharmacy:")
        self.draw_text_field("Nearest grocery store:")
        self.draw_text_field("Non-emergency police line:")

    # ── COMPLETION ──
    def _completion(self):
        self.new_page(bg=SAGE_DARK)
        self.y = H - 2.5 * inch
        self.draw_text("You're Home!", size=36, color=WHITE, bold=True, align="center")
        self.spacer(20)
        self.c.setFillColor(BEIGE)
        self.c.rect(W/2 - 60, self.y, 120, 2, fill=1, stroke=0)
        self.spacer(20)
        self.draw_text("Congratulations on your new space.", size=14, color=CREAM, align="center")
        self.draw_text("You survived move-in week.", size=14, color=CREAM, align="center")
        self.spacer(30)

        # Move-in date field
        self.c.setFont("Helvetica", 12)
        self.c.setFillColor(CREAM)
        self.c.drawString(W/2 - 80, self.y, "My move-in date:")
        form = self.c.acroForm
        form.textfield(name=self._field_name("tf"), x=W/2 + 30, y=self.y - 4,
                       width=150, height=20, borderColor=BEIGE, fillColor=WHITE,
                       textColor=CHARCOAL, fontSize=11, borderWidth=1)
        self.y -= 40

        self.draw_text("Things I Love About My New Place:", size=14, color=BEIGE, bold=True, align="center")
        self.spacer(10)
        for i in range(1, 6):
            self.c.setFont("Helvetica", 11)
            self.c.setFillColor(CREAM)
            self.c.drawString(MARGIN + 20, self.y, f"{i}.")
            form.textfield(name=self._field_name("tf"), x=MARGIN + 40, y=self.y - 4,
                           width=CW - 60, height=18, borderColor=BEIGE, fillColor=WHITE,
                           textColor=CHARCOAL, fontSize=10, borderWidth=1)
            self.y -= 30

        self.spacer(30)
        self.draw_text("SmallSpaceHome.ca", size=14, color=WHITE, bold=True, align="center")
        self.draw_text("Making small spaces work beautifully.", size=11, color=CREAM, align="center")


if __name__ == "__main__":
    builder = PDFBuilder()
    builder.build()
