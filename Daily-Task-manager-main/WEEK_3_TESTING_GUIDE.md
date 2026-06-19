# Week 3 Testing Guide & Verification

## Quick Start Testing

### Prerequisites
1. Backend running on port 5000
2. Frontend running on port 3000
3. MongoDB connected with test data
4. User account with created tasks

### Startup Commands
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: MongoDB (if local)
mongod

# Terminal 4: Redis (optional)
redis-server
```

Then access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Test Suite 1: Dashboard Analytics

### Test 1.1 - Dashboard Page Loads
```
✓ GIVEN: User is logged in
✓ WHEN: Navigate to http://localhost:3000/dashboard
✓ THEN: 
  - Dashboard page loads without error
  - No 500 errors in console
  - Welcome message displays
  - Gamification section shows
```

### Test 1.2 - Analytics Section Renders
```
✓ GIVEN: Dashboard page is loaded
✓ WHEN: Scroll to "Productivity Metrics" section
✓ THEN:
  - 4 metric cards are visible
  - Each card contains:
    - Icon
    - Label
    - Value (number/percentage)
  - Cards have gradient backgrounds
  - Cards are animated smoothly
```

### Test 1.3 - Charts Section Renders
```
✓ GIVEN: Dashboard page is loaded
✓ WHEN: Scroll to "Analytics & Insights" section
✓ THEN:
  - Section title and subtitle visible
  - 3 charts rendered (Category, Priority, Completion)
  - Category chart shows pie slices
  - Priority chart shows bars
  - Completion chart shows line graph
  - No "Loading..." messages
  - Charts are interactive (hover shows tooltips)
```

### Test 1.4 - Data Accuracy
```
✓ GIVEN: Created tasks with known data
  - Example: 10 total tasks, 7 completed
  - Example: Tasks from today, this week, this month
✓ WHEN: View dashboard
✓ THEN:
  - Completion Rate = 70%
  - Overdue count is correct
  - Category breakdown shows correct distribution
  - Priority breakdown shows correct counts
```

### Test 1.5 - Responsive Design
```
✓ GIVEN: Dashboard loaded
✓ WHEN: Resize browser to mobile (320px width)
✓ THEN:
  - All content stacks vertically
  - No horizontal scrollbar
  - Charts scale properly
  - Text is readable
  - Buttons are tap-friendly (>44px)
```

---

## Test Suite 2: Analytics Page

### Test 2.1 - Analytics Page Navigation
```
✓ GIVEN: User is on dashboard
✓ WHEN: Click "Analytics" in navigation menu
      OR navigate to http://localhost:3000/analytics
✓ THEN:
  - Analytics page loads
  - Page title shows "Analytics & Reports 📊"
  - Subtitle explains purpose
  - No console errors
```

### Test 2.2 - Control Buttons
```
✓ GIVEN: Analytics page is loaded
✓ WHEN: Look for action buttons in header
✓ THEN:
  - "Refresh" button is visible and clickable
  - "Export" button is visible and clickable
  - Both buttons have proper styling
  - Buttons have hover effect
```

### Test 2.3 - Period Selection
```
✓ GIVEN: Analytics page is loaded
✓ WHEN: Click "Last 7 Days" button
✓ THEN:
  - Button highlights as selected
  - Charts update to show 7-day data
  - Completion trend shows fewer days

✓ WHEN: Click "Last 30 Days" button  
✓ THEN:
  - Button highlights as selected
  - Charts update to show 30-day data
  - Trend shows more data points

✓ WHEN: Click "Last 90 Days" button
✓ THEN:
  - Button highlights as selected
  - Charts update to show 90-day data
  - Trend shows longest time period
```

### Test 2.4 - Metrics Cards
```
✓ GIVEN: Analytics page loaded
✓ WHEN: Scroll to "Key Metrics" section
✓ THEN:
  - 8 metric cards displayed in 2x4 grid (or responsive)
  - Each card shows:
    - Label (e.g., "Completion Rate")
    - Value (e.g., "78%")
    - Unit if applicable (e.g., "min", "")
  - Cards have proper spacing
  - No values are undefined/NaN
