'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id:{type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true},
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    emailAddress:{
      type    : DataTypes.STRING,
      isUnique : {
        msg: 'this email is taken. Please choose another one'
      },
      allowNull:false,
      validate:{
          isEmail : {
            msg: "it's not an email bro"
          }
      }
  },
    password: DataTypes.STRING
  }, {});
  User.associate = function(models) {
User.hasMany(models.Course)
  };
  return User;
};