import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  const form = new FormData();
  form.append('title', 'Test');
  form.append('redirect_url', 'https://new-portfolio-orpin-iota-64.vercel.app/#contact');
  form.append('page', 'home');
  form.append('slot', 'carousel_1');
  form.append('template_type', 'minimal');
  form.append('button_text', 'Visit Website');
  // Django DRF sometimes has issues with "true"/"false" if not properly parsed in multipart payload
  form.append('show_badge', 'true'); 
  form.append('is_active', 'true');
  form.append('start_date', '2026-04-14');
  form.append('end_date', '2026-04-14');
  form.append('priority', '1');

  try {
    // We need an admin auth token. I'll just temporarily disable auth in AdminAds view for testing, 
    // or just pass a hardcoded user if I have one.
    // Wait, the easiest way is to modify the ViewSet locally to remove permission temporarily.
    pass
  } catch (err) {
    console.log(err.response?.data);
  }
}
test();
