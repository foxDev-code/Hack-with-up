# Metro मार्ग Platform - Comprehensive Test Guide

**Deployment URL**: https://mwty8349ehr8.space.minimax.io  
**Test Date**: 2025-11-01  
**Status**: Ready for Testing

---

## CRITICAL TEST SCENARIOS

### Test 1: Complete User Journey (Happy Path)

#### Step 1.1: User Registration
1. Navigate to: https://mwty8349ehr8.space.minimax.io/signup
2. Fill in registration form:
   ```
   Full Name: Test User
   Email: your-email@example.com
   Password: TestPass123
   Confirm Password: TestPass123
   ```
3. Click "Sign Up"
4. **VERIFY**: Green success message appears: "✓ Account created successfully! Please check your email to confirm your account."
5. **VERIFY**: Auto-redirects to /login page after 3 seconds
6. **VERIFY**: Login page shows blue info message with email confirmation instructions

#### Step 1.2: Email Confirmation
1. Check your email inbox for confirmation email from Supabase
2. Click the confirmation link
3. **VERIFY**: Email is confirmed successfully

#### Step 1.3: User Login
1. Navigate to: https://mwty8349ehr8.space.minimax.io/login
2. Enter your credentials
3. Click "Sign In"
4. **VERIFY**: Redirects to homepage
5. **VERIFY**: Navigation shows "Profile" or logout option (authenticated state)

#### Step 1.4: Book Ticket - Complete Flow
1. Click "Book Ticket" in navigation
2. **Route Selection** (Step 1/5):
   - From Station: Select "Kashmere Gate"
   - To Station: Select "Dwarka Sector 21"
   - Click "Continue"
   - **VERIFY**: Proceeds to Fare Calculator

3. **Fare Calculator** (Step 2/5):
   - **VERIFY**: Shows fare breakdown:
     - Adult: ₹30
     - Senior: ₹15
     - Child: ₹10
   - **VERIFY**: Back button works
   - Click "Continue to Passengers"

4. **Choose Passengers** (Step 3/5):
   - **VERIFY**: Title shows "Choose Passengers"
   - **VERIFY**: Section title shows "Passenger Types"
   - Test passenger selection:
     - Click "+" for Adult (should be 1 by default)
     - Click "+" for Senior (test increment)
     - Click "-" for Senior (test decrement)
     - Try clicking "-" on Adult when only 1 remains (should prevent going to 0)
   - **VERIFY**: "Total Fare" updates dynamically
   - **VERIFY**: Shows correct calculation (e.g., 2 Adults = ₹60)
   - Click "Proceed to Payment"

5. **Payment** (Step 4/5):
   - **VERIFY**: Title shows "Payment"
   - **VERIFY**: Section shows "Payment Methods"
   - **VERIFY**: Four payment options visible:
     - Credit/Debit Card
     - UPI
     - Net Banking
     - Wallet
   - Select "UPI"
   - **VERIFY**: Selected option highlights (blue border)
   - **VERIFY**: "Total Amount" displays correct fare
   - Click "Pay Now"
   - **VERIFY**: Button shows "Processing..." during loading
   - **VERIFY**: Either succeeds or shows clear error message

6. **QR Ticket** (Step 5/5):
   - **VERIFY**: Title shows "Your Ticket"
   - **VERIFY**: QR code is displayed
   - **VERIFY**: Ticket details show:
     - Ticket ID
     - From station name
     - To station name
     - Passenger count
     - Total paid amount
   - **VERIFY**: Two buttons visible:
     - "View All Tickets"
     - "Go Home"
   - Test navigation buttons

---

### Test 2: Error Handling & Edge Cases

#### Test 2.1: Invalid Route Selection
1. Go to Book Ticket
2. Select same station for From and To
3. Click Continue
4. **VERIFY**: Error message: "From and to stations cannot be the same"

#### Test 2.2: Missing Fields
1. Go to Book Ticket
2. Leave "From Station" empty
3. Click Continue
4. **VERIFY**: Error message or field validation

#### Test 2.3: Payment Method Not Selected
1. Complete route selection and passenger selection
2. On Payment page, do NOT select any payment method
3. Click "Pay Now"
4. **VERIFY**: Error message: "Please select a payment method"

#### Test 2.4: Zero Passengers Attempt
1. On Choose Passengers step
2. Try to reduce all passengers to 0
3. **VERIFY**: System prevents having 0 total passengers

