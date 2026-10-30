KUTTARMARE AGRO FARM — WEBSITE STARTER
======================================

इस प्रोजेक्ट में शामिल है:
- Responsive Hindi/English website
- Fruits, Poultry और Vegetables categories
- Search, category filter और price sorting
- Wholesale + Retail prices
- WhatsApp enquiry buttons (+91 9370016727)
- Product management page: admin.html
- GitHub Pages के लिए static frontend
- Supabase database connection के लिए starter config और SQL

IMPORTANT — अभी क्या Demo है?
------------------------------
शुरुआती उत्पादों के भाव केवल DEMO/SAMPLE हैं। इन्हें असली भाव समझकर प्रकाशित न करें।
Admin page अभी बिना Supabase के उसी ब्राउज़र के localStorage में बदलाव सेव करता है।
इसका अर्थ है कि आपके फोन के admin changes दूसरे ग्राहकों के फोन पर नहीं दिखेंगे।
सभी visitors के लिए rates अपडेट करने और सुरक्षित admin login के लिए Supabase configure करना जरूरी है।

GITHUB PAGES पर प्रकाशित करना:
-------------------------------
1. GitHub पर नया Public repository बनाएं, उदाहरण: kuttarmare-agro-farm
2. इस ZIP की सभी files repository के root में upload करें (ZIP को सीधे upload न करें; पहले extract करें)।
3. Repository → Settings → Pages खोलें।
4. Build and deployment में "Deploy from a branch" चुनें।
5. Branch: main और folder: /(root) चुनकर Save करें।
6. कुछ मिनट बाद GitHub Pages URL खुलेगा: https://YOUR-USERNAME.github.io/kuttarmare-agro-farm/

SUPABASE जोड़ना (shared live rates + admin security):
-----------------------------------------------------
1. Supabase project, products table और Auth user पहले से बनाए गए हैं।
2. config.js में इस प्रोजेक्ट का Project URL, Publishable Key और Admin User UUID सेट है।
   Publishable Key browser में इस्तेमाल की जा सकती है; Secret/service_role key कभी न डालें।
3. Supabase → SQL Editor में supabase-schema.sql की पूरी सामग्री Run करें।
   इससे public read और केवल दिए गए Admin UUID के लिए insert/update/delete RLS policies बनेंगी।
4. Authentication → Users में बने admin user का UUID इस config.js और SQL में दिए UUID से बिल्कुल मेल खाना चाहिए।
5. admin.html खोलें और उसी Supabase Auth user के email/password से login करें।
6. Admin page पर Add/Edit/Delete करें। बदलाव Supabase में सेव होंगे और public website पर अपने आप refresh होंगे।
7. अगर SQL Editor में permission/policy error आए तो उसे ठीक किए बिना website को live न करें।

महत्वपूर्ण सुरक्षा:
- Browser में केवल Publishable Key रखें। Secret/service_role key कभी frontend में नहीं रखें।
- Admin UUID config.js में दिख सकता है; असली सुरक्षा database की RLS policies हैं।
- किसी दूसरे Auth user को admin policy नहीं मिलेगी।
- Public visitors केवल products पढ़ सकते हैं, बदलाव नहीं कर सकते।
- Admin account का password किसी के साथ साझा न करें।

BUSINESS DETAILS
----------------
Kuttarmare Agro Farm
Kudrara Village, Bhadrawati Taluka
Chandrapur, Maharashtra, India
WhatsApp: +91 9370016727

Before launch:
- Demo prices replace करें
- सही product list, units और images जोड़ें
- WhatsApp number verify करें
- Supabase Auth + RLS secure करें
- Mobile पर सभी pages test करें
