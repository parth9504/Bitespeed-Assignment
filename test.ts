//a test file to verify the working of the api..


async function testIdentify(testName: string, payload: object) {
  console.log(`\n--- Running ${testName} ---`);
  console.log("Request Payload:", payload);

  try {
    const response = await fetch('http://localhost:3000/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.dir(data, { depth: null, colors: true });
  } catch (error) {
    console.error("Test failed to execute:", error);
  }
}

async function runAllTests() {
  // Test 1: First purchase creates a new primary contact 
  await testIdentify("Test 1: Create New Primary Contact", {
    email: "lorraine@hillvalley.edu",
    phoneNumber: "123456"
  });

  // Test 2: Second purchase uses same phone but new email, creating a secondary contact 
  await testIdentify("Test 2: Create Secondary Contact", {
    email: "mcfly@hillvalley.edu",
    phoneNumber: "123456"
  });

  // Test 3: Third purchase uses only existing info, should just return the consolidated payload 
  await testIdentify("Test 3: Query with Partial Existing Info", {
    email: null,
    phoneNumber: "123456"
  });

  // Test 4: Create a completely new, independent primary contact (George)
  await testIdentify("Test 4: Create Independent Primary (George)", {
    email: "george@hillvalley.edu",
    phoneNumber: "919191"
  });

  // Test 5: Create another independent primary contact (Biff)
  await testIdentify("Test 5: Create Independent Primary (Biff)", {
    email: "biffsucks@hillvalley.edu",
    phoneNumber: "717171"
  });

  // Test 6:
  // Incoming request links George's email with Biff's phone number.
  // Biff's row should become secondary to George's row.
  await testIdentify("Test 6: Merge Primary Contacts", {
    email: "george@hillvalley.edu",
    phoneNumber: "717171"
  });
}

runAllTests();