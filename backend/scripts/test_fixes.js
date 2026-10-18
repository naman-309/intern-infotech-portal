const fs = require('fs');

async function testAllFixes() {
  const baseURL = 'http://localhost';
  console.log('=== VERIFYING ANNOUNCEMENT EMAIL & PROFILE UPLOAD FIXES ===\n');

  // 1. Admin Login
  console.log('1. Logging in as Admin...');
  const adminLoginRes = await fetch(`${baseURL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@infotech.edu',
      password: 'SecurePass@2026',
    }),
  });
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  const adminData = await adminLoginRes.json();
  console.log('   Admin logged in:', adminData?.data?.user?.email);

  // 2. Create Announcement with sendEmailNotification: true
  console.log('\n2. Creating an Announcement with sendEmailNotification: true...');
  const announcementPayload = {
    title: 'Urgent: Campus Placement Drive 2026',
    content: 'All eligible students must attend the technical evaluation session scheduled for tomorrow at 10:00 AM IST.',
    priority: 'HIGH',
    targetScope: 'ALL',
    sendEmailNotification: true,
  };

  const createAnnounceRes = await fetch(`${baseURL}/api/v1/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify(announcementPayload),
  });

  const announceResult = await createAnnounceRes.json();
  console.log('   Create Announcement HTTP Status:', createAnnounceRes.status);
  console.log('   Announcement ID:', announceResult?.data?.announcement?.id);
  console.log('   Announcement Title:', announceResult?.data?.announcement?.title);

  // 3. Student Login & Multipart Avatar Upload
  console.log('\n3. Logging in as Student...');
  const studentLoginRes = await fetch(`${baseURL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@infotech.edu',
      password: 'SecurePass@2026',
    }),
  });
  const studentCookie = studentLoginRes.headers.get('set-cookie');
  const studentData = await studentLoginRes.json();
  console.log('   Student logged in:', studentData?.data?.user?.email);

  // Create a minimal 1x1 valid PNG image buffer
  // PNG 1x1 transparent pixel in Base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imgBuffer = Buffer.from(pngBase64, 'base64');

  console.log('\n4. Testing Direct Profile Image Upload (multipart/form-data)...');
  const formData = new FormData();
  formData.append('phone', '+91 98765 43210');
  formData.append('guardianName', 'Ramesh Sharma');
  formData.append('guardianPhone', '+91 98765 00000');
  formData.append('address', 'Tech Tower 4B, Silicon Nagar');
  const blob = new Blob([imgBuffer], { type: 'image/png' });
  formData.append('avatar', blob, 'passport_photo.png');

  const uploadRes = await fetch(`${baseURL}/api/v1/profile`, {
    method: 'PUT',
    headers: {
      Cookie: studentCookie,
    },
    body: formData,
  });

  const uploadResult = await uploadRes.json();
  console.log('   Profile Upload HTTP Status:', uploadRes.status);
  console.log('   Profile Upload Message:', uploadResult.message);
  console.log('   Updated Avatar URL:', uploadResult?.data?.user?.avatarUrl);
  console.log('   Updated Phone:', uploadResult?.data?.user?.phone);

  // 5. Wait 3 seconds for Redis Pub/Sub transmission & Subscriber processing
  console.log('\n5. Waiting 3 seconds for Redis email subscriber to process announcement emails...');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('\n=== VERIFICATION COMPLETE ===');
}

testAllFixes().catch((err) => {
  console.error('Test execution failed:', err);
});
