"use client"

import type {
  HardwareProject,
  Part,
  WiringNode,
  WiringEdge,
  MechSpec,
  MechSection,
  BuildPhase,
  BuildStep,
  NodeKind,
} from "./forge-data"

/**
 * Forge AI generator — deterministic, client-safe blueprint engine.
 *
 * Turns a free-text product brief into a fully structured HardwareProject
 * (BOM, wiring graph, mechanical package, phased build instructions).
 * No network or API key required; the structure mirrors what an LLM would
 * be asked to emit as JSON, so it can be replaced by a model call later.
 */

export interface ChatStage {
  key: string
  label: string
  detail: string
}

export interface GenerateResult {
  project: HardwareProject
  stages: ChatStage[]
}

/* ------------------------------- keyword utils ----------------------------- */

export type ArchetypeId =
  | "drone"
  | "rover"
  | "plant"
  | "weather"
  | "door"
  | "arm"
  | "wearable"
  | "generic"

interface ArchetypeDef {
  id: ArchetypeId
  cover: string
  title: string
  tags: string[]
  features: string[]
  keywords: string[]
  parts: Part[]
  nodes: WiringNode[]
  edges: WiringEdge[]
  wiringNotes: string
  mechText: string
  specs: MechSpec[]
  sections: MechSection[]
  assumptions: string[]
  phases: BuildPhase[]
}

/* --------------------------------- addons --------------------------------- */

interface Addon {
  id: string
  keywords: string[]
  titleLabel: string
  /** Archetypes whose base design already covers this function. */
  skipFor?: ArchetypeId[]
  part: Part
  node: WiringNode
  /** true: addon→controller (sensors/modules), false: controller→addon. */
  incoming?: boolean
  /** Power-source addons feed a charger/power node instead of the MCU. */
  powerFeed?: boolean
  edgeLabel: string
  step: BuildStep
}

const AVATAR_COLORS = ["#2563eb", "#16a34a", "#ea580c", "#dc2626", "#7c3aed", "#0891b2"]

const COMMON_TOOLS = [
  "Phillips #1 screwdriver",
  "Wire strippers",
  "Temperature-controlled soldering iron",
  "Digital multimeter",
  "Flush cutters",
]

const MCU_IDS = ["mcu", "fc"]
const POWER_CHAIN_IDS = ["chg", "cap", "bec", "drv", "buck"]

const P = (
  name: string,
  category: Part["category"],
  subcategory: string,
  quantity: number,
  unitCost: number,
): Part => ({ name, category, subcategory, quantity, unitCost })

/* ----------------------------- archetype library --------------------------- */

