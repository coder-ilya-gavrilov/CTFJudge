import { ReactiveVar } from 'meteor/reactive-var';
import { moment } from 'meteor/momentjs:moment';
import Settings from '/shared/settings.collection';

Template.beforeStart.onCreated(function() {
    let instance = this;
    this.startTime = undefined;
    this.remain = new ReactiveVar(0);
    this.updateMoment = setInterval(function(){
        if (!instance.startTime)
            instance.startTime = (Settings.findOne({key: "startTime"}) || {}).value;
        let remainTime = -moment().diff(moment(instance.startTime));
        instance.remain.set(remainTime);
        if (remainTime <= 0)
            FlowRouter.go('tasks.list');
    }, 1000);
    this.updateStartTime = setInterval(function(){
        instance.startTime = (Settings.findOne({key: "startTime"}) || {}).value;
    }, 15000);
});

Template.beforeStart.onDestroyed(function() {
    clearInterval(this.updateMoment);
    clearInterval(this.updateStartTime);
});

Template.beforeStart.helpers({
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
    }
});