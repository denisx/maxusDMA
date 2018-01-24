'use strict';

const path = require('path');

exports.showIndex = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/', 'index.html'));
}

exports.showBenchmarks = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/', 'benchmarks.html'));
};

exports.showBenchmarksFilters = (req, res) => {
  // res.redirect('/filters');
  res.sendFile(path.join(__dirname, '../../public/', 'filters.html'));
};

exports.showBenchmarksResults = (req, res) => {
  // res.redirect('/filters');
  res.sendFile(path.join(__dirname, '../../public/', 'result.html'));
};

exports.showDashboards = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/', 'dashboards.html'));
}

exports.dirname = (req,res) => {
  res.send(__dirname);
}


