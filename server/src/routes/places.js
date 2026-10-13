'use strict';
const express = require('express');
const { listPlaces, getPlace } = require('../controllers/placesController');

const router = express.Router();

router.get('/',          listPlaces);
router.get('/:slugOrId', getPlace);

module.exports = router;
