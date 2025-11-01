# Content Structure Plan - Metro मर्ग

## 1. Material Inventory

**Project Scope:**
This is a dual-portal platform (User + Admin) with comprehensive metro management features for Delhi-NCR.

**Core Features Inventory:**

**User Portal Features:**
- Route Finder with interactive station selection
- Live Metro Tracking with real-time visual indicators
- Ticket Booking & Metro Card Management
- QR Ticket Generator and Scanner
- Offline Mode indicators and cached content
- In-App Help Chatbot interface
- User profile and metro card balance displays

**Admin Portal Features:**
- Dashboard with train schedules and route management
- Real-time status monitoring (on-time/delayed indicators)
- Analytics and crowd density visualizations
- Train management forms
- QR code generation interface

**Visual Assets:**
- Metro line color coding (Blue, Red, Aqua, Yellow)
- Animated train icons
- Route map visualizations
- QR code displays
- Real-time status indicators
- Data visualization charts (crowd density, analytics)

**Data Requirements:**
- Station lists and metro lines
- Real-time train positions
- Schedule data
- Ticket pricing
- User account information
- Metro card balances
- Analytics metrics

## 2. Website Structure

**Type:** MPA (Multi-Page Application)

**Reasoning:** 
This platform serves two distinct user personas (commuters vs. administrators) with different goals, workflows, and data requirements. The feature set includes 10+ distinct interfaces (route finder, live tracking, ticket booking, QR scanner, admin dashboard, analytics, etc.), multiple data types, and complex interactions. This clearly meets MPA criteria:
- ≥6 distinct sections per portal (12+ total)
- Multiple user personas with different needs
- Complex data management requirements
- Different access levels and authentication flows

## 3. Page/Section Breakdown

### USER PORTAL

---

### Page 1: User Home/Dashboard (`/`)
**Purpose**: Quick access hub for commuters to check balance, recent trips, and access core features

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Hero Welcome | Glass Hero Card | User session data | User name, metro card balance, last trip | - |
| Quick Actions Grid | Glass Card Grid (4 cards) | Static feature list | "Find Route", "Buy Ticket", "Track Live", "Scan QR" icons | SVG icons (Lucide) |
| Metro Card Display | Glass Card with Balance | User account API | Card number, balance, expiry, recharge CTA | - |
| Recent Trips | Glass List Cards | Trip history API | Last 3 trips: stations, time, fare | - |
| Live Status Banner | Glass Status Bar | Metro API | Current metro line statuses (operational/delayed) | Metro line color indicators |

---

### Page 2: Route Finder (`/route-finder`)
**Purpose**: Interactive tool to find optimal metro routes between stations

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Search Interface | Dual Glass Input Fields | Static labels | "From Station" and "To Station" dropdowns | SVG location icons |
| Route Options Display | Glass Card List | Route calculation API | Route options: stations, duration, fare, transfers | Animated train icon |
| Interactive Map View | Glass Panel with Map | Metro map API | Visual route path overlay | Metro line colors (Blue/Red/Aqua/Yellow) |
| Journey Details | Expandable Glass Cards | Selected route data | Step-by-step directions, platform numbers, estimated times | - |
| Fare Breakdown | Glass Info Card | Pricing API | Base fare, distance charges, total cost | - |

---

### Page 3: Live Metro Tracking (`/live-tracking`)
**Purpose**: Real-time visualization of metro train positions and arrival times

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Line Selector | Glass Tab Navigation | Metro line list | Blue/Red/Aqua/Yellow line options | Metro line color badges |
| Live Map Display | Large Glass Panel | Real-time train API | Train positions on selected line | Animated train icons |
| Station List View | Glass Timeline Cards | Station data + ETA API | Stations with arrival times, next train in X minutes | - |
| Train Status Indicators | Glass Status Badges | Train API | On-time, delayed, not running status | Color-coded status dots |
| Crowd Density Meter | Glass Progress Bars | Crowd API | Current occupancy levels per train | Gradient fill indicators |

---

### Page 4: Ticket Booking (`/book-ticket`)
**Purpose**: Purchase metro tickets and recharge metro cards

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Ticket Type Selector | Glass Card Grid | Static options | "Single Journey", "Return Trip", "Day Pass", "Metro Card Recharge" | SVG ticket icons |
| Journey Input | Glass Form Fields | User input | From/To stations, travel date, passenger count | - |
| Price Calculator | Glass Card with Breakdown | Pricing API | Ticket cost, taxes, processing fee, total | - |
| Payment Interface | Glass Payment Form | Payment gateway | Card details, UPI, wallet options | Payment method icons |
| Confirmation Screen | Glass Success Card | Booking API response | Booking ID, journey details, download button | - |

---

### Page 5: My Tickets (`/my-tickets`)
**Purpose**: View active and past tickets with QR codes for scanning

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Active Tickets Grid | Glass Card Grid | User tickets API | Active tickets with countdown timers | QR code displays |
| QR Code Display | Large Glass Modal | Selected ticket data | QR code for scanner, ticket details overlay | Generated QR code image |
| Ticket Details | Glass Info Panels | Ticket metadata | Journey route, validity period, fare paid | - |
| Past Tickets Archive | Glass Accordion List | Ticket history API | Previous tickets: date, route, amount | - |
| Download Options | Glass Button Group | Static actions | PDF download, email, add to wallet | - |

---