const ARCHETYPES: Record<Exclude<ArchetypeId, "generic">, ArchetypeDef> = {
  drone: {
    id: "drone",
    cover: "/projects/drone-controller.jpg",
    title: "Autonomous Quadcopter",
    tags: ["Robotics", "IoT"],
    features: ["GPS waypoint navigation", "Stabilized flight controller", "Live telemetry link", "Failsafe return-to-home"],
    keywords: ["drone", "quadcopter", "copter", "uav", "quad", "multirotor", "flying"],
    parts: [
      P("STM32F4 Flight Controller (F405)", "Electrical", "MCU", 1, 24.5),
      P("4-in-1 Brushless ESC 45A", "Electrical", "Power", 1, 32.0),
      P("2207 Brushless Motors 2400KV", "Electrical", "Actuator", 4, 11.9),
      P("5-inch Tri-blade Propellers (CW/CCW)", "Mechanical", "Propulsion", 4, 1.4),
      P("4S 1500mAh LiPo Battery", "Electrical", "Power", 1, 21.8),
      P("2.4GHz ELRS Receiver", "Electrical", "Wireless", 1, 13.5),
      P("5V 3A BEC Regulator", "Electrical", "Power", 1, 4.2),
      P("3K Carbon Fiber 5\" Frame Kit", "Mechanical", "Frame", 1, 18.6),
      P("Silicone vibration damper set", "Mechanical", "Fasteners", 1, 3.5),
    ],
    nodes: [
      { id: "lipo", label: "4S LiPo 1500mAh", kind: "power" },
      { id: "bec", label: "5V BEC", kind: "power" },
      { id: "fc", label: "F405 Flight Ctrl", kind: "mcu" },
      { id: "esc", label: "4-in-1 ESC 45A", kind: "module" },
      { id: "rx", label: "ELRS Receiver", kind: "module" },
      { id: "m1", label: "Motor M1 (FR)", kind: "actuator" },
      { id: "m2", label: "Motor M2 (FL)", kind: "actuator" },
      { id: "m3", label: "Motor M3 (RR)", kind: "actuator" },
      { id: "m4", label: "Motor M4 (RL)", kind: "actuator" },
    ],
    edges: [
      { from: "lipo", to: "bec", label: "16V/GND" },
      { from: "lipo", to: "esc", label: "6S PWR" },
      { from: "bec", to: "fc", label: "5V/GND" },
      { from: "rx", to: "fc", label: "CRSF TX" },
      { from: "fc", to: "esc", label: "DSHOT600" },
      { from: "esc", to: "m1", label: "3-PH" },
      { from: "esc", to: "m2", label: "3-PH" },
      { from: "esc", to: "m3", label: "3-PH" },
      { from: "esc", to: "m4", label: "3-PH" },
    ],
    wiringNotes:
      "Power the 4-in-1 ESC directly from the LiPo balance/XT60 pigtail. The BEC taps the battery to supply a clean 5V rail for the flight controller and receiver; never power the FC servo rail from the ESC BEC simultaneously. Route the ELFS receiver antenna toward the rear, away from the VTX and ESC phase wires. Solder motor wires in the documented M1–M4 rotation order and verify spin direction with props removed.",
    mechText:
      "The 3K carbon frame splits into bottom plate, arms and top plate. Soft-mount the FC on silicone grommets and the camera on a damping wedge. Balance the battery so the center of mass sits on the FC geometric center within ±2 mm.",
    specs: [
      { label: "Wheelbase", value: "220 mm" },
      { label: "All-up weight", value: "≈ 690 g" },
      { label: "Frame material", value: "3K carbon fiber 3 mm arms" },
      { label: "Power", value: "4S 14.8V LiPo" },
      { label: "Flight time", value: "4–6 min aggressive" },
      { label: "Ingress", value: "None — dry conditions" },
    ],
    sections: [
      { title: "Frame stack", body: "30.5×30.5 mm FC mounting with M3 standoffs, 20 mm stack height. ESC sits on the bottom plate; FC above it with a 5 mm anti-vibration gap." },
      { title: "Center of gravity", body: "Slide the LiPo fore/aft in its strap until the quad balances level at the FC center. An off-center CG costs 8–12% flight time and causes yaw drift." },
    ],
    assumptions: [
      "You already own an ELRS-compatible transmitter",
      "Betaflight or EmuFlight configurator is installed",
      "Props remain removed during all bench tests",
    ],
    phases: [
      {
        title: "Solder power stack",
        steps: [
          { title: "Tin the ESC battery pads and solder the XT60 pigtail with strain relief", detail: "Pre-tin both pads, heat the pad while feeding solder, then flow the 16 AWG wire in one motion. Inspect under magnification for cold joints before the first power-up.", tools: ["Soldering iron", "Flush cutters"], parts: ["4-in-1 Brushless ESC 45A"] },
          { title: "Mount the BEC and wire the 5V rail to the flight controller", tools: ["Phillips #1 screwdriver"], parts: ["5V 3A BEC Regulator"] },
          { title: "Soft-mount the FC and connect the ELRS receiver", detail: "Use four silicone grommets so the board floats. Bind the receiver before closing the stack.", parts: ["2.4GHz ELRS Receiver"] },
        ],
      },
      {
        title: "Install drivetrain",
        steps: [
          { title: "Bolt the four motors and solder the 3-phase wires to the ESC in M1–M4 order", tools: ["Phillips #1 screwdriver"], parts: ["2207 Brushless Motors 2400KV"] },
          { title: "Verify motor rotation in BLHeliSuite (props off) and swap any reversed wires", detail: "Spin each motor at 5% throttle; M1/M3 spin CCW and M2/M4 clockwise when viewed from above." },
          { title: "Strap the battery and check center of gravity", parts: ["4S 1500mAh LiPo Battery"] },
        ],
      },
      {
        title: "Flash, calibrate & fly",
        steps: [
          { title: "Flash Betaflight and calibrate accelerometer level", tools: ["Digital multimeter"] },
          { title: "Configure DSHOT600, arming switch and failsafe RTH" },
          { title: "Bench-test arming, then perform a low hover and tune PIDs" },
        ],
      },
    ],
  },

  rover: {
    id: "rover",
    cover: "/projects/robotic-arm.jpg",
    title: "Autonomous Navigation Rover",
    tags: ["Robotics", "IoT"],
    features: ["Obstacle avoidance", "Line-following mode", "Differential drive", "Tele-op over Wi-Fi"],
    keywords: ["rover", "robot car", "car", "line follower", "line-following", "sumo", "obstacle", "buggy", "tank", "balancing", "self-balancing"],
    parts: [
      P("ESP32 Dev Board", "Electrical", "MCU", 1, 7.5),
      P("L298N Dual H-Bridge Driver", "Electrical", "Actuator", 1, 4.8),
      P("TT Geared DC Motors 200RPM", "Electrical", "Actuator", 2, 2.6),
      P("HC-SR04 Ultrasonic Sensor", "Electrical", "Sensor", 1, 2.1),
      P("TCRT5000 Line Sensor Pair", "Electrical", "Sensor", 2, 1.3),
      P("18650 Battery Holder + 2 cells", "Electrical", "Power", 1, 6.9),
      P("Acrylic 2WD Chassis Kit", "Mechanical", "Frame", 1, 9.4),
      P("Encoder Wheels + Tracks", "Mechanical", "Propulsion", 2, 1.8),
    ],
    nodes: [
      { id: "bat", label: "2× 18650 7.4V", kind: "power" },
      { id: "mcu", label: "ESP32 Dev Board", kind: "mcu" },
      { id: "drv", label: "L298N Driver", kind: "module" },
      { id: "us", label: "HC-SR04 Front", kind: "sensor" },
      { id: "ir1", label: "Line Sensor L", kind: "sensor" },
      { id: "ir2", label: "Line Sensor R", kind: "sensor" },
      { id: "ml", label: "Left Motor", kind: "actuator" },
      { id: "mr", label: "Right Motor", kind: "actuator" },
    ],
    edges: [
      { from: "bat", to: "drv", label: "7.4V/GND" },
      { from: "drv", to: "mcu", label: "5V/GND" },
      { from: "us", to: "mcu", label: "TRIG/ECHO" },
      { from: "ir1", to: "mcu", label: "GPIO34" },
      { from: "ir2", to: "mcu", label: "GPIO35" },
      { from: "mcu", to: "drv", label: "IN1-4 PWM" },
      { from: "drv", to: "ml", label: "MOT A" },
      { from: "drv", to: "mr", label: "MOT B" },
    ],
    wiringNotes:
      "Motors draw from the 18650 pack through the L298N 12V input; the onboard 5V regulator feeds the ESP32 and sensors. Keep logic ground common with power ground. Ultrasonic echo is a 5V pulse — add a 1k/2k divider before the ESP32 pin. Mount the line sensors 8–10 mm above the floor for a clean digital threshold.",
    mechText:
      "Two-deck acrylic chassis: motors clip into the lower deck brackets; electronics deck sits 25 mm above with M3 standoffs. Weight distribution should favor the drive axle for traction.",
    specs: [
      { label: "Drive", value: "Differential 2WD, 200 RPM" },
      { label: "Top speed", value: "≈ 0.9 m/s" },
      { label: "Chassis", value: "2-layer laser-cut acrylic" },
      { label: "Weight", value: "≈ 420 g" },
      { label: "Runtime", value: "≈ 90 min per charge" },
      { label: "Clearance", value: "18 mm" },
    ],
    sections: [
      { title: "Sensor placement", body: "Center the ultrasonic module on the front crossbar at 35 mm height. The two line sensors straddle the line center at 14 mm spacing, angled 2° inward." },
      { title: "Cable management", body: "Route motor wires twisted away from the ultrasonic echo wire. Secure every loom to the deck with zip ties — rotating loops snag wheels." },
    ],
    assumptions: [
      "Arduino IDE with ESP32 board package is installed",
      "The test surface has a matte black line on white ground",
      "L298N ENA/ENB jumpers are removed for PWM speed control",
    ],
    phases: [
      {
        title: "Assemble chassis",
        steps: [
          { title: "Clip both geared motors into the lower deck and seat the wheels", tools: ["Phillips #1 screwdriver"], parts: ["TT Geared DC Motors 200RPM"] },
          { title: "Stack the electronics deck on M3 standoffs", parts: ["Acrylic 2WD Chassis Kit"] },
        ],
      },
      {
        title: "Wire electronics",
        steps: [
          { title: "Mount the L298N and connect motors plus the battery pack", parts: ["L298N Dual H-Bridge Driver", "18650 Battery Holder + 2 cells"] },
          { title: "Bolt the ultrasonic and line sensors to the front crossbar", detail: "Add the 1k/2k echo divider, then check the trigger/echo loop in the serial monitor.", parts: ["HC-SR04 Ultrasonic Sensor", "TCRT5000 Line Sensor Pair"] },
          { title: "Run IN1–IN4 plus 5V/GND to the ESP32", parts: ["ESP32 Dev Board"] },
        ],
      },
      {
        title: "Tune behavior",
        steps: [
          { title: "Flash the avoidance firmware and tune the stop distance" },
          { title: "Calibrate line thresholds on the real track" },
          { title: "Run a 10-minute endurance lap and recheck motor temperature" },
        ],
      },
    ],
  },

  plant: {
    id: "plant",
    cover: "/projects/plant-monitor.jpg",
    title: "Indoor Plant Care Node",
    tags: ["IoT"],
    features: ["Capacitive soil sensing", "Auto irrigation pump", "Battery powered with deep sleep", "Dashboard alerts over Wi-Fi"],
    keywords: ["plant", "soil", "moisture", "garden", "irrigation", "water", "greenhouse", "hydroponic", "farming"],
    parts: [
      P("ESP32-S3 Dev Board", "Electrical", "MCU", 1, 8.9),
      P("Capacitive Soil Moisture Probe", "Electrical", "Sensor", 1, 3.4),
      P("BME280 Temp/Humidity Module", "Electrical", "Sensor", 1, 3.9),
      P("5V Submersible Mini Pump", "Electrical", "Actuator", 1, 4.6),
      P("Single-channel Relay Module", "Electrical", "Actuator", 1, 1.7),
      P("18650 Li-Ion Cell + Holder", "Electrical", "Power", 1, 5.2),
      P("TP4056 USB-C Charge Board", "Electrical", "Power", 1, 1.3),
      P("PETG Weatherproof Enclosure", "Mechanical", "Enclosure", 1, 2.4),
      P("Stainless Probe Tube", "Mechanical", "Enclosure", 1, 0.9),
    ],
    nodes: [
      { id: "cell", label: "18650 Cell", kind: "power" },
      { id: "chg", label: "TP4056 Charge", kind: "power" },
      { id: "mcu", label: "ESP32-S3", kind: "mcu" },
      { id: "soil", label: "Soil Probe", kind: "sensor" },
      { id: "bme", label: "BME280", kind: "sensor" },
      { id: "relay", label: "Pump Relay", kind: "module" },
      { id: "pump", label: "Water Pump", kind: "actuator" },
    ],
    edges: [
      { from: "cell", to: "chg", label: "B+/B-" },
      { from: "chg", to: "mcu", label: "3.7V/GND" },
      { from: "soil", to: "mcu", label: "ADC GPIO4" },
      { from: "bme", to: "mcu", label: "I2C 0x76" },
      { from: "mcu", to: "relay", label: "GPIO26" },
      { from: "relay", to: "pump", label: "5V SW" },
    ],
    wiringNotes:
      "The capacitive probe runs from a switched GPIO 3V3 rail to prevent electrolysis during sleep. BME280 shares the I2C bus at 0x76. The relay switches the pump's positive rail; the pump draws from the cell through the TP4056 OUT pads. Seal every gland with silicone — condensation kills exposed ADC pads.",
    mechText:
      "Two-shell PETG enclosure mounts above the planter rim. The probe exits through a bottom cable gland inside a stainless tube that ends 60 mm below the soil line. The 6 mm silicone pump hose clips to the shell and reaches the reservoir.",
    specs: [
      { label: "Dimensions", value: "92 × 48 × 32 mm" },
      { label: "Weight", value: "118 g incl. cell" },
      { label: "Materials", value: "PETG shell, 304 stainless tube" },
      { label: "Power", value: "1× 18650, USB-C charge" },
      { label: "Sleep current", value: "≈ 18 µA" },
      { label: "Ingress", value: "IP54 (shell)" },
    ],
    sections: [
      { title: "Probe geometry", body: "Angle the tube 12° from vertical so the sensing face contacts undisturbed soil. Avoid the root crown by at least 40 mm — dense roots skew readings high." },
      { title: "Reservoir", body: "Use any opaque 1–2 L bottle with a vented cap; algae in clear tubing will starve the pump within weeks. Keep the static head under 80 cm." },
    ],
    assumptions: [
      "The planter sits within Wi-Fi range every 30 minutes",
      "Potting soil is used (not pure clay or hydroponic media)",
      "The pump is primed before the first auto-water cycle",
    ],
    phases: [
      {
        title: "Prepare & flash",
        steps: [
          { title: "Print the enclosure shells and press the threaded inserts in", tools: ["Phillips #1 screwdriver"], parts: ["PETG Weatherproof Enclosure"] },
          { title: "Flash firmware and calibrate dry/wet ADC values in air and a glass of water", parts: ["ESP32-S3 Dev Board", "Capacitive Soil Moisture Probe"] },
        ],
      },
      {
        title: "Wire the node",
        steps: [
          { title: "Solder the TP4056, holder and fly leads to the ESP32-S3", parts: ["TP4056 USB-C Charge Board", "18650 Li-Ion Cell + Holder"] },
          { title: "Connect the probe and BME280 on the switched power and I2C rails", parts: ["BME280 Temp/Humidity Module"] },
          { title: "Wire relay to the pump positive rail and bench-test a 3-second pulse", parts: ["Single-channel Relay Module", "5V Submersible Mini Pump"] },
        ],
      },
      {
        title: "Deploy",
        steps: [
          { title: "Seat the stainless probe tube 60 mm into the soil", parts: ["Stainless Probe Tube"] },
          { title: "Prime the pump and route the hose to the reservoir" },
          { title: "Seal the glands, set the moisture threshold and enable deep sleep" },
        ],
      },
    ],
  },

  weather: {
    id: "weather",
    cover: "/projects/weather-station.jpg",
    title: "Solar Weather Station",
    tags: ["IoT"],
    features: ["Anemometer + rain gauge", "Solar powered, zero maintenance", "LoRa long-range uplink", "Radiation-shielded temperature"],
    keywords: ["weather", "temperature", "humidity", "rain", "wind", "anemometer", "air quality", "climate", "forecast", "environmental"],
    parts: [
      P("ESP32 LoRa 433MHz Board", "Electrical", "MCU", 1, 12.4),
      P("BME280 Temp/Humidity/Pressure", "Electrical", "Sensor", 1, 3.9),
      P("VEML6075 UV Index Sensor", "Electrical", "Sensor", 1, 5.2),
      P("Hall-effect Anemometer Head", "Electrical", "Sensor", 1, 8.6),
      P("Tipping Bucket Rain Gauge", "Electrical", "Sensor", 1, 11.3),
      P("6V 2W Solar Panel", "Electrical", "Power", 1, 9.8),
      P("TP4056 + 18650 Cell", "Electrical", "Power", 1, 5.9),
      P("Stevenson Radiation Shield", "Mechanical", "Enclosure", 1, 6.5),
      P("Galvanized Mast Bracket", "Mechanical", "Frame", 1, 4.1),
    ],
    nodes: [
      { id: "sol", label: "6V Solar Panel", kind: "power" },
      { id: "chg", label: "TP4056+Cell", kind: "power" },
      { id: "mcu", label: "ESP32 LoRa", kind: "mcu" },
      { id: "bme", label: "BME280", kind: "sensor" },
      { id: "uv", label: "VEML6075 UV", kind: "sensor" },
      { id: "wind", label: "Anemometer", kind: "sensor" },
      { id: "rain", label: "Rain Gauge", kind: "sensor" },
    ],
    edges: [
      { from: "sol", to: "chg", label: "6V/GND" },
      { from: "chg", to: "mcu", label: "3.7V/GND" },
      { from: "bme", to: "mcu", label: "I2C 0x76" },
      { from: "uv", to: "mcu", label: "I2C 0x10" },
      { from: "wind", to: "mcu", label: "PULSE 27" },
      { from: "rain", to: "mcu", label: "PULSE 14" },
    ],
    wiringNotes:
      "Both I2C sensors share the bus — confirm addresses 0x76 and 0x10 before mounting. Wind and rain use reed/hall contact closures; wire them to interrupt-capable pins with the internal pull-up enabled. The solar panel feeds the TP4056 IN; the 18650 OUT pads power the ESP32 through its 3.3V LDO. Keep the antenna vertical and 200 mm clear of the metal mast.",
    mechText:
      "Mount the mast bracket on a pole 1.5–2 m above roof level. The BME280 lives inside the louvered radiation shield; anemometer goes on the top crossarm, rain gauge on a side arm at least one mast-diameter away from pole shadow.",
    specs: [
      { label: "Mast height", value: "1.5–2 m AGL" },
      { label: "Node weight", value: "340 g head" },
      { label: "Power", value: "2 W solar + 18650" },
      { label: "Uplink", value: "LoRa 433 MHz, 2 km LOS" },
      { label: "Sample cadence", value: "5 min" },
      { label: "Operating range", value: "-20 to 60 °C" },
    ],
    sections: [
      { title: "Siting rules", body: "Keep the rain gauge level (±1°) and the anemometer unobstructed for 10 m in all directions. Chimneys and AC exhausts invalidate temperature readings within 3 m." },
      { title: "Solar orientation", body: "Face the panel true south (northern hemisphere) at latitude tilt; even partial self-shading from the mast halves winter harvest." },
    ],
    assumptions: [
      "A LoRa gateway is reachable within line of sight",
      "The mast can be guyed or wall-bracketed safely",
      "Rain gauge resolution (0.279 mm/tip) matches your dashboard units",
    ],
    phases: [
      {
        title: "Bench integration",
        steps: [
          { title: "Wire the solar charge rail and verify float voltage at 4.2V", tools: ["Digital multimeter"], parts: ["6V 2W Solar Panel", "TP4056 + 18650 Cell"] },
          { title: "Validate both I2C addresses and pulse counters in the serial monitor", parts: ["BME280 Temp/Humidity/Pressure", "VEML6075 UV Index Sensor"] },
        ],
      },
      {
        title: "Mount outdoors",
        steps: [
          { title: "Bracket the mast and level the tipping-bucket gauge with a bubble level", parts: ["Galvanized Mast Bracket", "Tipping Bucket Rain Gauge"] },
          { title: "Install the anemometer on the top crossarm with the cup hub horizontal", parts: ["Hall-effect Anemometer Head"] },
          { title: "Seat the BME280 in the radiation shield and seal all glands", parts: ["Stevenson Radiation Shield"] },
        ],
      },
      {
        title: "Commission",
        steps: [
          { title: "Pair the node to the LoRa gateway and confirm uplink RSSI" },
          { title: "Cross-check temperature against a reference thermometer" },
          { title: "Pour 10 mm of water slowly through the gauge to verify tip count" },
        ],
      },
    ],
  },

  door: {
    id: "door",
    cover: "/projects/door-lock.jpg",
    title: "Smart Access Controller",
    tags: ["Security", "IoT"],
    features: ["RFID + PIN entry", "Audit log", "Remote unlock over Wi-Fi", "Fail-secure electronic strike"],
    keywords: ["door", "lock", "rfid", "access", "keypad", "nfc", "entry", "gate", "intercom"],
    parts: [
      P("ESP32 Dev Board", "Electrical", "MCU", 1, 7.5),
      P("MFRC522 RFID Reader 13.56MHz", "Electrical", "Sensor", 1, 3.2),
      P("4x4 Matrix Keypad", "Electrical", "Sensor", 1, 2.4),
      P("12V Fail-secure Electric Strike", "Electrical", "Actuator", 1, 14.6),
      P("IRLZ44N MOSFET Module", "Electrical", "Actuator", 1, 1.6),
      P("Active Buzzer 5V", "Electrical", "Actuator", 1, 0.8),
      P("12V 2A Power Supply", "Electrical", "Power", 1, 8.2),
      P("MP1584 Buck 5V Converter", "Electrical", "Power", 1, 1.9),
      P("Flush-mount ABS Box", "Mechanical", "Enclosure", 1, 3.4),
    ],
    nodes: [
      { id: "psu", label: "12V 2A PSU", kind: "power" },
      { id: "buck", label: "5V Buck", kind: "power" },
      { id: "mcu", label: "ESP32", kind: "mcu" },
      { id: "rfid", label: "MFRC522", kind: "sensor" },
      { id: "key", label: "4×4 Keypad", kind: "sensor" },
      { id: "fet", label: "MOSFET Switch", kind: "module" },
      { id: "strike", label: "Door Strike", kind: "actuator" },
      { id: "buzz", label: "Buzzer", kind: "actuator" },
    ],
    edges: [
      { from: "psu", to: "buck", label: "12V/GND" },
      { from: "buck", to: "mcu", label: "5V/GND" },
      { from: "rfid", to: "mcu", label: "SPI/IRQ" },
      { from: "key", to: "mcu", label: "GPIO 4x8" },
      { from: "mcu", to: "fet", label: "GPIO25" },
      { from: "fet", to: "strike", label: "12V SW" },
      { from: "mcu", to: "buzz", label: "GPIO27" },
    ],
    wiringNotes:
      "The 12V rail switches the fail-secure strike through the MOSFET with a flyback diode across the strike terminals. The MFRC522 runs on the 3.3V rail — never 5V, the reader will die. Keep the keypad matrix wires under 50 cm and enable input debounce in firmware. Enroll tag UIDs in the whitelist before mounting the box.",
    mechText:
      "The reader coil sits behind a non-metal front panel (metal detunes the antenna). Mortise the strike into the jamb per its paper template; the gap between latch and strike lip must be 3–4 mm.",
    specs: [
      { label: "Enclosure", value: "118 × 78 × 38 mm ABS" },
      { label: "Strike", value: "12V DC, fail-secure" },
      { label: "Unlock pulse", value: "3 s default" },
      { label: "RFID", value: "13.56 MHz MIFARE" },
      { label: "Power", value: "12V 2A wall adapter" },
      { label: "Audit buffer", value: "Last 200 events" },
    ],
    sections: [
      { title: "Jamb preparation", body: "Chisel the strike mortise 2 mm deeper than the plate so the door latches without rubbing. Use the strike's own cut-out as the template, not a hand measurement." },
      { title: "Fail-secure behavior", body: "Power loss locks the door by design. Keep a mechanical override keyed cylinder or an emergency break-glass release on the protected side per local fire code." },
    ],
    assumptions: [
      "The door is inward-opening wood or composite",
      "You can route a 12V cable to the jamb",
      "A physical key override remains available",
    ],
    phases: [
      {
        title: "Prepare",
        steps: [
          { title: "Mortise the jamb and fit the electric strike plate", tools: ["Phillips #1 screwdriver"], parts: ["12V Fail-secure Electric Strike"] },
          { title: "Enroll RFID card UIDs and flash the whitelist firmware", parts: ["MFRC522 RFID Reader 13.56MHz"] },
        ],
      },
      {
        title: "Wire",
        steps: [
          { title: "Connect the 12V supply, buck converter and 5V rail", parts: ["12V 2A Power Supply", "MP1584 Buck 5V Converter"] },
          { title: "Wire the MOSFET, flyback diode and strike", detail: "Double-check diode polarity before the first pulse; a reversed diode shorts the 12V rail.", parts: ["IRLZ44N MOSFET Module"] },
          { title: "Connect the SPI reader, keypad matrix and buzzer", parts: ["4x4 Matrix Keypad", "Active Buzzer 5V"] },
        ],
      },
      {
        title: "Install & test",
        steps: [
          { title: "Mount the flush box with the reader coil 5 mm behind the panel", parts: ["Flush-mount ABS Box"] },
          { title: "Test card, PIN and remote unlock, then a denied-tag beep sequence" },
          { title: "Pull the 12V plug and confirm fail-secure lockout" },
        ],
      },
    ],
  },

  arm: {
    id: "arm",
    cover: "/projects/robotic-arm.jpg",
    title: "6-Axis Desktop Robot Arm",
    tags: ["Robotics"],
    features: ["Inverse kinematics control", "USB gamepad tele-op", "Servo position presets", "Suction gripper option"],
    keywords: ["arm", "robotic arm", "manipulator", "gripper", "pick and place", "servo arm"],
    parts: [
      P("ESP32 Dev Board", "Electrical", "MCU", 1, 7.5),
      P("PCA9685 16-ch PWM Driver", "Electrical", "MCU", 1, 6.8),
      P("MG996R Metal-gear Servos", "Electrical", "Actuator", 4, 5.9),
      P("SG90 Micro Servos", "Electrical", "Actuator", 2, 2.3),
      P("6V 10A Switching PSU", "Electrical", "Power", 1, 12.5),
      P("4700 µF Capacitor + Fuse", "Electrical", "Power", 1, 2.8),
      P("Laser-cut Acrylic Arm Kit", "Mechanical", "Frame", 1, 18.9),
      P("M3 Hardware & Bearing Set", "Mechanical", "Fasteners", 1, 4.6),
    ],
    nodes: [
      { id: "psu", label: "6V 10A PSU", kind: "power" },
      { id: "cap", label: "Cap/Fuse Rail", kind: "power" },
      { id: "mcu", label: "ESP32", kind: "mcu" },
      { id: "pwm", label: "PCA9685 Driver", kind: "module" },
      { id: "base", label: "Base Servo", kind: "actuator" },
      { id: "shoulder", label: "Shoulder Servo", kind: "actuator" },
      { id: "elbow", label: "Elbow Servo", kind: "actuator" },
      { id: "grip", label: "Gripper Servo", kind: "actuator" },
    ],
    edges: [
      { from: "psu", to: "cap", label: "6V/GND" },
      { from: "cap", to: "pwm", label: "6V/GND" },
      { from: "mcu", to: "pwm", label: "I2C 0x40" },
      { from: "pwm", to: "base", label: "PWM 0" },
      { from: "pwm", to: "shoulder", label: "PWM 1" },
      { from: "pwm", to: "elbow", label: "PWM 2" },
      { from: "pwm", to: "grip", label: "PWM 5" },
    ],
    wiringNotes:
      "Servos take power straight from the fused 6V rail through the bulk capacitor — never from the ESP32 5V pin, brownout is guaranteed under load. ESP32 and driver share I2C at 0x40 with common ground. Twist the four MG996R power leads into a loom and keep signal wires separate. Center every servo at 1500 µs before bolting the horns.",
    mechText:
      "Acrylic plates stack on M3 standoffs; the two MG996R lift joints need metal servo horns, plastic ones strip instantly. The base bearing must be seated flush so rotation has zero tilt.",
    specs: [
      { label: "Reach", value: "320 mm" },
      { label: "Payload", value: "≈ 350 g" },
      { label: "Joint repeatability", value: "±1.2°" },
      { label: "Power", value: "6V 10A external" },
      { label: "Weight", value: "≈ 1.1 kg" },
      { label: "Control", value: "Wi-Fi + gamepad" },
    ],
    sections: [
      { title: "Load path", body: "Shoulder and elbow servos carry the most torque; bolt them to the 4 mm acrylic plates, never the 2 mm linkages. Counterweight the elbow if the arm chatters holding horizontal pose." },
      { title: "Cable routing", body: "Route wrist servo wires inside the upper-arm channel with 20 mm of service loop — taut wires bind the elbow and burn out micro servos." },
    ],
    assumptions: [
      "A 6V supply capable of 10A transient current is used",
      "The arm is bolted down before powering on",
      "Servos are mechanically centered before horns attach",
    ],
    phases: [
      {
        title: "Build the structure",
        steps: [
          { title: "Assemble the acrylic base tower and seat the slew bearing", tools: ["Phillips #1 screwdriver"], parts: ["Laser-cut Acrylic Arm Kit", "M3 Hardware & Bearing Set"] },
          { title: "Mount the four MG996R joints with metal horns", parts: ["MG996R Metal-gear Servos"] },
        ],
      },
      {
        title: "Wire the servo bus",
        steps: [
          { title: "Build the fused 6V rail and solder the bulk capacitor with correct polarity", detail: "Connect the capacitor only after confirming polarity; a reversed 4700 µF cap vents violently.", tools: ["Soldering iron", "Digital multimeter"], parts: ["6V 10A Switching PSU", "4700 µF Capacitor + Fuse"] },
          { title: "Wire all six servos to the PCA9685 and the shared I2C bus", parts: ["PCA9685 16-ch PWM Driver", "SG90 Micro Servos"] },
        ],
      },
      {
        title: "Center and calibrate",
        steps: [
          { title: "Command 1500 µs on every channel and bolt the horns square" },
          { title: "Flash IK firmware and set joint soft limits" },
          { title: "Run the pick-and-place demo at half speed, then full speed" },
        ],
      },
    ],
  },

  wearable: {
    id: "wearable",
    cover: "/projects/heart-badge.jpg",
    title: "Wearable Health Band",
    tags: ["Wearable", "IoT"],
    features: ["Optical heart-rate sensing", "Step counting", "BLE phone link", "Haptic reminders"],
    keywords: ["heart", "pulse", "spo2", "wearable", "fitness", "band", "watch", "bracelet", "health", "vitals"],
    parts: [
      P("ESP32-C3 SuperMini", "Electrical", "MCU", 1, 5.4),
      P("MAX30102 Pulse Oximeter", "Electrical", "Sensor", 1, 4.8),
      P("LSM6DS3 IMU", "Electrical", "Sensor", 1, 3.6),
      P("0.96\" SSD1306 OLED", "Electrical", "Display", 1, 4.2),
      P("1027 Coin Vibration Motor", "Electrical", "Actuator", 1, 1.4),
      P("TP4056 + 300 mAh LiPo", "Electrical", "Power", 1, 5.6),
      P("TPU Wristband Shell", "Mechanical", "Enclosure", 1, 2.2),
    ],
    nodes: [
      { id: "bat", label: "300 mAh LiPo", kind: "power" },
      { id: "chg", label: "TP4056", kind: "power" },
      { id: "mcu", label: "ESP32-C3", kind: "mcu" },
      { id: "hr", label: "MAX30102", kind: "sensor" },
      { id: "imu", label: "LSM6DS3", kind: "sensor" },
      { id: "oled", label: "OLED 0.96\"", kind: "module" },
      { id: "vibe", label: "Coin Motor", kind: "actuator" },
    ],
    edges: [
      { from: "bat", to: "chg", label: "B+/B-" },
      { from: "chg", to: "mcu", label: "3.7V/GND" },
      { from: "hr", to: "mcu", label: "I2C 0x57" },
      { from: "imu", to: "mcu", label: "I2C 0x6A" },
      { from: "oled", to: "mcu", label: "I2C 0x3C" },
      { from: "mcu", to: "vibe", label: "GPIO5 PWM" },
    ],
    wiringNotes:
      "All three peripherals share one 400 kHz I2C bus — addresses 0x57, 0x6A, 0x3C must all resolve before assembly. Drive the coin motor from a MOSFET or transistor, never directly from a GPIO. The MAX30102 optical window needs skin contact with <1 mm gap; ambient light destroys PPG signal.",
    mechText:
      "Flexible TPU shell wraps the wrist; the optical sensor window is a 0.8 mm clear resin pour flush with the skin-side surface. The LiPo sits in a recessed pocket away from the wrist bone.",
    specs: [
      { label: "Case", value: "46 × 22 × 12 mm TPU" },
      { label: "Weight", value: "24 g incl. strap" },
      { label: "Battery", value: "300 mAh LiPo" },
      { label: "Battery life", value: "≈ 36 h typical" },
      { label: "Link", value: "Bluetooth Low Energy 5.0" },
      { label: "Sensors", value: "PPG + 6-axis IMU" },
    ],
    sections: [
      { title: "Optical window", body: "Pour the clear resin in two layers with degassing between them; bubbles scatter the LED and wreck HR readings. Wet-sand flush with 1200 grit." },
      { title: "Strap ergonomics", body: "The band must press the window at ≈ 3 N of force — tight enough for signal, loose enough to leave no skin mark after an hour." },
    ],
    assumptions: [
      "The companion phone supports BLE on Android 10+ / iOS 13+",
      "Heart-rate values are for fitness, not medical use",
      "TPU is printed on a flexible-capable printer",
    ],
    phases: [
      {
        title: "Fabricate",
        steps: [
          { title: "Print the TPU shell and pour the clear optical window", parts: ["TPU Wristband Shell"] },
          { title: "Flash firmware and confirm all three I2C addresses", parts: ["ESP32-C3 SuperMini"] },
        ],
      },
      {
        title: "Assemble",
        steps: [
          { title: "Solder the charge board, battery fly leads and motor transistor", tools: ["Soldering iron"], parts: ["TP4056 + 300 mAh LiPo", "1027 Coin Vibration Motor"] },
          { title: "Stack MAX30102, IMU and OLED on the shared I2C bus", parts: ["MAX30102 Pulse Oximeter", "LSM6DS3 IMU", "0.96\" SSD1306 OLED"] },
          { title: "Pot the sensor window edge and fold the harness into the shell" },
        ],
      },
      {
        title: "Calibrate & wear",
        steps: [
          { title: "Baseline resting heart rate against a 60-second manual count" },
          { title: "Tune step-detection threshold from a 100-step walk" },
          { title: "Pair with the phone app and enable idle reminders" },
        ],
      },
    ],
  },
}

