import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'; 
import { Roles } from 'meteor/alanning:roles';
import Tasks from "../shared/tasks.collection";
import Attempts from "../shared/attempts.collection";

Meteor.startup(() => {
  Accounts.onCreateUser((options, user) => {
    user.score = 0;
    return user;
  });
  Accounts.config({
    forbidClientAccountCreation: true
  });
  Meteor.methods({
    "register": function({ username, password }){
      var userId = Accounts.createUser({ username, password });
      if (username == "coder_ilya_gavrilov" || username == "nsychev")
        Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP);
    },
    "surrenderTask": function({ task, flag }){
      if (flag == "" || flag == null || Attempts.findOne({task: task, userId: this.userId, success: true}) != null)
        return;
      var task = Tasks.findOne(task);
      var attempt = {
        userId: this.userId,
        user: Meteor.users.findOne(this.userId).username,
        success: task.flag == flag.toLowerCase().trim(),
        flag,
        task: task._id
      }
      if (attempt.success)
        Meteor.users.update(this.userId, {$inc: {score: task.cost}});
      Attempts.insert(attempt);
      return attempt.success;
    },
    "addTask": function({ name, description, attachment, category, flag, cost }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      Tasks.insert({ name, description, attachment, category, flag, cost });
    },
    "editTask": function({ task, name, description, attachment, category, flag, cost }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      var myTask = Tasks.findOne(task);
      var delta = cost - myTask.cost;
      var attempts = Attempts.find({task, success: true}).fetch();
      for(var i = 0; i < attempts.length; i++)
        Meteor.users.update(attempts[i].userId, {$inc: {score: delta}});
      Tasks.update(task, { name, description, attachment, category, flag, cost })
    },
    "removeTask": function({ task }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      var attempts = Attempts.find({task}).fetch();
      for(var i = 0; i < attempts.length; i++) {
        if (attempts[i].success)
          Meteor.users.update(attempts[i].userId, {$inc: {score: -Tasks.findOne(attempts[i].task).cost}});
        Attempts.remove(attempts[i]);
      }
      Tasks.remove(task);
    },
    "removeAttempt": function({ attempt }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      var attempt = Attempts.findOne(attempt);
      if (attempt.success)
        Meteor.users.update(attempt.userId, {$inc: {score: -Tasks.findOne(attempt.task).cost}});
      Attempts.remove(attempt);
    }
  })
  Meteor.publish('users', function() {
    return Meteor.users.find({}, {fields: { username: 1, score: 1 }});
  });
  Meteor.publish('tasks', function(){
    if (Roles.userIsInRole(this.userId, "admin"))
      return Tasks.find({});
    else
      return Tasks.find({}, {fields: {name: 1, cost: 1, attachment: 1, description: 1, category: 1}});
  })
  Meteor.publish('attempts', function(){
    if (Roles.userIsInRole(this.userId, "admin"))
      return Attempts.find({});
    else
      return Attempts.find({}, {fields: {user: 1, success: 1, userId: 1, task: 1}});
  })
});
