#!/usr/bin/env node

/**
 * Simple test script for Retail API endpoints
 * Run this script to test the retail API endpoints
 * 
 * Usage: node test-retail-api.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api/retail';

// Test data
const testData = {
  // Sample product data for testing
  sampleProduct: {
    title: 'Test Retail Product',
    description: 'This is a test retail product for API testing',
    category: 'Electronics',
    price: 299.99,
    stocks: 10,
    discount: 15,
    condition: 'New',
    auctionType: 'Retail',
    brand: 'TestBrand',
    model: 'TestModel',
    authenticity: 'authentic',
    tags: ['test', 'electronics', 'retail'],
    images: [{
      url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      alt: 'Test product image',
      isPrimary: true,
      order: 0
    }]
  }
};

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n🔍 Testing: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, {
        message: data.message,
        dataKeys: data.data ? Object.keys(data.data) : [],
        recordCount: data.data?.products?.length || data.data?.length || 'N/A'
      });
    } else {
      console.log(`❌ Error (${response.status}):`, data.message || data.error);
    }
    
    return { response, data };
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { error };
  }
}

// Test functions
async function testRetailProducts() {
  console.log('\n📦 Testing Retail Products Endpoints...');
  
  // Test get all retail products
  await makeRequest('/products');
  
  // Test with pagination
  await makeRequest('/products?page=1&limit=5');
  
  // Test with filters
  await makeRequest('/products?category=Electronics&minPrice=100&maxPrice=500');
  
  // Test with search
  await makeRequest('/products?search=test');
  
  // Test sorting
  await makeRequest('/products?sort=price_asc');
}

async function testFeaturedProducts() {
  console.log('\n⭐ Testing Featured Products...');
  await makeRequest('/products/featured');
  await makeRequest('/products/featured?limit=5');
}

async function testPopularProducts() {
  console.log('\n🔥 Testing Popular Products...');
  await makeRequest('/products/popular');
  await makeRequest('/products/popular?limit=5');
}

async function testProductsOnSale() {
  console.log('\n💰 Testing Products on Sale...');
  await makeRequest('/products/sale');
  await makeRequest('/products/sale?page=1&limit=5');
}

async function testCategoryProducts() {
  console.log('\n📂 Testing Products by Category...');
  await makeRequest('/products/category/Electronics');
  await makeRequest('/products/category/Watches');
}

async function testSearchProducts() {
  console.log('\n🔍 Testing Product Search...');
  await makeRequest('/products/search?q=test');
  await makeRequest('/products/search?q=electronics');
}

async function testRecommendations() {
  console.log('\n💡 Testing Product Recommendations...');
  await makeRequest('/products/recommendations');
  await makeRequest('/products/recommendations?limit=5');
}

async function testDashboardStats() {
  console.log('\n📊 Testing Dashboard Stats...');
  // Note: This requires authentication, so it will likely fail without a valid token
  await makeRequest('/dashboard/stats', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid-token-for-testing'
    }
  });
}

async function testAnalytics() {
  console.log('\n📈 Testing Analytics...');
  // Note: This requires authentication, so it will likely fail without a valid token
  await makeRequest('/analytics', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid-token-for-testing'
    }
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Retail API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('⚠️  Note: Some endpoints require authentication and will show 401 errors');
  
  try {
    await testRetailProducts();
    await testFeaturedProducts();
    await testPopularProducts();
    await testProductsOnSale();
    await testCategoryProducts();
    await testSearchProducts();
    await testRecommendations();
    await testDashboardStats();
    await testAnalytics();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('- Public endpoints should return 200 OK');
    console.log('- Protected endpoints will return 401 Unauthorized (expected)');
    console.log('- Check the server logs for any database connection issues');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:5001/health');
    if (response.ok) {
      console.log('✅ Server is running and healthy');
      return true;
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Make sure to start the server with: npm run dev');
    return false;
  }
}

// Run the tests
async function main() {
  console.log('🔧 Retail API Test Suite');
  console.log('========================');
  
  const serverRunning = await checkServerHealth();
  
  if (serverRunning) {
    await runTests();
  } else {
    console.log('\n🛑 Cannot run tests - server is not running');
    console.log('Please start the server first:');
    console.log('  cd backend');
    console.log('  npm run dev');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the main function
main().catch(console.error);
