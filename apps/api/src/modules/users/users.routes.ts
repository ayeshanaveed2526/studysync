import { Router } from 'express';
import multer from 'multer';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from '@studysync/types';
import { AppError } from '../../middleware/error';

const router = Router();

// Multer memory configuration for avatar images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// Protect all users routes
router.use(authenticate);

router.get('/me', usersController.getMe);
router.patch('/me', validate(updateProfileSchema), usersController.updateMe);
router.post(
  '/me/avatar',
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          next(AppError.badRequest(`Avatar upload error: ${err.message}`, 'UPLOAD_ERROR'));
        } else {
          next(AppError.badRequest(err.message, 'UPLOAD_ERROR'));
        }
        return;
      }
      next();
    });
  },
  usersController.uploadAvatar
);

export default router;
