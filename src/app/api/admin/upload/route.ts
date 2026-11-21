import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage, deleteImage, isCloudinaryUrl } from '@/lib/cloudinary';
import { validateImageBuffer, sanitizeFilename } from '@/lib/imageValidator';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      logger.security('Unauthorized image upload attempt', {
        user: session?.user?.email || 'unauthenticated',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer for deep magic-byte inspection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cryptographic & Magic-Byte File Validation
    const validation = validateImageBuffer(buffer);
    if (!validation.valid) {
      logger.security('Rejected suspicious or invalid file upload', {
        user: session.user.email,
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: buffer.length,
        reason: validation.error,
      });
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitizedName = sanitizeFilename(file.name);

    // Construct base64 data URI using strictly VERIFIED MIME type (never trust client file.type)
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${validation.mimeType};base64,${base64Data}`;

    // Upload to Cloudinary under the "products" folder
    const secureUrl = await uploadImage(dataUri, 'products');

    logger.info('Product image successfully uploaded', {
      user: session.user.email,
      format: validation.format,
      width: validation.width,
      height: validation.height,
      sanitizedName,
    });

    return NextResponse.json(
      {
        url: secureUrl,
        format: validation.format,
        width: validation.width,
        height: validation.height,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logger.error('Cloudinary upload route error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      logger.security('Unauthorized image delete attempt', {
        user: session?.user?.email || 'unauthenticated',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    // Only allow deleting cloudinary images
    if (!isCloudinaryUrl(url)) {
      return NextResponse.json(
        { error: 'Only Cloudinary images can be deleted' },
        { status: 400 }
      );
    }

    await deleteImage(url);

    logger.info('Cloudinary image deleted', {
      user: session.user.email,
      url,
    });

    return NextResponse.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (error: unknown) {
    logger.error('Cloudinary delete route error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image deletion failed' },
      { status: 500 }
    );
  }
}
