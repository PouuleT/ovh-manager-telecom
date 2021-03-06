angular.module("managerApp").controller("TelecomTelephonyServiceContactCtrl", function ($stateParams, $q, $timeout, $translate, Telephony, Toast, ToastError, Xdsl) {
    "use strict";

    var self = this;

    function fetchDirectory () {
        return Telephony.Service().Lexi().directory({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchDirectoryServiceCode (ape) {
        return Telephony.Service().Lexi().getDirectoryServiceCode({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            apeCode: ape
        }).$promise.then(function (result) {
            return _.map(result, function (info) {
                info.directoryServiceCode = "" + (info.directoryServiceCode || "");
                return info;
            });
        });
    }

    function init () {
        self.isLoading = true;
        self.isEditing = false;
        self.wayNumberExtraEnum = [
            "bis", "ter", "quater", "quinquies", "sexto", "septimo", "octimo", "nono",
            "A", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "S", "U", "V",
            "W", "X", "Y", "Z"
        ];
        self.directoryCodes = null;
        return fetchDirectory().then(function (directory) {
            self.directory = directory;
            self.directoryForm = angular.copy(self.directory);
            self.cityList = [{ name: self.directory.city }];
            self.onPostCodeChange();
            if (self.directory.ape && self.directory.directoryServiceCode) {
                return fetchDirectoryServiceCode(self.directory.ape).then(function (result) {
                    self.directoryCodes = result;
                });
            }
            return null;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    /**
     * Some attributes are not shared between different legal form so we have to reset
     * them when user choose another legal form.
     */
    self.onChangeLegalForm = function () {
        self.directoryForm = _.assign(self.directoryForm, _.omit(self.directory, "legalForm"));
        switch (self.directoryForm.legalForm) {
        case "individual":
            self.directoryForm.siret = "";
            self.directoryForm.ape = "";
            self.directoryForm.socialNomination = "";
            self.directoryForm.socialNominationExtra = "";
            self.directoryForm.directoryServiceCode = "";
            self.directoryForm.PJSocialNomination = "";
            self.directoryForm.occupation = "";
            break;
        case "professional":
            self.directoryForm.name = "";
            self.directoryForm.firstName = "";
            break;
        case "corporation":
            self.directoryForm.name = "";
            self.directoryForm.firstName = "";
            self.directoryForm.occupation = "";
            break;
        default:
            break;
        }
    };

    self.hasChanges = function () {
        return !angular.equals(self.directory, self.directoryForm);
    };

    self.applyChanges = function () {
        if (self.directoryForm.legalForm !== "individual") {
            self.directoryForm.PJSocialNomination = self.directoryForm.socialNomination;
        }
        var modified = _.assign(self.directory, self.directoryForm);
        self.isUpdating = true;
        return Telephony.Service().Lexi().changeDirectory({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, modified).$promise.then(function () {
            self.directory = angular.copy(self.directoryForm);
            self.isEditing = false;
            Toast.success($translate.instant("telephony_service_contact_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isUpdating = false;
        });
    };

    self.onPostCodeChange = (function () {
        // var pendingRequest = null;
        return function () {
            // self.directoryForm.postCode = (self.directoryForm.postCode || "").replace(/[^\d]/g, "").substring(0, 5);

            if (self.directoryForm.postCode !== self.directory.postCode) {
                self.directoryForm.urbanDistrict = "";
            }

            /*
             * @TODO uncomment when city autocomplete available in api
             *
            // Fetch cities for given post code
            if (self.directoryForm.postCode.length >= 3) {
                if (pendingRequest && pendingRequest.$cancelRequest) {
                    pendingRequest.$cancelRequest();
                }
                self.isCityListLoading = true;
                pendingRequest = Telephony.Number().Lexi().getZones({
                    axiom: self.directoryForm.postCode,
                    country: self.directoryForm.country.toLowerCase()
                });
                pendingRequest.$promise.then(function (cities) {
                    self.cityList = _.map(cities, function (city) {
                        return city.toUpperCase();
                    });
                    // automatically select first city
                    if (cities.length) {
                        self.directoryForm.city = _.head(cities).name;
                    }
                    // parse urban district
                    if (self.isUrbanDistrictRequired()) {
                        self.directoryForm.urbanDistrict = "" + parseInt(self.directoryForm.postCode.slice(-2), 10);
                    }
                })["finally"](function () {
                    self.isCityListLoading = false;
                });
            } else {
                self.cityList = [];
            }
            */
        };
    })();

    self.onSiretChange = (function () {
        var pendingRequest = null;
        return function (model) {
            if (self.directoryForm.siret && self.directoryForm.siret.length >= 9) {
                if (pendingRequest) {
                    pendingRequest.$cancelRequest();
                }

                // we have to poll because api call is not synchronous :(
                var fetchInfos = function (siret) {
                    return Telephony.Service().Lexi().fetchDirectoryEntrepriseInformations({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName
                    }, {
                        entrepriseNumber: siret
                    }).$promise.then(function (infos) {
                        if (infos.status === "todo") {
                            return $timeout(function () {
                                return fetchInfos(siret);
                            }, 500);
                        }
                        return infos;

                    });
                };

                // we take only first 10 chars which is SIREN code
                fetchInfos(self.directoryForm.siret.substring(0, 9)).then(function (infos) {
                    if (infos.informations.isValid) {
                        self.directoryForm.ape = infos.informations.ape;
                        self.directoryForm.socialNomination = infos.informations.name;
                        self.directoryCodes = null;

                        // fetch directory codes for given APE
                        if (self.directoryForm.ape) {
                            fetchDirectoryServiceCode(self.directoryForm.ape).then(function (result) {
                                self.directoryCodes = result;
                            });
                        }
                        model.$setValidity("siret", true);
                    } else {
                        self.directoryForm.ape = null;
                        self.directoryForm.socialNomination = null;
                        self.directoryCodes = null;
                        model.$setValidity("siret", false);
                    }
                }).catch(function (err) {
                    return new ToastError(err);
                });
            }
        };
    })();

    // arrondissements pour paris 75xxx, marseille 13xxx et lyon 69xxx (92 izi?)
    self.isUrbanDistrictRequired = function () {
        var p = self.directoryForm.postCode;
        return _.startsWith(p, "75") || _.startsWith(p, "13") || _.startsWith(p, "69");
    };

    self.onCityChange = function () {
        self.wayList = [];
        self.directoryForm.wayName = "";
    };

    self.getWayNameList = (function () {
        var pendingRequest = null;
        return function (partialName) {
            var result = $q.when([]);
            if (partialName.length >= 3) {
                if (pendingRequest) {
                    pendingRequest.$cancelRequest();
                }
                var city = _.find(self.cityList, { name: self.directoryForm.city });
                if (city) {
                    self.isWayListLoading = true;
                    pendingRequest = Xdsl.Lexi().eligibilityStreets({
                        inseeCode: city.inseeCode,
                        partialName: partialName
                    });
                    pendingRequest.$promise.finally(function () {
                        self.isWayListLoading = false;
                    });
                    result = pendingRequest.$promise;
                }
            }
            return result;
        };
    })();

    self.getDisplayFirstNameOptions = function (displayFirstName) {
        if (displayFirstName) {
            return self.directoryForm.firstName + " " + self.directoryForm.name;
        }
        return self.directoryForm.firstName.substring(0, 1) + ". " + self.directoryForm.name;

    };

    self.findDirectoryService = function () {
        return _.find(self.directoryCodes, function (info) {
            return "" + info.directoryServiceCode === "" + self.directory.directoryServiceCode;
        });
    };

    self.cancelEdition = function () {
        self.isEditing = false;
        self.directoryForm = angular.copy(self.directory);
    };

    self.isShortForm = function () {
        return ["fr", "be"].indexOf(self.directory.country) < 0;
    };

    init();
});
