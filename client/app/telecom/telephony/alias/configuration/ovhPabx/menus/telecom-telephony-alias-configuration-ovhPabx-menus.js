angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.ovhPabx.menus", {
        url: "/menus",
        views: {
            "@aliasView": {
                templateUrl: "app/telecom/telephony/alias/configuration/ovhPabx/menus/telecom-telephony-alias-configuration-ovhPabx-menus.html",
                controller: "TelecomTelephonyAliasConfigurationOvhPabxMenusCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "telecom/telephony/alias/configuration/ovhPabx/menus"]
    });
});
