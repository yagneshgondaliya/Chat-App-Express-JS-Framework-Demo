'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    
    static associate(models) {
      this.belongsTo(models.User,{foreignKey:'userId'});
      // this.belongsTo(models.User,{foreignKey:'recieverId'});
    }
  }
  Chat.init({
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model:'Users',
        key: 'id'
      },
      allowNull: true,
      onDelete:"CASCADE"
    },
    recieverId: {
      type: DataTypes.INTEGER,
      references: {
        model:'Users',
        key: 'id'
      },
      allowNull: true,
      onDelete:"CASCADE"
    },
    message: {
      type: DataTypes.STRING
    },
    status:{
      type:DataTypes.TINYINT,
      comment:'READ = 1,UNREAD = 0'
    },
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};