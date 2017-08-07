import Tasks from "/shared/tasks.collection";
import Attempts from "/shared/attempts.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';
import Settings from "/shared/settings.collection";

Template.tasks.onCreated(function() {
    let instance = this;
    this.startTime = undefined;
    this.remain = new ReactiveVar(0);
    this.updateMoment = setInterval(function(){
        if (!instance.startTime)
            instance.startTime = (Settings.findOne({key: "startTime"}) || {}).value;
        let remainTime = -moment().diff(moment(instance.startTime));
        instance.remain.set(remainTime);
        if (remainTime <= 0) {
            clearInterval(instance.updateMoment);
            clearInterval(instance.updateStartTime);
        }
    }, 1000);
    this.updateStartTime = setInterval(function(){
        instance.startTime = (Settings.findOne({key: "startTime"}) || {}).value;
    }, 15000);
});

Template.tasks.helpers({
    tasks(){
        return Tasks.find({}, {sort: {category: 1, cost: 1}});
    },
    areTasksAvailable() {
        console.log(Tasks.find().count());
        return Tasks.find().count();
    },
    taskCompletion(task){
        if (task.opened === false)
            return "warning";
        let result = Attempts.find({task: task._id, userId: Meteor.userId()}).count();
        if (result === 0)
            return "default";
        else if (Attempts.findOne({task: task._id, userId: Meteor.userId(), success: true}) === null)
            return "danger";
        else
            return "success";
    },
    days() {
        let days = Math.floor(Template.instance().remain.get() / 86400000);
        if (days === 0)
            return "";
        else if ((days % 100 > 10 && days % 100 < 15) || days % 10 > 4 || days % 10 === 0)
            return days + " дней";
        else if (days % 10 == 1)
            return days + " день";
        else
            return days + " дня";
    },
    hours() {
        let hours = Math.floor(Template.instance().remain.get() / 3600000) % 24;
        return ("0" + hours).slice(-2);
    },
    minutes() {
        let minutes = Math.floor(Template.instance().remain.get() / 60000) % 60;
        return ("0" + minutes).slice(-2);
    },
    seconds() {
        let seconds = Math.floor(Template.instance().remain.get() / 1000) % 60;
        return ("0" + seconds).slice(-2);
    },
    isStarted() {
        return Template.instance().remain.get() <= 0;
    }
});
Template.tasks.events({
    'click #tasks tbody tr td'(event, instance){
        FlowRouter.go('tasks.show', {_id: instance.$(event.target).parent("tr").attr("data-id")})
    },
});
Template.tasks.onDestroyed(function() {
    clearInterval(this.updateMoment);
    clearInterval(this.updateStartTime);
});