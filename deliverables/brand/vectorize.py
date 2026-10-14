# Trace a flat-colour logo PNG into clean, part-separated polygon SVGs.
import sys, math, cv2, numpy as np
src, base, eps_px, min_area, crop_bottom = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
img = cv2.imread(src)[:, :, ::-1].astype(np.float32)
H, W = img.shape[:2]
PAL = {"ink": (233, 251, 255), "cyan": (95, 230, 255), "bg": (5, 7, 18)}
names = list(PAL); cols = np.array([PAL[n] for n in names], np.float32)
lab = ((img[:, :, None, :] - cols[None, None]) ** 2).sum(-1).argmin(-1)
lab[int(H * crop_bottom):] = names.index("bg")
k3 = np.ones((3, 3), np.uint8)

def snap(poly, tol_deg=4):
    """Make near-horizontal / near-vertical / near-45deg edges exact."""
    p = poly.astype(np.float64)
    for _ in range(3):
        n = len(p)
        for i in range(n):
            a, b = p[i], p[(i + 1) % n]
            dx, dy = b - a
            ang = math.degrees(math.atan2(dy, dx)) % 180
            if min(ang, 180 - ang) < tol_deg:            # horizontal
                y = (a[1] + b[1]) / 2; a[1] = b[1] = y
            elif abs(ang - 90) < tol_deg:                 # vertical
                x = (a[0] + b[0]) / 2; a[0] = b[0] = x
    return p

def trace(mask):
    cnts, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    parts = []
    if hier is None: return parts
    hier = hier[0]
    for i, c in enumerate(cnts):
        if hier[i][3] != -1 or cv2.contourArea(c) < min_area: continue   # outer contours only
        rings = [c] + [cnts[j] for j in range(len(cnts)) if hier[j][3] == i and cv2.contourArea(cnts[j]) >= min_area / 4]
        d = []
        for r in rings:
            a = snap(cv2.approxPolyDP(r, eps_px, True).reshape(-1, 2))
            d.append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in a) + "Z")
        x, y, w, h = cv2.boundingRect(c)
        parts.append((" ".join(d), (x, y, x + w, y + h), len(d)))
    return parts

ink = (lab == names.index("ink")).astype(np.uint8) * 255
cy = (lab == names.index("cyan")).astype(np.uint8) * 255
ink = cv2.morphologyEx(cv2.morphologyEx(ink, cv2.MORPH_OPEN, k3), cv2.MORPH_CLOSE, k3)
cy = cv2.morphologyEx(cv2.morphologyEx(cy, cv2.MORPH_OPEN, k3), cv2.MORPH_CLOSE, k3)
# cyan sits on top of ink: grow it slightly so the anti-aliased seam between them disappears,
# but only where it touches ink (never into the background)
grown = cv2.dilate(cy, np.ones((5, 5), np.uint8))
touch = cv2.dilate(ink, np.ones((7, 7), np.uint8)) > 0
cy = np.where((grown > 0) & touch, 255, cy).astype(np.uint8)

layers = [("ink", "#e9fbff", trace(ink)), ("cyan", "#5fe6ff", trace(cy))]
bb = [min(b[0] for _, _, ps in layers for _, b, _ in ps), min(b[1] for _, _, ps in layers for _, b, _ in ps),
      max(b[2] for _, _, ps in layers for _, b, _ in ps), max(b[3] for _, _, ps in layers for _, b, _ in ps)]
side = max(bb[2] - bb[0], bb[3] - bb[1]) * 1.12
cx, cyy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
vb = f"{cx - side/2:.1f} {cyy - side/2:.1f} {side:.1f} {side:.1f}"
body = []
for lname, fill, ps in layers:
    body.append(f'<g id="{lname}" fill="{fill}" fill-rule="evenodd">')
    for i, (d, _, _) in enumerate(ps):
        body.append(f'<path id="{lname}-{i+1:02d}" d="{d}"/>')
    body.append("</g>")
    print(lname, "parts", len(ps))
g = "".join(body)
open(base + ".svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{g}</svg>')
open(base + "-dark.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><rect x="{cx-side/2:.1f}" y="{cyy-side/2:.1f}" width="{side:.1f}" height="{side:.1f}" fill="#050712"/>{g}</svg>')
