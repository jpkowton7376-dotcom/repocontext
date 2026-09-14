export type PartCategory = "Electrical" | "Mechanical"

export interface Part {
  name: string
  category: PartCategory
  subcategory: string
  quantity: number
  unitCost: number
}

export type NodeKind = "mcu" | "sensor" | "actuator" | "power" | "module"

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
  mech: string
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
]
