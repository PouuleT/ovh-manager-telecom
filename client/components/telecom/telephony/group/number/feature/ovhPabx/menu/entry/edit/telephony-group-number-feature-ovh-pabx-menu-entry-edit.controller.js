angular.module("managerApp").controller("telephonyNumberOvhPabxMenuEntryEditCtrl", function ($scope, $q, $timeout, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.menuEntryCtrl = null;
    self.availableActions = null;
    self.availableDtmfKeys = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getAvailableDtmfKeys () {
        return _.chain(self.menuEntryCtrl.menuCtrl.menu.getAllDtmfEntryKeys()).map(function (key) {
            return {
                key: key,
                disabled: !!_.find(self.menuEntryCtrl.menuCtrl.menu.entries, function (entry) {
                    return key === entry.dtmf && entry.status !== "DRAFT" && entry.entryId !== self.menuEntryCtrl.menuEntry.entryId;
                })
            };
        }).chunk(3).value();
    }

    function manageEntryRemove () {
        self.menuEntryCtrl.menuCtrl.menu.removeEntry(self.menuEntryCtrl.menuEntry);
    }

    self.isMenuEntryValid = function () {
        if (self.menuEntryCtrl.menuEntry.action === "playback") {
            return !!self.menuEntryCtrl.menuCtrl.ovhPabx.getSound(self.menuEntryCtrl.menuEntry.actionParam);
        } else if (self.menuEntryCtrl.menuEntry.action === "menuSub") {
            return self.menuEntryCtrl.menuEntry.actionParam !== "";
        }
        return true;

    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onLeftPageButtonClick = function (rightPage) {
        self.menuEntryCtrl.popoverStatus.move = true;
        self.menuEntryCtrl.popoverStatus.rightPage = rightPage;
        if (rightPage === "dtmf") {
            // refresh available dtmf keys when right page is dtmf
            self.availableDtmfKeys = getAvailableDtmfKeys();
        }
        $timeout(angular.noop, 99); // to avoid popover move
    };

    /* ----------  DTMF EVENTS  ----------*/

    self.onDtmfKeyButtonClick = function (key) {
        self.menuEntryCtrl.menuEntry.dtmf = key;
        self.menuEntryCtrl.popoverStatus.move = false;
    };

    /* ----------  ACTION EVENTS  ----------*/

    self.onMenuEntryActionChange = function () {
        self.menuEntryCtrl.popoverStatus.move = false;
        self.menuEntryCtrl.menuEntry.actionParam = "";
    };

    /* ----------  PLAYBACK ACTIONS  ----------*/

    self.onPlaybackSoundChange = function (sound) {
        self.menuEntryCtrl.popoverStatus.move = false;
        self.menuEntryCtrl.menuEntry.actionParam = sound.soundId;
    };

    /* ----------  MENU SUB ACTIONS  ----------*/

    self.onAddSubMenuButtonClick = function () {
        // close popover
        self.menuEntryCtrl.popoverStatus.isOpen = false;

        // create sub menu for menu entry
        self.menuEntryCtrl.menuEntry.menuSub = self.menuEntryCtrl.menuCtrl.ovhPabx.addMenu({
            name: $translate.instant("telephony_number_feature_ovh_pabx_menu_entry_edit_menu_sub_add_menu_new_name", {
                index: self.menuEntryCtrl.menuCtrl.ovhPabx.menus.length + 1
            }),
            oldParent: angular.copy(self.menuEntryCtrl.menuEntry.saveForEdition),
            status: "DRAFT"
        });

        // stop edition of menu entry
        self.menuEntryCtrl.menuEntry.stopEdition();
    };

    self.onSubMenuSelectedChange = function (menu) {
        self.menuEntryCtrl.popoverStatus.move = false;
        self.menuEntryCtrl.menuEntry.menuSub = menu;
    };

    /* ----------  FOOTER BUTTONS EVENTS  ----------*/

    self.onValidateBtnClick = function () {
        // define api call
        var actionPromise = self.menuEntryCtrl.menuEntry.status === "DRAFT" ? self.menuEntryCtrl.menuEntry.create() : self.menuEntryCtrl.menuEntry.save();

        // close popover
        self.menuEntryCtrl.popoverStatus.isOpen = false;

        // manage action result
        return actionPromise.then(function () {
            self.menuEntryCtrl.menuEntry.stopEdition();
            self.menuEntryCtrl.menuCtrl.jsplumbInstance.customRepaint();
        }).catch(function (error) {
            // manage error display
            var errorTranslationKey = self.menuEntryCtrl.menuEntry.status === "DRAFT" ? "telephony_number_feature_ovh_pabx_menu_entry_create_error" : "telephony_number_feature_ovh_pabx_menu_entry_edit_error";
            Toast.error([$translate.instant(errorTranslationKey), _.get(error, "data.message") || ""].join(" "));

            // remove entry from menu if entry had to be created
            if (self.menuEntryCtrl.menuEntry.status === "DRAFT") {
                manageEntryRemove();
            }
            return $q.reject(error);
        });
    };

    self.onCancelBtnClick = function () {
        // close popover
        self.menuEntryCtrl.popoverStatus.isOpen = false;

        // remove entry if status is DRAFT
        if (self.menuEntryCtrl.menuEntry.status === "DRAFT") {
            manageEntryRemove();
        } else {
            self.menuEntryCtrl.menuEntry.stopEdition(true);
        }
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function getAvailableActions () {
        return TelephonyMediator.getApiModelEnum("telephony.OvhPabxIvrMenuEntryActionEnum").then(function (enumValues) {
            self.availableActions = _.chain(enumValues).filter(function (enumVal) {
                if (self.menuEntryCtrl.menuCtrl.ovhPabx.featureType === "cloudIvr") {
                    return enumVal !== "callcenter";
                }
                return true;

            }).map(function (enumVal) {
                return {
                    value: enumVal,
                    label: $translate.instant("telephony_number_feature_ovh_pabx_menu_entry_action_" + _.snakeCase(enumVal)),
                    explain: $translate.instant("telephony_number_feature_ovh_pabx_menu_entry_action_" + _.snakeCase(enumVal) + "_explain")
                };
            }).value();
        });
    }

    self.$onInit = function () {
        self.loading.init = true;

        // set parent controller
        self.menuEntryCtrl = $scope.$parent.$ctrl;

        return getAvailableActions().then(function () {
            // start menu entry edition
            self.menuEntryCtrl.menuEntry.startEdition();
        }).finally(function () {
            self.loading.init = false;
        });
    };

    self.$onDestroy = function () {
        if (self.menuEntryCtrl.menuEntry.inEdition.status === "DRAFT") {
            self.menuEntryCtrl.menuCtrl.menu.removeEntry(self.menuEntryCtrl.menuEntry);
        }
    };

    /* -----  End of INITIALIZATION  ------*/

});
