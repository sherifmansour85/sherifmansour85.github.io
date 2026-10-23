# Hayakkom on Google Play — launch kit

The Android app is a **Trusted Web Activity (TWA)**: a small Android package that opens www.hayakkom.com
full-screen, without a browser bar. The website stays the single source of truth, so every change to the
site appears in the app immediately, with no app update needed.

The website side is ready (installable manifest, icons, offline page, app shortcuts). What remains needs
your Google account, your company details and a signing key, so it has to be done by you.

## 1. Before you start (one-off)

| Item | Notes |
|---|---|
| Google Play developer account | play.google.com/console, one-time USD 25 fee. |
| Account type: **Organisation** | Register as the company (Hayakom for Healthcare Solutions and Logistic Services). It needs a free **D-U-N-S number** (dnb.com); this can take a few weeks, so request it first. A *personal* account must instead run a closed test with at least 12 testers for 14 days before it can publish. |
| Contact details shown on Play | support@hayakkom.com, www.hayakkom.com, +20 100 010 0529 |
| Privacy policy URL | https://www.hayakkom.com/privacy/ |

## 2. Build the app package (about 10 minutes, no coding)

1. Open **https://www.pwabuilder.com**, enter `https://www.hayakkom.com` and press **Start**.
2. Choose **Package for stores → Android → Generate package**, then open **All settings**:

   | Setting | Value |
   |---|---|
   | Package ID | `com.hayakkom.app` (permanent; it can never change after upload) |
   | App name / Launcher name | `Hayakkom` |
   | App version / version code | `1.0.0` / `1` |
   | Host | `www.hayakkom.com` |
   | Start URL | `/?source=twa` |
   | Theme / status bar colour | `#0A2E36` |
   | Background / splash colour | `#F2F6F5` |
   | Display mode | Standalone |
   | Notification delegation | On |
   | Signing key | **Create new**, using the company name and support@hayakkom.com |

3. Download the zip. It contains `app-release-bundle.aab` (the file for Play), `app-release-signed.apk`
   (for testing on your own phone), `signing.keystore`, `signing-key-info.txt` and `assetlinks.json`.
4. **Back up `signing.keystore` and `signing-key-info.txt` in two safe places** (not in this repository,
   not by email). Every future update must be signed with this key.

## 3. Link the app to the website (removes the browser bar)

Android only shows the app full-screen when the website confirms it owns the app, through
`https://www.hayakkom.com/.well-known/assetlinks.json`. This needs two fingerprints:

1. The **upload key** fingerprint: inside PWABuilder's `assetlinks.json`.
2. The **Play app-signing key** fingerprint: after the first upload, Play Console → your app →
   **Test and release → App integrity → App signing** → copy *SHA-256 certificate fingerprint*.

Send both fingerprints to Claude (they are public, not secret) and they will be published in
`.well-known/assetlinks.json`. Until then the app works but shows a thin address bar at the top.

## 4. Play Console: create the app and fill in the forms

Create app → name `Hayakkom`, default language **Arabic (ar)**, type **App**, **Free**.
Upload `app-release-bundle.aab` to **Internal testing** first, install it on your phone, check it, then
promote it to Production.

### Store listing — Arabic (default)

- **App name (≤30):** حياكم: رحلات وعلاج في مصر
- **Short description (≤80):** عطلات وإقامة ورعاية طبية موثوقة في مصر للعائلات الخليجية، بالعربية والإنجليزية
- **Full description:**

```
حياكم بوابتك إلى مصر: نرتّب لعائلتك عطلات فاخرة وإقامات مريحة ورعاية طبية موثوقة، بالعربية والإنجليزية، من السعودية والإمارات والكويت.

ماذا تجد في التطبيق
• باقات عطلات: شرم الشيخ والبحر الأحمر والساحل الشمالي وكروز النيل والقاهرة، بأسعار تقديرية بالريال.
• الرعاية الطبية في مصر: الأسنان وزراعة الشعر وجراحات السمنة والتجميل والعلاج الطبيعي والفحوصات الشاملة، لدى مستشفيات وعيادات مصرية مرخّصة.
• حاسبة تكلفة الرحلة: تقدير فوري للعلاج والفندق والتنقلات بالريال أو الدرهم أو الدينار.
• طبيب في الفندق ومساعدة للزوار الموجودين في مصر.
• أرسل حالتك أو تواصل معنا عبر واتساب، ونردّ بعرض مكتوب ومفصّل قبل أي دفع.

كيف نعمل
حياكم شركة تنسيق مصرية مسجّلة (سجل تجاري 49973). لسنا مستشفى ولا عيادة ولا وكالة سفر: يقدّم العلاج أطباء ومستشفيات مصرية مرخّصة يتخذون كل القرارات الطبية، وتُنفَّذ الرحلات والإقامة والنقل عبر شركات سياحة مصرية مسجّلة. الأسعار المعروضة تقديرية ولا تشمل الطيران. وإذا كنت مقيماً في السعودية فإنك تحجز وتدفع داخل المملكة بالريال عبر شريكنا السعودي المرخّص.

تواصل معنا: support@hayakkom.com · واتساب ‎+20 103 156 7949
```

