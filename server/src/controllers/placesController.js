'use strict';
/**
 * placesController.js — Thin controller for public place endpoints.
 */
const PlaceService = require('../services/PlaceService');

async function listPlaces(req, res, next) {
  try {
    const places = await PlaceService.listPlaces({
      category: req.query.category,
      q:        req.query.q,
    });
    res.json(places);
  } catch (err) {
    next(err);
  }
}

async function getPlace(req, res, next) {
  try {
    const place = await PlaceService.getPlace(req.params.slugOrId);
    res.json(place);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPlaces, getPlace };
