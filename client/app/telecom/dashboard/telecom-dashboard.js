angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.dashboard", {
        url: "/dashboard",
        views: {
            telecomView: {
                templateUrl: "app/telecom/dashboard/telecom-dashboard.html",
                controller: "TelecomDashboardCtrl",
                controllerAs: "TelecomDashboardCtrl"
            },
            "@billsView": {
                templateUrl: "app/telecom/dashboard/bills/telecom-dashboard-bills.html",
                controller: "TelecomDashboardBillsCtrl",
                controllerAs: "BillsCtrl",
                noTranslations: true
            },
            "@guidesView": {
                templateUrl: "app/telecom/dashboard/guides/telecom-dashboard-guides.html",
                controller: "TelecomDashboardGuidesCtrl",
                controllerAs: "GuidesCtrl",
                noTranslations: true
            }
        },
        translations: ["common", "telecom/dashboard"],
        resolve: {
            $title: function (translations, $translate) {
                return $translate("telecom_dashboard_page_title");
            }
        }
    });
});
