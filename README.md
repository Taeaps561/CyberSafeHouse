# 🛡️ Cozy Cyber Security Awareness Game

เกม 2D Narrative Point & Click สไตล์อบอุ่น สบายตา สำหรับสร้างความตระหนักรู้ด้านความปลอดภัยทางไซเบอร์ (Cyber Security Awareness) เล่นบนเว็บเบราว์เซอร์

## ✨ ฟีเจอร์เด่น (Key Features)
- **สไตล์ภาพอบอุ่น & มินิมอล**: ฉากห้องทำงาน 2D สไตล์ Cozy พร้อมตัวละครเวกเตอร์และแอนิเมชัน Idle Breathing / Talking Bounce
- **ระบบภารกิจและวัฏจักรวัน (Day Cycle)**:
  - **Day 1**: 
    - 📡 **เราเตอร์ Wi-Fi**: ตรวจสอบและตั้งค่ารหัสผ่าน Router Admin Dashboard ที่แข็งแกร่ง ป้องกัน Brute Force
    - 📧 **อีเมล Phishing**: ตรวจจับและรายงานอีเมลฟิชชิงจากกล่องจดหมายเข้า สังเกตโดเมนและลิงก์ปลอม
  - **Day 2**: 
    - 📱 **SMS Scam**: ตรวจสอบข้อความ SMS หลอกลวงบนสมาร์ตโฟน บล็อกเบอร์และป้องกันมัลแวร์
- **ระบบคะแนนความปลอดภัย (Security Score)**: เก็บคะแนนความปลอดภัย พร้อมการประเมินระดับ Rank (S Rank / A Rank) และออกใบประกาศนียบัตร Cyber Guardian
- **สมุดบันทึกภารกิจ (Quest Log)**: บันทึกและแสดงความคืบหน้ารายการสิ่งที่ต้องทำในแต่ละวัน
- **ระบบเสียงสังเคราะห์ (Web Audio API)**: สังเคราะห์เสียงกระดิ่ง (Bell Chime Effect) โดยตรงในเบราว์เซอร์ ไม่ต้องพึ่งพาไฟล์เสียงภายนอก

## 🚀 วิธีการเล่น (How to Run)
เปิดไฟล์ `index.html` ด้วยเว็บเบราว์เซอร์ หรือรันผ่าน Local Server เช่น:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- HTML5 / Vanilla CSS3 (Custom Glassmorphism, Responsive Grid, Keyframe Animations)
- Vanilla JavaScript (ES6+, Web Audio API, Canvas API)
