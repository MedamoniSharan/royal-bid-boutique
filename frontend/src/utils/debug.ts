// Test API connection
const testApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:5001/health');
    const data = await response.json();
    console.log('Backend health check:', data);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Test product creation
const testProductCreation = async () => {
  try {
    const testProduct = {
      title: 'Test Product',
      description: 'This is a test product',
      category: 'Electronics',
      price: 100,
      stocks: 5,
      discount: 0,
      condition: 'New',
      auctionType: 'Retail',
      tags: ['test'],
      images: []
    };

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();
    console.log('Product creation test:', data);
    return data;
  } catch (error) {
    console.error('Product creation test failed:', error);
    return null;
  }
};

// Export for use in browser console
window.testApiConnection = testApiConnection;
window.testProductCreation = testProductCreation;