/* ------------------------------- generic node ------------------------------ */

const GENERIC_PARTS: Part[] = [
  P("ESP32 Dev Board", "Electrical", "MCU", 1, 7.5),
  P("BME280 Temp/Humidity Module", "Electrical", "Sensor", 1, 3.9),
  P("0.96\" I2C OLED Display", "Electrical", "Display", 1, 4.5),
  P("Active Buzzer 5V", "Electrical", "Actuator", 1, 0.8),
  P("TP4056 + 18650 Cell", "Electrical", "Power", 1, 5.9),
  P("Ventilated ABS Project Box", "Mechanical", "Enclosure", 1, 2.6),
]

function buildGeneric(prompt: string): ArchetypeDef {
  return {
    id: "generic",
    cover: "/projects/weather-station.jpg",
    title: titleFromPrompt(prompt) || "Connected Sensor Node",
    tags: ["IoT"],
    features: ["Wi-Fi telemetry", "Local OLED readout", "Battery with USB-C charging", "Threshold buzzer alerts"],
    keywords: [],
    parts: GENERIC_PARTS,
    nodes: [
      { id: "cell", label: "18650 Cell", kind: "power" },
      { id: "chg", label: "TP4056 Charge", kind: "power" },
      { id: "mcu", label: "ESP32", kind: "mcu" },
      { id: "bme", label: "BME280", kind: "sensor" },
      { id: "oled", label: "OLED 0.96\"", kind: "module" },
      { id: "buzz", label: "Buzzer", kind: "actuator" },
    ],
    edges: [
      { from: "cell", to: "chg", label: "B+/B-" },
      { from: "chg", to: "mcu", label: "3.7V/GND" },
      { from: "bme", to: "mcu", label: "I2C 0x76" },
      { from: "oled", to: "mcu", label: "I2C 0x3C" },
      { from: "mcu", to: "buzz", label: "GPIO27" },
    ],
    wiringNotes:
      "BME280 and OLED share the I2C bus at 0x76 and 0x3C. The buzzer switches through the ESP32 GPIO with a 100 Ω series resistor. Power comes from the TP4056 OUT pads; charge over USB-C with the cell installed. Keep the sensor outside the sealed box so air can reach it.",
    mechText:
      "Mount the board on M2 standoffs inside the ABS box. Cut a 26 × 14 mm display window and add vent slots facing away from direct spray.",
    specs: [
      { label: "Enclosure", value: "100 × 60 × 25 mm ABS" },
      { label: "Power", value: "18650 + TP4056 USB-C" },
      { label: "Display", value: "128 × 64 OLED" },
      { label: "Link", value: "2.4 GHz Wi-Fi" },
    ],
    sections: [
      { title: "Mounting", body: "Keep the BME280 away from the regulator and charging IC — self-heating biases temperature high by 2–4 °C inside sealed boxes." },
    ],
    assumptions: ["Wi-Fi is available at the install location", "The enclosure stays indoors or under cover"],
    phases: [
      {
        title: "Prepare",
        steps: [
          { title: "Flash firmware and verify both I2C devices on the bus", parts: ["ESP32 Dev Board", "BME280 Temp/Humidity Module"] },
          { title: "Cut the display window and mount standoffs in the box", parts: ["Ventilated ABS Project Box"] },
        ],
      },
      {
        title: "Assemble",
        steps: [
          { title: "Solder the charge board and 18650 holder", tools: ["Soldering iron"], parts: ["TP4056 + 18650 Cell"] },
          { title: "Connect OLED and buzzer, then seat the board on standoffs", parts: ["0.96\" I2C OLED Display", "Active Buzzer 5V"] },
        ],
      },
      {
        title: "Deploy",
        steps: [
          { title: "Set Wi-Fi credentials and the alert threshold" },
          { title: "Run for 24 h and confirm readings plus battery curve" },
        ],
      },
    ],
  }
}

