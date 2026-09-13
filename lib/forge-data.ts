export type PartCategory = "Electrical" | "Mechanical"

export interface Part {
  name: string
  category: PartCategory
  subcategory: string
  quantity: number
  unitCost: number
}

export interface HardwareProject {
  slug: string
  title: string
  author: string
  avatarColor: string
  cover: string
  createdAt: string // ISO date
  tags: string[]
  summary: string
  parts: Part[]
  wiring: string
  mech: string
  instructions: string[]
  stars: number
  featured?: boolean
}

export const CATEGORIES = [
  "All",
  "IoT",
  "Wearable",
  "Robotics",
  "Security",
] as const

export type SortKey = "trending" | "newest" | "top"

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const day = 86_400_000
  const days = Math.floor(diff / day)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function partsCount(p: HardwareProject): number {
  return p.parts.reduce((sum, part) => sum + part.quantity, 0)
}

export function totalCost(p: HardwareProject): number {
  return p.parts.reduce((sum, part) => sum + part.quantity * part.unitCost, 0)
}

export function filterProjects(
  projects: HardwareProject[],
  category: string,
  query: string,
): HardwareProject[] {
  const q = query.trim().toLowerCase()
  return projects.filter((p) => {
    const catOk = category === "All" || p.tags.includes(category)
    if (!catOk) return false
    if (!q) return true
    const hay = [p.title, p.author, p.summary, ...p.tags].join(" ").toLowerCase()
    return hay.includes(q)
  })
}

export function sortProjects(
  projects: HardwareProject[],
  sort: SortKey,
): HardwareProject[] {
  const copy = [...projects]
  if (sort === "newest") {
    return copy.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }
  if (sort === "top") {
    return copy.sort((a, b) => b.stars - a.stars)
  }
  // trending: featured first, then by stars desc as a proxy
  return copy.sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return b.stars - a.stars
  })
}

export function getProjectBySlug(
  projects: HardwareProject[],
  slug: string,
): HardwareProject | undefined {
  return projects.find((p) => p.slug === slug)
}

export function relatedProjects(
  projects: HardwareProject[],
  current: HardwareProject,
  limit = 3,
): HardwareProject[] {
  const tagged = projects.filter(
    (p) => p.slug !== current.slug && p.tags.some((t) => current.tags.includes(t)),
  )
  const pool = tagged.length ? tagged : projects.filter((p) => p.slug !== current.slug)
  return pool.slice(0, limit)
}

