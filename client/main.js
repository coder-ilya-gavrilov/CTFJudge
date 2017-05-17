import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';
import { Roles } from 'meteor/alanning:roles';
import Tasks from "../shared/tasks.collection";
import Attempts from "../shared/attempts.collection";
import { moment } from 'meteor/momentjs:moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Meteor } from 'meteor/meteor';

import './main.html';

Meteor.startup(function(){
  Meteor.subscribe("users");
  Meteor.subscribe("tasks");
  Meteor.subscribe("attempts");
})

FlowRouter.route('/', {
  name: 'home',
  action: function(params){
    if (Meteor.userId() != null)
      FlowRouter.go("tasks.list");
    else
      FlowRouter.go("login");
  }
});
FlowRouter.route('/login', {
  name: 'login',
  action: function(params){
    BlazeLayout.render("login")
  }
});
FlowRouter.route('/register', {
  name: 'register',
  action: function(params){
    BlazeLayout.render("register")
  }
});
FlowRouter.route('/logout', {
  name: 'logout',
  action: function(params){
    if (confirm("Вы точно хотите выйти?"))
      Meteor.logout(() => FlowRouter.go('home'));
    else
      FlowRouter.go('home');
  }
});
FlowRouter.route('/addTask', {
  name: 'tasks.addTask',
  action: function(params){
    BlazeLayout.render("layout", {menu: "menu", scoreboard: "scoreboard", body: "addTask"})
  }
});
FlowRouter.route('/tasks', {
  name: "tasks.list",
  action: function(params){
    BlazeLayout.render("layout", {menu: "menu", scoreboard: "scoreboard", body: "tasks"})
  }
});
FlowRouter.route('/tasks/:_id', {
  name: "tasks.showTask",
  action: function(params){
    BlazeLayout.render("layout", {menu: "menu", scoreboard: "scoreboard", body: "showTask"});
  }
});
FlowRouter.route('/tasks/:_id/edit', {
  name: "tasks.editTask",
  action: function(params){
    BlazeLayout.render("layout", {menu: "menu", scoreboard: "scoreboard", body: "editTask"});
  }
});
FlowRouter.route('/tasks/:_id/attempts', {
  name: "tasks.taskAttempts",
  action: function(params){
    BlazeLayout.render("layout", {menu: "menu", scoreboard: "scoreboard", body: "taskAttempts"});
  }
});

Template.registerHelper('isAdmin', function(){
  return Roles.userIsInRole(Meteor.userId(), "admin");
})
Template.registerHelper("prettifyDate", function(timestamp) {
    return moment(timestamp).format('DD.MM.YYYY HH:mm:ss');
});

Template.addTask.events({
  'click #addTask'(event, instance){
    event.preventDefault();
    Meteor.call("addTask", {
      name: instance.$("[name='taskName']").val(),
      description: instance.$("[name='taskDescription']").val(),
      attachment: instance.$("[name='taskAttachment']").val(),
      category: instance.$("[name='taskCategory']").val(),
      flag: instance.$("[name='taskFlag']").val().toLowerCase().trim(),
      cost: parseInt(instance.$("[name='taskCost']").val()),
      parent: instance.$("[name='taskParent']").val(),
      opened: instance.$("[name='taskOpened']").is(':checked')
    })
    FlowRouter.go('home');
  }
});
Template.addTask.helpers({
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  }
});

Template.tasks.helpers({
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  },
  taskCompletion(task){
    if (task.opened === false) 
      return "warning";
    var result = Attempts.find({task: task._id, userId: Meteor.userId()}).count();
    if (result == 0)
      return "default";
    else if (Attempts.findOne({task: task._id, userId: Meteor.userId(), success: true}) == null)
      return "danger";
    else
      return "success";
  }
});
Template.tasks.events({
  'click #tasks tbody tr td'(event, instance){
    FlowRouter.go('tasks.showTask', {_id: instance.$(event.target).parent("tr").attr("data-id")})
  },
});

