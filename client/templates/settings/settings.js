import Settings from "/shared/settings.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';
import { moment } from 'meteor/momentjs:moment';

Template.settings.onRendered(function() {
    let getParameter = (key) => (Settings.findOne({key}) || {}).value;
    this.$('#startTimePicker').datetimepicker({
        defaultDate: moment(getParameter("startTime")),
        format: 'DD.MM.YYYY HH:mm:ss'
    });
    this.$('#endTimePicker').datetimepicker({
        defaultDate: moment(getParameter("endTime")),
        format: 'DD.MM.YYYY HH:mm:ss'
    });
});
Template.settings.events({
   'click #save'(event, instance){
       event.preventDefault();
       let contestName = instance.$('#contestName').val();
       let startTime = moment(instance.$('#startTime').val(), 'DD.MM.YYYY HH:mm:ss').valueOf();
       let endTime = moment(instance.$('#endTime').val(), 'DD.MM.YYYY HH:mm:ss').valueOf();
       Meteor.call("saveSettings", {contestName, startTime, endTime});
       FlowRouter.go("home");
   }
});
