# Bill of Materials – SmartMed Guardian (AI-based Smart Nursing System)

> Organized by subsystem. Quantities shown are typical for a single complete unit.

## Sensor Unit

| Component | Notes | Qty |
|---|---:|---:|
| ESP32-S3-WROOM-1-N16R8 | MCU + Wi-Fi (sensor unit) | 1 |
| MAX30102 | SpO₂ / HR sensor module | 1 |
| AD8232 | ECG front-end | 1 |
| MPX5050DP | Blood pressure sensor (differential) | 1 |
| DS18B20 | Body temperature sensor | 1 |
| BME280 | Ambient temp / humidity / pressure | 1 |
| MPU6050 | Accelerometer + Gyro (respiration/motion) | 1 |
| Glucose sensor interface | Analog front-end / connector | 1 |
| SSD1306 0.96" OLED | Local status display | 1 |
| Tactile buttons | UI control (3 pcs) | 3 |
| RGB / status LEDs | Visual indicators | 2–4 |
| Capacitors & Resistors | Decoupling and pull-ups | various |
| TVS SMAJ15A | Transient suppression | 1 |

## Control Unit (Medication Delivery)

| Component | Notes | Qty |
|---|---:|---:|
| ESP32-S3-WROOM-1-N16R8 | MCU + Wi-Fi (control unit) | 1 |
| Peristaltic Pump 12V | Precision pump (per channel) | 5 |
| IRFZ44N or suitable MOSFET | Pump driver (or equivalent logic-level MOSFET) | 5 |
| PC817 | Optocoupler (isolation) | 5 |
| ACS712 | Current sensing (per pump) | 5 |
| YF-S201 | Flow sensor (verification) | 2 |
| Float level sensor | Reservoir level detection | 2 |
| LM2596S / power regulator | 12V → 5V / 3.3V supply | 1–2 |
| Heatsink for MOSFETs | Thermal management | as required |
| Shunt resistor 0.01Ω 5W | Current measurement (if used) | 1–5 |
| LM393 / LM358 | Comparators / op-amps for analog front-ends | 2–3 |
| Optoisolated relays / safety relays | For high-power switching (optional) | as required |

## Common / Mechanical / Power

| Component | Notes | Qty |
|---|---:|---:|
| DC Power Jack 2.1 mm | 12V input | 1 |
| Battery backup (Li-ion or SLA) | For critical operation | 1 |
| TP4056 (if LiPo used) | Charging module | 1 |
| Terminal blocks (2-pin / 3-pin) | Connections | multiple |
| PCB (custom) | Assembled board(s) | 1 set |
| Enclosure / mounting | Medical-grade case recommended | 1 |
| Standoffs, screws, connectors | Assembly hardware | various |
| SD Card module | Local logging (optional) | 1 |
| RTC (DS3231) | Timestamping (optional) | 1 |

## Safety & Protections

| Component | Notes | Qty |
|---|---:|---:|
| TVS diode (SMAJ15A) | Surge & transients | 1 |
| Polyfuse 3A | Input overcurrent protection | 1 |
| MOV 275V | Surge protection (optional) | 1 |
| Fuses | As required per power rail | as required |
| Emergency stop button | Latching E-Stop | 1 |

## Tools & Consumables (recommended)
- Soldering iron (60W), lead-free solder, flux.  
- Multimeter, oscilloscope (optional), logic analyzer (optional).  
- USB-to-Serial / programmer for ESP32-S3.  
- 3D printing or CNC resources for enclosure prototyping.

---

