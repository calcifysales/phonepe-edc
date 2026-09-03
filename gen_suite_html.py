import os

with open(r"C:\Users\tharu\.gemini\antigravity\scratch\calcify-app\index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Replace Rupee symbol and less-than-or-equal with HTML entities
text = text.replace("?", "&#8377;")
text = text.replace("?", "&le;")

# Remove UPI QR Subtab button
text = text.replace('<button class="sub-tab-btn active" data-target="tab-upi-qr" role="tab" type="button">UPI QR</button>\n          ', '')
text = text.replace('<button class="sub-tab-btn active" data-target="tab-upi-qr" role="tab" type="button">UPI QR</button>', '')

# Make MDR tab active by default
text = text.replace('<button class="sub-tab-btn" data-target="tab-mdr" role="tab" type="button">MDR</button>', '<button class="sub-tab-btn active" data-target="tab-mdr" role="tab" type="button">MDR</button>')
text = text.replace('<div id="tab-mdr" class="sub-section tool-card hidden">', '<div id="tab-mdr" class="sub-section tool-card">')

# Remove the entire UPI QR section
start_marker = "<!-- SUB TAB 1: UPI QR -->"
end_marker = "<!-- SUB TAB 2: MDR CALCULATOR -->"

if start_marker in text and end_marker in text:
    p1 = text.split(start_marker)[0]
    p2 = text.split(end_marker)[1]
    text = p1 + "<!-- SUB TAB 1: MDR CALCULATOR -->" + p2

# Remove qrcode.min.js script tag
text = text.replace('<script src="qrcode.min.js"></script>\n  ', '')
text = text.replace('<script src="qrcode.min.js"></script>', '')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Generated full index.html with all Quick Links! Size:", len(text))
