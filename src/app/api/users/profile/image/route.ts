import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getBearerSession } from '@/lib/mobile-auth';
import { NextRequest } from 'next/server';
import { uploadImage, deleteImage, isCloudinaryUrl } from '@/lib/cloudinary';
import { validateImageBuffer } from '@/lib/imageValidator';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req, 'POST, OPTIONS');
  try {
    const session = await getBearerSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400, headers: cors });
    }

    // Extract raw base64 data and inspect magic bytes
    const base64Clean = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const buffer = Buffer.from(base64Clean, 'base64');

    const validation = validateImageBuffer(buffer, 3 * 1024 * 1024); // 3MB limit for profile images
    if (!validation.valid) {
      logger.security('Rejected invalid profile image upload', {
        userId: session.user.id,
        reason: validation.error,
      });
      return NextResponse.json({ success: false, error: validation.error }, { status: 400, headers: cors });
    }

    await connectToDatabase();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    if (isCloudinaryUrl(user.image)) {
      try {
        await deleteImage(user.image);
      } catch (err) {
        logger.error('Failed to delete old Cloudinary image', err);
      }
    }

    const secureUrl = await uploadImage(imageBase64, 'users');

    user.image = secureUrl;
    await user.save();

    logger.info('User profile image updated', {
      userId: session.user.id,
      format: validation.format,
    });

    return NextResponse.json({ success: true, imageUrl: secureUrl }, { headers: cors });
  } catch (error: unknown) {
    logger.error('[POST /api/users/profile/image]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req, 'POST, OPTIONS');
}
