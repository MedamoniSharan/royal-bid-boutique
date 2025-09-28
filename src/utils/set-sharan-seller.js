// Script to find and update sharan user to seller role
const findAndUpdateSharanUser = async () => {
  console.log("🔍 Looking for sharan user...");
  
  try {
    // First, let's check if we can connect to the database directly
    // We'll use the API to search for users
    console.log("📡 Searching for users with 'sharan' in email or name...");
    
    // Since we don't have a direct user search endpoint, let's try to find the user
    // by attempting to log in with common email patterns
    
    const possibleEmails = [
      'sharan@example.com',
      'sharan@gmail.com', 
      'm.sharan@example.com',
      'm.sharan@gmail.com',
      'sharan@royalbidboutique.com'
    ];
    
    let foundUser = null;
    
    for (const email of possibleEmails) {
      console.log(`🔍 Trying email: ${email}`);
      
      try {
        // Try to get user info (this will fail if user doesn't exist or wrong password)
        const response = await fetch('http://localhost:5001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("✅ Found current user:", userData.data.user);
          
          if (userData.data.user.email.toLowerCase().includes('sharan') || 
              userData.data.user.firstName.toLowerCase().includes('sharan') ||
              userData.data.user.lastName.toLowerCase().includes('sharan')) {
            foundUser = userData.data.user;
            break;
          }
        }
      } catch (error) {
        // Continue to next email
      }
    }
    
    if (foundUser) {
      console.log("✅ Found sharan user:", foundUser);
      
      // Update user role to seller
      console.log("🔄 Updating user role to seller...");
      
      const updateResponse = await fetch(`http://localhost:5001/api/users/${foundUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          role: 'seller'
        })
      });
      
      const updateData = await updateResponse.json();
      console.log("📡 Update response:", updateData);
      
      if (updateData.success) {
        console.log("✅ Successfully updated sharan user to seller role!");
        console.log("👤 Updated user:", updateData.data.user);
      } else {
        console.log("❌ Failed to update user role:", updateData.message);
      }
      
    } else {
      console.log("❌ Could not find sharan user");
      console.log("💡 Suggestions:");
      console.log("  1. Make sure you're logged in as the sharan user");
      console.log("  2. Check if the email contains 'sharan'");
      console.log("  3. Try logging in first, then run this script");
    }
    
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
};

// Alternative: Create a new sharan user with seller role
const createSharanSeller = async () => {
  console.log("👤 Creating new sharan user with seller role...");
  
  const sharanUser = {
    firstName: "Sharan",
    lastName: "User",
    email: "sharan@example.com",
    password: "SharanPass123",
    phone: "+1234567890",
    role: "seller"
  };
  
  try {
    const response = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sharanUser)
    });
    
    const data = await response.json();
    console.log("📡 Registration response:", data);
    
    if (data.success) {
      console.log("✅ Sharan user created successfully with seller role!");
      console.log("🎫 Token:", data.data.token);
      
      // Store the token
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      console.log("🔑 You can now use this account to create products!");
    } else {
      console.log("❌ Failed to create sharan user:", data.message);
      if (data.errors) {
        console.log("❌ Validation errors:", data.errors);
      }
    }
    
  } catch (error) {
    console.log("❌ Error creating user:", error.message);
  }
};

// Make functions available globally
window.findAndUpdateSharanUser = findAndUpdateSharanUser;
window.createSharanSeller = createSharanSeller;

console.log("🔧 Sharan user management functions loaded:");
console.log("  - findAndUpdateSharanUser() - Find existing sharan user and update to seller");
console.log("  - createSharanSeller() - Create new sharan user with seller role");
