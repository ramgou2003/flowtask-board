# VIDEC Task Board - Supabase Database Setup

## 🚀 Quick Setup Instructions

### Step 1: Run the Database Setup SQL

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your "Videc Task Board" project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the SQL**
   - Copy the entire content from `database-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

### Step 2: Verify the Setup

After running the SQL, you should see:
- ✅ "Projects table created successfully!" message
- ✅ Table structure displayed
- ✅ No errors in the output

### Step 3: Test the Application

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test the authentication flow**
   - Visit your app
   - You should see the login page
   - Create a new account or sign in
   - After authentication, you should see the dashboard

3. **Test project creation**
   - Create a new project
   - Verify it appears in the dashboard
   - Navigate to the project board
   - Create and manage tasks

## 🔐 Security Features Implemented

### Row Level Security (RLS)
- **Enabled on projects table**
- **Users can only access their own projects**
- **Automatic user isolation**

### Authentication Policies
- **Read/Write**: Users can only see and modify their own projects
- **Insert**: Users can only create projects for themselves
- **Delete**: Users can only delete their own projects

### Data Protection
- **User ID automatically set** from authenticated user
- **No cross-user data access possible**
- **Secure by default**

## 📊 Database Schema

### Projects Table
```sql
projects (
  id UUID PRIMARY KEY,           -- Unique project identifier
  user_id UUID,                  -- References auth.users(id)
  name TEXT NOT NULL,            -- Project name
  description TEXT,              -- Project description
  color TEXT DEFAULT '#3b82f6',  -- Project color
  board JSONB,                   -- Kanban board data (columns, tasks)
  created_at TIMESTAMP,          -- Creation timestamp
  updated_at TIMESTAMP           -- Last update timestamp
)
```

### Board JSONB Structure
```json
{
  "columns": [
    {
      "id": "todo",
      "title": "To Do",
      "tasks": [
        {
          "id": "task-1",
          "title": "Task Title",
          "description": "Task Description",
          "priority": "medium",
          "dueDate": "2025-01-01",
          "assignee": "User Name"
        }
      ]
    }
  ],
  "lastUpdated": "2025-08-21T18:00:00.000Z"
}
```

## 🔄 Migration from localStorage

The app has been updated to:
- ✅ **Replace localStorage** with Supabase database
- ✅ **Maintain all existing functionality**
- ✅ **Add user authentication**
- ✅ **Implement data isolation**
- ✅ **Preserve UI/UX**

## 🛠️ Troubleshooting

### If you see authentication errors:
1. Check that the Supabase URL and anon key are correct in `src/lib/supabase.ts`
2. Verify email authentication is enabled in Supabase Auth settings

### If projects don't save:
1. Ensure the SQL setup completed successfully
2. Check browser console for any errors
3. Verify RLS policies are active

### If you can't see other users' projects:
This is **expected behavior**! The security system prevents users from accessing each other's data.

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database setup completed successfully
3. Ensure you're signed in with a valid account
