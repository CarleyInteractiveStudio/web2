import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})

        await page.goto("http://localhost:8000")
        await page.wait_for_timeout(2000)

        # Take screenshot of Hero Section with shooting stars canvas
        await page.screenshot(path="/home/jules/verification/screenshots/carley_hero_shooting_stars.png")
        print("Hero screenshot saved.")

        # Scroll to 3D section
        three_section = page.locator("#video-juegos")
        await three_section.scroll_into_view_if_needed()
        await page.wait_for_timeout(3000)

        await page.screenshot(path="/home/jules/verification/screenshots/carley_3d_room_plane.png")
        print("3D section screenshot saved.")

        # Click on the 3D container to trigger airplane flight redirection
        container = page.locator("#paperAirplane3dContainer")
        await container.click(position={"x": 200, "y": 150})
        await page.wait_for_timeout(1500)

        await page.screenshot(path="/home/jules/verification/screenshots/carley_3d_plane_clicked.png")
        print("Clicked 3D section screenshot saved.")

        await browser.close()

asyncio.run(run())
