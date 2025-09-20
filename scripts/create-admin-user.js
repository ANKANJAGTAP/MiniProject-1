const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser(email, password) {
  try {
    console.log(`Creating admin user: ${email}`);
    
    // Create user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        role: 'admin'
      },
      user_metadata: {
        name: 'Admin User'
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('User ID:', user.user.id);
    console.log('Email:', user.user.email);
    console.log('Role:', user.user.app_metadata.role);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateUserToAdmin(email) {
  try {
    console.log(`Updating user to admin: ${email}`);
    
    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error('User not found:', email);
      return;
    }

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error updating user:', error);
      return;
    }

    console.log('✅ User updated to admin successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.app_metadata.role);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Command line usage
const command = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (command === 'create' && email && password) {
  createAdminUser(email, password);
} else if (command === 'update' && email) {
  updateUserToAdmin(email);
} else {
  console.log('Usage:');
  console.log('  Create new admin user: node scripts/create-admin-user.js create admin@example.com password123');
  console.log('  Update existing user to admin: node scripts/create-admin-user.js update user@example.com');
}