---

### Test 3: Responsive Design

#### Test 3.1: Mobile View
1. Open in mobile device or resize browser to 375px width
2. Navigate through booking flow
3. **VERIFY**: All elements are readable and touchable
4. **VERIFY**: Navigation menu works on mobile
5. **VERIFY**: Forms are usable on small screens

#### Test 3.2: Tablet View
1. Resize to 768px width
2. Test all pages
3. **VERIFY**: Layout adapts appropriately

---

### Test 4: Session & Authentication

#### Test 4.1: Protected Routes
1. Open browser in incognito/private mode
2. Navigate to: https://mwty8349ehr8.space.minimax.io/book-ticket
3. **VERIFY**: Redirects to /login page
4. **VERIFY**: After login, redirects back to /book-ticket

#### Test 4.2: Logout
1. While logged in, find logout button (in profile menu or navigation)
2. Click logout
3. **VERIFY**: Redirects to homepage
4. **VERIFY**: Navigation shows login/signup options again
5. Try accessing /book-ticket
6. **VERIFY**: Redirects to login

---

### Test 5: Performance & Visual Quality

#### Test 5.1: Loading States
1. On slow 3G network (use browser dev tools to throttle)
2. Navigate through booking flow
3. **VERIFY**: Loading indicators show during data fetching
4. **VERIFY**: Buttons disable during form submission

#### Test 5.2: Visual Consistency
1. Check all pages for:
   - Consistent branding (Metro मार्ग logo)
   - Glassmorphism effects applied
   - Metro line colors (Blue, Red, Aqua, Yellow) used appropriately
   - Smooth animations between steps
   - No layout breaks or overlapping elements

---

## PAYMENT INTEGRATION STATUS

### Current Implementation
- ✅ Payment flow infrastructure complete (5-step process)
- ✅ Payment method selection (Card, UPI, Net Banking, Wallet)
- ✅ Error handling for missing payment method
- ⏳ **Stripe Integration**: Ready but requires API keys

### To Enable Real Payments
1. Obtain Stripe API keys (Test or Live mode)
2. Set environment variables in Supabase:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
3. Deploy updated edge functions
4. Frontend will automatically use real Stripe payment processing

### Demo Mode Behavior
- Without Stripe keys, system runs in demo mode
- Mock payment intents are created
- Bookings still recorded in database
- QR tickets generated normally
- Clear indication of demo mode in responses

---

## EXPECTED OUTCOMES

### All Tests Pass ✅
- User can register and login successfully
- Email confirmation flow works with clear messaging
- Complete booking flow (5 steps) works smoothly
- Payment method selection functions correctly
- QR ticket generates with all details
- Error handling prevents invalid submissions
- Mobile/responsive design works across devices

### If Any Test Fails ❌
Document:
1. Which test failed
2. Exact error message shown
3. Browser console errors (F12 → Console tab)
4. Screenshot of the failure
5. Steps to reproduce

---

## QUICK SMOKE TEST (5 Minutes)

For rapid validation, execute this minimal test:

1. **Homepage**: Load https://mwty8349ehr8.space.minimax.io
   - ✓ Page loads without errors
   - ✓ Branding visible

2. **Signup**: Go to /signup
   - ✓ Create account with test email
   - ✓ Success message appears
   - ✓ Redirects to login

3. **Login**: Login with test account
   - ✓ Successfully logs in
   - ✓ Shows authenticated state

4. **Book Ticket**: Go through booking flow
   - ✓ Select stations → Continue
   - ✓ View fare → Continue
   - ✓ Select passengers → Continue
   - ✓ Select payment method → Pay Now
   - ✓ Receive QR ticket

If all 4 tests pass, core functionality is working correctly.

---

## AUTOMATED TESTING NOTES

Automated browser testing was attempted but the testing infrastructure is currently unavailable. Manual testing is required to validate:

1. Complete user journey (signup → login → booking → payment → ticket)
2. Error handling for all edge cases
3. Payment failure scenarios
4. Responsive design across devices

---

## CONTACT FOR ISSUES

If you encounter any issues during testing, please provide:
- Screenshot of the error
- Browser console log (F12 → Console)
- Steps to reproduce
- Browser and device information

This will allow for quick diagnosis and resolution.
