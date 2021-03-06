angular.module("managerApp").factory("VoipTimeConditionSlot", function () {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function VoipTimeConditionSlot (slotOptions) {
        var opts = slotOptions || {};

        // options check
        if (!opts.serviceName) {
            throw new Error("serviceName option must be specified when creating a new VoipTimeConditionSlot");
        }
        if (!opts.name) {
            throw new Error("name option must be specified when creating a new VoipTimeConditionSlot");
        }

        // mandatory
        this.name = opts.name;
        this.serviceName = opts.serviceName;

        // other attributes
        this.setOptions(opts);

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.originalSave = null;
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= =========================================
    =            PROTOTYPES METHODS            =
    ==========================================*/

    VoipTimeConditionSlot.prototype.setOptions = function (slotOptions) {
        var self = this;

        self.type = slotOptions.type || "";
        self.number = slotOptions.number || "";

        return self;
    };

    /* ----------  Edition  ----------*/

    VoipTimeConditionSlot.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            type: angular.copy(self.type),
            number: angular.copy(self.number)
        };

        if (!self.originalSave) {
            self.originalSave = angular.copy(self.saveForEdition);
        }

        return self;
    };

    VoipTimeConditionSlot.prototype.stopEdition = function (cancel, cancelToOriginalSave, resetOriginalSave) {
        var self = this;

        if (self.originalSave && cancelToOriginalSave) {
            self.type = angular.copy(self.originalSave.type);
            self.number = angular.copy(self.originalSave.number);
            self.originalSave = null;
        } else if (self.saveForEdition && cancel) {
            self.type = angular.copy(self.saveForEdition.type);
            self.number = angular.copy(self.saveForEdition.number);
        }

        if (resetOriginalSave) {
            self.originalSave = null;
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    VoipTimeConditionSlot.prototype.hasChange = function (property, fromOriginal) {
        var self = this;
        var compareToObject = null;

        if (fromOriginal && !self.originalSave) {
            return false;
        } else if (!fromOriginal && !self.saveForEdition) {
            return false;
        }

        compareToObject = fromOriginal ? self.originalSave : self.saveForEdition;

        if (property) {
            return !_.isEqual(_.get(self, property), _.get(compareToObject, property));
        }
        return self.hasChange("status", fromOriginal) || self.hasChange("number", fromOriginal) || self.hasChange("type", fromOriginal);

    };

    /* -----  End of PROTOTYPES METHODS  ------*/


    return VoipTimeConditionSlot;

});
