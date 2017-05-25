import { Roles } from 'meteor/alanning:roles';
import Tasks from "/shared/tasks.collection";
import Attempts from "/shared/attempts.collection";

Meteor.startup(function(){
  Meteor.publish('users', function() {
    return Meteor.users.find({}, {fields: { username: 1, score: 1, visible: 1, lastSuccess: 1 }});
  });
  Meteor.publish('tasks', function(){
    if (Roles.userIsInRole(this.userId, "admin"))
      return Tasks.find({});
    else
      return Tasks.find({opened: true}, {fields: {name: 1, cost: 1, attachment: 1, description: 1, category: 1}});
  })
  Meteor.publish('attempts', function(){
    if (Roles.userIsInRole(this.userId, "admin"))
      return Attempts.find({});
    else
      return Attempts.find({}, {fields: {user: 1, success: 1, userId: 1, task: 1, timestamp: 1}});
  })
})