/* --------------------------------- addons --------------------------------- */

const ADDONS: Addon[] = [
  {
    id: "gps",
    keywords: ["gps", "location", "waypoint", "geofence", "gnss"],
    titleLabel: "GPS Module",
    part: P("NEO-6M GPS Module + Antenna", "Electrical", "Wireless", 1, 8.4),
    node: { id: "gps", label: "NEO-6M GPS", kind: "sensor" },
    incoming: true,
    edgeLabel: "UART RX/TX",
    step: { title: "Mount the GPS antenna sky-facing and validate a 3D fix", parts: ["NEO-6M GPS Module + Antenna"] },
  },
  {
    id: "camera",
    keywords: ["camera", "fpv", "vision", "photo", "video", "stream"],
    titleLabel: "Camera",
    part: P("OV2640 2MP Camera Module", "Electrical", "Sensor", 1, 6.7),
    node: { id: "cam", label: "OV2640 Camera", kind: "sensor" },
    incoming: true,
    edgeLabel: "DCMI 8BIT",
    step: { title: "Connect the camera ribbon with contacts inward and test a still capture", parts: ["OV2640 2MP Camera Module"] },
  },
  {
    id: "ultrasonic",
    keywords: ["ultrasonic", "lidar", "tof", "distance", "obstacle", "avoid"],
    titleLabel: "Distance Sensor",
    skipFor: ["rover"],
    part: P("VL53L0X Laser ToF Sensor", "Electrical", "Sensor", 1, 4.4),
    node: { id: "tof", label: "VL53L0X ToF", kind: "sensor" },
    incoming: true,
    edgeLabel: "I2C 0x29",
    step: { title: "Fit the ToF sensor on the forward face and calibrate max range", parts: ["VL53L0X Laser ToF Sensor"] },
  },
  {
    id: "ble",
    keywords: ["bluetooth", "ble", "phone", "app"],
    titleLabel: "Bluetooth LE",
    skipFor: ["wearable"],
    part: P("HC-08 BLE Module", "Electrical", "Wireless", 1, 4.9),
    node: { id: "ble", label: "HC-08 BLE", kind: "module" },
    incoming: true,
    edgeLabel: "UART2",
    step: { title: "Pair the BLE module and verify the phone serial link", parts: ["HC-08 BLE Module"] },
  },
  {
    id: "lora",
    keywords: ["lora", "long range", "long-range", "remote", "gateway"],
    titleLabel: "LoRa Radio",
    skipFor: ["weather"],
    part: P("SX1278 LoRa 433MHz Module", "Electrical", "Wireless", 1, 6.2),
    node: { id: "lora", label: "SX1278 LoRa", kind: "module" },
    incoming: true,
    edgeLabel: "SPI/IRQ",
    step: { title: "Attach the LoRa antenna and confirm gateway RSSI", parts: ["SX1278 LoRa 433MHz Module"] },
  },
  {
    id: "solar",
    keywords: ["solar", "sun", "off-grid", "off grid", "renewable"],
    titleLabel: "Solar Panel",
    skipFor: ["weather"],
    part: P("6V 2W Solar Panel", "Electrical", "Power", 1, 9.8),
    node: { id: "solar", label: "6V Solar Panel", kind: "power" },
    powerFeed: true,
    edgeLabel: "6V/GND",
    step: { title: "Face the solar panel skyward and verify charge current", parts: ["6V 2W Solar Panel"] },
  },
  {
    id: "oled",
    keywords: ["display", "screen", "oled", "monitor", "readout"],
    titleLabel: "OLED Display",
    skipFor: ["wearable"],
    part: P("0.96\" SSD1306 OLED", "Electrical", "Display", 1, 4.5),
    node: { id: "oledx", label: "SSD1306 OLED", kind: "module" },
    incoming: true,
    edgeLabel: "I2C 0x3C",
    step: { title: "Mount the OLED and render the first telemetry screen", parts: ["0.96\" SSD1306 OLED"] },
  },
  {
    id: "buzzer",
    keywords: ["alarm", "buzzer", "beep", "alert", "siren"],
    titleLabel: "Buzzer",
    skipFor: ["door", "generic"],
    part: P("Active Buzzer 5V", "Electrical", "Actuator", 1, 0.8),
    node: { id: "buz", label: "Buzzer", kind: "actuator" },
    edgeLabel: "GPIO27",
    step: { title: "Wire the buzzer with a 100 Ω resistor and test the alert pattern", parts: ["Active Buzzer 5V"] },
  },
  {
    id: "led",
    keywords: ["led", "neopixel", "ws2812", "light", "rgb", "indicator"],
    titleLabel: "LED Indicator",
    part: P("WS2812B RGB Ring (12 LED)", "Electrical", "Actuator", 1, 2.9),
    node: { id: "led", label: "WS2812 Ring", kind: "actuator" },
    edgeLabel: "GPIO33 DIN",
    step: { title: "Connect the RGB ring and run a color-cycle self-test", parts: ["WS2812B RGB Ring (12 LED)"] },
  },
  {
    id: "servo",
    keywords: ["servo", "pan", "tilt", "gripper"],
    titleLabel: "Servo",
    skipFor: ["arm"],
    part: P("SG90 Micro Servo", "Electrical", "Actuator", 1, 2.3),
    node: { id: "sv", label: "SG90 Servo", kind: "actuator" },
    edgeLabel: "PWM GPIO13",
    step: { title: "Center the servo at 1500 µs before attaching the horn", parts: ["SG90 Micro Servo"] },
  },
  {
    id: "relay",
    keywords: ["relay", "switch", "pump", "valve", "mains", "plug"],
    titleLabel: "Relay Switch",
    skipFor: ["plant", "door"],
    part: P("Single-channel Relay Module", "Electrical", "Actuator", 1, 1.7),
    node: { id: "rel", label: "Relay Module", kind: "module" },
    edgeLabel: "GPIO26",
    step: { title: "Wire the relay control side and bench-test a 3-second pulse", parts: ["Single-channel Relay Module"] },
  },
  {
    id: "imu",
    keywords: ["imu", "accelerometer", "gyroscope", "motion", "tilt", "orientation"],
    titleLabel: "IMU",
    skipFor: ["wearable", "drone"],
    part: P("MPU6050 6-axis IMU", "Electrical", "Sensor", 1, 2.8),
    node: { id: "imux", label: "MPU6050 IMU", kind: "sensor" },
    incoming: true,
    edgeLabel: "I2C 0x68",
    step: { title: "Mount the IMU on the motion axis and calibrate the gyro offsets", parts: ["MPU6050 6-axis IMU"] },
  },
]

