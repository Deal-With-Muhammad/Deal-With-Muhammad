# Outlines tabular digits from Inter into assets/digits.json, used for numbers drawn at runtime.
import json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

font = instantiateVariableFont(TTFont("/usr/share/fonts/inter/InterVariable.ttf"), {"opsz": 32, "wght": 640})
glyphset, cmap = font.getGlyphSet(), font.getBestCmap()
names = {"0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", ",": "comma", "–": "endash"}
out = {"upem": font["head"].unitsPerEm, "glyphs": {}}
for char, name in names.items():
    glyph = name + ".tf" if name + ".tf" in glyphset else cmap[ord(char)]
    pen = SVGPathPen(glyphset, ntos=lambda v: str(round(v)))
    glyphset[glyph].draw(pen)
    out["glyphs"][char] = {"d": pen.getCommands(), "adv": glyphset[glyph].width}
json.dump(out, open("../assets/digits.json", "w"), separators=(",", ":"))
