import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

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
FlowRouter.route('/scoreboard', {
  name: 'scoreboard',
  action: function(params){
    BlazeLayout.render("layout", {menu: "menu", body: "scoreboard", fullTable: true});
  }
});
FlowRouter.route('/users/:_id', {
  name: 'users.showUser',
  action: function(params){
    BlazeLayout.render("layout", {menu: "menu", scoreboard: "scoreboard", body: "showUser"});
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