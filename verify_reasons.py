import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        await page.goto("http://localhost:8000")
        await page.wait_for_timeout(1000)

        # Scroll down to #porque-preferirnos
        element = page.locator("#porque-preferirnos")
        await element.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)

        await element.screenshot(path="/home/jules/verification/screenshots/carley_reasons_bullet.png")
        await browser.close()

asyncio.run(run())
