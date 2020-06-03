'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id:{type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true},
    title:{
      type:DataTypes.STRING,
      allowNull:false,
    } ,
    description: {
      type:DataTypes.STRING,
      allowNull:false,
    },
    estimatedTime:{
      type:DataTypes.STRING,
      allowNull:true,
    },
    materialsNeeded:{
      type:DataTypes.STRING,
      allowNull:true,
    },
    userId: {
      type:DataTypes.INTEGER,
      allowNull:false,
    }
  }, {});
  Course.associate = function(models) {
  Course.belongsTo(models.User);
  };
  return Course;
};