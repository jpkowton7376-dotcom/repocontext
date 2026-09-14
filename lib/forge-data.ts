export type PartCategory = "Electrical" | "Mechanical"

export interface Part {
  name: string
  category: PartCategory
  subcategory: string
  quantity: number
  unitCost: number
}

export type NodeKind = "mcu" | "sensor" | "actuator" | "power" | "module" | "driver" | "switch"

export interface WiringNode {
  id: string
  label: string
  kind: NodeKind
}

export interface WiringEdge {
  from: string
  to: string
  label: string
}

export interface BuildStep {
  title: string
  detail?: string
  tools?: string[]
  parts?: string[]
}

export interface BuildPhase {
  title: string
  steps: BuildStep[]
}

export interface Build {
  tools: string[]
  assumptions: string[]
  phases: BuildPhase[]
}

export interface MechSpec {
  label: string
  value: string
}

export interface MechSection {
  title: string
  body: string
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
  features?: string[]
  parts: Part[]
  wiring: string
  wiringNodes?: WiringNode[]
  wiringEdges?: WiringEdge[]
  mech?: string
  mechSpecs?: MechSpec[]
  mechSections?: MechSection[]
  instructions: string[] // flat fallback (user submissions)
  build?: Build
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

export interface FlatStep {
  key: string
  index: string
  phaseIndex: number
  phaseTitle: string
  title: string
  detail?: string
  tools?: string[]
  parts?: string[]
}

/** Normalizes both structured builds and legacy flat instruction lists. */
export function flattenBuild(p: HardwareProject): FlatStep[] {
  if (p.build?.phases?.length) {
    const out: FlatStep[] = []
    p.build.phases.forEach((phase, pi) => {
      phase.steps.forEach((step, si) => {
        out.push({
          key: `${p.slug}:${pi + 1}.${si + 1}`,
          index: `${pi + 1}.${si + 1}`,
          phaseIndex: pi,
          phaseTitle: phase.title,
          title: step.title,
          detail: step.detail,
          tools: step.tools,
          parts: step.parts,
        })
      })
    })
    return out
  }
  return p.instructions.map((title, i) => ({
    key: `${p.slug}:legacy:${i}`,
    index: String(i + 1),
    phaseIndex: 0,
    phaseTitle: "",
    title,
  }))
}

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

export function categorySummary(p: HardwareProject) {
  return (["Electrical", "Mechanical"] as const)
    .map((cat) => {
      const items = p.parts.filter((x) => x.category === cat)
      return {
        category: cat,
        parts: items.reduce((s, x) => s + x.quantity, 0),
        cost: items.reduce((s, x) => s + x.quantity * x.unitCost, 0),
      }
    })
    .filter((row) => row.parts > 0)
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
    features: [
      "capacitive soil sensing",
      "BME280 climate node",
      "weeks per charge",
      "OLED live readout",
      "deep-sleep Wi-Fi cycle",
    ],
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
    wiringNodes: [
      { id: "battery", label: "Li-Po 3.7V", kind: "power" },
      { id: "charger", label: "TP4056 Charger", kind: "module" },
      { id: "mcu", label: "ESP32 Dev Board", kind: "mcu" },
      { id: "moisture", label: "Soil Moisture Sensor", kind: "sensor" },
      { id: "bme", label: "BME280", kind: "sensor" },
      { id: "oled", label: '0.96" OLED', kind: "module" },
    ],
    wiringEdges: [
      { from: "battery", to: "charger", label: "JST" },
      { from: "charger", to: "mcu", label: "3.3V" },
      { from: "moisture", to: "mcu", label: "ADC GPIO34" },
      { from: "bme", to: "mcu", label: "I2C" },
      { from: "oled", to: "mcu", label: "I2C 0x3C" },
    ],
    wiring:
      "Moisture sensor SIG → ESP32 GPIO34, VCC → 3.3V, GND → GND. BME280 on I2C (SDA GPIO21 / SCL GPIO22). OLED shares the same I2C bus at address 0x3C. TP4056 charges the Li-Po and feeds 3.3V via the onboard regulator.",
    mechSpecs: [
      { label: "Dimensions", value: "86 × 42 × 28 mm" },
      { label: "Weight", value: "94 g with battery" },
      { label: "Materials", value: "PETG enclosure, stainless probe tube" },
      { label: "Ingress", value: "IPX4 (splash resistant)" },
    ],
    mechSections: [
      {
        title: "Enclosure",
        body: "A two-part snap-fit print with an OLED window in the top shell and a cable gland at the base. The board sits on four M2 standoffs so the battery can be wedged underneath without pinching the I2C runs.",
      },
      {
        title: "Probe",
        body: "The capacitive pad lives inside a slotted stainless tube that keeps soil pressure off the PCB while letting moisture reach the sensing face. A drip loop in the cable stops water wicking into the enclosure.",
      },
    ],
    instructions: [
      "Flash the firmware and confirm the OLED shows sensor readings over USB.",
      "Solder the sensor and display to the ESP32 breakout, then mount the board in the top half of the enclosure.",
      "Insert the probe into the soil, connect the battery, and seal the enclosure.",
    ],
    build: {
      tools: [
        "Soldering iron with fine tip",
        "Wire strippers and cutters",
        "3D printer (PETG capable)",
        "Micro-USB cable",
        "Multimeter",
      ],
      assumptions: [
        "Arduino IDE or PlatformIO installed",
        "Basic soldering experience",
        "2.4GHz Wi-Fi reaches the plant site",
      ],
      phases: [
        {
          title: "Prepare",
          steps: [
            {
              title: "Print the two-part enclosure in PETG",
              detail:
                "Three walls, 20% infill. The top shell needs the OLED window cut out; drill the cable gland hole in the base before assembly.",
              tools: ["3D printer (PETG capable)"],
            },
            {
              title: "Flash test firmware over USB",
              detail:
                "Load the factory test sketch and confirm the OLED boots and the I2C scanner finds both 0x3C and 0x76 before anything is soldered.",
              tools: ["Micro-USB cable"],
            },
          ],
        },
        {
          title: "Solder",
          steps: [
            {
              title: "Attach the soil sensor leads",
              detail:
                "SIG → GPIO34, VCC → 3V3, GND → GND. Keep the cable under 40 cm to stay inside the ADC's noise budget.",
              tools: ["Soldering iron with fine tip", "Wire strippers and cutters"],
              parts: ["Capacitive Soil Moisture Sensor"],
            },
            {
              title: "Wire the shared I2C bus",
              detail:
                "BME280 and OLED both hang off SDA GPIO21 / SCL GPIO22; the OLED is fixed at address 0x3C, the BME280 at 0x76.",
              tools: ["Soldering iron with fine tip"],
              parts: ["BME280 Temp / Humidity"],
            },
            {
              title: "Hook up power",
              detail:
                "TP4056 OUT+ feeds the ESP32 3V3 pin through the onboard regulator. Check polarity with a multimeter before connecting the cell.",
              tools: ["Multimeter"],
              parts: ["TP4056 Charger Module", "Li-Po 3.7V 1200mAh"],
            },
          ],
        },
        {
          title: "Assemble & deploy",
          steps: [
            {
              title: "Mount the board and OLED in the top shell",
              tools: ["Soldering iron with fine tip"],
              parts: ['0.96" OLED Display', "ESP32 Dev Board"],
            },
            {
              title: "Seat the probe and seal the enclosure",
              detail:
                "Push the probe tube to root depth, connect the battery last, then snap the halves shut and confirm the OLED still lights.",
            },
            {
              title: "Enable the deep-sleep cycle",
              detail:
                "A 15-minute wake cycle buys roughly three weeks of runtime per charge. Log the first 24 h before burying the probe.",
            },
          ],
        },
      ],
    },
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
    features: [
      "MAX30102 optical HR",
      "TPU skin-safe shell",
      "haptic idle nudge",
      "resin sensor window",
      "live BPM readout",
    ],
    stars: 4,
    parts: [
      { name: "Arduino Nano", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 4.2 },
      { name: "MAX30102 Pulse Sensor", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 5.6 },
      { name: '0.91" OLED Display', category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 3.4 },
      { name: "Li-Po 3.7V 500mAh", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 3.8 },
      { name: "TP4056 Charger Module", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 1.1 },
      { name: "Haptic Buzzer", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 0.6 },
      { name: "3D-printed Pendant", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 2.5 },
      { name: "Silicone Strap", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 1.2 },
    ],
    wiringNodes: [
      { id: "battery", label: "Li-Po 500mAh", kind: "power" },
      { id: "charger", label: "TP4056 Charger", kind: "module" },
      { id: "mcu", label: "Arduino Nano", kind: "mcu" },
      { id: "hr", label: "MAX30102 Pulse Sensor", kind: "sensor" },
      { id: "oled", label: '0.91" OLED', kind: "module" },
      { id: "buzzer", label: "Haptic Buzzer", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "battery", to: "charger", label: "JST" },
      { from: "charger", to: "mcu", label: "5V" },
      { from: "hr", to: "mcu", label: "I2C A4/A5" },
      { from: "oled", to: "mcu", label: "I2C 0x3C" },
      { from: "mcu", to: "buzzer", label: "PWM D9" },
    ],
    wiring:
      "MAX30102 on I2C (A4/A5 on the Nano). OLED on the same bus. Buzzer → D9 through a 100Ω resistor. Power from a small Li-Po stepped up to 5V for the display.",
    mechSpecs: [
      { label: "Dimensions", value: "48 × 38 × 16 mm" },
      { label: "Weight", value: "31 g" },
      { label: "Materials", value: "TPU 95A shell, UV resin window" },
      { label: "Battery life", value: "≈6 h continuous" },
    ],
    mechSections: [
      {
        title: "Shell",
        body: "Printed in TPU 95A so the pendant flexes against the chest instead of digging in. The lanyard slots are printed-in, and the two halves close on a friction fit with a thin silicone gasket.",
      },
      {
        title: "Sensor window",
        body: "The MAX30102 sits behind a 1 mm UV-resin pour that polishes clear. Any air gap between the resin and the sensor kills the signal, so the pour is done with the PCB taped face-down in the shell.",
      },
    ],
    instructions: [
      "Assemble the I2C chain and verify the sensor streams data in the serial plotter.",
      "Print and fit the TPU shell, routing the strap through the side slots.",
      "Calibrate the resting BPM baseline, then enable the idle reminder.",
    ],
    build: {
      tools: [
        "Soldering iron with fine tip",
        "3D printer (TPU capable)",
        "UV resin + UV lamp",
        "Micro-USB cable",
        "Serial plotter (PC)",
      ],
      assumptions: [
        "Arduino IDE with the MAX3010x library",
        "Skin contact for the optical sensor",
        "Comfortable with small-part soldering",
      ],
      phases: [
        {
          title: "Fabricate",
          steps: [
            {
              title: "Print the TPU pendant shell",
              detail:
                "0.2 mm layers, 3 walls, no infill pattern change needed for TPU. Print slowly — TPU grip can stall a Bowden extruder.",
              tools: ["3D printer (TPU capable)"],
              parts: ["3D-printed Pendant"],
            },
            {
              title: "Pour the resin sensor window",
              detail:
                "Tape the shell face-down, seat the PCB, and pour 1 mm of UV resin. Cure and polish until optically clear.",
              tools: ["UV resin + UV lamp"],
            },
          ],
        },
        {
          title: "Wire",
          steps: [
            {
              title: "Assemble the I2C chain",
              detail:
                "MAX30102 and OLED share A4 (SDA) / A5 (SCL) on the Nano. Confirm both devices answer in an I2C scan.",
              tools: ["Soldering iron with fine tip"],
              parts: ["MAX30102 Pulse Sensor", '0.91" OLED Display'],
            },
            {
              title: "Connect the haptic buzzer",
              detail:
                "D9 through a 100Ω series resistor to the buzzer's positive leg; the negative leg returns to GND.",
              tools: ["Soldering iron with fine tip"],
              parts: ["Haptic Buzzer"],
            },
            {
              title: "Wire the charge circuit",
              detail:
                "Li-Po → TP4056 → Nano 5V pin. Leave the USB port accessible through the shell for charging.",
              tools: ["Multimeter"],
              parts: ["Li-Po 3.7V 500mAh", "TP4056 Charger Module"],
            },
          ],
        },
        {
          title: "Calibrate & wear",
          steps: [
            {
              title: "Baseline the resting BPM",
              detail:
                "Sit still for two minutes and average the readings in the serial plotter; store the value as the personal baseline.",
              tools: ["Serial plotter (PC)"],
            },
            {
              title: "Enable the idle reminder",
              detail:
                "Set the buzzer to pulse when no motion is detected for 45 minutes, then route the silicone strap through the side slots.",
              parts: ["Silicone Strap"],
            },
          ],
        },
      ],
    },
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
    features: [
      "ESP32 flight stack",
      "MPU6050 stabilization",
      "4-in-1 ESC",
      "5.8GHz FPV link",
      "4S LiPo power",
    ],
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
    wiringNodes: [
      { id: "battery", label: "4S LiPo 1500mAh", kind: "power" },
      { id: "esc", label: "4-in-1 ESC", kind: "module" },
      { id: "mcu", label: "ESP32-WROOM", kind: "mcu" },
      { id: "imu", label: "MPU6050 IMU", kind: "sensor" },
      { id: "rx", label: "2.4GHz Receiver", kind: "module" },
      { id: "vtx", label: "5.8GHz VTX", kind: "module" },
      { id: "motors", label: "Brushless ×4", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "battery", to: "esc", label: "XT60 14.8V" },
      { from: "esc", to: "mcu", label: "5V BEC" },
      { from: "mcu", to: "esc", label: "PWM D4–D7" },
      { from: "imu", to: "mcu", label: "I2C" },
      { from: "rx", to: "mcu", label: "SBUS UART" },
      { from: "esc", to: "vtx", label: "5V" },
      { from: "esc", to: "motors", label: "3-phase ×4" },
    ],
    wiring:
      "ESC signal lines → ESP32 PWM pins (D4–D7). MPU6050 on I2C. Receiver SBUS → UART. VTX powered from a 5V BEC on the ESC; motors A–D map to the four arms.",
    mechSpecs: [
      { label: "Wheelbase", value: "160 mm (4-inch)" },
      { label: "All-up weight", value: "285 g with battery" },
      { label: "Frame", value: "3K carbon, 3 mm arms" },
      { label: "Flight time", value: "4–6 min aggressive" },
    ],
    mechSections: [
      {
        title: "Frame stack",
        body: "A classic center sandwich: ESC on the bottom plate, flight controller on stacked standoffs above it, and the RX zip-tied to the rear arms where the antenna can exit free of carbon.",
      },
      {
        title: "Camera & VTX",
        body: "The FPV camera sits in a printed 25° tilt mount up front; the VTX antenna routes through a rear standoff so the whip clears the prop wash. Keep the VTX away from the GPS/IMU corner to avoid RF noise.",
      },
    ],
    instructions: [
      "Solder the ESC and receiver, then flash the flight firmware over USB.",
      "Mount the stack and calibrate the accelerometer on a level surface.",
      "Bind the receiver, spin each motor to confirm direction, then PID-tune in hover.",
    ],
    build: {
      tools: [
        "Soldering iron (60W+, high wattage)",
        "Smoke stopper",
        "Hex driver set",
        "Flight configurator (PC)",
        "LiPo balance charger",
      ],
      assumptions: [
        "Props stay off until the first hover",
        "Open field for the maiden flight",
        "Comfortable reading a UART pinout",
      ],
      phases: [
        {
          title: "Solder",
          steps: [
            {
              title: "Solder ESC power and signal pigtail",
              detail:
                "Battery leads → ESC pads (mind polarity), then the XT60. Always power the first session through a smoke stopper.",
              tools: ["Soldering iron (60W+, high wattage)", "Smoke stopper"],
              parts: ["4-in-1 ESC", "Li-Po 4S 1500mAh"],
            },
            {
              title: "Solder RX and VTX",
              detail:
                "Receiver SBUS → UART RX pad, 5V and GND from the ESC BEC. VTX audio/video lines route along the front arms away from the RX.",
              tools: ["Soldering iron (60W+, high wattage)"],
              parts: ["2.4GHz Receiver", "5.8GHz VTX"],
            },
          ],
        },
        {
          title: "Flash & calibrate",
          steps: [
            {
              title: "Flash the flight firmware over USB",
              detail:
                "Flash the ESP32 build, then confirm all four motor outputs respond in the configurator's motor tab — props still off.",
              tools: ["Flight configurator (PC)"],
              parts: ["ESP32-WROOM Module"],
            },
            {
              title: "Calibrate the accelerometer",
              detail:
                "Run calibration on a known-level jig. A tilted IMU here becomes a drifting quad later.",
              tools: ["Flight configurator (PC)"],
              parts: ["MPU6050 IMU"],
            },
          ],
        },
        {
          title: "Bind & tune",
          steps: [
            {
              title: "Bind the receiver and verify the channel map",
              detail:
                "Throttle, yaw, pitch and roll must move the right bars in the configurator before the LiPo ever connects with props on.",
              tools: ["Flight configurator (PC)"],
              parts: ["2.4GHz Receiver"],
            },
            {
              title: "Check motor direction (props off)",
              detail:
                "Spin each motor one at a time; flip any wrong-direction motor in software or resolder its three phases.",
              parts: ["Brushless Motor 2207"],
            },
            {
              title: "Hover PID tune",
              detail:
                "Start from stock PIDs, hover and log, then adjust P in small steps. Stop tuning the moment oscillation appears.",
            },
          ],
        },
      ],
    },
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
    features: [
      "MFRC522 SPI reader",
      "12V solenoid throw",
      "servo fallback lever",
      "access log over Wi-Fi",
      "no-locksmith retrofit",
    ],
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
    wiringNodes: [
      { id: "psu", label: "12V Power Supply", kind: "power" },
      { id: "buck", label: "Buck Converter", kind: "module" },
      { id: "mcu", label: "ESP8266 NodeMCU", kind: "mcu" },
      { id: "rfid", label: "MFRC522 Reader", kind: "sensor" },
      { id: "relay", label: "Relay Module", kind: "module" },
      { id: "solenoid", label: "12V Solenoid", kind: "actuator" },
      { id: "servo", label: "SG90 Servo", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "psu", to: "buck", label: "12V" },
      { from: "buck", to: "mcu", label: "5V" },
      { from: "rfid", to: "mcu", label: "SPI D5–D8" },
      { from: "mcu", to: "relay", label: "GPIO D1" },
      { from: "relay", to: "solenoid", label: "12V switched" },
      { from: "mcu", to: "servo", label: "PWM D4" },
    ],
    wiring:
      "MFRC522 on SPI (D5–D8). Servo → D4. Relay toggles the 12V solenoid from the supply. The MCU runs on 5V from the supply via a buck converter.",
    mechSpecs: [
      { label: "Throw", value: "12 mm solenoid" },
      { label: "Power", value: "12V 2A idle / 5A peak" },
      { label: "Reader", value: "13.56MHz MIFARE" },
      { label: "Logging", value: "HTTP POST per access event" },
    ],
    mechSections: [
      {
        title: "Strike retrofit",
        body: "The solenoid replaces the manual deadbolt throw behind the existing strike plate. A printed bracket keeps the solenoid aligned with the bolt so it never binds, and the SG90 acts as a manual fallback lever from the inside.",
      },
      {
        title: "Reader mount",
        body: "The MFRC522 sits in a flush-printed bezel beside the door frame, antenna face out. Mount it at hand height and keep it clear of metal trim — steel within 3 cm noticeably cuts read range.",
      },
    ],
    instructions: [
      "Enroll your card UIDs in the firmware whitelist.",
      "Mount the solenoid to the existing strike and test the throw.",
      "Power up, tap a card, and confirm the unlock plus the access log.",
    ],
    build: {
      tools: [
        "Soldering iron",
        "Drill + step bit",
        "Multimeter",
        "Screwdriver set",
        "Cable staples",
      ],
      assumptions: [
        "Existing deadbolt strike to retrofit",
        "Mains outlet within cable reach of the door",
        "2.4GHz Wi-Fi reaches the door frame",
      ],
      phases: [
        {
          title: "Prepare",
          steps: [
            {
              title: "Print the flush reader mount",
              detail:
                "PETG for UV stability. The bezel needs a 2 mm lip so the reader sits proud of the frame trim.",
              tools: ["Drill + step bit"],
              parts: ["3D-printed Mount"],
            },
            {
              title: "Enroll card UIDs in the whitelist",
              detail:
                "Run the enrollment sketch, tap each card, and copy the printed UIDs into the firmware whitelist before final install.",
              parts: ["MFRC522 RFID Reader", "ESP8266 NodeMCU"],
            },
          ],
        },
        {
          title: "Wire",
          steps: [
            {
              title: "Connect the SPI reader",
              detail:
                "MFRC522 → D5 (SS), D6 (MISO), D7 (MOSI), D8 (SCK) plus 3.3V — never 5V, the reader is not 5V tolerant.",
              tools: ["Soldering iron"],
              parts: ["MFRC522 RFID Reader"],
            },
            {
              title: "Wire the relay and solenoid",
              detail:
                "The relay switches the 12V leg to the solenoid; fuse the 12V feed at 5A. Flyback across the solenoid coil protects the contacts.",
              tools: ["Multimeter"],
              parts: ["Relay Module", "12V Solenoid Lock", "12V Power Supply"],
            },
          ],
        },
        {
          title: "Install",
          steps: [
            {
              title: "Mount the solenoid and test the throw",
              detail:
                "Attach to the existing strike, cycle the lock ten times by hand and with the solenoid, and confirm the bolt never binds.",
              tools: ["Screwdriver set"],
              parts: ["Striker Plate", "12V Solenoid Lock"],
            },
            {
              title: "Tap test and access log check",
              detail:
                "Tap an enrolled card, confirm the unlock, and verify the HTTP POST arrives in the log endpoint within a second.",
              parts: ["ESP8266 NodeMCU"],
            },
          ],
        },
      ],
    },
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
    features: [
      "solar + 18650 buffer",
      "tipping bucket rain gauge",
      "anemometer interrupts",
      "IP65 electronics box",
      "Wi-Fi dashboard",
    ],
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
    wiringNodes: [
      { id: "panel", label: "6V Solar Panel", kind: "power" },
      { id: "charger", label: "TP4056 Charger", kind: "module" },
      { id: "cell", label: "18650 Li-Ion", kind: "power" },
      { id: "mcu", label: "ESP32 Dev Board", kind: "mcu" },
      { id: "bme", label: "BME280", kind: "sensor" },
      { id: "wind", label: "Anemometer", kind: "sensor" },
      { id: "rain", label: "Rain Gauge", kind: "sensor" },
    ],
    wiringEdges: [
      { from: "panel", to: "charger", label: "6V" },
      { from: "charger", to: "cell", label: "charge" },
      { from: "cell", to: "mcu", label: "3.3V LDO" },
      { from: "bme", to: "mcu", label: "I2C" },
      { from: "wind", to: "mcu", label: "INT GPIO27" },
      { from: "rain", to: "mcu", label: "INT GPIO26" },
    ],
    wiring:
      "BME280 on I2C. Anemometer and rain gauge connect to interrupt pins. Solar panel → TP4056 → 18650 → 3.3V LDO for the ESP32. All sensors inside the sealed enclosure, mast outside.",
    mechSpecs: [
      { label: "Mast height", value: "1.8 m above roof line" },
      { label: "Panel", value: "6V 2W at 30° south tilt" },
      { label: "Runtime", value: "indefinite (4 h sun/day)" },
      { label: "Enclosure", value: "IP65 with cable glands" },
    ],
    mechSections: [
      {
        title: "Mast layout",
        body: "The anemometer crowns the mast so it reads clean wind above the roof line; the rain gauge hangs just below on a printed bracket, funnel level in both axes. Everything else lives at the base.",
      },
      {
        title: "Electronics box",
        body: "An IP65 box holds the board, charger and cell. Every cable enters through a gland with a drip loop, and a user-replaceable desiccant pack fights the condensation cycle that kills outdoor builds.",
      },
    ],
    instructions: [
      "Seal the BME280 and board in the enclosure with a desiccant pack.",
      "Assemble the mast and aim the panel south at ~30° tilt.",
      "Connect to Wi-Fi and verify the dashboard receives updates.",
    ],
    build: {
      tools: [
        "Soldering iron",
        "Crimpers + heat shrink",
        "Drill + step bits",
        "Silicone sealant",
        "Compass / phone level",
      ],
      assumptions: [
        "Unobstructed southern sky for the panel",
        "Mast can be fixed above the roof line",
        "Wi-Fi signal reaches the base station",
      ],
      phases: [
        {
          title: "Seal the electronics",
          steps: [
            {
              title: "Route glands and drip loops",
              detail:
                "Drill the gland holes, silicone every pass-through, and form a drip loop on each cable so water never wicks into the box.",
              tools: ["Drill + step bits", "Silicone sealant"],
              parts: ["Weatherproof Enclosure"],
            },
            {
              title: "Pack the board with desiccant",
              detail:
                "Mount the BME280 away from the wall of the box for real air readings, and tuck a replaceable desiccant pack beside it.",
              tools: ["Soldering iron"],
              parts: ["BME280 Temp / Humidity", "ESP32 Dev Board"],
            },
          ],
        },
        {
          title: "Assemble the mast",
          steps: [
            {
              title: "Raise the anemometer above the roof line",
              detail:
                "Turbulence within ~0.5 m of the roof skews wind readings badly, so the cups go on top of the 1.8 m PVC mast.",
              tools: ["Crimpers + heat shrink"],
              parts: ["Anemometer", "PVC Mast"],
            },
            {
              title: "Aim the panel south at 30°",
              detail:
                "Fix the panel with a printed tilt bracket and confirm with a phone level; even 10° off costs a measurable charge.",
              tools: ["Compass / phone level"],
              parts: ["6V 2W Solar Panel"],
            },
          ],
        },
        {
          title: "Bring-up",
          steps: [
            {
              title: "Join Wi-Fi and verify the dashboard",
              detail:
                "Confirm the station posts on schedule and the battery voltage reads sensibly before calling the solar budget done.",
              parts: ["18650 Li-Ion Cell", "TP4056 Charger"],
            },
            {
              title: "Sanity-check rain tips and wind pulses",
              detail:
                "Pour a measured cup of water through the gauge and count the tips; spin the cups by hand and match the expected pulses.",
              parts: ["Tipping Bucket Rain Gauge", "Anemometer"],
            },
          ],
        },
      ],
    },
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
    features: [
      "PCA9685 16-ch PWM",
      "MG996R metal-gear servos",
      "Bluetooth phone control",
      "suction desk mount",
      "linkage gripper",
    ],
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
    wiringNodes: [
      { id: "psu", label: "5V 5A PSU", kind: "power" },
      { id: "mcu", label: "Arduino Uno", kind: "mcu" },
      { id: "driver", label: "PCA9685 Driver", kind: "module" },
      { id: "bt", label: "HC-05 Bluetooth", kind: "module" },
      { id: "servos", label: "MG996R ×4", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "psu", to: "driver", label: "5V rail" },
      { from: "psu", to: "mcu", label: "5V" },
      { from: "mcu", to: "driver", label: "I2C" },
      { from: "bt", to: "mcu", label: "UART" },
      { from: "driver", to: "servos", label: "PWM ×4" },
    ],
    wiring:
      "PCA9685 on I2C drives the four servos from a separate 5V rail. HC-05 on UART receives angle commands. Arduino decodes and writes PWM values.",
    mechSpecs: [
      { label: "Reach", value: "280 mm from base axis" },
      { label: "Payload", value: "180 g at full extension" },
      { label: "DOF", value: "4 joints + gripper" },
      { label: "Power", value: "5V 5A (servos on own rail)" },
    ],
    mechSections: [
      {
        title: "Linkage",
        body: "Aluminum brackets form the two forearm links with the MG996R servos buried in the joints, keeping the wrist light. The gripper closes through a simple linkage off the final servo, which trades grip force for range.",
      },
      {
        title: "Base",
        body: "The acrylic base plate clamps to the desk through a large suction cup. Servo jolt at full speed will walk a lighter base across the bench, so the plate is deliberately heavy for its size.",
      },
    ],
    instructions: [
      "Assemble the links and center all servos at 90°.",
      "Wire the PCA9685 and confirm each joint moves in the test sketch.",
      "Pair Bluetooth, load the phone control app, and calibrate the reach.",
    ],
    build: {
      tools: [
        "Soldering iron",
        "Hex driver set",
        "Phone with Bluetooth",
        "Servo tester (optional)",
      ],
      assumptions: [
        "Clear desk space for a 280 mm reach",
        "Separate 5V rail available for servos",
        "Basic Android/iOS control app installed",
      ],
      phases: [
        {
          title: "Assemble",
          steps: [
            {
              title: "Build the links and center the servos",
              detail:
                "Center every servo at 90° with a tester before attaching horns — re-teaching angles after assembly is misery.",
              tools: ["Servo tester (optional)", "Hex driver set"],
              parts: ["MG996R Servo", "Aluminum Brackets Set"],
            },
            {
              title: "Mount the gripper linkage",
              detail:
                "Keep the linkage horn screw snug but not crushed; the linkage needs a hair of free play to avoid stalling the wrist servo.",
              parts: ["Gripper Kit"],
            },
          ],
        },
        {
          title: "Wire",
          steps: [
            {
              title: "Wire the PCA9685 on its own 5V rail",
              detail:
                "Servo current spikes brown-out the Arduino if they share a rail; the PCA9685 V+ comes straight from the 5V 5A supply.",
              tools: ["Soldering iron"],
              parts: ["PCA9685 Servo Driver", "5V 5A Power Supply"],
            },
            {
              title: "Connect the HC-05 on UART",
              detail:
                "HC-05 TX → Arduino RX through a voltage divider (HC-05 is 3.3V logic on TX). Pair at 9600 baud.",
              parts: ["HC-05 Bluetooth"],
            },
          ],
        },
        {
          title: "Calibrate",
          steps: [
            {
              title: "Joint-by-joint test sketch",
              detail:
                "Sweep each joint through its full range and note the mechanical limits — these become the soft limits in the control app.",
              parts: ["Arduino Uno"],
            },
            {
              title: "Pair Bluetooth and calibrate reach",
              detail:
                "Pair the phone, load the control app, and set grip force + reach limits before letting it lift anything heavier than a pen.",
              parts: ["Suction Cup Mount"],
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #7 — Autonomous Rover (rover archetype)
     ============================================================ */
  {
    slug: "autonomous-rover",
    title: "Autonomous GPS Rover",
    author: "trail_blazer",
    avatarColor: "#f97316",
    cover: "/projects/autonomous-rover.jpg",
    createdAt: "2026-09-13T08:30:00Z",
    tags: ["Robotics", "Navigation"],
    featured: true,
    summary:
      "A 4WD rover that follows waypoints from GPS, avoids obstacles with ultrasonic rangefinders, and logs every run through LoRa back to base.",
    features: [
      "GPS waypoint navigation",
      "4WD independent drive",
      "3× ultrasonic obstacle avoidance",
      "LoRa telemetry back to base",
      "Solar-charged battery bank",
    ],
    stars: 12,
    parts: [
      { name: "Raspberry Pi 4 (4GB)", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 45.0 },
      { name: "Arduino Mega 2560", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 18.5 },
      { name: "ZED-F9P GPS Module", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 24.0 },
      { name: "HC-SR04 Ultrasonic ×3", category: "Electrical", subcategory: "Sensor", quantity: 3, unitCost: 2.8 },
      { name: "SX1262 LoRa Module", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 12.0 },
      { name: "L298N Motor Driver ×2", category: "Electrical", subcategory: "Driver", quantity: 2, unitCost: 4.5 },
      { name: "775 DC Motor ×4", category: "Electrical", subcategory: "Actuator", quantity: 4, unitCost: 6.2 },
      { name: "18650 ×6 Battery Pack", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 15.0 },
      { name: "Solar Panel 6W + Charge Controller", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 22.0 },
      { name: "Aluminum Frame + Wheels", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 38.0 },
    ],
    wiringNodes: [
      { id: "solar", label: "6W Solar + Charger", kind: "power" },
      { id: "bat", label: "6S Li-ion Pack", kind: "power" },
      { id: "pi", label: "Raspberry Pi 4", kind: "mcu" },
      { id: "mega", label: "Arduino Mega", kind: "mcu" },
      { id: "gps", label: "ZED-F9P GPS", kind: "module" },
      { id: "lora", label: "SX1262 LoRa", kind: "module" },
      { id: "front", label: "Front Ultrasonic", kind: "sensor" },
      { id: "left", label: "Left Ultrasonic", kind: "sensor" },
      { id: "right", label: "Right Ultrasonic", kind: "sensor" },
      { id: "drv1", label: "L298N Front", kind: "driver" },
      { id: "drv2", label: "L298N Rear", kind: "driver" },
    ],
    wiringEdges: [
      { from: "solar", to: "bat", label: "Charge rail" },
      { from: "bat", to: "pi", label: "USB-C 5V" },
      { from: "bat", to: "drv1", label: "12V drive" },
      { from: "bat", to: "drv2", label: "12V drive" },
      { from: "pi", to: "mega", label: "UART / obstacle cmd" },
      { from: "pi", to: "gps", label: "UART" },
      { from: "pi", to: "lora", label: "SPI" },
      { from: "mega", to: "front", label: "PWM echo" },
      { from: "mega", to: "left", label: "PWM echo" },
      { from: "mega", to: "right", label: "PWM echo" },
      { from: "mega", to: "drv1", label: "PWM EN / IN1-IN2" },
      { from: "mega", to: "drv2", label: "PWM EN / IN3-IN4" },
    ],
    wiring:
      "Arduino Mega handles motor control and ultrasonic rangefinding; Raspberry Pi runs GPS waypoint math and LoRa comms. Pi sends target speeds over UART; Mega closes the speed loop. Motor drivers sit directly on the battery rail — separate 5V regulator feeds the Pi.",
    mechSpecs: [
      { label: "Dimensions", value: "340 × 240 × 160 mm" },
      { label: "Ground Clearance", value: "45 mm" },
      { label: "Weight", value: "3.2 kg with solar panel" },
      { label: "Top Speed", value: "1.1 m/s" },
    ],
    mechSections: [
      {
        title: "Frame",
        body: "T-slotted aluminum rails keep the 775 motors bolted rigidly; each wheel carries a suspension spring to absorb trail shock and keep the ultrasonic heads level. The GPS antenna lives on the tallest corner.",
      },
      {
        title: "Battery Layout",
        body: "Li-ion pack sits low at the rear to keep the CG planted; the solar panel angles up 30° on a hinge so it can be folded down for transport.",
      },
    ],
    instructions: [
      "Mount the motors and run a PWM sanity check before wiring the Pi.",
      "Calibrate the ultrasonic sensors and teach the obstacle-avoidance thresholds.",
      "Flash the navigation stack, load a test waypoint list, and drive a short closed loop.",
    ],
    build: {
      tools: ["Soldering iron", "Hex key set", "Digital multimeter", "Li-ion charger"],
      assumptions: [
        "Outdoor GPS visibility available for testing",
        "6S balance charger for the battery pack",
        "Raspberry Pi Imager set up on a laptop",
      ],
      phases: [
        {
          title: "Chassis",
          steps: [
            {
              title: "Build the 4WD frame",
              detail:
                "Be generous with lock washers on motor mounts — vibration will walk loose any single-nut joint within an hour of trail running.",
              tools: ["Hex key set"],
              parts: ["Aluminum Frame + Wheels", "775 DC Motor"],
            },
            {
              title: "Install suspension and CG balance",
              detail:
                "Battery and Pi live at the rear; make sure the rover doesn't nose-dive when you pick it up by the front bumper.",
              parts: ["18650 ×6 Battery Pack"],
            },
          ],
        },
        {
          title: "Wire",
          steps: [
            {
              title: "Power rails first",
              detail:
                "Battery → L298Ns directly on 12V; separate 5V regulator feeds Pi and Mega. Never run motor current through a regulator.",
              tools: ["Soldering iron", "Digital multimeter"],
              parts: ["L298N Motor Driver", "18650 ×6 Battery Pack"],
            },
            {
              title: "Comm bus between Pi and Mega",
              detail:
                "Serial at 115200 baud. Pi sends JSON speed commands; Mega replies with obstacle distances every 50 ms.",
              parts: ["Raspberry Pi 4", "Arduino Mega 2560"],
            },
          ],
        },
        {
          title: "Navigate",
          steps: [
            {
              title: "GPS lock and waypoint test",
              detail:
                "Give the ZED-F9P 60 seconds of sky view for a good fix. Drive a 3-point triangle to verify heading accuracy before anything else.",
              parts: ["ZED-F9P GPS Module"],
            },
            {
              title: "LoRa telemetry and field test",
              detail:
                "Send heartbeat packets every 2 seconds. Walk the rover 200 m away and confirm you still see GPS drift before calling it ready.",
              parts: ["SX1262 LoRa Module"],
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #8 — Home Security Hub
     ============================================================ */
  {
    slug: "home-security-hub",
    title: "Home Security Hub",
    author: "keymaster",
    avatarColor: "#ef4444",
    cover: "/projects/security-hub.jpg",
    createdAt: "2026-09-13T10:00:00Z",
    tags: ["Security", "IoT"],
    summary:
      "An all-in-one security hub: PIR + window/door sensors stream to an ESP32-CAM, siren triggers on breach, and BLE lets you arm/disarm from your phone.",
    features: [
      "ESP32-CAM live feed",
      "3× PIR motion sensors",
      "4× door/window reed switches",
      "Active buzzer + relay siren",
      "BLE phone app arm/disarm",
    ],
    stars: 9,
    parts: [
      { name: "ESP32-CAM", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 14.0 },
      { name: "ESP32-C3 (co-proc)", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 9.5 },
      { name: "HC-SR501 PIR Sensor ×3", category: "Electrical", subcategory: "Sensor", quantity: 3, unitCost: 2.2 },
      { name: "Magnetic Reed Switch ×4", category: "Electrical", subcategory: "Sensor", quantity: 4, unitCost: 0.8 },
      { name: "Buzzer Active 5V", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 0.6 },
      { name: "5V Relay Module", category: "Electrical", subcategory: "Driver", quantity: 1, unitCost: 1.2 },
      { name: "120dB Piezo Siren", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 4.0 },
      { name: "USB-A 5V 2A PSU", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 5.5 },
      { name: "ABS Enclosure + DIN Rail", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 7.0 },
    ],
    wiringNodes: [
      { id: "psu", label: "5V 2A PSU", kind: "power" },
      { id: "cam", label: "ESP32-CAM", kind: "mcu" },
      { id: "c3", label: "ESP32-C3", kind: "mcu" },
      { id: "pir1", label: "PIR Hall", kind: "sensor" },
      { id: "pir2", label: "PIR Back", kind: "sensor" },
      { id: "pir3", label: "PIR Garage", kind: "sensor" },
      { id: "door1", label: "Front Door", kind: "sensor" },
      { id: "door2", label: "Back Door", kind: "sensor" },
      { id: "door3", label: "Window ×2", kind: "sensor" },
      { id: "buzz", label: "Buzzer", kind: "actuator" },
      { id: "relay", label: "Relay → Siren", kind: "driver" },
    ],
    wiringEdges: [
      { from: "psu", to: "cam", label: "5V" },
      { from: "psu", to: "c3", label: "5V" },
      { from: "c3", to: "cam", label: "UART status" },
      { from: "pir1", to: "c3", label: "GPIO ext 1" },
      { from: "pir2", to: "c3", label: "GPIO ext 2" },
      { from: "pir3", to: "c3", label: "GPIO ext 3" },
      { from: "door1", to: "c3", label: "GPIO door 1" },
      { from: "door2", to: "c3", label: "GPIO door 2" },
      { from: "door3", to: "c3", label: "GPIO door 3" },
      { from: "c3", to: "buzz", label: "GPIO 5V" },
      { from: "c3", to: "relay", label: "GPIO trigger" },
    ],
    wiring:
      "ESP32-C3 is the brain — it reads every sensor via GPIO, runs the alarm logic, and handles BLE arm/disarm. ESP32-CAM streams video over Wi-Fi and only wakes on trigger. Both share a 5V rail; PIRs and reed switches pull down on GPIO when active.",
    mechSpecs: [
      { label: "Hub Enclosure", value: "120 × 80 × 45 mm ABS" },
      { label: "Sensor Cable Length", value: "≤ 10 m per run" },
      { label: "Siren Rating", value: "120 dB @ 1 m" },
      { label: "Arm Latency", value: "< 3 s BLE → arm" },
    ],
    mechSections: [
      {
        title: "Hub Mounting",
        body: "The enclosure sits in a low-traffic central closet — Wi-Fi and BLE range both stay good, and it's out of sight but not out of earshot of the siren.",
      },
      {
        title: "Sensor Placement",
        body: "PIRs mount 2.1 m high in corners so their 120° view overlaps. Reed switches go on the door frame, not the movable leaf, so paint and vibration don't shift them.",
      },
    ],
    instructions: [
      "Flash both ESP32s and pair the phone over BLE before running any wires.",
      "Run sensor cables in the wall or under baseboards; avoid power cables to keep noise down.",
      "Walk-test each zone and tune the PIR sensitivity to ignore pets.",
    ],
    build: {
      tools: ["Soldering iron (optional)", "Wire strippers", "Drill + wall plugs", "Phillips screwdriver"],
      assumptions: [
        "Existing Wi-Fi network 2.4 GHz",
        "BLE-capable phone (iOS/Android)",
        "Access to the attic / crawl-space for cable runs",
      ],
      phases: [
        {
          title: "Hub",
          steps: [
            {
              title: "Flash and test both ESP32s",
              detail:
                "Do this at the bench first — mount the hub on the wall only after you've confirmed BLE pairing and one full alarm cycle.",
              parts: ["ESP32-CAM", "ESP32-C3"],
            },
            {
              title: "Enclosure and DIN rail wiring",
              detail:
                "Leave 30 mm of slack on each sensor cable inside the enclosure so you can service a module without re-pulling a wall run.",
              parts: ["ABS Enclosure + DIN Rail"],
            },
          ],
        },
        {
          title: "Sensors",
          steps: [
            {
              title: "Run reed switches to doors and windows",
              detail:
                "Mount the magnet half on the movable leaf, the switch half on the frame — gap ≤ 5 mm when closed.",
              parts: ["Magnetic Reed Switch"],
            },
            {
              title: "Calibrate PIRs for pet immunity",
              detail:
                "Tape the sensitivity pot halfway clockwise. Have a 10 kg dog walk the zone — it should not trip. You will tune per PIR.",
              tools: ["Phillips screwdriver"],
              parts: ["HC-SR501 PIR Sensor"],
            },
          ],
        },
        {
          title: "Alarm",
          steps: [
            {
              title: "Wire the siren through the relay",
              detail:
                "Siren draws way more current than the ESP32 can source — relay coil on GPIO, siren on the relay's own contacts.",
              parts: ["5V Relay Module", "120dB Piezo Siren"],
            },
            {
              title: "Full-cycle test",
              detail:
                "Arm → open a door → siren must fire in < 2 s → disarm from BLE. Repeat for every zone before leaving the house.",
              tools: ["BLE phone app"],
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #9 — Aquaponics Monitor
     ============================================================ */
  {
    slug: "aquaponics-monitor",
    title: "Aquaponics Farm Monitor",
    author: "pond_witch",
    avatarColor: "#06b6d4",
    cover: "/projects/aquaponics-monitor.jpg",
    createdAt: "2026-09-13T12:00:00Z",
    tags: ["IoT", "Sensors"],
    summary:
      "Tracks pH, water temp, dissolved oxygen, and nutrient levels across a fish-tank + grow-bed loop; sends alerts to Telegram when anything drifts outside safe bands.",
    features: [
      "pH + temp + DO + nutrient sensing",
      "4× channel multiplexer",
      "Telegram bot alerts",
      "Automatic solenoid valve dosing",
      "Historical data dashboard",
    ],
    stars: 11,
    parts: [
      { name: "ESP32-S3 DevKit", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 18.0 },
      { name: "Atlas Scientific pH Kit", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 34.0 },
      { name: "DS18B20 Waterproof Temp", category: "Electrical", subcategory: "Sensor", quantity: 2, unitCost: 4.5 },
      { name: "Atlas Dissolved Oxygen Kit", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 55.0 },
      { name: "TCA9548A I2C Mux", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 3.5 },
      { name: "4× Solenoid Valves 12V", category: "Electrical", subcategory: "Actuator", quantity: 2, unitCost: 6.5 },
      { name: "ULN2003 Darlington Driver", category: "Electrical", subcategory: "Driver", quantity: 1, unitCost: 2.0 },
      { name: "5V 2A PSU + 12V 1A PSU", category: "Electrical", subcategory: "Power", quantity: 2, unitCost: 9.0 },
      { name: "PVC Tee + Tube Fittings", category: "Mechanical", subcategory: "Fluidics", quantity: 1, unitCost: 15.0 },
    ],
    wiringNodes: [
      { id: "psu5", label: "5V 2A PSU", kind: "power" },
      { id: "psu12", label: "12V 1A PSU", kind: "power" },
      { id: "mcu", label: "ESP32-S3", kind: "mcu" },
      { id: "mux", label: "TCA9548A I2C Mux", kind: "module" },
      { id: "ph", label: "pH Probe", kind: "sensor" },
      { id: "do", label: "Dissolved Oxygen", kind: "sensor" },
      { id: "temp1", label: "Tank Temp 1", kind: "sensor" },
      { id: "temp2", label: "Grow-bed Temp 2", kind: "sensor" },
      { id: "drv", label: "ULN2003 Driver", kind: "driver" },
      { id: "vph", label: "pH Dose Valve", kind: "actuator" },
      { id: "vnut", label: "Nutrient Dose Valve", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "psu5", to: "mcu", label: "5V" },
      { from: "psu12", to: "vph", label: "12V" },
      { from: "psu12", to: "vnut", label: "12V" },
      { from: "mcu", to: "mux", label: "I2C" },
      { from: "mux", to: "ph", label: "I2C ch0" },
      { from: "mux", to: "do", label: "I2C ch1" },
      { from: "temp1", to: "mcu", label: "1-Wire" },
      { from: "temp2", to: "mcu", label: "1-Wire" },
      { from: "mcu", to: "drv", label: "GPIO ×2" },
      { from: "drv", to: "vph", label: "12V ground switch" },
      { from: "drv", to: "vnut", label: "12V ground switch" },
    ],
    wiring:
      "Atlas pH and DO probes share an I2C bus through a TCA9548A mux (each probe hard-codes an address). DS18B20s live on OneWire. ESP32-S3 runs the dosing logic — ULN2003 switches 12V valves to ground (common-negative solenoids).",
    mechSpecs: [
      { label: "Tank Volume", value: "200 L (fish side)" },
      { label: "Ideal pH Band", value: "6.8 – 7.2" },
      { label: "Ideal DO", value: "> 6 mg/L" },
      { label: "Dosing Resolution", value: "10 mL per pulse" },
    ],
    mechSections: [
      {
        title: "Probe Placement",
        body: "pH and DO probes live in the sump where flow is steady; never bury them in the grow-bed media or you'll get biofouling and stale readings.",
      },
      {
        title: "Dosing Manifold",
        body: "Two 12V solenoids feed into a PVC tee that drops into the sump. Keep the dosing lines above water level to prevent back-siphonage when the valves are off.",
      },
    ],
    instructions: [
      "Calibrate the pH probe with 4.0 and 7.0 buffers before anything else.",
      "Prime the dosing lines with solution by powering each valve manually 3 times.",
      "Set wide alert thresholds at first — you'll tighten them as the system stabilizes over 2 weeks.",
    ],
    build: {
      tools: ["Soldering iron", "Wire strippers", "PVC pipe cutter", "Multimeter"],
      assumptions: [
        "Existing fish tank + grow-bed loop",
        "Telegram bot token configured",
        "Power point within 2 m of the sump",
      ],
      phases: [
        {
          title: "Sense",
          steps: [
            {
              title: "I2C mux bus and probe calibration",
              detail:
                "Power only the probes, run a bus scan, and confirm each one reports before submerging. pH calibration takes 10 minutes — don't rush it.",
              parts: ["TCA9548A I2C Mux", "Atlas Scientific pH Kit"],
            },
            {
              title: "OneWire temperature ring",
              detail:
                "Connect DS18B20s in parallel on a single GPIO with a 4.7 kΩ pull-up. Addresses print to serial on boot so you know which probe is which.",
              parts: ["DS18B20 Waterproof Temp"],
            },
          ],
        },
        {
          title: "Actuate",
          steps: [
            {
              title: "12V valve driver and manifold",
              detail:
                "Common-negative solenoids — ULN2003 sinks the current, 12V stays high on the other side. 12V comes from a dedicated supply, not the ESP32 rail.",
              parts: ["ULN2003 Darlington Driver", "4× Solenoid Valves 12V"],
            },
            {
              title: "Telegram bot and alert bands",
              detail:
                "Test with intentionally bad pH — the bot must reply within 30 seconds. Tighten the bands only after a week of stable baselines.",
              parts: ["ESP32-S3 DevKit"],
            },
          ],
        },
        {
          title: "Deploy",
          steps: [
            {
              title: "Submerge probes and mount manifold",
              detail:
                "Tie probes to a float so they stay 5 cm below the surface. Dosing manifold sits above water to prevent back-siphonage.",
              tools: ["PVC pipe cutter"],
              parts: ["PVC Tee + Tube Fittings"],
            },
            {
              title: "Two-week stabilization log",
              detail:
                "Export CSV daily. If variance is still wild after 14 days, check for biofouling on the DO probe membrane and replace if scaly.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #10 — Bike Satellite Nav (generic with GPS + LoRa)
     ============================================================ */
  {
    slug: "bike-satnav-lora",
    title: "Bike Satellite Nav + LoRa Tracker",
    author: "trail_rider",
    avatarColor: "#84cc16",
    cover: "/projects/bike-satnav.jpg",
    createdAt: "2026-09-13T14:00:00Z",
    tags: ["Wearable", "Navigation"],
    summary:
      "Handlebar-mounted GPS navigator with turn-by-turn directions on a 2.4\" TFT, plus LoRa beacons so a support vehicle can track you through dead zones.",
    features: [
      "ZED-F9P high-precision GPS",
      "2.4\" TFT turn-by-turn display",
      "SX1262 LoRa beacon every 10 s",
      "USB-C rechargeable 5000 mAh",
      "IP67 silicone handlebar mount",
    ],
    stars: 7,
    parts: [
      { name: "ESP32-S3 DevKit", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 18.0 },
      { name: "ZED-F9P GPS Module", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 24.0 },
      { name: "2.4\" ST7789 TFT Display", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 12.0 },
      { name: "SX1262 LoRa Module", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 12.0 },
      { name: "5000 mAh Li-Po 3.7V", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 14.0 },
      { name: "TP4056 USB-C Charger", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 1.5 },
      { name: "Silicone Handlebar Mount + Strap", category: "Mechanical", subcategory: "Mount", quantity: 1, unitCost: 8.0 },
      { name: "3D-printed Splash Shield", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 3.0 },
    ],
    wiringNodes: [
      { id: "bat", label: "5000 mAh Li-Po", kind: "power" },
      { id: "chg", label: "TP4056 Charger", kind: "power" },
      { id: "mcu", label: "ESP32-S3", kind: "mcu" },
      { id: "gps", label: "ZED-F9P", kind: "module" },
      { id: "tft", label: "2.4\" TFT", kind: "module" },
      { id: "lora", label: "SX1262", kind: "module" },
    ],
    wiringEdges: [
      { from: "bat", to: "chg", label: "Charge rail" },
      { from: "chg", to: "mcu", label: "3.3V/5V" },
      { from: "mcu", to: "gps", label: "UART + I2C" },
      { from: "mcu", to: "tft", label: "SPI" },
      { from: "mcu", to: "lora", label: "SPI" },
    ],
    wiring:
      "GPS UART for raw NMEA, I2C for configuration. TFT and LoRa share a hardware SPI bus with separate CS pins. The 3.7V rail feeds everything directly from the battery — no regulator needed.",
    mechSpecs: [
      { label: "Weight", value: "112 g with battery" },
      { label: "Run Time", value: "14 hours continuous GPS + LoRa" },
      { label: "Water Resistance", value: "IP67 (splash shield + mount)" },
      { label: "Mount Dia.", value: "22.2 – 31.8 mm handlebars" },
    ],
    mechSections: [
      {
        title: "Handlebar Mount",
        body: "Silicone wrap with two velcro straps goes under the handlebars; the main body clips on top. This makes it tool-removable for theft protection.",
      },
      {
        title: "Splash Shield",
        body: "3D-printed PETG visor angled at 45° keeps direct rain off the TFT while still being readable from the riding position.",
      },
    ],
    instructions: [
      "Flash firmware, upload a GPX route to flash storage, and acquire initial GPS fix in open sky.",
      "Pair LoRa base station on the support vehicle and confirm 2 km range on a test loop.",
      "Mount to handlebars, strap tight, go ride.",
    ],
    build: {
      tools: ["Soldering iron", "3D printer (optional)", "Hex key"],
      assumptions: [
        "Bike with 22.2–31.8 mm handlebars",
        "GPX route file exported from Komoot / Strava",
        "Support vehicle or second LoRa receiver",
      ],
      phases: [
        {
          title: "Assemble",
          steps: [
            {
              title: "Solder all modules to perfboard",
              detail:
                "Keep the GPS antenna away from the LoRa antenna — 20 mm minimum separation or they'll desensitize each other.",
              parts: ["ESP32-S3 DevKit", "ZED-F9P GPS Module", "SX1262 LoRa Module"],
            },
            {
              title: "Mount in handlebar housing",
              detail:
                "3D-printed splash shield is optional but strongly recommended — a single rain-soaked ride will destroy an unprotected TFT.",
              parts: ["3D-printed Splash Shield"],
            },
          ],
        },
        {
          title: "Configure",
          steps: [
            {
              title: "Load GPX route and tune UI",
              detail:
                "2.4\" is small — turn-by-turn must be one bold line at 24 px. Test readability in direct sun before the real ride.",
              parts: ["2.4\" ST7789 TFT Display"],
            },
            {
              title: "LoRa pairing with base station",
              detail:
                "Send a beacon every 10 s at SF9 — good balance between range and latency. Base station logs beacons to a CSV for post-ride replay.",
            },
          ],
        },
        {
          title: "Ride",
          steps: [
            {
              title: "Open-sky GPS test loop",
              detail:
                "10 km loop with known turns. Compare the device's logged position to Strava afterwards — should be within 3 m.",
            },
            {
              title: "Dead-zone LoRa validation",
              detail:
                "Ride through a valley or under a canopy. LoRa beacons should keep arriving even when the phone has zero bars.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #11 — Retro Gaming Controller
     ============================================================ */
  {
    slug: "retro-gaming-controller",
    title: "Retro 8-Button USB Controller",
    author: "arcade_ghost",
    avatarColor: "#a855f7",
    cover: "/projects/retro-controller.jpg",
    createdAt: "2026-09-14T06:00:00Z",
    tags: ["Wearable", "Robotics"],
    summary:
      "A custom 8-button arcade controller with a D-pad, RGB underglow, USB-C passthrough, and an ESP32-S3 inside so it can double as a BLE gamepad.",
    features: [
      "Arcade-quality Sanwa buttons ×8",
      "Sanwa D-pad",
      "WS2812 RGB underglow",
      "USB-C + BLE dual mode",
      "3D-printed sandalwood case",
    ],
    stars: 14,
    parts: [
      { name: "ESP32-S3 DevKit", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 18.0 },
      { name: "Sanwa OBSF-30 Pushbutton ×8", category: "Electrical", subcategory: "Switch", quantity: 8, unitCost: 3.5 },
      { name: "Sanwa JLF-TP-8YT Joystick", category: "Electrical", subcategory: "Switch", quantity: 1, unitCost: 45.0 },
      { name: "WS2812B Addressable LED", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 2.0 },
      { name: "5V USB-C Female Socket", category: "Electrical", subcategory: "Connector", quantity: 1, unitCost: 1.5 },
      { name: "1N4148 Signal Diode ×12", category: "Electrical", subcategory: "Component", quantity: 12, unitCost: 0.05 },
      { name: "3D-printed Sandalwood Case", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 25.0 },
      { name: "Acrylic Faceplate", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 12.0 },
    ],
    wiringNodes: [
      { id: "usb", label: "USB-C 5V", kind: "power" },
      { id: "mcu", label: "ESP32-S3", kind: "mcu" },
      { id: "dpad", label: "D-pad (4 switches)", kind: "sensor" },
      { id: "btn1", label: "A Button", kind: "sensor" },
      { id: "btn2", label: "B Button", kind: "sensor" },
      { id: "btn3", label: "X Button", kind: "sensor" },
      { id: "btn4", label: "Y Button", kind: "sensor" },
      { id: "btn5", label: "L Shoulder", kind: "sensor" },
      { id: "btn6", label: "R Shoulder", kind: "sensor" },
      { id: "rgb", label: "WS2812B", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "usb", to: "mcu", label: "5V VBUS" },
      { from: "dpad", to: "mcu", label: "GPIO ×4" },
      { from: "btn1", to: "mcu", label: "GPIO" },
      { from: "btn2", to: "mcu", label: "GPIO" },
      { from: "btn3", to: "mcu", label: "GPIO" },
      { from: "btn4", to: "mcu", label: "GPIO" },
      { from: "btn5", to: "mcu", label: "GPIO" },
      { from: "btn6", to: "mcu", label: "GPIO" },
      { from: "mcu", to: "rgb", label: "GPIO (DMA)" },
    ],
    wiring:
      "All 12 switches (4 D-pad + 6 face + 2 shoulders) are active-low inputs with 10 kΩ pull-ups on the ESP32-S3. WS2812B data pin goes on a GPIO with DMA support for flicker-free RGB. USB-C supplies 5V VBUS; the ESP32-S3 acts as a USB device.",
    mechSpecs: [
      { label: "Enclosure", value: "170 × 110 × 35 mm wood + acrylic" },
      { label: "Weight", value: "420 g" },
      { label: "Mounting Holes", value: "4 × M3 bottom" },
      { label: "Button Spacing", value: "20 mm center-to-center" },
    ],
    mechSections: [
      {
        title: "Case",
        body: "Sandalwood PLA filament on a Prusa — the grain looks gorgeous with a clear coat. Acrylic faceplate laser-cut at 3 mm sits on top to protect the buttons from nail scratches.",
      },
      {
        title: "Ergonomics",
        body: "Handles angle at 15°; your fingers naturally rest on A/B above X/Y. Shoulder buttons sit exactly where your forefinger curls — test with 10 minutes of Smash Bros before gluing in.",
      },
    ],
    instructions: [
      "Print the case (0.2 mm layer height), sand, clear-coat, and let cure 24 h.",
      "Wire every switch with a 1N4148 in series on each button line to prevent ghosting.",
      "Flash the ESP32-S3 with the USB + BLE dual-mode firmware.",
    ],
    build: {
      tools: ["Soldering iron", "3D printer", "Laser cutter (for acrylic)", "Sandpaper + clear coat"],
      assumptions: [
        "PC with USB port (for firmware + play)",
        "BLE-capable console / PC (optional, for wireless mode)",
        "20-pin Dupont female cables",
      ],
      phases: [
        {
          title: "Cut",
          steps: [
            {
              title: "3D-print wood case and laser acrylic faceplate",
              detail:
                "Print handles upright for best layer adhesion. Acrylic faceplate holes must be 31 mm — Sanwa buttons are a tight 30 mm press-fit.",
              parts: ["3D-printed Sandalwood Case", "Acrylic Faceplate"],
            },
            {
              title: "Dry-fit all buttons and joystick",
              detail:
                "Press every button in by hand before soldering anything. A misdrilled hole on the faceplate ruins the whole case — catch it here.",
              parts: ["Sanwa OBSF-30 Pushbutton", "Sanwa JLF-TP-8YT Joystick"],
            },
          ],
        },
        {
          title: "Wire",
          steps: [
            {
              title: "Diode matrix to prevent ghosting",
              detail:
                "One 1N4148 per switch anode goes to the GPIO, cathode to common GND. Without diodes, pressing A+B+C simultaneously reads A three times.",
              tools: ["Soldering iron"],
              parts: ["1N4148 Signal Diode"],
            },
            {
              title: "USB-C power and ESP32-S3 flash",
              detail:
                "USB-C VBUS → ESP32-S3 5V rail. Use a 1 MΩ resistor from D-/D+ to GND so the host detects full-speed USB 2.0.",
              parts: ["ESP32-S3 DevKit", "5V USB-C Female Socket"],
            },
          ],
        },
        {
          title: "Play",
          steps: [
            {
              title: "RGB underglow and firmware test",
              detail:
                "WS2812B data pin on GPIO 16 for DMA. Cycle through Solid / Breathing / Rainbow presets in the menu before final assembly.",
              parts: ["WS2812B Addressable LED"],
            },
            {
              title: "USB + BLE smoke test",
              detail:
                "Plug in → host sees gamepad. Unplug → BLE pairs to phone. Press every button; no ghosting, no missed inputs.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #12 — Mini CNC Router
     ============================================================ */
  {
    slug: "mini-cnc-router",
    title: "Mini CNC Router V2",
    author: "chip_carver",
    avatarColor: "#0ea5e9",
    cover: "/projects/mini-cnc.jpg",
    createdAt: "2026-09-14T08:00:00Z",
    tags: ["Robotics", "Security"],
    summary:
      "A 3-axis desktop CNC that carves wood, acrylic, and soft metals. Runs GRBL on an Arduino Uno, stepper drivers on parallel, and a Makita trimmer for the spindle.",
    features: [
      "500 × 400 × 100 mm work envelope",
      "NEMA 17 ×3 steppers",
      "A4988 stepper drivers",
      "GRBL controller on Arduino Uno",
      "Makita RT0702C trimmer spindle",
    ],
    stars: 10,
    parts: [
      { name: "Arduino Uno", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 14.0 },
      { name: "CNC Shield V3", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 12.0 },
      { name: "A4988 Stepper Driver ×3", category: "Electrical", subcategory: "Driver", quantity: 3, unitCost: 2.5 },
      { name: "NEMA 17 1.8° Stepper ×3", category: "Electrical", subcategory: "Actuator", quantity: 3, unitCost: 8.0 },
      { name: "24V 10A PSU", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 25.0 },
      { name: "Makita RT0702C Trim Router", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 89.0 },
      { name: "GT2 Belt + Pulleys", category: "Mechanical", subcategory: "Motion", quantity: 3, unitCost: 12.0 },
      { name: "Aluminum V-Slot Rail 2020", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 55.0 },
      { name: "Linear Bearing + Rod", category: "Mechanical", subcategory: "Motion", quantity: 1, unitCost: 28.0 },
      { name: "Endstop Switch ×3", category: "Electrical", subcategory: "Switch", quantity: 3, unitCost: 0.5 },
    ],
    wiringNodes: [
      { id: "psu", label: "24V 10A PSU", kind: "power" },
      { id: "uno", label: "Arduino Uno", kind: "mcu" },
      { id: "shield", label: "CNC Shield V3", kind: "module" },
      { id: "xdrv", label: "A4988 X", kind: "driver" },
      { id: "ydrv", label: "A4988 Y", kind: "driver" },
      { id: "zdrv", label: "A4988 Z", kind: "driver" },
      { id: "xmot", label: "NEMA X", kind: "actuator" },
      { id: "ymot", label: "NEMA Y", kind: "actuator" },
      { id: "zmot", label: "NEMA Z", kind: "actuator" },
      { id: "spindle", label: "Makita Spindle", kind: "actuator" },
      { id: "ex", label: "X Endstop", kind: "sensor" },
      { id: "ey", label: "Y Endstop", kind: "sensor" },
      { id: "ez", label: "Z Endstop", kind: "sensor" },
    ],
    wiringEdges: [
      { from: "psu", to: "shield", label: "24V motor rail" },
      { from: "psu", to: "uno", label: "24V → 5V regulator" },
      { from: "uno", to: "shield", label: "header stack" },
      { from: "shield", to: "xdrv", label: "STEP / DIR / EN" },
      { from: "shield", to: "ydrv", label: "STEP / DIR / EN" },
      { from: "shield", to: "zdrv", label: "STEP / DIR / EN" },
      { from: "xdrv", to: "xmot", label: "2A phase A/B" },
      { from: "ydrv", to: "ymot", label: "2A phase A/B" },
      { from: "zdrv", to: "zmot", label: "2A phase A/B" },
      { from: "shield", to: "spindle", label: "PWM speed relay" },
      { from: "ex", to: "uno", label: "GPIO X_MIN" },
      { from: "ey", to: "uno", label: "GPIO Y_MIN" },
      { from: "ez", to: "uno", label: "GPIO Z_MIN (probe)" },
    ],
    wiring:
      "CNC Shield V3 stacks directly on the Uno. A4988 drivers plug into X/Y/Z sockets on top; NEMA motors connect to the 4-pin terminal blocks. 24V PSU feeds motor rail through the shield, which has its own regulator for the Uno's 5V. Endstops are active-low with internal pull-ups.",
    mechSpecs: [
      { label: "Work Envelope", value: "500 × 400 × 100 mm" },
      { label: "Rapid Travel", value: "4000 mm/min" },
      { label: "Step Resolution", value: "0.0625 mm @ 1/16 microstep" },
      { label: "Spindle", value: "Makita RT0702C 1.25 HP" },
    ],
    mechSections: [
      {
        title: "Frame",
        body: "V-slot 2020 aluminum everywhere — bolts slide along the grooves so you can tune the gantry alignment. Add gussets at every corner joint before the first cut.",
      },
      {
        title: "Gantry",
        body: "Y-axis rides on dual linear bearings on 16 mm hardened steel rods. Z-axis is a single NEMA driving a leadscrew — this gives enough torque for a 1/8\" end mill in aluminum.",
      },
    ],
    instructions: [
      "Assemble the frame square within 0.1 mm using a machinist's square.",
      "Flash GRBL v1.1 and send $$ to set your X/Y/Z steps-per-mm.",
      "Run a dry run with the spindle off before the first cut. Then clamp the Makita on carefully — it throws chips.",
    ],
    build: {
      tools: ["Allen key set", "Machinist's square", "Soldering iron", "USB cable", "Safety glasses"],
      assumptions: [
        "Garage / workshop with 230V or 110V outlet",
        "Mac or PC with Candle / UGS (GRBL sender)",
        "Compressed air (recommended) or vacuum for chip removal",
      ],
      phases: [
        {
          title: "Frame",
          steps: [
            {
              title: "Square the base to < 0.1 mm",
              detail:
                "Tighten one corner fully, then pull diagonals with a tape measure. Out of square diagonals means the gantry will bind for the whole build.",
              tools: ["Allen key set", "Machinist's square"],
              parts: ["Aluminum V-Slot Rail 2020"],
            },
            {
              title: "Mount linear rails and Z rod",
              detail:
                "Torque bearing holders in a cross pattern, same as a wheel. If you tighten one fully before the others you'll twist the rail.",
              parts: ["Linear Bearing + Rod"],
            },
          ],
        },
        {
          title: "Drive",
          steps: [
            {
              title: "CNC Shield V3 and GRBL flash",
              detail:
                "Stack the shield on the Uno before wiring anything — it's a press-fit on the headers. Flash GRBL v1.1 directly through the Arduino bootloader.",
              parts: ["Arduino Uno", "CNC Shield V3"],
            },
            {
              title: "A4988 current limit and stepper wiring",
              detail:
                "Set each A4988 trim pot to match your motor's rated current (e.g. NEMA 17 @ 2 A → 2 A on the pot). Don't power steppers from USB — always the 24V rail.",
              tools: ["Multimeter"],
              parts: ["A4988 Stepper Driver", "NEMA 17 1.8° Stepper"],
            },
          ],
        },
        {
          title: "Cut",
          steps: [
            {
              title: "Spindle mount and first dry run",
              detail:
                "Clamp the Makita in its bracket with 8 mm hex screws. Run the full G-code with spindle off — listen for any binding before turning it on.",
              parts: ["Makita RT0702C Trim Router"],
            },
            {
              title: "0.1 mm pocket test in MDF",
              detail:
                "Your first test should be a 50 × 50 × 0.1 mm pocket in MDF. Measure depth with a caliper — if it's off by more than 0.01 mm, tune Z steps-per-mm.",
              tools: ["Safety glasses", "USB cable"],
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #13 — Cyberdeck Hacking Workstation
     ============================================================ */
  {
    slug: "cyberdeck-workstation",
    title: "Cyberdeck Hacking Workstation",
    author: "wirehead",
    avatarColor: "#22d3ee",
    cover: "/projects/cyberdeck-workstation.jpg",
    createdAt: "2026-09-14T10:00:00Z",
    tags: ["Robotics", "IoT"],
    featured: true,
    summary:
      "A portable 7-inch hacking workstation with a Raspberry Pi 5, mechanical keyboard, USB hub, SDR dongle slot, and battery life to survive a 4-hour DEF CON talk.",
    features: [
      "Raspberry Pi 5 + CM4",
      "7-inch IPS touchscreen",
      "40% ortholinear keyboard",
      "USB-C hub + SDR slot",
      "6-hour battery pack",
    ],
    stars: 20,
    parts: [
      { name: "Raspberry Pi 5 (8GB)", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 55.0 },
      { name: "7\" IPS Touchscreen HDMI", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 42.0 },
      { name: "GMK-style 40% PCB", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 38.0 },
      { name: "Kailh Box Navies ×44", category: "Electrical", subcategory: "Component", quantity: 44, unitCost: 0.3 },
      { name: "2.4 GHz RTL-SDR Dongle", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 28.0 },
      { name: "USB-C Hub 8-port", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 22.0 },
      { name: "10000 mAh PD Power Bank", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 35.0 },
      { name: "3D-printed PETG Enclosure", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 28.0 },
      { name: "Hinged Display Mount", category: "Mechanical", subcategory: "Mount", quantity: 1, unitCost: 6.0 },
    ],
    wiringNodes: [
      { id: "bat", label: "10000 mAh PD Bank", kind: "power" },
      { id: "pi", label: "Raspberry Pi 5", kind: "mcu" },
      { id: "disp", label: "7\" IPS HDMI", kind: "module" },
      { id: "kb", label: "40% Keyboard", kind: "module" },
      { id: "hub", label: "USB-C Hub", kind: "module" },
      { id: "sdr", label: "RTL-SDR Dongle", kind: "module" },
    ],
    wiringEdges: [
      { from: "bat", to: "pi", label: "USB-C PD" },
      { from: "pi", to: "disp", label: "HDMI + 5V" },
      { from: "pi", to: "kb", label: "GPIO I²C (QMK)" },
      { from: "pi", to: "hub", label: "USB 3.0" },
      { from: "hub", to: "sdr", label: "USB" },
    ],
    wiring:
      "Pi boots off the PD power bank via USB-C. Display is HDMI + GPIO backlight control. The keyboard uses QMK firmware on GPIO I²C so it doesn't consume a USB slot. SDR, Ethernet dongle, and pentest adapters all hang off the USB-C hub.",
    mechSpecs: [
      { label: "Closed Size", value: "200 × 140 × 45 mm" },
      { label: "Weight", value: "780 g with battery" },
      { label: "Battery Life", value: "6 hours (Pi idle + screen)" },
      { label: "Keyboard", value: "40% ortholinear, 44 keys" },
    ],
    mechSections: [
      {
        title: "Enclosure",
        body: "Two-part PETG print — bottom tray nests the Pi, keyboard PCB, and USB hub; top shell hinges over the display. All cables route through a single cutout at the back so the hinge stays clean.",
      },
      {
        title: "Ergonomics",
        body: "Closed = flat case. Open = display tilts 110°, keyboard at a gentle 8° slope. This matches the laptop posture most hackers already default to — no re-learning needed.",
      },
    ],
    instructions: [
      "Flash Pi OS Lite + headless SSH, run rpi-update, enable I²C for the keyboard.",
      "Install QMK Toolbox, flash the 40% PCB with your keymap (defaults to Colemak).",
      "3D-print both shell halves with 20% infill, then wire everything and snap closed.",
    ],
    build: {
      tools: ["3D printer", "M3 hex driver", "USB-C data cable", "Phillips #1"],
      assumptions: [
        "Mac/Linux laptop to flash Pi OS",
        "Basic soldering (keyboard switches)",
        "4+ hours for 3D print",
      ],
      phases: [
        {
          title: "Print",
          steps: [
            {
              title: "Bottom shell with cable channels",
              detail:
                "Orient flat side down. 20% infill PETG. Add threaded heat-set inserts for the hinge screws before the shell cools.",
              tools: ["3D printer"],
              parts: ["3D-printed PETG Enclosure"],
            },
            {
              title: "Top shell with display aperture",
              detail:
                "Measure your specific display's exact bezel — the aperture should be 2 mm smaller all around so the display pops in from the front and stays put.",
              parts: ["7\" IPS Touchscreen HDMI"],
            },
          ],
        },
        {
          title: "Wire",
          steps: [
            {
              title: "QMK keyboard on GPIO I²C",
              detail:
                "The I²C backpack connects Pi SDA → PCB SDA, Pi SCL → PCB SCL, 5V and GND. Set I²C speed to 400 kHz on the Pi.",
              parts: ["GMK-style 40% PCB"],
            },
            {
              title: "PD bank boot test",
              detail:
                "Plug the bank in before closing the shell. Pi 5 draws up to 5A peak — if the bank can't supply it the system will brown-out on boot.",
              parts: ["10000 mAh PD Power Bank"],
            },
          ],
        },
        {
          title: "Hack",
          steps: [
            {
              title: "Pentest toolkit install",
              detail:
                "Run your standard pi-hole + wireshark + nmap + aircrack-ng stack. Use a separate USB Wi-Fi adapter for packet injection — the Pi 5's internal Wi-Fi can't do monitor mode reliably.",
            },
            {
              title: "Field test — conference Wi-Fi",
              detail:
                "Bring it to a café or conference. Confirm SDR locks onto the local cell band and the keyboard holds up to a 2-hour packet capture session.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #14 — Thermal Vision Camera
     ============================================================ */
  {
    slug: "thermal-vision-camera",
    title: "DIY Thermal Vision Camera",
    author: "infrared_ir",
    avatarColor: "#f43f5e",
    cover: "/projects/thermal-vision-camera.jpg",
    createdAt: "2026-09-14T11:00:00Z",
    tags: ["Robotics", "Wearable"],
    summary:
      "A handheld thermal imager using a FLIR Lepton 3.5 core, displaying temperature gradients on a 320×240 AMOLED. Calibrates on boot with a 2-point shutter offset.",
    features: [
      "FLIR Lepton 3.5 radiometric core",
      "160×120 native resolution",
      "9 Hz refresh rate",
      "320×240 AMOLED preview",
      "On-device temperature logging CSV",
    ],
    stars: 15,
    parts: [
      { name: "ESP32-S3 DevKit", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 18.0 },
      { name: "FLIR Lepton 3.5 Radiometric", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 199.0 },
      { name: "PureThermal 3 Breakout", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 49.0 },
      { name: "2.0\" 320×240 AMOLED", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 22.0 },
      { name: "5000 mAh Li-Po 3.7V", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 14.0 },
      { name: "TP4056 USB-C Charger", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 1.5 },
      { name: "Shutter Calibration Slider", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 2.0 },
      { name: "3D-printed Handheld Case", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 5.0 },
    ],
    wiringNodes: [
      { id: "bat", label: "5000 mAh Li-Po", kind: "power" },
      { id: "chg", label: "TP4056 Charger", kind: "power" },
      { id: "mcu", label: "ESP32-S3", kind: "mcu" },
      { id: "lepton", label: "FLIR Lepton 3.5", kind: "module" },
      { id: "pth", label: "PureThermal 3", kind: "module" },
      { id: "oled", label: "2.0\" AMOLED", kind: "module" },
      { id: "shut", label: "Calibration Shutter", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "bat", to: "chg", label: "Charge rail" },
      { from: "chg", to: "mcu", label: "3.3V" },
      { from: "lepton", to: "pth", label: "Lepton Flex Cable" },
      { from: "pth", to: "mcu", label: "I2C + SPI" },
      { from: "mcu", to: "oled", label: "SPI" },
      { from: "mcu", to: "shut", label: "GPIO" },
    ],
    wiring:
      "PureThermal 3 breakout bridges the Lepton's 2.8 V SPI + I²C into the ESP32-S3's 3.3 V world. Every 2 seconds the MCU commands the shutter closed, captures a black-body reference, subtracts it from the live frame, and renders on the AMOLED.",
    mechSpecs: [
      { label: "Field of View", value: "71° × 56°" },
      { label: "Temp Range", value: "-40 °C to +80 °C" },
      { label: "Weight", value: "88 g with battery" },
      { label: "Run Time", value: "3.5 hours continuous" },
    ],
    mechSections: [
      {
        title: "Optics",
        body: "The Lepton's lens focal plane must sit exactly behind the shutter. Add a 1 mm PETG thermal window over the front hole — glass filters IR, PETG is transparent out to 14 µm.",
      },
      {
        title: "Shutter",
        body: "A tiny servo (from an old drone tail) pushes a 5 × 3 mm Mylar flap over the lens on command. You can use your finger in an emergency but don't rest it there — the Lepton takes 2 seconds to re-stabilize after a calibration.",
      },
    ],
    instructions: [
      "PureThermal 3 driver first — confirm you see raw 16-bit frames over I²C/SPI before worrying about rendering.",
      "Print the case, add the PETG window, mount the shutter servo.",
      "Do a 2-point calibration (ice water + boiling water) and store the offset in flash.",
    ],
    build: {
      tools: ["Soldering iron", "3D printer", "USB-C cable", "7mm flathead screwdriver"],
      assumptions: [
        "FLIR Lepton 3.5 core (purchased or salvaged)",
        "ESP32-S3 IDF installed (not Arduino, the Lepton driver needs it)",
        "PETG sheet for IR window",
      ],
      phases: [
        {
          title: "Core",
          steps: [
            {
              title: "PureThermal 3 driver bring-up",
              detail:
                "Use the official GetThermal example first. Confirm you see temperature arrays printed to serial before touching any display code.",
              parts: ["PureThermal 3 Breakout", "FLIR Lepton 3.5 Radiometric"],
            },
            {
              title: "Shutter calibration routine",
              detail:
                "Map servo angle to fully-open and fully-closed positions in a separate sketch. Store these two integers in NVS so you don't hardcode them.",
            },
          ],
        },
        {
          title: "Render",
          steps: [
            {
              title: "False-color palette",
              detail:
                "Map the full temperature range (-20 to 60 °C) across 256 colors from blue → purple → yellow → red. Build this LUT once in RAM, not per pixel.",
              parts: ["2.0\" 320×240 AMOLED"],
            },
            {
              title: "Shutter auto-calibrate trigger",
              detail:
                "Trigger re-calibration every 30 seconds OR when the Lepton reports a temperature drift of more than 2 °C over 5 frames. This prevents image drift during long sessions.",
            },
          ],
        },
        {
          title: "Test",
          steps: [
            {
              title: "Ice vs boiling water sanity check",
              detail:
                "Point at a glass of ice water (should read ~0 °C) then a mug of boiling water (~95 °C). If either is off by more than 5 °C, re-calibrate.",
            },
            {
              title: "CSV logging and PC replay",
              detail:
                "Log every 10th frame as a comma-separated float to SPIFFS. After a field session, download and overlay the temp plot onto your normal camera stills.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #15 — Powered Exoskeleton Glove
     ============================================================ */
  {
    slug: "powered-exo-glove",
    title: "Powered Exoskeleton Glove",
    author: "mech_hand",
    avatarColor: "#8b5cf6",
    cover: "/projects/powered-exo-glove.jpg",
    createdAt: "2026-09-14T12:30:00Z",
    tags: ["Robotics", "Wearable"],
    summary:
      "A 5-finger powered glove that senses grip intent via EMG, then drives 5 linear actuators to amplify grip force up to 30×. Built for prosthetics and heavy lifting.",
    features: [
      "5 independent linear actuators",
      "Dual EMG sensors for grip intent",
      "Adaptive force control",
      "20-hour battery life",
      "Quick-swap fingertips",
    ],
    stars: 18,
    parts: [
      { name: "Teensy 4.1", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 25.0 },
      { name: "Pololu TB6612FNG ×5", category: "Electrical", subcategory: "Driver", quantity: 5, unitCost: 6.5 },
      { name: "12 V Linear Actuator ×5", category: "Electrical", subcategory: "Actuator", quantity: 5, unitCost: 18.0 },
      { name: "EMG Sensor Module ×2", category: "Electrical", subcategory: "Sensor", quantity: 2, unitCost: 12.0 },
      { name: "5000 mAh 12V LiFePO4", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 28.0 },
      { name: "Mechanical Finger Linkage ×5", category: "Mechanical", subcategory: "Motion", quantity: 1, unitCost: 45.0 },
      { name: "Neoprene Glove Shell", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 18.0 },
      { name: "Aluminum Backplate", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 15.0 },
    ],
    wiringNodes: [
      { id: "bat", label: "12V LiFePO4", kind: "power" },
      { id: "tb", label: "12V→5V Buck", kind: "power" },
      { id: "mcu", label: "Teensy 4.1", kind: "mcu" },
      { id: "emg1", label: "EMG Sensor (Extensor)", kind: "sensor" },
      { id: "emg2", label: "EMG Sensor (Flexor)", kind: "sensor" },
      { id: "drv1", label: "TB6612 Thumb", kind: "driver" },
      { id: "drv2", label: "TB6612 Index", kind: "driver" },
      { id: "drv3", label: "TB6612 Middle", kind: "driver" },
      { id: "drv4", label: "TB6612 Ring", kind: "driver" },
      { id: "drv5", label: "TB6612 Pinky", kind: "driver" },
      { id: "act1", label: "Actuator Thumb", kind: "actuator" },
      { id: "act2", label: "Actuator Index", kind: "actuator" },
      { id: "act3", label: "Actuator Middle", kind: "actuator" },
      { id: "act4", label: "Actuator Ring", kind: "actuator" },
      { id: "act5", label: "Actuator Pinky", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "bat", to: "tb", label: "12V in" },
      { from: "tb", to: "mcu", label: "5V out" },
      { from: "mcu", to: "drv1", label: "PWM + DIR" },
      { from: "mcu", to: "drv2", label: "PWM + DIR" },
      { from: "mcu", to: "drv3", label: "PWM + DIR" },
      { from: "mcu", to: "drv4", label: "PWM + DIR" },
      { from: "mcu", to: "drv5", label: "PWM + DIR" },
      { from: "drv1", to: "act1", label: "12V H-bridge" },
      { from: "drv2", to: "act2", label: "12V H-bridge" },
      { from: "drv3", to: "act3", label: "12V H-bridge" },
      { from: "drv4", to: "act4", label: "12V H-bridge" },
      { from: "drv5", to: "act5", label: "12V H-bridge" },
      { from: "emg1", to: "mcu", label: "Analog A0" },
      { from: "emg2", to: "mcu", label: "Analog A1" },
    ],
    wiring:
      "Teensy reads two EMG channels at 8 kHz each, envelopes them with a software low-pass filter, then drives five TB6612 motor controllers. One channel maps to flex (close), the other to extensor (open). The glove has no external wires — battery, buck converter, and all controllers bolt to the aluminum backplate.",
    mechSpecs: [
      { label: "Weight", value: "420 g (actuators + shell)" },
      { label: "Grip Force Gain", value: "30×" },
      { label: "Max Actuation Speed", value: "20 mm/s" },
      { label: "Run Time", value: "20 hours idle, 4 hours continuous" },
    ],
    mechSections: [
      {
        title: "Linkage",
        body: "Each actuator sits on the dorsal side of a finger and pulls a fishing line cable through the fingertip. A small return spring opens the finger when the actuator retracts. This keeps the glove slim — no gears in the joints.",
      },
      {
        title: "Fit",
        body: "The neoprene shell is heat-shrink wrapped to your hand after mounting all linkages. This is a custom-fit device — don't try to resell it after assembly.",
      },
    ],
    instructions: [
      "EMG calibration first: 10 seconds flex / 10 seconds relax, sample at 1 kHz.",
      "Install linkages and set max extension so the fingers stop 5 mm before hyperextending.",
      "Bench test each finger individually before wearing the full glove.",
    ],
    build: {
      tools: ["Soldering iron", "Allen wrench set", "Sewing needle", "Multimeter"],
      assumptions: [
        "12V wall charger available",
        "Willing to sacrifice a neoprene glove",
        "Steady nerves for cable routing",
      ],
      phases: [
        {
          title: "Backplate",
          steps: [
            {
              title: "Mount all 5 actuators on the aluminum plate",
              detail:
                "Each actuator sits in a laser-cut nest with a 10 mm hole for the cable. The plate must not flex under full grip force — 3 mm minimum thickness.",
              parts: ["Aluminum Backplate", "12 V Linear Actuator"],
            },
            {
              title: "Route TB6612 drivers flat",
              detail:
                "Solder all 5 drivers directly to the plate with short wires. Long wires between drivers pick up switching noise and cause glitches — keep them under 3 cm.",
              tools: ["Soldering iron"],
              parts: ["Pololu TB6612FNG"],
            },
          ],
        },
        {
          title: "Linkage",
          steps: [
            {
              title: "Thread cable through fingertips",
              detail:
                "Use 0.6 mm Dyneema fishing line — 15 kg breaking strength. Knot with bowline + 2 half-hitches. Leave 5 cm slack at rest so the glove feels natural.",
              parts: ["Mechanical Finger Linkage"],
            },
            {
              title: "Return springs",
              detail:
                "One 5 mm × 20 mm compression spring per finger, anchored to the ventral side of each PIP joint. Without them, the glove stays clenched after a strong grip.",
            },
          ],
        },
        {
          title: "Calibrate",
          steps: [
            {
              title: "EMG baseline and threshold",
              detail:
                "Record 30 seconds of relaxed EMG from both channels. Your threshold for triggering the actuators should be baseline + 2.5 standard deviations — this keeps false positives near zero.",
              parts: ["EMG Sensor Module"],
            },
            {
              title: "Force tuning per finger",
              detail:
                "Index finger has more independent control than pinky — give each finger its own EMG→PWM transfer function. You'll spend 2 hours tweaking this; that's normal.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #16 — Jacob's Ladder Plasma
     ============================================================ */
  {
    slug: "jacobs-ladder-plasma",
    title: "Jacob's Ladder Plasma Tube",
    author: "tesla_ghost",
    avatarColor: "#dc2626",
    cover: "/projects/jacobs-ladder.jpg",
    createdAt: "2026-09-14T13:30:00Z",
    tags: ["Robotics", "Wearable"],
    summary:
      "A 20 kV Jacob's Ladder that arcs between two converging copper rods, climbs, and then extinguishes. Pure high-voltage physics — no microcontrollers, just magnetics.",
    features: [
      "20 kV Tesla-style flyback transformer",
      "Rod spacing converging 5 → 25 mm",
      "Continuous arc climbing",
      "Manual tuning variac",
      "Safety interlock cabinet",
    ],
    stars: 11,
    parts: [
      { name: "20 kV Flyback Transformer", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 35.0 },
      { name: "IRFP460 Mosfet", category: "Electrical", subcategory: "Component", quantity: 2, unitCost: 2.5 },
      { name: "UC3842 Pulse-Width Controller", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 3.0 },
      { name: "60 mm Copper Rod Pair", category: "Mechanical", subcategory: "Electrode", quantity: 1, unitCost: 28.0 },
      { name: "10 kΩ Potentiometer", category: "Electrical", subcategory: "Component", quantity: 1, unitCost: 0.8 },
      { name: "12 V 3000 mAh Li-Po", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 12.0 },
      { name: "Acrylic Safety Cabinet", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 32.0 },
      { name: "HV Wire 25 kV", category: "Electrical", subcategory: "Connector", quantity: 1, unitCost: 4.0 },
    ],
    wiringNodes: [
      { id: "bat", label: "12V Li-Po", kind: "power" },
      { id: "pwm", label: "UC3842 PWM", kind: "module" },
      { id: "mf1", label: "IRFP460 Mosfet 1", kind: "driver" },
      { id: "mf2", label: "IRFP460 Mosfet 2", kind: "driver" },
      { id: "xfrm", label: "20kV Flyback", kind: "module" },
      { id: "rod1", label: "Copper Rod +", kind: "actuator" },
      { id: "rod2", label: "Copper Rod −", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "bat", to: "pwm", label: "12V" },
      { from: "pwm", to: "mf1", label: "Gate PWM" },
      { from: "pwm", to: "mf2", label: "Gate PWM" },
      { from: "bat", to: "mf1", label: "12V Drain" },
      { from: "mf1", to: "xfrm", label: "Primary tap 1" },
      { from: "mf2", to: "xfrm", label: "Primary tap 2" },
      { from: "xfrm", to: "rod1", label: "20kV HV+ wire" },
      { from: "xfrm", to: "rod2", label: "20kV HV− wire" },
    ],
    wiring:
      "UC3842 drives a half-bridge of two IRFP460s into the primary of the flyback transformer. The secondary produces ~20 kV AC which feeds the copper rods. A 10 kΩ pot on the PWM frequency sets the optimum arc-climb rate.",
    mechSpecs: [
      { label: "Rod Length", value: "300 mm" },
      { label: "Rod Gap", value: "5 mm (bottom) → 25 mm (top)" },
      { label: "Arc Speed", value: "~300 mm/s" },
      { label: "Power Draw", value: "2 A @ 12 V (peak)" },
    ],
    mechSections: [
      {
        title: "Rod Geometry",
        body: "Converging rods — narrow gap at the bottom makes it easy to strike an arc; wider gap at the top stretches it out until it extinguishes. Mount vertically, tilted 5° for aesthetics.",
      },
      {
        title: "Cabinet",
        body: "3 mm clear acrylic panels all around. HV wires must stay inside the cabinet — route them through grommets. Add a safety interlock that cuts power if any side panel opens.",
      },
    ],
    instructions: [
      "Build the flyback driver on perfboard — use heat sinks on both IRFP460s.",
      "Wire the rods last — double-check polarity before energizing.",
      "Do not touch the rods or HV wires when powered. This will kill you.",
    ],
    build: {
      tools: ["Soldering iron", "2 mm Allen", "Multimeter (high-voltage probe)"],
      assumptions: [
        "Adult supervision if under 18",
        "No children or pets in the room when operating",
        "Ventilation for ozone gas",
      ],
      phases: [
        {
          title: "Driver",
          steps: [
            {
              title: "UC3842 half-bridge",
              detail:
                "Frequency determines flyback output voltage — start at 200 kHz with the pot in the middle. Tune up for taller arcs, down for hotter arcs.",
              parts: ["UC3842", "IRFP460 Mosfet"],
            },
            {
              title: "Flyback phasing",
              detail:
                "If arcs don't strike, swap the primary leads — the magnetically-coupled secondary polarity might be flipped. Do this with power OFF.",
              parts: ["20 kV Flyback Transformer"],
            },
          ],
        },
        {
          title: "Arcs",
          steps: [
            {
              title: "Mount converging rods",
              detail:
                "5 mm gap at bottom to 25 mm at top, 300 mm tall. Grind the bottom tips to a point — sharp rods strike arcs more reliably than flat ends.",
              parts: ["60 mm Copper Rod Pair"],
            },
            {
              title: "Safety cabinet and interlock",
              detail:
                "Microswitch on each acrylic panel cuts the 12V rail when any open. Wire them in series so ONE switch failing open disables the system.",
              tools: ["2 mm Allen"],
              parts: ["Acrylic Safety Cabinet"],
            },
          ],
        },
        {
          title: "Tune",
          steps: [
            {
              title: "Optimal climb rate",
              detail:
                "Turn the frequency pot until arcs climb smoothly at ~300 mm/s and extinguish at the top without restarting mid-climb. This varies by rod geometry.",
            },
            {
              title: "Cooling and duty cycle",
              detail:
                "Run no more than 30 seconds continuously. Let the flyback transformer cool for 2 minutes between runs. The IRFP460s get hot enough to burn skin.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #17 — Portable Hydrogen Generator
     ============================================================ */
  {
    slug: "portable-hydrogen-generator",
    title: "Portable PEM Hydrogen Generator",
    author: "fuel_cell",
    avatarColor: "#0ea5e9",
    cover: "/projects/hydrogen-generator.jpg",
    createdAt: "2026-09-14T14:00:00Z",
    tags: ["Robotics", "Security"],
    summary:
      "A compact PEM electrolyzer that produces 200 mL/min of hydrogen from distilled water — lights a torch, inflates balloons, or feeds a small fuel cell.",
    features: [
      "1.5 W/cm² PEM cell stack",
      "200 mL/min H₂ production",
      "Automatic water refill pump",
      "O2 vented / H2 separated",
      "Safety pressure relief valve",
    ],
    stars: 9,
    parts: [
      { name: "6-cell PEM Electrolyzer Stack", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 89.0 },
      { name: "24 V 5 A PSU", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 35.0 },
      { name: "Arduino Uno", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 14.0 },
      { name: "Peristaltic Water Pump", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 12.0 },
      { name: "Solenoid Vent Valve", category: "Electrical", subcategory: "Actuator", quantity: 1, unitCost: 4.0 },
      { name: "Pressure Sensor 0–50 kPa", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 8.0 },
      { name: "600 mL Water Reservoir", category: "Mechanical", subcategory: "Fluidics", quantity: 1, unitCost: 6.0 },
      { name: "PTFE Tubing + Barbs", category: "Mechanical", subcategory: "Fluidics", quantity: 1, unitCost: 10.0 },
      { name: "Aluminum Heat Sink + Fan", category: "Mechanical", subcategory: "Thermal", quantity: 1, unitCost: 18.0 },
    ],
    wiringNodes: [
      { id: "psu", label: "24V 5A PSU", kind: "power" },
      { id: "uno", label: "Arduino Uno", kind: "mcu" },
      { id: "stack", label: "6-cell PEM Stack", kind: "module" },
      { id: "pump", label: "Peristaltic Pump", kind: "actuator" },
      { id: "vent", label: "Solenoid Vent", kind: "actuator" },
      { id: "pres", label: "Pressure Sensor", kind: "sensor" },
      { id: "fan", label: "Cooling Fan", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "psu", to: "stack", label: "24V DC main" },
      { from: "psu", to: "uno", label: "24V → 5V reg" },
      { from: "uno", to: "stack", label: "EN / PWM power limit" },
      { from: "uno", to: "pump", label: "GPIO (5V relay)" },
      { from: "uno", to: "vent", label: "GPIO ULN2003" },
      { from: "pres", to: "uno", label: "Analog A0" },
      { from: "uno", to: "fan", label: "GPIO 5V" },
    ],
    wiring:
      "24 V PSU feeds the PEM stack directly (a relay on the Arduino switches the positive lead). The Uno reads the pressure sensor analog-in and opens the vent solenoid if H₂ pressure exceeds 35 kPa. The peristaltic pump adds water when the reservoir level sensor triggers low.",
    mechSpecs: [
      { label: "H₂ Flow Rate", value: "200 mL/min @ 24V 4A" },
      { label: "O₂ Flow Rate", value: "100 mL/min" },
      { label: "Max Safe Pressure", value: "40 kPa (gauge)" },
      { label: "Power Efficiency", value: "60% (HHV)" },
    ],
    mechSections: [
      {
        title: "Stack Mounting",
        body: "The PEM stack gets warm (40–45 °C) — bolt it to a large aluminum heat sink with a 40 × 40 mm fan blowing across. This is not optional; exceeding 50 °C damages the membrane.",
      },
      {
        title: "Gas Separation",
        body: "Hydrogen outlet goes UP to a bubbler; oxygen outlet goes DOWN and vents to atmosphere. This keeps hydrogen from mixing with oxygen and deflagrating.",
      },
    ],
    instructions: [
      "Fill reservoir with distilled water only — tap water electrolyzes and clogs the membrane.",
      "Test pressure relief valve manually first by pumping air with a syringe.",
      "Ignite hydrogen only after the bubbler shows a steady stream for 10 seconds.",
    ],
    build: {
      tools: ["Soldering iron", "PTFE tape", "Allen wrench", "Safety goggles"],
      assumptions: [
        "Distilled water supply",
        "Well-ventilated area",
        "No open flames within 3 m during startup",
      ],
      phases: [
        {
          title: "Stack",
          steps: [
            {
              title: "Bolt stack to heat sink",
              detail:
                "8 M3 bolts with 2 Nm each — too loose and gas leaks; too tight and the membrane compresses unevenly. Use a torque screwdriver.",
              parts: ["6-cell PEM Electrolyzer Stack", "Aluminum Heat Sink + Fan"],
            },
            {
              title: "PTFE tubing and pressure test",
              detail:
                "Seal every barb with PTFE tape. Pressurize with air to 35 kPa, submerge in water, and look for bubbles before connecting power.",
              tools: ["PTFE tape"],
              parts: ["PTFE Tubing + Barbs"],
            },
          ],
        },
        {
          title: "Control",
          steps: [
            {
              title: "Pressure relief safety chain",
              detail:
                "Three layers of protection: pressure sensor → Arduino relay → vent solenoid. Additionally: a spring-loaded pressure relief valve on the bubbler that opens mechanically at 50 kPa.",
              parts: ["Pressure Sensor", "Solenoid Vent Valve"],
            },
            {
              title: "Water level auto-refill",
              detail:
                "Add a simple float switch in the reservoir. When it triggers low, the peristaltic pump runs for 5 seconds, then pauses for 2 minutes to let water settle.",
              parts: ["Peristaltic Water Pump"],
            },
          ],
        },
        {
          title: "Test",
          steps: [
            {
              title: "Flow rate measurement",
              detail:
                "Collect hydrogen in an inverted water-filled cylinder. Time how long it takes to fill 200 mL. Should take about 60 seconds at steady state.",
            },
            {
              title: "Ignition test",
              detail:
                "Light a candle at the bubbler outlet. The flame should be pale blue and quiet — a loud pop means you're burning a hydrogen-oxygen mixture and the gas separator is failing.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #18 — VR Haptic Tactile Vest
     ============================================================ */
  {
    slug: "haptic-tactile-vest",
    title: "VR Haptic Tactile Vest",
    author: "skin_deep",
    avatarColor: "#26a69a",
    cover: "/projects/haptic-tactile-vest.jpg",
    createdAt: "2026-09-14T15:00:00Z",
    tags: ["Wearable", "Robotics"],
    summary:
      "A 12-tactor haptic vest that maps VR game events to vibrations — impacts from behind hit the back, bullets from the left hit the left. USB-C powers it from the VR headset.",
    features: [
      "12 × ERM haptic tactors",
      "Quaternion rotation tracking",
      "PC USB-C data + power",
      "7-point impact zones",
      "OSC/UDP wireless bridge",
    ],
    stars: 14,
    parts: [
      { name: "ESP32-S3 DevKit", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 18.0 },
      { name: "DRV2605 Haptic Driver ×12", category: "Electrical", subcategory: "Driver", quantity: 12, unitCost: 1.8 },
      { name: "ERM Vibration Motor ×12", category: "Electrical", subcategory: "Actuator", quantity: 12, unitCost: 1.5 },
      { name: "MPU6050 IMU", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 4.5 },
      { name: "PC USB-C Female Socket", category: "Electrical", subcategory: "Connector", quantity: 1, unitCost: 1.5 },
      { name: "5V 3A Boost Module", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 5.0 },
      { name: "Neoprene Vest Shell", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 22.0 },
      { name: "3D-printed Tactor Housings ×12", category: "Mechanical", subcategory: "Mount", quantity: 12, unitCost: 1.0 },
    ],
    wiringNodes: [
      { id: "usb", label: "USB-C 5V (VR Headset)", kind: "power" },
      { id: "boost", label: "5V 3A Boost", kind: "power" },
      { id: "mcu", label: "ESP32-S3", kind: "mcu" },
      { id: "imu", label: "MPU6050", kind: "sensor" },
      { id: "drvX", label: "DRV2605 ×12 (I²C)", kind: "driver" },
      { id: "tactor", label: "ERM Motors ×12", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "usb", to: "boost", label: "5V in" },
      { from: "boost", to: "drvX", label: "5V 3A (motors)" },
      { from: "boost", to: "mcu", label: "5V" },
      { from: "mcu", to: "imu", label: "I²C" },
      { from: "mcu", to: "drvX", label: "I²C (multiplexed)" },
      { from: "drvX", to: "tactor", label: "H-bridge drive" },
    ],
    wiring:
      "ESP32-S3 acts as a USB HID to the PC, receives UDP OSC messages over Wi-Fi, or reads USB serial from the VR headset. It maps event positions to the nearest haptic zone and triggers 1–4 motors. A TCA9548A I²C mux addresses 12 DRV2605 drivers (each with its own hardcoded address).",
    mechSpecs: [
      { label: "Tactors", value: "12 ERM (6 back, 4 front, 2 shoulders)" },
      { label: "Impact Zones", value: "7 directional + chest + back" },
      { label: "Weight", value: "380 g" },
      { label: "Latency", value: "< 15 ms from event to vibration" },
    ],
    mechSections: [
      {
        title: "Zone Placement",
        body: "Back: 6 tactors arranged 3 × 2 across both scapulae and lumbar. Front: 4 around the sternum. Shoulders: 1 each at the clavicle. Never mount directly on the spine or major blood vessels.",
      },
      {
        title: "Coupling",
        body: "Each tactor sits in a 3D-printed PETG housing glued to the neoprene with contact cement — the housing transfers vibration through the fabric to the skin. Wires run through a cable channel along the inside shoulder seam.",
      },
    ],
    instructions: [
      "Flash ESP32-S3 with USB + Wi-Fi OSC listener firmware.",
      "Calibrate IMU on boot: hold still 5 seconds while gyro bias is estimated.",
      "Install PC-side VR game bridge (OVR Toolkit or OpenVR) to broadcast impact events over OSC.",
    ],
    build: {
      tools: ["Soldering iron", "3D printer", "Contact cement", "Sewing needle (for wire routing)"],
      assumptions: [
        "VR headset with USB-C data pass-through",
        "PC VR (Quest 3, PCVR, etc.)",
        "OpenVR/OpenXR compatible game",
      ],
      phases: [
        {
          title: "Drivers",
          steps: [
            {
              title: "I²C mux + 12 DRV2605s",
              detail:
                "Chain all 12 DRV2605s through a TCA9548A mux with a 1 kΩ pull-up on SDA/SCL. Write a test sketch that buzzes each motor sequentially — expect to hear/feel 12 distinct clicks.",
              tools: ["Soldering iron"],
              parts: ["DRV2605 Haptic Driver"],
            },
            {
              title: "5V 3A boost from USB-C",
              detail:
                "ERM motors draw up to 250 mA peak each — ×12 = 3A worst case. The VR headset USB-C can deliver at most 2A, so the boost module steps up efficiency is crucial.",
              parts: ["5V 3A Boost Module"],
            },
          ],
        },
        {
          title: "Mount",
          steps: [
            {
              title: "3D-print housings and glue to vest",
              detail:
                "20 × 20 × 12 mm PETG boxes with a 1 mm lip. Roughen the neoprene with sandpaper before applying contact cement — they'll shear off otherwise.",
              tools: ["3D printer", "Contact cement"],
              parts: ["Neoprene Vest Shell"],
            },
            {
              title: "Wire through shoulder seam",
              detail:
                "Thread 24 AWG stranded wire through a 5 mm plastic tube sewn inside the vest seam. Tape one end of the wire to the tactor with Kapton — it will chafe through bare wire within a month.",
            },
          ],
        },
        {
          title: "Integrate",
          steps: [
            {
              title: "OSC bridge from VR to vest",
              detail:
                "Use OVR Toolkit or OpenComposite to broadcast impact position and magnitude as OSC messages to UDP:11111. The ESP32-S3 parses /impact/xyz and /impact/magnitude.",
            },
            {
              title: "Latency test",
              detail:
                "Film a fast punch to the shoulder at 120 fps. The LED in the tactor housing should trigger within 2 frames of the punch visual — that's < 17 ms. If not, you're missing I²C bus cycles.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #19 — Underwater ROV
     ============================================================ */
  {
    slug: "underwater-rov",
    title: "Underwater Exploration ROV",
    author: "deep_sea",
    avatarColor: "#0891b2",
    cover: "/projects/underwater-rov.jpg",
    createdAt: "2026-09-14T16:00:00Z",
    tags: ["Robotics", "IoT"],
    summary:
      "A 6-thruster underwater ROV with live FPV, depth logging, and a gripper. Tethered to shore over a Cat6 cable — Wi-Fi doesn't work underwater.",
    features: [
      "6 brushless thrusters (4 vectored + 2 depth)",
      "1080p FPV camera + white LED",
      "Barometric + temperature sensors",
      "Simple 1-DOF gripper arm",
      "IP67 pressure enclosure",
    ],
    stars: 16,
    parts: [
      { name: "Raspberry Pi 4 (8GB)", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 55.0 },
      { name: "Arduino Nano (thruster PID)", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 10.0 },
      { name: "1080p FPV Camera + White LEDs", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 35.0 },
      { name: "BME280 Baro + Temp", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 3.9 },
      { name: "BLDC 2207 Thruster ×6", category: "Electrical", subcategory: "Actuator", quantity: 6, unitCost: 22.0 },
      { name: "20A ESC ×6", category: "Electrical", subcategory: "Driver", quantity: 6, unitCost: 18.0 },
      { name: "14.8V 10000 mAh Li-Po", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 65.0 },
      { name: "100 m Cat6 + Power Cable", category: "Electrical", subcategory: "Connector", quantity: 1, unitCost: 45.0 },
      { name: "Pressure Enclosure 100 m depth rated", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 95.0 },
      { name: "CNC-milled ABS Frame", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 60.0 },
    ],
    wiringNodes: [
      { id: "bat", label: "14.8V Li-Po", kind: "power" },
      { id: "nano", label: "Arduino Nano", kind: "mcu" },
      { id: "pi", label: "Raspberry Pi 4", kind: "mcu" },
      { id: "cam", label: "1080p FPV + LEDs", kind: "module" },
      { id: "bme", label: "BME280", kind: "sensor" },
      { id: "escX", label: "20A ES ×6", kind: "driver" },
      { id: "thr", label: "BLDC Thrusters ×6", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "bat", to: "escX", label: "14.8V power rails" },
      { from: "bat", to: "pi", label: "14.8V → 5V stepdown" },
      { from: "nano", to: "pi", label: "UART 115200" },
      { from: "pi", to: "cam", label: "USB + LED GPIO" },
      { from: "nano", to: "bme", label: "I²C" },
      { from: "nano", to: "escX", label: "PWM ×6 (thruster PID)" },
      { from: "escX", to: "thr", label: "3-phase per thruster" },
    ],
    wiring:
      "Nano runs the thruster PID control loop at 400 Hz (reading depth from BME280 and target angles from the Pi). Pi handles camera streaming, sensor logging, and the UDP tunnel to shore over Cat6. Power is 14.8 V directly from the battery to all ES cables.",
    mechSpecs: [
      { label: "Max Rated Depth", value: "100 m" },
      { label: "Thruster Config", value: "4 vector (2× fore/aft + 2× lateral) + 2 depth" },
      { label: "Top Speed", value: "0.8 m/s" },
      { label: "Run Time", value: "3 hours continuous" },
    ],
    mechSections: [
      {
        title: "Buoyancy",
        body: "The ROV needs to be slightly positively buoyant — add pool-noodle floats bolted to the frame until it hovers motionless with zero thruster input. Do this on the surface first before diving.",
      },
      {
        title: "Tether Management",
        body: "Tether runs up a buoy to shore — never tie it directly to the ROV frame, tie it to the top of the pressure enclosure with a weak link that fails before the cable yanks the ROV off the bottom.",
      },
    ],
    instructions: [
      "Water test in a pool first. Do not skip to open water.",
      "PID tune depth hold before any horizontal movement — use 0.5 m/s² climb rate max.",
      "Keep the tether slack during descent — a taut tether catches on reefs.",
    ],
    build: {
      tools: ["M3 Allen set", "Silicone grease", "Pressure washer (cleaning)", "Laptop with Cat6 port"],
      assumptions: [
        "14.8V Li-Po charger",
        "Pool or controlled water for initial testing",
        "Nerve of steel (first dive is always nerve-wracking)",
      ],
      phases: [
        {
          title: "Frame",
          steps: [
            {
              title: "CNC ABS frame assembly",
              detail:
                "M4 bolts through all corners. Use nylon insert lock nuts — vibration from thrusters will walk bare nuts within an hour.",
              tools: ["M3 Allen set"],
              parts: ["CNC-milled ABS Frame"],
            },
            {
              title: "Buoyancy tuning with pool noodles",
              detail:
                "Start with 200 g of positive buoyancy. Trim down 50 g at a time until the ROV hovers neutrally at 1 m depth with all thrusters off.",
            },
          ],
        },
        {
          title: "Pressure",
          steps: [
            {
              title: "O-ring and silicone seal prep",
              detail:
                "Wipe O-rings with isopropanol before installing. A single speck of sand will cause a flood at 20 m depth — this is where the project lives or dies.",
              tools: ["Silicone grease"],
              parts: ["Pressure Enclosure"],
            },
            {
              title: "Dry chamber vacuum test",
              detail:
                "Evacuate the enclosure to −50 kPa with a syringe pump. If you can hold it for 5 minutes with no leak bubble, it's good. If not, find the leak and fix it before diving.",
            },
          ],
        },
        {
          title: "Dive",
          steps: [
            {
              title: "Pool test — depth hold only",
              detail:
                "Disconnect horizontal thrusters. Set a depth target of 1 m. Watch the PID compensate for pool currents. If it overshoots more than ±3 cm, tune Kd up.",
            },
            {
              title: "Open water — slow descent",
              detail:
                "Drop at 0.3 m/s with the tether paying out slack. The shore operator monitors depth, video, and battery voltage. Abort if battery drops below 3.65 V per cell.",
            },
          ],
        },
      ],
    },
  },

  /* ============================================================
     #20 — Magic Mirror AI
     ============================================================ */
  {
    slug: "magic-mirror-ai",
    title: "Magic Mirror AI Dashboard",
    author: "reflection_ai",
    avatarColor: "#6366f1",
    cover: "/projects/magic-mirror-ai.jpg",
    createdAt: "2026-09-14T17:00:00Z",
    tags: ["IoT", "Wearable"],
    summary:
      "A two-way mirror with a hidden Raspberry Pi display and USB camera. When you approach it shows weather, news, calendar — and secretly runs face recognition to personalize.",
    features: [
      "Two-way mirror glass",
      "Raspberry Pi 5 + 10\" IPS",
      "Face recognition attendance",
      "PIR proximity wake-up",
      "Weather + calendar + news feed",
    ],
    stars: 19,
    parts: [
      { name: "Raspberry Pi 5 (4GB)", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 45.0 },
      { name: "10\" IPS HDMI 1280×800", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 65.0 },
      { name: "Logitech C270 USB Camera", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 18.0 },
      { name: "HC-SR501 PIR Motion", category: "Electrical", subcategory: "Sensor", quantity: 1, unitCost: 2.2 },
      { name: "5V 3A USB-C PSU", category: "Electrical", subcategory: "Power", quantity: 1, unitCost: 8.0 },
      { name: "Two-way Mirror Glass 12×18\"", category: "Mechanical", subcategory: "Enclosure", quantity: 1, unitCost: 32.0 },
      { name: "Wood Frame + Back Panel", category: "Mechanical", subcategory: "Structural", quantity: 1, unitCost: 28.0 },
      { name: "LED Strip Ambient Backlight", category: "Electrical", subcategory: "Module", quantity: 1, unitCost: 10.0 },
    ],
    wiringNodes: [
      { id: "psu", label: "5V 3A USB-C", kind: "power" },
      { id: "pi", label: "Raspberry Pi 5", kind: "mcu" },
      { id: "disp", label: "10\" IPS HDMI", kind: "module" },
      { id: "cam", label: "C270 Camera", kind: "module" },
      { id: "pir", label: "HC-SR501", kind: "sensor" },
      { id: "led", label: "Ambient Strip", kind: "actuator" },
    ],
    wiringEdges: [
      { from: "psu", to: "pi", label: "USB-C PD" },
      { from: "pi", to: "disp", label: "HDMI + backlight GPIO" },
      { from: "pi", to: "cam", label: "USB 2.0" },
      { from: "pir", to: "pi", label: "GPIO wake-up" },
      { from: "pi", to: "led", label: "PWM dim" },
    ],
    wiring:
      "Pi boots headless with MagicMirror². PIR triggers GPIO interrupt to wake the display from blank. The camera runs face_recognition (Python) every 5 seconds at 160×120 for identity matches. If you're in the known face database, it shows your calendar, weather for your location, and your news filter.",
    mechSpecs: [
      { label: "Mirror Size", value: "12\" × 18\" (305 × 457 mm)" },
      { label: "Viewing Angle", value: "≤ 30° from normal", },
      { label: "Wake-up Latency", value: "< 2 s from PIR trigger" },
      { label: "Face Recognition FPS", value: "~2 Hz (160×120)" },
    ],
    mechSections: [
      {
        title: "Frame",
        body: "Wood frame holds the two-way mirror glass with 1 mm felt pads to prevent chipping. The display sits 5 mm behind the glass — too far back and text blurs, too close and the backlight shows through.",
      },
      {
        title: "Ambient Light",
        body: "LED strip around the inside of the frame, pointing away from the mirror. This creates soft glow without washing out the display text. Color changes to match the weather (blue = rain, yellow = sunny).",
      },
    ],
    instructions: [
      "Flash Pi OS Lite + X11 server, install MagicMirror², configure your API keys (OpenWeatherMap, Google Calendar, NewsAPI).",
      "Crop and normalize 10–20 reference photos of your face — face recognition accuracy depends heavily on this.",
      "Tape the camera to the glass from the inside with double-sided foam — it sits dead-center just like a 'smart' mirror.",
    ],
    build: {
      tools: ["Double-sided foam tape", "Phillips #1", "Wood glue", "Caulk gun"],
      assumptions: [
        "120 V wall outlet nearby",
        "Wi-Fi connection",
        "API keys for weather/calendar/news (free tiers)",
      ],
      phases: [
        {
          title: "Frame",
          steps: [
            {
              title: "Build wood frame and caulk mirror",
              detail:
                "Seal the two-way mirror into the frame with silicone caulk. Let cure 24 h. Don't skip this — a drop of water running down the inside ruins the display.",
              tools: ["Caulk gun"],
              parts: ["Two-way Mirror Glass", "Wood Frame + Back Panel"],
            },
            {
              title: "Mount display 5 mm behind mirror",
              detail:
                "Use 3D-printed shims or double-sided foam of exactly 5 mm thickness. Test text visibility from your normal mirror-viewing height before gluing anything.",
              parts: ["10\" IPS HDMI 1280×800"],
            },
          ],
        },
        {
          title: "Camera",
          steps: [
            {
              title: "PIR wake-up and blanking",
              detail:
                "Pi stays awake but blanks the HDMI output. On PIR trigger, it wakes the HDMI and starts face recognition. This drops idle power draw to 2 W from 10 W.",
              parts: ["HC-SR501 PIR Motion"],
            },
            {
              title: "Face recognition calibration",
              detail:
                "Take 15 face photos of yourself under different lighting. Run face_recognition_knn.py and confirm 98%+ accuracy before trusting it. Add other household members if desired.",
              parts: ["Logitech C270 USB Camera"],
            },
          ],
        },
        {
          title: "Dashboard",
          steps: [
            {
              title: "MagicMirror² module config",
              detail:
                "Weather module on the left (48-hour forecast), calendar in the middle-right (next 3 events), news ticker at the bottom (10 headlines). Keep font size ≥ 24 px — two-way mirrors wash out fine print.",
            },
            {
              title: "Family profiles",
              detail:
                "Each recognized face gets its own API key + feed preference. Mom sees school pickup calendar, Dad sees golf course tee-times, you see GitHub PR statuses.",
            },
          ],
        },
      ],
    },
  },
]
