import requests

url = "http://localhost:8000/api/ads/manage/"
data = {
    "title": "Test Title",
    "redirect_url": "https://new-portfolio-orpin-iota-64.vercel.app/#contact",
    "page": "home",
    "slot": "left_sidebar_ad",
    "template_type": "minimal",
    "button_text": "Visit Website",
    "show_badge": "true",
    "is_active": "true",
    "start_date": "2026-04-14",
    "end_date": "2026-04-14",
    "priority": 1
}

# Need to authenticate first. Let's create a quick script using Django management context to test serializer directly, which bypasses auth!
