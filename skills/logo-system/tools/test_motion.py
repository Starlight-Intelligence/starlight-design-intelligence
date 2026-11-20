"""Verify a locally staged motion proof with installed Playwright and Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
from threading import Thread

from playwright.sync_api import sync_playwright


def verify(directory, output, chromium=None):
    output.mkdir(parents=True, exist_ok=True)
    handler = partial(SimpleHTTPRequestHandler, directory=directory)
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server, sync_playwright() as playwright:
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        url = f"http://127.0.0.1:{server.server_port}/motion.html"
        browser = playwright.chromium.launch(executable_path=chromium, args=["--no-sandbox"])
        try:
            page = browser.new_page(viewport={"width": 1100, "height": 720})
            page.goto(url)
            assert page.evaluate("window.gsap.version") == "3.15.0"
            button = page.get_by_role("button", name="Play motion")
            button.wait_for(state="visible")
            specimen = page.locator("figure")
            initial = specimen.screenshot()
            page.keyboard.press("Tab")
            assert button.evaluate("(button) => button === document.activeElement")
            page.keyboard.press("Enter")
            page.get_by_role("status").get_by_text("Playing").wait_for()
            page.wait_for_function("parseFloat(getComputedStyle(document.querySelector('circle')).opacity) < .99")
            page.screenshot(path=output / "motion-playing.png")
            page.get_by_text("Complete · original rest state").wait_for()
            assert initial == specimen.screenshot(), "Completed pixels differ from rest state"
            page.screenshot(path=output / "motion-desktop.png")

            button.click()
            page.get_by_role("status").get_by_text("Playing").wait_for()
            page.emulate_media(reduced_motion="reduce")
            button.wait_for(state="hidden")
            assert initial == specimen.screenshot(), "Changing preference did not restore the original"

            mobile = browser.new_page(viewport={"width": 375, "height": 760}, reduced_motion="reduce")
            mobile.goto(url)
            mobile.get_by_text("Static mark · reduced motion").wait_for()
            assert not mobile.get_by_role("button", name="Play motion").is_visible()
            assert mobile.evaluate("document.documentElement.scrollWidth === innerWidth")
            mobile.screenshot(path=output / "motion-reduced-mobile.png")

            no_js = browser.new_page(java_script_enabled=False)
            no_js.goto(url)
            assert no_js.get_by_role("img", name="Starlight Intelligence star").is_visible()
            assert no_js.locator("img").evaluate("(img) => img.complete && img.naturalWidth === 48")

            missing = browser.new_page()
            missing.route("**/gsap.min.js", lambda route: route.abort())
            missing.goto(url)
            assert missing.get_by_role("img", name="Starlight Intelligence star").is_visible()
            assert not missing.get_by_role("button", name="Play motion").is_visible()
        finally:
            browser.close()
            server.shutdown()
            thread.join()
    print("Motion checks passed: keyboard, animated pixels, identical rest pixels, live preference change, reduced mobile, no JavaScript, missing GSAP.")


if __name__ == "__main__":
    verify(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve(), *sys.argv[3:])
