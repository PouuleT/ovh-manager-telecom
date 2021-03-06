/**
 *  This factory manages the svi feature of a number (vxml for API)
 *  This manages the svi featureType of /telephony/{billingAccount}/number API.
 */
angular.module("managerApp").factory("TelephonyGroupNumberSvi", function ($q, Telephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberSvi (featureOptionsParam) {
        var featureOptions = featureOptionsParam;

        // check for mandatory options
        if (!featureOptions) {
            featureOptions = {};
        }

        // check mandatory fields
        if (!featureOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberSvi");
        }

        if (!featureOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberSvi");
        }

        if (!featureOptions.featureType) {
            throw new Error("featureType option must be specified when creating a new TelephonyGroupNumberSvi");
        }

        // set mandatory attributes
        this.billingAccount = featureOptions.billingAccount;
        this.serviceName = featureOptions.serviceName;
        this.featureType = featureOptions.featureType;

        // other attributes
        this.url = null;
        this.urlRecord = null;

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;

        // set feature options
        this.setInfos(featureOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupNumberSvi.prototype.setInfos = function (featureOptionsParam) {
        var self = this;
        var featureOptions = featureOptionsParam;

        if (!featureOptions) {
            featureOptions = {};
        }

        self.url = featureOptions.url || "";
        self.urlRecord = featureOptions.urlRecord || "";

        return self;
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberSvi.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            featureType: angular.copy(self.featureType),
            url: angular.copy(self.url),
            urlRecord: angular.copy(self.urlRecord)
        };

        return self;
    };

    TelephonyGroupNumberSvi.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.featureType = angular.copy(self.saveForEdition.featureType);
            self.url = angular.copy(self.saveForEdition.url);
            self.urlRecord = angular.copy(self.saveForEdition.urlRecord);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberSvi.prototype.hasChange = function (attr) {
        var self = this;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        if (attr) {
            return !_.isEqual(_.get(self.saveForEdition, attr), _.get(self, attr));
        }
        return self.hasChange("featureType") || self.hasChange("url") || self.hasChange("urlRecord");

    };

    /* ----------  API CALLS  ----------*/

    TelephonyGroupNumberSvi.prototype.save = function () {
        var self = this;

        return Telephony.Vxml().Lexi().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            url: self.url,
            urlRecord: self.urlRecord
        }).$promise.then(function () {
            return self;
        });
    };

    TelephonyGroupNumberSvi.prototype.getSettings = function () {
        var self = this;

        return Telephony.Vxml().Lexi().settings({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (settings) {
            return self.setInfos(settings);
        }, function (error) {
            if (error.status === 404) {
                return self;
            }
            return $q.reject(error);

        });
    };

    /* ----------  HELPERS  ----------*/

    TelephonyGroupNumberSvi.prototype.inPendingState = function () {
        return true;
    };

    /* ----------  INITIALIZATION  ----------*/

    TelephonyGroupNumberSvi.prototype.init = function () {
        var self = this;

        return Telephony.Vxml().Lexi().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function () {
            return self.getSettings();
        });
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberSvi;

});
