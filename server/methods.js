import { Roles } from 'meteor/alanning:roles';
import Tasks from "../shared/tasks.collection";
import Attempts from "../shared/attempts.collection";

Meteor.startup(function(){
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
        task: task._id,
        timestamp: Date.now()
      }
      if (attempt.success)
        Meteor.users.update(this.userId, {$inc: {score: task.cost}});
      else
        Meteor.users.update(this.userId, {$inc: {score: -task.penalty}});
      Attempts.insert(attempt);
      for (let newTask of Tasks.find({parent: task._id}).fetch()) {
        Tasks.update(newTask._id, {$set: {opened: true}});
      }
      return attempt.success;
    },
    "addTask": function({ name, description, attachment, category, flag, cost, penalty, parent, opened }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      Tasks.insert({ name, description, attachment, category, flag, cost, penalty, parent, opened });
    },
    "editTask": function({ task, name, description, attachment, category, flag, cost, penalty, parent, opened }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      let myTask = Tasks.findOne(task);
      let costDelta = cost - myTask.cost;
      let penaltyDelta = penalty - myTask.penalty;
      let attempts = Attempts.find({task}).fetch();
      for (let i = 0; i < attempts.length; i++)
        if (attempts[i].success)
          Meteor.users.update(attempts[i].userId, {$inc: {score: costDelta}});
        else
          Meteor.users.update(attempts[i].userId, {$inc: {score: -penaltyDelta}});
      Tasks.update(task, { name, description, attachment, category, flag, cost, penalty, parent, opened });
    },
    "removeTask": function({ task }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      let attempts = Attempts.find({task}).fetch();
      let myTask = Tasks.findOne(task);
      for (let attempt of attempts) {
        if (attempt.success)
          Meteor.users.update(attempt.userId, {$inc: {score: -myTask.cost}});
        else
          Meteor.users.update(attempt.userId, {$inc: {score: myTask.penalty}});
        Attempts.remove(attempt);
      }
      Tasks.remove(task);
    },
    "removeAttempt": function({ attempt }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      let myAttempt = Attempts.findOne(attempt);
      let myTask = Tasks.findOne(myAttempt.task);
      if (myAttempt.success)
        Meteor.users.update(myAttempt.userId, {$inc: {score: -myTask.cost}});
      else
        Meteor.users.update(myAttempt.userId, {$inc: {score: myTask.penalty}});
      Attempts.remove(attempt);
    },
    "changeVisibility": function({ userId, visibility }) {
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      Meteor.users.update(userId, {$set: {visible: visibility}});
    }
  })
})