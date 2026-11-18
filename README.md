# Modular Monolith: ตัวอย่างร้านค้าออนไลน์

ตัวอย่างโปรเจกต์ **Modular Monolith** ด้วย Node.js + Express + MySQL (mysql2)
แอปเดียว deploy ครั้งเดียว แต่แบ่งเป็น 4 โมดูลที่แยกกันชัดเจน: `users`, `products`, `orders`, `payments`

> ทุกไฟล์มีคอมเมนต์ภาษาไทยบอกหน้าที่ไว้ที่หัวไฟล์

---

## โครงสร้าง

```
modular-monolith-ecommerce/
├── src/
│   ├── modules/
│   │   ├── users/          สมัคร, login, โปรไฟล์
│   │   ├── products/       สินค้า, stock
│   │   ├── orders/         คำสั่งซื้อ
│   │   └── payments/       การชำระเงิน
│   │       (ทุกโมดูลมี 6 ไฟล์เหมือนกัน: routes, controller, service, repository, model, index)
│   ├── shared/
│   │   ├── database/       connection กลาง (mysql2 pool)
│   │   ├── middlewares/    auth (ตรวจ login), errorHandler
│   │   ├── utils/          AppError
│   │   └── events/         event bus ให้โมดูลคุยกัน
│   ├── config/             อ่านค่าจาก .env
│   ├── app.js              รวม routes ทุกโมดูล (ไม่มี listen)
│   └── server.js           เปิด/ปิดระบบ
├── scripts/
│   └── init-db.js          สร้าง database + ตาราง + สินค้าตัวอย่าง
├── tests/                  แยกโฟลเดอร์ตามโมดูล
├── .env.example
└── package.json            มีไฟล์เดียวทั้งโปรเจกต์
```

---

## หน้าที่ของแต่ละไฟล์ในโมดูล

| ไฟล์ | เทียบกับ | ทำอะไร | ห้ามทำ |
|---|---|---|---|
| `*.routes.js` | ป้ายบอกทาง | URL + method → ฟังก์ชันใน controller | logic, SQL, `res.json` |
| `*.controller.js` | พนักงานหน้าร้าน | แกะ `req` → เรียก service → ตอบ `res` | กฎธุรกิจ, SQL |
| `*.service.js` | หัวหน้าเชฟ | กฎธุรกิจ, ตัดสินใจ, `throw AppError` | `req`/`res`, SQL |
| `*.repository.js` | คนดูแลคลัง | SQL ของตารางตัวเองเท่านั้น | กฎธุรกิจ, แตะตารางโมดูลอื่น |
| `*.model.js` | ใบสเปก | โครงตาราง, ตรวจรูปแบบข้อมูล, `toPublic` | query database |
| `index.js` | ประตูหน้าบ้าน | ส่ง routes, เปิด public API, ฟัง event | — |

**กฎทอง**
- ชั้นบนเรียกได้แค่ชั้นที่อยู่ติดกันข้างล่าง: routes → controller → service → repository
- นอกโมดูล `require` ได้แค่ `index.js` เช่น `require('../products')` ✅ / `require('../products/products.repository')` ❌
- แต่ละโมดูลแตะได้แค่ตารางของตัวเอง

---

## request ไหลยังไง (ตัวอย่าง `POST /users/register`)

```
server.js → app.js
  → express.json()                  แปลง body
  → app.use('/users', ...)          ส่งเข้าโซน users
  → users.routes.js                 POST /register → controller.register
  → users.controller.js             ดึง email, password จาก req.body
  → users.service.js                ตรวจรูปแบบ (model) → เช็ก email ซ้ำ → เข้ารหัส password
  → users.repository.js             INSERT INTO users
  ← users.model.toPublic()          ตัด password ออก
  ← controller: res.status(201).json(user)

ถ้าพังที่ชั้นไหน → throw → controller catch → next(err) → errorHandler ตอบ status ที่ถูกต้อง
```

---

## โมดูลคุยกัน 2 แบบ

**1. เรียกตรงผ่าน `index.js`** ใช้เมื่อต้องได้คำตอบทันที

```
orders.service → products.getProductById()   สินค้ามีจริงไหม ราคาเท่าไหร่
orders.service → products.decreaseStock()    ตัด stock (ไม่พอ → 409)
```

**2. ประกาศ event** ใช้เมื่อแค่บอกว่ามีเรื่องเกิดขึ้น ไม่ต้องรอคำตอบ

