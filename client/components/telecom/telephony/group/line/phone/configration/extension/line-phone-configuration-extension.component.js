(function () {
    "use strict";

    angular.module("managerApp").component("linePhoneConfigurationExtension", {
        require: {
            configForm: "^form"
        },
        bindings: {
            configGroup: "=linePhoneConfigurationGroup",
            editMode: "=linePhoneConfigurationEditMode",
            expertMode: "=linePhoneConfigurationExpertMode"
        },
        templateUrl: "components/telecom/telephony/group/line/phone/configration/extension/line-phone-configuration-extension.html",
        controller: function ($scope, TelephonyGroupLinePhoneConfiguration) {

            var self = this;

            var keyConfigModel = {
                maxlength: 15,
                value: "",
                name: "ExtLabel",
                "default": "",
                description: "Ext label",
                group: "ExtensionKeyModule",
                level: null,
                rangeValue: null,
                "enum": null,
                type: "string"
            };

            self.modules = [];
            self.configs = null;
            self.extensionKeyModuleConfig = null;
            self.model = {
                moduleIndex: 0,
                pageIndex: 0
            };

            /*= ==============================
            =            HELPERS            =
            ===============================*/

            /**
             *  Helps to group coniguration array into module.
             *  A module is represented by an item of pagesPerModule pages arrays of keysPerPage items array.
             *
             *  @param  {Array} configs Configs list to group
             *
             *  @return {Array} Sorted list of configs grouped by modules
             */
            function groupConfigs (configs) {
                return _.chain(configs).filter(function (config) {
                    return config.name !== "ExtensionKeyModule";
                }).sortBy(function (config) {
                    return parseInt(config.name.match(/\d+/g)[0], 10);
                }).chunk(self.configGroup.keysPerPage).chunk(self.configGroup.pagesPerModule).value();
            }

            function createDynamicConfigs (moduleNumberToAdd, existingModulesCount) {
                var dynamicConfigs = [];
                var dynamicConfig;
                var startKeyNumber = existingModulesCount * self.configGroup.pagesPerModule * self.configGroup.keysPerPage;
                var keysNumberToAdd = moduleNumberToAdd * self.configGroup.pagesPerModule * self.configGroup.keysPerPage;

                for (var i = 0; i < keysNumberToAdd; i++) {
                    dynamicConfig = angular.copy(keyConfigModel);
                    dynamicConfig.name = [dynamicConfig.name, startKeyNumber + i + 1].join("");
                    dynamicConfigs.push(new TelephonyGroupLinePhoneConfiguration(dynamicConfig));
                }

                return dynamicConfigs;
            }

            self.getKeyIndex = function (index) {
                return {
                    number: (index + (self.model.moduleIndex * self.configGroup.keysPerPage) + ((self.model.moduleIndex * self.configGroup.keysPerPage) + (self.model.pageIndex * self.configGroup.keysPerPage))) + 1
                };
            };

            /* -----  End of HELPERS  ------*/

            /*= =============================
            =            EVENTS            =
            ==============================*/

            self.onModuleNumberChange = function () {
                var existingModules = groupConfigs(self.configGroup.configs);

                if (self.extensionKeyModuleConfig.value > existingModules.length) {
                    self.configGroup.dynamicConfigs = createDynamicConfigs(self.extensionKeyModuleConfig.value - existingModules.length, existingModules.length);
                    self.modules = existingModules.concat(groupConfigs(self.configGroup.dynamicConfigs));
                } else {
                    self.configGroup.dynamicConfigs = null;
                    self.modules = _.take(existingModules, self.extensionKeyModuleConfig.value);
                }

                if (self.model.moduleIndex >= self.modules.length) {
                    if (self.model.moduleIndex > 0) {
                        self.model.moduleIndex--;
                    }
                    self.model.pageIndex = 0;
                }
            };

            /* -----  End of EVENTS  ------*/

            /*= =====================================
            =            INITIALIZATION            =
            ======================================*/

            $scope.$watch("$ctrl.editMode", function (curValue, prevValue) {
                if (prevValue && !curValue) {
                    // be sure modules are still visually up to date !
                    self.onModuleNumberChange();
                }
            });

            self.$onInit = function () {
                self.extensionKeyModuleConfig = _.find(self.configGroup.configs, {
                    name: "ExtensionKeyModule"
                });

                // modules is an array representing extension key module with their pages
                self.modules = groupConfigs(self.configGroup.configs);
            };

            /* -----  End of INITIALIZATION  ------*/

        }
    });

})();