# 🧪 Testing Checklist

Use this checklist to verify all Phase 1 features are working correctly.

## 🔐 Authentication Tests

### Registration
- [ ] Navigate to /register
- [ ] Fill in name, email, password
- [ ] Confirm password matches
- [ ] Submit form
- [ ] Redirected to dashboard
- [ ] User is logged in

### Login
- [ ] Log out from dashboard
- [ ] Navigate to /login
- [ ] Enter email and password
- [ ] Submit form
- [ ] Redirected to dashboard
- [ ] Correct user name displayed

### Password Security
- [ ] Password is hashed (check DB - not plain text)
- [ ] Weak password warning (future phase)
- [ ] Confirm password validation works

---

## 📋 Task Management Tests

### Create Task
- [ ] Navigate to dashboard
- [ ] Click "+ New Task"
- [ ] Enter task title
- [ ] Select category
- [ ] Set priority level
- [ ] Set due date
- [ ] Set due time
- [ ] Select difficulty
- [ ] Submit task
- [ ] Task appears in list
- [ ] Task saved to database

### Update Task
- [ ] Click on a task to edit
- [ ] Modify title
- [ ] Change priority
- [ ] Change due date
- [ ] Save changes
- [ ] Changes reflect in UI
- [ ] Database is updated

### Complete Task
- [ ] Check task checkbox
- [ ] Task marked as completed
- [ ] UI shows completion state
- [ ] Status changed in DB
- [ ] Dashboard stats update

### Delete Task
- [ ] Select a task
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Task removed from UI
- [ ] Task removed from DB

### Search Tasks
- [ ] Navigate to Tasks page
- [ ] Enter search term
- [ ] Results filter correctly
- [ ] Can search by title
- [ ] Can search by tags
- [ ] Results are accurate

---

## 📊 Dashboard Tests

### Statistics Display
- [ ] Today's progress shows (X/Y)
- [ ] Weekly progress shows
- [ ] Current streak displays
- [ ] Total completed count shows
- [ ] Numbers update after completing tasks

### Today's Tasks
- [ ] Only today's tasks display
- [ ] Time shows relative format
- [ ] Completed tasks strikethrough
- [ ] Uncompleted tasks show active

### Navigation
- [ ] Links to different sections work
- [ ] Navbar shows correct user name
- [ ] Logout button works
- [ ] Settings button accessible

---

## 🎨 UI/UX Tests

### Responsive Design
- [ ] Works on desktop (1920px+)
- [ ] Works on tablet (1024px)
- [ ] Works on mobile (375px)
- [ ] All elements visible
- [ ] No horizontal scroll (except intentional)
- [ ] Touch targets are 44px minimum

### Animations
- [ ] Task cards fade in smoothly
- [ ] Buttons have hover effects
- [ ] Form inputs have focus states
- [ ] Transitions are smooth
- [ ] No janky animations

### Colors & Contrast
- [ ] Text is readable
- [ ] Priority colors are distinct
- [ ] Hover states are clear
- [ ] Disabled states are visible
- [ ] Meets WCAG AA contrast

### Loading States
- [ ] Loading indicators show
- [ ] Prevents double-submit
- [ ] Buttons disable while loading
- [ ] Spinners rotate smoothly

---

## 🔌 API Integration Tests

### Authentication Endpoints
- [ ] POST /auth/register returns token
- [ ] POST /auth/login returns token
- [ ] GET /auth/profile returns user
- [ ] Invalid credentials rejected

### Task Endpoints
- [ ] POST /tasks creates task
- [ ] GET /tasks returns all tasks
- [ ] GET /tasks/today returns today's tasks
- [ ] PUT /tasks/:id updates task
- [ ] DELETE /tasks/:id deletes task
- [ ] GET /tasks/search searches tasks

### Error Handling
- [ ] Missing required fields rejected
- [ ] Invalid email format rejected
- [ ] Server errors show user message
- [ ] Network errors handled gracefully

---

## 💾 Data Persistence Tests

### Database
- [ ] Data persists after refresh
- [ ] Data persists across sessions
- [ ] Multiple users have separate data
- [ ] Deleted data is removed from DB
- [ ] Updated data reflects in DB

### Local Storage (Phase 2)
- [ ] Auth token stored
- [ ] User preferences saved
- [ ] Theme preference persists
- [ ] Todos cached (when offline ready)

---

## 🛡️ Security Tests

### Authentication
- [ ] Passwords are hashed (not plain text)
- [ ] JWT tokens are validated
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] CORS is properly configured

### Data Access
- [ ] Users can only see own tasks
- [ ] Users can't delete other users' tasks
- [ ] Users can't modify other users' tasks
- [ ] API requires valid token
- [ ] No sensitive data in local storage

---

## ⚡ Performance Tests

### Page Load
- [ ] Homepage loads in <2s
- [ ] Dashboard loads in <2s
- [ ] Login page loads in <1s
- [ ] No console errors
- [ ] Network requests are reasonable

### API Response
- [ ] Create task responds in <500ms
- [ ] Get tasks responds in <500ms
- [ ] Search completes in <1s
- [ ] No unnecessary requests

### Database
- [ ] Queries have indexes
- [ ] No N+1 queries
- [ ] Connection pooling works
- [ ] No memory leaks

---

## 🧩 Component Tests

### Navbar
- [ ] Logo links to home
- [ ] Navigation links work
- [ ] User name displays correctly
- [ ] Logout button functions
- [ ] Responsive on mobile

### Task Card
- [ ] Title displays
- [ ] Priority badge colors correct
- [ ] Due date shows
- [ ] Checkbox works
- [ ] Click to edit works

### Forms
- [ ] Input fields are accessible
- [ ] Error messages appear
- [ ] Success messages appear
- [ ] Required fields validated
- [ ] Form clears after submit

---

## 📱 Browser Compatibility

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🐛 Known Limitations (Phase 1)

- No gamification yet (Phase 2)
- No dark mode toggle UI (can add CSS)
- No team collaboration (Phase 3)
- No file uploads (Phase 3)
- No voice input (Phase 3)
- No notifications UI (Phase 2)
- Basic reminders only (Phase 2)

---

## ✅ Final Verification

Before considering Phase 1 complete:

- [ ] All CRUD operations work
- [ ] Authentication is secure
- [ ] UI is responsive
- [ ] Database persists data
- [ ] API handles errors
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Code is clean and typed
- [ ] Documentation is complete

---

## 🚀 Next Phase Checklist

To start Phase 2 (Gamification):

- [ ] Test all Phase 1 features above
- [ ] Review DEVELOPMENT_PHASES.md
- [ ] Plan gamification features
- [ ] Set up achievement system
- [ ] Implement XP calculation
- [ ] Add level progression

---

**Test Date**: _________________
**Tester**: _________________
**Status**: _________________

Use this checklist to validate the application is working correctly!
