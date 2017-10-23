'use strict';

const path = require('path');
exports.showIndex = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/', 'index.html'));
};

exports.showFilters = (req, res) => {
  // res.redirect('/filters');
  res.sendFile(path.join(__dirname, '../../public/', 'filters.html'));
};

