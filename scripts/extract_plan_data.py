import fitz
import re
import json
import os

pdf_path = r"C:\Users\HomePC\.gemini\antigravity\brain\68cccaa2-cb1f-43df-a792-6680b33280de\.user_uploaded\media_1794533110677_a2b8225f.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

# Page visual dimensions
# width = 3370, height = 2384
W = 3370.0
H = 2384.0

rot_mat = page.rotation_matrix

# Regex to capture room names and areas
# Examples:
# 'A= 4,86 m² ESTAR'
# 'A= 2,81 m² I.S.'
# 'A= 9,36 m² QUARTO'
# 'A= 7,27 m² COZINHA / JANTAR'
# 'A= 2,72 m² SACADA'
# 'A= 9,76 m² SUÍTE'
# 'A= 13,93 m² ESTAR / JANTAR'
# 'A= 6,39 m² COZINHA / LAVAND.'
# 'A= 18,86 m² ESCADA'
# 'A= 37,87 m² CIRCULAÇÃO'
# 'A= 123,09 m² TERRAÇO DESCOBERTO'

blocks = page.get_text("blocks")

rooms = []

for b in blocks:
    text = b[4].strip()
    if "A=" in text or "m²" in text:
        r = fitz.Rect(b[:4]) * rot_mat
        r.normalize()
        
        # Calculate percent coordinates on the 3370x2384 sheet
        x_pct = round((r.x0 / W) * 100, 2)
        y_pct = round((r.y0 / H) * 100, 2)
        w_pct = round(((r.x1 - r.x0) / W) * 100, 2)
        h_pct = round(((r.y1 - r.y0) / H) * 100, 2)
        
        # Determine floor based on coordinates
        # Top-Left: 4º Pavimento
        # Top-Right: Pavimento Tipo (5º ao 17º)
        # Bottom: 18º Pavimento
        cx = (r.x0 + r.x1) / 2
        cy = (r.y0 + r.y1) / 2
        
        if cx > 2800:
            floor = "Quadro de Áreas"
        elif cy < 1180:
            if cx < 1450:
                floor = "4º Pavimento"
            else:
                floor = "Pavimento Tipo (5º–17º)"
        else:
            floor = "18º Pavimento"
            
        # Parse individual area tokens in this block
        # Some blocks have multiple: "A= 6,24 m² QUARTO A= 2,56 m² CIRC."
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        full_line = " ".join(lines)
        
        # Split on A=
        parts = re.split(r"(A=\s*[\d,.]+\s*m²)", full_line)
        current_area = None
        for p in parts:
            p = p.strip()
            if not p:
                continue
            m = re.match(r"A=\s*([\d,.]+)\s*m²", p)
            if m:
                current_area = float(m.group(1).replace(",", "."))
            elif current_area is not None:
                name = p.strip(" -./")
                if not name:
                    name = "Ambiente"
                
                # Category
                cat = "Outros"
                n_up = name.upper()
                if "QUARTO" in n_up or "SUÍTE" in n_up:
                    cat = "Dormitório"
                elif "ESTAR" in n_up or "JANTAR" in n_up:
                    cat = "Social / Estar"
                elif "COZINHA" in n_up or "LAVAND" in n_up:
                    cat = "Serviço / Cozinha"
                elif "I.S" in n_up or "BWC" in n_up or "SANIT" in n_up:
                    cat = "Sanitário"
                elif "SACADA" in n_up or "TERRAÇO" in n_up:
                    cat = "Área Externa"
                elif "CIRC" in n_up or "HALL" in n_up:
                    cat = "Circulação"
                elif "ESCADA" in n_up or "ELEVADOR" in n_up:
                    cat = "Circulação Vertical"
                elif "TÉC" in n_up:
                    cat = "Técnica"

                # Estimate perimeter: 4 * sqrt(area) for roughly square rooms
                perim = round(4 * (current_area ** 0.5), 2)
                # Wall area with standard ceiling height h = 2.80m
                wall_area = round(perim * 2.80, 2)
                
                rooms.append({
                    "floor": floor,
                    "name": name,
                    "category": cat,
                    "area": current_area,
                    "perimeter": perim,
                    "wall_area": wall_area,
                    "box": {
                        "x": x_pct,
                        "y": y_pct,
                        "w": max(w_pct, 1.8),
                        "h": max(h_pct, 1.4)
                    }
                })
                current_area = None

out_file = r"c:\Users\HomePC\Documents\GITHUBS\craft-apps\public\plan_data.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump({
        "metadata": {
            "title": "CONSTRUÇÃO DE HABITAÇÃO COLETIVA EM ALVENARIA",
            "units": "93 APARTAMENTOS E 122 QUITINETES",
            "sheet": "PLANTA 4º PAVIMENTO, TIPO 1 E 18º PAVIMENTO",
            "scale": "1:75",
            "author": "ARQ. Alexandre Baioni Trento / ENG. Tiago de Mio",
            "total_annotations": len(rooms)
        },
        "rooms": rooms
    }, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(rooms)} room records to {out_file}")
