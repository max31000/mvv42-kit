"""Playwright screenshots of the playground: light/dark x 1440/390 for every page.

Usage: npm run playground:build && python scripts/screenshots.py [--base http://localhost:5199] [--only overview]
Starts `vite preview` itself unless --base is given. /auth/api/me is mocked here (never in the bundle).
"""

from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "screenshots"

USER = {
    "user": {
        "id": 1,
        "telegramId": 100000001,
        "name": "Мария Волкова",
        "username": "demo",
        "photoUrl": None,
        "isAdmin": True,
        "isOwner": True,
    },
    "apps": [{"id": "playground", "anonymous": False, "access": "public", "granted": True}],
}
ANON = {"user": None, "apps": [{"id": "playground", "anonymous": False, "access": "public", "granted": False}]}

# name, path, query, me, full_page
PAGES = [
    ("overview", "/", "", USER, True),
    ("components", "/components", "", USER, True),
    ("table", "/table", "", USER, False),
    ("charts", "/charts", "", USER, True),
    ("states", "/states", "", ANON, True),
    ("embedded", "/", "shell=1&accent=blue", USER, False),
    ("components-zinc", "/components", "accent=zinc", USER, True),
]
VIEWPORTS = [("1440", 1440, 900), ("390", 390, 844)]
SCHEMES = ["light", "dark"]


def me_handler(me: dict):
    body = json.dumps(me)

    def handle(route):
        route.fulfill(status=200, content_type="application/json", body=body)

    return handle


def wait_for(url: str, timeout: float = 30) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)
            return
        except Exception:
            time.sleep(0.3)
    raise RuntimeError(f"server at {url} did not start")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base")
    ap.add_argument("--only")
    args = ap.parse_args()

    server = None
    base = args.base
    if not base:
        base = "http://127.0.0.1:5199"
        server = subprocess.Popen(
            "npx vite preview --config playground/vite.config.ts",
            cwd=ROOT,
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        wait_for(base)

    OUT.mkdir(parents=True, exist_ok=True)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for name, path, query, me, full in PAGES:
                if args.only and args.only != name:
                    continue
                for scheme in SCHEMES:
                    for vname, w, h in VIEWPORTS:
                        ctx = browser.new_context(
                            viewport={"width": w, "height": h},
                            device_scale_factor=2 if w < 800 else 1,
                            color_scheme=scheme,
                            locale="ru-RU",
                        )
                        page = ctx.new_page()
                        page.add_init_script(f"localStorage.setItem('mvv42-color-scheme', '{scheme}')")
                        page.route("**/auth/api/me", me_handler(me))
                        url = f"{base}{path}" + (f"?{query}" if query else "")
                        page.goto(url, wait_until="networkidle")
                        page.wait_for_timeout(1600)
                        file = OUT / f"{name}-{scheme}-{vname}.png"
                        page.screenshot(path=str(file), full_page=full)
                        print(file.relative_to(ROOT))
                        ctx.close()
            browser.close()
    finally:
        if server:
            server.terminate()
            subprocess.run(f"taskkill /F /T /PID {server.pid}", shell=True, capture_output=True) if sys.platform == "win32" else None
    return 0


if __name__ == "__main__":
    sys.exit(main())