### Store listing — English (add as a translation)

- **App name (≤30):** Hayakkom: Egypt Travel & Care
- **Short description (≤80):** Holidays, stays and trusted medical care in Egypt for Gulf families
- **Full description:**

```
Hayakkom is your gateway to Egypt: we coordinate luxury holidays, comfortable stays and trusted medical care for families from Saudi Arabia, the UAE and Kuwait, in Arabic and English.

What you can do in the app
• Holiday packages: Sharm el-Sheikh, the Red Sea, the North Coast, Nile cruises and Cairo, with indicative prices in SAR.
• Medical care in Egypt: dental, hair transplant, weight-loss and cosmetic surgery, physiotherapy and full check-ups with licensed Egyptian hospitals and clinics.
• Trip cost calculator: an instant estimate for treatment, hotel and transfers in SAR, AED or KWD.
• A doctor at your hotel and help for visitors already in Egypt.
• Send your case or message us on WhatsApp; we reply with a written, itemised quote before you pay anything.

How we work
Hayakkom is a registered Egyptian coordination company (Commercial Register 49973). We are not a hospital, clinic or travel agency: treatment is given by licensed Egyptian doctors and hospitals, who make every clinical decision, and trips, stays and transport are operated by registered Egyptian tourism companies. Prices shown are indicative and exclude flights. If you live in Saudi Arabia, you book and pay in Saudi Arabia, in riyals, through our licensed Saudi partner company.

Contact: support@hayakkom.com · WhatsApp +20 103 156 7949
```

### Graphics (in this folder)

| Asset | File | Play requirement |
|---|---|---|
| App icon | `icon-512-play.png` | 512×512 PNG, full square (Play rounds the corners) |
| Feature graphic | `feature-graphic-1024x500.png` | 1024×500 |
| Phone screenshots | take them yourself (below) | 2–8 images, sides between 320 and 3840 px, long side at most twice the short side |

**Screenshots:** install the test APK on your phone, open the app and take 4–6 screenshots: Arabic home,
holiday packages, the calculator showing a result, a treatment page (e.g. dental) and the contact/WhatsApp
screen. Accept or reject the cookie banner first so it is not in the picture. Most phones are taller than
2:1, so crop each one to 1080×2160 (or 1080×1920) before uploading; Claude can do the cropping if you send them.

### App content forms

| Form | Answer |
|---|---|
| Privacy policy | https://www.hayakkom.com/privacy/ |
| App access | All functionality available without special access (no login) |
| Ads | **No**, the app shows no ads |
| Content rating | Answer **No** to violence, sexual content, gambling and drugs. Users can contact the business but cannot chat with each other. Expected rating: Everyone / PEGI 3 |
| Target audience | **18 and over** |
| News app | No |
| Health apps declaration | Select *Healthcare services and management*. The app does not diagnose or treat, is not a medical device and does not connect to health sensors |
| Financial features | None (no payments in the app) |
| Government app | No |

### Data safety form (matches the privacy policy)

Data is **encrypted in transit** (HTTPS): **Yes**. Users can **request deletion**: **Yes**, by emailing
support@hayakkom.com. Account creation: **none**.

| Data type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Personal info: name, email, phone | Yes | No | Optional (only if the user sends an enquiry) | App functionality, Developer communications |
| Health info | Yes | No | Optional (only if the user sends their case) | App functionality |
| Photos / Files and docs (reports, scans) | Yes | No | Optional | App functionality |
| App activity: app interactions | Yes | No | Optional (cookie consent) | Analytics |
| Device or other IDs | Yes | **Yes** | Optional (cookie consent) | Analytics, Advertising or marketing (Google Analytics, Google Ads) |
| Approximate location | Yes | No | Optional (cookie consent) | Analytics (Google Analytics derives a city from the IP address) |

Transfers to service providers that work on your behalf (Jotform, WhatsApp) do not count as "sharing" under
Play's rules. Sending a patient's details to the treating provider only after their consent is a
user-initiated transfer. The Google Ads row is marked "shared" to be safe. Check these answers with your own
judgement or your lawyer before submitting.

## 5. Things that could slow approval

- **"Minimum functionality" policy:** Google can reject apps that are just a website. Mention in the review
  notes that the app has a trip-cost calculator, an AI assistant, case submission, home-screen shortcuts and an
  offline screen, and that it is the company's official app for www.hayakkom.com.
- **Health claims:** keep the listing wording as above (coordination, licensed providers, no guaranteed results).
- **Address bar visible:** means `assetlinks.json` is missing or has the wrong fingerprint (step 3).

## 6. Updating the app later

Website changes need no app update. Rebuild in PWABuilder only to change the icon, name, colours or
package settings: use the **same package ID and the same signing key**, and raise the version code (2, 3, …).
