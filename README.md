# Mytodo
# Katomaran Todo Task Management Mobile Application

A cross-platform **Todo Task Management Mobile App** built for the **Katomaran Hackathon**.  
This app enables users to **log in with Google** and manage personal tasks with full CRUD operations on the go.

---

## 🚀 Features

✅ Google authentication for login  
✅ Add, view, update, complete, and delete tasks  
✅ Task fields: `title`, `description`, `due date`, `status (open/complete)`  
✅ Local state management using Context API  
✅ Intuitive UI with:
- FAB (Floating Action Button) to add tasks
- Smooth list animations
- Tabs, filters, and a search bar

✅ Pull-to-refresh and swipe-to-delete  
✅ Cross-platform support for **Android and iOS**

---

## 🧱 Tech Stack

| Layer         | Technology                   |
|---------------|-------------------------------|
| Mobile App    | React Native (Expo)           |
| Authentication| Google Sign-In (via Firebase) |
| Crash Reporting (optional)| Firebase Crashlytics     |
| State Management | React Hooks + Context API   |

---

## 📁 Project Structure

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/katomaran_todo_hackathon.git
cd katomaran_todo_hackathon
npm install
# or
yarn install
// /firebase/firebaseConfig.js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};
npx expo start
📣 About the Project
This project was developed as part of the Katomaran Hackathon organized by katomaran.com.
It demonstrates modern app development practices with a clean UI/UX, Google login, and task management capabilities.

✨ License
This project is licensed for educational and hackathon use. Feel free to contribute or fork!

vbnet
Copy
Edit

---

### 🔁 To Use in Your Project:
1. Copy the entire text above into a new file in your project root: `README.md`
2. Replace the GitHub link under “Clone the Repository” with your actual repo link.
3. Make sure your `firebaseConfig.js` file is added to `.gitignore` so secrets aren't exposed.

## 📱 App Screenshots

### ✅ Login Screen


### ✅ Task List Screen
![Task List](assets/screenshots/tasklist.png)

### ✅ Add Task Modal
![Add Task](assets/screenshots/addtask.png)

