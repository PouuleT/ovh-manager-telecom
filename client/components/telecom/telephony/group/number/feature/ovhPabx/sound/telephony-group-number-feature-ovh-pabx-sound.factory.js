angular.module("managerApp").factory("TelephonyGroupNumberOvhPabxSound", function ($q, $timeout, User, Telephony, voipServiceTask) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberOvhPabxSound (soundOptionsParam) {
        var soundOptions = soundOptionsParam;

        if (!soundOptions) {
            soundOptions = {};
        }

        // check for mandatory options
        if (!soundOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberOvhPabxSound");
        }

        if (!soundOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberOvhPabxSound");
        }

        // set mandatory attributes
        this.billingAccount = soundOptions.billingAccount;
        this.serviceName = soundOptions.serviceName;

        // other attributes
        this.soundId = soundOptions.soundId;
        this.name = null;
        this.status = null;

        this.setInfos(soundOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    TelephonyGroupNumberOvhPabxSound.prototype.setInfos = function (soundOptions) {
        var self = this;

        self.name = soundOptions.name || null;
        self.status = soundOptions.status || "OK";

        return self;
    };

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    TelephonyGroupNumberOvhPabxSound.prototype.remove = function () {
        var self = this;

        self.status = "DELETING";

        return Telephony.OvhPabx().Sound().Lexi().remove({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            soundId: self.soundId
        }).$promise.catch(function (error) {
            self.status = "OK";
            return $q.reject(error);
        });
    };

    TelephonyGroupNumberOvhPabxSound.prototype.upload = function (file) {
        var self = this;

        // first upload file to user document
        return User.Document().Lexi().upload(self.name, file).then(function (doc) {
            // second upload the file uploaded with its url to user document
            return Telephony.OvhPabx().Lexi().soundUpload({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }, {
                name: self.name,
                url: doc.getUrl
            }).$promise.then(function (task) {
                // third poll to check the progression of file upload
                return voipServiceTask.startPolling(self.billingAccount, self.serviceName, task.taskId, {
                    namespace: "soundUploadTask_" + self.serviceName,
                    interval: 1000,
                    retryMaxAttempts: 0
                }).catch(function (err) {
                    // When the task does not exist anymore it is considered done (T_T)
                    if (err.status === 404) {
                        // add some delay to ensure we get the sound from api when refreshing
                        return $timeout(function () {
                            return $q.when(true);
                        }, 2000);
                    }
                    return $q.reject(err);

                }).finally(function () {
                    // to finish delete file uploaded to user document
                    // we don't care about success or fail
                    User.Document().Lexi().delete({
                        id: doc.id
                    });
                });
            });
        });
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberOvhPabxSound;

});