```
สั่งซื้อ:  orders  ──emit('order.created')──────→  payments  สร้างใบแจ้งชำระ (pending)
จ่ายเงิน:  payments ──emit('payment.completed')──→  orders    เปลี่ยนสถานะ order เป็น paid
```

orders ไม่ได้ require payments และ payments ก็ไม่ได้ require orders ทั้งสองคุยกันผ่าน `shared/events` อย่างเดียว

---

## วิธีรัน

```bash
# 1. ติดตั้ง library
npm install

# 2. ตั้งค่า
cp .env.example .env        # แล้วแก้รหัส MySQL ใน .env

# 3. สร้าง database + ตาราง (ต้องเปิด MySQL ไว้ก่อน)
npm run db:init

# 4. เปิดเซิร์ฟเวอร์
npm start                   # หรือ npm run dev (รีสตาร์ทเองเมื่อแก้โค้ด)

# 5. รันเทส (ไม่ต้องมี MySQL — เทสใช้ repository ปลอม)
npm test
```

---

## API ทั้งหมด

| Method | URL | Login | ทำอะไร |
|---|---|---|---|
| GET | `/health` | | เช็กว่าเซิร์ฟเวอร์ทำงาน |
| POST | `/users/register` | | สมัคร `{ email, password, name }` |
| POST | `/users/login` | | login `{ email, password }` → `{ token }` |
| GET | `/users/me` | ✅ | ดูโปรไฟล์ตัวเอง |
| PUT | `/users/me` | ✅ | แก้ชื่อ `{ name }` |
| GET | `/users/:id` | | ดู user ตาม id |
| GET | `/products` | | ดูสินค้าทั้งหมด |
| GET | `/products/:id` | | ดูสินค้า 1 ชิ้น |
| POST | `/products` | ✅ | เพิ่มสินค้า `{ name, price, stock }` |
| PUT | `/products/:id` | ✅ | แก้สินค้า (ส่งแค่บางช่องได้) |
| POST | `/orders` | ✅ | สั่งซื้อ `{ productId, quantity }` |
| GET | `/orders` | ✅ | ดูคำสั่งซื้อของฉัน |
| GET | `/orders/:id` | ✅ | ดูคำสั่งซื้อ 1 รายการ |
| GET | `/payments/order/:orderId` | ✅ | ดูใบแจ้งชำระ |
| POST | `/payments/order/:orderId/pay` | ✅ | จ่ายเงิน |

ถ้าต้อง login ให้ใส่ header `Authorization: Bearer <token>`

### ลองทั้ง flow ด้วย curl

```bash
# สมัคร + login
curl -X POST localhost:3000/users/register -H "Content-Type: application/json" \
  -d '{"email":"fatt@mail.com","password":"12345678","name":"Fatt"}'

curl -X POST localhost:3000/users/login -H "Content-Type: application/json" \
  -d '{"email":"fatt@mail.com","password":"12345678"}'
# → คัดลอก token มาใส่ตัวแปร
TOKEN=ใส่_token_ตรงนี้

# สั่งซื้อสินค้า id 1 จำนวน 2 ชิ้น
curl -X POST localhost:3000/orders -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"productId":1,"quantity":2}'

# ดูใบแจ้งชำระ (payments สร้างให้อัตโนมัติจาก event)
curl localhost:3000/payments/order/1 -H "Authorization: Bearer $TOKEN"

# จ่ายเงิน
curl -X POST localhost:3000/payments/order/1/pay -H "Authorization: Bearer $TOKEN"

# ดู order อีกครั้ง → status เปลี่ยนเป็น paid (orders ฟัง event)
curl localhost:3000/orders/1 -H "Authorization: Bearer $TOKEN"
```

---

## สิ่งที่ตัดออกเพื่อให้อ่านง่าย (ระบบจริงควรมี)

- **Transaction:** ตอนสั่งซื้อควรครอบ "ตัด stock + สร้าง order" ไว้ด้วยกัน
- **สิทธิ์ admin:** ตอนนี้แค่ login ก็เพิ่มหรือแก้สินค้าได้
- **order_items:** ตอนนี้ 1 order มีสินค้าได้แค่ 1 รายการ
- **Payment gateway จริง:** ตอนนี้สมมติว่าตัดเงินสำเร็จเสมอ

> ใช้ `bcryptjs` แทน `bcrypt` เพราะไม่ต้อง compile ตอนติดตั้ง วิธีใช้เหมือนกันทุกอย่าง
