// Hostel Hub — Data Store & LocalStorage Persistence

const STORAGE_KEY = 'hostel_hub_data_v2';

function getDefaultData() {
  return {
    autoAcceptRooms: true,
    students: [
      { id: 'S101', name: 'Arjun Kumar', regNo: '2024EEE101', room: 'B-204', block: 'Block B', phone: '+91 98401 22310', feeStatus: 'Paid', messPlan: 'Veg + Special' },
      { id: 'S102', name: 'Priya Sharma', regNo: '2024CSE114', room: 'G-108', block: 'Block G', phone: '+91 98402 44120', feeStatus: 'Paid', messPlan: 'Non-Veg' },
      { id: 'S103', name: 'Karthik Raj', regNo: '2024ECE089', room: 'B-312', block: 'Block B', phone: '+91 97890 11205', feeStatus: 'Pending', messPlan: 'Veg' },
      { id: 'S104', name: 'Sneha Nair', regNo: '2024IT042', room: 'G-215', block: 'Block G', phone: '+91 96001 77831', feeStatus: 'Paid', messPlan: 'Veg + Special' }
    ],
    rooms: [
      { id: 'R1', roomNo: 'B-204', block: 'Block B', floor: '2nd Floor', type: '2-Sharing', ac: false, capacity: 2, occupied: 1, rent: '₹4,500 / mo', amenities: 'Wi-Fi, Study Desk, Attached Bath' },
      { id: 'R2', roomNo: 'B-205', block: 'Block B', floor: '2nd Floor', type: '2-Sharing', ac: true, capacity: 2, occupied: 0, rent: '₹6,200 / mo', amenities: 'AC, Wi-Fi, Balcony, Attached Bath' },
      { id: 'R3', roomNo: 'B-310', block: 'Block B', floor: '3rd Floor', type: 'Single', ac: true, capacity: 1, occupied: 0, rent: '₹7,500 / mo', amenities: 'AC, Private Desk, Cupboard, Wi-Fi' },
      { id: 'R4', roomNo: 'B-312', block: 'Block B', floor: '3rd Floor', type: '3-Sharing', ac: false, capacity: 3, occupied: 2, rent: '₹3,800 / mo', amenities: 'Wi-Fi, Ceiling Fan, Locker' },
      { id: 'R5', roomNo: 'G-108', block: 'Block G', floor: '1st Floor', type: '2-Sharing', ac: true, capacity: 2, occupied: 2, rent: '₹6,200 / mo', amenities: 'AC, Wi-Fi, Attached Bath' },
      { id: 'R6', roomNo: 'G-215', block: 'Block G', floor: '2nd Floor', type: '2-Sharing', ac: false, capacity: 2, occupied: 1, rent: '₹4,500 / mo', amenities: 'Wi-Fi, Study Desk, Wardrobe' },
      { id: 'R7', roomNo: 'G-302', block: 'Block G', floor: '3rd Floor', type: '3-Sharing', ac: false, capacity: 3, occupied: 1, rent: '₹3,800 / mo', amenities: 'Wi-Fi, Balcony, Locker' }
    ],
    roomBookings: [
      { id: 'RB-101', studentId: 'S101', studentName: 'Arjun Kumar', fromRoom: 'Unassigned', toRoom: 'B-204', block: 'Block B', date: '2026-11-20', status: 'Auto-Approved' }
    ],
    todayMenu: {
      breakfast: { time: '7:30 AM – 9:00 AM', items: 'Masala Dosa, Sambar, Coconut Chutney, Coffee / Tea' },
      lunch: { time: '12:30 PM – 2:00 PM', items: 'Steamed Rice, Dal Tadka, Paneer Butter Masala, Chapati, Curd' },
      snacks: { time: '4:45 PM – 5:45 PM', items: 'Punjabi Samosa, Mint Chutney, Ginger Tea / Milk' },
      dinner: { time: '7:45 PM – 9:15 PM', items: 'Veg Biryani, Onion Raita, Gobi 65, Gulab Jamun' }
    },
    weeklyMenu: [
      { day: 'Monday', breakfast: 'Idli, Vada, Sambar', lunch: 'Rice, Sambar, Potato Fry, Curd', snacks: 'Onion Bajji & Tea', dinner: 'Chapati, Chana Masala, Rice' },
      { day: 'Tuesday', breakfast: 'Poori, Aloo Masala', lunch: 'Lemon Rice, Dal, Veg Kurma', snacks: 'Samosa & Coffee', dinner: 'Veg Fried Rice, Gobi Manchurian' },
      { day: 'Wednesday', breakfast: 'Pongal, Medu Vada', lunch: 'Rice, Chicken / Paneer Curry', snacks: 'Veg Puff & Tea', dinner: 'Parotta, Salna, Fruit Salad' },
      { day: 'Thursday', breakfast: 'Masala Dosa, Chutney', lunch: 'Bisibele Bath, Chips, Curd', snacks: 'Bread Pakora & Milk', dinner: 'Chapati, Dal Makhani, Jeera Rice' },
      { day: 'Friday', breakfast: 'Upma, Kesari, Chutney', lunch: 'Rice, Rasam, Bhindi Fry, Payasam', snacks: 'Bhel Puri & Tea', dinner: 'Veg Biryani, Raita, Boiled Egg / Paneer' },
      { day: 'Saturday', breakfast: 'Aloo Paratha, Curd', lunch: 'Rajma Chawal, Salad, Papad', snacks: 'Cutlet & Coffee', dinner: 'Dosa, Tomato Chutney, Sambar' },
      { day: 'Sunday', breakfast: 'Chole Bhature, Lassi', lunch: 'Special Chicken / Paneer Biryani', snacks: 'Cake & Cold Coffee', dinner: 'Light Khichdi, Curd, Pickle' }
    ],
    polls: [
      {
        id: 'P1',
        title: "Tomorrow's Evening Snack Special",
        category: 'Snacks',
        closesAt: 'Today, 8:00 PM',
        status: 'Active',
        options: [
          { id: 'o1', label: 'Crispy Punjabi Samosa & Masala Chai', votes: ['S102', 'S103'] },
          { id: 'o2', label: 'Pani Puri / Bhel Counter', votes: ['S104'] },
          { id: 'o3', label: 'Veg Cheese Sandwich & Cold Coffee', votes: [] },
          { id: 'o4', label: 'Hot Onion Pakora & Filter Coffee', votes: [] }
        ]
      },
      {
        id: 'P2',
        title: 'Sunday Special Dinner Vote',
        category: 'Dinner',
        closesAt: 'Saturday, 6:00 PM',
        status: 'Active',
        options: [
          { id: 'o5', label: 'Hyderabadi Dum Biryani (Veg / Chicken) + Raita', votes: ['S102', 'S104'] },
          { id: 'o6', label: 'Butter Naan, Paneer Tikka & Dal Makhani', votes: ['S103'] },
          { id: 'o7', label: 'South Indian Mini Tiffin (Dosa, Idli, Pongal)', votes: [] }
        ]
      },
      {
        id: 'P3',
        title: 'Friday Breakfast Preference',
        category: 'Breakfast',
        closesAt: 'Thursday, 9:00 PM',
        status: 'Active',
        options: [
          { id: 'o8', label: 'Ghee Roast Dosa & Sambar', votes: ['S103'] },
          { id: 'o9', label: 'Aloo Paratha with Curd & Pickle', votes: ['S102'] },
          { id: 'o10', label: 'Poha, Jalebi & Sprouts', votes: [] }
        ]
      }
    ],
    dishSuggestions: [
      { id: 'DS1', studentName: 'Priya Sharma', room: 'G-108', dish: 'Maggie & Hot Chocolate on Rainy Evenings', category: 'Snacks', date: '2026-11-24', status: 'Pending' },
      { id: 'DS2', studentName: 'Karthik Raj', room: 'B-312', dish: 'Chole Bhature for Saturday Breakfast', category: 'Breakfast', date: '2026-11-23', status: 'Pending' }
    ],
    complaints: [
      { id: 'C101', studentId: 'S101', studentName: 'Arjun Kumar', room: 'B-204', category: 'Wi-Fi / Network', priority: 'High', description: 'Wi-Fi router on 2nd floor corridor drops connection every 15 minutes.', status: 'In Progress', date: '2026-11-24', remark: 'IT technician scheduled for 4 PM today.' },
      { id: 'C102', studentId: 'S103', studentName: 'Karthik Raj', room: 'B-312', category: 'Electrical', priority: 'Medium', description: 'Ceiling fan regulator is stuck on speed 1.', status: 'Pending', date: '2026-11-25', remark: '' },
      { id: 'C103', studentId: 'S102', studentName: 'Priya Sharma', room: 'G-108', category: 'Plumbing', priority: 'Low', description: 'Washbasin tap leaks slightly.', status: 'Resolved', date: '2026-11-21', remark: 'Washer replaced by plumber.' }
    ],
    outpasses: [
      { id: 'OP-8841', studentId: 'S101', studentName: 'Arjun Kumar', room: 'B-204', type: 'Weekend Home Leave', destination: 'Coimbatore (Home)', from: '2026-11-27 17:00', to: '2026-11-29 20:00', reason: 'Family function', parentPhone: '+91 98400 11223', status: 'Approved', adminNote: 'Verified with parent.' },
      { id: 'OP-8842', studentId: 'S103', studentName: 'Karthik Raj', room: 'B-312', type: 'Day Outpass', destination: 'T. Nagar Book Market', from: '2026-11-26 10:00', to: '2026-11-26 18:30', reason: 'Buying semester textbooks', parentPhone: '+91 94441 55667', status: 'Pending', adminNote: '' }
    ],
    notices: [
      { id: 'N1', title: 'Mess Food Voting Closes Daily at 8:00 PM', category: 'Mess', urgent: true, date: '2026-11-25', content: 'Students are requested to cast their votes for next day snacks and weekend special meals before 8:00 PM so the kitchen can plan ingredients and reduce food waste.' },
      { id: 'N2', title: 'Water Tank Cleaning — Block B', category: 'Maintenance', urgent: false, date: '2026-11-24', content: 'Overhead tank cleaning in Block B will take place on Thursday from 10:30 AM to 12:30 PM. Please store water accordingly.' },
      { id: 'N3', title: 'Hostel Night & Cultural Evening', category: 'Events', urgent: false, date: '2026-11-22', content: 'Annual Hostel Night is scheduled for Dec 5th at the main courtyard. Register for music, stand-up, or gaming events with your block rep.' }
    ],
    feedbacks: [
      { id: 'F1', studentName: 'Arjun Kumar', meal: 'Lunch', rating: 4, comment: 'Paneer curry was great today!', date: '2026-11-25' },
      { id: 'F2', studentName: 'Sneha Nair', meal: 'Snacks', rating: 5, comment: 'Hot samosas and ginger tea were awesome.', date: '2026-11-24' }
    ]
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const def = getDefaultData();
  saveData(def);
  return def;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || db));
  } catch (e) {}
}
