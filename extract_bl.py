import pdfplumber
import pandas as pd
import sys

pdf_path = "/home/adminpc/junkyard/junkyard-1/Semrush-Backlink_List-junkyardsnearme_com_(domain)-30th_Sep_2026.pdf"
out_path = "/home/adminpc/junkyard/junkyard-1/junkyardsnearme_backlinks_extracted.csv"

data = []
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        # extract table or text
        table = page.extract_table()
        if table:
            data.extend(table)
        else:
            text = page.extract_text()
            if text:
                for line in text.split('\n'):
                    data.append([line])
df = pd.DataFrame(data)
df.to_csv(out_path, index=False)
print(f"Extracted backlink data to {out_path}, total rows: {len(df)}")
