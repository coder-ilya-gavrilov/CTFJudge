import { Roles } from 'meteor/alanning:roles';
import Settings from "../shared/settings.collection";

Meteor.startup(function() {
    let hasDefaultSettings = Settings.find().count();
    if (!hasDefaultSettings) {
        Settings.insert({key: "contestName", value: "CTFJudge Contest", public: true});
        Settings.insert({key: "startTime", value: 0, public: true});
        Settings.insert({key: "endTime", value: 0, public: true});
    }
});
