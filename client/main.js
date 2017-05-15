import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';
import { Roles } from 'meteor/alanning:roles';
import Tasks from "../shared/tasks.collection";
import Attempts from "../shared/attempts.collection";

import './main.html';

Template.main.onCreated(function(){
  Session.set("registration", false);
  Meteor.subscribe("users");
  Meteor.subscribe("tasks");
  Meteor.subscribe("attempts");
});
Template.main.helpers({
  authorized(){
    return Meteor.userId() != null;
  },
  registration(){
    return Session.get("registration");
  }
});
Template.registerForm.events({
  'click #cancelRegistration'(event, instance){
    Session.set("registration", false);
  },
  'click #register'(event, instance){
    event.preventDefault();
    var username = instance.$("[name='login']").val();
    var password = instance.$("[name='password']").val();
    if (username == "" || password == null)
      return;
    Meteor.call("register", { username, password })
    Meteor.loginWithPassword(username, password)
    Session.set("registration", false);
  }
})
Template.loginForm.events({
  'click #startRegistration'(event, instance){
    Session.set("registration", true);
  },
  'click #login'(event, instance){
    event.preventDefault();
    var login = instance.$("[name='login']").val();
    var password = instance.$("[name='password']").val();
    if (login == "" || password == null)
      return;
    Meteor.loginWithPassword(login, password)
  }
})
Template.app.onCreated(function(){
  Session.set("currentTask", null);
  if (window.history.state != null && window.history.state.currentTask != null)
    Session.set("currentTask", window.history.state.currentTask);
  window.onpopstate = function(){
    Session.set("currentTask", null);
    if (window.history.state != null && window.history.state.currentTask != null)
      Session.set("currentTask", window.history.state.currentTask);
  }
  Session.set("adding", false);
})
Template.app.helpers({
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  },
  users(){
    return Meteor.users.find({}, {sort: { score: -1 }});
  },
  currentTask(){
    return Tasks.findOne(Session.get("currentTask"));
  },
  admin(){
    return Roles.userIsInRole(Meteor.userId(), "admin");
  },
  adding(){
    return Session.get("adding");
  },
  taskCompletion(task){
    var result = Attempts.find({task: task._id, userId: Meteor.userId()}).count();
    if (result == 0)
      return "default";
    else if (Attempts.findOne({task: task._id, userId: Meteor.userId(), success: true}) == null)
      return "danger";
    else
      return "success";
  },
  isCurrentUser(user){
    return user._id == Meteor.userId();
  }
});
Template.app.events({
  'click #exit'(event, instance){
    event.preventDefault();
    Meteor.logout();
  },
  'click .task-details'(event, instance){
    event.preventDefault();
    window.history.pushState({currentTask: instance.$(event.target).attr("data-id")}, "Задача", "/");
    Session.set("currentTask", instance.$(event.target).attr("data-id"));
  },
  'click #tasks tbody tr td'(event, instance){
    event.preventDefault();
    window.history.pushState({currentTask: instance.$(instance.$(event.target).parent("tr")).attr("data-id")}, "Задача", "/");
    Session.set("currentTask", instance.$(instance.$(event.target).parent("tr")).attr("data-id"));
  },
  'click #addTask'(event, instance){
    event.preventDefault();
    Meteor.call("addTask", {
      name: instance.$("[name='taskName']").val(),
      description: instance.$("[name='taskDescription']").val(),
      attachment: instance.$("[name='taskAttachment']").val(),
      category: instance.$("[name='taskCategory']").val(),
      flag: instance.$("[name='taskFlag']").val().toLowerCase().trim(),
      cost: parseInt(instance.$("[name='taskCost']").val())
    })
    instance.$("[name='taskName']").val("");
    instance.$("[name='taskDescription']").val("");
    instance.$("[name='taskAttachment']").val("");
    instance.$("[name='taskCategory']").val("");
    instance.$("[name='taskFlag']").val("");
    instance.$("[name='taskCost']").val("");
    Session.set("adding", false);
  },
  'click #adding'(event, instance){
    event.preventDefault();
    Session.set("adding", true);
  },
});
Template.taskDetails.onRendered(function(){
  Session.set("editing", false);
  Session.set("fail", false);
  Session.set("watchAttempts", false);
})
Template.taskDetails.helpers({
  watchAttempts(){
    return Session.get("watchAttempts");
  },
  attempts(){
    return Attempts.find({task: this.task._id})
  },
  editing(){
    return Session.get("editing")
  },
  admin(){
    return Roles.userIsInRole(Meteor.userId(), "admin");
  },
  taskCompletion(){
    var result = Attempts.find({task: this.task._id, userId: Meteor.userId()}).count();
    if (result == 0)
      return "default";
    else if (Attempts.findOne({task: this.task._id, userId: Meteor.userId(), success: true}) == null)
      return "danger";
    else
      return "success";
  },
  taskCompleted(){
    return Attempts.find({task: this.task._id, userId: Meteor.userId(), success: true}).count() > 0;
  },
  winners(){
    var winners = Attempts.find({task: this.task._id, success: true}).map(attempt => attempt.user).join(", ");
    return (winners == "") ? "Решивших нет. Станьте первым!" : "Решили: " + winners;
  },
  fail(){
    return Session.get("fail");
  },
});
Template.taskDetails.events({
  'click #watchAttempts'(event, instance){
    event.preventDefault();
    Session.set("watchAttempts", true);
  },
  'click .removeAttempt'(event, instance){
    event.preventDefault();
    Meteor.call("removeAttempt", {attempt: instance.$(event.target).attr("data-id")})
  },
  'click #removeTask'(event, instance){
    event.preventDefault();
    if (confirm('Удалить задание?')) {
      Meteor.call("removeTask", {task: Session.get("currentTask")});
      Session.set("currentTask", null);
    }
  },
  'click #surrenderTask'(event, instance){
    event.preventDefault();
    Meteor.call("surrenderTask", {task: Session.get("currentTask"), flag: instance.$("[name='flag']").val()}, function(error, result){
      if (!result)
        Session.set("fail", true);
    })
  },
  'click #editTask'(event, instance){
    event.preventDefault();
    Meteor.call("editTask", {
      task: Session.get("currentTask"),
      name: instance.$("[name='taskName']").val(),
      description: instance.$("[name='taskDescription']").val(),
      attachment: instance.$("[name='taskAttachment']").val(),
      category: instance.$("[name='taskCategory']").val(),
      flag: instance.$("[name='taskFlag']").val().toLowerCase().trim(),
      cost: parseInt(instance.$("[name='taskCost']").val())
    });
    Session.set("editing", false);
  },
  'click #editing'(event, instance){
    event.preventDefault();
    Session.set("editing", true);
  },
  'click .alert-dismissible .close'(event, instance){
    event.preventDefault();
    Session.set("fail", false);
  }
});