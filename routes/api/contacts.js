const express = require('express');
const schemas = require('../../schemas/contacts-chemas');
const ctrl = require('../../controllers/contacts-controller');
const { valBody } = require('../../decorators');
const { isBody, isValidId} = require('../../midlewares');
const router = express.Router();
const authenticate = require('../../midlewares/authenticate');



router.get('/', authenticate, ctrl.listContacts);

router.get('/:contactId', authenticate, isValidId, ctrl.getContactById);

router.post('/', authenticate, valBody(schemas.addSchema), ctrl.addContact);

router.delete('/:contactId', authenticate, isValidId, ctrl.removeContact);

router.put('/:contactId', authenticate, isBody, isValidId, valBody(schemas.addUpdateSchema), ctrl.updateContact);

router.patch('/:contactId/favorite', authenticate, isValidId, isBody, valBody(schemas.updateFavoriteSchema), ctrl.updateFavorite);

module.exports = router;