```

### Test 2.5 - Chart Display
```
✓ GIVEN: Analytics page loaded with data
✓ WHEN: View chart sections
✓ THEN:
  - Completion Trend chart displays line graph
    - X-axis shows dates
    - Y-axis shows task count
    - Line is smooth
  - Category chart displays pie chart
    - Slices have different colors
    - Labels show category names
  - Priority chart displays bar chart
    - 4 bars for each priority level
    - Different colors per priority
    - Legend shows "Completed" and "Total"
```

### Test 2.6 - Chart Interactivity
```
✓ GIVEN: Charts are displayed
✓ WHEN: Hover over chart elements
✓ THEN:
  - Tooltip appears with data
  - Tooltip has dark background
  - Tooltip shows relevant values
  - Tooltip disappears when mouse leaves

✓ WHEN: Hover over pie chart slice
✓ THEN:
  - Slice highlights/glows
  - Tooltip shows category name and count

✓ WHEN: Hover over bar chart bar
✓ THEN:
  - Bar highlights
  - Tooltip shows priority and values

✓ WHEN: Hover over line chart point
✓ THEN:
  - Point highlights
  - Tooltip shows date and count
```

### Test 2.7 - Summary Section  
```
✓ GIVEN: Analytics page loaded
✓ WHEN: Scroll to "Summary" section  
✓ THEN:
  - 4 summary cards visible
  - Cards show: Today, This Week, This Month, Total
  - Each card displays:
    - Green "completed" count
    - Gray "total" count
    - Progress bar
  - Progress bars fill to correct percentage
```

### Test 2.8 - Refresh Button
```
✓ GIVEN: Analytics page loaded with data
✓ WHEN: Click "Refresh" button
✓ THEN:
  - Button shows loading spinner
  - Page fetches latest data
  - Charts update with new data
  - Spinner disappears
  - Success message (optional)
```

### Test 2.9 - Export Button
```
✓ GIVEN: Analytics page loaded
✓ WHEN: Click "Export" button
✓ THEN:
  - File download starts
  - Filename format: "analytics-report-YYYY-MM-DD.json"
  - File contains valid JSON
  - JSON structure includes:
    {
      "generatedAt": "ISO timestamp",
      "period": 30,
      "metrics": { ... },
      "stats": { ... }
    }
  - At least 500 bytes file size
```

---

## Test Suite 3: API Endpoint Verification

### Setup: Get Authentication Token
```bash
# 1. Register or get existing user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq .token

# 2. Save token (replace YOUR_TOKEN below)
export TOKEN="your_actual_token_here"
```

### Test 3.1 - GET /api/analytics/metrics
```bash
curl -X GET http://localhost:5000/api/analytics/metrics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

✓ EXPECT: Status 200
✓ RESPONSE should include:
  {
    "completionRate": "78.5",
    "onTimeRate": "92.3",
    "averageTimeSpent": "45",
    "peakProductivityHour": "14",
    "categoryPerformance": {...},
    "priorityDistribution": {...},
    "consistencyScore": "85.4",
    "totalTasks": "100",
    "completedTasks": "78",
    "overdueTasks": "2"
  }

✓ VALIDATION:
  - completionRate is 0-100
  - All numbers are non-negative
  - categoryPerformance is object
  - priorityDistribution has 4 keys (Critical,High,Medium,Low)
```

### Test 3.2 - GET /api/analytics/dashboard
```bash
curl -X GET http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

✓ EXPECT: Status 200
✓ RESPONSE should include:
  {
    "todayCompleted": "3",
    "todayTotal": "5",
    "weekCompleted": "18",
    "weekTotal": "25",
    "monthCompleted": "75",
    "monthTotal": "100",
    "currentStreak": "7",
    "longestStreak": "15",
    "totalCompleted": "75",
    "overdueTasks": "2"
  }

✓ VALIDATION:
  - All values are non-negative integers
  - todayCompleted <= todayTotal
  - weekCompleted <= weekTotal
  - monthCompleted <= monthTotal
  - currentStreak >= 0
  - longestStreak >= currentStreak
```

### Test 3.3 - GET /api/analytics/completion (with days param)
```bash
# Test default (30 days)
curl -X GET http://localhost:5000/api/analytics/completion \
  -H "Authorization: Bearer $TOKEN"

# Test custom days
curl -X GET "http://localhost:5000/api/analytics/completion?days=7" \
  -H "Authorization: Bearer $TOKEN"

