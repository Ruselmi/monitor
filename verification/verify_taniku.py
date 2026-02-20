from playwright.sync_api import sync_playwright, expect
import time

def verify_taniku(page):
    # Route to block external resources to simulate offline mode
    def block_routes(route):
        url = route.request.url
        if "itunes.apple.com" in url:
            print(f"🚫 Blocking: {url}")
            route.abort()
        elif "cdn.jsdelivr.net" in url or "unpkg.com" in url:
            print(f"🚫 Blocking: {url}")
            route.abort()
        else:
            route.continue_()

    page.route("**/*", block_routes)

    # Navigate to the app
    print("Navigating to app (Offline Mode)...")
    page.goto("http://localhost:8000/monitoringarea/index.html")

    # 1. Verify Safe Mode Button (appears after 5s)
    print("Waiting for Safe Mode button...")
    try:
        # The button is hidden by default style="display:none" and shown by JS timeout
        # But if loadingOverlay is hidden by init(), we won't see it.
        # Since we blocked scripts, chartJsError might trigger if the browser handles it,
        # or init might fail/hang.

        force_btn = page.locator("#forceEnterBtn")
        force_btn.wait_for(state="visible", timeout=7000)
        print("✅ Safe Mode button appeared")

        # Click it to enter
        force_btn.click()
        print("✅ Clicked Safe Mode button")

    except Exception as e:
        print(f"⚠️ Safe Mode button check issue: {e}")
        # If it didn't appear, maybe init() finished?
        # Let's check if we are in the dashboard
        if page.locator("#tabDashboard").is_visible():
            print("ℹ️ App loaded anyway (maybe error handling worked automatically)")

    # 2. Verify Telegram Command
    print("Testing /status command...")
    # Click AI tab
    page.locator("button[data-tab='tabChatbot']").click()

    # Type /status
    chat_input = page.locator("#chatInput")
    chat_input.fill("/status")
    page.locator("#sendChatBtn").click()

    # Wait for response
    page.wait_for_timeout(3000)

    # Check if response contains "STATUS SISTEM"
    messages = page.locator("#chatMessages")
    expect(messages).to_contain_text("STATUS SISTEM")
    print("✅ /status command worked")

    # 3. Verify Music Offline Fallback
    print("Testing Music Offline...")
    # Click Settings tab
    page.locator("button[data-tab='tabSettings']").click()

    # Type search
    music_input = page.locator("#musicSearch")
    music_input.fill("Petani")
    page.locator("#searchMusicBtn").click()

    # Wait for results
    page.wait_for_timeout(2000)

    # Check for mock result "Petani Makmur (Offline)"
    music_list = page.locator("#musicList")
    expect(music_list).to_contain_text("Petani Makmur (Offline)")
    print("✅ Offline Music search worked (Mock Data returned)")

    # Take screenshot
    page.screenshot(path="verification/taniku_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_taniku(page)
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            page.screenshot(path="verification/failed.png")
        finally:
            browser.close()
