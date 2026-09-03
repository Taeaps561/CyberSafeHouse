# 🛡️ CyberSafeHouse - Cozy Cyber Security Awareness Game

> **เกมจำลอง 2D Narrative Point & Click เสริมสร้างความตระหนักรู้ด้านความปลอดภัยไซเบอร์ประจำบ้าน**  
> สไตล์ภาพอบอุ่น สบายตา เล่นบนเว็บเบราว์เซอร์ได้ทันทีโดยไม่ต้องติดตั้งอะไรเพิ่มเติม!

🌐 **เล่นเกมออนไลน์ได้ทันที (Live Game Demo):**  
👉 **[https://taeaps561.github.io/CyberSafeHouse/](https://taeaps561.github.io/CyberSafeHouse/)** 👈

---

## 🎮 ภาพรวมเกม (Game Overview)

**CyberSafeHouse** นำพาผู้เล่นสวมบทบาทเป็น **"วิน"** ตัวเอกผู้รักความสงบในห้องทำงานส่วนตัว ที่ต้องเผชิญกับสถานการณ์จำลองภัยคุกคามไซเบอร์ในชีวิตประจำวัน ผ่านการสำรวจห้องแบบ Point & Click และแก้ปริศนามินิเกมเพื่อสะสมคะแนน **Security Score (100/100)** ในแต่ละวัน

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 1. 📅 วัฏจักรเนื้อเรื่องและภารกิจ 2 วันเต็ม (Day 1 & Day 2)
- **🌅 Day 1: ความปลอดภัยพื้นฐานเครือข่ายและอีเมล**
  - 📡 **เราเตอร์ Wi-Fi (Router Admin Dashboard)**: เปลี่ยนรหัสผ่านเริ่มต้นที่เปราะบาง (`admin1234`) เป็นรหัสผ่านที่ซับซ้อน ป้องกันการโจมตีแบบ Brute Force
  - 📧 **กล่องข้อความอีเมล (Phishing Email)**: ตรวจจับและรายงานอีเมลหลอกลวงที่แอบอ้างธนาคาร สังเกต Sender Domain ผิดปกติ (`@secure-bank-th.xyz`) และ Fake Link
- **🌇 Day 2: ภัยคุกคามโมบายล์และอุปกรณ์อัจฉริยะ**
  - 📱 **สมาร์ตโฟน & SMS Scam (2 สถานการณ์ยอดฮิต)**:
    - *เคสที่ 1: พัสดุติดค้างชำระค่าธรรมเนียม 18 บาท* (ตรวจจับ Phishing Link)
    - *เคสที่ 2: เงินกู้ด่วน 50,000 บาท* (สกัดกั้นการติดตั้งไฟล์ `.apk` แปลกปลอมที่เสี่ยงต่อการถูกดูดเงิน)
  - 💾 **แฟลชไดรฟ์ปริศนา (USB Drop Attack)**: รับมือกับ Flash Drive ที่ตกอยู่บนพื้นอย่างปลอดภัย ไม่เสียบเข้าคอมพิวเตอร์เพื่อป้องกัน BadUSB / AutoRun Ransomware
  - 📹 **กล้องวงจรปิดอัจฉริยะ (IoT Camera Security)**: ปิด Default Port (RTSP 554) และเปิดอัปเดต Firmware อัตโนมัติ ป้องกันการถูกแฮกดูภาพสดหรือตกเป็นส่วนหนึ่งของบอตเน็ต

### 2. 🧸 จุดสำรวจเกร็ดความรู้ในห้อง (Interactive Props & Easter Eggs)
- 📚 **ชั้นหนังสือ (Bookshelf)**: เกร็ดความรู้การเปิดใช้งาน **2FA (Two-Factor Authentication)**
- ☕ **แก้วกาแฟและโพสต์อิทบนโต๊ะ (Coffee Mug & Post-it)**: คำเตือนเรื่องการไม่จดรหัสผ่านแปะไว้รอบโต๊ะทำงาน
- 🔌 **ปลั๊กไฟพ่วงใต้โต๊ะ (Power Strip)**: การดูแลความปลอดภัยของฮาร์ดแวร์และการป้องกันไฟกระชาก

### 3. 🎵 ระบบเสียงประกอบและดนตรีบรรเลง (Web Audio API)
- ☕ **Cozy Lofi Ambient BGM**: ดนตรีบรรเลงคอร์ดเปียโนแจ๊สช่วงบ่าย (`Cmaj9` -> `Am9` -> `Dm9` -> `G13`) สังเคราะห์สดผ่าน Web Audio API (100% Offline ไม่ต้องพึ่งพาไฟล์ภายนอก)
- 🔊 **ระบบเสียงเอฟเฟกต์ (SFX)**:
  - 🖱️ เสียงคลิกปุ่มที่นุ่มนวล (Soft Bubble Tap)
  - ⌨️ เสียงพิมพ์ดีดเบาๆ (Typewriter Tick) สไตล์ ASMR ระหว่างตัวละครพูด
  - 📱 เสียงแจ้งเตือนมือถือ (Notification Chime) เมื่อเข้าสู่ Day 2 และเปิดแอป SMS
  - 🏆 เสียงสำเร็จ / Level Up (Success Chime) เมื่อได้คะแนน
  - 🚨 เสียงเตือนอันตราย (Warning Buzz) เมื่อเลือกตัวเลือกที่มีความเสี่ยง

### 4. 🎓 ใบประกาศนียบัตรแบบดาวน์โหลดได้จริง (Certificate Export)
- ออกใบประกาศนียบัตร **Certificate of Cyber Resilience** ประเมินผลระดับ **S Rank** หรือ **A Rank**
- ✍️ **พิมพ์ชื่อผู้เล่น**: กรอกชื่อ-นามสกุลของตนเองลงในใบประกาศได้โดยตรง
- 📥 **บันทึกรูปภาพ PNG คมชัดสูง (1200 × 850 px)** ผ่าน HTML5 Canvas API สำหรับแชร์ลง Social Media หรือแนบเป็นผลงานโครงงานการศึกษา

### 5. 📓 สมุดบันทึกภารกิจ (Quest Log)
- แถบเปิดดู Checklist รายการภารกิจ พร้อมระบุคะแนนที่ได้รับ และแสดงเหรียญตราเมื่อสำเร็จครบทุกข้อ

---

## 🛠️ เทคโนโลยีที่ใช้ (Technologies & Architecture)

- **Core**: HTML5 Semantic Markup, Vanilla Modern JavaScript (ES6+)
- **Styling**: Vanilla CSS3 (Custom Glassmorphism, Responsive Design, CSS Keyframe Animations)
- **Graphics**: HTML5 Canvas Rendering (วาดฉากห้อง, แสงเงากลางวัน/บ่าย, ใบประกาศนียบัตร)
- **Audio Engine**: Web Audio API (Oscillators, Biquad Lowpass Filters, Gain Nodes)
- **Deployment**: GitHub Pages

---

## 💻 การเปิดเล่นในเครื่อง (Run Locally)

เปิดไฟล์ `index.html` บนเว็บเบราว์เซอร์ได้โดยตรง หรือรันผ่าน Local HTTP Server:

```bash
# ด้วย Python
python -m http.server 8000

# หรือด้วย Node.js
npx serve .
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:8000`

---

## 📄 ใบอนุญาต (License)

พัฒนาขึ้นเพื่อการศึกษาและการสร้างความตระหนักรู้ด้านความปลอดภัยไซเบอร์ (Cyber Security Awareness) 🛡️
