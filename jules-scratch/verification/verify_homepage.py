from playwright.sync_api import sync_playwright, expect, Page

def verify_homepage(page: Page):
    """
    Navigates to the homepage, waits for the content to load,
    and takes a screenshot to verify the layout of recent listings.
    """
    # 1. Navigate to the local development server URL.
    page.goto("http://localhost:3000")

    # 2. Wait for the main content to be visible.
    # We'll wait for the "Recent Product Requests" heading to ensure the page is loaded.
    expect(page.get_by_role("heading", name="Recent Product Requests")).to_be_visible()

    # 3. Take a screenshot of the entire page.
    page.screenshot(path="jules-scratch/verification/homepage_verification.png")

# Boilerplate to run the script
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_homepage(page)
        browser.close()