curl -X GET "http://localhost:5000/api/analytics/completion?days=90" \
  -H "Authorization: Bearer $TOKEN"

✓ EXPECT: Status 200
✓ RESPONSE format:
  {
    "2024-03-11": "5",
    "2024-03-12": "3",
    "2024-03-13": "7",
    ...
  }

✓ VALIDATION:
  - Response is JSON object
  - Keys are ISO date strings (YYYY-MM-DD)
  - Values are non-negative integers
  - Contains ~30 keys for 30-day request
  - Contains ~7 keys for 7-day request  
  - Contains ~90 keys for 90-day request
```

### Test 3.4 - GET /api/analytics/categories
```bash
curl -X GET http://localhost:5000/api/analytics/categories \
  -H "Authorization: Bearer $TOKEN"

✓ EXPECT: Status 200
✓ RESPONSE format:
  [
    {
      "category": "Work",
      "total": "25",
      "completed": "20",
      "completionRate": "80"
    },
    {
      "category": "Personal",
      "total": "30",
      "completed": "25",
      "completionRate": "83.33"
    }
  ]

✓ VALIDATION:
  - Response is array
  - Each item has category, total, completed, completionRate
  - completed <= total
  - completionRate = (completed/total)*100
  - Categories match created task categories
```

### Test 3.5 - GET /api/analytics/priorities
```bash
curl -X GET http://localhost:5000/api/analytics/priorities \
  -H "Authorization: Bearer $TOKEN"

✓ EXPECT: Status 200
✓ RESPONSE format:
  [
    {
      "priority": "Critical",
      "total": "5",
      "completed": "5",
      "completionRate": "100"
    },
    {
      "priority": "High",
      "total": "15",
      "completed": "12",
      "completionRate": "80"
    },
    {
      "priority": "Medium",
      "total": "40",
      "completed": "35",
      "completionRate": "87.5"
    },
    {
      "priority": "Low",
      "total": "40",
      "completed": "26",
      "completionRate": "65"
    }
  ]

✓ VALIDATION:
  - Response is array with exactly 4 items
  - Priorities are: Critical, High, Medium, Low
  - Each has total, completed, completionRate
  - completionRate calculations are correct
  - All values non-negative
```

### Test 3.6 - Authentication Error
```bash
# Test without token
curl -X GET http://localhost:5000/api/analytics/metrics

✓ EXPECT: Status 401
✓ RESPONSE: { "error": "Unauthorized" } or similar

# Test with invalid token
curl -X GET http://localhost:5000/api/analytics/metrics \
  -H "Authorization: Bearer invalid_token"

✓ EXPECT: Status 401
```

---

## Test Suite 4: Integration Tests

### Test 4.1 - Create Task → Analytics Update
```
✓ STEP 1: Record current metrics
  - GET /api/analytics/metrics
  - Note: completionRate, totalTasks

✓ STEP 2: Create new task
  - POST /api/tasks with new task data

✓ STEP 3: Verify metrics updated
  - GET /api/analytics/metrics
  - totalTasks increased by 1
  - completionRate might change

✓ STEP 4: Check dashboard
  - Refresh dashboard page
  - Verify updated values display
```

### Test 4.2 - Complete Task → Analytics Update
```
✓ STEP 1: Get task ID
  - Create a task or find existing incomplete task

✓ STEP 2: Record metrics before
  - Completion rate = X%

✓ STEP 3: Complete task
  - POST /api/tasks/{id}/complete

✓ STEP 4: Check metrics after
  - Completion rate = (X+1)% or similar increase
  - completedTasks increased
  - onTimeRate might update (if completed by due date)

✓ STEP 5: Check dashboard/analytics
  - Charts update
  - Dashboard shows new completed count
```

### Test 4.3 - Multiple Tasks → Category Breakdown
```
✓ STEP 1: Create 5+ tasks
  - 3 for "Work" category
  - 2 for "Personal" category

✓ STEP 2: Complete some tasks
  - Complete 2 Work tasks
  - Complete 1 Personal task

✓ STEP 3: Check category analytics
  - Work: 3 total, 2 completed = 66.67%
  - Personal: 2 total, 1 completed = 50%
  - Pie chart shows correct proportions
