'use strict';
const express = require('express');
const {
  adminListPlaces, adminCreatePlace, adminUpdatePlace, adminDeletePlace,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminListUsers, adminSetUserStatus, adminDeleteUser,
} = require('../controllers/adminController');
const { authenticate }  = require('../middleware/authenticate');
const { requireRole }   = require('../middleware/requireRole');

const router = express.Router();

// All admin routes require JWT + admin role
router.use(authenticate);
router.use(requireRole('admin'));

/* ─── Places ────────────────────────────────────────────────── */
router.get('/places',         adminListPlaces);
router.post('/places',        adminCreatePlace);
router.put('/places/:id',     adminUpdatePlace);
router.delete('/places/:id',  adminDeletePlace);

/* ─── Categories ─────────────────────────────────────────────── */
router.post('/categories',        adminCreateCategory);
router.put('/categories/:id',     adminUpdateCategory);
router.delete('/categories/:id',  adminDeleteCategory);

/* ─── Users ──────────────────────────────────────────────────── */
router.get('/users',                    adminListUsers);
router.patch('/users/:id/status',       adminSetUserStatus);
router.delete('/users/:id',             adminDeleteUser);

module.exports = router;