### Page 6: QR Scanner (`/scanner`)
**Purpose**: Scan QR codes at metro gates for entry/exit

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Camera View | Glass Overlay Frame | Device camera API | Live camera feed with scan area overlay | - |
| Scan Instructions | Glass Tooltip Card | Static text | "Align QR code within frame" guidance | SVG scan animation |
| Scan Success Feedback | Glass Modal | Scan result API | Entry confirmed, balance deducted, gate open | Success/error icon |
| Offline Mode Indicator | Glass Banner | Network status | "Offline - using cached tickets" message | - |

---

### Page 7: User Profile (`/profile`)
**Purpose**: Manage account settings, metro card, and preferences

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Profile Header | Glass Hero Card | User account API | Name, email, phone, profile picture | User avatar (uploaded) |
| Metro Card Management | Glass Card | Metro card API | Card details, balance, transaction history | - |
| Travel Statistics | Glass Stats Grid | Analytics API | Total trips, total spent, favorite route | Data visualization cards |
| Settings Panel | Glass Form Sections | User preferences | Notifications, language, payment methods | - |
| Logout/Delete Account | Glass Action Buttons | Static actions | Account management options | - |

---

### Page 8: Help & Support (`/help`)
**Purpose**: Access help resources and chatbot assistance

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Help Categories | Glass Card Grid | Static FAQs | "Booking", "Payment", "Refunds", "Technical" categories | SVG category icons |
| Chatbot Interface | Glass Chat Panel | Chatbot API | Message thread, input field, quick replies | - |
| FAQ Accordion | Glass Accordion List | Static FAQ data | Common questions and answers | - |
| Contact Support | Glass Contact Form | Static form | Email, phone, live chat options | - |

---

### ADMIN PORTAL

---

### Page 9: Admin Dashboard (`/admin`)
**Purpose**: Overview of metro network status and key metrics

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Metrics Overview | Glass Stats Grid (4 cards) | Analytics API | Active trains, total passengers today, revenue, operational lines | - |
| Live Network Status | Glass Map Panel | Train tracking API | All lines with train positions | Metro line colors, animated train icons |
| Recent Alerts | Glass Alert Cards | Alerts API | Delays, maintenance, incidents | Status color indicators |
| Quick Actions | Glass Button Grid | Static actions | "Add Train", "Update Schedule", "Generate Report", "Send Alert" | SVG action icons |

---

### Page 10: Train Management (`/admin/trains`)
**Purpose**: Manage train schedules, routes, and status

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Train List Table | Glass Data Table | Train database | Train ID, line, current status, schedule, actions | Metro line color badges |
| Train Details Form | Glass Form Panel | Selected train data | Route, schedule times, frequency, capacity | - |
| Schedule Editor | Glass Timeline Interface | Schedule API | Station stops, arrival/departure times | - |
| Status Controls | Glass Toggle Panel | Train status API | On-time, delayed, maintenance, offline status | Color-coded status indicators |

---

### Page 11: Analytics & Reports (`/admin/analytics`)
**Purpose**: Visualize ridership data, revenue, and crowd patterns

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| Date Range Selector | Glass Date Picker | User input | Start date, end date, preset ranges | - |
| Revenue Chart | Glass Chart Panel | Revenue API | Line chart: daily/monthly revenue trends | ECharts line chart |
| Ridership Analytics | Glass Chart Panel | Ridership API | Bar chart: passenger counts by line/station | ECharts bar chart |
| Crowd Density Heatmap | Glass Map Panel | Crowd API | Station crowding levels by time of day | Color gradient heatmap |
| Export Options | Glass Button Group | Static actions | PDF, Excel, CSV download options | - |

---

### Page 12: QR Code Generator (`/admin/qr-generator`)
**Purpose**: Generate QR codes for tickets, passes, and metro cards

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|------------------|-------------|-------------------|--------------|
| QR Type Selector | Glass Radio Group | Static options | "Ticket", "Day Pass", "Metro Card", "Promotional" | - |
| Parameter Input Form | Glass Form Fields | User input | Validity, amount, user ID, custom data | - |
| QR Code Preview | Glass Preview Card | Generated QR data | Live QR code preview, download button | Generated QR code |
| Bulk Generation | Glass Upload Panel | CSV upload | Batch generate QR codes from file | - |

---

## 4. Content Analysis

**Information Density:** High
- 12 distinct pages with complex data requirements
- Real-time data visualization (train tracking, crowd density)
- Form-heavy interactions (booking, admin management)
- Mixed content types (data tables, charts, QR codes, maps)

**Content Balance:**
- Data Visualizations: 15+ (charts, maps, timelines, heatmaps) - 30%
- Forms & Inputs: 20+ (booking, search, admin forms) - 25%
- Real-time Displays: 10+ (train tracking, status indicators) - 20%
- Static Content: FAQs, help text, instructions - 15%
- Interactive Elements: QR scanner, chatbot, route finder - 10%

**Content Type:** Data-driven with high interactivity
- Heavy emphasis on real-time data (train positions, ETAs, crowd levels)
- Complex user interactions (route finding, ticket booking, QR scanning)
- Admin tools require sophisticated data management interfaces
- Visual data presentation is critical (charts, maps, status indicators)

**User Demographics:** 
- **Primary (Commuters):** 18-65 age range, diverse tech literacy, mobile-first usage
- **Secondary (Admins):** 25-50, high tech literacy, desktop-focused
- **Usage Context:** High-stress environments (rushing commuters), outdoor visibility critical
