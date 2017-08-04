import { Roles } from 'meteor/alanning:roles';
import Tasks from "../shared/tasks.collection";
import Attempts from "../shared/attempts.collection";

Meteor.startup(function(){
  Meteor.methods({
    "register": function({ username, password }){
      let userId = Accounts.createUser({ username, password });
      if (username == "coder_ilya_gavrilov" || username == "nsychev")
        Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP);
    },
    "submitTask": function({ taskId, flag }){
      if (flag == "" || flag === null || Attempts.findOne({task: taskId, userId: this.userId, success: true}) !== null)
        return;
      let task = Tasks.findOne(taskId);
      let attempt = {
        userId: this.userId,
        user: Meteor.users.findOne(this.userId).username,
        success: task.flag == flag.toLowerCase().trim(),
        flag,
        task: taskId,
        timestamp: Date.now()
      };
      if (attempt.success)
        Meteor.users.update(this.userId, {$inc: {score: task.cost}, $set: {lastSuccess: Date.now()}});
      else
        Meteor.users.update(this.userId, {$inc: {score: -task.penalty}});
      Attempts.insert(attempt);
      for (let newTask of Tasks.find({parent: taskId}).fetch()) {
        Tasks.update(newTask._id, {$set: {opened: true}});
      }
      return attempt.success;
    },
    "addTask": function({ name, description, attachment, category, flag, cost, penalty, parent, opened }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      Tasks.insert({ name, description, attachment, category, flag, cost, penalty, parent, opened });
    },
    "editTask": function({ taskId, name, description, attachment, category, flag, cost, penalty, parent, opened }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      let task = Tasks.findOne(taskId);
      let costDelta = cost - task.cost;
      let penaltyDelta = penalty - task.penalty;
      let attempts = Attempts.find({task: taskId}).fetch();
      for (let i = 0; i < attempts.length; i++)
        if (attempts[i].success)
          Meteor.users.update(attempts[i].userId, {$inc: {score: costDelta}});
        else
          Meteor.users.update(attempts[i].userId, {$inc: {score: -penaltyDelta}});
      Tasks.update(taskId, { name, description, attachment, category, flag, cost, penalty, parent, opened });
    },
    "removeTask": function({ taskId }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      let attempts = Attempts.find({task: taskId}).fetch();
      let task = Tasks.findOne(taskId);
      for (let attempt of attempts) {
        if (attempt.success)
          Meteor.users.update(attempt.userId, {$inc: {score: -task.cost}});
        else
          Meteor.users.update(attempt.userId, {$inc: {score: task.penalty}});
        Attempts.remove(attempt);
      }
      Tasks.remove(task);
    },
    "removeAttempt": function({ attemptId }){
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      let attempt = Attempts.findOne(attemptId);
      let task = Tasks.findOne(attempt.task);
      if (attempt.success)
        Meteor.users.update(attempt.userId, {$inc: {score: -task.cost}});
      else
        Meteor.users.update(attempt.userId, {$inc: {score: task.penalty}});
      Attempts.remove(attemptId);
    },
    "changeVisibility": function({ userId, visibility }) {
      if (!Roles.userIsInRole(this.userId, "admin"))
        return;
      Meteor.users.update(userId, {$set: {visible: visibility}});
    }
  })
});