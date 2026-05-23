'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Customers', [
      {
        firstName: 'John Doe',
        lastName:'Johnson',
        userName:'johnny',
        phone:'1234567890',
        password:'123456',
        email:'john@.com',
        createdAt:new Date(),     
        updatedAt:new Date()
       
      },
        {
        firstName: 'vann Da',
        lastName:'smaith',
        userName:'sim',
        phone:'12345329',
        password:'124325',
        email:'smith@.com',
        createdAt:new Date(),     
        updatedAt:new Date()
       
      },
        {
        firstName: 'jenan li',
        lastName:'mana',
        userName:'jenan',
        phone:'1234567890',
        password:'123456',
        email:'john@.com',
        createdAt:new Date(),     
        updatedAt:new Date()
       
      },
       
    
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return queryInterface.bulkDelete('Customers', null, {});
  }
};
