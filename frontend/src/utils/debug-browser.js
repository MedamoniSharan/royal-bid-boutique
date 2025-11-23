// Debug function to test authentication
window.debugAuth = async () => {
  console.log("🔍 Testing authentication...");
  
  // Test registration
  const testUser = {
    firstName: "Debug",
    lastName: "User", 
    email: "debug@example.com",
    password: "DebugPass123",
    phone: "+1234567890"
  };
  
  console.log("📝 Testing registration...");
  try {
    const registerResponse = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerResponse.json();
    console.log("📝 Registration result:", registerData);
    
    if (registerData.success) {
      console.log("✅ User registered successfully!");
      
      // Test login
      console.log("🔑 Testing login...");
      const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      const loginData = await loginResponse.json();
      console.log("🔑 Login result:", loginData);
      
      if (loginData.success) {
        console.log("✅ Login successful!");
        console.log("🎫 Token:", loginData.data.token);
        
        // Store token for testing
        localStorage.setItem('token', loginData.data.token);
        localStorage.setItem('refreshToken', loginData.data.refreshToken);
        
        // Test protected endpoint
        console.log("🛡️ Testing protected endpoint...");
        const meResponse = await fetch('http://localhost:5001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`
          }
        });
        
        const meData = await meResponse.json();
        console.log("🛡️ Protected endpoint result:", meData);
        
        if (meData.success) {
          console.log("✅ Authentication working perfectly!");
        } else {
          console.log("❌ Protected endpoint failed");
        }
      } else {
        console.log("❌ Login failed:", loginData.message);
      }
    } else {
      console.log("❌ Registration failed:", registerData.message);
      if (registerData.errors) {
        console.log("❌ Validation errors:", registerData.errors);
      }
    }
    
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
};

// Debug function to test product creation with authentication
window.debugProductCreation = async () => {
  console.log("🔍 Debugging product creation...");
  
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  console.log("Auth token:", token ? "✅ Present" : "❌ Missing");
  
  if (!token) {
    console.log("❌ User not authenticated. Run debugAuth() first to create a test user.");
    return;
  }
  
  // Test API connection
  try {
    const response = await fetch('http://localhost:5001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log("✅ User authenticated:", user.data.user.email);
    } else {
      console.log("❌ Authentication failed:", response.status);
      return;
    }
  } catch (error) {
    console.log("❌ API connection failed:", error.message);
    return;
  }
  
  // Test product creation with minimal data
  const testProduct = {
    title: "Debug Test Product",
    description: "This is a test product for debugging purposes with sufficient description length",
    category: "Watches",
    price: 99.99,
    stocks: 1,
    discount: 0,
    condition: "New",
    auctionType: "Retail",
    brand: "Debug Brand",
    model: "Debug Model",
    authenticity: "unknown",
    tags: ["debug", "test"],
    images: [
      {
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        alt: "Debug test image",
        isPrimary: true
      }
    ]
  };
  
  console.log("📦 Test product data:", testProduct);
  
  try {
    const response = await fetch('http://localhost:5001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });
    
    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log("📡 Response body:", responseText);
    
    if (response.ok) {
      console.log("✅ Product created successfully!");
      const result = JSON.parse(responseText);
      console.log("📦 Created product:", result.data.product);
    } else {
      console.log("❌ Product creation failed");
      try {
        const error = JSON.parse(responseText);
        console.log("❌ Error details:", error);
      } catch (e) {
        console.log("❌ Raw error response:", responseText);
      }
    }
    
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
};

console.log("🔧 Debug functions loaded:");
console.log("  - debugAuth() - Test authentication (registration + login)");
console.log("  - debugProductCreation() - Test product creation (requires authentication)");
