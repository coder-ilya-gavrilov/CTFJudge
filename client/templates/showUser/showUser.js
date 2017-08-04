import Attempts from "/shared/attempts.collection";
import Tasks from "/shared/tasks.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.showUser.helpers({
  user(){
    return Meteor.users.findOne(FlowRouter.getParam('_id'));
  },
  solutions(){
    let solutions = Attempts.find({userId: FlowRouter.getParam('_id'), success: true}).map(attempt => Tasks.findOne(attempt.task).name).join(", ");
    return (solutions == "") ? "Этот пользователь ещё ничего не решил" : "Решенные задания: " + solutions;
  },
  checkedIfVisible() {
    if (Meteor.users.findOne(FlowRouter.getParam('_id')).visible)
      return "checked";
    return "";
  }
});
Template.showUser.events({
  "click input[name='showUser']": function(event, instance) {
    Meteor.call("changeVisibility", {
      userId: FlowRouter.getParam('_id'),
      visibility: instance.$("input[name='showUser']").is(":checked")
    });
 }
});