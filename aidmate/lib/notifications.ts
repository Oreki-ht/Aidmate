// filepath: g:\AidMate\aidmate\lib\notifications.ts
import webpush from 'web-push';
import prisma from './prisma';

// Set up VAPID keys (generate once and store securely)
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function sendNotificationToParamedic(paramedicId: string, caseId: string, caseDetails: any) {
  try {
    // Get paramedic's push subscription
    const paramedic = await prisma.user.findUnique({
      where: { id: paramedicId },
      select: { pushSubscription: true, name: true }
    });

    if (!paramedic?.pushSubscription) {
      console.log('No push subscription found for paramedic');
      return false;
    }

    const subscription = JSON.parse(paramedic.pushSubscription);
    
    // Prepare notification content
    const payload = JSON.stringify({
      title: 'New Case Assigned',
      body: `You've been assigned to a new case: ${caseDetails.patientName || 'Anonymous'} at ${caseDetails.location}.`,
      url: `/paramedic/case/${caseId}`
    });

    // Send notification
    await webpush.sendNotification(subscription, payload);
    console.log(`Notification sent to paramedic ${paramedic.name}`);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}