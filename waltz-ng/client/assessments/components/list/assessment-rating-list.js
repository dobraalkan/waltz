/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019 Waltz open source project
 * See README.md for more information
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific
 *
 */

import {initialiseData} from "../../../common";
import _ from "lodash";
import template from "./assessment-rating-list.html";
import {favouriteAssessmentDefinitionIdsKey} from "../../../user";
import {CORE_API} from "../../../common/services/core-api-utils";
import {displayError} from "../../../common/error-utils";


const bindings = {
    assessments: "<",
    parentEntityRef: "<",
    onSelect: "<",
};


const initialState = {
    assessmentsList: [],
    assessmentsNotProvided: [],
    expandNotProvided: false
};


function getFavouriteAssessmentDefnIds(key, preferences, defaultList = []) {
    const favouritesString = _.find(preferences, d => d.key === key, null);
    return _.isNull(favouritesString) || _.isEmpty(favouritesString)
        ? defaultList
        : _
            .chain(favouritesString.value)
            .split(',')
            .map(idString => _.toNumber(idString))
            .value();
}

function controller(serviceBroker, notification) {
    const vm = initialiseData(this, initialState);

    function isFavourite(id) {
        return _.includes(vm.favouriteAssessmentDefnIds, id);
    }

    const partitionAssessments = () => {
        if (vm.assessments) {

            const valuePartitioned = _
                .chain(vm.assessments)
                .map(a => Object.assign({}, a, { isFavourite: isFavourite(a.definition.id)}))
                .partition(assessment => _.isNil(assessment.rating) && !vm.expandNotProvided)
                .value();

            vm.assessmentsNotProvided = _.sortBy(valuePartitioned[0], d => d.definition.name);
            vm.assessmentsList = _.sortBy(valuePartitioned[1], d => d.definition.name);
        }
    };

    vm.$onChanges = () => {

        vm.defaultPrimaryList = _
            .chain(vm.assessments)
            .filter(a => a.definition.visibility === "PRIMARY")
            .map(r => r.definition.id)
            .value();

        vm.favouritesKey = favouriteAssessmentDefinitionIdsKey + _.camelCase(vm.parentEntityRef.kind);

        serviceBroker
            .loadAppData(CORE_API.UserPreferenceStore.findAllForUser,[],  {force: true})
            .then(r => vm.favouriteAssessmentDefnIds = getFavouriteAssessmentDefnIds(vm.favouritesKey, r.data, vm.defaultPrimaryList))
            .then(() => partitionAssessments());
    };

    vm.toggleFavourite = (assessmentRatingId) => {

        const alreadyFavourite = isFavourite(assessmentRatingId);

        const newFavouritesList = (alreadyFavourite)
            ? _.without(vm.favouriteAssessmentDefnIds, assessmentRatingId)
            : _.concat(vm.favouriteAssessmentDefnIds, assessmentRatingId);

        const message = (alreadyFavourite)? "Removed from favourite assessments" : "Added to favourite assessments";

        serviceBroker
            .execute(CORE_API.UserPreferenceStore.saveForUser,
                [{key: vm.favouritesKey, value: newFavouritesList.toString()}])
            .then(r => vm.favouriteAssessmentDefnIds = getFavouriteAssessmentDefnIds(vm.favouritesKey, r.data, vm.defaultPrimaryList))
            .then(() => partitionAssessments())
            .then(() => notification.info(message))
            .catch(e => displayError(notification, "Could not modify favourite assessment list", e))
    };

    vm.toggleExpandNotProvided = () => {
        vm.expandNotProvided = !vm.expandNotProvided;
        partitionAssessments();
    }
}


controller.$inject = [
    "ServiceBroker",
    "Notification"
];


const component = {
    template,
    bindings,
    controller
};


export default {
    component,
    id: "waltzAssessmentRatingList"
};
