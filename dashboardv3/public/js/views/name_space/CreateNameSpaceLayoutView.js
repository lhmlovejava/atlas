/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(['require',
    'backbone',
    'hbs!tmpl/name_space/CreateNameSpaceLayoutView_tmpl',
    'utils/Utils',
    'utils/Messages',
    'views/name_space/NameSpaceAttributeItemView',
    'collection/VTagList',
    'utils/UrlLinks',
    'platform'
], function(require, Backbone, CreateNameSpaceLayoutViewTmpl, Utils, Messages, NameSpaceAttributeItemView, VTagList, UrlLinks, platform) {

    var CreateNameSpaceLayoutView = Backbone.Marionette.CompositeView.extend(
        /** @lends CreateNameSpaceLayoutView */
        {
            _viewName: 'CreateNameSpaceLayoutView',

            template: CreateNameSpaceLayoutViewTmpl,

            templateHelpers: function() {
                return {
                    create: this.create,
                    description: this.description,
                    fromTable: this.fromTable,
                    isEditAttr: this.isEditAttr
                };
            },

            /** Layout sub regions */
            regions: {},

            childView: NameSpaceAttributeItemView,

            childViewContainer: "[data-id='addAttributeDiv']",

            childViewOptions: function() {
                return {
                    // saveButton: this.ui.saveButton,
                    parentView: this
                };
            },
            /** ui selector cache */
            ui: {
                tagName: "[data-id='tagName']",
                description: "[data-id='description']",
                title: "[data-id='title']",
                attributeData: "[data-id='attributeData']",
                addAttributeDiv: "[data-id='addAttributeDiv']",
                createTagForm: '[data-id="createTagForm"]',
                namespaceAttrPageCancle: '[data-id="namespaceAttrPageCancle"]',
                namespaceAttrPageOk: '[data-id="namespaceAttrPageOk"]'
            },
            /** ui events hash */
            events: function() {
                var events = {};
                events["click " + this.ui.attributeData] = "onClickAddAttriBtn";
                events["click " + this.ui.namespaceAttrPageOk] = function(e) {
                    var that = this,
                        modal = that.$el;
                    if (e.target.dataset.action == "attributeEdit" || e.target.dataset.action == "addAttribute") {
                        // var selectedNamespace = that.nameSpaceCollection.fullCollection.findWhere({ guid: that.guid });
                        that.onUpdateAttr();
                    } else {
                        if (that.$el.find('.form-control.namespace-name')[0].value === "") {
                            $(that.$el.find('.form-control.namespace-name')[0]).css("borderColor", "red");
                            Utils.notifyInfo({
                                content: "Namespace name is empty."
                            });

                        } else {
                            that.onCreateNameSpace();
                        }
                    }

                };
                events["click " + this.ui.namespaceAttrPageCancle] = function(e) {
                    this.options.onUpdateNamespace();
                };
                return events;
            },
            /**
             * intialize a new CreateNameSpaceLayoutView Layout
             * @constructs
             */
            initialize: function(options) {
                _.extend(this, _.pick(options, 'tagCollection', 'enumDefCollection', 'model', 'tag', 'descriptionData', 'selectedTag', 'isNewNameSpace', 'isAttrEdit', 'entityDefCollection', 'typeHeaders', 'attrDetails'));
                this.fromTable = this.isNewNameSpace ? true : false;
                this.isEditAttr = this.isAttrEdit ? false : true;
                if (this.model) {
                    this.description = this.model.get('description');
                } else {
                    this.create = true;
                }
                if (!this.isNewNameSpace) {
                    this.collection = this.isAttrEdit ? new Backbone.Collection([{
                        "name": this.attrDetails.name,
                        "typeName": this.attrDetails.attrTypeName,
                        "isOptional": true,
                        "cardinality": "SINGLE",
                        "valuesMinCount": 0,
                        "valuesMaxCount": 1,
                        "isUnique": false,
                        "isIndexable": false
                    }]) : new Backbone.Collection([{
                        "name": "",
                        "typeName": "string",
                        "isOptional": true,
                        "cardinality": "SINGLE",
                        "valuesMinCount": 0,
                        "valuesMaxCount": 1,
                        "isUnique": false,
                        "isIndexable": false
                    }]);
                } else {
                    this.collection = new Backbone.Collection();
                }

            },
            bindEvents: function() {},
            onRender: function() {
                var that = this;
                this.$('.fontLoader').show();
                if (this.create) {
                    this.tagCollectionList();
                } else {
                    this.ui.title.html('<span>' + _.escape(this.tag) + '</span>');
                }
                if (!('placeholder' in HTMLInputElement.prototype)) {
                    this.ui.createTagForm.find('input,textarea').placeholder();
                }
                if (this.isNewNameSpace == true) {
                    that.ui.namespaceAttrPageOk.text("Create");
                    that.ui.namespaceAttrPageOk.attr('data-action', 'newNamespace');
                } else {
                    that.ui.namespaceAttrPageOk.text("Save");
                    that.ui.namespaceAttrPageOk.attr('data-action', 'attributeEdit');
                }
                this.hideLoader();
            },
            tagCollectionList: function() {
                var that = this,
                    str = '';
                this.tagCollection.fullCollection.each(function(val) {
                    var name = Utils.getName(val.toJSON());
                    str += '<option ' + (name == that.selectedTag ? 'selected' : '') + '>' + (name) + '</option>';
                });
            },
            hideLoader: function() {
                this.$('.fontLoader').hide();
                this.$('.hide').removeClass('hide');
            },
            collectionAttribute: function() {
                this.collection.add(new Backbone.Model({
                    "name": "",
                    "typeName": "string",
                    "isOptional": true,
                    "cardinality": "SINGLE",
                    "valuesMinCount": 0,
                    "valuesMaxCount": 1,
                    "isUnique": false,
                    "isIndexable": false
                }));
            },
            onClickAddAttriBtn: function() {
                this.collectionAttribute();
                if (!('placeholder' in HTMLInputElement.prototype)) {
                    this.ui.addAttributeDiv.find('input,textarea').placeholder();
                }

            },
            loaderStatus: function(isActive) {
                var that = this;
                if (isActive) {
                    parent.$('.namespace-attr-tableOverlay').show();
                    parent.$('.namespace-attr-fontLoader').show();
                } else {
                    parent.$('.namespace-attr-tableOverlay').hide();
                    parent.$('.namespace-attr-fontLoader').hide();
                }
            },
            validateValues: function() {
                var attrNameValidate = true,
                    enumValue = true,
                    stringValidate = true,
                    enumType = true;

                this.ui;
                if (this.$el.find(".attributeInput").length > 0) {
                    this.$el.find(".attributeInput").each(function() {
                        if ($(this).val() === "") {
                            $(this).css("borderColor", "red");
                            attrNameValidate = false;
                        }
                    });
                }
                if (this.$el.find(".enumvalue-container").length > 0 && this.$el.find(".enumvalue-container")[0].style.display != 'none') {
                    this.$el.find(".enumvalue-container").each(function(index) {
                        if (this.style.display != 'none') {
                            if ($(this).find(".enumValueSelector").length > 0) {
                                $(this).find(".enumValueSelector").each(function(index) {
                                    if ($(this).val().length === 0) {
                                        $(this).css("borderColor", "red");
                                        enumValue = false;
                                    }
                                });
                            }
                        }
                    })
                }
                if (this.$el.find(".enumtype-container").length > 0 && this.$el.find(".enumtype-container")[0].style.display != 'none') {
                    this.$el.find(".enumtype-container").each(function(index) {
                        if (this.style.display != 'none') {
                            if ($(this).find(".enumTypeSelector").length > 0) {
                                $(this).find(".enumTypeSelector").each(function(index) {
                                    if ($(this).val() == null || $(this).val() == '' || $(this).val().length === 0) {
                                        $(this).css("borderColor", "red");
                                        enumType = false;
                                    }
                                });
                            }
                        }
                    })
                }
                if (this.$el.find(".stringlength-container").length > 0 && this.$el.find(".stringlength-container")[0].style.display != 'none') {
                    this.$el.find(".stringlength-container").each(function(index) {
                        if (this.style.display != 'none') {
                            if ($(this).find(".stringLengthVal").length > 0) {
                                $(this).find(".stringLengthVal").each(function(index) {
                                    if ($(this).val().length === 0) {
                                        $(this).css("borderColor", "red");
                                        stringValidate = false;
                                    }
                                });
                            }
                        };
                    })
                }

                this.$el.find(".attributeInput").keyup(function() {
                    $(this).css("borderColor", "#e8e9ee");
                });
                if (!attrNameValidate) {
                    Utils.notifyInfo({
                        content: "Please fill the attributes details"
                    });
                    return true;
                }
                if (!enumType) {
                    Utils.notifyInfo({
                        content: "Please enter the Enumeration Name or select another type"
                    });
                    return true;
                }
                if (!enumValue) {
                    Utils.notifyInfo({
                        content: "Please enter the Enum values or select another type"
                    });
                    return true;
                }
                if (!stringValidate) {
                    Utils.notifyInfo({
                        content: "Please enter the Max Length for string or select another type"
                    });
                    return true;
                }
            },
            namespaceAttributes: function(modelEl, obj, elementValues) {
                obj.options = {
                    "applicableEntityTypes": JSON.stringify(modelEl.find(".entityTypeSelector").val()),
                    "maxStrLength": modelEl.find(".stringLengthVal").val() ? modelEl.find(".stringLengthVal").val() : "0"
                };

                if (obj.typeName != "string" && obj.typeName != "boolean" && obj.typeName != "byte" && obj.typeName != "short" && obj.typeName != "int" && obj.typeName != "float" && obj.typeName != "double" && obj.typeName != "long" && obj.typeName != "date") {
                    var enumName = enumDefCollection.fullCollection.findWhere({ name: obj.typeName });
                    if (enumName) {
                        var enumDef = enumName.get('elementDefs');
                        if (enumDef.length === obj.enumValues.length) {
                            _.each(enumDef, function(enumVal, index) {
                                if (obj.enumValues.indexOf(enumVal.value) === -1) {
                                    this.isPutCall = true;
                                };
                            })
                        } else {
                            this.isPutCall = true;
                        }
                    } else {
                        this.isPostCallEnum = true;
                    }

                    _.each(obj.enumValues, function(inputEnumVal, index) {
                        elementValues.push({
                            "ordinal": index + 1,
                            "value": inputEnumVal
                        })
                    });
                }
                if (obj.multiValueSelect) {
                    obj.multiValued = true;
                    obj.typeName = "array<" + obj.typeName + ">";
                }
            },
            highlightAttrinuteName: function(modelEl, obj) {
                Utils.notifyInfo({
                    content: "Attribute " + obj.name + " already exist"
                });
                modelEl.find(".attributeInput").css("borderColor", "red");
                this.loaderStatus(false);
            },
            createEnumObject: function(arrayObj, obj, enumVal) {
                return arrayObj.push({
                    "name": obj.typeName,
                    "elementDefs": enumVal
                });
            },
            onCreateNameSpace: function() {
                var that = this,
                    validate = true,
                    attrNameValidate = true,
                    enumValue = true,
                    stringValidate = true,
                    enumDefs = [],
                    putEnumDef = [],
                    attrNames = [],
                    isvalidName = true;
                this.checkLoader = 0;
                this.isPutCall = false;
                this.isPostCallEnum = false;

                if (this.validateValues()) {
                    return;
                };
                this.loaderStatus(true);
                var name = this.ui.tagName.val(),
                    description = _.escape(this.ui.description.val());
                var attributeObj = this.collection.toJSON();
                if (this.collection.length === 1 && this.collection.first().get("name") === "") {
                    attributeObj = [];
                }
                if (attributeObj.length) {
                    _.each(attributeObj, function(obj) {
                        var modelEl = this.$('#' + obj.modalID);
                        modelEl.find(".attributeInput").css("borderColor", "transparent");;
                        if (attrNames.indexOf(obj.name) > -1) {
                            that.highlightAttrinuteName(modelEl, obj);
                            isvalidName = false;
                            return true;
                        } else {
                            attrNames.push(obj.name);
                        }
                        var elementValues = [];
                        that.namespaceAttributes(modelEl, obj, elementValues);
                        if (that.isPostCallEnum) {
                            that.createEnumObject(enumDefs, obj, elementValues);
                        }
                        if (that.isPutCall) {
                            that.createEnumObject(putEnumDef, obj, elementValues);
                        }
                    });
                    var notifyObj = {
                        modal: true,
                        confirm: {
                            confirm: true,
                            buttons: [{
                                    text: "Ok",
                                    addClass: "btn-atlas btn-md",
                                    click: function(notice) {
                                        notice.remove();
                                    }
                                },
                                null
                            ]
                        }
                    };
                }
                if (isvalidName) {
                    this.json = {
                        "enumDefs": enumDefs,
                        "structDefs": [],
                        "classificationDefs": [],
                        "entityDefs": [],
                        "namespaceDefs": [{
                            "category": "NAMESPACE",
                            "createdBy": "admin",
                            "updatedBy": "admin",
                            "version": 1,
                            "typeVersion": "1.1",
                            "name": name.trim(),
                            "description": description.trim(),
                            "attributeDefs": attributeObj
                        }]
                    };
                    var apiObj = {
                        sort: false,
                        success: function(model, response) {
                            var nameSpaveDef = model.namespaceDefs;
                            if (nameSpaveDef) {
                                that.options.nameSpaceCollection.fullCollection.add(nameSpaveDef);
                                Utils.notifySuccess({
                                    content: "Namespace " + name + Messages.getAbbreviationMsg(false, 'addSuccessMessage')
                                });
                            }
                            that.checkLoader--;
                            if (that.checkLoader == 0) {
                                that.options.onUpdateNamespace();
                            }
                        },
                        silent: true,
                        reset: true,
                        complete: function(model, status) {
                            attrNames = [];
                            that.loaderStatus(false);
                        }
                    }
                    that.checkLoader++;
                    $.extend(apiObj, { contentType: 'application/json', dataType: 'json', data: JSON.stringify(that.json) })
                    this.options.nameSpaceCollection.constructor.nonCrudOperation.call(this, UrlLinks.nameSpaceApiUrl(), "POST", apiObj);
                    if (that.isPutCall) {
                        var putData = {
                            "enumDefs": putEnumDef
                        };
                        that.checkLoader++;
                        $.extend(apiObj, { contentType: 'application/json', dataType: 'json', data: JSON.stringify(putData) })
                        this.options.nameSpaceCollection.constructor.nonCrudOperation.call(this, UrlLinks.typedefsUrl().defs, "PUT", apiObj);
                    }
                } else {
                    attrNames = [];
                }

            },
            onUpdateAttr: function() {
                var that = this,
                    attrNameValidate = true,
                    enumValue = true,
                    stringValidate = true,
                    enumDefs = [],
                    postEnumDef = [],
                    selectedNamespace = $.extend(true, {}, that.options.selectedNamespace.toJSON()),
                    attributeDefs = selectedNamespace['attributeDefs'],
                    isvalidName = true;
                this.checkLoader = 0;
                this.isPutCall = false;
                this.isPostCallEnum = false;
                if (this.validateValues()) {
                    return;
                };
                if (this.$el.find(".namespace-attr").length > 0 && this.collection.length > 0) {
                    this.loaderStatus(true);
                    if (this.collection.length > 0) {
                        this.collection.each(function(model) {
                            var obj = model.toJSON(),
                                modelEl = this.$('#' + obj.modalID);
                            modelEl.find(".attributeInput").css("borderColor", "transparent");
                            if (that.options.isNewAttr == true && _.find(attributeDefs, { name: obj.name })) {
                                that.highlightAttrinuteName(modelEl, obj);
                                isvalidName = false;
                                return true;
                            }
                            var elementValues = [];
                            that.namespaceAttributes(modelEl, obj, elementValues);
                            if (that.isPostCallEnum) {
                                that.createEnumObject(postEnumDef, obj, elementValues);
                            } else if (that.isPutCall) {
                                that.createEnumObject(enumDefs, obj, elementValues);
                            }

                            if (that.options.isNewAttr == true) {
                                selectedNamespace.attributeDefs.push(obj);
                            } else {
                                var attrDef = selectedNamespace.attributeDefs;
                                _.each(attrDef, function(attrObj) {
                                    if (attrObj.name === that.$el.find(".attributeInput")[0].value) {
                                        attrObj.name = obj.name;
                                        attrObj.typeName = obj.typeName;
                                        attrObj.multiValued = obj.multiValueSelect || false;
                                        attrObj.options.applicableEntityTypes = obj.options.applicableEntityTypes;
                                        attrObj.enumValues = obj.enumValues;
                                        attrObj.options.maxStrLength = obj.options.maxStrLength;
                                    }
                                });
                            }
                        });
                        if (isvalidName) {
                            var notifyObj = {
                                modal: true,
                                confirm: {
                                    confirm: true,
                                    buttons: [{
                                            text: "Ok",
                                            addClass: "btn-atlas btn-md",
                                            click: function(notice) {
                                                notice.remove();
                                            }
                                        },
                                        null
                                    ]
                                }
                            };

                            var putNameSpace = function() {
                                that.checkLoader++;
                                $.extend(apiObj, { contentType: 'application/json', dataType: 'json', data: JSON.stringify(that.json) })
                                that.options.nameSpaceCollection.constructor.nonCrudOperation.call(that, UrlLinks.nameSpaceUpdateUrl(), "PUT", apiObj);
                            }
                            this.json = {
                                "enumDefs": enumDefs,
                                "structDefs": [],
                                "classificationDefs": [],
                                "entityDefs": [],
                                "namespaceDefs": that.options.isNewAttr ? [selectedNamespace] : [selectedNamespace]
                            };
                            var apiObj = {
                                sort: false,
                                success: function(model, response) {
                                    if (model.namespaceDefs.length === 0 && model.enumDefs.length) {
                                        putNameSpace();
                                    } else {
                                        var selectedNameSpace = that.options.nameSpaceCollection.fullCollection.findWhere({ guid: that.options.guid });
                                        Utils.notifySuccess({
                                            content: "One or more Namespace attribute" + Messages.getAbbreviationMsg(false, 'editSuccessMessage')
                                        });
                                        if (model.namespaceDefs && model.namespaceDefs.length) {
                                            that.options.selectedNamespace.set(model.namespaceDefs[0]);
                                        }
                                        that.options.onEditCallback();
                                    }
                                    that.checkLoader--;
                                    if (that.checkLoader == 0) {
                                        that.options.onUpdateNamespace();
                                    }
                                },
                                silent: true,
                                reset: true,
                                complete: function(model, status) {
                                    that.loaderStatus(false);
                                }
                            }
                            if (that.isPostCallEnum) {
                                var postData = {
                                    "enumDefs": postEnumDef
                                };
                                this.checkLoader++;
                                $.extend(apiObj, { contentType: 'application/json', dataType: 'json', data: JSON.stringify(postData) })
                                this.options.nameSpaceCollection.constructor.nonCrudOperation.call(this, UrlLinks.typedefsUrl().defs, "POST", apiObj);
                            } else {
                                putNameSpace();
                            }
                        }
                    }
                } else {
                    Utils.notifySuccess({
                        content: "No attribute updated"
                    });
                    this.loaderStatus(false);
                    that.options.onUpdateNamespace();
                }
            }
        });
    return CreateNameSpaceLayoutView;
});