/* --------------------------------- helpers -------------------------------- */

function detectArchetype(prompt: string): ArchetypeId {
  const q = prompt.toLowerCase()
  const has = (kw: string) =>
    kw.includes(" ")
      ? q.includes(kw)
      : new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(q)
  let best: ArchetypeId = "generic"
  let bestScore = 0
  for (const def of Object.values(ARCHETYPES)) {
    const score = def.keywords.reduce((s, kw) => (has(kw) ? s + (kw.includes(" ") || kw.includes("-") ? 2 : 1) : s), 0)
    if (score > bestScore) {
      bestScore = score
      best = def.id
    }
  }
  return best
}

function detectAddons(prompt: string, archId: ArchetypeId, baseNodeIds: Set<string>): Addon[] {
  const q = prompt.toLowerCase()
  const has = (kw: string) =>
    kw.includes(" ")
      ? q.includes(kw) // multi-word phrases: substring match is intentional
      : new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(q)
  const picked: Addon[] = []
  for (const a of ADDONS) {
    if (a.skipFor?.includes(archId)) continue
    if (!a.keywords.some((k) => has(k))) continue
    if (baseNodeIds.has(a.node.id)) continue
    picked.push(a)
  }
  return picked.slice(0, 4)
}

/** Resolve a live endpoint node id for an addon edge, tolerating per-design id differences. */
function resolveEdge(addon: Addon, nodeIds: Set<string>): WiringEdge {
  const target = (candidates: string[]) => candidates.find((id) => nodeIds.has(id)) ?? "mcu"

  if (addon.powerFeed) {
    const rail = target(POWER_CHAIN_IDS)
    return { from: addon.node.id, to: rail, label: addon.edgeLabel }
  }
  const mcu = target(MCU_IDS)
  return addon.incoming
    ? { from: addon.node.id, to: mcu, label: addon.edgeLabel }
    : { from: mcu, to: addon.node.id, label: addon.edgeLabel }
}

