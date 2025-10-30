// src/posts.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([]);
});

// flesh these out later:
// router.post('/', ...)
// router.get('/:id', ...)
// router.put('/:id', ...)
// router.delete('/:id', ...)

module.exports = router;
