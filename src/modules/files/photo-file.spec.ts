import { isPhotoFile, preparePhotoFile } from './photo-file';

describe('photo file acceptance', () => {
  it('accepts gallery and camera image mime types', () => {
    expect(isPhotoFile({ mimetype: 'image/jpeg', originalname: 'image.jpg' })).toBe(true);
    expect(isPhotoFile({ mimetype: 'image/png', originalname: 'shot.png' })).toBe(true);
    expect(isPhotoFile({ mimetype: 'image/webp', originalname: 'gallery.webp' })).toBe(true);
    expect(isPhotoFile({ mimetype: 'image/heic', originalname: 'IMG.HEIC' })).toBe(true);
    expect(isPhotoFile({ mimetype: 'image/jpeg', originalname: 'blob' })).toBe(true);
    expect(isPhotoFile({ mimetype: 'image/jpeg', originalname: '' })).toBe(true);
  });

  it('accepts phone uploads that only have an image extension', () => {
    expect(
      isPhotoFile({ mimetype: 'application/octet-stream', originalname: 'camera.jpg' }),
    ).toBe(true);
    expect(isPhotoFile({ mimetype: '', originalname: 'photo.PNG' })).toBe(true);
  });

  it('rejects non-photo files', () => {
    expect(isPhotoFile({ mimetype: 'application/pdf', originalname: 'notes.pdf' })).toBe(false);
    expect(isPhotoFile({ mimetype: 'text/plain', originalname: 'notes.txt' })).toBe(false);
    expect(isPhotoFile({ mimetype: '', originalname: 'blob' })).toBe(false);
  });

  it('fills a filename for camera blobs that have no extension', () => {
    const file = preparePhotoFile({
      mimetype: 'image/jpeg',
      originalname: 'blob',
    } as Express.Multer.File);

    expect(file.originalname).toBe('photo.jpg');
    expect(file.mimetype).toBe('image/jpeg');
  });
});
