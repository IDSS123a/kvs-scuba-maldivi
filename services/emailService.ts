/**
 * Email Notification Service
 * Handles sending email notifications for attendance confirmation, updates, etc.
 */

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  type: 'attendance' | 'update' | 'reminder' | 'confirmation';
}

/**
 * Send email notification
 * In production, this should call a backend API or Supabase Edge Function
 * For now, it logs to console and stores in localStorage
 */
export async function sendEmailNotification(payload: EmailPayload): Promise<boolean> {
  try {
    console.log('📧 Email Service: Attempting to send email', {
      to: payload.to,
      subject: payload.subject,
      type: payload.type,
      timestamp: new Date().toISOString()
    });

    // Validate email
    if (!payload.to || !payload.to.includes('@')) {
      console.error('❌ Invalid email address:', payload.to);
      return false;
    }

    // Log to localStorage for audit trail
    const emailLogs = JSON.parse(localStorage.getItem('kvs_email_logs') || '[]');
    emailLogs.push({
      to: payload.to,
      subject: payload.subject,
      type: payload.type,
      status: 'sent',
      timestamp: new Date().toISOString(),
      body: payload.body.substring(0, 100) + '...'
    });
    localStorage.setItem('kvs_email_logs', JSON.stringify(emailLogs));

    // In production, make API call here:
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
    // return response.ok;

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('✅ Email sent successfully to:', payload.to);
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}


/**
 * Send trip update email
 */
export async function sendTripUpdateEmail(userEmail: string, subject: string, message: string): Promise<boolean> {
  return sendEmailNotification({
    to: userEmail,
    subject: `KVS SCUBA Maldives 2026 - ${subject}`,
    body: message,
    type: 'update'
  });
}

/**
 * Send pre-trip reminder
 */
export async function sendPreTripReminderEmail(userEmail: string, userName: string): Promise<boolean> {
  return sendEmailNotification({
    to: userEmail,
    subject: 'Podsjetnik: Maldives 2026 - Brojanje Dana! | Reminder: Maldives 2026 - Days Away!',
    body: `
Zdravo ${userName}!

🌊 KVS SCUBA Maldives 2026 expedicija počinje uskoro!

Pripremite se:
✅ Provjera pasoša
✅ Osiguranje (DAN rekomendiran)
✅ Provjera opreme
✅ e-SIM ili međunarodni plan
✅ USD novčanice (novije od 2013)

Vidimo se u Maldivima!

---
Hello ${userName}!

🌊 The KVS SCUBA Maldives 2026 expedition is coming soon!

Get ready:
✅ Passport check
✅ Insurance (DAN recommended)
✅ Equipment check
✅ e-SIM or international plan
✅ USD bills (newer than 2013)

See you in the Maldives!
    `,
    type: 'reminder'
  });
}
