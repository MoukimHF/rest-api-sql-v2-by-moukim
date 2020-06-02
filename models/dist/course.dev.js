'use strict';

module.exports = function (sequelize, DataTypes) {
  var Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});

  Course.associate = function (models) {
    Course.belongsTo(models.User);
  };

  return Course;
};