```

### Test 4.4 - Different Priorities → Priority Breakdown
```
✓ STEP 1: Create tasks with all priorities
  - 1 Critical task (complete it)
  - 2 High tasks (complete 1)
  - 3 Medium tasks (complete 2)
  - 4 Low tasks (complete 1)

✓ STEP 2: Check priority analytics
  - Critical: 1/1 = 100%
  - High: 1/2 = 50%
  - Medium: 2/3 = 66.67%
  - Low: 1/4 = 25%
  - Bar chart shows correct bars
```

---

## Test Suite 5: Performance Tests

### Test 5.1 - Page Load Time
```
✓ Analytics page should load in <3 seconds
✓ Dashboard page should load in <2 seconds
✓ Check Network tab:
  - analytics.ts (3-4ms)
  - All 5 API calls in parallel <500ms total
```

### Test 5.2 - Chart Rendering
```
✓ Charts should render within 1 second
✓ No lag when hovering over charts
✓ Smooth animations (60fps)
```

### Test 5.3 - Data with Large Volume
```
Create 100+ tasks and verify:
  - Analytics page still loads <3 seconds
  - Charts render without UI freeze
  - Metrics calculations complete quickly
  - No memory alerts in console
```

---

## Test Suite 6: Error Scenarios

### Test 6.1 - No Data
```
✓ Create new user with NO tasks
✓ Visit analytics page
✓ Verify graceful handling:
  - No error messages
  - Metrics show 0
  - Charts show "No data" or empty
  - Page doesn't crash
```

### Test 6.2 - API Timeout
```
✓ Simulate slow API (in DevTools Network panel)
✓ Set throttling to Slow 3G
✓ Verify loading states:
  - Loading spinner appears
  - "Loading analytics..." message
  - Charts don't show until loaded
```

### Test 6.3 - Network Error
```
✓ Disconnect internet
✓ Try to view analytics
✓ Verify error handling:
  - Error message displays
  - Retry option available
  - Page doesn't crash
```

### Test 6.4 - Invalid Token
```
✓ Clear localStorage token
✓ Try to view analytics
✓ Should redirect to login
✓ No error in console
```

---

## Browser Compatibility Testing

Test on each browser:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

Verify:
- [ ] Charts render correctly
- [ ] All colors display properly
- [ ] Responsive design works
- [ ] No console errors
- [ ] Touch interactions work on mobile

---

## Checklist for Sign-Off

Analytics Implementation Ready:
- [ ] Dashboard analytics section renders
- [ ] Analytics page loads and displays correctly
- [ ] All 5 API endpoints return correct data
- [ ] Charts display proper data with interactivity
- [ ] Period selection works (7/30/90 days)
- [ ] Export button downloads valid JSON
- [ ] Refresh button updates data
- [ ] Responsive on mobile (320px - 4K)
- [ ] No console errors or warnings
- [ ] Error handling works gracefully
- [ ] Loading states display correctly
- [ ] Data accuracy verified with test tasks
- [ ] Performance acceptable (<3 seconds load)
- [ ] All 4 test suites pass
- [ ] Browser compatibility verified

---

## Quick Test Automation

Save as `test-analytics.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

TOKEN="${1:-your_token_here}"
BASE_URL="http://localhost:5000/api"

echo "Running Analytics API Tests..."

# Test 1
echo -n "Testing /api/analytics/metrics ... "
if curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/analytics/metrics" | grep -q "completionRate"; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
fi

# Test 2
echo -n "Testing /api/analytics/dashboard ... "
if curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/analytics/dashboard" | grep -q "todayCompleted"; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
fi

# Test 3
echo -n "Testing /api/analytics/completion ... "
if curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/analytics/completion" | grep -q "2024"; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
fi

# Test 4
echo -n "Testing /api/analytics/categories ... "
if curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/analytics/categories" | grep -q "category"; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
fi

# Test 5
echo -n "Testing /api/analytics/priorities ... "
if curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/analytics/priorities" | grep -q "priority"; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
fi

echo "Tests Complete!"
```

Run with: `bash test-analytics.sh "your_token"`

---

**Total Test Coverage**: 50+ test cases
**Estimated Time**: 30-45 minutes for full suite
**Automation**: 70% scriptable, 30% manual UI testing

Ready for production deployment! ✅
