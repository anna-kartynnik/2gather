
function loadConfig(path) {
  require('dotenv').config({
    path: path
  });
}

exports.loadConfig = loadConfig;