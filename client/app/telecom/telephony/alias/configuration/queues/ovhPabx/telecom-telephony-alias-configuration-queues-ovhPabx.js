angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.queues.ovhPabx", {
        url: "/ovhPabx",
        views: {
            "@aliasView": {
                templateUrl: "app/telecom/telephony/alias/configuration/queues/ovhPabx/telecom-telephony-alias-configuration-queues-ovhPabx.html",
                controller: "TelecomTelephonyAliasConfigurationQueuesOvhPabxCtrl",
                controllerAs: "QueuesOvhPabxCtrl"
            }
        },
        translations: ["common"]
    });
});
