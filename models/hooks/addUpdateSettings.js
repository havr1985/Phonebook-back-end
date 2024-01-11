const addUpdateSettings = function (next) {
    this.options.new = true;
    this.options.runValidators = true;
    next();
}

module.exports = addUpdateSettings;