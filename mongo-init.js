// MongoDB initialization script
db = db.getSiblingDB('taskmanagement');

// Create collections
db.createCollection('users');
db.createCollection('tasks');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "createdBy": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "dueDate": 1 });
db.tasks.createIndex({ "createdAt": -1 });

// Create default admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@taskmanagement.com",
  password: "$2a$10$8K1p/a0dURXAm7QiK9Z4Zu.WGJ2B2/XVZR5Kx5Kx5Kx5Kx5Kx5Kx5K", // password: Admin123!
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');