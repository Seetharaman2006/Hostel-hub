# Hostel Hub

A web-based Hostel Management & Mess Food Voting system with dedicated **Student** and **Admin / Warden** portals.

## Project Structure

```
hostel-hub/
├── index.html          # Main application entry point
├── css/
│   └── styles.css      # Responsive layout, light/dark themes, UI components
├── js/
│   ├── data.js         # Initial dataset and localStorage persistence
│   ├── views.js        # Student and Admin page templates
│   └── app.js          # Authentication, navigation, voting & CRUD logic
└── README.md           # Project documentation
```

## Features

- **Student Portal:** Daily mess menu, live food & evening snacks voting polls, dish suggestions, weekly timetable & meal ratings, room complaint tracker, outpass requests with digital gate pass, notices, and emergency contacts.
- **Admin / Warden Portal:** Live dashboard stats, food poll creation & one-click menu updates, complaint resolution desk, outpass approval workflow, notice board publishing, and resident directory with fee tracking.

## How to Run

1. Extract the `hostel-hub` folder.
2. Open `index.html` in any web browser (or open the folder in VS Code and run with Live Server).
3. Default login credentials:
   - **Student PIN:** `1234`
   - **Admin Password:** `admin123`
