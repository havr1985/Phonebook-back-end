const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/auth');
const { valBody } = require('../../decorators');
const { schemas } = require('../../models/user');
const { authenticate, upload, sizeChange } = require('../../midlewares');


router.post('/register', valBody(schemas.registerSchema), ctrl.register);
router.get('/verify/:verificationToken', ctrl.verify);
router.post('/verify', valBody(schemas.userEmailSchema), ctrl.resendVerify);
router.post('/login', valBody(schemas.loginSchema), ctrl.login);
router.post('/logout', authenticate, ctrl.logout);
router.get('/current', authenticate, ctrl.current);
router.patch('/users', authenticate, valBody(schemas.subscriptionSchema), ctrl.updateSubscription);
router.patch('/users/avatars', authenticate, upload.single('avatar'), sizeChange, ctrl.updateAvatar);
 

module.exports = router;