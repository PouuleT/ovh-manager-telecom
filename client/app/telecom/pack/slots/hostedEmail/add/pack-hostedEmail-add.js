angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.hostedEmail-add", {
        url: "/hostedEmail/add",
        views: {
            "packView@telecom.pack": {
                templateUrl: "app/telecom/pack/slots/hostedEmail/add/pack-hostedEmail-add.html",
                controller: "PackHostedEmailAddCtrl",
                controllerAs: "ctrl"
            }
        },
        translations: ["common", "telecom/pack/slots/hostedEmail/add"]
    });
});
