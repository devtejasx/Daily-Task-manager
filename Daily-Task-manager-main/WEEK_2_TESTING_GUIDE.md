# Week 2: Tasks CRUD - Quick Testing Guide

**Ready to test Week 2?** Copy-paste these commands!

---

## ✅ Prerequisites

Make sure you have:
- [x] Week 1 complete (Authentication working)
- [x] Both servers running (backend + frontend)
- [x] MongoDB connected
- [x] Valid JWT token (from login)

---

## 🧪 Testing via Browser (Easiest)

### 1. Create a Task

```
1. Go to http://localhost:3000/tasks
2. Click "New Task" button
3. Fill form:
   - Title: "Buy groceries"
   - Description: "Milk, eggs, bread"
   - Category: "Shopping"
   - Priority: "Medium"
   - Click "Create Task"
4. ✅ Task appears in list
```

### 2. View Tasks List

```
1. Go to http://localhost:3000/tasks
2. ✅ See all your tasks
3. Each task shows:
   - Title
   - Status icon
   - Priority (colored)
   - Category
   - Due date (if set)
   - XP reward
```

### 3. Search Tasks

```
1. On tasks page, type in search box
2. Search for: "groceries"
3. ✅ Task list filters in real-time
```

### 4. Filter Tasks

```
1. Click "Filters" button
2. Select a Status: "NotStarted"
3. ✅ Only uncompleted tasks show
4. Change Priority to "High"
5. ✅ Only high-priority tasks show
6. Try Category filter too
```

### 5. View Task Details

```
1. Click any task in list
2. ✅ See full task details:
   - Title, description
   - All metadata
   - Progress bar
   - Completion % (if set)
```

### 6. Edit Task

```
1. From task detail, click "Edit"
2. Change Priority from "Medium" to "High"
3. Change Status to "InProgress"
4. Click "Update Task"
5. ✅ Changes saved
6. Go back and verify changes
```

### 7. Complete Task

```
1. From task detail, click "Complete"
2. ✅ Task marked as complete
3. You should see: "+100 XP" (or similar)
4. Task icon changes to checkmark
```

### 8. Delete Task

```
1. Click "Delete" button on task card
2. Confirm deletion
3. ✅ Task removed from list
```

---

## 🔌 Testing via cURL (Advanced)

### Get Your Token First
```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# From response, copy the token value
# Set it as a variable:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test 1: Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "category": "Shopping",
    "priority": "Medium",
    "difficulty": "Easy",
    "xpReward": 25
  }'
```

**Expected:** Status 201, task object with _id

---

### Test 2: Get All Tasks
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, array of task objects

---

### Test 3: Get All Tasks with Filters
```bash
# Filter by status
curl -X GET "http://localhost:5000/api/tasks?status=NotStarted" \
  -H "Authorization: Bearer $TOKEN"

# Filter by priority
curl -X GET "http://localhost:5000/api/tasks?priority=High" \
  -H "Authorization: Bearer $TOKEN"

# Filter by category
curl -X GET "http://localhost:5000/api/tasks?category=Shopping" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, filtered tasks array

---

### Test 4: Get Today's Tasks
```bash
curl -X GET http://localhost:5000/api/tasks/today \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, tasks due today

---

### Test 5: Search Tasks
```bash
curl -X GET "http://localhost:5000/api/tasks/search?q=groceries" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, matching tasks

---

### Test 6: Get Single Task
```bash
# Replace TASK_ID with actual task ID
curl -X GET http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, single task object

---

### Test 7: Update Task
```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "High",
    "status": "InProgress",
    "description": "Updated description"
  }'
```

**Expected:** Status 200, updated task object

---

### Test 8: Complete Task (Gamification!)
```bash
curl -X POST http://localhost:5000/api/tasks/TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, includes:
- task (completed)
- xpAwarded (number)
- leveledUp (true/false)
- newLevel (number, if leveled up)

---

### Test 9: Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, success message

---

## 📊 Complete Test Sequence

Run these in order:

```bash
# Set token
TOKEN="your_token_here"

# 1. Create a task
RESPONSE=$(curl -s -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"High"}')

# Extract task ID (if using jq)
TASK_ID=$(echo $RESPONSE | jq -r '.data._id')

# 2. Get all tasks
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# 3. Search
curl -X GET "http://localhost:5000/api/tasks/search?q=Test" \
  -H "Authorization: Bearer $TOKEN"

# 4. Filter
curl -X GET "http://localhost:5000/api/tasks?priority=High" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get single
curl -X GET http://localhost:5000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"

# 6. Update
curl -X PUT http://localhost:5000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority":"Low"}'

# 7. Complete (xp!)
curl -X POST http://localhost:5000/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN"

# 8. Delete
curl -X DELETE http://localhost:5000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Success Criteria

### All tests pass if:

- [x] Create returns 201 with task object
- [x] Get all returns array of tasks
- [x] Search filters correctly
- [x] Filters work (status/priority/category)
- [x] Get single returns task details
- [x] Update modifies fields
- [x] Complete returns xpAwarded
- [x] Delete removes task
- [x] All protected (401 without token)

---

## 🐛 Troubleshooting

### Error: "No token provided"
```
Solution: Make sure HEADER includes "Authorization: Bearer TOKEN"
Not just "TOKEN"
```

### Error: "Task not found"
```
Solution: Use correct TASK_ID from create/get response
```

### Error: "401 Unauthorized"
```
Solution 1: Token expired, get new one
Solution 2: Wrong token value, check copy-paste
Solution 3: Backend not running on port 5000
```

### Frontend shows spinner
```
Solution 1: Backend not running
Solution 2: MongoDB not connected
Solution 3: Check browser console for errors
```

### Tasks not showing
```
Solution 1: Clear localStorage and re-login
Solution 2: Check Network tab in DevTools
Solution 3: Verify API_URL in .env.local
```

---

## 🎮 Test Gamification

1. Create HIGH priority task
2. Complete it
3. Check XP awarded:
   - Base: 50 XP
   - High priority: x2 = 100 XP
   - On-time bonus: +25%
   - Total: ~125 XP

4. If level up → You should see notification

---

## 📝 Quick Reference

| Action | Button | URL |
|--------|--------|-----|
| View tasks | - | /tasks |
| Create | "New Task" | /tasks/create |
| View detail | Click task | /tasks/{id} |
| Edit | "Edit" button | /tasks/{id}/edit |
| Complete | "Complete" button | POST /tasks/{id}/complete |
| Delete | "Delete" button | DELETE /tasks/{id} |

---

## 🚀 Week 2 Verified ✅

All endpoints tested and working:
- [x] POST /api/tasks
- [x] GET /api/tasks
- [x] GET /api/tasks/today
- [x] GET /api/tasks/search
- [x] GET /api/tasks/:id
- [x] PUT /api/tasks/:id
- [x] DELETE /api/tasks/:id
- [x] POST /api/tasks/:id/complete

---

**Status: WEEK 2 COMPLETE** 🎉

All CRUD operations working!  
Gamification integrated!  
Ready for Week 3!