export const PROJECTS: HardwareProject[] = [
  {
    slug: "smart-plant-monitor",
    title: "Smart Plant Monitor",
    author: "green_thumb",
    avatarColor: "#10b981",
    cover: "/projects/plant-monitor.jpg",
    createdAt: "2026-09-11T10:00:00Z",
    tags: ["IoT", "Sensors"],
    featured: true,
    summary:
      "A low-power ESP32 monitor that reads soil moisture and temperature, shows live readings on a tiny OLED, and runs for weeks on a single Li-Po cell.",
    stars: 8,
    parts: [
      { name: "ESP32 Dev Board", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 7.5 },
      { name: "Capacitive Soil Moisture Sensor", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 3.2 },
      { name: "BME280 Temp / Humidity", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 3.9 },
      { name: '0.96" OLED Display', category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 4.8 },
      { name: "Li-Po 3.7V 1200mAh", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 6.4 },
      { name: "TP4056 Charger Module", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 1.1 },
      { name: "3D-printed Enclosure", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 2.0 },
      { name: "Probe Housing Tube", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 0.8 },
    ],
    wiring:
      "Moisture sensor SIG → ESP32 GPIO34, VCC → 3.3V, GND → GND. BME280 on I2C (SDA GPIO21 / SCL GPIO22). OLED shares the same I2C bus at address 0x3C. TP4056 charges the Li-Po and feeds 3.3V via the onboard regulator.",
    mech:
      "The enclosure is a two-part snap-fit print; the probe tube routes the sensor cable down to the root zone while keeping the board dry above the soil line.",
    instructions: [
      "Flash the firmware and confirm the OLED shows sensor readings over USB.",
      "Solder the sensor and display to the ESP32 breakout, then mount the board in the top half of the enclosure.",
      "Insert the probe into the soil, connect the battery, and seal the enclosure.",
    ],
  },
  {
    slug: "heart-rate-badge",
    title: "Wearable Heart Rate Badge",
    author: "pawel_s",
    avatarColor: "#f43f5e",
    cover: "/projects/heart-badge.jpg",
    createdAt: "2026-09-12T08:30:00Z",
    tags: ["Wearable", "Sensors"],
    summary:
      "A necklace pendant that tracks heart rate with an optical sensor and shows BPM on a small OLED, with a vibration nudge when you sit still too long.",
    stars: 4,
    parts: [
      { name: "Arduino Nano", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 4.2 },
      { name: "MAX30102 Pulse Sensor", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 5.6 },
      { name: '0.91" OLED Display', category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 3.4 },
      { name: "CR2032 Holder", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 0.9 },
      { name: "Li-Po 3.7V 500mAh", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 3.8 },
      { name: "Haptic Buzzer", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 0.6 },
      { name: "3D-printed Pendant", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 2.5 },
      { name: "Silicone Strap", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 1.2 },
    ],
    wiring:
      "MAX30102 on I2C (A4/A5 on the Nano). OLED on the same bus. Buzzer → D9 through a 100Ω resistor. Power from a small Li-Po stepped up to 5V for the display.",
    mech:
      "The pendant shell is printed in TPU for a soft skin feel; the sensor window is a thin resin pour so light reaches the skin without gaps.",
    instructions: [
      "Assemble the I2C chain and verify the sensor streams data in the serial plotter.",
      "Print and fit the TPU shell, routing the strap through the side slots.",
      "Calibrate the resting BPM baseline, then enable the idle reminder.",
    ],
  },
  {
    slug: "drone-controller",
    title: "RC Drone Flight Controller",
    author: "austro_b140",
    avatarColor: "#0ea5e9",
    cover: "/projects/drone-controller.jpg",
    createdAt: "2026-09-13T06:15:00Z",
    tags: ["Robotics", "IoT"],
    featured: true,
    summary:
      "A 4-inch FPV-style flight controller built around an ESP32 with an MPU6050 for stabilization and a 4-in-1 ESC driving four brushless motors.",
    stars: 4,
    parts: [
      { name: "ESP32-WROOM Module", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 6.8 },
      { name: "MPU6050 IMU", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 2.1 },
      { name: "Brushless Motor 2207", category: "Electrical", subcategory: "Actuator", quantity: 4, unitCost: 7.9 },
      { name: "4-in-1 ESC", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 18.0 },
      { name: "5.8GHz VTX", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 9.5 },
      { name: "2.4GHz Receiver", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 6.2 },
      { name: "Li-Po 4S 1500mAh", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 22.0 },
      { name: "Carbon Fiber Frame", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 14.0 },
      { name: '5" Propellers', category: "Mechanical", subcategory: "Structural", quantity: 4, unitCost: 1.2 },
      { name: "Camera Mount", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 1.5 },
    ],
    wiring:
      "ESC signal lines → ESP32 PWM pins (D4–D7). MPU6050 on I2C. Receiver SBUS → UART. VTX powered from a 5V BEC on the ESC; motors A–D map to the four arms.",
    mech:
      "The carbon frame uses a stacked layout: motors at the arms, flight stack in the center sandwich, and the camera tilted 25° in a printed mount.",
    instructions: [
      "Solder the ESC and receiver, then flash the flight firmware over USB.",
      "Mount the stack and calibrate the accelerometer on a level surface.",
      "Bind the receiver, spin each motor to confirm direction, then PID-tune in hover.",
    ],
  },
  {
    slug: "rfid-door-lock",
    title: "RFID Smart Door Lock",
    author: "funtoos_fontoos",
    avatarColor: "#f59e0b",
    cover: "/projects/door-lock.jpg",
    createdAt: "2026-09-12T14:00:00Z",
    tags: ["Security", "IoT"],
    summary:
      "Retrofit any deadbolt with an RFID reader and a solenoid driven by an ESP8266 — tap a card to unlock, and log every access attempt.",
    stars: 6,
    parts: [
      { name: "ESP8266 NodeMCU", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 4.0 },
      { name: "MFRC522 RFID Reader", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 2.8 },
      { name: "SG90 Servo", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 1.3 },
      { name: "12V Solenoid Lock", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 6.5 },
      { name: "Relay Module", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 1.1 },
      { name: "12V Power Supply", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 5.0 },
      { name: "3D-printed Mount", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 2.0 },
      { name: "Striker Plate", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 1.5 },
    ],
    wiring:
      "MFRC522 on SPI (D5–D8). Servo → D4. Relay toggles the 12V solenoid from the supply. The MCU runs on 5V from the supply via a buck converter.",
    mech:
      "The reader sits in a flush mount by the strike; the solenoid replaces the manual throw and the servo acts as a manual fallback lever.",
    instructions: [
      "Enroll your card UIDs in the firmware whitelist.",
      "Mount the solenoid to the existing strike and test the throw.",
      "Power up, tap a card, and confirm the unlock plus the access log.",
    ],
  },
  {
    slug: "solar-weather-station",
    title: "Solar Weather Station",
    author: "slickfoal",
    avatarColor: "#f97316",
    cover: "/projects/weather-station.jpg",
    createdAt: "2026-09-10T09:45:00Z",
    tags: ["IoT", "Security"],
    summary:
      "A self-contained, solar-powered weather station that reports temperature, humidity, wind, and rain to a local dashboard over Wi-Fi.",
    stars: 6,
    parts: [
      { name: "ESP32 Dev Board", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 7.0 },
      { name: "BME280 Temp / Humidity", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 3.9 },
      { name: "Anemometer", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 8.5 },
      { name: "Tipping Bucket Rain Gauge", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 6.0 },
      { name: "6V 2W Solar Panel", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 5.5 },
      { name: "18650 Li-Ion Cell", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 3.2 },
      { name: "TP4056 Charger", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 1.1 },
      { name: "PVC Mast", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 3.0 },
      { name: "Weatherproof Enclosure", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 4.5 },
    ],
    wiring:
      "BME280 on I2C. Anemometer and rain gauge connect to interrupt pins. Solar panel → TP4056 → 18650 → 3.3V LDO for the ESP32. All sensors inside the sealed enclosure, mast outside.",
    mech:
      "A PVC mast holds the anemometer above the roof line; the gauge hangs below a printed funnel; the electronics live in an IP65 box at the base.",
    instructions: [
      "Seal the BME280 and board in the enclosure with a desiccant pack.",
      "Assemble the mast and aim the panel south at ~30° tilt.",
      "Connect to Wi-Fi and verify the dashboard receives updates.",
    ],
  },
  {
    slug: "robotic-arm-kit",
    title: "Desktop Robotic Arm Kit",
    author: "slick",
    avatarColor: "#8b5cf6",
    cover: "/projects/robotic-arm.jpg",
    createdAt: "2026-09-12T18:20:00Z",
    tags: ["Robotics", "Security"],
    summary:
      "A 4-DOF desktop arm with MG996R servos driven by an Arduino and a PCA9685 board, controllable over Bluetooth from a phone.",
    stars: 5,
    parts: [
      { name: "Arduino Uno", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 5.5 },
      { name: "MG996R Servo", category: "Electrical", subcategory: "Actuator", quantity: 4, unitCost: 4.5 },
      { name: "PCA9685 Servo Driver", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 4.2 },
      { name: "HC-05 Bluetooth", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 4.0 },
      { name: "5V 5A Power Supply", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 7.0 },
      { name: "Aluminum Brackets Set", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 12.0 },
      { name: "Acrylic Base Plate", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 5.0 },
      { name: "Suction Cup Mount", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 2.0 },
      { name: "Gripper Kit", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 3.5 },
    ],
    wiring:
      "PCA9685 on I2C drives the four servos from a separate 5V rail. HC-05 on UART receives angle commands. Arduino decodes and writes PWM values.",
    mech:
      "Aluminum brackets form the two forearm links; the base clamps to a desk with a suction cup; the gripper closes via the final servo through a linkage.",
    instructions: [
      "Assemble the links and center all servos at 90°.",
      "Wire the PCA9685 and confirm each joint moves in the test sketch.",
      "Pair Bluetooth, load the phone control app, and calibrate the reach.",
    ],
  },
]