function titleFromPrompt(prompt: string): string {
  const cleaned = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\b(please|design|make|build|create|want|need|a|an|the|with|and|for|that|using|use|me|to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!cleaned) return ""
  const words = cleaned.split(" ").slice(0, 5)
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

function sumParts(parts: Part[]): { count: number; cost: number } {
  return {
    count: parts.reduce((s, p) => s + p.quantity, 0),
    cost: parts.reduce((s, p) => s + p.quantity * p.unitCost, 0),
  }
}

/* -------------------------------- generate -------------------------------- */

export function generateBlueprint(promptRaw: string): GenerateResult {
  const prompt = promptRaw.trim()
  const archId = detectArchetype(prompt)
  const base: ArchetypeDef = archId === "generic" ? buildGeneric(prompt) : ARCHETYPES[archId]

  // Deep clone mutable pieces so repeat generations never alias.
  const parts: Part[] = base.parts.map((p) => ({ ...p }))
  const nodes: WiringNode[] = base.nodes.map((n) => ({ ...n }))
  const edges: WiringEdge[] = base.edges.map((e) => ({ ...e }))
  const phases: BuildPhase[] = base.phases.map((ph) => ({
    title: ph.title,
    steps: ph.steps.map((s) => ({ ...s, tools: s.tools ? [...s.tools] : undefined, parts: s.parts ? [...s.parts] : undefined })),
  }))

  const baseNodeIds = new Set(nodes.map((n) => n.id))
  const addons = detectAddons(prompt, archId, baseNodeIds)

  for (const addon of addons) {
    parts.push({ ...addon.part })
    nodes.push({ ...addon.node })
    const liveIds = new Set(nodes.map((n) => n.id))
    edges.push(resolveEdge(addon, liveIds))
    // Insert the addon integration step into the wiring/assembly phase.
    const targetPhase = phases.find((ph) => /wire|electronics|assemble/i.test(ph.title)) ?? phases[1] ?? phases[0]
    targetPhase.steps.push({ ...addon.step })
  }

  const { count, cost } = sumParts(parts)
  const stepCount = phases.reduce((s, ph) => s + ph.steps.length, 0)

  // Title: named archetypes keep their product name; free-form generic briefs
  // reuse the user's own words. Addons are listed as an edition suffix.
  const promptTitle = titleFromPrompt(prompt)
  const suffix = addons.length ? ` · ${addons.map((a) => a.titleLabel).join(" + ")}` : ""
  const title =
    archId === "generic" && promptTitle
      ? `${promptTitle}${suffix}`
      : `${base.title}${suffix}`

  const slugBase = slugify(archId === "generic" && promptTitle ? promptTitle : base.title) || "project"
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`

  const addonNames = addons.map((a) => a.part.name)
  const summaryBits = addons.length ? ` Upgraded with ${addonNames.join(", ")}.` : ""
  const summary = `${base.features.join(". ")} — packaged into one ${count}-part build.${summaryBits}`

  const features = [...base.features]
  addons.forEach((a) => features.push(`${a.titleLabel} upgrade`))

  const flatInstructions: string[] = []
  phases.forEach((ph) => ph.steps.forEach((s) => flatInstructions.push(s.title)))

  const project: HardwareProject = {
    slug,
    title,
    author: "you",
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    cover: base.cover,
    createdAt: new Date().toISOString(),
    tags: Array.from(new Set(base.tags)),
    summary,
    features,
    parts,
    wiring: base.wiringNotes,
    wiringNodes: nodes,
    wiringEdges: edges,
    mech: base.mechText,
    mechSpecs: base.specs,
    mechSections: base.sections,
    instructions: flatInstructions,
    build: {
      tools: COMMON_TOOLS,
      assumptions: base.assumptions,
      phases,
    },
    stars: 0,
  }

  const stages: ChatStage[] = [
    {
      key: "brief",
      label: "Understanding the brief",
      detail:
        archId === "generic"
          ? `Interpreting this as a connected embedded device${addons.length ? ` with ${addons.map((a) => a.titleLabel.toLowerCase()).join(", ")}` : ""}.`
          : `This matches the ${base.title.toLowerCase()} archetype${addons.length ? `, extended with ${addons.map((a) => a.titleLabel.toLowerCase()).join(", ")}` : ""}.`,
    },
    {
      key: "parts",
      label: "Selecting components",
      detail: `${count} parts across electrical and mechanical BOM, estimated cost $${cost.toFixed(2)}.`,
    },
    {
      key: "wiring",
      label: "Designing the wiring",
      detail: `${nodes.length} nodes on ${new Set(edges.map((e) => e.label.split(" ")[0])).size} bus/power domains with ${edges.length} documented connections.`,
    },
    {
      key: "mech",
      label: "Defining the mechanical package",
      detail: `${base.specs.length} mechanical specs and ${base.sections.length} packaging notes generated.`,
    },
    {
      key: "build",
      label: "Writing build instructions",
      detail: `${stepCount} steps across ${phases.length} phases, each with tools and required parts.`,
    },
  ]

  return { project, stages }
}

export function countBlueprint(p: HardwareProject) {
  return sumParts(p.parts)
}

export type { NodeKind }
