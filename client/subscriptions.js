import { Meteor } from 'meteor/meteor';

Meteor.startup(function(){
  Meteor.subscribe("users");
  Meteor.subscribe("tasks");
  Meteor.subscribe("attempts");
})