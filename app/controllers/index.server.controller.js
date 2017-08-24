'use strict';

const path = require('path');
exports.showIndex = function (req, res) {
  res.sendFile(path.join(__dirname, '../../public/', 'index.html'));
};

exports.showCustom = (req, res) => {
	res.sendFile(path.join(__dirname, '../../public/', 'custom.html'));
};

