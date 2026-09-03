import re

with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

replacements = {
    "Transaction Amount (?)": "Transaction Amount (&#8377;)",
    "Deductions (?)": "Deductions (&#8377;)",
    "id=\"mdr-res1-net\">?0.00": "id=\"mdr-res1-net\">&#8377;0.00",
    "id=\"mdr-res2-ded\">?0.00": "id=\"mdr-res2-ded\">&#8377;0.00",
    "id=\"mdr-res2-net\">?0.00": "id=\"mdr-res2-net\">&#8377;0.00",
    "Average Basket Value (?)": "Average Basket Value (&#8377;)",
    "Monthly Card Volume (?)": "Monthly Card Volume (&#8377;)",
    "Debit Card Rate (? ?2000) (%)": "Debit Card Rate (&le; &#8377;2000) (%)",
    "Debit Card Rate (> ?2000) (%)": "Debit Card Rate (&gt; &#8377;2000) (%)",
    "Device Rent / Subsidy (?)": "Device Rent / Subsidy (&#8377;)",
    "Setup / Plan Fee (?)": "Setup / Plan Fee (&#8377;)"
}

for old, new in replacements.items():
    text = text.replace(old, new)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("index.html fixed successfully!")
