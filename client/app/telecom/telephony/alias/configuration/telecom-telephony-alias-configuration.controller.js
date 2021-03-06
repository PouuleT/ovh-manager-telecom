angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.actions = null;
    self.number = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getFeatureTypeActions () {
        switch (self.number.getFeatureFamily()) {
        case "redirect":
        case "svi":
            return [];
        case "ovhPabx":
            var ovhPabxActions = [{
                divider: true
            }];

            // add member/agent and queues for cloudHunting
            if (self.number.feature.featureType === "cloudHunting") {
                // add link for upgrade to "CCS expert" for "File d'appel expert"
                if (!self.number.feature.isCCS) {
                    ovhPabxActions.unshift({
                        name: "number_cloud_hunting_beta",
                        url: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_cloud_hunting_beta"),
                        text: $translate.instant("telephony_alias_configuration_actions_number_cloud_hunting_beta")
                    });
                }

                // agents for "CCS expert" - members for "File d'appel expert"
                ovhPabxActions.push(self.number.feature.isCCS ? {
                    name: "number_cloud_hunting_agents",
                    sref: "telecom.telephony.alias.configuration.agents.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_agents")
                } : {
                    name: "number_easy_hunting_members",
                    sref: "telecom.telephony.alias.configuration.agents.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_members")
                });

                // queue for both "CCS expert" and "File d'appel expert"
                ovhPabxActions.push({
                    name: "number_cloud_hunting_queues",
                    sref: "telecom.telephony.alias.configuration.queues.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_queues")
                });
            }

            // add menu link exept for "File d'appel expert"
            if (self.number.feature.featureType === "cloudIvr" || (self.number.feature.featureType === "cloudHunting" && self.number.feature.isCCS)) {
                ovhPabxActions.push({
                    name: "number_ovh_pabx_menus",
                    sref: "telecom.telephony.alias.configuration.ovhPabx.menus",
                    text: $translate.instant("telephony_alias_configuration_actions_menus_management")
                });
            }

            // add tts link for "CCS expert"
            if (self.number.feature.isCCS) {
                ovhPabxActions.push({
                    name: "number_ovh_pabx_tts",
                    sref: "telecom.telephony.alias.configuration.ovhPabx.tts",
                    text: $translate.instant("telephony_alias_configuration_actions_tts_management")
                });
            }

            // add links for all : "CCS expert", "Serveur Vocal interactif" and "File d'appel expert"
            // sound
            // events
            ovhPabxActions.push({
                name: "number_ovh_pabx_sounds",
                sref: "telecom.telephony.alias.configuration.ovhPabx.sounds",
                text: $translate.instant("telephony_alias_configuration_actions_sounds_management")
            }, {
                divider: true
            }, {
                name: "number_cloud_hunting_events",
                sref: "telecom.telephony.alias.configuration.scheduler.ovhPabx",
                text: $translate.instant("telephony_alias_configuration_actions_number_cloud_hunting_events")
            });

            // add links for hunting board and hunting records for "CCS expert"
            if (self.number.feature.isCCS) {
                ovhPabxActions.push({
                    divider: true
                }, {
                    name: "number_cloud_hunting_board",
                    sref: "telecom.telephony.alias.configuration.stats.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_board")
                }, {
                    name: "number_cloud_hunting_records",
                    sref: "telecom.telephony.alias.configuration.records.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_records")
                });
            }

            return ovhPabxActions;
        default:
            switch (self.number.feature.featureType) {
            case "easyHunting":
                var easyHuntingActions = [{
                    name: "number_easy_hunting_mode",
                    sref: "telecom.telephony.alias.configuration.mode.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_mode")
                }, {
                    name: "number_easy_hunting_members",
                    sref: "telecom.telephony.alias.configuration.members.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_members")
                }, {
                    name: "number_easy_hunting_slots",
                    sref: "telecom.telephony.alias.configuration.timeCondition.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_slots")
                }, {
                    name: "number_easy_hunting_events",
                    sref: "telecom.telephony.alias.configuration.scheduler.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_events")
                }, {
                    name: "number_easy_hunting_filtering",
                    sref: "telecom.telephony.alias.configuration.callsFiltering.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_filtering")
                }];

                if (self.number.feature.isCCS) {
                    // if it is a CCS => add records management page link
                    easyHuntingActions.push({
                        name: "number_easy_hunting_board",
                        sref: "telecom.telephony.alias.configuration.stats.easyHunting",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_board")
                    }, {
                        name: "number_cloud_hunting_records",
                        sref: "telecom.telephony.alias.configuration.records.ovhPabx",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_records")
                    });
                } else {
                    // if not a CSS: add possibility to upgrade to
                    easyHuntingActions.unshift({
                        name: "number_easy_hunting_beta",
                        url: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_cloud_hunting_beta"),
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_beta")
                    });
                }
                return easyHuntingActions;
            case "conference":
                return [{
                    name: "number_manage_conference",
                    url: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_manage_conference"),
                    text: $translate.instant("telephony_alias_configuration_actions_number_manage_conference")
                }];
            default:
                return [];
            }
        }
    }

    self.isSubwayPlanActive = function () {
        return ["redirect", "svi", "ovhPabx"].indexOf(self.number.getFeatureFamily()) > -1;
    };

    /* -----  End of HELPERS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function initActions () {
        return [{
            name: "number_modification_new",
            sref: "telecom.telephony.alias.configuration.changeType",
            text: $translate.instant("telephony_alias_configuration_actions_number_modification_new")
        }].concat(getFeatureTypeActions());
    }

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                self.actions = initActions();
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_load_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
