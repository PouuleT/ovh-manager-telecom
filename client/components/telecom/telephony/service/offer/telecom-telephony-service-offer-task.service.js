angular.module("managerApp").service("voipServiceOfferTask", function ($q, OvhApiTelephony, Poller) {
    "use strict";

    var self = this;

    self.getTaskInStatus = function (billingAccount, serviceName, statusParam, actionParam, serviceTypeParam) {
        var status = _.isArray(statusParam) ? statusParam : [statusParam];
        var promises = [];
        var taskIds = [];

        status.forEach(function (statusVal) {
            promises.push(OvhApiTelephony.Service().OfferTask().Lexi().query({
                billingAccount: billingAccount,
                serviceName: serviceName,
                action: actionParam,
                status: statusVal,
                serviceType: serviceTypeParam
            }).$promise.then(function (taskIdsOfStatus) {
                taskIds = taskIds.concat(taskIdsOfStatus);
            }));
        });

        return $q.allSettled(promises).then(function () {
            if (taskIds.length === 1) {
                return self.getTaskDetails(billingAccount, serviceName, taskIds[0]);
            }

            return $q.when(null);
        });
    };

    self.getTaskDetails = function (billingAccount, serviceName, taskId) {
        return OvhApiTelephony.Service().OfferTask().Lexi().get({
            billingAccount: billingAccount,
            serviceName: serviceName,
            taskId: taskId
        }).$promise;
    };

    self.startPolling = function (billingAccount, serviceName, taskId, pollOptions) {
        return Poller.poll(["/telephony", billingAccount, "service", serviceName, "offerTask", taskId].join("/"), {
            cache: false
        }, pollOptions);
    };

    self.stopPolling = function (pollingNamespage) {
        return Poller.kill({
            namespace: pollingNamespage
        });
    };
});
