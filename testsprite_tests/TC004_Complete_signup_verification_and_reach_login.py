import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Navigate to the '/register' page (http://localhost:5173/register) and check for the registration form
        await page.goto("http://localhost:5173/register")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'I accept the Terms & Conditions' checkbox, then click the 'Create Account' button to submit the registration.
        # checkbox
        elem = page.locator('[id="terms"]')
        await elem.click(timeout=10000)
        
        # -> Click the 'I accept the Terms & Conditions' checkbox, then click the 'Create Account' button to submit the registration.
        # button
        elem = page.locator('xpath=/html/body/div/div/div/div/main/div/form/div[4]/div/button')
        await elem.click(timeout=10000)
        
        # -> Scroll the registration page up to reveal the full form and locate the 'Mobile Number' input field.
        await page.mouse.wheel(0, 300)
        
        # -> Fill the registration form (Full Name, Mobile Number, Password, Confirm Password) and submit the form (press Enter) to create an account.
        # Sudheer Sharma text field
        elem = page.get_by_placeholder('Sudheer Sharma', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the registration form (Full Name, Mobile Number, Password, Confirm Password) and submit the form (press Enter) to create an account.
        # +919876543210 text field
        elem = page.get_by_placeholder('+919876543210', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("+919999999999")
        
        # -> Fill the registration form (Full Name, Mobile Number, Password, Confirm Password) and submit the form (press Enter) to create an account.
        # Min. 8 characters text field
        elem = page.get_by_placeholder('Min. 8 characters', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Password123!")
        
        # -> Fill the registration form (Full Name, Mobile Number, Password, Confirm Password) and submit the form (press Enter) to create an account.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Password123!")
        
        # -> Replace the Mobile Number with '+919888888888' and click the 'Create Account' button to attempt signup again.
        # +919876543210 text field
        elem = page.get_by_placeholder('+919876543210', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("+919888888888")
        
        # -> Replace the Mobile Number with '+919888888888' and click the 'Create Account' button to attempt signup again.
        # Create Account button
        elem = page.get_by_role('button', name='Create Account', exact=True)
        await elem.click(timeout=10000)
        
        # -> Enter the 6-digit code into the Mobile Verification Code inputs and submit the form (use the OTP inputs and press Enter).
        # text field
        elem = page.locator('xpath=/html/body/div/div/div/div/main/div/form/div/div/input')
        await elem.click(timeout=10000)
        
        # -> Click the 'Verify & Create Account' button on the OTP verification page.
        # button
        elem = page.locator('xpath=/html/body/div/div/div/div/nav/div/div/div/button')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the registration flow completes successfully
        # Assert: The URL contains 'verify-signup-otp', confirming the flow reached the OTP verification page.
        await expect(page).to_have_url(re.compile("verify\\-signup\\-otp"), timeout=15000), "The URL contains 'verify-signup-otp', confirming the flow reached the OTP verification page."
        # Assert: The page shows that a 6-digit OTP was sent to +919888888888, confirming signup progressed to verification.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("We've sent a 6-digit OTP verification code to your phone +919888888888", timeout=15000), "The page shows that a 6-digit OTP was sent to +919888888888, confirming signup progressed to verification."
        
        # --> Verify the login experience is available
        await page.locator("xpath=/html/body/div/div/div/div/nav/div/div/div/div/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Log in' link is visible in the navigation.
        await expect(page.locator("xpath=/html/body/div/div/div/div/nav/div/div/div/div/a[1]").nth(0)).to_be_visible(timeout=15000), "The 'Log in' link is visible in the navigation."
        # Assert: The 'Log in' link points to the /login route.
        await expect(page.locator("xpath=/html/body/div/div/div/div/nav/div/div/div/div/a[1]").nth(0)).to_have_attribute("href", "/login", timeout=15000), "The 'Log in' link points to the /login route."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    