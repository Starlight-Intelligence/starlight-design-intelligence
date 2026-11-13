from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
themes=json.loads((root/'tokens/tokens.json').read_text())['themes']
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="660" viewBox="0 0 1440 660"><title>Starlight Living Library / semantic theme projection</title><rect width="1440" height="660" fill="#f2f4f1"/><text x="40" y="52" font-family="sans-serif" font-size="26" fill="#182a2b">Living Design / three semantic themes</text><text x="40" y="84" font-family="sans-serif" font-size="13" fill="#506360">Editable SVG · code token projection · RC 0.2 · no portfolio identity promotion</text>']
for column,(theme,tokens) in enumerate(themes.items()):
    x=40+column*465
    parts.append(f'<text x="{x}" y="130" font-family="sans-serif" font-size="20" fill="#182a2b">{theme.title()}</text>')
    for row,(name,token) in enumerate(tokens.items()):
        y=155+row*49
        color='#'+''.join(f'{round(c*255):02x}' for c in token['$value']['components'])
        parts.append(f'<rect x="{x}" y="{y}" width="82" height="34" rx="5" fill="{color}" stroke="#7d918b"/><text x="{x+98}" y="{y+14}" font-family="monospace" font-size="12" fill="#182a2b">--sl-{name}</text><text x="{x+98}" y="{y+31}" font-family="monospace" font-size="11" fill="#506360">{color}</text>')
parts.append('</svg>')
(root/'assets/living-theme-sheet.svg').write_text(''.join(parts)+'\n')
print('assets/living-theme-sheet.svg / 27 exact color swatches')