Template.scoreboard.helpers({
  users(){
    return Meteor.users.find({}, {sort: { score: -1 }});
  },
  isCurrentUser(user){
    return user._id == Meteor.userId();
  }
});

Template.showTask.onRendered(function(){
  Session.set("taskFailed", false);
})
Template.showTask.helpers({
  taskCompletion(){
    if (Tasks.findOne(FlowRouter.getParam('_id')).opened === false)
      return "warning";
    var result = Attempts.find({task: FlowRouter.getParam('_id'), userId: Meteor.userId()}).count();
    if (result == 0)
      return "default";
    else if (Attempts.findOne({task: FlowRouter.getParam('_id'), userId: Meteor.userId(), success: true}) == null)
      return "danger";
    else
      return "success";
  },
  taskCompleted(){
    return Attempts.find({task: FlowRouter.getParam('_id'), userId: Meteor.userId(), success: true}).count() > 0;
  },
  winners(){
    var winners = Attempts.find({task: FlowRouter.getParam('_id'), success: true}).map(attempt => attempt.user).join(", ");
    return (winners == "") ? "Решивших нет. Станьте первым!" : "Решили: " + winners;
  },
  taskFailed(){
    return Session.get("taskFailed");
  },
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id'));
  }
});
Template.showTask.events({
  'click #surrenderTask'(event, instance){
    event.preventDefault();
    Meteor.call("surrenderTask", {task: FlowRouter.getParam("_id"), flag: instance.$("[name='flag']").val()}, function(error, result){
      if (!result)
        Session.set("taskFailed", true);
    })
  },
  'click .alert-dismissible .close'(event, instance){
    event.preventDefault();
    Session.set("fail", false);
  }
})

Template.editTask.helpers({
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id'));
  },
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  },
  taskOpened() {
    if (this.task.opened)
      return "checked";
    return "";
  },
  taskWithoutParent() {
    if (this.task.parent)
      return "selected";
    return "";
  },
  taskWithParent(parentTask) {
    if (this.task.parent == parentTask._id)
      return "selected";
    return "";
  },
  isDifferentTask(task) {
    return this.task._id != task._id;
  }
});
Template.editTask.events({
  'click #removeTask'(event, instance){
    event.preventDefault();
    if (confirm('Удалить задание?')) {
      Meteor.call("removeTask", {task: FlowRouter.getParam("_id")});
      FlowRouter.go('tasks.list');
    }
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
      cost: parseInt(instance.$("[name='taskCost']").val()),
      parent: instance.$("[name='taskParent']").val(),
      opened: instance.$("[name='taskOpened']").is(':checked')
    });
    FlowRouter.go('tasks.showTask', {_id: FlowRouter.getParam("_id")});
  }
});

Template.taskAttempts.helpers({
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id'));
  },
  attempts(){
    return Attempts.find({task: FlowRouter.getParam('_id')}, {sort: {timestamp: 1}})
  }
});
Template.taskAttempts.events({
  'click .removeAttempt'(event, instance){
    event.preventDefault();
    Meteor.call("removeAttempt", {attempt: instance.$(event.target).attr("data-id")})
  }
})

Template.register.events({
  'click #register'(event, instance){
    event.preventDefault();
    var username = instance.$("[name='login']").val().trim();
    var password = instance.$("[name='password']").val().trim();
    if (username == "" || password == null)
      return;
    Meteor.call("register", { username, password }, function(){
      Meteor.loginWithPassword(username, password, () => FlowRouter.go('home'));
    });
  }
})

Template.login.events({
  'click #login'(event, instance){
    event.preventDefault();
    var login = instance.$("[name='login']").val().trim();
    var password = instance.$("[name='password']").val().trim();
    if (login == "" || password == null)
      return;
    Meteor.loginWithPassword(login, password, () => FlowRouter.go('home'));
  }
})